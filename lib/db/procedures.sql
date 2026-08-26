-- ============================================================
-- process_point_transaction
-- Neon 콘솔 SQL 에디터에서 직접 실행하세요.
-- ============================================================

CREATE OR REPLACE FUNCTION process_point_transaction(
  p_user_id     UUID,
  p_amount      BIGINT,
  p_reason      point_reason,
  p_description TEXT,
  p_staff_id    UUID
) RETURNS JSONB AS $$
DECLARE
  v_current_points BIGINT;
  v_new_points     BIGINT;
  v_tx_id          UUID;
BEGIN
  -- 대상 사용자 행(Row) 락 획득 — 동시 요청 직렬화
  SELECT total_points INTO v_current_points
  FROM public.profiles
  WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다. (id: %)', p_user_id;
  END IF;

  -- Staff/Admin 권한 확인
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_staff_id AND role IN ('staff', 'super_admin')
  ) THEN
    RAISE EXCEPTION '포인트 처리 권한이 없습니다. (staff_id: %)', p_staff_id;
  END IF;

  v_new_points := v_current_points + p_amount;

  IF v_new_points < 0 THEN
    RAISE EXCEPTION '포인트 잔액이 부족합니다. (현재: %, 요청: %)', v_current_points, p_amount;
  END IF;

  -- 1. 프로필 잔액 업데이트
  UPDATE public.profiles
  SET total_points = v_new_points,
      updated_at   = now()
  WHERE id = p_user_id;

  -- 2. 원장 기록 삽입 (불변)
  INSERT INTO public.point_transactions (
    user_id, amount, balance_after, reason, description, processed_by
  ) VALUES (
    p_user_id, p_amount, v_new_points, p_reason, p_description, p_staff_id
  ) RETURNING id INTO v_tx_id;

  -- 3. 감사 로그 기록
  INSERT INTO public.admin_audit_logs (admin_id, target_user_id, action, payload)
  VALUES (
    p_staff_id,
    p_user_id,
    'POINT_TRANSACTION',
    jsonb_build_object(
      'amount', p_amount,
      'reason', p_reason,
      'balance_before', v_current_points,
      'balance_after', v_new_points,
      'transaction_id', v_tx_id
    )
  );

  RETURN jsonb_build_object(
    'success',        true,
    'transaction_id', v_tx_id,
    'balance_after',  v_new_points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
