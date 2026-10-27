import React, { useState, useRef } from "react";
import {
  FACE_SHAPES,
  HAIR_OPTIONS,
  HAIR_COLORS,
  GLASSES_OPTIONS,
  GLASSES_COLORS,
  LENS_TINTS,
  BEARD_OPTIONS,
  ACCESSORY_OPTIONS,
  FaceShapeKey,
  FaceShapeInfo,
  HairOption,
  HairColorOption,
  GlassesOption,
  GlassesColorOption,
  LensTintOption,
  BeardOption,
  AccessoryOption,
  calculateCompatibility,
} from "./catalog";
import {
  DIAGNOSIS_QUESTIONS,
  calculateDiagnosisResult,
} from "./engine";
import { FaceCanvasViewer, TouchControlMode } from "./FaceCanvasViewer";
import { ShareCardModal } from "./ShareCardModal";
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
  Share2,
  Sparkles,
  HelpCircle,
  BookOpen,
  RotateCcw,
  Check,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Sliders,
  Scissors,
  Glasses,
  Smile,
  ShieldCheck,
  Camera,
  Hand,
  Sun,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";

interface FaceFitAppProps {
  onBack?: () => void;
}

type MainTab = "fitting" | "diagnosis" | "guide";
type SubCategory = "face" | "hair" | "glasses" | "detail" | "preset";

