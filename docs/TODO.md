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

| 단계 | 담당 | 작업 | 상태 |
|------|------|------|:---:|
| 1단계 | **Claude Code** | 프로젝트 초기화, Neon 스키마, NextAuth 설정 | ✅ 완료 |
| 2단계 | **Antigravity** | 블랙&골드 UI 컴포넌트, 회원 화면 레이아웃 | ✅ 완료 |
| 3단계 | **Claude Code** | Server Actions, 포인트 RPC 연동, 미들웨어 | ✅ 완료 |
| 4단계 | **Antigravity** | QR 스캐너 UI, 포인트 지급 Drawer, 모바일 인터랙션 | ✅ 완료 |
| 5단계 | **Claude Code** | 빌드 검증, 타입 에러 수정, 배포 준비 | 🔄 진행중 |

---

## PHASE 1 — 환경 세팅 & 인프라 `[Claude Code 담당]`

### 1-1. 프로젝트 초기화
- [x] Next.js 16+ App Router + TypeScript 생성
- [x] Tailwind CSS 설정
- [x] Shadcn UI 초기화 (Button, Card, Dialog, Sheet, Badge, Tabs, Drawer)
- [x] Framer Motion 설치
- [x] QR 라이브러리 설치: `qrcode.react`, `html5-qrcode`, `lucide-react`

### 1-2. Neon 데이터베이스 연결
- [x] Neon 프로젝트 생성 및 Connection String 발급
- [x] `@neondatabase/serverless` + `drizzle-orm` + `drizzle-kit` 설치
- [x] `lib/db/index.ts` — Neon HTTP driver 기반 Drizzle 클라이언트 설정
- [x] `.env.local` 환경변수 작성
  ```
  DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
  NEXTAUTH_SECRET=...
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  NEXTAUTH_URL=http://localhost:3000
  ```

### 1-3. Drizzle 스키마 정의 (`lib/db/schema.ts`)
- [x] ENUM: `user_role` (user/staff/super_admin), `user_tier` (NORMAL/VIP/VVIP/ROYAL)
- [x] ENUM: `point_reason` (FOUR_OF_A_KIND, STRAIGHT_FLUSH, ROYAL_FLUSH, TOURNAMENT_WIN, TOURNAMENT_BUYIN, EVENT_BONUS, ADMIN_ADJUSTMENT, POINT_SHOP_USAGE)
- [x] ENUM: `tourney_status` (UPCOMING/REGISTRATION/LIVE/COMPLETED/CANCELLED)
- [x] `profiles` 테이블 (id, email, name, nickname unique, phone unique, role, tier, qr_token uuid unique, total_points bigint ≥ 0)
- [x] `point_transactions` 테이블 (id, user_id FK, amount bigint, balance_after, reason, description, processed_by FK, created_at)
- [x] `tournaments` 테이블 (id, title, description, start_time, entry_point_cost, total_prize_points, max_players, status)
- [x] `tournament_participants` 테이블 (id, tournament_id FK, user_id FK, final_rank, prize_points_awarded, UNIQUE 복합키)
- [x] `notices_events` 테이블 (id, category CHECK IN NOTICE/EVENT/RULE, title, content, image_url, is_pinned, author_id FK)
- [x] `admin_audit_logs` 테이블 (id, admin_id FK, target_user_id FK, action, payload jsonb)

### 1-4. DB 마이그레이션
- [x] `drizzle.config.ts` 설정
- [x] `drizzle-kit generate` → 마이그레이션 SQL 생성
- [x] `drizzle-kit migrate` → Neon에 스키마 적용
- [x] Stored Procedure `process_point_transaction` Neon에서 직접 실행
  - `SELECT FOR UPDATE` 비관적 락으로 동시성 보장
  - profiles.total_points 업데이트 + point_transactions 삽입 원자적 처리
  - 잔액 부족 시 RAISE EXCEPTION 처리

### 1-5. NextAuth.js v5 (Auth.js) 설정
- [x] `next-auth@beta` + Drizzle Adapter 설치
- [x] `auth.ts` — Google Provider 설정, Neon Drizzle Adapter 연결
- [x] `app/api/auth/[...nextauth]/route.ts` 생성
- [x] `proxy.ts` / 미들웨어 — 보호 라우트 설정
  - `/admin/*` → staff 이상만 허용
  - 미인증 → `/login` 리다이렉트
  - 온보딩 미완료 사용자 → `/onboarding` 리다이렉트

