import type { Metadata } from 'next'
import { BUSINESS_INFO } from '@/lib/constants/business'

export const metadata: Metadata = {
  title: '개인정보처리방침 | FLOP POKER CLUB',
  description: 'FLOP POKER CLUB 개인정보처리방침',
}

const SECTIONS = [
  {
    title: '제1조 수집하는 개인정보 항목 및 수집 방법',
    content: `회사는 멤버십 서비스 제공을 위해 아래의 개인정보를 수집합니다.

【필수 항목】
• 이메일 주소 — Google OAuth 계정 식별 및 로그인 인증
• 이름(실명) — 본인 확인 및 멤버십 관리
• 클럽 닉네임 — 테이블 쇼다운·랭킹 표시
• 휴대폰 번호 — 클럽 공지 및 긴급 연락

【자동 수집 항목】
• Google 프로필 사진 — Google OAuth 연동 시 선택적으로 수집
• 포인트 거래 내역 — 서비스 이용 중 자동 기록
• 접속 일시 및 QR 스캔 기록 — 출입 인증 처리 목적

【수집 방법】
• Google 소셜 로그인(OAuth 2.0)
• 온보딩 폼 직접 입력
• QR 코드 스캐너 자동 수집`,
  },
  {
    title: '제2조 개인정보의 수집·이용 목적',
    content: `수집한 개인정보는 아래 목적 이외에는 이용하지 않으며, 목적이 변경될 경우 사전 동의를 받겠습니다.

① 멤버십 회원 식별 및 관리
② 포인트 적립·차감·조회 서비스 제공
③ QR 코드 기반 출입 인증
④ 토너먼트 참가 신청 및 결과 관리
⑤ 클럽 공지·이벤트 안내
⑥ 불법 환전·부정 포인트 취득 방지 및 분쟁 해결`,
  },
  {
    title: '제3조 개인정보의 보유 및 이용 기간',
    content: `회원 탈퇴 또는 동의 철회 시까지 보유하며, 탈퇴 즉시 파기합니다.
단, 관계 법령에 따라 아래 기간 동안 보존합니다.

• 전자상거래 계약·청약 철회 기록: 5년 (전자상거래법)
• 소비자 불만·분쟁 처리 기록: 3년 (전자상거래법)
• 접속 로그 기록: 3개월 (통신비밀보호법)`,
  },
  {
    title: '제4조 개인정보의 제3자 제공',
    content: `원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
다만, 인프라 운영을 위해 아래 수탁사에 처리를 위탁합니다.

• Google LLC — OAuth 인증 서비스 제공 (미국 소재, 국외 이전)
• Vercel Inc. — 웹 애플리케이션 서버 운영 (미국 소재, 국외 이전)
• Neon Inc. — 데이터베이스 호스팅 (미국 소재, 국외 이전)

위 수탁사는 서비스 제공 목적 범위 내에서만 개인정보를 처리하며, 별도의 개인정보 목적 외 이용은 금지됩니다.`,
  },
  {
    title: '제5조 이용자의 권리 및 행사 방법',
    content: `이용자는 언제든지 아래 권리를 행사할 수 있습니다.

① 개인정보 열람 요구
② 개인정보 정정·삭제 요구
③ 개인정보 처리 정지 요구
④ 동의 철회 (회원 탈퇴)

권리 행사는 FLOP POKER CLUB 매장 방문 또는 담당 스태프를 통해 요청하시면 지체 없이 처리합니다.
단, 법령에 의해 보존해야 하는 경우에는 삭제가 제한될 수 있습니다.`,
  },
  {
    title: '제6조 개인정보의 파기 절차 및 방법',
    content: `보유 기간 종료 또는 처리 목적 달성 후 지체 없이 파기합니다.

• 전자적 파일: 복구 불가능한 방법으로 영구 삭제
• 서면 자료: 분쇄 또는 소각`,
  },
  {
    title: '제7조 개인정보 보호책임자',
    content: `개인정보 처리에 관한 업무를 총괄하며, 이용자의 개인정보 관련 불만·피해 구제를 담당합니다.

성 명: ${BUSINESS_INFO.representative}
소 속: ${BUSINESS_INFO.companyName} 대표
연락처: 매장 직접 방문 또는 스태프 문의
주 소: ${BUSINESS_INFO.address}`,
  },
  {
    title: '제8조 개인정보 처리방침의 변경',
    content: `이 방침은 법령·정책·서비스 변경에 따라 개정될 수 있습니다.
변경 시 시행 7일 전 앱 내 공지사항을 통해 사전 고지합니다.
중요한 변경의 경우 30일 전 고지합니다.`,
  },
  {
    title: '제9조 권익 침해 구제 방법',
    content: `개인정보 침해로 인한 피해를 구제받으려면 아래 기관에 상담하실 수 있습니다.

• 개인정보분쟁조정위원회: www.kopico.go.kr / 1833-6972
• 개인정보침해신고센터: privacy.kisa.or.kr / (국번 없이) 118
• 대검찰청 사이버수사과: www.spo.go.kr / (국번 없이) 1301
• 경찰청 사이버안전국: ecrm.cyber.go.kr / (국번 없이) 182`,
  },
]

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E6AF2E]/20 pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#F5D061] border border-[#E6AF2E]/30 px-2 py-0.5 rounded-full">
            LEGAL
          </span>
        </div>
        <h1 className="font-serif text-2xl font-black text-white">개인정보처리방침</h1>
        <div className="text-xs text-[#9CA3AF] space-y-0.5">
          <p>시행일: 2026년 07월 15일 &nbsp;|&nbsp; 버전: v1.0</p>
          <p>
            {BUSINESS_INFO.companyName} (이하 &quot;회사&quot;)는 개인정보보호법 제30조에 따라
            이용자의 개인정보를 보호하고 관련 불만을 처리하기 위해 아래와 같이
            개인정보처리방침을 수립·공개합니다.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-white/5 bg-gradient-to-b from-[#131520] to-[#0D0E16] p-5 space-y-3"
          >
            <h2 className="text-sm font-bold text-[#F3E5AB]">{section.title}</h2>
            <p className="text-xs text-[#9CA3AF] leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-[#E6AF2E]/20 bg-[#0C0E14] p-4 text-[11px] text-zinc-500 space-y-1">
        <p className="font-semibold text-zinc-400">{BUSINESS_INFO.companyName}</p>
        <p>대표자: {BUSINESS_INFO.representative} &nbsp;|&nbsp; 사업자등록번호: {BUSINESS_INFO.businessNumber}</p>
        <p>{BUSINESS_INFO.address}</p>
      </div>
    </div>
  )
}
