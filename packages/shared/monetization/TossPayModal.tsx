import React, { useState } from "react";
import { Check, ShieldCheck, X, Sparkles, CreditCard } from "lucide-react";
import confetti from "canvas-confetti";

interface TossPayModalProps {
  isOpen: boolean;
  productTitle: string;
  price: number;
  description?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TossPayModal: React.FC<TossPayModalProps> = ({
  isOpen,
  productTitle,
  price,
  description = "토스페이로 1초 만에 안전하게 결제됩니다.",
  onClose,
  onSuccess,
}) => {
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaid(true);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onSuccess();
        onClose();
        setPaid(false);
      }, 1200);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-toss-blue rounded-full flex items-center justify-center text-white text-xs font-black">
              T
            </div>
            <span className="font-bold text-sm text-toss-text">토스페이 결제</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <span className="inline-block bg-blue-50 text-toss-blue text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
              원클릭 간편결제
            </span>
            <h3 className="text-lg font-bold text-toss-text">{productTitle}</h3>
            <div className="text-3xl font-extrabold text-toss-blue mt-2">
              {price.toLocaleString()}
              <span className="text-lg font-medium text-toss-text ml-0.5">원</span>
            </div>
            <p className="text-xs text-toss-muted mt-2">{description}</p>
          </div>

          {/* Payment Method Card */}
          <div className="bg-toss-bg p-3.5 rounded-2xl flex items-center justify-between mb-6 border border-toss-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xs border border-gray-100 text-toss-blue">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-toss-text">토스 머니 / 토스뱅크 계좌</p>
                <p className="text-[11px] text-toss-muted">잔액 부족 시 자동 충전</p>
              </div>
            </div>
            <div className="w-5 h-5 bg-toss-blue rounded-full flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-toss-muted mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>FSS 금융감독원 전자금융거래 안전인증 완료</span>
          </div>

          {/* Action button */}
          <button
            onClick={handlePay}
            disabled={processing || paid}
            className={`w-full py-4 rounded-2xl font-bold text-base transition shadow-md active-press flex items-center justify-center gap-2 ${
              paid
                ? "bg-emerald-500 text-white"
                : "bg-toss-blue hover:bg-toss-blueDark text-white shadow-toss-blue/30"
            }`}
          >
            {processing ? (
              <span>생체 인증 확인 중...</span>
            ) : paid ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-5 h-5" /> 결제 완료!
              </span>
            ) : (
              <span>{price.toLocaleString()}원 결제하기</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
