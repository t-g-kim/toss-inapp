import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, TossPayModal, RewardedAdModal } from "@shared/index";
import { TrendingUp, Award, DollarSign, Calculator, Lock, CheckCircle2, ChevronRight } from "lucide-react";

interface SalaryHeroAppProps {
  onBack?: () => void;
}

export const SalaryHeroApp: React.FC<SalaryHeroAppProps> = ({ onBack }) => {
  const [annualSalary, setAnnualSalary] = useState<number>(5000); // 만원 단위 (5,000만원)
  const [nonTaxable, setNonTaxable] = useState<number>(20); // 식대 비과세 (월 20만원)
  const [familyCount, setFamilyCount] = useState<number>(1);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [unlockedReport, setUnlockedReport] = useState(false);

  // 2026 Deduction calculation (Monthly in KRW)
  const monthlySalary = Math.round((annualSalary * 10000) / 12);
  const taxableMonthly = Math.max(0, monthlySalary - nonTaxable * 10000);

  // 1. 국민연금 (4.5%, 2026 기준 상한액 적용: 월소득 617만원 한도)
  const pensionBase = Math.min(taxableMonthly, 6170000);
  const nationalPension = Math.round(pensionBase * 0.045);

  // 2. 건강보험 (3.545%)
  const healthInsurance = Math.round(taxableMonthly * 0.03545);

  // 3. 장기요양보험 (건강보험료의 12.95%)
  const careInsurance = Math.round(healthInsurance * 0.1295);

  // 4. 고용보험 (0.9%)
  const employmentInsurance = Math.round(taxableMonthly * 0.009);

  // 5. 근로소득세 간이세액 (근사 표준세율 곡선)
  const calcIncomeTax = (taxable: number, family: number) => {
    let rate = 0.03;
    if (taxable > 8000000) rate = 0.24;
    else if (taxable > 5000000) rate = 0.15;
    else if (taxable > 3000000) rate = 0.08;
    else if (taxable > 2000000) rate = 0.05;

    const baseTax = taxable * rate;
    const deduction = (family - 1) * 35000;
    return Math.max(0, Math.round(baseTax - deduction));
  };

  const incomeTax = calcIncomeTax(taxableMonthly, familyCount);
  const localTax = Math.round(incomeTax * 0.1);

  const totalDeduction =
    nationalPension +
    healthInsurance +
    careInsurance +
    employmentInsurance +
    incomeTax +
    localTax;

  const monthlyTakeHome = monthlySalary - totalDeduction;

  // Comparison if salary is +1000만원
  const nextAnnualSalary = annualSalary + 1000;
  const nextMonthlySalary = Math.round((nextAnnualSalary * 10000) / 12);
  const nextTaxable = Math.max(0, nextMonthlySalary - nonTaxable * 10000);
  const nextPension = Math.round(Math.min(nextTaxable, 6170000) * 0.045);
  const nextHealth = Math.round(nextTaxable * 0.03545);
  const nextCare = Math.round(nextHealth * 0.1295);
  const nextEmp = Math.round(nextTaxable * 0.009);
  const nextTax = calcIncomeTax(nextTaxable, familyCount);
  const nextLocal = Math.round(nextTax * 0.1);
  const nextTotalDeduction = nextPension + nextHealth + nextCare + nextEmp + nextTax + nextLocal;
  const nextTakeHome = nextMonthlySalary - nextTotalDeduction;
  const diffTakeHome = nextTakeHome - monthlyTakeHome;

  // 대한민국 직장인 백분위 근사
  const getPercentile = (salary: number) => {
    if (salary >= 10000) return "상위 4.8%";
    if (salary >= 8000) return "상위 11.2%";
    if (salary >= 6000) return "상위 22.5%";
    if (salary >= 5000) return "상위 34.0%";
    if (salary >= 4000) return "상위 48.7%";
    if (salary >= 3500) return "상위 58.2%";
    return "상위 70% 이하";
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="2026 연봉 실수령액 계산기"
        subtitle="최신 4대보험 & 간이세액 완벽 반영"
        onBack={onBack}
        rightAction={<TossBadge variant="blue">2026 개정세법</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Salary Input Card */}
        <TossCard title="연봉 입력" badge={<TossBadge variant="purple">{getPercentile(annualSalary)}</TossBadge>}>
          <div className="mt-2 space-y-4">
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-toss-muted">원하는 연봉 선택</span>
                <span className="text-2xl font-black text-toss-blue">
                  {annualSalary.toLocaleString()}
                  <span className="text-sm font-semibold text-toss-text ml-1">만원</span>
                </span>
              </div>
              <input
                type="range"
                min="2400"
                max="15000"
                step="100"
                value={annualSalary}
                onChange={(e) => setAnnualSalary(Number(e.target.value))}
                className="w-full accent-toss-blue h-2 bg-gray-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {[3500, 4500, 5000, 6000, 7500, 10000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAnnualSalary(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    annualSalary === preset
                      ? "bg-toss-blue text-white shadow-xs"
                      : "bg-toss-bg text-toss-subtext hover:bg-gray-200"
                  }`}
                >
                  {preset >= 10000 ? `${preset / 10000}억` : `${preset}만`}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-toss-bg p-3 rounded-xl">
                <span className="text-toss-muted block mb-1">식대 비과세(월)</span>
                <span className="font-bold text-toss-text">{nonTaxable}만원</span>
              </div>
              <div className="bg-toss-bg p-3 rounded-xl">
                <span className="text-toss-muted block mb-1">부양가족(본인 포함)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFamilyCount(Math.max(1, familyCount - 1))}
                    className="w-5 h-5 rounded bg-white text-gray-700 font-bold flex items-center justify-center border"
                  >
                    -
                  </button>
                  <span className="font-bold text-toss-text">{familyCount}명</span>
                  <button
                    onClick={() => setFamilyCount(familyCount + 1)}
                    className="w-5 h-5 rounded bg-white text-gray-700 font-bold flex items-center justify-center border"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TossCard>

        {/* Take-Home Result Card */}
        <TossCard padding="lg" className="bg-gradient-to-br from-blue-600 via-toss-blue to-indigo-700 text-white">
          <span className="text-xs text-blue-100 font-medium">통장에 매달 실제로 꽂히는 돈</span>
          <div className="text-3xl font-black mt-1">
            {monthlyTakeHome.toLocaleString()}
            <span className="text-lg font-semibold ml-1">원</span>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs text-blue-100">
            <span>세전 월급 {monthlySalary.toLocaleString()}원</span>
            <span>공제액 -{totalDeduction.toLocaleString()}원 ({Math.round((totalDeduction / monthlySalary) * 100)}%)</span>
          </div>
        </TossCard>

        {/* Next Tier Simulation */}
        <TossCard
          title="💡 연봉 1,000만원 올리면?"
          subtitle={`연봉 ${nextAnnualSalary.toLocaleString()}만원 이직 시뮬레이션`}
        >
          <div className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-800 font-semibold block">월 실수령 증가액</span>
              <span className="text-xl font-black text-emerald-600">
                +{diffTakeHome.toLocaleString()}원 / 월
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-700 block">연간 통장 실수령</span>
              <span className="text-sm font-bold text-emerald-900">
                +{(diffTakeHome * 12).toLocaleString()}원
              </span>
            </div>
          </div>
        </TossCard>

        {/* Deduction Breakdown Details */}
        <TossCard title="월 공제액 상세 명세표" subtitle="내 월급에서 빠져나가는 4대보험과 세금">
          <div className="space-y-2.5 text-xs pt-1">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-toss-subtext">국민연금 (4.5%)</span>
              <span className="font-semibold text-toss-text">-{nationalPension.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-toss-subtext">건강보험 (3.545%)</span>
              <span className="font-semibold text-toss-text">-{healthInsurance.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-toss-subtext">장기요양보험 (12.95%)</span>
              <span className="font-semibold text-toss-text">-{careInsurance.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-toss-subtext">고용보험 (0.9%)</span>
              <span className="font-semibold text-toss-text">-{employmentInsurance.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-toss-subtext">소득세 (근로소득 간이세액)</span>
              <span className="font-semibold text-toss-text">-{incomeTax.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-toss-subtext">지방소득세 (소득세의 10%)</span>
              <span className="font-semibold text-toss-text">-{localTax.toLocaleString()}원</span>
            </div>
          </div>
        </TossCard>

        {/* Premium Negotiation Report Unlock */}
        <TossCard
          title="📈 이직 연봉 협상 필승 전략 리포트"
          subtitle="대기업/스타트업 이직 시 연봉 15~20% 끌어올리는 실제 협상 템플릿"
          badge={<TossBadge variant="orange">VIP 전용</TossBadge>}
        >
          {unlockedReport ? (
            <div className="space-y-3 pt-2 text-xs text-toss-subtext animate-fade-in">
              <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-200">
                <h5 className="font-bold text-toss-blue text-sm mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 1단계: 기존 연봉 구성 완전 분해
                </h5>
                <p>
                  기본급 외에 상여금(PI/PS), 복지포인트, 식대, 비과세 항목을 모두 합친 총 보상(Total Compensation) 기준으로 이직처에 제시해야 합니다.
                </p>
              </div>
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200">
                <h5 className="font-bold text-purple-700 text-sm mb-1">
                  2단계: 마법의 연봉 역제안 공식
                </h5>
                <p>
                  "현재 처우 기준 최소 18% 인상인 {Math.round(annualSalary * 1.18).toLocaleString()}만원을 희망하며, 역할 범위 확장에 따라 협의 가능합니다" 형태로 여지를 남기세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-300 mb-3">
                <Lock className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-toss-subtext font-medium">
                  헤드헌터가 알려주지 않는 연봉 1,500만원 올리는 협상 대화 스크립트 수록
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <TossButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setAdModalOpen(true)}
                >
                  광고 보고 무료 열람
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
        </TossCard>

        <AdBanner
          title="카카오뱅크 신용대출 갈아타기"
          subtitle="금리 최대 1.5%p 낮추고 한도는 더 여유있게"
        />
      </div>

      {/* Monetization Modals */}
      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="이직 연봉 협상 필승 전략 리포트 열람"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => setUnlockedReport(true)}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="이직 연봉 협상 필승 전략 리포트 평생 소장"
        price={1900}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => setUnlockedReport(true)}
      />
    </div>
  );
};
