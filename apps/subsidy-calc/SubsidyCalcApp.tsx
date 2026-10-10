import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Search, CheckCircle2, ExternalLink, FileText, ArrowRight, Wallet, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface SubsidyCalcAppProps {
  onBack?: () => void;
}
export type SubsidyFinderAppProps = SubsidyCalcAppProps;

interface SubsidyItem {
  id: string;
  title: string;
  category: string;
  maxBenefit: string;
  summary: string;
  targetMatch: string;
  deadline: string;
  agency: string;
}

const SUBSIDIES: SubsidyItem[] = [
  {
    id: "k-pass",
    title: "K-패스 대중교통비 환급 지원",
    category: "교통비",
    maxBenefit: "월 최대 53% 환급 (연 21만원)",
    summary: "월 15회 이상 대중교통 이용 시 지출 금액의 20~53%를 다음 달 현금 환급.",
    targetMatch: "전 국민 (청년 30%, 저소득 53%)",
    deadline: "상시 신청 가능",
    agency: "국토교통부",
  },
  {
    id: "youth-leap",
    title: "2026 청년도약계좌 정부기여금",
    category: "목돈 만들기",
    maxBenefit: "정부지원금 + 비과세 연 최대 9.5% 적금 효과",
    summary: "매달 최대 70만원 저축 시 정부가 매칭 기여금을 얹어 5년 만기 5,000만원 목돈 마련 지원.",
    targetMatch: "만 19~34세, 개인소득 7,500만원 이하",
    deadline: "매월 초 신청 접수",
    agency: "서민금융진흥원",
  },
  {
    id: "rent-support",
    title: "청년 월세 특별지원 (2차)",
    category: "주거비",
    maxBenefit: "월 최대 20만원 (12개월간 총 240만원)",
    summary: "부모와 별도 거주하는 무주택 청년 대상 실제 납부하는 임차료 전액 현금 계좌 입금.",
    targetMatch: "만 19~34세 독립 무주택 청년, 중위소득 60% 이하",
    deadline: "2026 연중 접수 중",
    agency: "국토교통부 / 복지로",
  },
  {
    id: "job-seeker",
    title: "국민취업지원제도 1유형 구직촉진수당",
    category: "취업/구직",
    maxBenefit: "월 50만원 × 6개월 (총 300만원)",
    summary: "취업 준비 기간 동안 맞춤형 취업 지원 서비스와 함께 구직 활동비 현금 지급.",
    targetMatch: "만 15~69세 구직자, 중위소득 60% 이하",
    deadline: "상시 접수",
    agency: "고용노동부",
  },
  {
    id: "earned-income",
    title: "근로장려금 / 자녀장려금",
    category: "세금 환급",
    maxBenefit: "단독 가구 최대 165만원, 맞벌이 330만원",
    summary: "열심히 일하지만 소득이 적은 근로자·사업자 가구에 국세청에서 지급하는 현금 복지.",
    targetMatch: "연소득 기준 충족 근로자/프리랜서",
    deadline: "정기 5월, 반기 3월/9월",
    agency: "국세청 홈택스",
  },
];

