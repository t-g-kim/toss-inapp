import React, { useState } from "react";
import { TossHeader, TossCard, TossBadge, AdBanner } from "@shared/index";
import {
  Sparkles,
  Dice5,
  Calculator,
  Moon,
  Coins,
  Heart,
  Receipt,
  ChevronRight,
  Smartphone,
  Flame,
  Award,
  Type,
  LayoutGrid,
  Clock,
  Music,
  Cpu,
  PcCase,
  Bed,
  Gift,
  Monitor,
} from "lucide-react";

export type AppId =
  | "gohyang-gift"
  | "lotto-filter"
  | "salary-hero"
  | "my-fortune-tarot"
  | "subsidy-calc"
  | "make-my-pc"
  | "make-my-desk"
  | "room-fit"
  | "cy-mini"
  | "insta-clean"
  | "feed-preview"
  | "insta-time"
  | "story-music"
  | "money-match"
  | "spending-receipt";

interface PortalHubProps {
  onSelectApp: (appId: AppId) => void;
}

interface MiniAppMeta {
  id: AppId;
  title: string;
  category: string;
  badge: { text: string; variant: "blue" | "green" | "purple" | "orange" | "red" };
  desc: string;
  iconBg: string;
  icon: React.ReactNode;
  revenueType: string;
}

const APPS: MiniAppMeta[] = [
  {
    id: "gohyang-gift",
    title: "고향사랑 답례품 & 환급 계산기",
    category: "직장인/재테크",
    badge: { text: `${Math.max(new Date().getFullYear(), 2026)} 신설 혜택`, variant: "green" },
    desc: "10만원 기부 시 전액 환급 + 3만원 특산품 무료! 전국 인기 답례품 큐레이션 & 실시간 세액공제 계산",
    iconBg: "bg-emerald-600",
    icon: <Gift className="w-5 h-5 text-white" />,
    revenueType: "답례품 큐레이션 + 공식 기부 연동",
  },
  {
    id: "lotto-filter",
    title: "AI 행운 로또 번호",
    category: "행운/복권",
    badge: { text: "주간 트래픽 1위", variant: "blue" },
    desc: "빅데이터 통계·꿈 해몽·사주 행운 번호 조합 & 실시간 당첨 채점기",
    iconBg: "bg-amber-500",
    icon: <Dice5 className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 회전율 극대화",
  },
  {
    id: "salary-hero",
    title: "2026 연봉 실수령액 계산기",
    category: "직장인/재테크",
    badge: { text: "2026 개정세법", variant: "green" },
    desc: "최신 4대보험 & 간이세액표 완벽 반영, 연봉 1,000만 인상 시 비교",
    iconBg: "bg-blue-600",
    icon: <Calculator className="w-5 h-5 text-white" />,
    revenueType: "전면 광고 + 협상 리포트 1,900원",
  },
  {
    id: "my-fortune-tarot",
    title: "오늘의 행운 부적 & AI 사주 타로",
    category: "운세/타로",
    badge: { text: "매일 아침 루틴", variant: "purple" },
    desc: "오늘의 운세 점수, 타로 카드 드로우 및 액운 방지 황금 부적 발급",
    iconBg: "bg-indigo-700",
    icon: <Moon className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + 신년 대운 1,900원",
  },
  {
    id: "subsidy-calc",
    title: "지원금 모의 계산기",
    category: "공공복지/모의계산",
    badge: { text: "최신 복지 기준", variant: "green" },
    desc: "연령·소득·신분별 K패스, 청년도약계좌 등 주요 정부지원금 모의 계산",
    iconBg: "bg-emerald-600",
    icon: <Coins className="w-5 h-5 text-white" />,
    revenueType: "광고 시청 + 서류 가이드 990원",
  },
  {
    id: "make-my-pc",
    title: "가상 PC 조립 견적",
    category: "IT/유틸리티",
    badge: { text: "게임 벤치마크", variant: "orange" },
    desc: "CPU·GPU 부품 호환성 체크, 100만~300만 황금 견적 & 게임 FPS 측정",
    iconBg: "bg-blue-600",
    icon: <PcCase className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + 조립 보증서 990원",
  },
  {
    id: "make-my-desk",
    title: "데스크 셋업 견적기",
    category: "생활/인테리어",
    badge: { text: "데스크테리어", variant: "purple" },
    desc: "30만~220만 맞춤 데스크 세팅, 모니터암 하중 호환 진단 & 쿠팡 최저가",
    iconBg: "bg-indigo-600",
    icon: <Monitor className="w-5 h-5 text-white" />,
    revenueType: "쿠팡 파트너스 + 최저가 연계",
  },
  {
    id: "room-fit",
    title: "원룸 가구 배치 3D",
    category: "생활/인테리어",
    badge: { text: "문 간섭 진단", variant: "blue" },
    desc: "5·7·10평 원룸 침대·책상 가상 배치 & 방문 개폐 충돌 1초 감지",
    iconBg: "bg-blue-600",
    icon: <Bed className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + 체크리스트 990원",
  },
  {
    id: "cy-mini",
    title: "미니룸",
    category: "레트로/SNS",
    badge: { text: "Y2K 도트룸", variant: "orange" },
    desc: "추억의 미니홈피 도트 가구 꾸미기 & 프리스타일 Y 감성 BGM 주크박스",
    iconBg: "bg-orange-500",
    icon: <Sparkles className="w-5 h-5 text-white" />,
    revenueType: "보상형 오리알 충전 + Y2K 팩 990원",
  },
  {
    id: "insta-clean",
    title: "인스타 줄바꿈 감성 폰트",
    category: "소셜/크리에이터",
    badge: { text: "인스타 필수템", variant: "purple" },
    desc: "본문 줄바꿈 깨짐 1초 방지 + 20종 감성 영문 폰트 & 특수문자",
    iconBg: "bg-purple-600",
    icon: <Type className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + VIP 폰트팩 990원",
  },
  {
    id: "feed-preview",
    title: "인스타 피드 미리보기",
    category: "소셜/크리에이터",
    badge: { text: "9칸 바둑판", variant: "orange" },
    desc: "사진 올리기 전 3x3 바둑판 격자 배치 & 톤앤매너 96% 조화도 점검",
    iconBg: "bg-rose-500",
    icon: <LayoutGrid className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + 하이라이트팩 990원",
  },
  {
    id: "insta-time",
    title: "인스타 골든타임",
    category: "소셜/크리에이터",
    badge: { text: "도달률 2배", variant: "orange" },
    desc: "오늘 요일·카테고리별 실시간 피크 시간대 & 알고리즘 꿀 해시태그 15선",
    iconBg: "bg-rose-600",
    icon: <Clock className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + 골든캘린더 990원",
  },
  {
    id: "story-music",
    title: "감성 음악 카드",
    category: "소셜/크리에이터",
    badge: { text: "스토리 9:16", variant: "purple" },
    desc: "인스타 스토리에 올릴 앨범 커버 + 재생바 + 감성 가사 카드 제작",
    iconBg: "bg-violet-600",
    icon: <Music className="w-5 h-5 text-white" />,
    revenueType: "보상형 광고 + VIP 테마 990원",
  },
  {
    id: "money-match",
    title: "친구 연인 금전 궁합 측정기",
    category: "바이럴/심리",
    badge: { text: "SNS 공유 폭발", variant: "orange" },
    desc: "친구·연인과의 더치페이 & 탕진 지수 측정 및 찰떡궁합 판독",
    iconBg: "bg-pink-600",
    icon: <Heart className="w-5 h-5 text-white" />,
    revenueType: "친구 바이럴 + 비밀 조언 990원",
  },
  {
    id: "spending-receipt",
    title: "무지출 & 팩폭 소비 영수증",
    category: "짠테크/가계부",
    badge: { text: "인스타 스토리 인기", variant: "gray" },
    desc: "오늘 쓴 돈 감성 영수증 출력 + AI 팩폭 심사위원의 촌철살인 평가",
    iconBg: "bg-slate-800",
    icon: <Receipt className="w-5 h-5 text-white" />,
    revenueType: "영수증 저장 광고 + 복리 리포트",
  },
];

