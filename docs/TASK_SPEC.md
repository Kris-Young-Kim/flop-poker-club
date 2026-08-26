Claude Code 및 **Antigravity(AI 코딩 에이전트)**가 오작동이나 누락 없이 한 번에 완벽한 풀스택 프로젝트를 빌드할 수 있도록 작성된 **기술 사양서 및 작업 명세서(TASK_SPEC.md)**입니다.
이 내용을 프로젝트 루트 디렉터리에 TASK_SPEC.md 파일로 저장한 후, 에이전트에게 명령을 내리면 됩니다.
code
Markdown
# [TASK SPEC] FLOP POKER CLUB — 멤버십 & 매장 운영 웹앱

## 1. 프로젝트 개요 (Project Overview)
- **서비스명**: FLOP POKER CLUB (원주점)
- **서비스 성격**: 모바일 퍼스트 반응형 웹 애플리케이션 (PWA 호환)
- **핵심 목표**: 
  - 구글 간편 인증 기반 회원 관리 및 고유 QR 발급
  - 매장 직원용 카메라 QR 스캐너를 통한 초고속 회원 조회 및 포인트 지급/차감
  - 원장(Ledger) 기반의 무결성 보장 포인트 시스템 구축
  - 토너먼트 대회 일정/접수 및 공지사항/이벤트 운영
- **핵심 제약 사항 (Strict Constraints)**:
  - ⚠️ **바인권(Buy-in Ticket)은 매장에서 종이로만 유통/관리하므로, 웹앱 내에 바인권 구매/수량/차감 기능을 절대 구현하지 않는다.**
  - ⚠️ **포인트는 유저 간 송금, 현금 충전, 현금 환급이 불가능하며, 오직 인증된 Staff/Admin의 트랜잭션을 통해서만 변동된다.**

---

## 2. 기술 스택 (Tech Stack)
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Icons & QR**: Lucide React, `qrcode.react` (생성), `html5-qrcode` (스캔)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row Level Security, Storage)
- **State Management**: React Query (TanStack Query) / Zustand, Server Actions
- **Styling Tokens (Luxury Casino Black & Gold)**:
  - Backgrounds: `#0B0B0F` (Matte Black), `#13141C` (Charcoal Surface)
  - Primary Accent: Gold Gradient (`linear-gradient(135deg, #F5D061 0%, #E6AF2E 50%, #C28B1E 100%)`)
  - Border/Glow: `rgba(230, 175, 46, 0.25)`, `rgba(245, 208, 97, 0.15)`
  - Text: `#FFFFFF` (Heading), `#F3E5AB` (Champagne Gold Subtext), `#9CA3AF` (Muted)

---

## 3. 데이터베이스 스키마 및 RLS 설계 (PostgreSQL DDL)

