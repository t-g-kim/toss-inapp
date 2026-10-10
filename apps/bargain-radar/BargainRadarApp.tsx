import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { TrendingDown, Sparkles, Lock, ArrowUpRight, ShieldCheck, Activity, BarChart3, Info } from "lucide-react";
import confetti from "canvas-confetti";

interface BargainRadarAppProps {
  onBack?: () => void;
}

interface StockCandidate {
  rank: number;
  symbol: string;
  name: string;
  market: "KR" | "US";
  currentPrice: string;
  changeRate: string;
  rsi: number;
  bollingerStatus: string;
  hexaScore: number;
  reboundTarget: string;
  supportLine: string;
  thesis: string;
}

const CANDIDATES: StockCandidate[] = [
  {
    rank: 1,
    symbol: "005930",
    name: "삼성전자",
    market: "KR",
    currentPrice: "56,400원",
    changeRate: "-2.4%",
    rsi: 28.5,
    bollingerStatus: "볼린저밴드 하단 -2.2σ 이탈",
    hexaScore: 91,
    reboundTarget: "61,200원 (+8.5%)",
    supportLine: "54,800원",
    thesis: "역대 PBR 1.0배 근접 밸류에이션 바닥권. 외인 매도세 둔화 및 14일 RSI 극단적 과매도 구간 진입.",
  },
  {
    rank: 2,
    symbol: "AAPL",
    name: "애플 (Apple)",
    market: "US",
    currentPrice: "$218.40",
    changeRate: "-1.8%",
    rsi: 30.2,
    bollingerStatus: "볼린저 하단 지지 반등 테스트",
    hexaScore: 89,
    reboundTarget: "$235.00 (+7.6%)",
    supportLine: "$212.00",
    thesis: "신제품 사이클 우려 선반영으로 기관 패시브 매물 출회 완료. 6축 퀀트 및 잉여현금흐름(FCF) 견고.",
  },
  {
    rank: 3,
    symbol: "005380",
    name: "현대차",
    market: "KR",
    currentPrice: "228,000원",
    changeRate: "-3.1%",
    rsi: 31.8,
    bollingerStatus: "하단 밴드 터치",
    hexaScore: 86,
    reboundTarget: "248,000원 (+8.7%)",
    supportLine: "221,000원",
    thesis: "역대 최고 실적 대비 PER 4.5배 수준의 극단적 저평가. 배당수익률 5% 상회로 하방 경직성 확보.",
  },
  {
    rank: 4,
    symbol: "TSLA",
    name: "테슬라 (Tesla)",
    market: "US",
    currentPrice: "$232.10",
    changeRate: "-4.2%",
    rsi: 33.4,
    bollingerStatus: "단기 급락 후 지지선 접근",
    hexaScore: 84,
    reboundTarget: "$258.00 (+11.1%)",
    supportLine: "$220.00",
    thesis: "단기 모멘텀 급락으로 과열 해소. 200일 이평선 지지선에서 기술적 반등 대기 매수세 유입.",
  },
  {
    rank: 5,
    symbol: "035720",
    name: "카카오",
    market: "KR",
    currentPrice: "34,200원",
    changeRate: "-1.9%",
    rsi: 32.1,
    bollingerStatus: "하단 밴드 횡보 수렴",
    hexaScore: 80,
    reboundTarget: "38,500원 (+12.5%)",
    supportLine: "32,800원",
    thesis: "악재 대부분 주가에 선반영. 거래량 급감하며 바닥 다지기 국면.",
  },
];

