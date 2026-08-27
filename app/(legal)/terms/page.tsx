import type { Metadata } from 'next'
import { BUSINESS_INFO } from '@/lib/constants/business'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'FLOP POKER CLUB 멤버십 이용약관',
}

const SECTIONS = [
  {
    title: '제1조 (목적)',
    content: `이 약관은 ${BUSINESS_INFO.companyName}(이하 "클럽")이 운영하는 FLOP POKER CLUB 멤버십 앱(이하 "서비스")의 이용 조건 및 절차, 클럽과 회원 간의 권리·의무·책임 사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: '제2조 (정의)',
    content: `① "서비스"란 클럽이 제공하는 멤버십 포인트 관리, QR 출입 인증, 토너먼트 관리, 공지 안내 등 일체의 기능을 말합니다.
② "회원"이란 이 약관에 동의하고 온보딩을 완료하여 서비스를 이용하는 자를 말합니다.
③ "포인트"란 클럽 내 서비스 이용에 사용 가능한 가상 자산으로, 현금 또는 재화와 교환되지 않습니다.`,
  },
  {
    title: '제3조 (이용 자격)',
    content: `① 서비스는 만 19세 이상 성인만 이용할 수 있습니다.
② 대한민국 현행법상 합법적인 마인드 스포츠(홀덤 포커)를 즐기려는 자에 한합니다.
③ 미성년자가 허위로 가입한 경우 클럽은 즉시 회원 자격을 박탈할 수 있습니다.`,
  },
  {
    title: '제4조 (회원 가입 및 온보딩)',
    content: `① 회원은 Google 계정으로 소셜 로그인 후 이름, 닉네임, 휴대폰 번호를 입력하여 가입합니다.
② 온보딩 완료 시 1회에 한해 웰컴 보너스 포인트가 지급됩니다.
③ 허위 정보를 입력한 경우 서비스 이용이 제한되며, 이로 인한 불이익은 회원 본인이 부담합니다.`,
  },
  {
    title: '제5조 (포인트 정책)',
    content: `① 포인트는 클럽 내 지정 서비스 이용에만 사용할 수 있으며, 현금 교환·양도·거래는 불가합니다.
② 포인트 적립은 아래 경우에 한합니다.
  • 신규 멤버십 웰컴 보너스 (5,000P, 최초 1회)
  • 투핸드 포카드, 스트레이트 플러시, 로열 플러시 인증
  • 토너먼트 입상
  • 클럽 운영 이벤트
③ 포인트는 스태프 또는 관리자가 QR 스캐너로 승인한 경우에만 확정 적립됩니다.
④ 회원 탈퇴 시 잔여 포인트는 즉시 소멸됩니다.
⑤ 클럽 운영 정책에 따라 포인트 적립 기준은 변경될 수 있으며, 변경 시 사전 공지합니다.`,
  },
  {
    title: '제6조 (금지 행위)',
    content: `회원은 아래 행위를 절대 해서는 안 됩니다.

① 포인트 또는 칩의 현금 환전, P2P 장외 매매·거래
② 타인의 계정 도용 또는 허위 정보 등록
③ 부정한 방법(해킹, 매크로, 어뷰징 등)으로 포인트 취득 시도
④ 클럽 운영 방해, 딜러·스태프에 대한 부당 행위
⑤ 관련 법령에 위반되는 도박·사행 행위

위반 시 클럽은 사전 통보 없이 즉시 멤버십을 정지하고 적립 포인트 전액을 몰수할 수 있으며, 필요한 경우 법적 조치를 취할 수 있습니다.`,
  },
  {
    title: '제7조 (서비스 이용 제한 및 해지)',
    content: `① 클럽은 회원이 제6조를 위반하거나 서비스의 정상 운영을 방해하는 경우 이용을 제한할 수 있습니다.
② 회원은 언제든지 스태프에게 요청하여 회원 탈퇴(서비스 해지)를 할 수 있습니다.
③ 탈퇴 시 포인트 및 개인정보는 관련 법령이 정한 기간 경과 후 파기됩니다.`,
  },
  {
    title: '제8조 (서비스의 변경 및 중단)',
    content: `① 클럽은 서비스의 내용·이용 방법·이용 시간을 변경할 수 있습니다.
② 천재지변, 시스템 장애, 긴급 점검 등 불가피한 사유로 서비스를 중단할 수 있으며, 이에 대한 사전 또는 사후 공지를 합니다.
③ 위 사유로 인한 이용 손해에 대해 클럽은 책임을 지지 않습니다.`,
  },
  {
    title: '제9조 (면책)',
    content: `① 클럽은 회원의 귀책 사유로 발생한 손해에 대해 책임을 지지 않습니다.
② 클럽은 회원 간 또는 회원과 제3자 간 분쟁에 개입하지 않으며, 이로 인한 손해를 배상할 의무가 없습니다.
③ 무료로 제공되는 서비스 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 클럽은 손해배상 책임을 지지 않습니다.`,
  },
  {
    title: '제10조 (약관의 변경)',
    content: `① 클럽은 관련 법령 및 서비스 정책 변경에 따라 약관을 개정할 수 있습니다.
② 약관 변경 시 시행 7일 전 앱 내 공지사항을 통해 고지합니다.
③ 이용자가 변경 약관의 효력 발생일 이후에도 서비스를 계속 이용할 경우 개정 약관에 동의한 것으로 봅니다.`,
  },
  {
    title: '제11조 (준거법 및 관할)',
    content: `이 약관은 대한민국 법령에 따라 해석되며, 서비스 이용으로 발생한 분쟁에 대해서는 클럽의 소재지를 관할하는 법원(춘천지방법원 원주지원)을 제1심 관할 법원으로 합니다.`,
  },
]

export default function TermsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E6AF2E]/20 pb-6">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#F5D061] border border-[#E6AF2E]/30 px-2 py-0.5 rounded-full">
            LEGAL
          </span>
        </div>
        <h1 className="font-serif text-2xl font-black text-white">멤버십 이용약관</h1>
        <div className="text-xs text-[#9CA3AF] space-y-0.5">
          <p>시행일: 2026년 07월 15일 &nbsp;|&nbsp; 버전: v1.0</p>
          <p>
            FLOP POKER CLUB 멤버십 서비스에 가입하시면 아래 약관에 동의하시는 것으로 간주됩니다.
            가입 전 반드시 내용을 확인해 주시기 바랍니다.
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
