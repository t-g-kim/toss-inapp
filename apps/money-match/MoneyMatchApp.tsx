import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Heart, Users, Sparkles, Share2, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import confetti from "canvas-confetti";

interface MoneyMatchAppProps {
  onBack?: () => void;
}

export const MoneyMatchApp: React.FC<MoneyMatchAppProps> = ({ onBack }) => {
  const [myName, setMyName] = useState("");
  const [friendName, setFriendName] = useState("");
  const [myStyle, setMyStyle] = useState("plan");
  const [friendStyle, setFriendStyle] = useState("yolo");
  const [isCalculated, setIsCalculated] = useState(false);
  const [unlockedAdvice, setUnlockedAdvice] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Score simulation logic
  const getScore = () => {
    if (myStyle === friendStyle) return 88;
    if ((myStyle === "saver" && friendStyle === "yolo") || (myStyle === "yolo" && friendStyle === "saver")) {
      return 58;
    }
    return 92;
  };

  const score = getScore();

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myName.trim() || !friendName.trim()) {
      alert("이름을 모두 입력해주세요!");
      return;
    }
    setIsCalculated(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "친구 연인 금전 궁합 측정기",
        text: `${myName}님과 ${friendName}님의 금전 궁합은 ${score}점입니다! 지금 확인해보세요.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert("공유 링크가 클립보드에 복사되었습니다!");
    }
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="친구 연인 금전 궁합 측정기"
        subtitle="우리 둘이 만나면 돈이 모일까? 샐까?"
        onBack={onBack}
        rightAction={<TossBadge variant="purple">바이럴 1위</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {!isCalculated ? (
          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Input Card */}
            <TossCard title="나와 친구 정보 입력" subtitle="생년월일과 성향으로 오행 금전 기운을 대조합니다">
              <div className="space-y-4 pt-2 text-xs">
                {/* Me */}
                <div className="p-3 bg-toss-bg rounded-2xl space-y-2">
                  <span className="font-bold text-toss-text text-sm block">나의 정보</span>
                  <input
                    type="text"
                    placeholder="내 이름 (예: 김철수)"
                    value={myName}
                    onChange={(e) => setMyName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-toss-border bg-white text-xs font-semibold focus:outline-none focus:border-toss-blue"
                  />
                  <div>
                    <label className="text-toss-muted block mb-1">나의 소비 성향</label>
                    <select
                      value={myStyle}
                      onChange={(e) => setMyStyle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-toss-border bg-white text-xs font-semibold"
                    >
                      <option value="saver">알뜰살뜰 자린고비 (무지출 지향)</option>
                      <option value="plan">계획적 가계부 작성형</option>
                      <option value="yolo">쓸 땐 시원하게 쓰는 욜로형</option>
                      <option value="impulse">스트레스 받으면 지르는 충동형</option>
                    </select>
                  </div>
                </div>

                {/* Friend */}
                <div className="p-3 bg-toss-bg rounded-2xl space-y-2">
                  <span className="font-bold text-toss-text text-sm block">상대방 정보 (친구 / 연인 / 동업자)</span>
                  <input
                    type="text"
                    placeholder="상대방 이름 (예: 이친구)"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-toss-border bg-white text-xs font-semibold focus:outline-none focus:border-toss-blue"
                  />
                  <div>
                    <label className="text-toss-muted block mb-1">상대방의 소비 성향</label>
                    <select
                      value={friendStyle}
                      onChange={(e) => setFriendStyle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-toss-border bg-white text-xs font-semibold"
                    >
                      <option value="saver">알뜰살뜰 자린고비 (무지출 지향)</option>
                      <option value="plan">계획적 가계부 작성형</option>
                      <option value="yolo">쓸 땐 시원하게 쓰는 욜로형</option>
                      <option value="impulse">스트레스 받으면 지르는 충동형</option>
                    </select>
                  </div>
                </div>

                <TossButton type="submit" variant="primary" size="lg">
                  <Sparkles className="w-5 h-5 mr-1 inline" /> 금전 궁합 점수 측정하기
                </TossButton>
              </div>
            </TossCard>
          </form>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Score Result Card */}
            <TossCard padding="lg" className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white text-center">
              <span className="text-xs text-purple-200 font-semibold">
                {myName} × {friendName} 금전 궁합
              </span>

              <div className="my-3">
                <span className="text-5xl font-black text-amber-300">{score}</span>
                <span className="text-lg text-gray-300 ml-1">점</span>
              </div>

              <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white mb-2">
                {score >= 80 ? "🏢 둘이 손잡고 빌딩 살 찰떡궁합!" : "💸 만나면 지갑 털리는 탕진 듀오 주의보!"}
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mt-2">
                {score >= 80
                  ? "한 사람의 추진력과 다른 사람의 절제력이 완벽한 시너지를 이룹니다. 함께 적금이나 모임통장을 만들면 시드가 두 배로 불어납니다."
                  : "데이트나 모임 때 충동적인 지출이 서로를 자극할 수 있습니다. 1차는 내가 내고 2차는 상대가 내는 등의 명확한 규칙이 필요합니다."}
              </p>
            </TossCard>

            {/* 3 Detailed Synergy Metrics */}
            <TossCard title="3대 세부 궁합 분석">
              <div className="space-y-2 text-xs pt-1">
                <div className="flex justify-between items-center p-3 bg-toss-bg rounded-xl">
                  <span className="font-bold text-toss-text">더치페이 / 회비 정산 케미</span>
                  <span className="font-extrabold text-toss-blue">{score >= 80 ? "95점 (깔끔함)" : "60점 (갈등 주의)"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-toss-bg rounded-xl">
                  <span className="font-bold text-toss-text">공동 투자 / 재테크 방향성</span>
                  <span className="font-extrabold text-toss-blue">{score >= 80 ? "90점 (원팀)" : "55점 (성향 불일치)"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-toss-bg rounded-xl">
                  <span className="font-bold text-toss-text">동업 시 대박 잠재력</span>
                  <span className="font-extrabold text-emerald-600">{score >= 80 ? "대박 예감" : "역할분담 필수"}</span>
                </div>
              </div>
            </TossCard>

            {/* Hidden Secret Advice Unlock */}
            <TossCard
              title="🔒 상대방이 몰래 돈 쓸 때 생기는 갈등 방지 비법"
              subtitle="서로 상처 안 주고 돈 모으는 실전 대화법 가이드"
              badge={<TossBadge variant="orange">비밀 조언</TossBadge>}
            >
              {unlockedAdvice ? (
                <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-950 space-y-2 animate-fade-in">
                  <h5 className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 평화로운 금전 관계를 위한 황금 룰
                  </h5>
                  <p>1. 월별 공동 경비 한도를 월초에 정하고 그 이상은 노터치하기.</p>
                  <p>2. 상대의 취미 지출을 '낭비'라고 지적하지 말고 상호 예산제 도입하기.</p>
                </div>
              ) : (
                <div className="text-center pt-2">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                      광고 보고 비법 확인
                    </TossButton>
                    <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                      토스페이 990원 결제
                    </TossButton>
                  </div>
                </div>
              )}
            </TossCard>

            <TossButton variant="primary" size="md" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1 inline" /> 친구에게 결과 공유하기
            </TossButton>

            <button
              onClick={() => setIsCalculated(false)}
              className="w-full text-center text-xs text-toss-muted hover:underline py-1"
            >
              다른 친구와 다시 측정하기
            </button>
          </div>
        )}

        <AdBanner
          title="카카오페이 송금 수수료 평생 무료"
          subtitle="친구들과 더치페이할 때 1초 만에 깔끔 정산"
        />
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="친구 금전 궁합 비밀 갈등 방지 가이드 열람"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setUnlockedAdvice(true);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="금전 궁합 심층 리포트 & 실전 파트너십 가이드"
        price={990}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setUnlockedAdvice(true);
        }}
      />
    </div>
  );
};