export const PortalHub: React.FC<PortalHubProps> = ({ onSelectApp }) => {
  const [filterCat, setFilterCat] = useState<string>("ALL");

  const categories = ["ALL", "레트로/SNS", "행운/복권", "직장인/재테크", "투자/금융 퀀트", "바이럴/심리"];

  const filteredApps = APPS.filter((app) => {
    if (filterCat === "ALL") return true;
    if (filterCat === "레트로/SNS") return app.category === "레트로/SNS" || app.category === "소셜/크리에이터";
    if (filterCat === "행운/복권") return app.category === "행운/복권" || app.category === "운세/타로";
    if (filterCat === "직장인/재테크") return app.category === "직장인/재테크" || app.category === "공공복지/환급" || app.category === "짠테크/가계부";
    if (filterCat === "투자/금융 퀀트") return app.category === "투자/금융 퀀트" || app.category === "배당/패시브인컴" || app.category === "기술적 분석";
    if (filterCat === "바이럴/심리") return app.category === "바이럴/심리" || app.category === "운세/타로";
    return true;
  });

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="토스 인앱 스튜디오"
        subtitle="Apps in Toss 수익화 프로토타입 런처"
        rightAction={<TossBadge variant="blue">총 {APPS.length}개 앱</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Banner */}
        <TossCard
          padding="lg"
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-blue-200 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> 3,000만 토스 유저 타깃
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold">
              AdMob + TossPay
            </span>
          </div>

          <h3 className="text-2xl font-black mt-2">토스 인앱 수익화 올인원</h3>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            원클릭 웹뷰 환경에서 고단가 금융 광고와 토스페이 소액결제를 발생시키는 9개의 고수익 미니앱 모음입니다.
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-200">
            <span>✓ 실시간 보상형 광고 시뮬레이터</span>
            <span>✓ 토스페이 1초 결제창 연동</span>
          </div>
        </TossCard>

        {/* Category Pill Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                filterCat === cat
                  ? "bg-toss-blue text-white shadow-xs"
                  : "bg-white text-toss-subtext hover:bg-gray-100 border border-toss-border/60"
              }`}
            >
              {cat === "ALL" ? "전체 보기" : cat}
            </button>
          ))}
        </div>

        {/* App Cards List */}
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <TossCard
              key={app.id}
              padding="md"
              onClick={() => onSelectApp(app.id)}
              className="hover:border-toss-blue/60 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${app.iconBg}`}
                  >
                    {app.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-base text-toss-text group-hover:text-toss-blue transition">
                        {app.title}
                      </h4>
                      <TossBadge variant={app.badge.variant} size="sm">
                        {app.badge.text}
                      </TossBadge>
                    </div>
                    <p className="text-xs text-toss-subtext mt-1 leading-relaxed">{app.desc}</p>
                    <div className="mt-2 text-[11px] text-toss-muted font-medium flex items-center gap-1">
                      <span className="text-amber-600 font-semibold">💰 수익 모델:</span>
                      <span>{app.revenueType}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-toss-blue shrink-0 mt-3 transition group-hover:translate-x-0.5" />
              </div>
            </TossCard>
          ))}
        </div>

        <AdBanner
          title="토스 증권 해외주식 소수점 투자"
          subtitle="1,000원으로 테슬라, 애플 주주 되기"
        />
      </div>
    </div>
  );
};
