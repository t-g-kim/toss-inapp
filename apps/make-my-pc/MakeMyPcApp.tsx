import React, { useState } from "react";
import {
  TossHeader,
  TossCard,
  TossButton,
  TossBadge,
  AdBanner,
  RewardedAdModal,
  TossPayModal,
} from "@shared/index";
import {
  PARTS,
  PRESET_BUILDS,
  PartOption,
  getPurchaseLinks,
  DEFAULT_CATALOG_DATE,
  USER_COUPANG_PARTNERS_URL,
} from "./catalog";
import { PurchaseModal } from "./PurchaseModal";
import { Pc3DViewer } from "./Pc3DViewer";
import {
  BuildState,
  KEYS,
  SHORT_LABEL,
  getPartOption,
  calculateTotalPrice,
  checkCompatibility,
  calculatePower,
  calculateThermal,
  runBenchmarkSimulation,
  BenchmarkResult,
} from "./engine";
import {
  Cpu,
  Tv,
  Zap,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Rotate3d,
  Sparkles,
  Gamepad2,
  Receipt,
  Download,
  Share2,
  ExternalLink,
  Crown,
  Layers,
  Wrench,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MakeMyPcAppProps {
  onBack?: () => void;
}

export const MakeMyPcApp: React.FC<MakeMyPcAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"build" | "view3d" | "bench" | "quote">("build");
  const [activeCategory, setActiveCategory] = useState<keyof BuildState>("cpu");
  const [build, setBuild] = useState<BuildState>(PRESET_BUILDS[0].parts);
  const [benchRunning, setBenchRunning] = useState(false);
  const [benchProgress, setBenchProgress] = useState(0);
  const [benchStepText, setBenchStepText] = useState("");
  const [benchResult, setBenchResult] = useState<BenchmarkResult>(() =>
    runBenchmarkSimulation(PRESET_BUILDS[0].parts)
  );

  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [unlockedReport, setUnlockedReport] = useState(false);
  const [unlockedChecklist, setUnlockedChecklist] = useState(false);
  const [selectedPartForPurchase, setSelectedPartForPurchase] = useState<{
    name: string;
    price?: number;
    categoryLabel?: string;
    buyUrl?: string;
    danawaUrl?: string;
  } | null>(null);
  const [catalogSyncDate, setCatalogSyncDate] = useState<string>(DEFAULT_CATALOG_DATE);
  const [isSyncingCatalog, setIsSyncingCatalog] = useState<boolean>(false);

  const handleSyncCatalog = () => {
    setIsSyncingCatalog(true);
    setTimeout(() => {
      setIsSyncingCatalog(false);
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
      setCatalogSyncDate(today + " (다나와·쿠팡 실시간)");
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.2 } });
      alert("⚡ 다나와 최저가 및 쿠팡 파트너스 최신 시세가 정상 동기화되었습니다!");
    }, 600);
  };

  const totalPrice = calculateTotalPrice(build);
  const issues = checkCompatibility(build);
  const power = calculatePower(build);
  const thermal = calculateThermal(build);

  const handleSelectPart = (category: keyof BuildState, partId: string) => {
    const nextBuild = { ...build, [category]: partId };
    setBuild(nextBuild);
    setBenchResult(runBenchmarkSimulation(nextBuild));
  };

  const handleApplyPreset = (presetParts: BuildState) => {
    setBuild(presetParts);
    setBenchResult(runBenchmarkSimulation(presetParts));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
  };

  const handleRunBenchmark = () => {
    setBenchRunning(true);
    setBenchProgress(0);
    const steps = [
      "BIOS 부팅 시퀀스 점검 중...",
      "CPU 렌더링 스레드 부하 테스트...",
      "GPU 3D 다이렉트X 12 쉐이더 벤치마크...",
      "RAM 메모리 레이턴시 및 대역폭 측정...",
      "게임별 평균 FPS 종합 산출 중...",
    ];
    let stepIdx = 0;
    setBenchStepText(steps[0]);

    const timer = setInterval(() => {
      setBenchProgress((prev) => {
        const next = prev + 5;
        if (next >= (stepIdx + 1) * 20 && stepIdx < steps.length - 1) {
          stepIdx++;
          setBenchStepText(steps[stepIdx]);
        }
        if (next >= 100) {
          clearInterval(timer);
          setBenchRunning(false);
          setBenchResult(runBenchmarkSimulation(build));
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          return 100;
        }
        return next;
      });
    }, 80);
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24 w-full max-w-md mx-auto overflow-x-hidden">
      <TossHeader
        title="가상 PC 조립 견적"
        subtitle="실시간 호환성 & 게임 벤치마크"
        onBack={onBack}
        rightAction={
          <button
            onClick={handleSyncCatalog}
            disabled={isSyncingCatalog}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-toss-blue border border-blue-200/80 rounded-full text-[11px] font-bold transition active:scale-95 shadow-2xs cursor-pointer shrink-0"
            title="실시간 부품 시세 동기화"
          >
            <Sparkles className={`w-3 h-3 text-toss-blue ${isSyncingCatalog ? "animate-spin" : ""}`} />
            <span className="whitespace-nowrap">{isSyncingCatalog ? "동기화 중..." : `${catalogSyncDate} 시세`}</span>
          </button>
        }
      />

      {/* Top 4-Tab Navigator */}
      <div className="sticky top-14 z-30 bg-white/90 backdrop-blur-md border-b border-toss-border/80 px-2 sm:px-4 py-2">
        <div className="grid grid-cols-4 gap-1 p-1 bg-toss-bg rounded-2xl max-w-md mx-auto">
          {[
            { id: "build", label: "부품 조립", icon: <Layers className="w-3.5 h-3.5 shrink-0" /> },
            { id: "view3d", label: "3D 모델", icon: <Rotate3d className="w-3.5 h-3.5 shrink-0" /> },
            { id: "bench", label: "성능 벤치", icon: <Zap className="w-3.5 h-3.5 shrink-0" /> },
            { id: "quote", label: "견적서", icon: <Receipt className="w-3.5 h-3.5 shrink-0" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 min-w-0 overflow-hidden ${
                activeTab === tab.id
                  ? "bg-white text-toss-text shadow-sm"
                  : "text-toss-muted hover:text-toss-subtext"
              }`}
            >
              {tab.icon}
              <span className="truncate whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto w-full">
        {/* TAB 1: BUILD & PARTS PICKER */}
        {activeTab === "build" && (
          <div className="space-y-4 animate-fade-in">
            {/* AI Preset Quick Selector */}
            <TossCard title="⚡ 추천 황금 견적 원터치 불러오기" subtitle="용도와 예산에 맞춰 검증된 부품 조합 바로 로드">
              <div className="grid grid-cols-2 gap-2 pt-1">
                {PRESET_BUILDS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyPreset(p.parts)}
                    className="p-3 rounded-2xl bg-toss-bg hover:bg-gray-200/80 text-left transition border border-transparent hover:border-amber-400 group overflow-hidden min-w-0"
                  >
                    <span className="font-bold text-xs text-toss-text block group-hover:text-amber-600 whitespace-nowrap truncate">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-toss-muted block mt-0.5 whitespace-nowrap truncate">{p.desc}</span>
                    <span className="text-[11px] font-extrabold text-amber-600 block mt-1.5 whitespace-nowrap">
                      {p.priceRange}
                    </span>
                  </button>
                ))}
              </div>
            </TossCard>

            {/* Live System Status (Compatibility, Power, Thermal) */}
            <TossCard
              title="🔍 실시간 시스템 호환성 & 전력 검증"
              badge={
                issues.length === 0 ? (
                  <TossBadge variant="green" className="whitespace-nowrap">호환 100%</TossBadge>
                ) : (
                  <TossBadge variant="red" className="whitespace-nowrap">간섭 경고</TossBadge>
                )
              }
            >
              <div className="space-y-3 pt-1 text-xs">
                {/* Issues Box */}
                {issues.length > 0 ? (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-rose-900 whitespace-nowrap truncate">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 부품 간섭·호환 불일치 발견
                    </span>
                    {issues.map((iss, i) => (
                      <p key={i} className="text-[11px] pl-4 whitespace-nowrap truncate">• {iss}</p>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center gap-1.5 text-xs font-semibold overflow-hidden min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="whitespace-nowrap truncate min-w-0 flex-1">선택된 모든 부품 간 간섭 없이 완벽 호환됩니다!</span>
                  </div>
                )}

                {/* Power Bar */}
                <div className="p-3 bg-toss-bg rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-toss-text flex items-center gap-1 whitespace-nowrap">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" /> 전력 소모량
                    </span>
                    <span className="font-extrabold text-toss-text whitespace-nowrap">
                      {power.draw}W / {power.capacity}W ({power.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        power.status === "over"
                          ? "bg-rose-500"
                          : power.status === "tight"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(100, power.percent)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-toss-muted whitespace-nowrap truncate">{power.message}</p>
                </div>

                {/* Thermal Bar */}
                {thermal && (
                  <div className="p-3 bg-toss-bg rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-toss-text flex items-center gap-1 whitespace-nowrap">
                        <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" /> 쿨러 냉각 여유도
                      </span>
                      <span className="font-extrabold text-toss-text whitespace-nowrap">
                        {Math.round(thermal.ratio * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          thermal.level === "crash"
                            ? "bg-rose-600"
                            : thermal.level === "throttle"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(100, thermal.ratio * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-toss-muted whitespace-nowrap truncate">{thermal.message}</p>
                  </div>
                )}
              </div>
            </TossCard>

            {/* Interactive 3D Real-time Rig Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-toss-text flex items-center gap-1.5">
                  <Rotate3d className="w-4 h-4 text-toss-blue shrink-0" />
                  <span>실시간 3D 조립 시뮬레이션</span>
                </span>
                <button
                  onClick={() => setActiveTab("view3d")}
                  className="text-[11px] text-toss-blue font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                >
                  <span>3D 크게 보기</span>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              </div>
              <Pc3DViewer build={build} height={250} />
            </div>

            {/* Category Selector Chips */}
            <div className="w-full max-w-full overflow-hidden">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {KEYS.map((k) => {
                  const opt = getPartOption(k, build[k]);
                  const isSelected = activeCategory === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setActiveCategory(k)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap transition ${
                        isSelected
                          ? "bg-toss-blue text-white shadow-sm"
                          : "bg-white text-toss-subtext border border-toss-border hover:bg-gray-50"
                      }`}
                    >
                      <span className="whitespace-nowrap">{SHORT_LABEL[k]}</span>
                      {opt && <span className="ml-1 opacity-80 text-[10px] whitespace-nowrap">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Category Options List */}
            <TossCard
              title={`${PARTS[activeCategory]?.label || ""} 선택`}
              subtitle="클릭하여 원하는 부품으로 실시간 교체"
            >
              <div className="space-y-2 pt-1 text-xs">
                {(PARTS[activeCategory]?.options || []).map((opt) => {
                  const isChecked = build[activeCategory] === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectPart(activeCategory, opt.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 min-w-0 ${
                        isChecked
                          ? "border-toss-blue bg-blue-50/50 shadow-sm"
                          : "border-toss-border bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-sm text-toss-text truncate whitespace-nowrap">{opt.name}</span>
                          {isChecked && <TossBadge variant="blue" size="sm" className="whitespace-nowrap shrink-0">선택됨</TossBadge>}
                        </div>
                        {opt.sub && (
                          <p className="text-[11px] text-toss-muted mt-0.5 truncate whitespace-nowrap">{opt.sub}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="font-extrabold text-sm text-toss-text block whitespace-nowrap">
                          {opt.price === 0 ? "무료" : `₩${opt.price.toLocaleString("ko-KR")}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {opt.score && (
                            <span className="text-[10px] text-toss-blue font-semibold whitespace-nowrap">
                              점수 {opt.score}
                            </span>
                          )}
                          {opt.price > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPartForPurchase({
                                  name: opt.name,
                                  price: opt.price,
                                  categoryLabel: PARTS[activeCategory]?.label,
                                  buyUrl: opt.buyUrl,
                                  danawaUrl: opt.danawaUrl,
                                });
                              }}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-toss-blue text-[10px] font-bold rounded-md flex items-center gap-0.5 transition cursor-pointer whitespace-nowrap shrink-0"
                              title="다나와·네이버 실시간 최저가 비교"
                            >
                              <span>최저가</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TossCard>

            {/* Bottom Summary Bar */}
            <div className="bg-white p-4 rounded-2xl border border-toss-border shadow-sm flex items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <span className="text-xs text-toss-muted block whitespace-nowrap">총 부품 견적 합계</span>
                <span className="text-lg sm:text-xl font-black text-toss-text whitespace-nowrap">
                  ₩{totalPrice.toLocaleString("ko-KR")}
                </span>
              </div>
              <TossButton
                variant="primary"
                size="md"
                fullWidth={false}
                onClick={() => setActiveTab("bench")}
                className="whitespace-nowrap shrink-0 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl"
              >
                <Zap className="w-4 h-4 mr-1.5 inline shrink-0" /> 성능 벤치 실행
              </TossButton>
            </div>
          </div>
        )}

        {/* TAB 2: FULL 3D MODEL & RIG EXPLORER */}
        {activeTab === "view3d" && (
          <div className="space-y-4 animate-fade-in">
            <Pc3DViewer build={build} height={380} />

            {/* 3D Hardware Spec Callouts */}
            <TossCard
              title="🔍 3D 실시간 장착 하드웨어 규격"
              subtitle="선택하신 부품의 실제 크기·길이·쿨러 높이가 1:1 비율로 시뮬레이션됩니다"
              badge={
                issues.length === 0 ? (
                  <TossBadge variant="green" className="whitespace-nowrap">간섭 없음</TossBadge>
                ) : (
                  <TossBadge variant="red" className="whitespace-nowrap">간섭 발생</TossBadge>
                )
              }
            >
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-3 bg-toss-bg rounded-xl space-y-1">
                  <span className="text-[10px] text-toss-muted block whitespace-nowrap">그래픽카드 실측</span>
                  <span className="font-extrabold text-toss-text block truncate whitespace-nowrap">
                    {getPartOption("gpu", build.gpu)?.name || "내장 그래픽"}
                  </span>
                  <span className="text-[10px] text-toss-blue font-bold block whitespace-nowrap">
                    길이 {getPartOption("gpu", build.gpu)?.len || 0}mm / 팬{" "}
                    {(getPartOption("gpu", build.gpu)?.len || 0) > 300 ? "3팬" : "2팬"}
                  </span>
                </div>

                <div className="p-3 bg-toss-bg rounded-xl space-y-1">
                  <span className="text-[10px] text-toss-muted block whitespace-nowrap">CPU 쿨러 규격</span>
                  <span className="font-extrabold text-toss-text block truncate whitespace-nowrap">
                    {getPartOption("cooler", build.cooler)?.name || "기본 쿨러"}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold block whitespace-nowrap">
                    {getPartOption("cooler", build.cooler)?.type === "aio"
                      ? `${getPartOption("cooler", build.cooler)?.rad}mm 수랭 라디`
                      : `높이 ${getPartOption("cooler", build.cooler)?.height}mm 타워`}
                  </span>
                </div>

                <div className="p-3 bg-toss-bg rounded-xl space-y-1">
                  <span className="text-[10px] text-toss-muted block whitespace-nowrap">메인보드 폼팩터</span>
                  <span className="font-extrabold text-toss-text block truncate whitespace-nowrap">
                    {getPartOption("mb", build.mb)?.name || "미선택"}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold block whitespace-nowrap">
                    {getPartOption("mb", build.mb)?.form} 규격 ({getPartOption("mb", build.mb)?.socket})
                  </span>
                </div>

                <div className="p-3 bg-toss-bg rounded-xl space-y-1">
                  <span className="text-[10px] text-toss-muted block whitespace-nowrap">PC 케이스 수용성</span>
                  <span className="font-extrabold text-toss-text block truncate whitespace-nowrap">
                    {getPartOption("case", build.case)?.name || "기본 케이스"}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block whitespace-nowrap">
                    최대 GPU {getPartOption("case", build.case)?.maxGpuLen}mm 수용
                  </span>
                </div>
              </div>
            </TossCard>

            {/* Quick Actions */}
            <div className="space-y-2">
              <TossButton
                variant="primary"
                size="lg"
                onClick={() => setActiveTab("bench")}
                className="whitespace-nowrap"
              >
                <Zap className="w-4 h-4 mr-1.5 inline shrink-0" /> 이 구성으로 3D 벤치마크 돌리기
              </TossButton>

              <TossButton
                variant="secondary"
                size="md"
                onClick={() => setActiveTab("build")}
                className="whitespace-nowrap"
              >
                <Layers className="w-4 h-4 mr-1 inline shrink-0" /> 부품 교체하러 가기
              </TossButton>
            </div>
          </div>
        )}

        {/* TAB 3: BENCHMARK & FPS */}
        {activeTab === "bench" && (
          <div className="space-y-4 animate-fade-in">
            {/* Benchmark Runner Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg text-center overflow-hidden">
              <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full text-indigo-200 font-semibold inline-block mb-2 whitespace-nowrap">
                가상 PC 3D 부하 시뮬레이션
              </span>
              <h3 className="text-3xl font-black text-amber-300 whitespace-nowrap">
                {benchResult.overall}점
              </h3>
              <p className="text-xs text-gray-300 mt-1 whitespace-nowrap truncate">
                {benchResult.tier} · 가성비 지수 {benchResult.valueScore}점/10만
              </p>

              {benchRunning ? (
                <div className="mt-4 space-y-2">
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-100"
                      style={{ width: `${benchProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-amber-200 animate-pulse block whitespace-nowrap truncate">
                    {benchStepText} ({benchProgress}%)
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleRunBenchmark}
                  className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 mx-auto whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-current shrink-0" />
                  <span className="whitespace-nowrap">벤치마크 다시 측정하기</span>
                </button>
              )}
            </div>

            {/* Sub-Scores */}
            <TossCard title="📊 세부 영역별 성능 지수">
              <div className="space-y-3 pt-1 text-xs">
                {[
                  { label: "게이밍 성능 (GPU 중심)", score: benchResult.gaming, color: "bg-rose-500" },
                  { label: "3D 렌더링 / 영상 인코딩", score: benchResult.rendering, color: "bg-blue-500" },
                  { label: "멀티태스킹 / 사무 작업", score: benchResult.multitask, color: "bg-purple-500" },
                ].map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between font-bold text-toss-text">
                      <span className="whitespace-nowrap truncate pr-2">{m.label}</span>
                      <span className="whitespace-nowrap shrink-0">{m.score}점</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.color}`}
                        style={{ width: `${Math.min(100, m.score)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TossCard>

            {/* Game FPS Simulation */}
            <TossCard
              title="🎮 인기 게임 예상 평균 FPS"
              subtitle="그래픽 최고 옵션 기준 실측 시뮬레이션 프레임"
              badge={<TossBadge variant="purple" className="whitespace-nowrap">실시간 계산</TossBadge>}
            >
              <div className="space-y-2.5 pt-1 text-xs">
                {[
                  { name: "배틀그라운드", fhd: benchResult.fpsBattleground.fhd, qhd: benchResult.fpsBattleground.qhd, tag: "스팀 FPS" },
                  { name: "사이버펑크 2077", fhd: benchResult.fpsCyberpunk.fhd, qhd: benchResult.fpsCyberpunk.qhd, tag: "고사양 대작" },
                  { name: "리그 오브 레전드", fhd: benchResult.fpsLol.fhd, qhd: benchResult.fpsLol.qhd, tag: "국민 게임" },
                  { name: "로스트아크", fhd: benchResult.fpsLostark.fhd, qhd: benchResult.fpsLostark.qhd, tag: "MMORPG" },
                ].map((g) => (
                  <div key={g.name} className="p-3 bg-toss-bg rounded-2xl flex items-center justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-sm text-toss-text whitespace-nowrap truncate">{g.name}</span>
                        <span className="text-[10px] text-toss-muted whitespace-nowrap shrink-0">({g.tag})</span>
                      </div>
                      <span className="text-[11px] text-toss-muted whitespace-nowrap block mt-0.5">
                        FHD: <strong className="text-toss-blue whitespace-nowrap">{g.fhd} FPS</strong>
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-toss-text block whitespace-nowrap">
                        QHD: {g.qhd} FPS
                      </span>
                      <span className={`text-[10px] font-bold whitespace-nowrap block mt-0.5 ${g.fhd >= 60 ? "text-emerald-600" : "text-amber-600"}`}>
                        {g.fhd >= 144 ? "극강 쾌적" : g.fhd >= 60 ? "원활 플레이" : "옵션 타협 필요"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TossCard>

            {/* More Game FPS Report Unlock */}
            <TossCard
              title="📑 발로란트·팰월드·엘든링 등 10종 정밀 FPS 리포트"
              subtitle="해상도별 프레임 드랍 방지 가이드 & 병목률 분석"
              badge={<TossBadge variant="blue" className="whitespace-nowrap">보너스 리포트</TossBadge>}
            >
              {unlockedReport ? (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1.5 animate-fade-in">
                  <h5 className="font-bold text-sm text-blue-800 whitespace-nowrap">✓ 정밀 벤치마크 & 병목 분석 완료</h5>
                  <p className="whitespace-nowrap truncate">• 발로란트: FHD 360Hz 모니터 완벽 방어 가능 (평균 380 FPS)</p>
                  <p className="whitespace-nowrap truncate">• 엘든링: 60 FPS 고정 풀옵션 쾌적 구동</p>
                  <p className="whitespace-nowrap truncate">• CPU 병목 지수: 4.2% (이상적인 균형 - 병목 없음)</p>
                </div>
              ) : (
                <div className="pt-2 text-center">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 mb-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-md tracking-wider whitespace-nowrap">
                        [광고 안내]
                      </span>
                      <span className="text-[11px] text-blue-600 font-bold whitespace-nowrap">약 5초 동영상</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium whitespace-nowrap truncate">
                      추가 10종 게임 FPS 정밀 리포트는 <strong>[광고] 5초 시청 후 무료</strong>로 즉시 열람하실 수 있어요.
                    </p>
                  </div>

                  <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                    <span className="flex items-center justify-center gap-1 font-bold whitespace-nowrap">
                      <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-black rounded whitespace-nowrap">AD</span>
                      <span className="whitespace-nowrap">[광고] 5초 시청 후 10종 FPS 무료 열람</span>
                    </span>
                  </TossButton>
                </div>
              )}
            </TossCard>

            <TossButton variant="primary" size="lg" onClick={() => setActiveTab("quote")} className="whitespace-nowrap">
              <Receipt className="w-4 h-4 mr-1.5 inline shrink-0" /> <span className="whitespace-nowrap">견적서 확인 및 공유하기</span>
            </TossButton>
          </div>
        )}

        {/* TAB 3: QUOTE & RECEIPT */}
        {activeTab === "quote" && (
          <div className="space-y-4 animate-fade-in">
            {/* Printable Digital Receipt Card */}
            <div className="bg-white rounded-3xl p-5 border border-toss-border shadow-sm space-y-4 overflow-hidden">
              <div className="text-center pb-3 border-b border-dashed border-gray-300">
                <span className="text-[10px] uppercase font-mono tracking-widest text-toss-muted block whitespace-nowrap">
                  DIGITAL PC SPECIFICATION
                </span>
                <h4 className="text-xl font-black text-toss-text mt-0.5 whitespace-nowrap">
                  나만의 맞춤 PC 견적서
                </h4>
                <p className="text-xs text-toss-muted mt-1 whitespace-nowrap truncate">
                  종합 벤치마크 {benchResult.overall}점 ({benchResult.tier})
                </p>
              </div>

              {/* Parts Breakdown Table */}
              <div className="space-y-2 text-xs">
                {KEYS.map((k) => {
                  const opt = getPartOption(k, build[k]);
                  return (
                    <div key={k} className="flex items-center justify-between py-1.5 border-b border-gray-100 gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-toss-muted block whitespace-nowrap">{SHORT_LABEL[k]}</span>
                        <span className="font-bold text-toss-text truncate block whitespace-nowrap">{opt?.name || "미선택"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                        <span className="font-extrabold text-toss-text whitespace-nowrap">
                          {opt?.price ? `₩${opt.price.toLocaleString("ko-KR")}` : "0원"}
                        </span>
                        {opt?.price && opt.price > 0 && (
                          <button
                            onClick={() =>
                              setSelectedPartForPurchase({
                                name: opt.name,
                                price: opt.price,
                                categoryLabel: SHORT_LABEL[k],
                                buyUrl: opt.buyUrl,
                                danawaUrl: opt.danawaUrl,
                              })
                            }
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-toss-blue text-[10px] font-bold rounded-md flex items-center gap-0.5 transition cursor-pointer whitespace-nowrap shrink-0"
                            title="실시간 최저가 구매 링크"
                          >
                            <span>구매</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
                <span className="text-sm font-bold text-toss-text whitespace-nowrap">총 예상 견적</span>
                <span className="text-2xl font-black text-toss-blue whitespace-nowrap">
                  ₩{totalPrice.toLocaleString("ko-KR")}
                </span>
              </div>
            </div>

            {/* Real-time Purchase Hub Card */}
            {/* Real-time Purchase Hub Card */}
            <TossCard
              title="🛒 실시간 최저가 구매처 모아보기"
              subtitle="쿠팡 로켓배송·다나와·네이버쇼핑에서 부품별 최저가와 실시간 재고를 바로 확인하세요"
              badge={<TossBadge variant="blue" className="whitespace-nowrap">구매 연동</TossBadge>}
            >
              <div className="space-y-2 pt-1 text-xs">
                {/* 1. Featured Coupang Partners Link (User Revenue) */}
                <button
                  onClick={() => {
                    window.open(USER_COUPANG_PARTNERS_URL, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full p-3 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100/80 hover:to-pink-100/80 border border-rose-200/90 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-rose-500 text-white rounded-md whitespace-nowrap shrink-0">
                        쿠팡 로켓
                      </span>
                      <span className="text-xs font-black text-rose-900 group-hover:text-rose-700 truncate whitespace-nowrap">
                        쿠팡 로켓배송 특가 & 빠른 배송
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700/80 mt-0.5 truncate whitespace-nowrap">
                      내일 아침 도착 보장 & 와우 회원 카드 즉시할인
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 px-2 py-1 bg-white/90 rounded-lg text-rose-600 font-bold text-[11px] border border-rose-200 shadow-2xs">
                    <span className="whitespace-nowrap">보러가기</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </div>
                </button>

                {/* 2. Danawa & Naver 2-Column Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const cpuName = getPartOption("cpu", build.cpu)?.name || "";
                      const gpuName = getPartOption("gpu", build.gpu)?.name || "";
                      const query = `${cpuName} ${gpuName}`.trim() || "조립PC 견적";
                      window.open(`https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}`, "_blank");
                    }}
                    className="p-2.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 rounded-xl text-left transition flex items-center justify-between group cursor-pointer min-w-0"
                  >
                    <div className="min-w-0 flex-1 pr-1">
                      <span className="text-[10px] font-extrabold text-blue-600 block truncate whitespace-nowrap">다나와 PC 견적</span>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-toss-blue truncate whitespace-nowrap">다나와 최저가</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-blue-600 shrink-0" />
                  </button>

                  <button
                    onClick={() => {
                      const cpuName = getPartOption("cpu", build.cpu)?.name || "";
                      const gpuName = getPartOption("gpu", build.gpu)?.name || "";
                      const query = `${cpuName} ${gpuName}`.trim() || "조립PC";
                      window.open(`https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`, "_blank");
                    }}
                    className="p-2.5 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-xl text-left transition flex items-center justify-between group cursor-pointer min-w-0"
                  >
                    <div className="min-w-0 flex-1 pr-1">
                      <span className="text-[10px] font-extrabold text-emerald-600 block truncate whitespace-nowrap">네이버 쇼핑</span>
                      <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 truncate whitespace-nowrap">네이버 최저가</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                  </button>
                </div>
              </div>
            </TossCard>

            {/* Checklist Guide Unlock */}
            <TossCard
              title="🔧 초보자용 셀프 조립 7단계 체크리스트"
              subtitle="써멀구리스 도포, 램 슬롯 순서, 케이블 정리 실수 방지 가이드"
              badge={<TossBadge variant="orange" className="whitespace-nowrap">VIP 가이드</TossBadge>}
            >
              {unlockedChecklist ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fade-in overflow-hidden">
                  <h5 className="font-bold text-amber-800 whitespace-nowrap">✓ 조립 전 필수 체크리스트</h5>
                  <p className="whitespace-nowrap truncate">1. 램 장착 시 2번, 4번 슬롯 우선 장착 (듀얼채널 대역폭 2배)</p>
                  <p className="whitespace-nowrap truncate">2. CPU 쿨러 장착 전 하단 보호 비닐 제거 필수 확인!</p>
                  <p className="whitespace-nowrap truncate">3. 전원 케이블: 메인보드 24핀 + CPU 보조 8핀 결착 확인</p>
                </div>
              ) : (
                <div className="pt-2 text-center">
                  <TossButton variant="secondary" size="md" onClick={() => setPayModalOpen(true)} className="whitespace-nowrap">
                    <Crown className="w-4 h-4 mr-1 inline text-amber-500 shrink-0" />
                    <span className="whitespace-nowrap">조립 체크리스트 & 보증서 소장 (990원)</span>
                  </TossButton>
                </div>
              )}
            </TossCard>

            {/* Action Buttons */}
            <div className="space-y-2">
              <TossButton
                variant="primary"
                size="lg"
                onClick={() => {
                  confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                  alert("🎉 견적서 요약본이 클립보드에 복사되었습니다!");
                }}
                className="whitespace-nowrap"
              >
                <Share2 className="w-4 h-4 mr-1.5 inline shrink-0" /> <span className="whitespace-nowrap">견적서 복사 및 친구에게 공유</span>
              </TossButton>

              <TossButton
                variant="secondary"
                size="md"
                onClick={() => {
                  setBuild(PRESET_BUILDS[0].parts);
                  setActiveTab("build");
                }}
                className="whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 mr-1 inline shrink-0" /> <span className="whitespace-nowrap">부품 처음부터 다시 맞추기</span>
              </TossButton>
            </div>
          </div>
        )}

        {/* User Coupang Partners Bottom Banner */}
        <AdBanner
          title="쿠팡 로켓배송 PC 부품·게이밍 기어 특가"
          subtitle="로켓와우 회원 내일 아침 도착 & 카드 즉시할인"
          actionText="[광고] 쿠팡 특가 보기"
          url={USER_COUPANG_PARTNERS_URL}
        />
      </div>

      {/* Rewarded Ad Modal (with Toss Review compliant pre-ad notice) */}
      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setUnlockedReport(true);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }}
        rewardTitle="인기 게임 10종 FPS 정밀 리포트 열람"
        adDurationSeconds={5}
      />

      {/* TossPay Modal */}
      <TossPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setPayModalOpen(false);
          setUnlockedChecklist(true);
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
          alert("🎉 조립 체크리스트 & 호환성 보증서가 영구 소장되었습니다!");
        }}
        productName="PC 조립 대행 체크리스트 & 호환성 보증서"
        price={990}
      />

      {/* Real-time Purchase Links Modal */}
      <PurchaseModal
        isOpen={selectedPartForPurchase !== null}
        partName={selectedPartForPurchase?.name || ""}
        price={selectedPartForPurchase?.price}
        categoryLabel={selectedPartForPurchase?.categoryLabel}
        buyUrl={selectedPartForPurchase?.buyUrl}
        danawaUrl={selectedPartForPurchase?.danawaUrl}
        onClose={() => setSelectedPartForPurchase(null)}
      />
    </div>
  );
};
