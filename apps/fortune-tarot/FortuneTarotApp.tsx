import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Sparkles, Moon, Sun, Download, Share2, Shield, Heart, Coins, Briefcase } from "lucide-react";
import confetti from "canvas-confetti";

interface FortuneTarotAppProps {
  onBack?: () => void;
}

interface TarotCard {
  id: number;
  name: string;
  keyword: string;
  shortDesc: string;
  detailDesc: string;
  talismanAdvice: string;
  icon: string;
  color: string;
}

const TAROT_DECK: TarotCard[] = [
  {
    id: 1,
    name: "The Sun (태양)",
    keyword: "성공과 최고의 행운",
    shortDesc: "어둠이 걷히고 당신의 노력이 결실을 맺는 날입니다.",
    detailDesc: "오늘은 당신의 에너지와 매력이 극대화되는 날입니다. 미뤄뒀던 계약, 중요한 미팅, 주식 매수/매도 등 결단이 필요한 순간에 과감하게 행동하세요. 금전운이 특히 상승세에 있습니다.",
    talismanAdvice: "황금빛 에너지를 품은 해바라기 부적이 액운을 태워 없앱니다.",
    icon: "☀️",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: 2,
    name: "The Wheel of Fortune (운명의 수레바퀴)",
    keyword: "뜻밖의 반전과 횡재수",
    shortDesc: "정체되어 있던 흐름이 갑작스러운 기회로 바뀝니다.",
    detailDesc: "예상치 못한 소식이나 잊고 있던 돈이 들어올 수 있는 길일입니다. 인연의 흐름도 좋습니다. 단, 즉흥적인 충동구매보다는 준비된 기회에 베팅하는 것이 현명합니다.",
    talismanAdvice: "네잎클로버와 황금 나침반 부적이 당신을 올바른 선택으로 이끕니다.",
    icon: "🎡",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 3,
    name: "The Star (별)",
    keyword: "희망과 영감, 평온",
    shortDesc: "마음의 불안이 가라앉고 맑은 통찰력을 얻습니다.",
    detailDesc: "스스로를 믿어도 좋은 날입니다. 주변의 소음에 흔들리지 않고 당신만의 원칙을 지킬 때 가장 큰 이익이 따라옵니다. 오늘 떠오르는 직관이나 아이디어를 꼭 메모해두세요.",
    talismanAdvice: "칠성신 북두칠성 부적이 당신의 재물길을 환하게 밝힙니다.",
    icon: "⭐",
    color: "from-purple-500 to-pink-500",
  },
];

