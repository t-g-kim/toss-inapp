import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Receipt, Plus, Trash2, Sparkles, Share2, Download, AlertCircle, TrendingUp } from "lucide-react";
import confetti from "canvas-confetti";

interface SpendingReceiptAppProps {
  onBack?: () => void;
}

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
}

export const SpendingReceiptApp: React.FC<SpendingReceiptAppProps> = ({ onBack }) => {
  const [items, setItems] = useState<ExpenseItem[]>([
    { id: "1", name: "마라탕 + 꿔바로우 배달", amount: 24000, category: "배달음식" },
    { id: "2", name: "스타벅스 돌체라떼", amount: 6500, category: "카페/디저트" },
    { id: "3", name: "늦잠 자서 탄 카카오택시", amount: 12800, category: "교통비" },
  ]);

  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [unlockedFutureSim, setUnlockedFutureSim] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const totalSpent = items.reduce((sum, item) => sum + item.amount, 0);

  // AI Roasting feedback based on total
  const getRoastComment = () => {
    if (totalSpent === 0) return "🎉 완벽한 무지출 달성! 통장이 당신을 보고 미소 짓고 있습니다.";
    if (totalSpent > 50000) return "🚨 오늘 하루 지출 5만원 돌파! 지갑에 구멍 났나요? 내일은 강제 무지출 각입니다.";
    if (totalSpent > 25000) return "☕ 배달비와 커피값의 향연... 밥값보다 부대비용이 더 나가는 신기한 마법.";
    return "💡 비교적 알뜰하게 방어 성공! 그래도 편의점 간식은 줄여봅시다.";
  };

  const getGrade = () => {
    if (totalSpent === 0) return { grade: "S+", color: "text-emerald-600" };
    if (totalSpent <= 15000) return { grade: "A", color: "text-blue-600" };
    if (totalSpent <= 35000) return { grade: "B", color: "text-amber-500" };
    return { grade: "F", color: "text-rose-600" };
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemAmount.trim()) return;

    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      amount: parseInt(newItemAmount, 10) || 0,
      category: "기타",
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemAmount("");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleGenerateReceipt = () => {
    setShowReceipt(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="무지출 & 팩폭 소비 영수증"
        subtitle="오늘 쓴 돈 영수증으로 뽑고 정신 차리기"
        onBack={onBack}
        rightAction={<TossBadge variant="red">짠테크 필수</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {!showReceipt ? (
          <>
            {/* Input Card */}
            <TossCard title="오늘 쓴 돈 입력하기" subtitle="작은 간식값, 배달팁까지 솔직하게 적어보세요">
              <form onSubmit={handleAddItem} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="지출 항목 (예: 점심 국밥)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="p-3 rounded-xl border border-toss-border text-xs font-semibold focus:outline-none focus:border-toss-blue bg-white"
                  />
                  <input
                    type="number"
                    placeholder="금액 (원)"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="p-3 rounded-xl border border-toss-border text-xs font-semibold focus:outline-none focus:border-toss-blue bg-white"
                  />
                </div>
                <TossButton type="submit" variant="secondary" size="sm">
                  <Plus className="w-4 h-4 mr-1 inline" /> 지출 추가
                </TossButton>
              </form>
            </TossCard>

            {/* Current Item List */}
            <TossCard
              title="오늘의 지출 내역"
              badge={<TossBadge variant="blue">총 {totalSpent.toLocaleString()}원</TossBadge>}
            >
              {items.length === 0 ? (
                <div className="text-center py-8 text-xs text-toss-muted">
                  아직 등록된 지출이 없습니다. 오늘은 무지출의 날인가요?
                </div>
              ) : (
                <div className="space-y-2 pt-1 text-xs">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 bg-toss-bg rounded-xl"
                    >
                      <div>
                        <span className="font-bold text-toss-text block">{item.name}</span>
                        <span className="text-[10px] text-toss-muted">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-toss-text">
                          {item.amount.toLocaleString()}원
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-toss-border">
                <TossButton variant="primary" size="lg" onClick={handleGenerateReceipt}>
                  <Receipt className="w-5 h-5 mr-1.5 inline" /> AI 팩폭 영수증 발행하기
                </TossButton>
              </div>
            </TossCard>
          </>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Thermal Receipt Paper Effect */}
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-200 font-mono relative overflow-hidden">
              {/* Receipt jagged top decorative border */}
              <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div className="text-xs font-bold tracking-widest text-gray-500 mb-1">
                  *** 팩폭 소비 영수증 ***
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-wider">TOSS SPENDING REC</h3>
                <p className="text-[11px] text-gray-400 mt-1">2026.10.10 / 가맹점: 나의 나약한 의지</p>
              </div>

              {/* Items List */}
              <div className="space-y-2 text-xs text-gray-800 border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate max-w-[200px]">{idx + 1}. {item.name}</span>
                    <span className="font-bold shrink-0">{item.amount.toLocaleString()}원</span>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t border-gray-200 font-black text-sm text-gray-900">
                  <span>합 계 (TOTAL)</span>
                  <span className="text-rose-600">{totalSpent.toLocaleString()}원</span>
                </div>
              </div>

              {/* AI Roast Commentary */}
              <div className="bg-gray-100 p-3.5 rounded-xl mb-4 text-xs font-sans">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-rose-500" /> AI 팩폭 심사위원
                  </span>
                  <span className={`font-black text-base ${getGrade().color}`}>
                    등급: {getGrade().grade}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed font-medium">{getRoastComment()}</p>
              </div>

              {/* Stock Conversion Metaphor */}
              <div className="text-center text-xs text-gray-500 font-sans border-t border-dashed border-gray-300 pt-3">
                <p>💡 이 돈을 아껴서 삼성전자 주식을 샀다면?</p>
                <p className="font-bold text-toss-blue text-sm mt-0.5">
                  약 {(totalSpent / 56400).toFixed(2)}주 매수 가능
                </p>
              </div>
            </div>

            {/* Future Compound Simulation Unlock */}
            <TossCard
              title="📈 오늘 낭비한 돈, 1년 모아 미국 배당주에 넣으면?"
              subtitle="매일 커피값/배달비 복리 10년 시뮬레이션 리포트"
              badge={<TossBadge variant="purple">자산 환산</TossBadge>}
            >
              {unlockedFutureSim ? (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2 animate-fade-in">
                  <h5 className="font-bold text-toss-blue flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" /> 10년 뒤 당신이 잃어버린 미래 자산
                  </h5>
                  <p>• 매일 {totalSpent.toLocaleString()}원 절약 시 1년 원금: {(totalSpent * 365).toLocaleString()}원</p>
                  <p>• 연 8% 복리 투자 시 10년 후 예상 자산: <strong className="text-emerald-600">{(totalSpent * 365 * 1.5).toLocaleString()}원</strong> 돌파!</p>
                </div>
              ) : (
                <div className="text-center pt-2">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                      광고 보고 복리 계산
                    </TossButton>
                    <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                      토스페이 990원 결제
                    </TossButton>
                  </div>
                </div>
              )}
            </TossCard>

            <div className="grid grid-cols-2 gap-2">
              <TossButton
                variant="primary"
                onClick={() => alert("영수증 이미지가 갤러리에 저장되었습니다! (시뮬레이션)")}
              >
                <Download className="w-4 h-4 mr-1 inline" /> 영수증 이미지 저장
              </TossButton>
              <TossButton
                variant="outline"
                onClick={() => setShowReceipt(false)}
              >
                내역 다시 수정
              </TossButton>
            </div>
          </div>
        )}

        <AdBanner
          title="현대카드 제로 에디션3 무조건 할인"
          subtitle="전월 실적 상관없이 언제 어디서나 0.7% 청구할인"
        />
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="10년 절약 복리 시뮬레이터 리포트 열람"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setUnlockedFutureSim(true);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="10년 복리 자산 환산 시뮬레이터 평생 소장"
        price={990}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setUnlockedFutureSim(true);
        }}
      />
    </div>
  );
};
