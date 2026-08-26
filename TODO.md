# FLOP POKER CLUB — 개발 TODO

> **핵심 변경 사항 (원본 TASK_SPEC.md 대비)**
>
> - DB: ~~Supabase~~ → **Neon (PostgreSQL)** + **Drizzle ORM**
> - Auth: ~~Supabase Auth~~ → **NextAuth.js v5 (Auth.js)** + Google OAuth
> - ~~Lovable~~ 사용 안 함
> - 빌드 체계: **Claude Code (백엔드/시스템)** + **Antigravity (UI/프론트)** 분담

---

## ⚠️ 절대 구현 금지 항목

- 바인권(Buy-in Ticket) 구매/수량/차감 기능
- 포인트 유저 간 송금 / 현금 충전 / 현금 환급 기능

---

## 역할 분담 요약

| 단계 | 담당 | 작업 | 상태 |
| :--- | :--- | :--- | :---: |
| 1단계 | **Claude Code** | 프로젝트 초기화, Neon 스키마, NextAuth 설정 | ✅ 완료 |
| 2단계 | **Antigravity** | 블랙&골드 UI 컴포넌트, 회원 화면 레이아웃 | ✅ 완료 |
| 3단계 | **Claude Code** | Server Actions, 포인트 RPC 연동, 미들웨어 | ✅ 완료 |
| 4단계 | **Antigravity** | QR 스캐너 UI, 포인트 지급 Drawer, 모바일 인터랙션 | ✅ 완료 |
| 5단계 | **Claude Code** | 빌드 검증, 타입 에러 수정, 배포 준비 | ✅ 완료 |

---

## PHASE 1 — 환경 세팅 & 인프라 `[Claude Code 담당]`

### 1-1. 패키지 설치 & 초기화

- [x] Next.js 16+ App Router + TypeScript
- [x] Tailwind CSS 설정
- [x] Shadcn UI 컴포넌트 초기화
- [x] Framer Motion, lucide-react, qrcode.react, html5-qrcode

### 1-2. Neon 데이터베이스 연결

- [x] `@neondatabase/serverless` + `drizzle-orm` + `drizzle-kit`
- [x] `lib/db/index.ts` — Drizzle 클라이언트
- [x] `.env.local` 환경변수 작성

### 1-3. Drizzle 스키마 정의 (`lib/db/schema.ts`)

- [x] ENUM: `user_role`, `user_tier`, `point_reason`, `tourney_status`
- [x] `profiles` 테이블 (NextAuth users 호환)
- [x] `accounts` 테이블 (NextAuth OAuth 계정 연결)
- [x] `point_transactions` 테이블 (원장, 불변)
- [x] `tournaments` 테이블
- [x] `tournament_participants` 테이블
- [x] `notices_events` 테이블
- [x] `admin_audit_logs` 테이블

### 1-4. DB 마이그레이션 & Stored Procedure

- [x] `drizzle-kit generate` → 마이그레이션 SQL 생성
- [x] `drizzle-kit migrate` → Neon 적용
- [x] `process_point_transaction` Stored Procedure SQL (`lib/db/procedures.sql`)

### 1-5. NextAuth.js v5 설정 & 보호 라우트

- [x] `auth.ts` — Google Provider + Drizzle Adapter 연결
- [x] `app/api/auth/[...nextauth]/route.ts`
- [x] `proxy.ts` / 미들웨어 보호 라우트

### 1-6. 유틸리티 & 타입

- [x] `lib/utils/format.ts` — formatPoints, formatPhone, formatDateTime
- [x] `types/database.types.ts` — 도메인 타입 정의

---

## PHASE 2 — 회원(User) UI 구현 `[Antigravity 담당]`

### 2-1. 디자인 토큰 & 테마

- [x] `tailwind.config.ts` 럭셔리 카지노 컬러 토큰 등록
- [x] `app/globals.css` 딥 옵시디언 그라디언트 및 골드 메탈릭 광택
- [x] 눈누 웹폰트 (Pretendard, GmarketSans, 조선명조) 및 Cinzel 적용
- [x] 럭셔리 골드 스페이드 파비콘 (`app/icon.svg`) 생성 및 적용

### 2-2. 인증 & 온보딩 화면