export const BargainRadarApp: React.FC<BargainRadarAppProps> = ({ onBack }) => {
  const [marketFilter, setMarketFilter] = useState<"ALL" | "KR" | "US">("ALL");
  const [unlockedAll, setUnlockedAll] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockCandidate | null>(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  const filtered = CANDIDATES.filter((item) => {
    if (marketFilter === "ALL") return true;
    return item.market === marketFilter;
  });

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="AI 바겐세일 과매도 레이더"
        subtitle="RSI 과매도 & 6축 저평가 우량주 탐색기"
        onBack={onBack}
        rightAction={<TossBadge variant="red">실시간 스캔</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Banner */}
        <TossCard padding="lg" className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-blue-300 font-bold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Hexa Desk 분석 엔진 탑재
            </span>
            <span className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-400/30 font-semibold">
              RSI 35 이하 집중 발굴
            </span>
          </div>

          <h3 className="text-2xl font-black mt-2">오늘의 바겐세일 우량주</h3>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            통계적으로 하락이 과도하여 반등 확률이 높은 종목을 6축 알고리즘으로 엄선했습니다.
          </p>

          {/* Market Toggle */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
            {(["ALL", "KR", "US"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMarketFilter(m)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                  marketFilter === m
                    ? "bg-toss-blue text-white shadow-xs"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                {m === "ALL" ? "전체 종목" : m === "KR" ? "국내 (코스피/닥)" : "미국 (서학개미)"}
              </button>
            ))}
          </div>
        </TossCard>

        {/* Stock List */}
        <div className="space-y-3">
          {filtered.map((stock, idx) => {
            const isLocked = idx >= 2 && !unlockedAll;

            return (
              <TossCard
                key={stock.symbol}
                padding="md"
                className={`relative overflow-hidden transition ${
                  isLocked ? "bg-gray-50/80" : "hover:border-toss-blue/40"
                }`}
                onClick={() => {
                  if (isLocked) {
                    setAdModalOpen(true);
                  } else {
                    setSelectedStock(stock);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? "bg-amber-400 text-amber-950"
                          : idx === 1
                          ? "bg-slate-300 text-slate-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-toss-text text-base">{stock.name}</span>
                        <span className="text-[11px] text-toss-muted">{stock.symbol}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-toss-text">{stock.currentPrice}</span>
                        <span className="text-xs font-bold text-toss-red">{stock.changeRate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-toss-muted block">AI 헥사곤 점수</span>
                    <span className="text-lg font-black text-toss-blue">{stock.hexaScore}점</span>
                  </div>
                </div>

                {/* Indicators Row */}
                <div className="mt-3 pt-2.5 border-t border-toss-border/50 flex items-center justify-between text-xs">
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold text-[11px]">
                    RSI {stock.rsi} (과매도)
                  </span>
                  <span className="text-toss-subtext text-[11px] font-medium">{stock.bollingerStatus}</span>
                </div>

                {/* Blur overlay if locked */}
                {isLocked && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center p-4 z-10">
                    <div className="text-center">
                      <Lock className="w-5 h-5 mx-auto text-toss-blue mb-1" />
                      <span className="text-xs font-bold text-toss-text block">
                        3위~5위 종목 잠금
                      </span>
                      <span className="text-[10px] text-toss-muted">
                        광고 1회 시청 또는 토스페이로 즉시 열람
                      </span>
                    </div>
                  </div>
                )}
              </TossCard>
            );
          })}
        </div>

        {/* Unlock Action Banner if still locked */}
        {!unlockedAll && (
          <TossCard
            title="🔓 전체 순위 & 반등 목표가 열람"
            subtitle="전문가용 6축 레이더 분석 및 1차 반등 목표가 확인"
            badge={<TossBadge variant="purple">VIP 분석</TossBadge>}
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                광고 보고 전체 잠금해제
              </TossButton>
              <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                토스페이 990원 결제
              </TossButton>
            </div>
          </TossCard>
        )}

        {/* Selected Stock Detail Sheet */}
        {selectedStock && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-toss-text">{selectedStock.name}</h4>
                  <p className="text-xs text-toss-muted">{selectedStock.symbol} · {selectedStock.market} 시장</p>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="text-xs font-bold text-toss-subtext p-1.5 hover:bg-gray-100 rounded-full"
                >
                  닫기
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <span className="text-xs text-toss-blue font-bold block mb-1">AI 반등 분석 결론</span>
                <p className="text-xs text-gray-800 leading-relaxed font-medium">{selectedStock.thesis}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-toss-bg p-3 rounded-xl">
                  <span className="text-toss-muted block mb-0.5">1차 반등 목표가</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {selectedStock.reboundTarget}
                  </span>
                </div>
                <div className="bg-toss-bg p-3 rounded-xl">
                  <span className="text-toss-muted block mb-0.5">손절 마지노선 지지선</span>
                  <span className="font-extrabold text-toss-red text-sm">
                    {selectedStock.supportLine}
                  </span>
                </div>
              </div>

              <TossButton variant="primary" size="md" onClick={() => setSelectedStock(null)}>
                확인 완료
              </TossButton>
            </div>
          </div>
        )}

        <div className="p-3 bg-gray-100/70 rounded-2xl text-[11px] text-toss-muted leading-relaxed">
          <p className="flex items-center gap-1 font-semibold text-toss-subtext mb-1">
            <Info className="w-3.5 h-3.5" /> 투자 유의사항
          </p>
          본 서비스의 퀀트 지표 및 분석 결과는 데이터 통계에 기반한 모의 참고용 정보이며, 특정 종목의 매수·매도를 권유하지 않습니다. 모든 투자 판단과 책임은 투자자 본인에게 있습니다.
        </div>

        <AdBanner
          title="미래에셋증권 미국주식 온라인 수수료 0원"
          subtitle="환전 우대 90% 혜택받고 서학개미 출발하기"
        />
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="오늘의 AI 과매도 줍줍 레이더 전체 종목 잠금 해제"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setUnlockedAll(true);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        }}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="AI 바겐세일 줍줍 레이더 VIP 무제한 패스"
        price={990}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setUnlockedAll(true);
        }}
      />
    </div>
  );
};