export const FaceFitApp: React.FC<FaceFitAppProps> = ({ onBack }) => {
  const [currentTab, setCurrentTab] = useState<MainTab>("fitting");
  const [subCategory, setSubCategory] = useState<SubCategory>("face");

  // Selection states
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [selectedFaceKey, setSelectedFaceKey] = useState<FaceShapeKey>(
    (urlParams?.get("face") as FaceShapeKey) || "oval"
  );
  const [selectedHairId, setSelectedHairId] = useState<string>(
    urlParams?.get("hair") || "hair_seethrough_dandy"
  );
  const [selectedHairColorId, setSelectedHairColorId] = useState<string>("color_natural_black");
  const [selectedGlassesId, setSelectedGlassesId] = useState<string>(
    urlParams?.get("glasses") || "glasses_arnel"
  );
  const [selectedGlassesColorId, setSelectedGlassesColorId] = useState<string>("frame_matte_black");
  const [selectedLensTintId, setSelectedLensTintId] = useState<string>(
    urlParams?.get("tint") || "lens_clear"
  );
  const [selectedBeardId, setSelectedBeardId] = useState<string>("beard_none");
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string>("acc_none");
  const [touchControlMode, setTouchControlMode] = useState<TouchControlMode>(
    (urlParams?.get("mode") as TouchControlMode) || "sculpt"
  );
  const [hairGenderFilter, setHairGenderFilter] = useState<"all" | "male" | "female">("all");

  // User uploaded photo
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  // SVG element ref for canvas generation
  const [svgElement, setSvgElement] = useState<SVGSVGElement | null>(null);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);

  // Diagnosis quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [currentQuizStep, setCurrentQuizStep] = useState<number>(0);
  const [diagnosisFinished, setDiagnosisFinished] = useState<boolean>(false);
  const [diagnosedFaceKey, setDiagnosedFaceKey] = useState<FaceShapeKey | null>(null);

  // Derived current models
  const currentFace = FACE_SHAPES[selectedFaceKey];
  const currentHair = HAIR_OPTIONS.find((h) => h.id === selectedHairId) || HAIR_OPTIONS[0];
  const currentHairColor = HAIR_COLORS.find((c) => c.id === selectedHairColorId) || HAIR_COLORS[0];
  const currentGlasses = GLASSES_OPTIONS.find((g) => g.id === selectedGlassesId) || GLASSES_OPTIONS[0];
  const currentGlassesColor = GLASSES_COLORS.find((c) => c.id === selectedGlassesColorId) || GLASSES_COLORS[0];
  const currentLensTint = LENS_TINTS.find((t) => t.id === selectedLensTintId) || LENS_TINTS[0];
  const currentBeard = BEARD_OPTIONS.find((b) => b.id === selectedBeardId) || BEARD_OPTIONS[0];
  const currentAccessory = ACCESSORY_OPTIONS.find((a) => a.id === selectedAccessoryId) || ACCESSORY_OPTIONS[0];

  const compatibility = calculateCompatibility(selectedFaceKey, selectedHairId, selectedGlassesId);

  // Photo handlers
  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUserPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoClear = () => {
    setUserPhotoUrl(null);
  };

  // Reset to default
  const handleReset = () => {
    setSelectedFaceKey("oval");
    setSelectedHairId("hair_seethrough_dandy");
    setSelectedHairColorId("color_natural_black");
    setSelectedGlassesId("glasses_arnel");
    setSelectedGlassesColorId("frame_matte_black");
    setSelectedLensTintId("lens_clear");
    setSelectedBeardId("beard_none");
    setSelectedAccessoryId("acc_none");
    setTouchControlMode("sculpt");
    setUserPhotoUrl(null);
  };

  // Preset quick styles
  const applyPreset = (preset: {
    name: string;
    face: FaceShapeKey;
    hair: string;
    hairColor: string;
    glasses: string;
    glassesColor: string;
    lensTint?: string;
    beard?: string;
    accessory?: string;
  }) => {
    setSelectedFaceKey(preset.face);
    setSelectedHairId(preset.hair);
    setSelectedHairColorId(preset.hairColor);
    setSelectedGlassesId(preset.glasses);
    setSelectedGlassesColorId(preset.glassesColor);
    if (preset.lensTint) setSelectedLensTintId(preset.lensTint);
    if (preset.beard) setSelectedBeardId(preset.beard);
    if (preset.accessory) setSelectedAccessoryId(preset.accessory);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
  };

  // Save style handler
  const handleSaveStyle = () => {
    setSavedSuccessToast(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    setTimeout(() => setSavedSuccessToast(false), 2500);
  };

  // Quiz choice handler
  const handleSelectQuizOption = (optionIndex: number) => {
    const nextAnswers = [...quizAnswers, optionIndex];
    setQuizAnswers(nextAnswers);

    if (currentQuizStep + 1 < DIAGNOSIS_QUESTIONS.length) {
      setCurrentQuizStep(currentQuizStep + 1);
    } else {
      // Finished
      const resultFace = calculateDiagnosisResult(nextAnswers);
      setDiagnosedFaceKey(resultFace);
      setDiagnosisFinished(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestartQuiz = () => {
    setQuizAnswers([]);
    setCurrentQuizStep(0);
    setDiagnosisFinished(false);
    setDiagnosedFaceKey(null);
  };

  const handleApplyDiagnosedFace = (faceKey: FaceShapeKey) => {
    setSelectedFaceKey(faceKey);
    setCurrentTab("fitting");
    setSubCategory("hair");
  };

  // Filtered hairs
  const filteredHairs = HAIR_OPTIONS.filter((h) => {
    if (hairGenderFilter === "all") return true;
    if (hairGenderFilter === "male") return h.gender === "male" || h.gender === "unisex";
    if (hairGenderFilter === "female") return h.gender === "female" || h.gender === "unisex";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#191F28] flex flex-col font-sans pb-28">
      {/* 토스 표준 헤더 */}
      <TossHeader
        title="페이스핏"
        onBack={onBack}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              className="p-2 text-slate-500 hover:text-slate-800 transition-colors"
              title="피팅 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2 text-[#3182F6] hover:text-[#1b64da] transition-colors"
              title="친구에게 공유"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* 상단 3대 메인 탭 */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-30 px-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => setCurrentTab("fitting")}
            className={`flex-1 py-3.5 text-center text-sm font-bold relative transition-colors ${
              currentTab === "fitting" ? "text-[#3182F6]" : "text-slate-500"
            }`}
          >
            <span>가상 피팅룸</span>
            {currentTab === "fitting" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182F6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab("diagnosis")}
            className={`flex-1 py-3.5 text-center text-sm font-bold relative transition-colors ${
              currentTab === "diagnosis" ? "text-[#3182F6]" : "text-slate-500"
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <span>10초 얼굴형 진단</span>
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </span>
            {currentTab === "diagnosis" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182F6] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab("guide")}
            className={`flex-1 py-3.5 text-center text-sm font-bold relative transition-colors ${
              currentTab === "guide" ? "text-[#3182F6]" : "text-slate-500"
            }`}
          >
            <span>스타일 가이드</span>
            {currentTab === "guide" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3182F6] rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 저장 완료 토스트 알림 */}
      {savedSuccessToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>내 스타일에 안전하게 저장되었어요!</span>
        </div>
      )}

      {/* 탭 1: 가상 피팅룸 */}
      {currentTab === "fitting" && (
        <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
          {/* 인터랙티브 피팅 캔버스 뷰어 */}
          <FaceCanvasViewer
            faceShape={currentFace}
            hair={currentHair}
            hairColor={currentHairColor}
            glasses={currentGlasses}
            glassesColor={currentGlassesColor}
            lensTint={currentLensTint}
            beard={currentBeard}
            accessory={currentAccessory}
            compatibility={compatibility}
            userPhotoUrl={userPhotoUrl}
            onPhotoUpload={handlePhotoUpload}
            onPhotoClear={handlePhotoClear}
            svgRefCallback={setSvgElement}
            activeControlMode={touchControlMode}
            onControlModeChange={setTouchControlMode}
          />

          {/* 실시간 어울림 진단 카드 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-50 text-[#3182F6] text-xs font-bold rounded-lg">
                  {compatibility.badge}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {currentFace.name} × {currentHair.name} × {currentGlasses.name}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-black text-[#3182F6]">{compatibility.score}</span>
                <span className="text-xs font-bold text-slate-400">/100점</span>
              </div>
            </div>

            <p className="text-xs font-medium text-slate-700 leading-relaxed">
              {compatibility.comment}
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>{compatibility.expertTip}</span>
            </div>
          </div>

          {/* 피팅 옵션 5대 카테고리 탭 (얼굴형 / 헤어 / 안경 / 수염·모자 / 추천세트) */}
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center justify-between text-xs font-bold gap-1">
            <button
              onClick={() => {
                setSubCategory("face");
                setTouchControlMode("sculpt");
              }}
              className={`flex-1 py-2 px-0.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                subCategory === "face" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>얼굴형</span>
            </button>
            <button
              onClick={() => {
                setSubCategory("hair");
                setTouchControlMode("hair");
              }}
              className={`flex-1 py-2 px-0.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                subCategory === "hair" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>헤어</span>
            </button>
            <button
              onClick={() => {
                setSubCategory("glasses");
                setTouchControlMode("glasses");
              }}
              className={`flex-1 py-2 px-0.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                subCategory === "glasses" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              <Glasses className="w-3.5 h-3.5" />
              <span>안경·틴트</span>
            </button>
            <button
              onClick={() => setSubCategory("detail")}
              className={`flex-1 py-2 px-0.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                subCategory === "detail" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>수염·모자</span>
            </button>
            <button
              onClick={() => setSubCategory("preset")}
              className={`flex-1 py-2 px-0.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
                subCategory === "preset" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>세트</span>
            </button>
          </div>

          {/* 카테고리별 세부 피커 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
            {/* 1. 얼굴형 선택 */}
            {subCategory === "face" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">대표 얼굴형 선택 & 윤곽 직접 깎기</h4>
                  <button
                    onClick={() => setCurrentTab("diagnosis")}
                    className="text-[11px] text-[#3182F6] font-semibold flex items-center gap-0.5 hover:underline"
                  >
                    10초 진단하기 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(Object.keys(FACE_SHAPES) as FaceShapeKey[]).map((key) => {
                    const item = FACE_SHAPES[key];
                    const isSelected = selectedFaceKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedFaceKey(key)}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                          isSelected
                            ? "border-[#3182F6] bg-blue-50/50 text-[#3182F6] font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <span className="text-[11px] whitespace-nowrap">{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 직접 터치 조각 힌트 배너 */}
                <div className="p-3 bg-blue-50/80 rounded-xl text-xs space-y-1 border border-blue-100">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Hand className="w-3.5 h-3.5 text-[#3182F6]" />
                    <span>손으로 직접 넣을 곳 넣고 깎기</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    화면 속 <strong>동그라미 핸들</strong>을 손가락으로 드래그하면 광대뼈와 턱선이 실시간으로 쏙 들어갑니다.
                  </p>
                </div>

                {/* 현재 선택된 얼굴형 설명 */}
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{currentFace.name} ({currentFace.englishName})</span>
                    <span className="text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {currentFace.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{currentFace.desc}</p>
                </div>
              </div>
            )}

            {/* 2. 헤어스타일 & 컬러 선택 */}
            {subCategory === "hair" && (
              <div className="space-y-4">
                {/* 성별 필터 */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">헤어스타일 ({filteredHairs.length}종)</h4>
                  <div className="flex items-center gap-1 text-[11px] bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => setHairGenderFilter("all")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hairGenderFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => setHairGenderFilter("male")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hairGenderFilter === "male" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      남성
                    </button>
                    <button
                      onClick={() => setHairGenderFilter("female")}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        hairGenderFilter === "female" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                      }`}
                    >
                      여성
                    </button>
                  </div>
                </div>

                {/* 헤어스타일 가로 스크롤 카드 */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {filteredHairs.map((hairItem) => {
                    const isSelected = selectedHairId === hairItem.id;
                    const isBest = hairItem.bestFaces.includes(selectedFaceKey);

                    return (
                      <button
                        key={hairItem.id}
                        onClick={() => setSelectedHairId(hairItem.id)}
                        className={`min-w-[110px] p-2.5 rounded-xl border text-left shrink-0 transition-all ${
                          isSelected
                            ? "border-[#3182F6] bg-blue-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        {isBest && (
                          <span className="block text-[10px] font-bold text-emerald-600 mb-0.5">
                            ★ 찰떡 추천
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {hairItem.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          {hairItem.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 퍼스널 헤어 컬러 선택 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800">
                      염색 컬러: <span className="font-semibold text-[#3182F6]">{currentHairColor.name}</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">{currentHairColor.badge}</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {HAIR_COLORS.map((color) => {
                      const isSelected = selectedHairColorId === color.id;
                      return (
                        <button
                          key={color.id}
                          onClick={() => setSelectedHairColorId(color.id)}
                          className={`w-7 h-7 rounded-full shrink-0 border-2 transition-transform ${
                            isSelected ? "border-[#3182F6] scale-110 shadow-md" : "border-white"
                          }`}
                          style={{ backgroundColor: color.mainHex }}
                          title={color.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. 안경 프레임 & 컬러 선택 */}
            {subCategory === "glasses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">아이웨어 프레임 ({GLASSES_OPTIONS.length}종)</h4>
                  <span className="text-[11px] text-slate-500">얼굴형 보완 밸런스</span>
                </div>

                {/* 안경 그리드 */}
                <div className="grid grid-cols-2 gap-2">
                  {GLASSES_OPTIONS.map((g) => {
                    const isSelected = selectedGlassesId === g.id;
                    const isBest = g.bestFaces.includes(selectedFaceKey);
                    const isWorst = g.worstFaces.includes(selectedFaceKey);

                    return (
                      <button
                        key={g.id}
                        onClick={() => setSelectedGlassesId(g.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-[#3182F6] bg-blue-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base">{g.emoji}</span>
                          {isBest && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                              어울림
                            </span>
                          )}
                          {isWorst && (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1 py-0.5 rounded">
                              주의
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {g.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {g.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 안경테 컬러 선택 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800">
                      프레임 컬러: <span className="font-semibold text-[#3182F6]">{currentGlassesColor.name}</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">{currentGlassesColor.badge}</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {GLASSES_COLORS.map((gc) => {
                      const isSelected = selectedGlassesColorId === gc.id;
                      return (
                        <button
                          key={gc.id}
                          onClick={() => setSelectedGlassesColorId(gc.id)}
                          className={`w-7 h-7 rounded-full shrink-0 border-2 transition-transform ${
                            isSelected ? "border-[#3182F6] scale-110 shadow-md" : "border-slate-200"
                          }`}
                          style={{ backgroundColor: gc.frameColor }}
                          title={gc.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* 렌즈 틴트 & 선글라스 선택 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800">
                      렌즈 틴트: <span className="font-semibold text-[#3182F6]">{currentLensTint.name}</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">{currentLensTint.badge}</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {LENS_TINTS.map((lt) => {
                      const isSelected = selectedLensTintId === lt.id;
                      return (
                        <button
                          key={lt.id}
                          onClick={() => setSelectedLensTintId(lt.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                            isSelected
                              ? "bg-blue-50 border-[#3182F6] text-[#3182F6] ring-1 ring-[#3182F6]"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                            style={{
                              backgroundColor: lt.tintColor === "transparent" ? "#F1F5F9" : lt.tintColor,
                              opacity: lt.opacity > 0 ? Math.max(lt.opacity, 0.4) : 1,
                            }}
                          />
                          <span>{lt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. 디테일 & 악세서리 (수염 / 모자) */}
            {subCategory === "detail" && (
              <div className="space-y-4">
                {/* 모자 & 헤어 악세서리 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      모자 & 헤어 악세서리: <span className="text-[#3182F6]">{currentAccessory.name}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">힙한 무드 완성</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACCESSORY_OPTIONS.map((acc) => {
                      const isSelected = selectedAccessoryId === acc.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => setSelectedAccessoryId(acc.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-blue-50/70 border-[#3182F6] ring-1 ring-[#3182F6]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                              {acc.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{acc.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 수염 스타일 */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">
                      수염 그루밍: <span className="text-[#3182F6]">{currentBeard.name}</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">턱선 & 남성미 보완</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BEARD_OPTIONS.map((bd) => {
                      const isSelected = selectedBeardId === bd.id;
                      return (
                        <button
                          key={bd.id}
                          onClick={() => setSelectedBeardId(bd.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "bg-blue-50/70 border-[#3182F6] ring-1 ring-[#3182F6]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900">{bd.name}</span>
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {bd.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{bd.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. 추천 프리셋 세트 (1초 원클릭) */}
            {subCategory === "preset" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">2026 베스트 인기 스타일 팩</h4>
                  <span className="text-[10px] text-slate-400">1초 원클릭 피팅</span>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      name: "훈훈한 댄디 남친룩 (클래식 빈티지)",
                      face: "oval" as FaceShapeKey,
                      hair: "hair_seethrough_dandy",
                      hairColor: "color_natural_black",
                      glasses: "glasses_arnel",
                      glassesColor: "frame_matte_black",
                      badge: "인기 1위",
                      score: 98,
                    },
                    {
                      name: "샤프하고 지적인 프랑스 파리지앵",
                      face: "square" as FaceShapeKey,
                      hair: "hair_guile",
                      hairColor: "color_dark_espresso",
                      glasses: "glasses_crown_panto",
                      glassesColor: "frame_amber_tortoise",
                      badge: "카리스마",
                      score: 96,
                    },
                    {
                      name: "청순 우아 여신 스타일 (C컬 & 로즈골드)",
                      face: "heart" as FaceShapeKey,
                      hair: "hair_layered_c_curl",
                      hairColor: "color_milk_brown",
                      glasses: "glasses_round_metal",
                      glassesColor: "frame_rose_gold",
                      badge: "페미닌",
                      score: 97,
                    },
                    {
                      name: "자유로운 Y2K 힙스터 무드 (리프컷 & 무테)",
                      face: "round" as FaceShapeKey,
                      hair: "hair_leaf",
                      hairColor: "color_ash_grey",
                      glasses: "glasses_clear_horn",
                      glassesColor: "frame_crystal_clear",
                      lensTint: "lens_clear",
                      badge: "트렌드",
                      score: 95,
                    },
                    {
                      name: "스트릿 힙스터 (볼캡 & 선셋 틴트)",
                      face: "diamond" as FaceShapeKey,
                      hair: "hair_short_guile",
                      hairColor: "color_natural_black",
                      glasses: "glasses_octa_metal",
                      glassesColor: "frame_matte_black",
                      lensTint: "lens_sunset_orange",
                      accessory: "acc_ballcap",
                      badge: "스트릿",
                      score: 99,
                    },
                    {
                      name: "빈티지 아티스트 (베레모 & 클래식 콧수염)",
                      face: "oblong" as FaceShapeKey,
                      hair: "hair_leaf",
                      hairColor: "color_dark_espresso",
                      glasses: "glasses_crown_panto",
                      glassesColor: "frame_amber_tortoise",
                      lensTint: "lens_retro_yellow",
                      accessory: "acc_beret",
                      beard: "beard_mustache",
                      badge: "예술가",
                      score: 97,
                    },
                  ].map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyPreset(preset)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-200 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded">
                            {preset.badge}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {FACE_SHAPES[preset.face].name} · {HAIR_OPTIONS.find((h) => h.id === preset.hair)?.name} · {GLASSES_OPTIONS.find((g) => g.id === preset.glasses)?.name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#3182F6]">{preset.score}점</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 inline-block ml-0.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 광고 배너 */}
          <AdBanner className="my-2" />
        </div>
      )}

      {/* 탭 2: 10초 얼굴형 자가진단 */}
      {currentTab === "diagnosis" && (
        <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
          {!diagnosisFinished ? (
            /* 진단 퀴즈 진행 중 */
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5">
              {/* 진행률 바 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-[#3182F6]">
                    질문 {currentQuizStep + 1} / {DIAGNOSIS_QUESTIONS.length}
                  </span>
                  <span>{Math.round(((currentQuizStep + 1) / DIAGNOSIS_QUESTIONS.length) * 100)}% 진행됨</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3182F6] transition-all duration-300"
                    style={{
                      width: `${((currentQuizStep + 1) / DIAGNOSIS_QUESTIONS.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 현재 질문 */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  {DIAGNOSIS_QUESTIONS[currentQuizStep].question}
                </h3>
                <p className="text-xs text-slate-500">
                  {DIAGNOSIS_QUESTIONS[currentQuizStep].subtitle}
                </p>
              </div>

              {/* 선택지 목록 */}
              <div className="space-y-2.5">
                {DIAGNOSIS_QUESTIONS[currentQuizStep].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuizOption(idx)}
                    className="w-full p-3.5 bg-slate-50 hover:bg-blue-50/60 active:bg-blue-100 rounded-xl border border-slate-200 text-left transition-all group flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-300 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 group-hover:border-[#3182F6] group-hover:text-[#3182F6]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block group-hover:text-[#3182F6]">
                        {option.label}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {option.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 진단 결과 화면 */
            diagnosedFaceKey && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-5 animate-in fade-in">
                {/* 결과 헤더 */}
                <div className="text-center space-y-2">
                  <div className="text-5xl animate-bounce">
                    {FACE_SHAPES[diagnosedFaceKey].emoji}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3182F6] bg-blue-50 px-2 py-0.5 rounded-md">
                      {FACE_SHAPES[diagnosedFaceKey].badge}
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-1">
                      당신의 얼굴형은 '{FACE_SHAPES[diagnosedFaceKey].name}'입니다!
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    {FACE_SHAPES[diagnosedFaceKey].desc}
                  </p>
                </div>

                {/* 윤곽 분석 스펙 */}
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-slate-800">신체 비율 분석 결과</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block">가로세로 비율</span>
                      <span className="font-bold text-slate-800">
                        {FACE_SHAPES[diagnosedFaceKey].proportions.ratio}
                      </span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block">턱선 라인</span>
                      <span className="font-bold text-slate-800">
                        {FACE_SHAPES[diagnosedFaceKey].proportions.jawline}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 맞춤 추천 */}
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-emerald-900">
                    <span className="font-bold block mb-1">💇 추천 베스트 헤어</span>
                    <span className="text-[11px] leading-relaxed">
                      {FACE_SHAPES[diagnosedFaceKey].bestHair.join(", ")}
                    </span>
                  </div>

                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900">
                    <span className="font-bold block mb-1">👓 추천 베스트 안경</span>
                    <span className="text-[11px] leading-relaxed">
                      {FACE_SHAPES[diagnosedFaceKey].bestGlasses.join(", ")}
                    </span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleApplyDiagnosedFace(diagnosedFaceKey)}
                    className="w-full py-3.5 bg-[#3182F6] active:bg-[#1b64da] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>이 얼굴형으로 즉시 가상 피팅하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleRestartQuiz}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                  >
                    처음부터 다시 진단하기
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* 탭 3: 스타일 가이드 & 랭킹 */}
      {currentTab === "guide" && (
        <div className="flex-1 max-w-md mx-auto w-full px-4 pt-4 space-y-4">
          {/* 안경 고르는 황금 법칙 3가지 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 text-[#3182F6] rounded-lg flex items-center justify-center font-bold text-xs">
                TIP
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">실패 없는 안경 선택 3대 법칙</h4>
                <p className="text-[11px] text-slate-500">전문 안경사가 알려주는 황금 비율</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">1. 눈동자는 렌즈 중앙에 위치</span>
                <span className="text-[11px] text-slate-600 mt-0.5 block leading-relaxed">
                  눈동자가 렌즈 중심에서 안쪽으로 2~3mm 살짝 들어오는 프레임이 가장 자연스럽고 안정적입니다.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">2. 눈썹 라인과 프레임 상단의 일치</span>
                <span className="text-[11px] text-slate-600 mt-0.5 block leading-relaxed">
                  안경테 상단 림이 눈썹 곡선과 평행을 이루면 인상이 한층 깔끔하고 신뢰감을 줍니다.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-800 block">3. 얼굴형과 반대되는 프레임 선택</span>
                <span className="text-[11px] text-slate-600 mt-0.5 block leading-relaxed">
                  둥근 얼굴엔 각진 스퀘어나 하금테를, 각진 얼굴엔 부드러운 원형이나 보스턴 프레임이 최고의 궁합입니다.
                </span>
              </div>
            </div>
          </div>

          {/* 5대 얼굴형별 궁합 가이드 카드 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900">5대 얼굴형별 스타일링 백과</h4>

            <div className="space-y-2">
              {(Object.keys(FACE_SHAPES) as FaceShapeKey[]).map((key) => {
                const item = FACE_SHAPES[key];
                return (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {item.emoji} {item.name} ({item.englishName})
                      </span>
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.stylingAdvice.hair}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-semibold">
                        추천: {item.bestGlasses.slice(0, 2).join(", ")}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedFaceKey(key);
                          setCurrentTab("fitting");
                        }}
                        className="text-[#3182F6] font-bold hover:underline"
                      >
                        피팅해보기 →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2026 트렌드 랭킹 TOP 3 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#3182F6]" />
              <h4 className="text-xs font-bold text-slate-900">2026 가장 사랑받는 헤어 & 안경 랭킹</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">💇 헤어스타일 TOP 3</span>
                <ol className="text-[11px] text-slate-600 space-y-0.5 list-decimal list-inside">
                  <li>시스루 댄디컷</li>
                  <li>레이어드 C컬펌</li>
                  <li>가일컷</li>
                </ol>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-700 block">👓 아이웨어 TOP 3</span>
                <ol className="text-[11px] text-slate-600 space-y-0.5 list-decimal list-inside">
                  <li>아넬형 뿔테</li>
                  <li>크라운판토</li>
                  <li>하금테</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 하단 고정 플로팅 액션 바 (가상 피팅룸일 때만 표시) */}
      {currentTab === "fitting" && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center gap-2">
            {/* 스타일 저장 버튼 */}
            <button
              onClick={handleSaveStyle}
              className="px-3.5 py-3 bg-slate-100 active:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="현재 조합 저장"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>스타일 저장</span>
            </button>

            {/* 친구에게 투표 받기 버튼 (메인) */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 py-3 bg-[#3182F6] active:bg-[#1b64da] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>친구에게 어울리는지 투표받기</span>
            </button>
          </div>
        </div>
      )}

      {/* 친구 공유 & 포토카드 모달 */}
      <ShareCardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        faceShape={currentFace}
        hair={currentHair}
        hairColor={currentHairColor}
        glasses={currentGlasses}
        glassesColor={currentGlassesColor}
        compatibility={compatibility}
        userPhotoUrl={userPhotoUrl}
        svgElement={svgElement}
      />

      {/* 보상형 광고 모달 (시뮬레이션) */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onReward={() => {
          setIsAdModalOpen(false);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }}
        title="전문가 심층 퍼스널 리포트 열람"
        description="광고를 1회 시청하면 미용실 & 안경원 상담용 상세 진단서를 무료로 열람할 수 있어요."
      />

      {/* 토스페이 모달 (시뮬레이션) */}
      <TossPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={() => {
          setIsPayModalOpen(false);
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        }}
        itemTitle="페이스핏 1:1 디자이너 맞춤 처방전"
        amount={990}
      />
    </div>
  );
};
