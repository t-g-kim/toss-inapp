import React, { useState, useEffect, useMemo } from "react";
import {
  TossHeader,
  TossCard,
  TossButton,
  TossBadge,
  AdBanner,
} from "@shared/index";
import {
  DeskSlotKey,
  DeskPartOption,
  SLOT_LABELS,
  DESK_PARTS,
  PRESET_SETUPS,
  DeskPreset,
  getPurchaseLinks,
  USER_COUPANG_SUBID,
  DeskItemPositions,
  DEFAULT_ITEM_POSITIONS,
} from "./catalog";
import {
  DeskBuildState,
  getPartOption,
  calculateTotalPrice,
  checkDeskCompatibility,
} from "./engine";
import { Desk3DViewer } from "./Desk3DViewer";
import { PurchaseModal } from "./PurchaseModal";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  RotateCcw,
  Rotate3d,
  ShoppingBag,
  ExternalLink,
  Share2,
  Bookmark,
  Trash2,
  Monitor,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Sliders,
  PcCase,
  Move,
  Table,
  Layers,
  CheckSquare,
  Square,
  Wrench,
} from "lucide-react";
import confetti from "canvas-confetti";

export type ProductCategoryKey = "all" | "deskterior" | "monitor" | "furniture" | "peripheral";

export const PRODUCT_CATEGORIES: Array<{
  id: ProductCategoryKey;
  label: string;
  icon: string;
  slots: DeskSlotKey[];
}> = [
  {
    id: "all",
    label: "전체 상품",
    icon: "✨",
    slots: [
      "deskShelf",
      "lightingMat",
      "accessories",
      "monitorArm",
      "chair",
      "keyboardMouse",
      "desk",
      "monitor",
    ],
  },
  {
    id: "deskterior",
    label: "데스크테리어 소품",
    icon: "🕯️",
    slots: ["deskShelf", "lightingMat", "accessories"],
  },
  {
    id: "monitor",
    label: "모니터 & 암",
    icon: "🖥️",
    slots: ["monitorArm", "monitor"],
  },
  {
    id: "furniture",
    label: "가구 (책상·의자)",
    icon: "🪑",
    slots: ["chair", "desk"],
  },
  {
    id: "peripheral",
    label: "키보드 & 마우스",
    icon: "⌨️",
    slots: ["keyboardMouse"],
  },
];

interface MakeMyDeskAppProps {
  onBack?: () => void;
  onNavigateToPc?: () => void;
}

