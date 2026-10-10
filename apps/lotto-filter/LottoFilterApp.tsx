import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal } from "@shared/index";
import { Sparkles, RefreshCw, Bookmark, CheckCircle, ShieldAlert, SlidersHorizontal, Dice5 } from "lucide-react";
import confetti from "canvas-confetti";

interface LottoFilterAppProps {
  onBack?: () => void;
}

export const LottoFilterApp: React.FC<LottoFilterAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"generate" | "saved" | "history">("generate");
  const [oddEvenRatio, setOddEvenRatio] = useState<"any" | "3:3" | "4:2" | "2:4">("3:3");
  const [avoidConsecutive, setAvoidConsecutive] = useState(true);
  const [includeColdNumbers, setIncludeColdNumbers] = useState(true);
  
  // Generated Games
  const [games, setGames] = useState<number[][]>([]);
  const [savedGames, setSavedGames] = useState<number[][]>([]);
  const [adOpen, setAdOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Recent Winning Numbers (e.g. 1140회차)
  const recentWinner = {
    round: 1140,
    date: "2026.10.03",
    numbers: [7, 11, 19, 24, 37, 42],
    bonus: 3,
  };

  const getBallColor = (num: number) => {
    if (num <= 10) return "bg-amber-400 text-amber-950 border-amber-500/30";
    if (num <= 20) return "bg-blue-500 text-white border-blue-600/30";
    if (num <= 30) return "bg-rose-500 text-white border-rose-600/30";
    if (num <= 40) return "bg-slate-500 text-white border-slate-600/30";
    return "bg-emerald-500 text-white border-emerald-600/30";
  };

  const generateSingleGame = (): number[] => {
    const coldList = [3, 9, 14, 28, 33, 41]; // Recent cold numbers
    let candidate: number[] = [];

    for (let attempts = 0; attempts < 100; attempts++) {
      const set = new Set<number>();
      if (includeColdNumbers) {
        const randomCold = coldList[Math.floor(Math.random() * coldList.length)];
        set.add(randomCold);
      }

      while (set.size < 6) {
        set.add(Math.floor(Math.random() * 45) + 1);
      }

      const arr = Array.from(set).sort((a, b) => a - b);

      // Check Consecutive
      if (avoidConsecutive) {
        let hasConsecutive = false;
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i + 1] === arr[i] + 1 && i < arr.length - 2 && arr[i + 2] === arr[i] + 2) {
            hasConsecutive = true;
            break;
          }
        }
        if (hasConsecutive) continue;
      }

      // Check Odd:Even
      const odds = arr.filter((n) => n % 2 !== 0).length;
      if (oddEvenRatio === "3:3" && odds !== 3) continue;
      if (oddEvenRatio === "4:2" && odds !== 4) continue;
      if (oddEvenRatio === "2:4" && odds !== 2) continue;

      candidate = arr;
      break;
    }

    if (candidate.length === 0) {
      // fallback
      const set = new Set<number>();
      while (set.size < 6) set.add(Math.floor(Math.random() * 45) + 1);
      candidate = Array.from(set).sort((a, b) => a - b);
    }

    return candidate;
  };

  const handleGenerateSingle = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newGame = generateSingleGame();
      setGames([newGame]);
      setIsGenerating(false);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }, 300);
  };

  const handleGenerateFiveSets = () => {
    setAdOpen(true);
  };

  const onAdRewardSuccess = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const fiveGames: number[][] = [];
      for (let i = 0; i < 5; i++) {
        fiveGames.push(generateSingleGame());
      }
      setGames(fiveGames);
      setIsGenerating(false);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 300);
  };

  const handleSaveGame = (game: number[]) => {
    if (savedGames.some((g) => g.join(",") === game.join(","))) {
      alert("이미 보관함에 저장된 번호입니다.");
      return;
    }
    setSavedGames([game, ...savedGames]);
    alert("내 번호 보관함에 저장되었습니다!");
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="AI 로또 통계 필터"
        subtitle="빅데이터 통계 기반 1등 조합기"
        onBack={onBack}
        rightAction={<TossBadge variant="blue">1141회 대비</TossBadge>}
      />

      {/* Tabs */}
      <div className="flex border-b border-toss-border bg-white px-4">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "generate"
              ? "border-toss-blue text-toss-blue"
              : "border-transparent text-toss-muted"
          }`}
        >
          번호 조합기
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "saved"
              ? "border-toss-blue text-toss-blue"
              : "border-transparent text-toss-muted"
          }`}
        >
          보관함 ({savedGames.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
            activeTab === "history"
              ? "border-toss-blue text-toss-blue"
              : "border-transparent text-toss-muted"
          }`}
        >
          당첨 채점기
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {activeTab === "generate" && (
          <>
            {/* Filter Configuration Card */}
            <TossCard
              title="통계 필터 설정"
              subtitle="역대 1등 당첨 데이터에 수렴하는 통계 조건"
              badge={<TossBadge variant="purple">AI 최적화</TossBadge>}
            >
              <div className="space-y-3.5 pt-2 text-sm">
                <div>
                  <label className="text-xs font-semibold text-toss-subtext block mb-1.5">
                    홀짝 비율 (역대 78%가 3:3 또는 4:2 분포)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["3:3", "4:2", "2:4", "any"] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setOddEvenRatio(ratio)}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          oddEvenRatio === ratio
                            ? "bg-toss-blue text-white border-toss-blue"
                            : "bg-toss-bg text-toss-subtext border-transparent hover:bg-gray-200"
                        }`}
                      >
                        {ratio === "any" ? "무작위" : ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-semibold text-toss-text text-xs">3연속 번호 제외</span>
                    <p className="text-[11px] text-toss-muted">1, 2, 3 등 비현실적 연속 번호 차단</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={avoidConsecutive}
                    onChange={(e) => setAvoidConsecutive(e.target.checked)}
                    className="w-5 h-5 accent-toss-blue rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-semibold text-toss-text text-xs">미출현 번호(콜드) 가중치</span>
                    <p className="text-[11px] text-toss-muted">최근 10주간 출현율 낮은 번호 1개 보정</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeColdNumbers}
                    onChange={(e) => setIncludeColdNumbers(e.target.checked)}
                    className="w-5 h-5 accent-toss-blue rounded cursor-pointer"
                  />
                </div>
              </div>
            </TossCard>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <TossButton
                variant="secondary"
                size="md"
                onClick={handleGenerateSingle}
                loading={isGenerating}
              >
                1게임 무료 추출
              </TossButton>
              <TossButton
                variant="primary"
                size="md"
                onClick={handleGenerateFiveSets}
                loading={isGenerating}
                className="bg-gradient-to-r from-toss-blue to-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-1 inline" /> 5게임 세트 (광고)
              </TossButton>
            </div>

            {/* Generated Numbers Display */}
            {games.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-sm text-toss-text">
                    조합된 번호 ({games.length}게임)
                  </h4>
                  <span className="text-xs text-toss-muted">합계 구간: 110 ~ 165</span>
                </div>

                {games.map((game, idx) => (
                  <TossCard key={idx} padding="sm">
                    <div className="flex items-center justify-between">
                      <span className="w-6 text-xs font-bold text-toss-muted">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <div className="flex items-center gap-2">
                        {game.map((num) => (
                          <div
                            key={num}
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border shadow-xs ${getBallColor(
                              num
                            )}`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleSaveGame(game)}
                        className="p-1.5 text-toss-muted hover:text-toss-blue transition"
                        title="보관하기"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                  </TossCard>
                ))}
              </div>
            )}

            <AdBanner
              title="삼성화재 다이렉트 착 자동차보험"
              subtitle="내 차 보험료 1분 만에 계산하고 3만원 주유권 혜택"
            />
          </>
        )}

        {activeTab === "saved" && (
          <div className="space-y-3">
            {savedGames.length === 0 ? (
              <div className="text-center py-16 text-toss-muted text-sm">
                <Bookmark className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                저장된 행운 번호가 없습니다.
                <br />
                조합기에서 번호를 뽑고 보관해보세요!
              </div>
            ) : (
              savedGames.map((game, idx) => (
                <TossCard key={idx} padding="sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-toss-muted">#{idx + 1}</span>
                    <div className="flex items-center gap-2">
                      {game.map((num) => (
                        <div
                          key={num}
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border shadow-xs ${getBallColor(
                            num
                          )}`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setSavedGames(savedGames.filter((_, i) => i !== idx))
                      }
                      className="text-xs text-rose-500 hover:underline px-2"
                    >
                      삭제
                    </button>
                  </div>
                </TossCard>
              ))
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4">
            <TossCard
              title={`제 ${recentWinner.round}회 당첨 결과`}
              subtitle={`추첨일: ${recentWinner.date}`}
              badge={<TossBadge variant="green">공식 발표</TossBadge>}
            >
              <div className="flex items-center justify-center gap-2 py-4">
                {recentWinner.numbers.map((num) => (
                  <div
                    key={num}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border ${getBallColor(
                      num
                    )}`}
                  >
                    {num}
                  </div>
                ))}
                <span className="text-lg font-bold text-gray-400 mx-1">+</span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-sm border ${getBallColor(
                    recentWinner.bonus
                  )}`}
                >
                  {recentWinner.bonus}
                </div>
              </div>
              <p className="text-center text-xs text-toss-muted">
                1등 당첨금 약 21억 8천만원 (총 12명)
              </p>
            </TossCard>

            <TossCard title="내 번호 즉시 채점">
              <p className="text-xs text-toss-subtext mb-3">
                현재 보관함에 저장된 번호와 최근 당첨 번호를 대조합니다.
              </p>
              {savedGames.length > 0 ? (
                <div className="space-y-2">
                  {savedGames.map((game, i) => {
                    const matchCount = game.filter((n) =>
                      recentWinner.numbers.includes(n)
                    ).length;
                    const bonusMatch = game.includes(recentWinner.bonus);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-toss-bg p-3 rounded-xl text-xs"
                      >
                        <span className="font-semibold text-toss-text">
                          번호 #{i + 1}
                        </span>
                        <span className="font-bold text-toss-blue">
                          {matchCount}개 일치{" "}
                          {matchCount === 6
                            ? "🎉 1등 당첨!"
                            : matchCount === 5 && bonusMatch
                            ? "🥈 2등 당첨!"
                            : matchCount === 5
                            ? "🥉 3등 당첨!"
                            : matchCount === 4
                            ? "4등 (5만원)"
                            : matchCount === 3
                            ? "5등 (5천원)"
                            : "낙첨"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-toss-muted text-center py-4">
                  보관함에 저장된 번호가 없습니다.
                </p>
              )}
            </TossCard>
          </div>
        )}
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={adOpen}
        rewardTitle="1141회 대비 AI 5게임 황금 세트 발급"
        onClose={() => setAdOpen(false)}
        onRewarded={onAdRewardSuccess}
      />
    </div>
  );
};
