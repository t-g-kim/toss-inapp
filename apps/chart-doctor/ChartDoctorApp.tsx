import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Search, Stethoscope, AlertTriangle, CheckCircle, Shield, TrendingUp, BarChart2 } from "lucide-react";
import confetti from "canvas-confetti";

interface ChartDoctorAppProps {
  onBack?: () => void;
}

interface DiagnosisResult {
  symbol: string;
  name: string;
  price: string;
  score: number;
  status: "GOOD" | "CAUTION" | "DANGER";
  statusText: string;
  maStatus: string;
  rsiStatus: string;
  volStatus: string;
  bandStatus: string;
  prescription: string;
  supportLevel: string;
  resistanceLevel: string;
}

const PRESET_STOCKS: Record<string, DiagnosisResult> = {
  "005930": {
    symbol: "005930",
    name: "삼성전자",
    price: "56,400원",
    score: 82,
    status: "GOOD",
    statusText: "과매도 반등 국면 (바닥 다지기)",
    maStatus: "20일 이평선 돌파 시도 중 (단기 골든크로스 임박)",
    rsiStatus: "RSI 29.4 (극단적 과매도 해소 중)",
    volStatus: "하락 시 거래량 급감 (매도세 소진)",
    bandStatus: "볼린저밴드 하단선 지지 확인",
    prescription: "55,000원을 이탈하지 않는 한 분할 매수 관점이 유효하며 단기 기술적 반등 기대 가능.",
    supportLevel: "54,800원",
    resistanceLevel: "61,000원",
  },
  "000660": {
    symbol: "000660",
    name: "SK하이닉스",
    price: "182,000원",
    score: 88,
    status: "GOOD",
    statusText: "상승 추세 유지 (강한 모멘텀)",
    maStatus: "완벽한 정배열 (5일 > 20일 > 60일)",
    rsiStatus: "RSI 58.2 (적정 상승 강도)",
    volStatus: "기관/외인 쌍끌이 매수 지속",
    bandStatus: "볼린저 중심선 타고 우상향",
    prescription: "추세 추종 매매에 최적. 20일 이평선(175,000원)을 손절 라인으로 잡고 보유 추천.",
    supportLevel: "175,000원",
    resistanceLevel: "198,000원",
  },
  "TSLA": {
    symbol: "TSLA",
    name: "테슬라 (Tesla)",
    price: "$232.10",
    score: 64,
    status: "CAUTION",
    statusText: "단기 변동성 확대 (관망 권장)",
    maStatus: "5일 이평선 20일 하향 이탈 (단기 데드크로스)",
    rsiStatus: "RSI 46.1 (중립 국면)",
    volStatus: "실적 발표 앞두고 거래량 감소",
    bandStatus: "밴드 폭 수축 후 방향성 탐색",
    prescription: "신규 진입은 240달러 돌파 안착을 확인한 후 진행하는 것이 안전합니다.",
    supportLevel: "$218.00",
    resistanceLevel: "$245.00",
  },
  "NVDA": {
    symbol: "NVDA",
    name: "엔비디아 (NVIDIA)",
    price: "$134.80",
    score: 93,
    status: "GOOD",
    statusText: "초강세장 지속 (주도주)",
    maStatus: "신고가 경신형 정배열",
    rsiStatus: "RSI 65.4 (강한 매수세)",
    volStatus: "돌파 캔들 거래량 수반",
    bandStatus: "상단 밴드 확장 (Band Walking)",
    prescription: "주도주 프리미엄 유지 중. 5일선 이탈 전까지 익절 보류하고 수익 극대화 전략.",
    supportLevel: "$128.00",
    resistanceLevel: "$145.00",
  },
};

