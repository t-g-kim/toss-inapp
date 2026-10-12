/**
 * 원룸 가구 배치 3D - 메인 인앱 컴포넌트
 * - 토스 디자인 시스템(TDS) 가이드라인 100% 준수
 * - 2D 평면도 & 3D 아이소메트릭 뷰어 실시간 전환
 * - 실시간 문 개폐 간섭 및 가구 충돌 진단
 * - 보상형 광고 (VIP 인테리어 템플릿) & 토스페이 990원 소장템 결제 연동
 */

import React, { useState, useMemo } from "react";
import {
  ROOM_TEMPLATES,
  FURNITURE_CATALOG,
  GOLDEN_PRESETS,
  RoomTemplate,
  PlacedFurniture,
  FurnitureItem,
  getFurnitureById,
  getTemplateById,
} from "./catalog";
import { analyzeRoomLayout } from "./engine";
import { Room2DViewer } from "./Room2DViewer";
import { Room3DViewer } from "./Room3DViewer";
import {
  TossButton,
  TossCard,
  TossBadge,
  RewardedAdModal,
  TossPayModal,
  AdBanner,
} from "@shared/index";
import confetti from "canvas-confetti";
import {
  Layout,
  Box,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Share2,
  RefreshCw,
  Plus,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  Sliders,
  Compass,
} from "lucide-react";

interface RoomFitAppProps {
  onBack?: () => void;
}

