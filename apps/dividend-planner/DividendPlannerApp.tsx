import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Calendar, DollarSign, PiggyBank, ArrowRight, ShieldCheck, Download, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

interface DividendPlannerAppProps {
  onBack?: () => void;
}

export const DividendPlannerApp: React.FC<DividendPlannerAppProps> = ({ onBack }) => {
  const [targetMonthly, setTargetMonthly] = useState<number>(50); // 만원 단위 (월 50만원)
  const [selectedStrategy, setSelectedStrategy] = useState<"growth" | "highYield">("highYield");
  const [unlockedReport, setUnlockedReport] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Yield assumptions
  // 고배당 월배당 전략: 연 6.8% (JEPI + 맥쿼리인프라 + 커버드콜)
  // 배당성장 전략: 연 4.2% (SCHD + 애플 + 금융지주)
  const avgYield = selectedStrategy === "highYield" ? 0.068 : 0.042;
  const targetAnnual = targetMonthly * 10000 * 12;
  const requiredCapital = Math.round(targetAnnual / avgYield);

  // ISA 비과세 절세 혜택 (배당소득세 15.4% 감면)
  const taxSaved = Math.round(targetAnnual * 0.154);

  // 12 Months Cashflow Simulation
  const monthlyFlows = [
    { month: "1월", amount: targetMonthly * 0.95 },
    { month: "2월", amount: targetMonthly * 1.3 },
    { month: "3월", amount: targetMonthly * 1.1 },
    { month: "4월", amount: targetMonthly * 1.0 },
    { month: "5월", amount: targetMonthly * 0.9 },
    { month: "6월", amount: targetMonthly * 1.25 },
    { month: "7월", amount: targetMonthly * 0.95 },
    { month: "8월", amount: targetMonthly * 1.3 },
    { month: "9월", amount: targetMonthly * 1.1 },
    { month: "10월", amount: targetMonthly * 0.9 },
    { month: "11월", amount: targetMonthly * 0.95 },
    { month: "12월", amount: targetMonthly * 1.3 },
  ];

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="월급 받는 배당 플래너"
        subtitle="목표 배당금 & 월별 캘린더 자동 설계"
        onBack={onBack}
        rightAction={<TossBadge variant="green">패시브 인컴</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Target Input Card */}
        <TossCard title="월 목표 배당금 설정" badge={<TossBadge variant="blue">시뮬레이터</TossBadge>}>
          <div className="space-y-4 pt-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-toss-muted">매달 통장에 받고 싶은 금액</span>
              <span className="text-2xl font-black text-toss-blue">
                {targetMonthly.toLocaleString()}
                <span className="text-sm font-semibold text-toss-text ml-1">만원 / 월</span>
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={targetMonthly}
              onChange={(e) => setTargetMonthly(Number(e.target.value))}
              className="w-full accent-toss-blue h-2 bg-gray-200 rounded-lg cursor-pointer"
            />

            <div className="flex gap-2">
              {[20, 30, 50, 100, 200].map((val) => (
                <button
                  key={val}
                  onClick={() => setTargetMonthly(val)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                    targetMonthly === val
                      ? "bg-toss-blue text-white shadow-xs"
                      : "bg-toss-bg text-toss-subtext hover:bg-gray-200"
                  }`}
                >
                  {val}만
                </button>
              ))}
            </div>

            {/* Strategy Select */}
            <div className="pt-2">
              <label className="text-xs font-bold text-toss-text block mb-1.5">투자 스타일</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedStrategy("highYield")}
                  className={`p-3 rounded-2xl text-xs font-bold border text-left transition ${
                    selectedStrategy === "highYield"
                      ? "bg-blue-50/80 border-toss-blue text-toss-blue"
                      : "bg-toss-bg border-transparent text-toss-subtext"
                  }`}
                >
                  <span className="block font-black text-sm">고배당 월배당 (연 6.8%)</span>
                  <span className="text-[11px] text-toss-muted mt-0.5 block">
                    필요 시드 최소화, 지금 당장 현금흐름
                  </span>
                </button>
                <button
                  onClick={() => setSelectedStrategy("growth")}
                  className={`p-3 rounded-2xl text-xs font-bold border text-left transition ${
                    selectedStrategy === "growth"
                      ? "bg-blue-50/80 border-toss-blue text-toss-blue"
                      : "bg-toss-bg border-transparent text-toss-subtext"
                  }`}
                >
                  <span className="block font-black text-sm">배당 성장 (연 4.2%)</span>
                  <span className="text-[11px] text-toss-muted mt-0.5 block">
                    배당금 매년 증가 + 주가 시세차익
                  </span>
                </button>
              </div>
            </div>
          </div>
        </TossCard>

        {/* Required Capital Overview */}
        <TossCard padding="lg" className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white">
          <span className="text-xs text-emerald-200 font-semibold">필요 예상 투자 원금</span>
          <div className="text-3xl font-black mt-1">
            {Math.round(requiredCapital / 10000).toLocaleString()}
            <span className="text-lg font-medium ml-1">만원</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20 text-xs">
            <div>
              <span className="text-emerald-200 block text-[11px]">연간 총 배당금</span>
              <span className="font-bold text-white text-sm">{(targetMonthly * 12).toLocaleString()}만원</span>
            </div>
            <div>
              <span className="text-emerald-200 block text-[11px]">ISA 계좌 절세 혜택</span>
              <span className="font-bold text-amber-300 text-sm">+{Math.round(taxSaved / 10000)}만원 / 년</span>
            </div>
          </div>
        </TossCard>

        {/* 12-Month Calendar Bar Chart */}
        <TossCard
          title="📅 1월~12월 월별 예상 배당 달력"
          subtitle="분기/반기/월배당주 조합으로 빈 달 없는 월급 통장 구축"
        >
          <div className="pt-2">
            <div className="grid grid-cols-6 gap-2">
              {monthlyFlows.map((flow) => (
                <div key={flow.month} className="text-center bg-toss-bg p-2 rounded-xl">
                  <span className="text-[10px] text-toss-muted block">{flow.month}</span>
                  <div className="my-1.5 h-12 flex items-end justify-center">
                    <div
                      className="w-4 bg-toss-blue rounded-t-sm"
                      style={{ height: `${(flow.amount / (targetMonthly * 1.4)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-extrabold text-toss-text">
                    {Math.round(flow.amount)}만
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TossCard>

        {/* Recommended Core Dividend Assets */}
        <TossCard title="핵심 추천 배당 자산 4종" subtitle="DART 및 SEC 공시 기준 검증 종목">
          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex items-center justify-between p-3 bg-toss-bg rounded-xl">
              <div>
                <span className="font-bold text-toss-text text-sm">JEPI (미국 월배당 ETF)</span>
                <p className="text-[11px] text-toss-muted">매월 1일 입금 · 연 배당수익률 ~7.2%</p>
              </div>
              <TossBadge variant="blue">비중 35%</TossBadge>
            </div>
            <div className="flex items-center justify-between p-3 bg-toss-bg rounded-xl">
              <div>
                <span className="font-bold text-toss-text text-sm">맥쿼리인프라 (088980)</span>
                <p className="text-[11px] text-toss-muted">고속도로·항만 인프라 배당 · 연 ~6.5%</p>
              </div>
              <TossBadge variant="green">비중 30%</TossBadge>
            </div>
            <div className="flex items-center justify-between p-3 bg-toss-bg rounded-xl">
              <div>
                <span className="font-bold text-toss-text text-sm">SCHD (미국 배당성장 ETF)</span>
                <p className="text-[11px] text-toss-muted">10년 연속 배당 증액 · 연 ~3.8%</p>
              </div>
              <TossBadge variant="purple">비중 25%</TossBadge>
            </div>
            <div className="flex items-center justify-between p-3 bg-toss-bg rounded-xl">
              <div>
                <span className="font-bold text-toss-text text-sm">신한지주 (055550)</span>
                <p className="text-[11px] text-toss-muted">분기 배당 금융 대장주 · 연 ~5.4%</p>
              </div>
              <TossBadge variant="gray">비중 10%</TossBadge>
            </div>
          </div>
        </TossCard>

        {/* Premium Portfolio Report Unlock */}
        <TossCard
          title="📑 종목별 최적 매수 수량 & 배당락일 캘린더"
          subtitle={`월 ${targetMonthly}만원 달성을 위한 정확한 종목별 주식 수량 계산표`}
          badge={<TossBadge variant="orange">VIP 리포트</TossBadge>}
        >
          {unlockedReport ? (
            <div className="space-y-3 pt-2 text-xs text-toss-subtext animate-fade-in">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                <h5 className="font-bold text-emerald-800 text-sm mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 맞춤 매수 수량 가이드
                </h5>
                <p>• JEPI: 약 {Math.round((requiredCapital * 0.35) / 78000)}주 매수</p>
                <p>• 맥쿼리인프라: 약 {Math.round((requiredCapital * 0.3) / 12500)}주 매수</p>
                <p>• SCHD: 약 {Math.round((requiredCapital * 0.25) / 110000)}주 매수</p>
              </div>
              <TossButton
                variant="primary"
                size="sm"
                onClick={() => alert("배당 플랜 상세 PDF가 저장되었습니다! (시뮬레이션)")}
              >
                <Download className="w-4 h-4 mr-1 inline" /> 포트폴리오 PDF 다운로드
              </TossButton>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                  광고 보고 확인
                </TossButton>
                <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                  토스페이 1,900원 결제
                </TossButton>
              </div>
            </div>
          )}
        </TossCard>

        <AdBanner
          title="토스뱅크 굴비적금"
          subtitle="매일 조금씩 아껴서 모으는 최고 연 5.0% 적금 혜택"
        />
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="월 배당 최적 포트폴리오 매수 수량표 열람"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setUnlockedReport(true);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        }}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="맞춤형 월배당 포트폴리오 & 절세 리포트 평생 열람"
        price={1900}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setUnlockedReport(true);
        }}
      />
    </div>
  );
};
