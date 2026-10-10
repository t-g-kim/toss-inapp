import React, { useState, useEffect } from "react";
import { Play, Sparkles, X, CheckCircle2 } from "lucide-react";

interface RewardedAdModalProps {
  isOpen: boolean;
  rewardTitle?: string;
  onClose: () => void;
  onRewarded: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  rewardTitle = "프리미엄 분석 리포트 열람",
  onClose,
  onRewarded,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(5);
      setCompleted(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = () => {
    onRewarded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl flex flex-col border border-gray-100">
        {/* Ad Video Simulation Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 text-center">
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-300">
            Ad · Google AdMob 보상형 광고
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white p-1 rounded-full bg-black/40"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 mx-auto my-3 bg-gradient-to-tr from-toss-blue to-purple-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h3 className="font-bold text-lg text-white">토스뱅크 모임통장</h3>
          <p className="text-xs text-indigo-200 mt-1">모임원들과 함께 쓰면 연 2.0% 캐시백 & 회비 정산</p>

          {/* Countdown badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            {completed ? (
              <span className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 보상 획득 완료!
              </span>
            ) : (
              <span>{secondsLeft}초 후 보상 지급...</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-toss-blue h-full transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Body */}
        <div className="p-5 text-center">
          <div className="mb-4">
            <span className="text-xs text-toss-muted font-medium">받을 보상</span>
            <p className="text-base font-bold text-toss-text mt-0.5">{rewardTitle}</p>
          </div>

          {completed ? (
            <button
              onClick={handleClaim}
              className="w-full py-3.5 bg-toss-blue hover:bg-toss-blueDark text-white font-bold rounded-2xl shadow-md shadow-toss-blue/30 active:scale-95 transition"
            >
              보상 받고 바로 확인하기
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Fast skip for test
                  setCompleted(true);
                  setSecondsLeft(0);
                }}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-toss-subtext text-xs font-medium rounded-2xl transition"
              >
                광고 빨리감기 (개발 모드)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