export const RoomFitApp: React.FC<RoomFitAppProps> = ({ onBack }) => {
  // 1. 방 템플릿 & 배치 가구 상태
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("room_7py");
  const [placedFurniture, setPlacedFurniture] = useState<PlacedFurniture[]>(
    GOLDEN_PRESETS[1].furniture // 7평 재택근무 기본 로드
  );
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // 2. 뷰 모드 (2D 평면도 vs 3D 룸)
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");

  // 3. 가구 추가 모달/드로어 카테고리 필터
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // 4. 수익화 모달 상태
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [unlockedVipTemplate, setUnlockedVipTemplate] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [unlockedChecklist, setUnlockedChecklist] = useState(false);

  // 현재 활성 방 템플릿
  const currentTemplate = useMemo(() => {
    return getTemplateById(selectedTemplateId);
  }, [selectedTemplateId]);

  // 실시간 공간 & 간섭 진단 엔진 결과
  const diagnostics = useMemo(() => {
    return analyzeRoomLayout(currentTemplate, placedFurniture);
  }, [currentTemplate, placedFurniture]);

  // 가구 위치 이동
  const handleMoveFurniture = (instanceId: string, x: number, y: number) => {
    setPlacedFurniture((prev) =>
      prev.map((item) => (item.instanceId === instanceId ? { ...item, x, y } : item))
    );
  };

  // 가구 90도 회전
  const handleRotateFurniture = (instanceId: string) => {
    setPlacedFurniture((prev) =>
      prev.map((item) => {
        if (item.instanceId !== instanceId) return item;
        const nextRot = ((item.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...item, rotation: nextRot };
      })
    );
  };

  // 가구 삭제
  const handleDeleteFurniture = (instanceId: string) => {
    setPlacedFurniture((prev) => prev.filter((item) => item.instanceId !== instanceId));
    if (selectedInstanceId === instanceId) {
      setSelectedInstanceId(null);
    }
  };

  // 신규 가구 방 중앙에 추가
  const handleAddFurniture = (furniture: FurnitureItem) => {
    const newId = `f_${Date.now()}`;
    const startX = Math.max(10, Math.round((currentTemplate.width - furniture.width) / 2));
    const startY = Math.max(10, Math.round((currentTemplate.depth - furniture.depth) / 2));

    const newPlaced: PlacedFurniture = {
      instanceId: newId,
      furnitureId: furniture.id,
      x: startX,
      y: startY,
      rotation: 0,
    };

    setPlacedFurniture((prev) => [...prev, newPlaced]);
    setSelectedInstanceId(newId);
  };

  // 원터치 황금 프리셋 적용
  const handleApplyPreset = (presetId: string) => {
    const preset = GOLDEN_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedTemplateId(preset.templateId);
    setPlacedFurniture(preset.furniture);
    setSelectedInstanceId(null);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // 전체 가구 비우기
  const handleClearAll = () => {
    if (window.confirm("배치된 모든 가구를 지우고 빈 방으로 시작할까요?")) {
      setPlacedFurniture([]);
      setSelectedInstanceId(null);
    }
  };

  // 견적/배치 결과 공유
  const handleShare = () => {
    const lines = [
      `🏡 [원룸 가구 배치 3D] 나만의 방배치 결과`,
      `- 방 크기: ${currentTemplate.name} (${currentTemplate.py}평 / ${currentTemplate.sqm}㎡)`,
      `- 배치 가구 수: ${placedFurniture.length}개`,
      `- 공간 점유율: ${diagnostics.occupancyPercent}% (${diagnostics.comfortTier})`,
      `- 쾌적도 점수: ${diagnostics.comfortScore}점`,
      diagnostics.isSafe ? `✓ 문 개폐 간섭 없음 (안전)` : `⚠️ 문 또는 가구 간섭 주의 필요`,
      `👉 토스에서 실시간 3D로 방배치 시뮬레이션해 보세요!`,
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    alert("🎉 방배치 결과 요약이 클립보드에 복사되었습니다!");
  };

  // 가구 카탈로그 필터링
  const filteredCatalog = useMemo(() => {
    if (activeCategory === "all") return FURNITURE_CATALOG;
    return FURNITURE_CATALOG.filter((f) => f.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] pb-24 font-sans select-none antialiased">
      {/* 1. 상단 네비게이션 헤더 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-gray-500 hover:text-gray-900 rounded-full transition cursor-pointer"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-gray-900 tracking-tight whitespace-nowrap">
                원룸 가구 배치 3D
              </h1>
              <TossBadge variant="blue" size="sm" className="whitespace-nowrap">
                간섭 진단
              </TossBadge>
            </div>
            <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
              문 개폐 반경 체크와 실시간 3D 가상 평면도
            </p>
          </div>
        </div>

        {/* 2D / 3D 전환 토글 스위치 */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200/80 shrink-0">
          <button
            onClick={() => setViewMode("2d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              viewMode === "2d"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>2D 평면</span>
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              viewMode === "3d"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D 룸</span>
          </button>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* 방 템플릿 선택 탭 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROOM_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => {
                setSelectedTemplateId(tpl.id);
                setSelectedInstanceId(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedTemplateId === tpl.id
                  ? "bg-blue-50 border-blue-500 text-blue-600 shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{tpl.name}</span>
              <span className="text-[10px] font-medium opacity-80">
                ({tpl.py}평)
              </span>
            </button>
          ))}
        </div>

        {/* 메인 뷰어 (2D 평면도 또는 3D 룸 뷰어) */}
        <div className="w-full flex justify-center">
          {viewMode === "2d" ? (
            <Room2DViewer
              template={currentTemplate}
              placed={placedFurniture}
              selectedId={selectedInstanceId}
              diagnostics={diagnostics}
              onSelect={setSelectedInstanceId}
              onMove={handleMoveFurniture}
              onRotate={handleRotateFurniture}
              onDelete={handleDeleteFurniture}
            />
          ) : (
            <Room3DViewer
              template={currentTemplate}
              placed={placedFurniture}
              selectedId={selectedInstanceId}
              onSelect={setSelectedInstanceId}
            />
          )}
        </div>

        {/* 쾌적도 & 간섭 진단 대시보드 카드 */}
        <TossCard
          title={
            diagnostics.isSafe
              ? "✨ 공간 쾌적도 진단 통과"
              : "⚠️ 공간 간섭 주의 필요"
          }
          subtitle={`점유율 ${diagnostics.occupancyPercent}% · 여유 면적 ${diagnostics.freeAreaSqm}㎡ (${(diagnostics.freeAreaSqm / 3.3).toFixed(1)}평)`}
          badge={
            <TossBadge
              variant={
                diagnostics.comfortScore >= 80
                  ? "green"
                  : diagnostics.comfortScore >= 60
                    ? "orange"
                    : "red"
              }
            >
              {diagnostics.comfortScore}점 · {diagnostics.comfortTier}
            </TossBadge>
          }
        >
          <div className="space-y-3 pt-1">
            {/* 점유율 프로그레스 바 */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-1">
                <span>가구 점유 면적</span>
                <span className="text-gray-900 font-black">
                  {diagnostics.furnitureAreaSqm}㎡ / {diagnostics.roomAreaSqm}㎡ ({diagnostics.occupancyPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    diagnostics.occupancyPercent <= 38
                      ? "bg-emerald-500"
                      : diagnostics.occupancyPercent <= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(100, diagnostics.occupancyPercent)}%` }}
                />
              </div>
            </div>

            {/* 실시간 경고/안내 메시지 리스트 */}
            {diagnostics.doorConflicts.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                {diagnostics.doorConflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 text-xs text-rose-800 font-bold"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{c.message}</span>
                  </div>
                ))}
              </div>
            )}

            {diagnostics.collisions.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                {diagnostics.collisions.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-1.5 text-xs text-amber-900 font-bold"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {c.nameA}과(와) {c.nameB}이(가) 서로 겹쳐 있습니다.
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 인테리어 전문가 조언 팁 */}
            {diagnostics.tips.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-gray-100">
                {diagnostics.tips.map((tip, idx) => (
                  <p key={idx} className="text-[11px] text-gray-600 leading-relaxed">
                    {tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        </TossCard>

        {/* 원터치 추천 황금 배치 로더 카드 */}
        <TossCard
          title="⚡ 원터치 황금 인테리어 배치"
          subtitle="실제 자취생들이 가장 만족한 검증된 가구 구조 바로 로드"
        >
          <div className="grid grid-cols-3 gap-2 pt-1">
            {GOLDEN_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p.id)}
                className="p-3 bg-white hover:bg-blue-50/50 border border-gray-200 hover:border-blue-400 rounded-2xl text-left transition flex flex-col justify-between group cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                <div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                    {p.tag}
                  </span>
                  <h4 className="font-extrabold text-xs text-gray-900 mt-1.5 group-hover:text-blue-600">
                    {p.name}
                  </h4>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-tight">
                  {p.subtitle}
                </p>
              </button>
            ))}
          </div>
        </TossCard>

        {/* 가구 추가하기 카탈로그 섹션 */}
        <TossCard
          title="🛋️ 가구 카탈로그에서 추가하기"
          subtitle="표준 규격 가구를 클릭하면 방 중앙에 즉시 배치됩니다"
        >
          {/* 가구 카테고리 필터 칩 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "전체" },
              { id: "bed", label: "침대" },
              { id: "desk", label: "책상/식탁" },
              { id: "storage", label: "옷장/선반" },
              { id: "living", label: "소파/가전" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 가구 아이템 그리드 */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-gray-200 rounded-2xl flex flex-col justify-between hover:border-blue-300 transition shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {item.categoryLabel}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {item.specSummary}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-gray-900 leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleAddFurniture(item)}
                  className="mt-2.5 w-full py-1.5 bg-gray-50 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-gray-200 hover:border-blue-200 transition flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>배치하기</span>
                </button>
              </div>
            ))}
          </div>
        </TossCard>

        {/* 현재 배치된 가구 목록 및 전체 리셋 */}
        <TossCard
          title={`📦 현재 방에 배치된 가구 (${placedFurniture.length}개)`}
          subtitle="위치를 조절하거나 회전할 수 있습니다"
        >
          {placedFurniture.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-xs">
              배치된 가구가 없습니다. 위 카탈로그에서 가구를 추가해 보세요!
            </div>
          ) : (
            <div className="space-y-2 pt-1 text-xs">
              {placedFurniture.map((p) => {
                const meta = getFurnitureById(p.furnitureId);
                const isSelected = p.instanceId === selectedInstanceId;

                return (
                  <div
                    key={p.instanceId}
                    onClick={() => setSelectedInstanceId(p.instanceId)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-gray-900 block truncate">
                        {meta?.name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {meta?.specSummary} · ({p.x}, {p.y})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRotateFurniture(p.instanceId);
                        }}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-[11px] font-bold text-gray-700 transition"
                      >
                        {p.rotation}°
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFurniture(p.instanceId);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold text-gray-400 hover:text-rose-500 transition"
                >
                  가구 전체 비우기
                </button>
              </div>
            </div>
          )}
        </TossCard>

        {/* VIP 원룸 공간분리 템플릿 (보상형 광고) */}
        <TossCard
          title="✨ 원룸 공간분리 인테리어 가벽 템플릿"
          subtitle="침실과 생활 공간을 시각적으로 완벽 분리하는 3대 팁"
          badge={
            <TossBadge variant="purple">
              {unlockedVipTemplate ? "열람 완료" : "무료 잠금해제"}
            </TossBadge>
          }
        >
          {unlockedVipTemplate ? (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1.5 animate-fade-in">
              <h5 className="font-bold text-purple-800">
                ✓ 3대 공간분리 황금 원칙
              </h5>
              <p>1. 책장/오픈형 행거를 침대 발치에 두어 침실 가벽으로 활용</p>
              <p>2. 원형 러그를 소파/테이블 영역에만 깔아 시각적 거실 구획 생성</p>
              <p>3. 침대는 창문과 평행하게 벽면에 붙여 이동 통로 70cm 확보</p>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <TossButton
                variant="secondary"
                size="md"
                onClick={() => setIsAdOpen(true)}
              >
                <Sparkles className="w-4 h-4 mr-1 text-purple-600 inline" />
                <span>광고 보고 공간분리 템플릿 열람하기</span>
              </TossButton>
            </div>
          )}
        </TossCard>

        {/* 990원 입주 전 50대 체크리스트 소장 (토스페이) */}
        <TossCard
          title="📋 자취방 입주 전 50대 필수 점검 체크리스트"
          subtitle="수압, 곰팡이, 방음, 보일러 연식 등 입주 당일 하자 방지 보증서"
          badge={
            <TossBadge variant="orange">
              {unlockedChecklist ? "소장 완료" : "990원"}
            </TossBadge>
          }
        >
          {unlockedChecklist ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5 animate-fade-in">
              <h5 className="font-bold text-amber-800">
                ✓ 필수 입주 점검 5대 우선순위
              </h5>
              <p>1. 주방 싱크대 및 화장실 세면대 수압 동시 틀어보기</p>
              <p>2. 창틀 실리콘 및 벽지 모서리 누수/결로 곰팡이 흔적 체크</p>
              <p>3. 옵션 에어컨 필터 및 보일러 제조년월일 10년 초과 여부</p>
              <p>4. 변기 물 내림 후 바닥 배수구 역류 냄새 점검</p>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <TossButton
                variant="secondary"
                size="md"
                onClick={() => setIsPaymentOpen(true)}
              >
                <ShieldCheck className="w-4 h-4 mr-1 text-amber-500 inline" />
                <span>체크리스트 영구 소장하기 (990원)</span>
              </TossButton>
            </div>
          )}
        </TossCard>

        {/* 공유하기 및 다시하기 버튼 */}
        <div className="space-y-2 pt-2">
          <TossButton variant="primary" size="lg" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1.5 inline" />
            <span>방배치 결과 복사 및 친구에게 공유</span>
          </TossButton>

          <TossButton
            variant="secondary"
            size="md"
            onClick={() => handleApplyPreset("preset_sleep")}
          >
            <RefreshCw className="w-4 h-4 mr-1 inline" />
            <span>기본 추천 배치로 초기화</span>
          </TossButton>
        </div>

        {/* 하단 배너 */}
        <AdBanner
          title="원룸 가구·인테리어 소품 특가전"
          subtitle="내 방 치수에 딱 맞는 맞춤 가구 최저가 확인"
          actionText="특가 보기"
          url="https://link.coupang.com/a/hJYE2tA1Lw"
        />
      </main>

      {/* 보상형 광고 모달 */}
      <RewardedAdModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onRewarded={() => {
          setUnlockedVipTemplate(true);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }}
        rewardTitle="원룸 공간분리 황금 인테리어 템플릿 열람"
        adDurationSeconds={5}
      />

      {/* 토스페이 소액 결제 모달 (990원) */}
      <TossPayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => {
          setIsPaymentOpen(false);
          setUnlockedChecklist(true);
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
          alert("🎉 자취방 입주 50대 체크리스트가 영구 소장되었습니다!");
        }}
        productName="자취방 입주 전 50대 필수 점검 체크리스트"
        price={990}
      />
    </div>
  );
};