export const FortuneTarotApp: React.FC<FortuneTarotAppProps> = ({ onBack }) => {
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [unlockedDetail, setUnlockedDetail] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Daily lucky info
  const luckyInfo = {
    score: 94,
    color: "네이비 & 골드",
    number: "7, 18",
    direction: "동남쪽",
    food: "따뜻한 국밥 / 소고기",
    beware: "충동적인 야식 배달 주문",
  };

  const handlePickCard = (card: TarotCard) => {
    setSelectedCard(card);
    setIsFlipped(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleResetCard = () => {
    setSelectedCard(null);
    setIsFlipped(false);
    setUnlockedDetail(false);
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="오늘의 행운 부적 & AI 사주 타로"
        subtitle="매일 아침 나를 지켜주는 기운"
        onBack={onBack}
        rightAction={<TossBadge variant="purple">오늘의 운세</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Daily Fortune Overview */}
        <TossCard padding="lg" className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 2026년 오늘 나의 기운
            </span>
            <span className="text-xs bg-indigo-500/30 px-2 py-0.5 rounded-full border border-indigo-400/30 text-indigo-200">
              대길(大吉)
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-amber-300">{luckyInfo.score}</span>
            <span className="text-sm text-gray-300">/ 100점</span>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
            <div className="bg-white/10 p-2 rounded-xl">
              <Coins className="w-4 h-4 mx-auto text-amber-300 mb-1" />
              <span className="text-[11px] text-gray-300 block">재물운</span>
              <span className="text-xs font-bold text-white">96점</span>
            </div>
            <div className="bg-white/10 p-2 rounded-xl">
              <Heart className="w-4 h-4 mx-auto text-rose-300 mb-1" />
              <span className="text-[11px] text-gray-300 block">애정운</span>
              <span className="text-xs font-bold text-white">88점</span>
            </div>
            <div className="bg-white/10 p-2 rounded-xl">
              <Briefcase className="w-4 h-4 mx-auto text-blue-300 mb-1" />
              <span className="text-[11px] text-gray-300 block">직업운</span>
              <span className="text-xs font-bold text-white">92점</span>
            </div>
          </div>
        </TossCard>

        {/* Lucky Triggers Card */}
        <TossCard title="오늘의 행운 비결">
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="bg-toss-bg p-3 rounded-xl">
              <span className="text-toss-muted block mb-0.5">행운의 컬러</span>
              <span className="font-bold text-toss-text">{luckyInfo.color}</span>
            </div>
            <div className="bg-toss-bg p-3 rounded-xl">
              <span className="text-toss-muted block mb-0.5">행운의 번호</span>
              <span className="font-bold text-toss-blue">{luckyInfo.number}</span>
            </div>
            <div className="bg-toss-bg p-3 rounded-xl">
              <span className="text-toss-muted block mb-0.5">추천 음식</span>
              <span className="font-bold text-toss-text">{luckyInfo.food}</span>
            </div>
            <div className="bg-toss-bg p-3 rounded-xl">
              <span className="text-toss-muted block mb-0.5">조심할 것</span>
              <span className="font-bold text-toss-red">{luckyInfo.beware}</span>
            </div>
          </div>
        </TossCard>

        {/* Tarot Card Drawing Area */}
        <TossCard
          title="🃏 오늘의 타로 카드 한 장 뽑기"
          subtitle={selectedCard ? "당신이 선택한 카드의 계시" : "마음을 가다듬고 카드 한 장을 터치하세요"}
          badge={<TossBadge variant="blue">1일 1회</TossBadge>}
        >
          {!selectedCard ? (
            <div className="py-4">
              <div className="flex justify-center gap-3">
                {TAROT_DECK.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handlePickCard(card)}
                    className="w-24 h-36 bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 border-2 border-indigo-400/40 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg active-press transition hover:-translate-y-1 hover:shadow-indigo-500/20"
                  >
                    <div className="w-8 h-8 rounded-full border border-amber-300/60 flex items-center justify-center text-amber-300 text-xs font-bold mb-2">
                      ✦
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-200">CARD #{idx + 1}</span>
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-toss-muted mt-4">
                가장 마음이 끌리는 카드를 선택하세요
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-2 animate-fade-in">
              {/* Selected Card Front */}
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedCard.color} text-white text-center shadow-xl`}>
                <div className="text-4xl mb-2">{selectedCard.icon}</div>
                <h4 className="text-xl font-black">{selectedCard.name}</h4>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mt-1">
                  {selectedCard.keyword}
                </span>
                <p className="text-sm text-white/95 mt-3 font-medium leading-relaxed">
                  "{selectedCard.shortDesc}"
                </p>
              </div>

              {/* Detailed Reading Unlock */}
              {unlockedDetail ? (
                <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl space-y-3 animate-fade-in text-xs">
                  <div>
                    <h5 className="font-bold text-amber-900 text-sm mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" /> 상세 해설 & 조언
                    </h5>
                    <p className="text-amber-950 leading-relaxed">{selectedCard.detailDesc}</p>
                  </div>

                  <div className="pt-2 border-t border-amber-200">
                    <h5 className="font-bold text-amber-900 text-xs mb-1 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" /> 오늘의 액운 방지 비방
                    </h5>
                    <p className="text-amber-800">{selectedCard.talismanAdvice}</p>
                  </div>

                  <TossButton
                    variant="primary"
                    size="sm"
                    onClick={() => alert("황금 부적 이미지가 갤러리에 저장되었습니다! (시뮬레이션)")}
                    className="bg-amber-600 hover:bg-amber-700 mt-2"
                  >
                    <Download className="w-4 h-4 mr-1 inline" /> 액운 방지 황금 부적 저장
                  </TossButton>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center space-y-3">
                  <p className="text-xs text-toss-subtext font-medium">
                    카드가 전하는 심층 조언과 오늘 액운을 막아주는 황금 부적을 확인해보세요.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <TossButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setAdModalOpen(true)}
                    >
                      광고 보고 부적 받기
                    </TossButton>
                    <TossButton
                      variant="primary"
                      size="sm"
                      onClick={() => setPayModalOpen(true)}
                    >
                      토스페이 1,900원 결제
                    </TossButton>
                  </div>
                </div>
              )}

              <button
                onClick={handleResetCard}
                className="w-full text-center text-xs text-toss-muted hover:text-toss-text underline py-1"
              >
                다른 카드 다시 뽑기
              </button>
            </div>
          )}
        </TossCard>

        <AdBanner
          title="한화생명 2030 맞춤형 저축보험"
          subtitle="연복리 비과세 혜택으로 목돈 굴리기 시작하세요"
        />
      </div>

      {/* Monetization Modals */}
      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="타로 심층 계시 및 황금 부적 발급"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => setUnlockedDetail(true)}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="2026 신년 대운 풀이 & 평생 소장 부적"
        price={1900}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => setUnlockedDetail(true)}
      />
    </div>
  );
};
