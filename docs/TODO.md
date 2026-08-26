# FLOP POKER CLUB — 개발 TODO

> **핵심 변경 사항 (원본 TASK_SPEC.md 대비)**
> - DB: ~~Supabase~~ → **Neon (PostgreSQL)** + **Drizzle ORM**
> - Auth: ~~Supabase Auth~~ → **NextAuth.js v5 (Auth.js)** + Google OAuth
> - ~~Lovable~~ 사용 안 함
> - 빌드 체계: **Claude Code (백엔드/시스템)** + **Antigravity (UI/프론트)** 분담 유지

---

## ⚠️ 절대 구현 금지 항목

- 바인권(Buy-in Ticket) 구매/수량/차감 기능
- 포인트 유저 간 송금 / 현금 충전 / 현금 환급 기능

---

## 역할 분담 요약

| 단계 | 담당 | 작업 |
|------|------|------|
| 1단계 | **Claude Code** | 프로젝트 초기화, Neon 스키마, NextAuth 설정 |
| 2단계 | **Antigravity** | 블랙&골드 UI 컴포넌트, 회원 화면 레이아웃 |
| 3단계 | **Claude Code** | Server Actions, 포인트 RPC 연동, 미들웨어 |
| 4단계 | **Antigravity** | QR 스캐너 UI, 포인트 지급 Drawer, 모바일 인터랙션 |
| 5단계 | **Claude Code** | 빌드 검증, 타입 에러 수정, 배포 준비 |

---

## PHASE 1 — 환경 세팅 & 인프라 `[Claude Code 담당]`

### 1-1. 프로젝트 초기화
- [ ] Next.js 16+ App Router + TypeScript 생성
- [ ] Tailwind CSS 설정
- [ ] Shadcn UI 초기화 (Button, Card, Dialog, Sheet, Badge, Tabs, Drawer)
- [ ] Framer Motion 설치
- [ ] QR 라이브러리 설치: `qrcode.react`, `html5-qrcode`, `lucide-react`

### 1-2. Neon 데이터베이스 연결
- [ ] Neon 프로젝트 생성 및 Connection String 발급
- [ ] `@neondatabase/serverless` + `drizzle-orm` + `drizzle-kit` 설치
- [ ] `src/lib/db/index.ts` — Neon HTTP driver 기반 Drizzle 클라이언트 설정
- [ ] `.env.local` 환경변수 작성
  ```
  DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
  NEXTAUTH_SECRET=...
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  NEXTAUTH_URL=http://localhost:3000
  ```

### 1-3. Drizzle 스키마 정의 (`src/lib/db/schema.ts`)
- [ ] ENUM: `user_role` (user/staff/super_admin), `user_tier` (NORMAL/VIP/VVIP/ROYAL)
- [ ] ENUM: `point_reason` (FOUR_OF_A_KIND, STRAIGHT_FLUSH, ROYAL_FLUSH, TOURNAMENT_WIN, TOURNAMENT_BUYIN, EVENT_BONUS, ADMIN_ADJUSTMENT, POINT_SHOP_USAGE)
- [ ] ENUM: `tourney_status` (UPCOMING/REGISTRATION/LIVE/COMPLETED/CANCELLED)
- [ ] `profiles` 테이블 (id, email, name, nickname unique, phone unique, role, tier, qr_token uuid unique, total_points bigint ≥ 0)
- [ ] `point_transactions` 테이블 (id, user_id FK, amount bigint, balance_after, reason, description, processed_by FK, created_at)
- [ ] `tournaments` 테이블 (id, title, description, start_time, entry_point_cost, total_prize_points, max_players, status)
- [ ] `tournament_participants` 테이블 (id, tournament_id FK, user_id FK, final_rank, prize_points_awarded, UNIQUE 복합키)
- [ ] `notices_events` 테이블 (id, category CHECK IN NOTICE/EVENT/RULE, title, content, image_url, is_pinned, author_id FK)
- [ ] `admin_audit_logs` 테이블 (id, admin_id FK, target_user_id FK, action, payload jsonb)

