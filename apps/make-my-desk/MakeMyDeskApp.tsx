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
} from "./catalog";
import {
  DeskBuildState,
  getPartOption,
  calculateTotalPrice,
  checkDeskCompatibility,
} from "./engine";
import { Desk2DViewer } from "./Desk2DViewer";
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
} from "lucide-react";
import confetti from "canvas-confetti";

interface MakeMyDeskAppProps {
  onBack?: () => void;
  onNavigateToPc?: () => void;
}

export const MakeMyDeskApp: React.FC<MakeMyDeskAppProps> = ({ onBack, onNavigateToPc }) => {
  // Current Build State (default: 60만원 화이트 미니멀 프리셋)
  const [build, setBuild] = useState<DeskBuildState>(() => {
    return { ...PRESET_SETUPS[1].parts };
  });

  const [activeTab, setActiveTab] = useState<"builder" | "saved" | "guide">("builder");
  const [selectedSlot, setSelectedSlot] = useState<DeskSlotKey | null>("desk");
  const [purchasePart, setPurchasePart] = useState<DeskPartOption | null>(null);
  const [purchaseCategory, setPurchaseCategory] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Saved setups in localStorage
  const [savedSetups, setSavedSetups] = useState<Array<{ id: string; date: string; name: string; price: number; build: DeskBuildState }>>(() => {
    try {
      const raw = localStorage.getItem("my_desk_setups");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Monetization modals
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [showTossPay, setShowTossPay] = useState(false);

  // Total price & Compatibility
  const totalPrice = useMemo(() => calculateTotalPrice(build), [build]);
  const compatibility = useMemo(() => checkDeskCompatibility(build), [build]);

  // Load Preset
  const handleLoadPreset = (preset: DeskPreset) => {
    setBuild({ ...preset.parts });
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  // Change individual slot item
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

  // Copy full quotation to clipboard
  const handleCopyQuotation = () => {
    const lines = [
      `[📐 데스크테리어 맞춤 견적서]`,
      `• 총 견적 금액: ${totalPrice.toLocaleString()}원`,
      `• 호환성 점수: ${compatibility.score}점 (${compatibility.isCompatible ? "완벽 호환" : "주의 필요"})`,
      `------------------------`,
    ];

    (Object.keys(build) as DeskSlotKey[]).forEach((slot) => {
      const part = getPartOption(slot, build[slot]);
      if (part) {
        lines.push(`• ${SLOT_LABELS[slot]}: ${part.name} (${part.price.toLocaleString()}원)`);
      }
    });

    lines.push(`------------------------`);
    lines.push(`* 쿠팡 최저가 검색: https://link.coupang.com/re/AFFSRP?lptag=${USER_COUPANG_SUBID}&pageKey=%EB%8D%B0%EC%8A%A4%ED%81%AC%ED%85%8C%EB%A6%AC%EC%96%B4`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save setup to storage
  const handleSaveSetup = () => {
    const deskPart = getPartOption("desk", build.desk);
    const monPart = getPartOption("monitor", build.monitor);
    const setupName = `${deskPart?.brand || "커스텀"} + ${monPart?.brand || ""} 셋업`;

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
        subtitle="감성 데스크테리어 & 호환성 검사"
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

      {/* 2. Top Summary Bar (Sticky/Prominent) */}
      <div className="bg-white border-b border-toss-border px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-toss-muted font-medium flex items-center gap-1.5">
              <span>총 7종 맞춤 견적</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className={compatibility.isCompatible ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
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

        {/* 3. Navigation Tabs */}
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
            {/* 4. Golden Presets Carousel */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-extrabold text-toss-text flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 인기 데스크 테마 프리셋
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
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${preset.tagColor}`}>
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

            {/* 5. Interactive 2D Desk Visualizer Stage */}
            <Desk2DViewer build={build} score={compatibility.score} />

            {/* 6. Smart Compatibility Status Card */}
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
                      <p className="text-[11px] leading-relaxed opacity-90 mt-0.5">{issue.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TossCard>

            {/* 7. Cross Promotion to Make My PC */}
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
                    <span className="px-1.5 py-0.2 bg-blue-500 text-white rounded text-[9px]">인기</span>
                  </div>
                  <h4 className="text-xs font-bold text-white">
                    내 데스크에 딱 맞는 조립 PC 견적도 맞추기
                  </h4>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* 8. Component Slot Pickers (7 Slots) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="font-extrabold text-sm text-toss-text">
                  부품별 맞춤 커스텀 (7개 품목)
                </h4>
                <span className="text-[11px] text-toss-muted">터치하여 변경</span>
              </div>

              {(Object.keys(DESK_PARTS) as DeskSlotKey[]).map((slot) => {
                const isExpanded = selectedSlot === slot;
                const currentPart = getPartOption(slot, build[slot]);
                const options = DESK_PARTS[slot];

                return (
                  <div
                    key={slot}
                    className="bg-white rounded-2xl border border-toss-border overflow-hidden shadow-2xs transition"
                  >
                    {/* Slot Header Bar */}
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
                          목록에서 원하는 제품을 선택하시면 즉시 시뮬레이션에 반영됩니다:
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

            {/* 9. Action Buttons */}
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

        {/* ======================================================= */}
        {/* TAB 2: 내 보관함 */}
        {/* ======================================================= */}
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

        {/* ======================================================= */}
        {/* TAB 3: 데스크 가이드 */}
        {/* ======================================================= */}
        {activeTab === "guide" && (
          <div className="space-y-3">
            <TossCard title="실패 없는 모니터암 선택 가이드" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext leading-relaxed pt-1">
                <p>
                  <strong className="text-toss-text">• 모니터 스펙상 무게 확인</strong>: 스탠드 제외 본체 무게가 기준입니다.
                </p>
                <p>
                  <strong className="text-toss-text">• 34인치 와이드 이상</strong>: 일반 모니터암은 고개가 숙여질 수 있어 최대 15kg 이상을 지탱하는 '고중량 전용 암'이 필수입니다.
                </p>
                <p>
                  <strong className="text-toss-text">• 책상 하판 프레임 간섭</strong>: 상판 테두리에 철제 프레임이 지나가는 책상은 클램프 깊이(보통 5~8cm)가 확보되는지 확인해야 합니다.
                </p>
              </div>
            </TossCard>

            <TossCard title="바닥 선정리 3대 법칙" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext leading-relaxed pt-1">
                <p>
                  <strong className="text-toss-text">1. 바닥에 멀티탭을 두지 마세요</strong>: 언더데스크 메쉬 트레이나 벨크로 타이로 책상 하판에 멀티탭을 띄우면 로봇청소기도 걸리지 않습니다.
                </p>
                <p>
                  <strong className="text-toss-text">2. 모션데스크는 전선 여유 50cm</strong>: 최고 높이(120cm)로 올렸을 때 코드가 뽑히지 않도록 3m 이상 멀티탭을 사용하세요.
                </p>
                <p>
                  <strong className="text-toss-text">3. 모니터암 내부로 케이블 매립</strong>: 전원선과 DP/HDMI 선을 모니터암 기둥 커버 안으로 넣으면 정면에서 선이 전혀 보이지 않습니다.
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
