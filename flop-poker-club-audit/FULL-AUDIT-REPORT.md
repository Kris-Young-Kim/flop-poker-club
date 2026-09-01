# SEO Full Audit Report
**Site:** https://flop-poker-club.vercel.app  
**Date:** 2026-08-27  
**Industry:** Local Service — 홀덤 포커 클럽 (Hold'em Poker Club), Wonju, South Korea  
**Tool:** claude-seo v2.2.5

---

## SEO Health Score: 51 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 42 | 9.2 |
| Content Quality | 23% | 55 | 12.7 |
| On-Page SEO | 20% | 48 | 9.6 |
| Schema / Structured Data | 10% | 58 | 5.8 |
| Performance (CWV) | 10% | 78 | 7.8 |
| AI Search Readiness | 10% | 25 | 2.5 |
| Images | 5% | 70 | 3.5 |
| **Total** | **100%** | | **51.1** |

> Score reflects major CSR (client-side rendering) issues on /tournaments and /notices, missing phone number, duplicate page titles, and aggressive AI crawler blocking.

---

## PERCEIVE Phase — What the Crawlers See

### External (Googlebot view)
- Homepage (`/`): **Fully SSR'd** via Next.js App Router. 68KB HTML, 200ms TTFB. Googlebot sees complete content.
- `/tournaments`: `'use client'` page — crawlers receive a shell with `loading=true` state. **Zero tournament content in initial HTML.**
- `/notices`: `'use client'` page — crawlers receive "소식을 불러오는 중..." (loading message). **Zero notice content in initial HTML.**
- `/privacy` + `/terms`: Server-rendered, full content crawlable. ✅
- `robots.txt`: Valid, all rules present. ✅
- `sitemap.xml`: 5 URLs with correct priorities. ✅
- `llms.txt`: **404 — does not exist.**

### Internal (code signals)
- Layout (`app/(user)/layout.tsx`): `'use client'` — the entire (user) route group is client-rendered
- Both `/tournaments` and `/notices` use `useEffect` + `useState` for data fetching = CSR-only
- No `export const metadata` on `/tournaments` or `/notices` pages → inherit root metadata → **duplicate titles**
- `/terms` title: "이용약관 | FLOP POKER CLUB | FLOP POKER CLUB" — double brand name from template conflict

---

## Findings by Priority

### 🔴 CRITICAL — Fix This Week

#### C1: Client-Side Rendering on /tournaments and /notices
**First principle:** Search engines rank content they can read. CSR-only pages send an empty shell.
**Impact:** Both pages indexed with near-zero content. Google will not rank empty pages for "원주 홀덤 대회", "원주 포커 공지" etc.
**Fix:** Convert to Server Components using `async/await` + Suspense, or add `generateStaticParams` + ISR. The data-fetching logic in `getTournaments()` and `getNotices()` already uses server actions — just call them at the page level as a server component.
**Falsifiability:** After fix, WebFetch should return actual tournament/notice data, not a loading state.
**Monitor:** Google Search Console → Coverage → Crawled - currently not indexed.

```tsx
// Before (CSR):
'use client'
export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([])
  useEffect(() => { getTournaments().then(setTournaments) }, [])
}

// After (SSR):
import { getTournaments } from '@/lib/actions/tournaments'
export default async function TournamentsPage() {
  const tournaments = await getTournaments()
  return <TournamentList tournaments={tournaments} />
}
```

#### C2: Duplicate Page Titles on /tournaments and /notices
**First principle:** Google uses title tags for ranking signals. Duplicate titles dilute relevance.
**Impact:** Both pages show "FLOP POKER CLUB | 원주 No.1 홀덤 포커 VIP 멤버십" — identical to homepage. Google may ignore or rewrite these.
**Fix:** Export `metadata` from each page with unique titles and descriptions.
**Falsifiability:** After fix, `curl -s https://flop-poker-club.vercel.app/tournaments | grep '<title>'` returns a unique title.

```tsx
// app/(user)/tournaments/page.tsx
export const metadata: Metadata = {
  title: '토너먼트 대회 일정',
  description: 'FLOP 포커클럽 원주 정기 토너먼트 일정 및 참가 접수. 데일리 토너먼트 매일 19:00 진행.',
}

// app/(user)/notices/page.tsx
export const metadata: Metadata = {
  title: '클럽 공지 & 소식',
  description: 'FLOP 포커클럽 원주의 최신 공지사항, 이벤트, 클럽 소식을 확인하세요.',
}
```
> Note: Since the layout is `'use client'`, metadata must be exported from the page file itself (server component metadata boundary). Consider extracting the layout shell into a separate server component wrapper.

#### C3: /terms Title Double-Brands
**Impact:** Title renders as "이용약관 | FLOP POKER CLUB | FLOP POKER CLUB" — the template `%s | FLOP POKER CLUB` was applied to a title that already included the brand name.
**Fix:** Change the terms page title to just "이용약관" (the template appends the brand automatically).
**Falsifiability:** `curl` the page title shows single brand name.

---

### 🟠 HIGH — Fix Within 1 Week

#### H1: No Phone Number (NAP Incomplete)
**First principle:** Google's local ranking algorithm requires NAP (Name, Address, Phone) consistency.
**Impact:** Phone number is absent from: homepage content, JSON-LD schema, privacy policy contact, footer. This is the #1 local SEO signal gap.
**Fix:** Add phone to homepage footer, JSON-LD `telephone` field, and privacy policy contact section.
**Falsifiability:** Google Business Profile NAP matches website NAP after fix.

```ts
// In localBusinessJsonLd (app/layout.tsx):
telephone: '+82-10-XXXX-XXXX',  // Add real phone number
```

#### H2: Duplicate H1 on Homepage
**Impact:** Two H1 tags ("FLOP POKER CLUB" and "WONJU NO.1 HIGH ROLLER POKER CLUB") confuse Google's document outline. Only one H1 per page.
**Fix:** Demote "WONJU NO.1 HIGH ROLLER POKER CLUB" to `<h2>` or `<p>` with appropriate styling.
**Falsifiability:** `document.querySelectorAll('h1').length === 1` on homepage.

#### H3: Missing Event Schema on /tournaments
**First principle:** Google shows tournament/event rich results in SERP for sports/entertainment with Event schema.
**Impact:** Tournament data is not eligible for event rich snippets.
**Fix:** When tournaments are SSR'd (fix C1 first), wrap each tournament in Event schema.

```tsx
const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsEvent',
  name: tournament.title,
  startDate: tournament.start_at,
  location: {
    '@type': 'Place',
    name: 'FLOP POKER CLUB',
    address: '강원특별자치도 원주시 서원대로 172, 3층'
  },
  organizer: { '@type': 'Organization', name: 'FLOP POKER CLUB' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW', availability: 'https://schema.org/InStock' }
}
```

#### H4: AI Crawler Blocking Hurts GEO
**First principle:** AI search features (Google SGE/AI Overviews, ChatGPT browse, Perplexity) surface local businesses via their training data and live crawls. Blocking all AI crawlers = invisible to AI-driven discovery.
**Impact:** When someone asks ChatGPT "원주 홀덤 클럽 추천", FLOP cannot appear. Google-Extended blocking may reduce AI Overview visibility.
**Recommendation:** Selectively allow Google-Extended (Google AI Overviews directly benefits rankings). Consider allowing Perplexity bots.
**Trade-off:** This exposes content to AI training data. Decision is yours based on content sensitivity preference.

---

### 🟡 MEDIUM — Fix Within 1 Month

#### M1: BarOrPub Schema Type May Be Suboptimal
**Current:** `@type: "BarOrPub"` in JSON-LD.
**Issue:** A poker club is more accurately an `EntertainmentBusiness` or `SportsActivityLocation`. Using `BarOrPub` is technically registered with the Korean business authority as 음식점업 (restaurant) — so it's not wrong legally, but semantically misleads search engines about the primary activity.
**Recommendation:** Change to `EntertainmentBusiness` as the primary type. Keep it legally neutral.

#### M2: /landing in robots.txt But Not in Sitemap
**Observation:** robots.txt allows `/landing` but it's absent from sitemap.xml.
**Fix:** Either add `/landing` to sitemap (if it's a public SEO page) or remove it from the Allow list in robots.txt.

#### M3: Missing Meta Descriptions on Inner Pages
**Pages affected:** /tournaments, /notices (inherit root description — wrong content).
**Fix:** Covered by C2 fix above — add page-specific descriptions.

#### M4: No BreadcrumbList Schema
**Benefit:** Breadcrumbs appear in SERP, improve CTR.
**Fix:** Add BreadcrumbList JSON-LD to inner pages:
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://flop-poker-club.vercel.app" },
    { "@type": "ListItem", "position": 2, "name": "토너먼트", "item": "https://flop-poker-club.vercel.app/tournaments" }
  ]
}
```

#### M5: No llms.txt for AI Search
**Impact:** AI assistants that respect llms.txt (Perplexity, Claude, emerging ecosystem) have no structured summary of the site.
**Fix:** Create `public/llms.txt` with:
```
# FLOP POKER CLUB
> 강원 원주 최고급 홀덤 포커 마인드 스포츠 클럽 멤버십 서비스.