### 1-4. DB 마이그레이션
- [ ] `drizzle.config.ts` 설정
- [ ] `drizzle-kit generate` → 마이그레이션 SQL 생성
- [ ] `drizzle-kit migrate` → Neon에 스키마 적용
- [ ] Stored Procedure `process_point_transaction` Neon에서 직접 실행
  - `SELECT FOR UPDATE` 비관적 락으로 동시성 보장
  - profiles.total_points 업데이트 + point_transactions 삽입 원자적 처리
  - 잔액 부족 시 RAISE EXCEPTION 처리

### 1-5. NextAuth.js v5 (Auth.js) 설정
- [ ] `next-auth@beta` + Drizzle Adapter 설치
- [ ] `src/auth.ts` — Google Provider 설정, Neon Drizzle Adapter 연결
- [ ] `src/app/api/auth/[...nextauth]/route.ts` 생성
- [ ] `src/middleware.ts` — 보호 라우트 설정
  - `/admin/*` → staff 이상만 허용
  - 미인증 → `/login` 리다이렉트
  - 온보딩 미완료 사용자 → `/onboarding` 리다이렉트

### 1-6. 디렉터리 구조 및 TypeScript 타입
- [ ] `src/types/database.types.ts` — Drizzle inferSelect/inferInsert 기반 타입 정의
- [ ] `src/lib/utils/` — formatPoints, formatPhone, formatDateTime 유틸 함수

---

## PHASE 2 — 회원(User) UI 구현 `[Antigravity 담당]`

> **Antigravity 실행 명령 예시**
> `"TASK_SPEC.md의 디자인 토큰을 활용해서 GoldVIPCard, 메인 홈 대시보드, 포인트 내역 페이지의 반응형 UI를 작성해줘."`

### 2-1. 디자인 토큰 & 테마
- [ ] `tailwind.config.ts` 럭셔리 카지노 컬러 토큰 등록
  ```
  배경:   #0B0B0F (Matte Black), #13141C (Charcoal Surface)
  골드:   linear-gradient(135deg, #F5D061 0%, #E6AF2E 50%, #C28B1E 100%)
  테두리: rgba(230,175,46,0.25)  |  글로우: rgba(245,208,97,0.15)
  텍스트: #FFFFFF (제목), #F3E5AB (챔페인 서브), #9CA3AF (뮤트)
  ```

### 2-2. 인증 & 온보딩 화면
- [ ] `app/(auth)/login/page.tsx` — Google OAuth 로그인 버튼, 이용약관 안내 UI
- [ ] `app/(auth)/onboarding/page.tsx` — 이름/닉네임/전화번호 입력 폼 UI

### 2-3. 공통 레이아웃
- [ ] `app/(user)/layout.tsx` — 모바일 헤더 + 하단 탭 내비게이션 (홈/원장/대회/공지)

### 2-4. 메인 대시보드
- [ ] `app/(user)/page.tsx`
- [ ] `components/cards/GoldVIPCard.tsx`
  - 골드 메탈릭 광택 그라디언트 카드
  - 회원 등급 배지 (NORMAL/VIP/VVIP/ROYAL)
  - 보유 포인트 대형 표시 (예: 24,500 P)
  - [내 QR 코드] 원터치 버튼
- [ ] `components/qr/MemberQRModal.tsx` — qr_token 기반 고대비 QR 팝업 (밝은 배경)
- [ ] 홈 공지 배너 (is_pinned 공지 최신 1건)

### 2-5. 포인트 원장 페이지
- [ ] `app/(user)/ledger/page.tsx`
  - 전체/적립/차감 탭 필터
  - 사유별 배지 (포카드/스티플/로티플/토너먼트/관리자조정)

### 2-6. 대회 & 공지 페이지
- [ ] `components/cards/TournamentCard.tsx` — 참가비(P), 상금풀(P), 시작 시간, 상태 배지
- [ ] `app/(user)/tournaments/page.tsx` — 대회 목록 + 내 참가 신청 내역
- [ ] `components/cards/NoticeCard.tsx`
- [ ] `app/(user)/notices/page.tsx` — 카테고리 탭(공지/이벤트/룰북)

---

## PHASE 3 — 비즈니스 로직 & 백엔드 연동 `[Claude Code 담당]`