export const ChartDoctorApp: React.FC<ChartDoctorAppProps> = ({ onBack }) => {
  const [query, setQuery] = useState("");
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult>(PRESET_STOCKS["005930"]);
  const [diagnosisCount, setDiagnosisCount] = useState(1);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [pendingStockKey, setPendingStockKey] = useState<string | null>(null);

  const handleSelectStock = (key: string) => {
    if (diagnosisCount >= 3) {
      setPendingStockKey(key);
      setAdModalOpen(true);
      return;
    }

    setDiagnosisCount((c) => c + 1);
    setCurrentDiagnosis(PRESET_STOCKS[key] || PRESET_STOCKS["005930"]);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const getStatusBadge = (status: DiagnosisResult["status"]) => {
    if (status === "GOOD") return <TossBadge variant="green">🟢 건강 (기회)</TossBadge>;
    if (status === "CAUTION") return <TossBadge variant="orange">🟡 주의 (관망)</TossBadge>;
    return <TossBadge variant="red">🔴 위험 (경고)</TossBadge>;
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="내 주식 AI 차트 닥터"
        subtitle="1초 차트 건강검진 & 처방전"
        onBack={onBack}
        rightAction={<TossBadge variant="blue">오늘 남은 무료 진단: {Math.max(0, 3 - diagnosisCount)}회</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Quick Presets */}
        <TossCard padding="sm">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {Object.keys(PRESET_STOCKS).map((k) => {
              const stock = PRESET_STOCKS[k];
              const isSelected = currentDiagnosis.symbol === stock.symbol;
              return (
                <button
                  key={k}
                  onClick={() => handleSelectStock(k)}
                  className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-toss-blue text-white shadow-xs"
                      : "bg-toss-bg text-toss-subtext hover:bg-gray-200"
                  }`}
                >
                  <span>{stock.name}</span>
                </button>
              );
            })}
          </div>
        </TossCard>

        {/* Diagnosis Score Card */}
        <TossCard
          padding="lg"
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">{currentDiagnosis.name}</h3>
                <span className="text-xs text-indigo-300">{currentDiagnosis.symbol}</span>
              </div>
              <p className="text-sm font-semibold text-gray-300 mt-0.5">{currentDiagnosis.price}</p>
            </div>
            {getStatusBadge(currentDiagnosis.status)}
          </div>

          <div className="flex items-baseline gap-2 mt-4 pt-3 border-t border-white/10">
            <span className="text-xs text-indigo-200">차트 종합 건강 점수</span>
            <span className="text-3xl font-black text-amber-300">{currentDiagnosis.score}점</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>

          <p className="text-xs text-indigo-100 mt-2 font-medium">
            진단: {currentDiagnosis.statusText}
          </p>
        </TossCard>

        {/* 4 Health Checkup Items */}
        <TossCard title="4대 기술적 지표 정밀 검진표" subtitle="Toss MCP 기술적 지표(read_chart) 실시간 판독">
          <div className="space-y-2.5 text-xs pt-1">
            <div className="p-3 bg-toss-bg rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-toss-text">1. 이동평균선 배열</span>
                <span className="text-toss-blue font-semibold">이평선 점검</span>
              </div>
              <p className="text-toss-subtext">{currentDiagnosis.maStatus}</p>
            </div>

            <div className="p-3 bg-toss-bg rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-toss-text">2. RSI 강도 지수</span>
                <span className="text-toss-blue font-semibold">과열/침체</span>
              </div>
              <p className="text-toss-subtext">{currentDiagnosis.rsiStatus}</p>
            </div>

            <div className="p-3 bg-toss-bg rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-toss-text">3. 볼린저밴드 위치</span>
                <span className="text-toss-blue font-semibold">변동성</span>
              </div>
              <p className="text-toss-subtext">{currentDiagnosis.bandStatus}</p>
            </div>

            <div className="p-3 bg-toss-bg rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-toss-text">4. 거래량 및 수급</span>
                <span className="text-toss-blue font-semibold">신뢰도</span>
              </div>
              <p className="text-toss-subtext">{currentDiagnosis.volStatus}</p>
            </div>
          </div>
        </TossCard>

        {/* AI Prescription */}
        <TossCard
          title="🩺 AI 닥터 최종 처방전"
          subtitle="매매 타이밍 및 손절/익절 마지노선"
          badge={<TossBadge variant="purple">핵심 조언</TossBadge>}
        >
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl mb-3 text-xs leading-relaxed text-blue-950 font-medium">
            {currentDiagnosis.prescription}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-toss-bg p-3 rounded-xl">
              <span className="text-toss-muted block mb-0.5">핵심 지지선 (손절선)</span>
              <span className="font-black text-toss-red text-sm">{currentDiagnosis.supportLevel}</span>
            </div>
            <div className="bg-toss-bg p-3 rounded-xl">
              <span className="text-toss-muted block mb-0.5">핵심 저항선 (익절 목표)</span>
              <span className="font-black text-emerald-600 text-sm">{currentDiagnosis.resistanceLevel}</span>
            </div>
          </div>
        </TossCard>

        {/* Over Quota Action */}
        {diagnosisCount >= 3 && (
          <TossCard
            title="오늘 무료 진단 횟수 소진"
            subtitle="보상형 광고를 시청하거나 토스페이 490원으로 무제한 진단하세요"
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                광고 보고 1회 충전
              </TossButton>
              <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                토스페이 490원 결제
              </TossButton>
            </div>
          </TossCard>
        )}

        <AdBanner
          title="키움증권 영웅문 비대면 계좌개설"
          subtitle="국내주식 4만원 혜택 + 미국주식 $33 수수료 지원"
        />
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="차트 닥터 추가 정밀 검진권 1회 지급"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setDiagnosisCount(1);
          if (pendingStockKey) {
            setCurrentDiagnosis(PRESET_STOCKS[pendingStockKey]);
            setPendingStockKey(null);
          }
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="차트 닥터 무제한 검진 패스 (오늘 하루 프리패스)"
        price={490}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setDiagnosisCount(0);
        }}
      />
    </div>
  );
};