### 3.1 ENUM 정의
```sql
CREATE TYPE user_role AS ENUM ('user', 'staff', 'super_admin');
CREATE TYPE user_tier AS ENUM ('NORMAL', 'VIP', 'VVIP', 'ROYAL');
CREATE TYPE point_reason AS ENUM (
  'FOUR_OF_A_KIND',       -- 투핸드 포카드 승리 (+500P 등)
  'STRAIGHT_FLUSH',       -- 스티플 승리 (+1,000P 등)
  'ROYAL_FLUSH',          -- 로티플 승리 (+3,000P 등)
  'TOURNAMENT_WIN',       -- 토너먼트 우승/입상
  'TOURNAMENT_BUYIN',     -- 토너먼트 참가 포인트 차감 (-)
  'EVENT_BONUS',          -- 현금 10장 구매 이벤트 / 신규가입 보너스
  'ADMIN_ADJUSTMENT',     -- 관리자 수동 지급/차감
  'POINT_SHOP_USAGE'      -- 매장 내 포인트 사용 (-)
);
CREATE TYPE tourney_status AS ENUM ('UPCOMING', 'REGISTRATION', 'LIVE', 'COMPLETED', 'CANCELLED');
3.2 테이블 구조
code
SQL
-- 1. 프로필 (회원)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  nickname TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  tier user_tier DEFAULT 'NORMAL' NOT NULL,
  qr_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  total_points BIGINT DEFAULT 0 NOT NULL CHECK (total_points >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. 포인트 원장 (불변 거래 기록)
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL, -- 양수(+)면 적립, 음수(-)면 차감
  balance_after BIGINT NOT NULL,
  reason point_reason NOT NULL,
  description TEXT,
  processed_by UUID REFERENCES public.profiles(id) NOT NULL, -- 처리한 관리자/스태프 ID
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. 토너먼트 대회
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  entry_point_cost BIGINT DEFAULT 0 NOT NULL,
  total_prize_points BIGINT DEFAULT 0 NOT NULL,
  max_players INT DEFAULT 30,
  status tourney_status DEFAULT 'UPCOMING' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. 토너먼트 참가 및 결과
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  final_rank INT,
  prize_points_awarded BIGINT DEFAULT 0,
  registered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(tournament_id, user_id)
);

-- 5. 공지사항 & 이벤트
CREATE TABLE public.notices_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT CHECK (category IN ('NOTICE', 'EVENT', 'RULE')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. 관리자 감사 로그
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  target_user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
3.3 포인트 안전 트랜잭션 함수 (Stored Procedure)
code
SQL
CREATE OR REPLACE FUNCTION process_point_transaction(
  p_user_id UUID,
  p_amount BIGINT,
  p_reason point_reason,
  p_description TEXT,
  p_staff_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_current_points BIGINT;
  v_new_points BIGINT;
  v_tx_id UUID;
BEGIN
  -- 대상 사용자 락(Lock) 획득
  SELECT total_points INTO v_current_points
  FROM public.profiles
  WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '사용자를 찾을 수 없습니다.';
  END IF;

  v_new_points := v_current_points + p_amount;

  IF v_new_points < 0 THEN
    RAISE EXCEPTION '포인트 잔액이 부족합니다. (현재: %, 요청: %)', v_current_points, p_amount;
  END IF;

  -- 1. 프로필 잔액 업데이트
  UPDATE public.profiles
  SET total_points = v_new_points, updated_at = now()
  WHERE id = p_user_id;

  -- 2. 원장 기록 삽입
  INSERT INTO public.point_transactions (
    user_id, amount, balance_after, reason, description, processed_by
  ) VALUES (
    p_user_id, p_amount, v_new_points, p_reason, p_description, p_staff_id
  ) RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_tx_id,
    'balance_after', v_new_points
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
4. 디렉터리 및 아키텍처 구조 (Next.js App Router)
code
Text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx             # Google OAuth 로그인 및 약관
│   │   └── onboarding/page.tsx        # 이름/닉네임/전화번호 필수 입력 폼
│   ├── (user)/
│   │   ├── layout.tsx                 # 모바일 네비게이션 헤더 & 탭바
│   │   ├── page.tsx                   # 메인 대시보드 (VIP 카드 + QR 보기 버튼 + 공지 배너)
│   │   ├── ledger/page.tsx            # 포인트 상세 원장 (적립/차감 히스토리)
│   │   ├── tournaments/page.tsx       # 대회 목록 및 참가 신청 내역
│   │   └── notices/page.tsx           # 이벤트 / 룰북 / 공지사항 상세
│   ├── admin/                         # Staff / Super Admin 전용
│   │   ├── layout.tsx                 # 관리자 네비게이션 & 접근 권한 Guard
│   │   ├── page.tsx                   # 관리자 대시보드 (통계, 최근 트랜잭션)
│   │   ├── scanner/page.tsx           # 직원용 초고속 QR 스캐너 + 포인트 즉시 지급 모달
│   │   ├── members/page.tsx           # 회원 검색 및 포인트 수동 조정
│   │   ├── tournaments/page.tsx       # 토너먼트 생성, 블라인드, 결과/상금 확정
│   │   └── notices/page.tsx           # 공지 / 이벤트 배너 등록
│   └── api/                           # Supabase Auth Callback 및 웹훅
├── components/
│   ├── ui/                            # Shadcn UI (Button, Card, Dialog, Sheet, Badge, Tabs 등)
│   ├── cards/                         # GoldVIPCard, TournamentCard, NoticeCard
│   ├── qr/
│   │   ├── MemberQRModal.tsx          # 회원용 고대비 동적 QR 팝업
│   │   └── StaffQRScanner.tsx         # 카메라 기반 QR 스캐너 (html5-qrcode 연동)
│   └── forms/
│       └── PointActionDrawer.tsx      # 포카드/스티플/로티플 원터치 지급 버튼 Drawer
├── lib/
│   ├── supabase/                      # client.ts, server.ts, middleware.ts
│   └── utils/                         # formatPoints, formatPhone, formatDateTime
└── types/                             # database.types.ts
5. 단계별 실행 지침 (Claude Code / Antigravity Execution Plan)
[PHASE 1] 환경 세팅 & 인프라 (Setup & Database)
Next.js 14 App Router 프로젝트 초기화, Tailwind CSS 및 Shadcn UI 설정.
supabase/migrations/001_initial_schema.sql에 위 DDL과 RLS 정책, Stored Procedure 작성.
Supabase Auth (Google OAuth) 설정 및 세션 미들웨어(middleware.ts) 보호 라우트 구현 (/admin은 staff 이상만 접근).
[PHASE 2] 회원 경험 및 UI 구축 (User Flow)
럭셔리 카지노 테마 UI 컴포넌트 구현:
GoldVIPCard: 골드 메탈릭 광택, 회원 등급, 보유 포인트(24,500 P), [내 QR 코드] 원터치 버튼.
MemberQRModal: 회원의 qr_token을 고대비 QR 코드로 렌더링.
포인트 원장 뷰 (/ledger):
전체/적립/차감 필터, 트랜잭션 사유별 배지(포카드, 스티플, 로티플, 우승 등) 렌더링.
대회 및 공지 뷰:
대회 카드(참가비 P, 상금 풀 P, 시작 시간), 공지사항 뷰어.
[PHASE 3] 직원/관리자용 QR 스캐너 및 포인트 시스템 (Staff Flow)
StaffQRScanner 컴포넌트: 모바일 기기 후면 카메라로 회원 QR 스캔 시 1초 내 대상 회원 프로필 로드.
원터치 포인트 지급/차감 Sheet 구현:
[투핸드 포카드 +500P], [스티플 +1,000P], [로티플 +3,000P], [10장 현금 보너스], [수동 입력] 버튼 배치.
클릭 시 process_point_transaction RPC를 실행하여 DB 원장 무결성 보장.
오프라인 대비 에러 처리 및 중복 요청 방지 (Debounce / Idempotency).
[PHASE 4] 관리자 기능 & 토너먼트 매니저 (Admin Management)
토너먼트 생성, 참가자 접수/취소, 최종 순위 입력 시 포인트 자동 분배 기능.
관리자 감사 로그(admin_audit_logs) 자동 기록.
code
Code
---

### 💡 에이전트 실행 명령어 가이드

**Claude Code CLI에서 실행할 때:**
```bash
claude "TASK_SPEC.md 명세서를 읽고, PHASE 1부터 순서대로 실행해줘. Next.js App Router와 Supabase 스키마 마이그레이션부터 작성해."
Antigravity / Cursor / Windsurf에서 실행할 때:
Composer 또는 Agent 채팅창에 @TASK_SPEC.md를 멘션하고 다음과 같이 입력하세요:
"이 명세서의 규칙과 UI 스타일(블랙&골드), 데이터베이스 스키마, 포인트 원장 RPC를 준수하여 구현을 시작해줘."
User PM 8:29
둘 역할 분배 잘 되도록 역할 분배 추천해줘
Model PM 8:29
ThinkingThoughts
Expand to view model thoughts

