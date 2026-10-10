import React, { useState, useEffect } from "react";
import { Play, Sparkles, X, CheckCircle2, Film, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface RewardedAdModalProps {
  isOpen: boolean;
  rewardTitle?: string;
  adDurationSeconds?: number;
  onClose: () => void;
  onRewarded?: () => void;
  onReward?: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  rewardTitle = "프리미엄 분석 리포트 열람",
  adDurationSeconds = 5,
  onClose,
  onRewarded,
  onReward,
}) => {
  // 3-phase flow: "notice" (pre-ad awareness) -> "playing" (ad countdown) -> "completed" (reward claim)
  const [phase, setPhase] = useState<"notice" | "playing" | "completed">("notice");
  const [secondsLeft, setSecondsLeft] = useState(adDurationSeconds);

  useEffect(() => {
    if (!isOpen) {
      setPhase("notice");
      setSecondsLeft(adDurationSeconds);
      return;
    }
    // Reset to notice phase every time it opens
    setPhase("notice");
    setSecondsLeft(adDurationSeconds);
  }, [isOpen, adDurationSeconds]);

  // Timer only runs when phase is "playing"
  useEffect(() => {
    if (phase !== "playing") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase("completed");
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  if (!isOpen) return null;

  const handleClaim = () => {
    if (onRewarded) onRewarded();
    if (onReward) onReward();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl flex flex-col border border-gray-100 transition-all">
        {/* Phase 1: Pre-Ad Awareness UI (광고 노출 전 인지 UI - 토스 심사 필수 규격) */}
        {phase === "notice" && (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-14 h-14 mx-auto mb-3 bg-blue-50 text-toss-blue rounded-2xl flex items-center justify-center shadow-sm">
              <Film className="w-7 h-7 text-toss-blue" />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-black mb-2 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>[광고 시청 사전 동의 안내]</span>
            </div>

            <h3 className="font-extrabold text-lg text-toss-text">
              약 {adDurationSeconds}초간 동영상 광고가 재생돼요
            </h3>

            <p className="text-xs text-toss-subtext mt-2 leading-relaxed px-2">
              유저 동의 후 짧은 스폰서 광고를 시청하시면{" "}
              <strong className="text-toss-text font-bold">‘{rewardTitle}’</strong>을(를){" "}
              <span className="text-blue-600 font-bold">무료</span>로 이용하실 수 있어요.
            </p>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => setPhase("playing")}
                className="w-full py-3.5 bg-toss-blue hover:bg-toss-blueDark text-white font-bold rounded-2xl shadow-md shadow-toss-blue/30 active:scale-95 transition flex items-center justify-center gap-1.5 text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>[광고] 5초 시청 시작하기</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 text-toss-muted hover:text-toss-text font-medium text-xs rounded-xl transition"
              >
                시청하지 않고 닫기 (취소)
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Playing Ad */}
        {phase === "playing" && (
          <div className="animate-fade-in">
            <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 text-center">
              <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-300">
                Ad · Google AdMob 보상형 광고
              </div>

              <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-full bg-black/40"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 mx-auto my-3 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h3 className="font-bold text-lg text-white">신한 SOL 트래블 체크카드</h3>
              <p className="text-xs text-indigo-200 mt-1">환전 수수료 100% 무료 & 전 세계 라운지 혜택</p>

              {/* Countdown badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                <span>{secondsLeft}초 후 보상 지급...</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-toss-blue h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{
                    width: `${((adDurationSeconds - secondsLeft) / adDurationSeconds) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-4 text-center">
              <span className="text-xs text-toss-muted">받을 혜택: {rewardTitle}</span>
              <button
                onClick={() => {
                  setPhase("completed");
                  setSecondsLeft(0);
                }}
                className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 block mx-auto underline"
              >
                광고 건너뛰기
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Completed */}
        {phase === "completed" && (
          <div className="p-6 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-3 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold mb-1">
              시청 완료
            </span>

            <h3 className="font-extrabold text-lg text-toss-text">
              보상 획득 완료!
            </h3>

            <p className="text-xs text-toss-subtext mt-1.5 leading-relaxed">
              광고 시청이 확인되었습니다.<br />
              <strong className="text-toss-text">‘{rewardTitle}’</strong>을(를) 지금 바로 확인하세요.
            </p>

            <button
              onClick={handleClaim}
              className="mt-5 w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/30 active:scale-95 transition text-sm"
            >
              보상 받고 바로 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