### 1-6. 디렉터리 구조 및 TypeScript 타입
- [x] `types/database.types.ts` — 도메인 및 Drizzle 기반 타입 정의
- [x] `lib/utils/format.ts` — formatPoints, formatPhone, formatDateTime 유틸 함수

---

## PHASE 2 — 회원(User) UI 구현 `[Antigravity 담당]`

### 2-1. 디자인 토큰 & 테마
- [x] `tailwind.config.ts` 럭셔리 카지노 컬러 토큰 등록
  ```
  배경:   #0B0B0F (Matte Black), #13141C (Charcoal Surface), #202436 (Obsidian Mesh)
  골드:   linear-gradient(135deg, #F5D061 0%, #E6AF2E 50%, #C28B1E 100%)
  테두리: rgba(230,175,46,0.25)  |  글로우: rgba(245,208,97,0.15)
  텍스트: #FFFFFF (제목), #F3E5AB (챔페인 서브), #9CA3AF (뮤트)
  ```
- [x] 눈누 웹폰트 (Pretendard, GmarketSans, 조선명조, Cinzel) 등록
- [x] 럭셔리 골드 스페이드 파비콘 (`app/icon.svg`) 생성 및 적용

### 2-2. 인증 & 온보딩 화면
- [x] `app/(auth)/login/page.tsx` — Google OAuth 로그인 버튼, 이용약관 안내 UI, VIP 혜택 소개
- [x] `app/(auth)/onboarding/page.tsx` — 이름/닉네임(중복확인)/전화번호(010 포맷팅) 입력 폼 UI, 웰컴 5,000P 지급 알림

### 2-3. 공통 레이아웃
- [x] `app/(user)/layout.tsx` — 모바일 헤더 + 하단 탭 내비게이션 (홈/원장/대회/공지) + 활성 탭 골드 인디케이터

### 2-4. 메인 대시보드
- [x] `app/(user)/page.tsx` — 메인 홈 화면 (VIP 카드, 핀 공지 배너, 빠른 메뉴, 추천 대회, 최근 활동)
- [x] `components/cards/GoldVIPCard.tsx`
  - 골드 메탈릭 광택 그라디언트 카드
  - 회원 등급 배지 (NORMAL/VIP/VVIP/ROYAL)
  - 보유 포인트 대형 표시 (24,500 P)
  - [내 QR 코드] 원터치 버튼
  - `.shimmer-light` 광택 애니메이션 & 브러시드 옵시디언 그라디언트
- [x] `components/qr/MemberQRModal.tsx` — qr_token 기반 고대비 QR 팝업 (밝은 배경, 카운트다운 타이머, 토큰 복사, 화면 밝기 안내)
- [x] 홈 공지 배너 (is_pinned 공지 최신 1건)
- [x] 원터치 핸드 보너스 안내 (+500P, +1,000P, +3,000P)

### 2-5. 포인트 원장 페이지
- [x] `app/(user)/ledger/page.tsx`
  - 전체/적립/차감 탭 필터
  - 사유별 칩 필터 (포카드/스티플/로티플/토너우승/대회참가/이벤트/매장사용)
  - 검색창 및 잔액 변동 내역 불변 원장 뷰

### 2-6. 대회 & 공지 페이지
- [x] `components/cards/TournamentCard.tsx` — 참가비(P), 상금풀(P), 시작 시간, 상태 배지, 참가 신청/취소 인터랙션
- [x] `app/(user)/tournaments/page.tsx` — 전체 대회 / 내 참가 신청 내역 / LIVE 진행 탭 뷰
- [x] `components/cards/NoticeCard.tsx` — 공지/이벤트/룰북 카드 & 상세 모달
- [x] `app/(user)/notices/page.tsx` — 카테고리 탭(공지/이벤트/룰북), 검색, 필독 공지 상단 고정

---

## PHASE 3 — 비즈니스 로직 & 백엔드 연동 `[Claude Code 담당]`