> **Claude Code 실행 명령 예시**
> `"포인트 원장 페이지와 회원 프로필에 실제 Neon Server Actions를 연결하고, 비인가 사용자의 /admin 접근을 차단하는 미들웨어를 구현해줘."`

### 3-1. 인증 Server Actions
- [ ] 온보딩 폼 → profiles 테이블 upsert
- [ ] 닉네임/전화번호 중복 검사 Server Action

### 3-2. 포인트 원장 데이터 연결
- [ ] `app/(user)/ledger/page.tsx` — point_transactions 페이지네이션 조회
- [ ] `app/(user)/tournaments/page.tsx` — 토너먼트 목록 및 참가 신청/취소 Server Action
- [ ] `app/(user)/notices/page.tsx` — notices_events 조회

### 3-3. 관리자 레이아웃 & 접근 Guard
- [ ] `app/admin/layout.tsx` — 세션 role 검증 (staff/super_admin만 통과)
- [ ] `app/admin/page.tsx` — 통계 데이터 Server-side 조회

---

## PHASE 4 — 직원/관리자 UI & QR 시스템 `[Antigravity 담당]`

> **Antigravity 실행 명령 예시**
> `"직원용 QR 스캐너 화면에서 카메라 뷰파인더 디자인을 고급스럽게 다듬고, 스캔 성공 시 하단에서 올라오는 원터치 포인트 지급 Sheet를 연결해줘."`

### 4-1. 직원용 QR 스캐너
- [ ] `app/admin/scanner/page.tsx`
- [ ] `components/qr/StaffQRScanner.tsx`
  - `html5-qrcode` 연동, 모바일 후면 카메라 기본값
  - QR 인식 → 회원 프로필 즉시 표시 (1초 내)
  - 스캔 성공 시 PointActionDrawer 자동 팝업

### 4-2. 포인트 지급/차감 Drawer
- [ ] `components/forms/PointActionDrawer.tsx`
  - 원터치 버튼: [투핸드 포카드 +500P] / [스티플 +1,000P] / [로티플 +3,000P] / [10장 현금 보너스] / [수동 입력]
  - 확인 다이얼로그 → Server Action 호출

### 4-3. 관리자 UI 화면
- [ ] `app/admin/members/page.tsx` — 회원 검색, 등급 변경, 수동 포인트 조정 UI
- [ ] `app/admin/tournaments/page.tsx` — 토너먼트 생성 폼, 참가자 목록, 순위 입력 UI
- [ ] `app/admin/notices/page.tsx` — 공지/이벤트 작성 에디터, 이미지 업로드

---

## PHASE 5 — 최종 검증 & 배포 `[Claude Code 담당]`

> **Claude Code 실행 명령 예시**
> `"전체 프로젝트의 TypeScript 에러와 빌드 에러를 검사하고, npm run build가 정상 완료되도록 수정해줘."`

- [ ] `npx tsc --noEmit` — TypeScript 전체 타입 에러 0건
- [ ] `npm run build` — 프로덕션 빌드 성공
- [ ] Server Action 레이어 보안 점검 (모든 쓰기 액션에서 세션 role 검증)
- [ ] 포인트 음수 방지 이중 검증 (Stored Procedure + 애플리케이션 레벨)
- [ ] Debounce + Idempotency key로 중복 포인트 지급 방지 확인
- [ ] 오프라인 / 네트워크 에러 토스트 알림 동작 확인
- [ ] 모바일 반응형 최종 점검 (390px 기준)
- [ ] Vercel 배포 + 환경변수 등록

---

## 기술 스택 확정

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14+ App Router, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion |
| Database | **Neon** (PostgreSQL Serverless) |
| ORM | **Drizzle ORM** + drizzle-kit |
| Auth | **NextAuth.js v5 (Auth.js)** — Google OAuth |
| State | TanStack Query + Server Actions |
| QR 생성 | `qrcode.react` |
| QR 스캔 | `html5-qrcode` |
| 아이콘 | `lucide-react` |
| 빌드 에이전트 | **Claude Code** (백엔드) + **Antigravity** (UI) |