export const MakeMyDeskApp: React.FC<MakeMyDeskAppProps> = ({ onBack, onNavigateToPc }) => {
  // Current Build State
  const [build, setBuild] = useState<DeskBuildState>(() => {
    return { ...PRESET_SETUPS[1].parts };
  });

  // Real-world Item Positions on the desk
  const [positions, setPositions] = useState<DeskItemPositions>(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("pivot") === "true") {
          return { ...DEFAULT_ITEM_POSITIONS, monitorPivot: true, monitorHeight: 120 };
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_ITEM_POSITIONS;
  });

  // ⭐ 핵심: 책상과 모니터는 옵션 (기본값: 기존 보유, 데스크테리어 소품만 견적)
  const [includeDeskInPrice, setIncludeDeskInPrice] = useState<boolean>(false);
  const [includeMonitorInPrice, setIncludeMonitorInPrice] = useState<boolean>(false);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<"builder" | "saved" | "guide">("builder");
  const [productCategory, setProductCategory] = useState<ProductCategoryKey>("all");
  const [selectedSlot, setSelectedSlot] = useState<DeskSlotKey | null>("deskShelf");
  const [purchasePart, setPurchasePart] = useState<DeskPartOption | null>(null);
  const [purchaseCategory, setPurchaseCategory] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Saved setups in localStorage
  const [savedSetups, setSavedSetups] = useState<
    Array<{
      id: string;
      date: string;
      name: string;
      price: number;
      build: DeskBuildState;
      includeDesk: boolean;
      includeMonitor: boolean;
    }>
  >(() => {
    try {
      const raw = localStorage.getItem("my_desk_setups");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Total price (Deskterior vs Full) & Compatibility
  const priceStats = useMemo(() => {
    return calculateTotalPrice(build, {
      includeDesk: includeDeskInPrice,
      includeMonitor: includeMonitorInPrice,
    });
  }, [build, includeDeskInPrice, includeMonitorInPrice]);

  const currentPrice = priceStats.deskteriorTotal;
  const compatibility = useMemo(() => checkDeskCompatibility(build), [build]);

  // Current selected parts
  const currentDesk = getPartOption("desk", build.desk);
  const currentMonitor = getPartOption("monitor", build.monitor);
  const currentArm = getPartOption("monitorArm", build.monitorArm);
  const hasArm = currentArm && currentArm.id !== "arm_none";
  const currentChair = getPartOption("chair", build.chair);
  const hasChair = currentChair && currentChair.id !== "chair_none";

  // Real-world remaining desk surface calculation
  const deskSpaceStats = useMemo(() => {
    const totalW = currentDesk?.deskWidth || 1400; // mm
    const monW =
      currentMonitor?.monitorType === "dual"
        ? 1080
        : currentMonitor?.monitorSize === 34
        ? 810
        : currentMonitor?.monitorSize === 32
        ? 710
        : 610; // mm
    const pcW = positions.pcPlacement.startsWith("desk") ? 220 : 0; // mm
    const spkW = positions.speakerPlacement !== "none" ? 280 : 0; // mm
    const usedW = monW + pcW + spkW;
    const remainingW = Math.max(0, totalW - usedW);

    return {
      totalW,
      monW,
      pcW,
      remainingW,
      remainingCm: Math.round(remainingW / 10),
    };
  }, [currentDesk, currentMonitor, positions]);

  // Load Preset
  const handleLoadPreset = (preset: DeskPreset) => {
    setBuild({ ...preset.parts });
    try {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
  };

  // Select Desk or other parts
  const handleSelectPart = (slot: DeskSlotKey, partId: string) => {
    setBuild((prev) => ({
      ...prev,
      [slot]: partId,
    }));
  };

  // Open purchase modal
  const handleOpenPurchase = (slot: DeskSlotKey, part: DeskPartOption) => {
    setPurchaseCategory(SLOT_LABELS[slot]);
    setPurchasePart(part);
  };

  // Copy full quotation
  const handleCopyQuotation = () => {
    const lines = [
      `[📐 감성 데스크테리어 맞춤 견적서]`,
      `• 기본 환경(보유): 책상 ${currentDesk?.deskWidth}mm(${currentDesk?.color}), 모니터 ${currentMonitor?.monitorSize}인치`,
      `• 데스크테리어 추천 합계: ${currentPrice.toLocaleString()}원`,
      `• 호환성 점수: ${compatibility.score}점 (${compatibility.isCompatible ? "완벽 호환" : "주의"})`,
      `------------------------`,
      `[선택된 데스크테리어 품목]`,
    ];

    (
      [
        "deskShelf",
        "monitorArm",
        "lightingMat",
        "accessories",
        "keyboardMouse",
        "chair",
      ] as DeskSlotKey[]
    ).forEach((slot) => {
      const part = getPartOption(slot, build[slot]);
      if (part && part.price > 0) {
        lines.push(`• ${SLOT_LABELS[slot]}: ${part.name} (${part.price.toLocaleString()}원)`);
      }
    });

    if (includeDeskInPrice && currentDesk) {
      lines.push(`• 책상(신규구매): ${currentDesk.name} (${currentDesk.price.toLocaleString()}원)`);
    }
    if (includeMonitorInPrice && currentMonitor) {
      lines.push(`• 모니터(신규구매): ${currentMonitor.name} (${currentMonitor.price.toLocaleString()}원)`);
    }

    lines.push(`------------------------`);
    lines.push(
      `* 쿠팡 데스크테리어 최저가: https://link.coupang.com/re/AFFSRP?lptag=${USER_COUPANG_SUBID}&pageKey=%EB%8D%B0%EC%8A%A4%ED%81%AC%ED%85%8C%EB%A6%AC%EC%96%B4`
    );

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save setup to storage
  const handleSaveSetup = () => {
    const setupName = `${currentDesk?.deskWidth}mm 감성 데스크테리어 (${currentPrice.toLocaleString()}원)`;
    const newSetup = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("ko-KR"),
      name: setupName,
      price: currentPrice,
      build: { ...build },
      includeDesk: includeDeskInPrice,
      includeMonitor: includeMonitorInPrice,
    };

    const updated = [newSetup, ...savedSetups.slice(0, 19)];
    setSavedSetups(updated);
    try {
      localStorage.setItem("my_desk_setups", JSON.stringify(updated));
    } catch {
      // ignore
    }
    alert("현재 데스크테리어 셋업이 보관함에 저장되었습니다!");
  };

  const handleDeleteSaved = (id: string) => {
    const filtered = savedSetups.filter((s) => s.id !== id);
    setSavedSetups(filtered);
    try {
      localStorage.setItem("my_desk_setups", JSON.stringify(filtered));
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full min-h-screen bg-toss-bg text-toss-text pb-20 select-none">
      {/* 1. Header */}
      <TossHeader
        title="데스크테리어 견적기"
        subtitle="내 책상 맞춤 소품 & 3D 360° 시뮬레이터"
        onBack={onBack}
        rightElement={
          <button
            onClick={handleCopyQuotation}
            className="p-2 text-toss-subtext hover:text-toss-blue transition flex items-center gap-1 text-xs font-bold"
            title="견적서 복사"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>견적 복사</span>
              </>
            )}
          </button>
        }
      />

      {/* 2. Top Summary Bar with Realistic Deskterior Budget */}
      <div className="bg-white border-b border-toss-border px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-toss-muted font-medium flex items-center gap-1.5">
              <span>데스크테리어 추천 견적</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span
                className={
                  compatibility.isCompatible
                    ? "text-emerald-600 font-bold"
                    : "text-amber-600 font-bold"
                }
              >
                호환 {compatibility.score}점
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-toss-blue tracking-tight">
              {currentPrice.toLocaleString()}
              <span className="text-sm font-bold text-toss-text ml-0.5">원</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSaveSetup}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-toss-text rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>보관</span>
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(
                    `https://link.coupang.com/re/AFFSRP?lptag=${USER_COUPANG_SUBID}&pageKey=%EB%8D%B0%EC%8A%A4%ED%81%AC%ED%85%8C%EB%A6%AC%EC%96%B4`,
                    "_blank"
                  );
                }
              }}
              className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>쿠팡 최저가</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => setActiveTab("builder")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "builder"
                ? "bg-blue-50 text-toss-blue"
                : "text-toss-subtext hover:bg-gray-50"
            }`}
          >
            데스크테리어 빌더
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "saved"
                ? "bg-blue-50 text-toss-blue"
                : "text-toss-subtext hover:bg-gray-50"
            }`}
          >
            내 보관함 ({savedSetups.length})
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === "guide"
                ? "bg-blue-50 text-toss-blue"
                : "text-toss-subtext hover:bg-gray-50"
            }`}
          >
            셋업 팁 가이드
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {activeTab === "builder" && (
          <>
            {/* ⭐ 핵심 요구사항: 책상·모니터·컴퓨터는 옵션 (보유 vs 신규구매) 토글 배너 */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-3.5 rounded-2xl border border-blue-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  견적 계산 옵션 설정
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                  데스크테리어 집중 모드
                </span>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">
                책상과 모니터는 이미 가지고 계신 환경을 3D로 설정하고, <strong>선반·조명·모니터암 등 데스크테리어 소품만 알짜로</strong> 견적을 계산합니다.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200/50">
                <button
                  onClick={() => setIncludeDeskInPrice(!includeDeskInPrice)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                    includeDeskInPrice
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  <span className="text-[11px]">책상 새로 구매</span>
                  <span className="text-[10px] opacity-80">
                    {includeDeskInPrice ? "+금액포함" : "보유중(0원)"}
                  </span>
                </button>

                <button
                  onClick={() => setIncludeMonitorInPrice(!includeMonitorInPrice)}
                  className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                    includeMonitorInPrice
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  <span className="text-[11px]">모니터 새로 구매</span>
                  <span className="text-[10px] opacity-80">
                    {includeMonitorInPrice ? "+금액포함" : "보유중(0원)"}
                  </span>
                </button>
              </div>
            </div>

            {/* 3. Golden Presets (데스크테리어 중심 예산 5만~20만원대) */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-extrabold text-toss-text flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 인기 감성 데스크테리어 팩
                </span>
                <span className="text-[11px] text-toss-muted">1초 원클릭 적용</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_SETUPS.map((preset) => {
                  const isActive =
                    JSON.stringify(preset.parts) === JSON.stringify(build);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleLoadPreset(preset)}
                      className={`shrink-0 p-3 rounded-2xl border text-left transition-all active:scale-98 w-[160px] ${
                        isActive
                          ? "border-toss-blue bg-blue-50/60 shadow-xs ring-1 ring-toss-blue"
                          : "border-toss-border bg-white hover:border-gray-300"
                      }`}
                    >
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${preset.tagColor}`}
                      >
                        {preset.tag}
                      </span>
                      <h4 className="font-bold text-xs text-toss-text mt-1.5 line-clamp-1">
                        {preset.name}
                      </h4>
                      <p className="text-xs font-extrabold text-toss-blue mt-0.5">
                        {preset.deskteriorPrice.toLocaleString()}원
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Three.js 3D 실측 뷰어 (360도 회전 및 1:1 실측) */}
            <Desk3DViewer
              build={build}
              positions={positions}
              score={compatibility.score}
              height={350}
              onUpdatePosition={setPositions}
            />

            {/* 5. 내 기본 환경 (3D 캔버스 설정) - 1초 빠른 변경 */}
            <div className="bg-white rounded-2xl border border-toss-border p-3.5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-toss-blue" />
                  <span className="text-xs font-black text-gray-800">
                    내 책상 & 모니터 환경 설정 (3D 실측 배경)
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">터치 시 3D 즉각 반영</span>
              </div>

              {/* Desk Size Selector (1200mm ~ 2400mm 대형 규격) */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500">책상 크기</span>
                  <span className="text-[11px] font-black text-blue-600">
                    {currentDesk?.deskWidth}×{currentDesk?.deskDepth}mm · {currentDesk?.deskThickness}T
                  </span>
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { width: 1200, label: "1200" },
                    { width: 1400, label: "1400" },
                    { width: 1600, label: "1600" },
                    { width: 1800, label: "1800" },
                    { width: 2000, label: "2000" },
                    { width: 2100, label: "2100" },
                    { width: 2400, label: "2400 (특대)" },
                  ].map((d) => (
                    <button
                      key={d.width}
                      onClick={() => {
                        const sameColor = DESK_PARTS.desk.find(
                          (item) => item.deskWidth === d.width && item.color === currentDesk?.color
                        );
                        const chosen = sameColor || DESK_PARTS.desk.find((item) => item.deskWidth === d.width);
                        if (chosen) handleSelectPart("desk", chosen.id);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap shrink-0 transition ${
                        currentDesk?.deskWidth === d.width
                          ? "bg-slate-800 text-white border-slate-800 shadow-2xs"
                          : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {d.label}mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Desk Color Buttons (폭 유지하며 색상 변경) */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-gray-500 w-16 shrink-0">상판 색상</span>
                {[
                  { color: "wood", label: "내추럴 우드" },
                  { color: "white", label: "퓨어 화이트" },
                  { color: "black", label: "매트 블랙" },
                ].map((c) => {
                  const isSelected = currentDesk?.color === c.color;
                  return (
                    <button
                      key={c.color}
                      onClick={() => {
                        const targetDesk =
                          DESK_PARTS.desk.find(
                            (d) => d.deskWidth === currentDesk?.deskWidth && d.color === c.color
                          ) || DESK_PARTS.desk.find((d) => d.color === c.color);
                        if (targetDesk) handleSelectPart("desk", targetDesk.id);
                      }}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg border transition ${
                        isSelected
                          ? "bg-slate-800 text-white border-slate-800 shadow-2xs"
                          : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>

              {/* Monitor Size Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-gray-500 w-16 shrink-0">내 모니터</span>
                {[
                  { id: "mon_alphascan_27", label: "27\" 싱글" },
                  { id: "mon_samsung_s7_32", label: "32\" 대형" },
                  { id: "mon_lg_34wn750", label: "34\" 와이드" },
                  { id: "mon_dell_dual_24", label: "듀얼" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectPart("monitor", m.id)}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg border transition ${
                      build.monitor === m.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Monitor Arm Quick Mount Option */}
              <div className="space-y-1.5 text-xs pt-1.5 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500">모니터 거치</span>
                  <span className="text-[11px] font-black text-blue-600">
                    {hasArm
                      ? currentArm?.name.includes("NB-F80")
                        ? "NB-F80 모니터암 (1.8만)"
                        : currentArm?.name.includes("BMA-2")
                        ? "카멜 BMA-2 모니터암 (3.4만)"
                        : currentArm?.name.includes("DMA-2")
                        ? "카멜 듀얼 모니터암 (6.9만)"
                        : currentArm?.name.includes("PMA-2D")
                        ? "고중량 PMA-2D (8.9만)"
                        : currentArm?.name.includes("어고트론")
                        ? "어고트론 LX (19.8만)"
                        : "가스스프링 암"
                      : "기본 번들 스탠드 (0원)"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      if (!hasArm) {
                        handleSelectPart(
                          "monitorArm",
                          currentMonitor?.monitorType === "dual" ? "arm_camel_dma2" : "arm_camel_bma2"
                        );
                      }
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      hasArm
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>🦾 모니터암 설치 (공중부양)</span>
                  </button>
                  <button
                    onClick={() => handleSelectPart("monitorArm", "arm_none")}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      !hasArm
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span>🖥️ 기본 스탠드 (바닥거치)</span>
                  </button>
                </div>

                {hasArm && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                    {[
                      { id: "arm_camel_bma2", label: "카멜 BMA-2 (3.4만)" },
                      { id: "arm_nb_f80", label: "국민 NB-F80 (1.8만)" },
                      { id: "arm_camel_dma2", label: "카멜 DMA-2 듀얼 (6.9만)" },
                      { id: "arm_camel_pma2d", label: "고중량 PMA-2D (8.9만)" },
                      { id: "arm_ergotron_lx", label: "어고트론 LX (19.8만)" },
                    ].map((armOpt) => (
                      <button
                        key={armOpt.id}
                        onClick={() => handleSelectPart("monitorArm", armOpt.id)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-lg border whitespace-nowrap shrink-0 transition ${
                          build.monitorArm === armOpt.id
                            ? "bg-slate-800 text-white border-slate-800 shadow-2xs"
                            : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                        }`}
                      >
                        {armOpt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chair Placement Option (의자 배치 vs 숨기기) */}
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-100">
                <span className="text-[11px] font-bold text-gray-500 w-16 shrink-0">의자</span>
                <div className="flex-1 flex items-center gap-1.5 justify-end">
                  <button
                    onClick={() => {
                      if (build.chair === "chair_none") {
                        handleSelectPart("chair", "chair_existing");
                      }
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                      build.chair !== "chair_none"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    🪑 의자 배치 ({currentChair && currentChair.id !== "chair_none" ? currentChair.brand : "보유"})
                  </button>
                  <button
                    onClick={() => handleSelectPart("chair", "chair_none")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                      build.chair === "chair_none"
                        ? "bg-slate-800 text-white border-slate-800 shadow-2xs"
                        : "bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    ❌ 의자 숨기기
                  </button>
                </div>
              </div>
            </div>

            {/* 6. 데스크테리어 위치 조절 & 실측 잔여 공간 계산 바 */}
            <TossCard
              title="데스크테리어 위치 & 잔여 공간 조절"
              subtitle={`남은 상판 가로 공간: 약 ${deskSpaceStats.remainingCm}cm 여유`}
              badge={<TossBadge variant="purple">위치 변경</TossBadge>}
              padding="sm"
            >
              <div className="space-y-3 pt-1">
                {/* Surface Space Bar */}
                <div className="bg-gray-50 p-2.5 rounded-xl space-y-1.5 text-xs border border-gray-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-gray-600">
                      책상 가로폭 ({deskSpaceStats.totalW}mm)
                    </span>
                    <span className="font-black text-blue-600">
                      여유 공간 {deskSpaceStats.remainingCm}cm
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{
                        width: `${(deskSpaceStats.monW / deskSpaceStats.totalW) * 100}%`,
                      }}
                      title="모니터 점유"
                    />
                    {deskSpaceStats.pcW > 0 && (
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{
                          width: `${(deskSpaceStats.pcW / deskSpaceStats.totalW) * 100}%`,
                        }}
                        title="PC 본체 점유"
                      />
                    )}
                    <div className="bg-emerald-400 h-full grow" title="여유 공간" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> 모니터
                    </span>
                    {deskSpaceStats.pcW > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" /> PC
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 여유
                    </span>
                  </div>
                </div>

                {/* PC Placement */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-toss-text">컴퓨터 본체 위치</span>
                    <span className="text-[11px] text-toss-muted">
                      {positions.pcPlacement === "desk-right"
                        ? "책상 위 우측 (감성 튜닝)"
                        : positions.pcPlacement === "desk-left"
                        ? "책상 위 좌측"
                        : "책상 아래 바닥 (넓은 공간)"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setPositions((p) => ({ ...p, pcPlacement: "desk-right", pcX: undefined }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.pcPlacement === "desk-right"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      책상 위 우측
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, pcPlacement: "desk-left", pcX: undefined }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.pcPlacement === "desk-left"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      책상 위 좌측
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, pcPlacement: "floor-right", pcX: undefined }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.pcPlacement?.startsWith("floor")
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      책상 아래 바닥
                    </button>
                  </div>
                </div>

                {/* ⭐ 모니터 & 모니터암 무빙 컨트롤 패널 */}
                <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-3 rounded-2xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-blue-600" />
                      모니터 & 모니터암 3D 무빙 조절
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasArm
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {hasArm ? "모니터암 자유 관절 연동" : "기본 스탠드 (모션 제한)"}
                    </span>
                  </div>

                  {/* 1. 높낮이 (Elevation) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">모니터 높낮이</span>
                      <span className="text-[11px] text-blue-600 font-bold">
                        {(positions.monitorHeight ?? 80) >= 140
                          ? "높게 (16cm)"
                          : (positions.monitorHeight ?? 80) <= 30
                          ? "낮게 (2cm)"
                          : "눈높이 (8cm)"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorHeight: 20 }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          (positions.monitorHeight ?? 80) <= 30
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        낮게 (2cm)
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorHeight: 80 }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          (positions.monitorHeight ?? 80) > 30 && (positions.monitorHeight ?? 80) < 140
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        눈높이 (8cm)
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorHeight: 160 }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          (positions.monitorHeight ?? 80) >= 140
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        높게 (16cm)
                      </button>
                    </div>
                  </div>

                  {/* 2. 앞뒤 거리 (Depth / Extension) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">앞뒤 거리 (깊이)</span>
                      <span className="text-[11px] text-blue-600 font-bold">
                        {(positions.monitorDepth || 0) > 40
                          ? "앞으로 (+10cm)"
                          : (positions.monitorDepth || 0) < -40
                          ? "벽 밀착 (-10cm)"
                          : "표준 (0cm)"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorDepth: -100 }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          (positions.monitorDepth || 0) <= -50
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        벽 밀착 (-10cm)
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorDepth: 0 }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          (positions.monitorDepth || 0) > -50 && (positions.monitorDepth || 0) < 50
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        표준 거리 (0)
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorDepth: 100 }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                          (positions.monitorDepth || 0) >= 50
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        앞으로 (+10cm)
                      </button>
                    </div>
                  </div>

                  {/* 3. 가로 ↔ 세로 피벗 회전 (90도) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">화면 피벗 회전</span>
                      <span className="text-[11px] text-purple-600 font-bold">
                        {positions.monitorPivot ? "세로 (90° 피벗)" : "가로 (표준)"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorPivot: false }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1 ${
                          !positions.monitorPivot
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <span>🖥️ 가로 모드</span>
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorPivot: true }))}
                        className={`py-1.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1 ${
                          positions.monitorPivot
                            ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <Rotate3d className="w-3.5 h-3.5" />
                        <span>📱 세로 90° 피벗</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. 모니터 좌우 가로 위치 (미세 조절 슬라이더 & 프리셋) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700">좌우 가로 위치</span>
                      <span className="text-[11px] text-blue-600 font-black">
                        {positions.monitorX === 0
                          ? "정중앙"
                          : positions.monitorX > 0
                          ? `우측 +${positions.monitorX / 10}cm`
                          : `좌측 ${positions.monitorX / 10}cm`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-Math.floor(((currentDesk?.deskWidth || 1400) - 400) / 2)}
                      max={Math.floor(((currentDesk?.deskWidth || 1400) - 400) / 2)}
                      step={10}
                      value={positions.monitorX || 0}
                      onChange={(e) => setPositions((p) => ({ ...p, monitorX: Number(e.target.value) }))}
                      className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none"
                    />
                    <div className="grid grid-cols-5 gap-1 text-[11px]">
                      <button
                        onClick={() =>
                          setPositions((p) => ({
                            ...p,
                            monitorX: -Math.floor(((currentDesk?.deskWidth || 1400) - 400) / 2),
                          }))
                        }
                        className="py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 font-bold"
                      >
                        최좌측
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorX: -200 }))}
                        className="py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 font-bold"
                      >
                        -20cm
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorX: 0 }))}
                        className="py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-bold"
                      >
                        정중앙
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, monitorX: 200 }))}
                        className="py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 font-bold"
                      >
                        +20cm
                      </button>
                      <button
                        onClick={() =>
                          setPositions((p) => ({
                            ...p,
                            monitorX: Math.floor(((currentDesk?.deskWidth || 1400) - 400) / 2),
                          }))
                        }
                        className="py-1 rounded-lg border bg-white text-gray-700 hover:bg-gray-50 font-bold"
                      >
                        최우측
                      </button>
                    </div>
                  </div>
                </div>

                {/* Keyboard & Mat */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-toss-text">키보드 & 데스크패드 정렬</span>
                    <span className="text-[11px] text-toss-muted">마우스 활동 반경</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setPositions((p) => ({ ...p, keyboardX: -150 }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.keyboardX === -150
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      좌측 (게이밍)
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, keyboardX: 0 }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.keyboardX === 0
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      정중앙
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, keyboardX: 150 }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.keyboardX === 150
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      우측
                    </button>
                  </div>
                </div>

                {/* Speakers & MagSafe */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="font-bold text-gray-700 block mb-1">스피커</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPositions((p) => ({ ...p, speakerPlacement: "both" }))}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg border ${
                          positions.speakerPlacement === "both"
                            ? "bg-slate-800 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        모니터 양옆
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, speakerPlacement: "none" }))}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg border ${
                          positions.speakerPlacement === "none"
                            ? "bg-slate-800 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        숨기기
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-gray-700 block mb-1">맥세이프 충전기</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPositions((p) => ({ ...p, accPlacement: "right" }))}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg border ${
                          positions.accPlacement === "right"
                            ? "bg-slate-800 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        우측
                      </button>
                      <button
                        onClick={() => setPositions((p) => ({ ...p, accPlacement: "left" }))}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg border ${
                          positions.accPlacement === "left"
                            ? "bg-slate-800 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        좌측
                      </button>
                    </div>
                  </div>
                </div>

                {/* 의자 배치 여부 (옵션) */}
                <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-gray-800 block">🪑 3D 화면 의자 배치</span>
                    <span className="text-[11px] text-gray-400">의자를 숨겨 책상 위 장비에만 집중할 수 있어요</span>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleSelectPart("chair", "chair_existing")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                        build.chair !== "chair_none"
                          ? "bg-slate-800 text-white border-slate-800 shadow-2xs"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      배치함
                    </button>
                    <button
                      onClick={() => handleSelectPart("chair", "chair_none")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                        build.chair === "chair_none"
                          ? "bg-slate-800 text-white border-slate-800 shadow-2xs"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      }`}
                    >
                      숨기기
                    </button>
                  </div>
                </div>
              </div>
            </TossCard>

            {/* 7. 상품 카테고리 탭 & 부품 슬롯 */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between px-1 mb-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-toss-text flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      데스크테리어 & 장비 맞춤 선택
                    </h4>
                    <p className="text-[11px] text-toss-muted">
                      카테고리별로 원하는 소품과 장비를 자유롭게 변경해보세요
                    </p>
                  </div>
                  <span className="text-[11px] text-toss-muted">터치하여 옵션 변경</span>
                </div>

                {/* 카테고리 필터 탭 (전체 상품, 데스크테리어 소품, 모니터 & 암, 가구, 키보드 & 마우스) */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 scrollbar-none">
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const isActive = productCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setProductCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                          isActive
                            ? "bg-toss-blue text-white shadow-xs"
                            : "bg-gray-100 text-toss-subtext hover:bg-gray-200"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 선택된 카테고리의 슬롯 목록 렌더링 */}
                <div className="space-y-2.5">
                  {((PRODUCT_CATEGORIES.find((c) => c.id === productCategory) || PRODUCT_CATEGORIES[0]).slots).map((slot) => {
                    const isExpanded = selectedSlot === slot;
                    const currentPart = getPartOption(slot, build[slot]);
                    const options = DESK_PARTS[slot];
                    const isChairSlot = slot === "chair";
                    const isChairHidden = isChairSlot && build.chair === "chair_none";
                    const isDeskSlot = slot === "desk";
                    const isMonitorSlot = slot === "monitor";

                    let displayPrice = currentPart ? `${currentPart.price.toLocaleString()}원` : "0원";
                    if (isChairHidden) {
                      displayPrice = "0원 (미배치/숨김)";
                    } else if (isDeskSlot && !includeDeskInPrice) {
                      displayPrice = `${currentPart?.price.toLocaleString() || 0}원 (기존 보유 / 견적 미포함)`;
                    } else if (isMonitorSlot && !includeMonitorInPrice) {
                      displayPrice = `${currentPart?.price.toLocaleString() || 0}원 (기존 보유 / 견적 미포함)`;
                    }

                    return (
                      <div
                        key={slot}
                        className="bg-white rounded-2xl border border-toss-border overflow-hidden shadow-2xs transition"
                      >
                        <div
                          onClick={() => setSelectedSlot(isExpanded ? null : slot)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-toss-blue">
                                {SLOT_LABELS[slot]}
                              </span>
                              {isChairHidden && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded font-bold">
                                  3D 화면 숨김
                                </span>
                              )}
                              {currentPart?.tags && currentPart.tags[0] && !isChairHidden && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                                  {currentPart.tags[0]}
                                </span>
                              )}
                            </div>
                            <h5 className="font-extrabold text-sm text-toss-text truncate mt-0.5">
                              {currentPart ? currentPart.name : "선택되지 않음"}
                            </h5>
                            <p className="text-xs font-bold text-blue-600 mt-0.5">
                              {displayPrice}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {currentPart && currentPart.price > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPurchase(slot, currentPart);
                                }}
                                className="px-2.5 py-1 text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-bold transition flex items-center gap-1"
                              >
                                <ShoppingBag className="w-3 h-3" /> 구매
                              </button>
                            )}
                            <ChevronDown
                              className={`w-4 h-4 text-gray-400 transition-transform ${
                                isExpanded ? "rotate-180 text-toss-blue" : ""
                              }`}
                            />
                          </div>
                        </div>

                        {/* Expanded Part Options */}
                        {isExpanded && (
                          <div className="p-3 pt-0 border-t border-gray-100 bg-gray-50/50 space-y-2">
                            <p className="text-[11px] text-toss-muted pt-2 pb-1">
                              선택하시면 즉시 3D 시뮬레이터에 반영됩니다:
                            </p>
                            {options.map((option) => {
                              const isSelected = build[slot] === option.id;
                              const isNoneChair = isChairSlot && option.id === "chair_none";

                              return (
                                <div
                                  key={option.id}
                                  onClick={() => handleSelectPart(slot, option.id)}
                                  className={`p-3 rounded-xl border cursor-pointer transition ${
                                    isSelected
                                      ? "bg-blue-50/70 border-toss-blue ring-1 ring-toss-blue"
                                      : "bg-white border-toss-border hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-2">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold text-toss-subtext">
                                          {option.brand}
                                        </span>
                                        {isNoneChair && (
                                          <span className="text-[10px] bg-red-100 text-red-600 px-1 py-0.2 rounded font-bold">
                                            의자 숨김
                                          </span>
                                        )}
                                        {option.tags?.map((t) => (
                                          <span
                                            key={t}
                                            className="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.2 rounded"
                                          >
                                            {t}
                                          </span>
                                        ))}
                                      </div>
                                      <h6 className="font-extrabold text-xs text-toss-text mt-1">
                                        {option.name}
                                      </h6>
                                      <p className="text-[11px] text-toss-muted mt-0.5 leading-snug">
                                        {option.specs}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-black text-toss-blue block">
                                        {option.price > 0
                                          ? `${option.price.toLocaleString()}원`
                                          : option.id === "chair_none"
                                          ? "미배치 (0원)"
                                          : "보유중 (0원)"}
                                      </span>
                                      {option.price > 0 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenPurchase(slot, option);
                                          }}
                                          className="mt-1.5 px-2 py-0.8 text-[11px] bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-md transition shadow-2xs"
                                        >
                                          쿠팡
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Smart Compatibility Status Card */}
            <TossCard
              title="스마트 호환성 진단 리포트"
              subtitle={`모니터 하중, 책상 규격, 전력 안전성 검사 (${compatibility.issues.length}건)`}
              badge={
                <TossBadge variant={compatibility.isCompatible ? "green" : "orange"}>
                  {compatibility.isCompatible ? "호환 완벽" : "주의 필요"}
                </TossBadge>
              }
              padding="sm"
            >
              <div className="space-y-2 pt-1">
                {compatibility.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                      issue.severity === "danger"
                        ? "bg-rose-50 border-rose-200 text-rose-900"
                        : issue.severity === "warning"
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-blue-50/60 border-blue-100 text-blue-900"
                    }`}
                  >
                    {issue.severity === "danger" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    ) : issue.severity === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h5 className="font-bold">{issue.title}</h5>
                      <p className="text-[11px] leading-relaxed opacity-90 mt-0.5">
                        {issue.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TossCard>

            {/* Cross Promotion: Make My PC */}
            <div
              onClick={() => {
                if (onNavigateToPc) {
                  onNavigateToPc();
                } else if (typeof window !== "undefined") {
                  window.location.hash = "make-my-pc";
                  window.location.reload();
                }
              }}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between cursor-pointer shadow-md hover:scale-[1.01] transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/30 flex items-center justify-center text-blue-400">
                  <PcCase className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-blue-300 font-bold flex items-center gap-1">
                    <span>본체 견적 연동</span>
                    <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded text-[9px]">
                      인기
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    내 데스크에 딱 맞는 조립 PC 견적도 맞추기
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <TossButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleCopyQuotation}
              >
                {copied ? "견적서가 복사되었습니다!" : "데스크테리어 견적서 클립보드 복사"}
              </TossButton>
              <TossButton
                variant="secondary"
                fullWidth
                size="md"
                onClick={() => handleLoadPreset(PRESET_SETUPS[0])}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 inline" /> 5만원 가성비 셋업으로 초기화
              </TossButton>
            </div>

            <AdBanner
              title="삼성화재 다이렉트 착 가구/인테리어 화재보험"
              subtitle="소중한 내 방 전자기기 보장 & 1분 만에 보험료 계산"
            />
          </>
        )}

        {/* TAB 2: 내 보관함 */}
        {activeTab === "saved" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-bold text-sm text-toss-text">
                저장된 나만의 데스크테리어 ({savedSetups.length}개)
              </h4>
              {savedSetups.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("저장된 모든 셋업을 삭제하시겠습니까?")) {
                      setSavedSetups([]);
                      localStorage.removeItem("my_desk_setups");
                    }
                  }}
                  className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 전체 삭제
                </button>
              )}
            </div>

            {savedSetups.length === 0 ? (
              <div className="text-center py-12 text-toss-muted text-sm bg-white rounded-2xl border border-toss-border p-4">
                <Bookmark className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                저장된 데스크테리어가 없습니다.
                <br />
                빌더 탭에서 나만의 소품 조합을 만들고 보관해보세요!
              </div>
            ) : (
              savedSetups.map((s) => (
                <TossCard key={s.id} padding="sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400">{s.date} 저장</span>
                      <h4 className="font-extrabold text-sm text-toss-text mt-0.5">{s.name}</h4>
                      <p className="text-xs font-bold text-toss-blue mt-0.5">
                        {s.price.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setBuild({ ...s.build });
                          setIncludeDeskInPrice(s.includeDesk);
                          setIncludeMonitorInPrice(s.includeMonitor);
                          setActiveTab("builder");
                        }}
                        className="px-2.5 py-1 text-xs bg-blue-50 text-toss-blue font-bold rounded-lg hover:bg-blue-100 transition"
                      >
                        불러오기
                      </button>
                      <button
                        onClick={() => handleDeleteSaved(s.id)}
                        className="p-1 text-gray-400 hover:text-rose-500 transition"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </TossCard>
              ))
            )}
          </div>
        )}

        {/* TAB 3: 데스크 가이드 */}
        {activeTab === "guide" && (
          <div className="space-y-3">
            <TossCard title="데스크테리어 3대 핵심 아이템" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext leading-relaxed pt-1">
                <p>
                  <strong className="text-toss-text">1. 모니터암 (책상 공간 2배 확보)</strong>:
                  거치대 다리가 차지하던 책상 상판 공간을 100% 비워주어 키보드와 노트를 자유롭게 놓을 수 있습니다.
                </p>
                <p>
                  <strong className="text-toss-text">2. 데스크 쉘프 (원목 모니터 선반)</strong>:
                  인스타/유튜브 데스크 셋업의 상징! 모니터 아래로 펜, 포스트잇, 외장하드를 숨기고 키보드를 하단에 쏙 밀어 넣을 수 있습니다.
                </p>
                <p>
                  <strong className="text-toss-text">3. 비대칭 스크린바 조명</strong>:
                  화면에 빛이 반사되지 않으면서 손과 키보드만 은은하게 비춰 눈의 피로를 획기적으로 줄여줍니다.
                </p>
              </div>
            </TossCard>

            <TossCard title="바닥 선정리 3대 법칙" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext leading-relaxed pt-1">
                <p>
                  <strong className="text-toss-text">1. 바닥에 멀티탭을 두지 마세요</strong>:
                  언더데스크 메쉬 트레이나 벨크로 타이로 책상 하판에 멀티탭을 띄우면 로봇청소기도 걸리지 않습니다.
                </p>
                <p>
                  <strong className="text-toss-text">2. 모션데스크는 전선 여유 50cm</strong>: 최고
                  높이(120cm)로 올렸을 때 코드가 뽑히지 않도록 3m 이상 멀티탭을 사용하세요.
                </p>
                <p>
                  <strong className="text-toss-text">3. 모니터암 내부로 케이블 매립</strong>: 전원선과
                  DP/HDMI 선을 모니터암 기둥 커버 안으로 넣으면 정면에서 선이 전혀 보이지 않습니다.
                </p>
              </div>
            </TossCard>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={!!purchasePart}
        part={purchasePart || undefined}
        categoryLabel={purchaseCategory}
        onClose={() => setPurchasePart(null)}
      />
    </div>
  );
};