### 3-1. 인증 Server Actions
- [x] 온보딩 폼 → profiles 테이블 upsert (`lib/actions/onboarding.ts`)
- [x] 닉네임/전화번호 중복 검사 Server Action

### 3-2. 포인트 원장 데이터 연결
- [x] `app/(user)/ledger/page.tsx` — point_transactions Server Action (`lib/actions/ledger.ts`)
- [x] `app/(user)/tournaments/page.tsx` — 토너먼트 목록 및 참가 신청/취소 Server Action (`lib/actions/tournaments.ts`)
- [x] `app/(user)/notices/page.tsx` — notices_events Server Action (`lib/actions/notices.ts`)
- [x] `app/(user)/page.tsx` — 사용자 프로필 & 대시보드 데이터 연동 (`lib/actions/user.ts`)

### 3-3. 관리자 레이아웃 & 접근 Guard
- [x] `app/admin/layout.tsx` — 세션 role 검증 (staff/super_admin만 통과)
- [x] `app/admin/page.tsx` — 통계 데이터 Server-side 조회

---

## PHASE 4 — 직원/관리자 UI & QR 시스템 `[Antigravity 담당]`

### 4-1. 직원용 QR 스캐너
- [x] `app/admin/scanner/page.tsx` — 카메라 스캐너 콘솔 + 수동 회원 검색 Fallback
- [x] `components/qr/StaffQRScanner.tsx`
  - 럭셔리 뷰파인더 디자인, 골드 브래킷 & 레이저 펄스 애니메이션
  - 모바일 후면 카메라 기본값 (`facingMode: "environment"`)
  - QR 인식 → 회원 프로필 즉시 표시 (1초 내)
  - 스캔 성공 시 PointActionDrawer 자동 팝업

### 4-2. 포인트 지급/차감 Drawer
- [x] `components/forms/PointActionDrawer.tsx`
  - 원터치 버튼: [투핸드 포카드 +500P] / [스티플 +1,000P] / [로티플 +3,000P] / [10장 현금 보너스 +5,000P] / [수동 금액 입력 (+ / -)]
  - 확인 다이얼로그 → Server Action 호출
  - Debounce & Idempotency key 중복 방지

### 4-3. 관리자 UI 화면
- [x] `app/admin/members/page.tsx` — 회원 검색, 등급 변경 모달, 수동 포인트 조정 UI
- [x] `app/admin/tournaments/page.tsx` — 토너먼트 생성 폼, 상태 제어, 순위 & 상금 자동 분배 UI
- [x] `app/admin/notices/page.tsx` — 공지/이벤트 작성 에디터, 이미지 링크, 핀 고정 관리

---

## PHASE 5 — 최종 검증 & 배포 `[Claude Code 담당]`

- [ ] `npx tsc --noEmit` — TypeScript 전체 타입 에러 0건
- [ ] `npm run build` — 프로덕션 빌드 성공
- [ ] Server Action 레이어 보안 점검 (모든 쓰기 액션에서 세션 role 검증)
- [ ] 포인트 음수 방지 이중 검증 (Stored Procedure + 애플리케이션 레벨)
- [ ] Debounce + Idempotency key로 중복 포인트 지급 방지 확인
- [ ] 오프라인 / 네트워크 에러 토스트 알림 동작 확인
- [x] 모바일 반응형 최종 점검 (390px 기준)
- [ ] Vercel 배포 + 환경변수 등록

---

## 기술 스택 확정

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16+ App Router, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion |
| Database | **Neon** (PostgreSQL Serverless) |
| ORM | **Drizzle ORM** + drizzle-kit |
| Auth | **NextAuth.js v5 (Auth.js)** — Google OAuth |
| State | TanStack Query + Server Actions |
| QR 생성 | `qrcode.react` (Standalone SVG 포함) |
| QR 스캔 | `html5-qrcode` / 카메라 API |
| 아이콘 | `lucide-react` |
| 폰트 | **Noonnu** (Pretendard, GmarketSans, 조선명조) + Cinzel |
| 빌드 에이전트 | **Claude Code** (백엔드) + **Antigravity** (UI/프론트) |
