# SEO Action Plan — FLOP POKER CLUB
**Audited:** 2026-08-27 | **Score:** 51/100 → Target: 78/100

Priority order respects dependency sequencing: fix CSR first (unblocks metadata fixes), then schema, then local citations.

---

## Week 1 — Critical Fixes (Score Impact: +15 pts)

### 1. Convert /tournaments to Server Component [CRITICAL]
**Files:** `app/(user)/tournaments/page.tsx`  
**Why first:** Unblocks metadata export + makes content crawlable.

```tsx
// Remove 'use client' directive and useEffect pattern
import type { Metadata } from 'next'
import { getTournaments } from '@/lib/actions/tournaments'
import { TournamentList } from '@/components/tournaments/TournamentList'

export const metadata: Metadata = {
  title: '토너먼트 대회 일정',
  description: 'FLOP 포커클럽 원주 정기 토너먼트 일정 및 참가 접수. 데일리 토너먼트 매일 19:00 진행.',
}

export default async function TournamentsPage() {
  const tournaments = await getTournaments()
  return <TournamentList initialData={tournaments} />
}
```
Move interactive UI logic (register/cancel buttons) into a `'use client'` `TournamentList` component that accepts `initialData`.

### 2. Convert /notices to Server Component [CRITICAL]
**Files:** `app/(user)/notices/page.tsx`

```tsx
import type { Metadata } from 'next'
import { getNotices } from '@/lib/actions/notices'
import { NoticesContent } from '@/components/notices/NoticesContent'

export const metadata: Metadata = {
  title: '클럽 공지 & 소식',
  description: 'FLOP 포커클럽 원주의 최신 공지사항, 이벤트, 클럽 소식을 확인하세요.',
}

export default async function NoticesPage() {
  const notices = await getNotices()
  return <NoticesContent initialData={notices} />
}
```

### 3. Fix Terms Page Title Double-Branding [CRITICAL]
**File:** `app/(legal)/terms/page.tsx`

```tsx
// Find the metadata export and change:
export const metadata: Metadata = {
  title: '이용약관',  // Template adds "| FLOP POKER CLUB" automatically
  // ...
}
```

### 4. Fix Duplicate H1 on Homepage [HIGH]
**File:** Find the landing page component — `components/landing/LandingPage.tsx`  
Change "WONJU NO.1 HIGH ROLLER POKER CLUB" from `<h1>` to `<h2>` or `<p>`.

---

## Week 1 — Schema + Phone [HIGH]

### 5. Add Phone Number to Schema and Site
**File:** `app/layout.tsx`  
Add `telephone` field to `localBusinessJsonLd`.  
Also add phone number to footer in `components/landing/LandingPage.tsx`.

```ts
telephone: '+82-10-XXXX-XXXX',
```

### 6. Add Event Schema to Tournaments (after fix #1)
**File:** `app/(user)/tournaments/page.tsx` or `components/tournaments/TournamentList.tsx`

Add a JSON-LD script tag for each tournament as `SportsEvent`.

### 7. Change Schema Type from BarOrPub to EntertainmentBusiness
**File:** `app/layout.tsx`

```ts
'@type': 'EntertainmentBusiness',  // was: 'BarOrPub'
```

---

## Month 1 — Medium Priority (+8 pts)

### 8. Add llms.txt
**File:** `public/llms.txt` (new file)

```
# FLOP POKER CLUB
> 강원 원주 최고급 홀덤 포커 마인드 스포츠 클럽

## 클럽 정보
- 주소: 강원특별자치도 원주시 서원대로 172, 3층(단계동)
- 영업시간: 매일 18:00 ~ 익일 06:00
- 문의: [전화번호]

## 주요 서비스
- 신규 가입 즉시 5,000P 웰컴 포인트
- 데일리 토너먼트 매일 19:00
- QR 출입 인증 + 투명한 포인트 원장
```

### 9. Reconsider AI Crawler Blocking
**File:** `app/robots.ts`  
Consider removing `Google-Extended` block to improve AI Overview eligibility.

### 10. Fix /landing sitemap gap
**File:** `app/sitemap.ts`  
Either add `/landing` with priority 0.8 or remove from robots.txt Allow list.

### 11. Add BreadcrumbList Schema to Inner Pages
Add BreadcrumbList JSON-LD to `/tournaments` and `/notices` pages after they're SSR'd.

### 12. Add hreflang Tags
**File:** `app/layout.tsx`  
```ts
alternates: {
  canonical: SITE_URL,
  languages: { 'ko': SITE_URL, 'ko-KR': SITE_URL },
},
```

---

## Backlog — Local Citations (Highest Local SEO ROI)

### 13. Register on Naver 스마트 플레이스
URL: https://smartplace.naver.com  
Use exact NAP: FLOP 포커클럽, 강원특별자치도 원주시 서원대로 172 3층, [phone]

### 14. Register on Kakao 사업자
URL: https://place.map.kakao.com

### 15. Create + Verify Google Business Profile
Add: interior photos, tournament schedule posts, respond to reviews.

---

## Expected Score After Fixes

| Phase | Actions | Score Delta | New Score |
|---|---|---|---|
| Baseline | — | — | 51 |
| Week 1 | CSR→SSR, titles, H1, phone, schema | +15 | 66 |
| Month 1 | llms.txt, hreflang, BreadcrumbList, sitemap | +6 | 72 |
| Backlog | GBP, Naver, Kakao | +6 | **78** |
