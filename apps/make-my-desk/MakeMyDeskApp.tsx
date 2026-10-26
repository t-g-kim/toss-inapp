import React, { useState, useEffect, useMemo } from "react";
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
  Maximize2,
  Palette,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";

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
  const [positions, setPositions] = useState<DeskItemPositions>(DEFAULT_ITEM_POSITIONS);

  // Desk Filter State (1단계 데스크 우선 선택)
  const [deskSizeFilter, setDeskSizeFilter] = useState<"all" | 1200 | 1400 | 1600>("all");
  const [deskColorFilter, setDeskColorFilter] = useState<"all" | "wood" | "white" | "black">("all");
  const [motionOnly, setMotionOnly] = useState<boolean>(false);

  // Tabs & Expansion
  const [activeTab, setActiveTab] = useState<"builder" | "saved" | "guide">("builder");
  const [selectedSlot, setSelectedSlot] = useState<DeskSlotKey | null>("desk");
  const [positionTabOpen, setPositionTabOpen] = useState<boolean>(true);
  const [purchasePart, setPurchasePart] = useState<DeskPartOption | null>(null);
  const [purchaseCategory, setPurchaseCategory] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Saved setups in localStorage
  const [savedSetups, setSavedSetups] = useState<
    Array<{ id: string; date: string; name: string; price: number; build: DeskBuildState }>
  >(() => {
    try {
      const raw = localStorage.getItem("my_desk_setups");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Total price & Compatibility
  const totalPrice = useMemo(() => calculateTotalPrice(build), [build]);
  const compatibility = useMemo(() => checkDeskCompatibility(build), [build]);

  // Current selected parts
  const currentDesk = getPartOption("desk", build.desk);
  const currentMonitor = getPartOption("monitor", build.monitor);

  // Filtered Desk list for Step 1
  const filteredDesks = useMemo(() => {
    return DESK_PARTS.desk.filter((d) => {
      if (deskSizeFilter !== "all" && d.deskWidth !== deskSizeFilter) return false;
      if (deskColorFilter !== "all" && d.color !== deskColorFilter) return false;
      if (motionOnly && !d.isMotionDesk) return false;
      return true;
    });
  }, [deskSizeFilter, deskColorFilter, motionOnly]);

  // Real-world remaining desk surface calculation
  const deskSpaceStats = useMemo(() => {
    const totalW = currentDesk?.deskWidth || 1400; // mm
    const monW = currentMonitor?.monitorType === "dual" ? 1080 : currentMonitor?.monitorSize === 34 ? 810 : currentMonitor?.monitorSize === 32 ? 710 : 610; // mm
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
      `[📐 데스크테리어 실측 맞춤 견적서]`,
      `• 책상 규격: ${currentDesk?.deskWidth}mm × ${currentDesk?.deskDepth}mm (${currentDesk?.color} 상판)`,
      `• 모니터 배치: ${positions.monitorX === 0 ? "중앙 정면" : positions.monitorX > 0 ? "우측 편향" : "좌측 편향"} / PC: ${positions.pcPlacement}`,
      `• 총 견적 금액: ${totalPrice.toLocaleString()}원`,
      `• 호환성 점수: ${compatibility.score}점 (${compatibility.isCompatible ? "완벽 호환" : "주의"})`,
      `------------------------`,
    ];

    (Object.keys(build) as DeskSlotKey[]).forEach((slot) => {
      const part = getPartOption(slot, build[slot]);
      if (part) {
        lines.push(`• ${SLOT_LABELS[slot]}: ${part.name} (${part.price.toLocaleString()}원)`);
      }
    });

    lines.push(`------------------------`);
    lines.push(
      `* 쿠팡 최저가 검색: https://link.coupang.com/re/AFFSRP?lptag=${USER_COUPANG_SUBID}&pageKey=%EB%8D%B0%EC%8A%A4%ED%81%AC%ED%85%8C%EB%A6%AC%EC%96%B4`
    );

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save setup to storage
  const handleSaveSetup = () => {
    const setupName = `${currentDesk?.deskWidth}mm ${currentDesk?.brand} + ${currentMonitor?.brand}`;
    const newSetup = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("ko-KR"),
      name: setupName,
      price: totalPrice,
      build: { ...build },
    };

    const updated = [newSetup, ...savedSetups.slice(0, 19)];
    setSavedSetups(updated);
    try {
      localStorage.setItem("my_desk_setups", JSON.stringify(updated));
    } catch {
      // ignore
    }
    alert("현재 데스크 셋업이 보관함에 저장되었습니다!");
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
        title="데스크 셋업 견적기"
        subtitle="3D 실측 렌더링 & 테리어 배치"
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

      {/* 2. Top Summary Bar */}
      <div className="bg-white border-b border-toss-border px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-toss-muted font-medium flex items-center gap-1.5">
              <span>{currentDesk?.deskWidth}×{currentDesk?.deskDepth}mm 실측</span>
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
              {totalPrice.toLocaleString()}
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
            셋업 빌더
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
            데스크 가이드
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {activeTab === "builder" && (
          <>
            {/* 3. Golden Presets Carousel */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-extrabold text-toss-text flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 인기 테마 프리셋
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
                      className={`shrink-0 p-3 rounded-2xl border text-left transition-all active:scale-98 w-[155px] ${
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
                        {preset.totalPrice.toLocaleString()}원
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ======================================================= */}
            {/* ⭐ 핵심 요구사항 1: 데스크 선택부터 (규격, 크기, 상판 색상) */}
            {/* ======================================================= */}
            <div className="bg-white rounded-3xl border-2 border-blue-500/30 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-toss-text">
                      데스크(책상) 선택부터 시작하기
                    </h3>
                    <p className="text-[11px] text-toss-muted">
                      가로폭과 상판 컬러를 정하면 3D 모델에 실측으로 렌더링됩니다
                    </p>
                  </div>
                </div>
                <TossBadge variant="blue">필수 1단계</TossBadge>
              </div>

              {/* Desk Filters (크기 & 색상 & 모션데스크) */}
              <div className="space-y-2 pt-1">
                {/* 1. Width size filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-500 w-12 shrink-0">가로폭</span>
                  {(["all", 1200, 1400, 1600] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setDeskSizeFilter(size)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        deskSizeFilter === size
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {size === "all" ? "전체" : `${size}mm`}
                    </button>
                  ))}
                </div>

                {/* 2. Color filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-gray-500 w-12 shrink-0">상판색</span>
                  {(
                    [
                      { id: "all", label: "전체" },
                      { id: "wood", label: "내추럴 우드" },
                      { id: "white", label: "퓨어 화이트" },
                      { id: "black", label: "매트 블랙" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setDeskColorFilter(c.id)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        deskColorFilter === c.id
                          ? "bg-slate-800 text-white shadow-2xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* 3. Motion Desk toggle */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={motionOnly}
                      onChange={(e) => setMotionOnly(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>전동 높이조절 모션데스크만 보기</span>
                  </label>
                  <span className="text-[11px] text-blue-600 font-semibold">
                    {filteredDesks.length}개 모델 검색됨
                  </span>
                </div>
              </div>

              {/* Desk Selection Grid */}
              <div className="space-y-2 pt-1 max-h-[260px] overflow-y-auto pr-0.5">
                {filteredDesks.map((d) => {
                  const isSelected = build.desk === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => handleSelectPart("desk", d.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? "border-toss-blue bg-blue-50/70 shadow-xs ring-1 ring-toss-blue"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-xs text-toss-text">{d.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                              선택됨
                            </span>
                          )}
                          {d.isMotionDesk && (
                            <span className="text-[9px] bg-purple-100 text-purple-700 px-1 py-0.2 rounded font-bold">
                              전동모터
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{d.specs}</p>
                        <span className="text-xs font-bold text-toss-blue mt-0.5 inline-block">
                          {d.price.toLocaleString()}원
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPurchase("desk", d);
                        }}
                        className="px-2 py-1 text-[11px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg shrink-0 flex items-center gap-1"
                      >
                        구매 <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ======================================================= */}
            {/* ⭐ 핵심 요구사항 2 & 3: 실측 3D 렌더링 & 360도 회전 */}
            {/* ======================================================= */}
            <Desk3DViewer
              build={build}
              positions={positions}
              score={compatibility.score}
              height={360}
              onUpdatePosition={setPositions}
            />

            {/* ======================================================= */}
            {/* ⭐ 핵심 요구사항 4: 데스크테리어 위치 변경 컨트롤러 */}
            {/* ======================================================= */}
            <TossCard
              title="데스크테리어 위치 & 실측 공간 조절"
              subtitle={`현재 잔여 상판 공간: 약 ${deskSpaceStats.remainingCm}cm 여유`}
              badge={<TossBadge variant="purple">위치 변경</TossBadge>}
              padding="sm"
            >
              <div className="space-y-3 pt-1">
                {/* Real-time Surface Space Stats Bar */}
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
                      style={{ width: `${(deskSpaceStats.monW / deskSpaceStats.totalW) * 100}%` }}
                      title="모니터 점유"
                    />
                    {deskSpaceStats.pcW > 0 && (
                      <div
                        className="bg-indigo-600 h-full transition-all"
                        style={{ width: `${(deskSpaceStats.pcW / deskSpaceStats.totalW) * 100}%` }}
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
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" /> PC 본체
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 여유
                    </span>
                  </div>
                </div>

                {/* Position Controller 1: Monitor Position */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-toss-text">모니터 가로 위치</span>
                    <span className="text-[11px] text-toss-muted">
                      {positions.monitorX === 0
                        ? "중앙 정면"
                        : positions.monitorX > 0
                        ? `우측 +${positions.monitorX / 10}cm`
                        : `좌측 ${positions.monitorX / 10}cm`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => setPositions((p) => ({ ...p, monitorX: -200 }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.monitorX === -200
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      좌측 (-20cm)
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, monitorX: 0 }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.monitorX === 0
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      정중앙 (0)
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, monitorX: 200 }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.monitorX === 200
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      우측 (+20cm)
                    </button>
                  </div>
                </div>

                {/* Position Controller 2: PC Tower Placement */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-toss-text">PC 본체 배치 위치</span>
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
                      onClick={() => setPositions((p) => ({ ...p, pcPlacement: "desk-right" }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.pcPlacement === "desk-right"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      책상 위 우측
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, pcPlacement: "desk-left" }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.pcPlacement === "desk-left"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      책상 위 좌측
                    </button>
                    <button
                      onClick={() => setPositions((p) => ({ ...p, pcPlacement: "floor-right" }))}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        positions.pcPlacement === "floor-right"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      책상 아래 바닥
                    </button>
                  </div>
                </div>

                {/* Position Controller 3: Keyboard & Mouse Alignment */}
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

                {/* Position Controller 4: Speakers & Accessories */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div>
                    <span className="font-bold text-gray-700 block mb-1">스피커 배치</span>
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
                    <span className="font-bold text-gray-700 block mb-1">맥세이프 거치대</span>
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
              </div>
            </TossCard>

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

            {/* Component Slot Pickers (모니터, 암, 의자, 키마, 조명, 악세서리) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="font-extrabold text-sm text-toss-text">
                  부품별 맞춤 커스텀 (모니터·의자·조명 등)
                </h4>
                <span className="text-[11px] text-toss-muted">터치하여 변경</span>
              </div>

              {(
                [
                  "monitor",
                  "monitorArm",
                  "chair",
                  "keyboardMouse",
                  "lightingMat",
                  "accessories",
                ] as DeskSlotKey[]
              ).map((slot) => {
                const isExpanded = selectedSlot === slot;
                const currentPart = getPartOption(slot, build[slot]);
                const options = DESK_PARTS[slot];

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
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-toss-blue">
                            {SLOT_LABELS[slot]}
                          </span>
                          {currentPart?.tags && currentPart.tags[0] && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                              {currentPart.tags[0]}
                            </span>
                          )}
                        </div>
                        <h5 className="font-extrabold text-sm text-toss-text truncate mt-0.5">
                          {currentPart ? currentPart.name : "선택되지 않음"}
                        </h5>
                        <p className="text-xs font-bold text-blue-600 mt-0.5">
                          {currentPart ? `${currentPart.price.toLocaleString()}원` : "0원"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {currentPart && (
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
                          return (
                            <div
                              key={option.id}
                              onClick={() => handleSelectPart(slot, option.id)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-center justify-between ${
                                isSelected
                                  ? "border-toss-blue bg-blue-50/70 shadow-2xs"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-xs text-toss-text">
                                    {option.name}
                                  </span>
                                  {isSelected && (
                                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                                      선택됨
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                  {option.specs}
                                </p>
                                <span className="text-xs font-bold text-toss-blue mt-1 inline-block">
                                  {option.price.toLocaleString()}원
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPurchase(slot, option);
                                }}
                                className="px-2 py-1 text-[11px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg shrink-0 flex items-center gap-1"
                              >
                                링크 <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <TossButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleCopyQuotation}
              >
                {copied ? "견적서가 복사되었습니다!" : "전체 견적서 클립보드 복사"}
              </TossButton>
              <TossButton
                variant="secondary"
                fullWidth
                size="md"
                onClick={() => handleLoadPreset(PRESET_SETUPS[0])}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1 inline" /> 30만원 가성비 셋업으로 초기화
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
                저장된 나만의 데스크 셋업 ({savedSetups.length}개)
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
                저장된 데스크 셋업이 없습니다.
                <br />
                빌더 탭에서 마음에 드는 조합을 만들고 보관해보세요!
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
            <TossCard title="실패 없는 모니터암 선택 가이드" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext leading-relaxed pt-1">
                <p>
                  <strong className="text-toss-text">• 모니터 스펙상 무게 확인</strong>: 스탠드
                  제외 본체 무게가 기준입니다.
                </p>
                <p>
                  <strong className="text-toss-text">• 34인치 와이드 이상</strong>: 일반 모니터암은
                  고개가 숙여질 수 있어 최대 15kg 이상을 지탱하는 '고중량 전용 암'이 필수입니다.
                </p>
                <p>
                  <strong className="text-toss-text">• 책상 하판 프레임 간섭</strong>: 상판 테두리에
                  철제 프레임이 지나가는 책상은 클램프 깊이(보통 5~8cm)가 확보되는지 확인해야 합니다.
                </p>
              </div>
            </TossCard>

            <TossCard title="바닥 선정리 3대 법칙" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext leading-relaxed pt-1">
                <p>
                  <strong className="text-toss-text">1. 바닥에 멀티탭을 두지 마세요</strong>:
                  언더데스크 메쉬 트레이나 벨크로 타이로 책상 하판에 멀티탭을 띄우면 로봇청소기도
                  걸리지 않습니다.
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