## 클럽 정보
- 주소: 강원특별자치도 원주시 서원대로 172, 3층(단계동)
- 영업시간: 매일 18:00 ~ 익일 06:00
- 신규 가입 혜택: 5,000P 웰컴 포인트 즉시 지급

## 주요 서비스
- 데일리 토너먼트 매일 19:00
- QR 출입 인증 시스템
- 투명한 포인트 원장 시스템
```

#### M6: Naver Maps / Kakao Maps Citations Missing
**First principle:** In Korea, Naver search holds ~60%+ market share. Local businesses must be verified on Naver Place and Kakao Maps.
**Fix:** Register on: Naver 스마트 플레이스 (smartplace.naver.com), Kakao 사업자 (kakaobusiness.com). Use exact same NAP as website.

#### M7: FAQ Section Should Not Use FAQPage Schema
**Note:** FAQPage schema no longer produces Google rich results (deprecated May 7, 2026). The FAQ section on the homepage should use `QAPage` if keeping schema, or remove schema entirely — Google will not show FAQ rich snippets regardless.

---

### 🔵 LOW — Backlog

#### L1: No Google Business Profile Signals
Create and verify GBP listing. This is the most impactful single action for local map pack rankings. Add: photos of the space, post weekly tournament schedules, respond to reviews.

#### L2: Internal Linking — /notices Links Not Permanent
Notice articles likely don't have individual permalink pages (`/notices/[id]`). Each notice being its own indexable URL would help for long-tail keyword coverage.

#### L3: Image Alt Text Unknown
The hero image and card images could not be audited (CSR render). After converting to SSR, audit alt text on all images.

#### L4: No Korean Language hreflang
Site is Korean-only; `hreflang="ko"` and `hreflang="ko-KR"` should be set explicitly on all pages to avoid mixed-language confusion.

---

## Local SEO Assessment

| Factor | Status | Score |
|---|---|---|
| Address in content | ✅ Present | 10/10 |
| Phone number | ❌ Missing | 0/10 |
| Business hours | ✅ Present | 10/10 |
| Map/directions | ✅ Section present | 8/10 |
| Google Business Profile | ❓ Unknown | 0/10 |
| Naver Place / Kakao Maps | ❓ Unknown | 0/10 |
| Local keyword targeting | ✅ "원주 홀덤", "원주 포커" in content | 7/10 |
| Local schema | ⚠️ BarOrPub (questionable type) | 5/10 |
| Review signals | ❌ None visible | 0/10 |
| NAP consistency | ⚠️ Incomplete (no phone) | 4/10 |

**Local SEO Score: 44/100**

The single highest-impact local action is adding a phone number to the site and schema.

---

## GEO (AI Search Readiness) Assessment

| Signal | Status |
|---|---|
| llms.txt | ❌ Missing |
| AI crawlers (GPTBot) | ❌ Blocked |
| AI crawlers (Google-Extended) | ❌ Blocked |
| Structured factual content | ✅ Address, hours, pricing clear |
| E-E-A-T signals | ⚠️ Business registration shown; no reviews, no author bios |
| Citability (unique facts) | ✅ Hand bonuses, point system details, QR access system |

**GEO Score: 25/100** — Blocking all AI crawlers is the primary drag on this score.

---

## Technical SEO Checklist

| Check | Status |
|---|---|
| HTTPS | ✅ |
| robots.txt valid | ✅ |
| sitemap.xml valid | ✅ |
| Canonical tags | ✅ (metadataBase set) |
| Homepage TTFB | ✅ ~206ms |
| HTML size | ✅ 68KB |
| noindex on auth pages | ✅ (layout + proxy.ts) |
| noindex on member pages | ✅ (x-robots-tag via proxy.ts) |
| Duplicate page titles | ❌ /tournaments + /notices |
| Duplicate H1 | ❌ Homepage has 2x H1 |
| CSR-only public pages | ❌ /tournaments + /notices |
| /landing in sitemap | ❌ Missing |
| Terms title duplication | ❌ Double brand name |
| Phone number present | ❌ Missing site-wide |
| Event schema | ❌ Missing |
| BreadcrumbList schema | ❌ Missing |
| llms.txt | ❌ Missing |

---

## Performance Estimate

Platform: Next.js App Router on Vercel (auto-region routing, Korean users likely routed to Tokyo/Seoul POP)

| Metric | Estimate | Target |
|---|---|---|
| LCP | ~1.8s | < 2.5s ✅ |
| INP | ~60ms | < 200ms ✅ |
| CLS | ~0.05 | < 0.1 ✅ |
| TTFB | 206ms measured | < 800ms ✅ |
| FCP | ~0.9s | < 1.8s ✅ |

> Estimates are based on platform capabilities. Add Google API key to run actual CrUX field data.
