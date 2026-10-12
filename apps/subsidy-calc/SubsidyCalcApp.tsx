import React, { useState, useEffect } from "react";
import { TossCard, TossButton, TossBadge, RewardedAdModal, TossPayModal } from "@shared/index";
import { Search, CheckCircle2, ExternalLink, FileText, ArrowRight, Wallet, Check, ChevronLeft } from "lucide-react";
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
  annualValue: number; // 만원 단위 (연간 예상 환산 혜택)
  summary: string;
  targetMatch: string;
  deadline: string;
  agency: string;
  matchReason: string; // 왜 내 조건에 매칭되었는지 명확한 사유 (토스 UX 원칙 5)
  isEligible: (age: string, job: string, income: string) => boolean;
}

const SUBSIDIES: SubsidyItem[] = [
  {
    id: "k-pass",
    title: "K-패스 대중교통비 환급 지원",
    category: "교통비",
    maxBenefit: "월 최대 53% 환급 (연 21만원)",
    annualValue: 21,
    summary: "월 15회 이상 대중교통 이용 시 지출 금액의 20~53%를 다음 달 현금 환급.",
    targetMatch: "전 국민 (청년 30%, 일반 20%, 저소득 53%)",
    deadline: "상시 신청 가능",
    agency: "국토교통부",
    matchReason: "전 연령 및 전 직업군 대중교통 이용자 공통 환급 대상",
    isEligible: () => true, // 전 국민 대상
  },
  {
    id: "youth-leap",
    title: "청년도약계좌 정부기여금",
    category: "목돈 만들기",
    maxBenefit: "정부지원금 + 비과세 연 최대 9.5% 적금 효과 (연 144만원)",
    annualValue: 144,
    summary: "매달 최대 70만원 저축 시 정부가 매칭 기여금을 얹어 5년 만기 5,000만원 목돈 마련 지원.",
    targetMatch: "만 19~34세, 개인소득 7,500만원 이하",
    deadline: "매월 초 신청 접수",
    agency: "서민금융진흥원",
    matchReason: "만 19~34세 청년 연령 및 소득 7,500만원 이하 기준 충족",
    isEligible: (age, _job, income) => age === "youth" && income !== "over75",
  },
  {
    id: "rent-support",
    title: "청년 월세 특별지원 (2차)",
    category: "주거비",
    maxBenefit: "월 최대 20만원 (12개월간 총 240만원)",
    annualValue: 240,
    summary: "부모와 별도 거주하는 무주택 청년 대상 실제 납부하는 임차료 전액 현금 계좌 입금.",
    targetMatch: "만 19~34세 독립 무주택 청년, 중위소득 60% 이하",
    deadline: "연중 상시 접수",
    agency: "국토교통부 / 복지로",
    matchReason: "만 19~34세 청년 및 소득 3,600만원 이하 독립 주거 요건 충족",
    isEligible: (age, _job, income) => age === "youth" && income === "under36",
  },
  {
    id: "job-seeker",
    title: "국민취업지원제도 1유형 구직촉진수당",
    category: "취업/구직",
    maxBenefit: "월 50만원 × 6개월 (총 300만원)",
    annualValue: 300,
    summary: "취업 준비 기간 동안 맞춤형 취업 지원 서비스와 함께 구직 활동비 현금 지급.",
    targetMatch: "만 15~69세 구직자, 중위소득 60% 이하",
    deadline: "상시 접수",
    agency: "고용노동부",
    matchReason: "구직자/취업준비생 신분 및 소득 지원 요건 충족",
    isEligible: (age, job, income) =>
      age !== "senior" && (job === "jobseeker" || job === "student") && income === "under36",
  },
  {
    id: "earned-income",
    title: "근로장려금 / 자녀장려금",
    category: "세금 환급",
    maxBenefit: "단독 가구 최대 165만원, 맞벌이 330만원",
    annualValue: 165,
    summary: "열심히 일하지만 소득이 적은 근로자·사업자 가구에 국세청에서 지급하는 현금 복지.",
    targetMatch: "연소득 기준 충족 근로자/프리랜서",
    deadline: "정기 5월, 반기 3월/9월",
    agency: "국세청 홈택스",
    matchReason: "근로자·프리랜서 소득 및 연간 총소득 3,600만원 이하 기준 충족",
    isEligible: (_age, job, income) =>
      (job === "employee" || job === "freelancer") && income === "under36",
  },
  {
    id: "middle-career",
    title: "중장년 내일이음 직업훈련 지원금",
    category: "직무/재취업",
    maxBenefit: "월 최대 28만원 훈련수당 (연간 최대 200만원)",
    annualValue: 200,
    summary: "경력 재설계 및 재취업을 준비하는 중장년 대상 훈련비 전액 국비지원 및 훈련장려금 지급.",
    targetMatch: "만 35세 이상 중장년 구직자 및 이직 희망자",
    deadline: "상시 접수",
    agency: "고용노동부",
    matchReason: "만 35세 이상 중장년 연령 요건 충족",
    isEligible: (age, _job, income) => (age === "middle" || age === "senior") && income !== "over75",
  },
  {
    id: "senior-job",
    title: "신중년 사회공헌 및 시니어 일자리 지원금",
    category: "시니어 활동",
    maxBenefit: "월 최대 76만원 활동실비 (연 최대 912만원)",
    annualValue: 912,
    summary: "풍부한 사회적 경험을 가진 50대 이상 신중년의 공공·사회적 기업 활동 참여수당 지원.",
    targetMatch: "만 50세 이상 신중년 경력자",
    deadline: "연중 상시",
    agency: "한국노인인력개발원",
    matchReason: "만 50세 이상 시니어 연령 요건 충족",
    isEligible: (age, _job, income) => age === "senior" && income !== "over75",
  },
  {
    id: "student-loan",
    title: "대학생 국가장학금 및 학자금 이자지원",
    category: "학업 지원",
    maxBenefit: "학기당 최대 등록금 전액 지원 (연간 최대 700만원)",
    annualValue: 700,
    summary: "대학생 대상 소득분위별 등록금 필수 감면 및 학자금 대출 무이자/저금리 지원.",
    targetMatch: "대학 재학생·휴학생, 소득 8구간 이하",
    deadline: "1학기/2학기 정기 접수",
    agency: "한국장학재단",
    matchReason: "대학생 신분 및 소득 7,500만원 이하 학자금 지원 요건 충족",
    isEligible: (age, job, income) => age === "youth" && job === "student" && income !== "over75",
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

  useEffect(() => {
    // 토스 네이티브 내비게이션 바 뒤로가기 버튼과 브라우저 히스토리 스택 동기화
    try {
      window.history.replaceState({ step: 1 }, "");
    } catch {}

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.step === "number") {
        setStep(e.state.step);
      } else {
        setStep(1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goToStep = (nextStep: number) => {
    try {
      window.history.pushState({ step: nextStep }, "");
    } catch {}
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDiagnose = () => {
    const matched = SUBSIDIES.filter((sub) => sub.isEligible(ageGroup, jobStatus, incomeRange));
    setResults(matched);
    goToStep(3);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      {/* 로컬 포털 테스트베드 환경에서만 뒤로가기 보조 바 노출 (토스 실제 인앱 환경에서는 완전히 제거) */}
      {onBack && (
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-600 border-b border-slate-200">
          <button
            onClick={onBack}
            className="flex items-center gap-1 font-bold text-slate-700 hover:text-black cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>포털 허브로 돌아가기</span>
          </button>
          <span className="text-[10px] text-slate-400">개발자 모드</span>
        </div>
      )}

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* 상단 서비스 헤딩 (토스 검수 기준 준수: 네이티브 내비게이션 바와 중복되는 헤더 및 백버튼 완전 제거) */}
        <div className="pt-2 pb-1 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-toss-text tracking-tight">
              맞춤 정부지원금 모의 계산
            </h1>
            <p className="text-xs text-toss-muted mt-0.5">
              연령·소득 조건에 따른 예상 복지 수혜금 1분 자가진단
            </p>
          </div>
          <TossBadge variant="green">최신 복지 기준</TossBadge>
        </div>

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

                <TossButton variant="primary" onClick={() => goToStep(2)}>
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
                  <TossButton
                    variant="secondary"
                    onClick={() => {
                      if (window.history.length > 1) {
                        window.history.back();
                      } else {
                        goToStep(1);
                      }
                    }}
                    className="w-1/3"
                  >
                    이전
                  </TossButton>
                  <TossButton variant="primary" onClick={handleDiagnose} className="w-2/3">
                    무료 모의 계산 결과 보기
                  </TossButton>
                </div>
              </div>
            )}
          </TossCard>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {/* 1. 내가 선택한 조건 요약 칩 (토스 UX 원칙 4 & 5 준수) */}
            <div className="bg-white p-3 rounded-2xl border border-toss-border/80 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-toss-muted font-bold">내 조건:</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px]">
                  {ageGroup === "youth" ? "청년 (만 19~34세)" : ageGroup === "middle" ? "중장년 (만 35~49세)" : "시니어 (만 50세 이상)"}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px]">
                  {jobStatus === "employee" ? "직장인" : jobStatus === "jobseeker" ? "구직자" : jobStatus === "freelancer" ? "프리랜서" : "대학생"}
                </span>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-lg text-[11px]">
                  {incomeRange === "under36" ? "3,600만 이하" : incomeRange === "under50" ? "5,000만 이하" : incomeRange === "under75" ? "7,500만 이하" : "7,500만 초과"}
                </span>
              </div>
              <button
                onClick={() => goToStep(1)}
                className="text-[11px] font-bold text-toss-blue hover:underline whitespace-nowrap shrink-0"
              >
                변경
              </button>
            </div>

            {/* 2. Results Banner (완료 명시 및 계산 총액 동적 산출) */}
            <TossCard padding="lg" className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>모의 계산 및 자격 진단 완료</span>
              </div>
              <h3 className="text-2xl font-black mt-1">
                신청 가능한 지원금 <span className="text-amber-300">{results.length}건</span> 발견
              </h3>
              <p className="text-xs text-emerald-100 mt-2">
                조건 부합 시 연간 최대{" "}
                <span className="font-bold underline text-white">
                  약 {results.reduce((acc, cur) => acc + cur.annualValue, 0).toLocaleString()}만원
                </span>{" "}
                상당의 혜택을 받을 수 있습니다.
              </p>
            </TossCard>

            {/* 3. Empty State (원칙 5: 보여줄 내용이 없을 때 이유 명시) */}
            {results.length === 0 ? (
              <TossCard padding="lg" className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="font-bold text-base text-toss-text">해당 조건에 맞는 지원금이 없어요</h4>
                <p className="text-xs text-toss-muted mt-1 leading-relaxed">
                  선택하신 소득 조건 또는 연령 기준에 부합하는 정부 복지 지원금이 조회되지 않았습니다.<br />
                  조건을 변경하여 다시 진단해 보세요.
                </p>
                <div className="mt-4">
                  <TossButton variant="secondary" size="sm" onClick={() => goToStep(1)}>
                    조건 다시 선택하기
                  </TossButton>
                </div>
              </TossCard>
            ) : (
              /* List */
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

                    <div className="bg-emerald-50 border border-emerald-150 p-2.5 rounded-xl my-2.5">
                      <span className="text-xs font-extrabold text-emerald-800">{sub.maxBenefit}</span>
                    </div>

                    {/* 매칭 사유 안내 배지 (원칙 5: 결과가 나온 이유 명시) */}
                    <div className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-700 font-medium flex items-center gap-1.5 mb-2.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 font-bold" />
                      <span><strong>매칭 사유:</strong> {sub.matchReason}</span>
                    </div>

                    <p className="text-xs text-toss-subtext leading-relaxed">{sub.summary}</p>

                    <div className="mt-3 pt-2.5 border-t border-toss-border/60 flex items-center justify-between text-xs">
                      <span className="text-toss-muted">신청 기한: {sub.deadline}</span>
                      <button
                        onClick={() => alert(`${sub.title} 공식 접수 페이지(정부24/복지로)로 연결됩니다.`)}
                        className="font-bold text-toss-blue hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>신청 안내</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TossCard>
                ))}
              </div>
            )}

            {/* Application Checklist Guide Unlock */}
            <TossCard
              title="📑 1분 신청 필수 서류 & 탈락 방지 가이드"
              subtitle="정부24 및 은행 심사에서 한 번에 통과하는 필수 제출서류 체크리스트"
              badge={<TossBadge variant="orange">선택 열람</TossBadge>}
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
                <div className="pt-2 text-center">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 mb-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-md tracking-wider">
                        [광고 안내]
                      </span>
                      <span className="text-[11px] text-blue-600 font-bold">약 5초 동영상</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                      정부지원금 서류 체크리스트는 <strong>[광고] 5초 시청 후 무료</strong>로 열람하시거나, 광고 없이 즉시 열람(990원)을 선택하실 수 있어요.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <TossButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setAdModalOpen(true)}
                    >
                      <span className="flex items-center justify-center gap-1 font-bold">
                        <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-black rounded">AD</span>
                        <span>[광고] 5초 시청 후 무료</span>
                      </span>
                    </TossButton>
                    <TossButton
                      variant="primary"
                      size="sm"
                      onClick={() => setPayModalOpen(true)}
                    >
                      광고 없이 열람 (990원)
                    </TossButton>
                  </div>
                </div>
              )}
            </TossCard>

            <button
              onClick={() => {
                goToStep(1);
                setResults([]);
              }}
              className="w-full text-center text-xs text-toss-muted hover:underline py-2"
            >
              조건 다시 입력하기
            </button>
          </div>
        )}
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
