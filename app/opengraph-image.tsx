import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FLOP POKER CLUB 원주 VIP 멤버십 라운지'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #08090D 0%, #181A28 50%, #0F101A 100%)',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* 배경 글로우 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(230,175,46,0.12) 0%, transparent 70%)',
          }}
        />

        {/* 상단 배지 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(245,208,97,0.4)',
            borderRadius: 999,
            padding: '6px 20px',
            marginBottom: 32,
            background: 'rgba(42,35,18,0.8)',
          }}
        >
          <span style={{ color: '#F5D061', fontSize: 13, letterSpacing: '0.2em', fontFamily: 'monospace' }}>
            WONJU NO.1 HIGH ROLLER POKER CLUB
          </span>
        </div>

        {/* 스페이드 아이콘 */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #F5D061, #C28B1E)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
            fontSize: 44,
            color: '#08090D',
            fontWeight: 900,
          }}
        >
          ♠
        </div>

        {/* 브랜드명 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '0.06em',
            marginBottom: 16,
          }}
        >
          FLOP POKER CLUB
        </div>

        {/* 서브타이틀 */}
        <div
          style={{
            fontSize: 28,
            color: '#F3E5AB',
            fontWeight: 700,
            marginBottom: 40,
            letterSpacing: '0.04em',
          }}
        >
          강원 원주 최고급 홀덤 포커 VIP 멤버십
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: 120,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #E6AF2E, transparent)',
            marginBottom: 32,
          }}
        />

        {/* 혜택 태그 3개 */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['신규 5,000P 웰컴 보너스', '데일리 토너먼트', 'QR 출입 인증'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'rgba(230,175,46,0.15)',
                border: '1px solid rgba(230,175,46,0.35)',
                borderRadius: 8,
                padding: '8px 18px',
                color: '#F5D061',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 하단 주소 */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            color: 'rgba(156,163,175,0.8)',
            fontSize: 15,
            letterSpacing: '0.05em',
          }}
        >
          강원특별자치도 원주시 서원대로 172, 3층 · 매일 18:00 ~ 익일 06:00
        </div>
      </div>
    ),
    { ...size }
  )
}