- [x] `app/(auth)/login/page.tsx` — Google OAuth 로그인 버튼, 약관 UI
- [x] `app/(auth)/onboarding/page.tsx` — 이름/닉네임/전화번호 폼 UI

### 2-3. 공통 레이아웃

- [x] `app/(user)/layout.tsx` — 모바일 헤더 + 하단 탭바 (홈/원장/대회/공지)

### 2-4. 메인 대시보드

- [x] `app/(user)/page.tsx`
- [x] `components/cards/GoldVIPCard.tsx` — 골드 메탈릭 카드, 등급 배지, 포인트 표시, QR 버튼
- [x] `components/qr/MemberQRModal.tsx` — 고대비 QR 팝업
- [x] 홈 공지 배너 (is_pinned 공지)

### 2-5. 포인트 원장 페이지

- [x] `app/(user)/ledger/page.tsx` — 전체/적립/차감 탭, 사유별 배지, 검색

### 2-6. 대회 & 공지 페이지

- [x] `components/cards/TournamentCard.tsx` — 대회 카드
- [x] `app/(user)/tournaments/page.tsx` — 대회 목록
- [x] `components/cards/NoticeCard.tsx`
- [x] `app/(user)/notices/page.tsx` — 카테고리 탭 (공지/이벤트/룰북)

---

## PHASE 3 — 비즈니스 로직 & 백엔드 연동 `[Claude Code 담당]`

### 3-1. 인증 Server Actions

- [x] 온보딩 폼 Server Action (`lib/actions/onboarding.ts`)
- [x] 닉네임/전화번호 중복 검사 (`lib/actions/user.ts`)

### 3-2. 포인트 원장 & 토너먼트 데이터 연결

- [x] `/ledger` — point_transactions 조회 (`lib/actions/ledger.ts`)
- [x] `/tournaments` — 대회 목록 + 참가 신청/취소 (`lib/actions/tournaments.ts`)
- [x] `/notices` — notices_events 조회 (`lib/actions/notices.ts`)

### 3-3. 관리자 레이아웃 & 접근 Guard

- [x] `app/admin/layout.tsx` — 세션 role 검증
- [x] `app/admin/page.tsx` — 통계 데이터 조회

---

## PHASE 4 — 직원/관리자 UI & QR 시스템 `[Antigravity 담당]`

### 4-1. 직원용 QR 스캐너

- [x] `components/qr/StaffQRScanner.tsx` — 카메라 뷰파인더 UI, 스캔 성공 애니메이션
- [x] `app/admin/scanner/page.tsx` — 스캐너 + 수동 검색 + 최근 스캔 목록

### 4-2. 포인트 지급/차감 Drawer

- [x] `components/forms/PointActionDrawer.tsx`
  - [투핸드 포카드 +500P] / [스티플 +1,000P] / [로티플 +3,000P] / [10장 보너스 +5,000P] / [수동 입력]
  - 확인 다이얼로그 → Server Action 호출
  - Debounce + Idempotency key 중복 방지

### 4-3. 관리자 UI 화면

- [x] `app/admin/members/page.tsx` — 회원 검색, 등급 변경, 수동 포인트 조정 UI
- [x] `app/admin/tournaments/page.tsx` — 토너먼트 생성 폼, 순위 및 상금 자동 분배 UI
- [x] `app/admin/notices/page.tsx` — 공지/이벤트 작성 에디터, 핀 고정 관리

---

## PHASE 5 — 최종 검증 & 배포 `[Claude Code 담당]`

- [x] `npx tsc --noEmit` — 타입 에러 0건
- [x] `pnpm build` — 프로덕션 빌드 성공
- [x] Server Action 레이어 보안 점검 (모든 쓰기 액션에서 세션 role 검증)
- [x] 포인트 음수 방지 이중 검증 (Stored Procedure + 애플리케이션 레벨)
- [x] Debounce + Idempotency key로 중복 포인트 지급 방지 확인
- [x] 오프라인 / 네트워크 에러 토스트 알림 동작 확인
- [x] 모바일 반응형 최종 점검 (390px 기준)
- [x] Vercel 배포 + 환경변수 등록

---

## 기술 스택

| 영역 | 기술 |
| :--- | :--- |
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