chevron_right
**Claude Code(터미널 기반 엔지니어링 에이전트)**와 **Antigravity(GUI 기반 풀스택 에이전트/IDE)**는 강점이 뚜렷하게 나뉩니다.
두 도구를 섞어서 쓸 때 가장 효율적인 방식은 Claude Code를 '시스템 아키텍트 & 백엔드 엔지니어', **Antigravity를 'UI/UX 디자이너 & 프론트엔드 빌더'**로 역할을 분담하는 것입니다.
🏛️ 1. 한눈에 보는 역할 분담 요약
구분	💻 Claude Code (CLI / 시스템 코어)	🎨 Antigravity (Visual / 프론트엔드)
주요 역할	백엔드, DB, 보안 로직, 빌드/테스트	UI/UX 디자인, 컴포넌트 조립, 인터랙션
담당 영역	• 프로젝트 초기 환경 세팅 (package.json, 환경변수)<br>• Supabase SQL 마이그레이션 & RPC 함수<br>• 포인트 트랜잭션 무결성 검증 로직<br>• TypeScript 타입 정의 & 빌드 에러(tsc) 해결<br>• Git 커밋 및 파일 구조 리팩토링	• 블랙&골드 카지노 테마 디자인 적용<br>• Shadcn UI 컴포넌트 배치 및 화면 레이아웃<br>• 회원 VIP 카드 광택 효과 & 애니메이션<br>• 모바일 반응형 화면비 조율 (390px 핏)<br>• 카메라 QR 스캐너 화면 및 팝업 UI
🔄 2. 5단계 최적 협업 워크플로우
code
Code
[1단계: Claude Code] ──▶ [2단계: Antigravity] ──▶ [3단계: Claude Code] ──▶ [4단계: Antigravity] ──▶ [5단계: Claude Code]
프로젝트 생성/DB세팅       UI 컴포넌트/디자인       비즈니스 로직/RPC 연동     QR스캔/UX 인터랙션        빌드 검증 & 배포 준비
1단계 (Claude Code) : 인프라 & 데이터베이스 뼈대 구축
작업: Next.js 14 초기화, 패키지 설치(supabase, lucide-react, html5-qrcode 등), Supabase SQL 마이그레이션 파일 및 RLS, RPC 함수 작성.
명령 예시:
code
Bash
claude "TASK_SPEC.md의 2장과 3장을 기반으로 Next.js 14 App Router 프로젝트를 초기화하고, Supabase 마이그레이션 SQL과 TypeScript DB 타입을 생성해줘."
2단계 (Antigravity) : 블랙&골드 UI 화면 제작
작업: 1단계에서 잡힌 디렉터리 위에 카지노 무드의 UI 컴포넌트(VIP 회원카드, 네비게이션 탭바, 대회 목록 카드 등) 시각적 구현.
명령 예시:
"TASK_SPEC.md의 디자인 토큰을 활용해서 GoldVIPCard, 메인 홈 대시보드(app/(user)/page.tsx), 포인트 내역 페이지의 반응형 UI를 작성해줘."
3단계 (Claude Code) : 포인트 원장 & 구글 인증 로직 결합
작업: UI 버튼과 실제 Supabase 백엔드 함수(process_point_transaction) 연결, 구글 OAuth 미들웨어 권한 검증(middleware.ts).
명령 예시:
code
Bash
claude "포인트 원장 페이지와 회원 프로필에 실제 Supabase Server Actions를 연결하고, 비인가 사용자의 /admin 접근을 차단하는 미들웨어를 구현해줘."
4단계 (Antigravity) : QR 스캐너 & 매장 운영 모달 폴리싱
작업: 직원용 QR 스캐너 화면(StaffQRScanner), 원터치 포인트 지급 드로어(PointActionDrawer)의 모바일 터치감 및 팝업 인터랙션 마무리.
명령 예시:
"직원용 QR 스캐너 화면에서 카메라 뷰파인더 디자인을 고급스럽게 다듬고, 스캔 성공 시 하단에서 올라오는 원터치 포인트 지급 Sheet를 연결해줘."
5단계 (Claude Code) : 최종 검증, 빌드 & 린트
작업: 전체 타입 체크(npx tsc --noEmit), 프로덕션 빌드 테스트(npm run build), 보안 점검.
명령 예시:
code
Bash
claude "전체 프로젝트의 TypeScript 에러와 빌드 에러를 검사하고, npm run build가 정상 완료되도록 수정해줘."
⚠️ 3. 두 도구를 함께 쓸 때 꼭 지켜야 할 원칙
동시 수정 피하기:
Claude Code가 터미널에서 큰 작업을 돌리고 있을 때 Antigravity에서 같은 파일을 열어 저장하면 코드 충돌(Conflict)이 납니다. "한 쪽 작업 완료 → Git 커밋 → 다른 쪽 도구에서 이어받기" 순서를 지켜주세요.
명세서 공유:
두 도구 모두 프로젝트 루트의 **TASK_SPEC.md**를 기준으로 삼게 하면, 서로 다른 코드를 짜거나 바인권 관련 불필요한 코드를 만드는 실수를 완전히 방지할 수 있습니다.