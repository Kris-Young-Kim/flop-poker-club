# FLOP POKER CLUB — 개발 TODO

> **핵심 변경 사항 (원본 TASK_SPEC.md 대비)**
> - DB: ~~Supabase~~ → **Neon (PostgreSQL)** + **Drizzle ORM**
> - Auth: ~~Supabase Auth~~ → **NextAuth.js v5 (Auth.js)** + Google OAuth
> - ~~Lovable~~ 사용 안 함
> - 빌드 체계: **Claude Code (백엔드/시스템)** + **Antigravity (UI/프론트)** 분담

---

## 루프 엔지니어링 원칙 적용

> 출처: [에이전트 개발 루프 엔지니어링](https://kyungseo.github.io/posts/agent-development-loop/)
>
> **"좋은 에이전트는 한 번에 많은 일을 하는 에이전트가 아니라,**
> **같은 일을 반복해도 결과를 확인할 수 있고 문제가 생겼을 때 멈출 수 있는 에이전트"**

### 세 가지 루프 역할 분담

| 루프 | 담당 | 역할 |
|------|------|------|
| **도구 호출 루프** | Claude Code / Antigravity | 코드 생성 → 검증 → 수정 반복 |
| **작업 실행 루프** | 개발 파이프라인 (5 Phase) | 각 Phase를 트리거 → 실행 → Eval → 승인 → 다음 Phase |
| **개선 루프** | 사람 (PM/개발자) | 실패 분석 → 프롬프트·명세·권한 수정 |

### 각 Phase 실행 구조 (프롬프트 밖의 구조)

```
[트리거] Phase 시작 명령
    ↓
[에이전트 실행] Claude Code / Antigravity 작업
    ↓
[자동 평가 Eval] 아래 성공 기준 체크리스트 통과?
    ↓ YES                    ↓ NO
[승인 게이트] 사람 확인    [중단 + 실패 기록]
    ↓
[상태 저장] PROGRESS.md에 완료 기록
    ↓
[다음 Phase 트리거]
```

### 자동화 준비도 체크리스트 (Phase 시작 전 확인)
- [ ] 이전 Phase의 Eval이 모두 통과했는가?
- [ ] 빌드 에러가 0건인가? (`pnpm build` 성공)
- [ ] 타입 에러가 0건인가? (`tsc --noEmit` 성공)
- [ ] 금지 항목(바인권/송금)이 코드에 포함되지 않았는가?
- [ ] 모든 실행 내용이 PROGRESS.md에 기록됐는가?

---

## ⚠️ 절대 구현 금지 항목 (프롬프트 금지가 아닌 권한 제한으로 강제)

> **"프롬프트의 금지는 지시, 권한 제한은 강제"**
> 아래 항목은 DB 스키마와 Server Action 레이어에서 코드로 차단한다.

- 바인권(Buy-in Ticket) 구매/수량/차감 — **DB 테이블 자체를 만들지 않음**
- 포인트 유저 간 송금 — **process_point_transaction RPC에 processed_by 검증 필수**
- 현금 충전 / 현금 환급 — **point_reason ENUM에 해당 값 없음**

---

## 역할 분담 & Phase별 트리거

| Phase | 트리거 | 담당 | 작업 요약 |
|-------|--------|------|-----------|
| 1 | `"PHASE 1 시작해줘"` | **Claude Code** | Neon 스키마, NextAuth, 미들웨어 |
| 2 | Phase 1 Eval 통과 후 | **Antigravity** | 블랙&골드 UI, 회원 화면 |
| 3 | Phase 2 Eval 통과 후 | **Claude Code** | Server Actions, RPC 연동 |
| 4 | Phase 3 Eval 통과 후 | **Antigravity** | QR 스캐너 UI, 포인트 Drawer |
| 5 | Phase 4 Eval 통과 후 | **Claude Code** | 빌드 검증, 배포 준비 |

---

## PHASE 1 — 환경 세팅 & 인프라 `[Claude Code]`

### 작업 목록

#### 1-1. 패키지 설치
- [ ] `pnpm add @neondatabase/serverless drizzle-orm next-auth@beta @auth/drizzle-adapter qrcode.react html5-qrcode framer-motion`
- [ ] `pnpm add -D drizzle-kit`

#### 1-2. Neon 데이터베이스 연결
- [ ] `.env.local` 환경변수 파일 생성
  ```
  DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
  NEXTAUTH_SECRET=...
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  NEXTAUTH_URL=http://localhost:3000
  ```
- [ ] `lib/db/index.ts` — Neon HTTP driver + Drizzle 클라이언트
- [ ] `drizzle.config.ts` — Drizzle Kit 설정

#### 1-3. Drizzle 스키마 (`lib/db/schema.ts`)
- [ ] ENUM: `user_role` (user/staff/super_admin)
- [ ] ENUM: `user_tier` (NORMAL/VIP/VVIP/ROYAL)
- [ ] ENUM: `point_reason` (FOUR_OF_A_KIND / STRAIGHT_FLUSH / ROYAL_FLUSH / TOURNAMENT_WIN / TOURNAMENT_BUYIN / EVENT_BONUS / ADMIN_ADJUSTMENT / POINT_SHOP_USAGE)
- [ ] ENUM: `tourney_status` (UPCOMING/REGISTRATION/LIVE/COMPLETED/CANCELLED)
- [ ] `profiles` 테이블 (NextAuth users 호환 + 게임 필드)
- [ ] `accounts` 테이블 (NextAuth OAuth 계정 연결)
- [ ] `point_transactions` 테이블 (원장, 불변)
- [ ] `tournaments` 테이블
- [ ] `tournament_participants` 테이블
- [ ] `notices_events` 테이블
- [ ] `admin_audit_logs` 테이블

#### 1-4. 마이그레이션 & Stored Procedure
- [ ] `pnpm drizzle-kit generate` — SQL 마이그레이션 파일 생성
- [ ] `pnpm drizzle-kit migrate` — Neon에 적용
- [ ] `process_point_transaction` Stored Procedure SQL 파일 생성 (`db/procedures.sql`)
  - `SELECT FOR UPDATE` 비관적 락으로 동시성 보장
  - 잔액 부족 시 RAISE EXCEPTION
  - Neon 콘솔에서 수동 실행 필요

#### 1-5. NextAuth.js v5 설정
- [ ] `auth.ts` — Google Provider + Drizzle Adapter 연결
- [ ] `app/api/auth/[...nextauth]/route.ts`

#### 1-6. 미들웨어 & 라우트 보호
- [ ] `middleware.ts`
  - `/admin/*` → staff/super_admin만 허용 (role 코드 레벨 강제)
  - 미인증 → `/login` 리다이렉트
  - 온보딩 미완료 → `/onboarding` 리다이렉트

#### 1-7. 유틸리티 & 타입
- [ ] `lib/utils/format.ts` — formatPoints, formatPhone, formatDateTime
- [ ] `types/database.types.ts` — Drizzle inferSelect/inferInsert 기반 타입

#### 1-8. 앱 디렉터리 기본 구조
- [ ] `app/layout.tsx` — 루트 레이아웃
- [ ] `app/globals.css` — 럭셔리 카지노 디자인 토큰 (CSS 변수)
  ```css
  --color-bg-matte: #0B0B0F;
  --color-bg-surface: #13141C;
  --color-gold-gradient: linear-gradient(135deg, #F5D061 0%, #E6AF2E 50%, #C28B1E 100%);
  --color-text-heading: #FFFFFF;
  --color-text-sub: #F3E5AB;
  --color-text-muted: #9CA3AF;
  ```
- [ ] `app/(auth)/login/page.tsx` — 빈 페이지 (PHASE 2 Antigravity 담당)
- [ ] `app/(auth)/onboarding/page.tsx` — 빈 페이지
- [ ] `app/(user)/layout.tsx` — 빈 레이아웃
- [ ] `app/(user)/page.tsx` — 빈 페이지
- [ ] `app/(user)/ledger/page.tsx` — 빈 페이지
- [ ] `app/(user)/tournaments/page.tsx` — 빈 페이지
- [ ] `app/(user)/notices/page.tsx` — 빈 페이지
- [ ] `app/admin/layout.tsx` — role Guard 포함
- [ ] `app/admin/page.tsx` — 빈 페이지
- [ ] `app/admin/scanner/page.tsx` — 빈 페이지
- [ ] `app/admin/members/page.tsx` — 빈 페이지
- [ ] `app/admin/tournaments/page.tsx` — 빈 페이지
- [ ] `app/admin/notices/page.tsx` — 빈 페이지

### ✅ PHASE 1 Eval (완료 기준 — 모두 통과해야 PHASE 2 진입)

- [ ] `pnpm build` 성공 (빌드 에러 0)
- [ ] `pnpm tsc --noEmit` 타입 에러 0건
- [ ] `pnpm drizzle-kit migrate` Neon 마이그레이션 성공
- [ ] `profiles`, `point_transactions`, `tournaments` 테이블 Neon 콘솔에서 확인
- [ ] `process_point_transaction` Stored Procedure Neon에서 실행 확인
- [ ] `http://localhost:3000/login` 접속 시 페이지 렌더링 (에러 없음)
- [ ] `/admin` 접속 시 미인증 상태에서 `/login`으로 리다이렉트 확인
- [ ] 금지 항목 관련 테이블/ENUM 없음 확인

---

## PHASE 2 — 회원(User) UI 구현 `[Antigravity]`

> **트리거**: Phase 1 Eval 전체 통과 확인 후 Antigravity에 전달
>
> **Antigravity 명령**: `"TASK_SPEC.md 디자인 토큰으로 GoldVIPCard, 메인 홈 대시보드, 포인트 내역, 대회/공지 페이지의 반응형 UI를 작성해줘. app/globals.css의 CSS 변수를 활용할 것."`

### 작업 목록

#### 2-1. 인증 화면
- [ ] `app/(auth)/login/page.tsx` — Google OAuth 버튼, 이용약관 UI
- [ ] `app/(auth)/onboarding/page.tsx` — 이름/닉네임/전화번호 입력 폼 UI

#### 2-2. 공통 레이아웃
- [ ] `app/(user)/layout.tsx` — 모바일 헤더 + 하단 탭 내비게이션

#### 2-3. 핵심 컴포넌트
- [ ] `components/cards/GoldVIPCard.tsx` — 골드 메탈릭 카드, 등급 배지, 포인트 표시, QR 버튼
- [ ] `components/qr/MemberQRModal.tsx` — qr_token 기반 고대비 QR 팝업
- [ ] `app/(user)/page.tsx` — 대시보드 (VIP카드 + 공지 배너)
- [ ] `app/(user)/ledger/page.tsx` — 전체/적립/차감 탭, 사유별 배지
- [ ] `components/cards/TournamentCard.tsx`
- [ ] `app/(user)/tournaments/page.tsx` — 대회 목록
- [ ] `components/cards/NoticeCard.tsx`
- [ ] `app/(user)/notices/page.tsx` — 카테고리 탭

### ✅ PHASE 2 Eval

- [ ] `pnpm build` 성공
- [ ] 390px 모바일 뷰 깨짐 없음 (Chrome DevTools 확인)
- [ ] GoldVIPCard 골드 그라디언트 렌더링 확인
- [ ] MemberQRModal QR 코드 표시 확인
- [ ] 하단 탭 내비게이션 4개 탭 동작 확인

---

## PHASE 3 — 비즈니스 로직 & 백엔드 연동 `[Claude Code]`

> **트리거**: Phase 2 Eval 통과 후
>
> **Claude Code 명령**: `"UI와 Neon Server Actions를 연결하고, process_point_transaction RPC 호출 및 /admin 접근 권한 강제를 구현해줘."`

### 작업 목록

- [ ] 온보딩 폼 Server Action → profiles upsert (닉네임/전화번호 중복 검사 포함)
- [ ] `/ledger` — point_transactions 페이지네이션 조회 Server Action
- [ ] `/tournaments` — 토너먼트 목록 + 참가신청/취소 Server Action
- [ ] `/notices` — notices_events 조회
- [ ] `app/admin/layout.tsx` — 세션 role 서버 검증 강제
- [ ] `app/admin/page.tsx` — 통계 데이터 Server-side 조회

### ✅ PHASE 3 Eval

- [ ] `pnpm build` 성공
- [ ] 온보딩 → 닉네임 중복 시 에러 메시지 표시
- [ ] `/ledger` 실제 DB 데이터 렌더링 확인
- [ ] staff 계정으로만 `/admin` 접근 가능 확인
- [ ] user 계정으로 `/admin` 접속 시 403 또는 리다이렉트 확인

---

## PHASE 4 — 직원/관리자 UI & QR 시스템 `[Antigravity]`

> **트리거**: Phase 3 Eval 통과 후
>
> **Antigravity 명령**: `"직원용 QR 스캐너 화면 고급 디자인, 스캔 성공 시 원터치 포인트 지급 Sheet 연결, 관리자 회원 검색/토너먼트/공지 UI 완성해줘."`

### 작업 목록

- [ ] `components/qr/StaffQRScanner.tsx` — 카메라 뷰파인더 UI, 스캔 성공 애니메이션
- [ ] `app/admin/scanner/page.tsx` — 스캔 → 회원 프로필 표시 → Drawer 팝업
- [ ] `components/forms/PointActionDrawer.tsx`
  - [투핸드 포카드 +500P] / [스티플 +1,000P] / [로티플 +3,000P] / [10장 현금 보너스] / [수동 입력]
  - 확인 다이얼로그 → Server Action 호출
- [ ] `app/admin/members/page.tsx` — 회원 검색, 등급 변경, 수동 포인트 조정 UI
- [ ] `app/admin/tournaments/page.tsx` — 토너먼트 생성 폼, 참가자 목록, 순위 입력
- [ ] `app/admin/notices/page.tsx` — 공지/이벤트 작성 에디터

### ✅ PHASE 4 Eval

- [ ] `pnpm build` 성공
- [ ] QR 스캐너 카메라 권한 요청 후 뷰파인더 표시 확인
- [ ] 포인트 지급 버튼 클릭 → 확인 다이얼로그 → Server Action 호출 확인
- [ ] 중복 클릭 방지 (Debounce) 동작 확인
- [ ] 관리자 회원 검색 결과 표시 확인

---

## PHASE 5 — 최종 검증 & 배포 `[Claude Code]`

> **트리거**: Phase 4 Eval 통과 후

### 작업 목록

- [ ] `pnpm tsc --noEmit` — 타입 에러 0건
- [ ] `pnpm build` — 프로덕션 빌드 성공
- [ ] 모든 Server Action에서 세션 role 검증 코드 리뷰
- [ ] 포인트 음수 방지: Stored Procedure RAISE EXCEPTION + Server Action 레이어 이중 확인
- [ ] Debounce + Idempotency key 중복 지급 방지 확인
- [ ] 오프라인 에러 토스트 동작 확인
- [ ] 390px 모바일 최종 점검
- [ ] Vercel 배포 + 환경변수 등록
- [ ] admin_audit_logs 자동 기록 동작 확인

### ✅ PHASE 5 Eval (최종 출시 기준)

- [ ] `pnpm build` + `tsc --noEmit` 에러 0건
- [ ] Google 로그인 → 온보딩 → 메인 대시보드 전체 흐름 동작
- [ ] QR 스캔 → 포인트 지급 → 원장 반영 전체 흐름 동작
- [ ] 포인트 잔액 부족 시 차감 거부 확인
- [ ] `/admin` 비인가 접근 차단 확인
- [ ] 금지 항목(바인권/송금) 코드 전체 Grep 검색 후 없음 확인
- [ ] Vercel 프로덕션 URL 정상 접속

---

## 실행 기록 (PROGRESS.md 별도 관리)

> 각 Phase 완료 시 `PROGRESS.md`에 아래 내용 기록:
> - 실행 일시
> - 완료된 작업 목록
> - Eval 통과 여부
> - 실패/제외된 항목 및 사유
> - 다음 Phase 트리거 조건 충족 여부

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14+ App Router, TypeScript, Tailwind CSS v4, Shadcn UI, Framer Motion |
| Database | **Neon** (PostgreSQL Serverless) |
| ORM | **Drizzle ORM** + drizzle-kit |
| Auth | **NextAuth.js v5 (Auth.js)** — Google OAuth |
| State | TanStack Query + Server Actions |
| QR 생성 | `qrcode.react` |
| QR 스캔 | `html5-qrcode` |
| 아이콘 | `lucide-react` |
| 에이전트 | **Claude Code** (백엔드/시스템) + **Antigravity** (UI/프론트) |