export const SubsidyCalcApp: React.FC<SubsidyCalcAppProps> = ({ onBack }) => {
  const [step, setStep] = useState<number>(1);
  const [ageGroup, setAgeGroup] = useState<string>("youth");
  const [jobStatus, setJobStatus] = useState<string>("employee");
  const [incomeRange, setIncomeRange] = useState<string>("under36");
  const [results, setResults] = useState<SubsidyItem[]>([]);
  const [unlockedGuide, setUnlockedGuide] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const handleDiagnose = () => {
    setResults(SUBSIDIES);
    setStep(3);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="지원금 모의 계산기"
        subtitle="2026 정부지원금 모의 계산 및 자가진단"
        onBack={onBack}
        rightAction={<TossBadge variant="green">2026 최신 복지</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {step < 3 ? (
          <TossCard
            title="1분 맞춤 조건 선택"
            subtitle="나에게 해당하는 조건을 터치해주세요"
            badge={<TossBadge variant="blue">단계 {step}/2</TossBadge>}
          >
            {step === 1 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-toss-text block mb-2">1. 연령대</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "youth", label: "만 19~34세 (청년)" },
                      { id: "middle", label: "만 35~49세" },
                      { id: "senior", label: "만 50세 이상" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAgeGroup(item.id)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition ${
                          ageGroup === item.id
                            ? "bg-toss-blue text-white border-toss-blue shadow-sm"
                            : "bg-toss-bg text-toss-subtext border-transparent"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-toss-text block mb-2">2. 현재 신분</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "employee", label: "직장인 (4대보험 가입)" },
                      { id: "jobseeker", label: "취업준비생 / 구직자" },
                      { id: "freelancer", label: "프리랜서 / 자영업" },
                      { id: "student", label: "대학생 / 휴학생" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setJobStatus(item.id)}
                        className={`p-3 rounded-2xl text-xs font-bold border transition ${
                          jobStatus === item.id
                            ? "bg-toss-blue text-white border-toss-blue shadow-sm"
                            : "bg-toss-bg text-toss-subtext border-transparent"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <TossButton variant="primary" onClick={() => setStep(2)}>
                  다음 단계 (소득 선택)
                </TossButton>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-toss-text block mb-2">
                    3. 작년 연간 소득 구간 (세전)
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "under36", label: "연 3,600만원 이하 (가장 많은 지원금 해당)" },
                      { id: "under50", label: "연 3,600만원 ~ 5,000만원 이하" },
                      { id: "under75", label: "연 5,000만원 ~ 7,500만원 이하" },
                      { id: "over75", label: "연 7,500만원 초과" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setIncomeRange(item.id)}
                        className={`w-full p-3.5 rounded-2xl text-xs font-bold border text-left flex items-center justify-between transition ${
                          incomeRange === item.id
                            ? "bg-toss-blue text-white border-toss-blue shadow-sm"
                            : "bg-toss-bg text-toss-subtext border-transparent"
                        }`}
                      >
                        <span>{item.label}</span>
                        {incomeRange === item.id && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <TossButton variant="secondary" onClick={() => setStep(1)} className="w-1/3">
                    이전
                  </TossButton>
                  <TossButton variant="primary" onClick={handleDiagnose} className="w-2/3">
                    진단 결과 조회하기
                  </TossButton>
                </div>
              </div>
            )}
          </TossCard>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* Results Banner */}
            <TossCard padding="lg" className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <span className="text-xs text-emerald-200 font-semibold">진단 완료</span>
              <h3 className="text-2xl font-black mt-1">
                신청 가능한 지원금 <span className="text-amber-300">{results.length}건</span> 발견
              </h3>
              <p className="text-xs text-emerald-100 mt-2">
                조건 부합 시 연간 최대 <span className="font-bold underline text-white">560만원</span> 상당의 혜택을 받을 수 있습니다.
              </p>
            </TossCard>

            {/* List */}
            <div className="space-y-3">
              {results.map((sub) => (
                <TossCard key={sub.id} padding="md">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <TossBadge variant="blue" size="sm">{sub.category}</TossBadge>
                        <span className="text-[11px] text-toss-muted">{sub.agency}</span>
                      </div>
                      <h4 className="text-base font-bold text-toss-text mt-1.5">{sub.title}</h4>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl my-3">
                    <span className="text-xs font-extrabold text-emerald-800">{sub.maxBenefit}</span>
                  </div>

                  <p className="text-xs text-toss-subtext leading-relaxed">{sub.summary}</p>

                  <div className="mt-3 pt-2.5 border-t border-toss-border/60 flex items-center justify-between text-xs">
                    <span className="text-toss-muted">신청 기한: {sub.deadline}</span>
                    <button
                      onClick={() => alert(`${sub.title} 공식 접수 페이지(정부24/복지로)로 연결됩니다.`)}
                      className="font-bold text-toss-blue hover:underline flex items-center gap-1"
                    >
                      <span>신청하기</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TossCard>
              ))}
            </div>

            {/* Application Checklist Guide Unlock */}
            <TossCard
              title="📑 1분 신청 필수 서류 & 탈락 방지 가이드"
              subtitle="정부24 및 은행 심사에서 한 번에 통과하는 필수 제출서류 체크리스트"
              badge={<TossBadge variant="orange">인기 자료</TossBadge>}
            >
              {unlockedGuide ? (
                <div className="space-y-2.5 text-xs text-toss-subtext pt-2 animate-fade-in">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <h5 className="font-bold text-toss-blue mb-1">✓ 필수 서류 3종 원스톱 발급 순서</h5>
                    <p>1. 주민등록등본 (정부24 무인민원기 무료)</p>
                    <p>2. 소득금액증명원 (홈택스 모바일 간편발급)</p>
                    <p>3. 임대차계약서 확정일자 부여본 (주거지원금 필수)</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                    <h5 className="font-bold mb-1">⚠️ 가장 많이 탈락하는 실수</h5>
                    <p>부모 소득 합산 기준과 세대 분리 요건을 사전에 맞추지 않으면 반려될 수 있습니다.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center pt-2">
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                      광고 보고 가이드 받기
                    </TossButton>
                    <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                      토스페이 990원 결제
                    </TossButton>
                  </div>
                </div>
              )}
            </TossCard>

            <button
              onClick={() => {
                setStep(1);
                setResults([]);
              }}
              className="w-full text-center text-xs text-toss-muted hover:underline py-2"
            >
              조건 다시 입력하기
            </button>
          </div>
        )}

        <AdBanner
          title="신한카드 Mr.Life 공과금 할인"
          subtitle="전기/도시가스/통신비 매월 10% 청구할인 혜택"
        />
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="정부지원금 1분 신청 서류 체크리스트 열람"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => setUnlockedGuide(true)}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="정부지원금 올패스 서류 가이드 & 1:1 체크리스트"
        price={990}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => setUnlockedGuide(true)}
      />
    </div>
  );
};

export const SubsidyFinderApp = SubsidyCalcApp;
