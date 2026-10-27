import React, { useRef, useState, useEffect } from "react";
import {
  FaceShapeInfo,
  HairOption,
  HairColorOption,
  GlassesOption,
  GlassesColorOption,
  LensTintOption,
  BeardOption,
  AccessoryOption,
  StylingCompatibility,
} from "./catalog";
import { GlassesSvgRenderer } from "./GlassesSvgRenderer";
import { HairSvgRenderer } from "./HairSvgRenderer";
import {
  Sparkles,
  Eye,
  Sliders,
  Camera,
  Trash2,
  Move,
  Maximize2,
  RefreshCw,
  Minimize2,
  Scissors,
  Glasses,
  Smile,
  Hand,
  Check,
  User,
} from "lucide-react";

export type TouchControlMode = "sculpt" | "glasses" | "hair" | "clean";

interface FaceCanvasViewerProps {
  faceShape: FaceShapeInfo;
  hair: HairOption;
  hairColor: HairColorOption;
  glasses: GlassesOption;
  glassesColor: GlassesColorOption;
  lensTint: LensTintOption;
  beard: BeardOption;
  accessory: AccessoryOption;
  compatibility: StylingCompatibility;
  userPhotoUrl: string | null;
  onPhotoUpload: (file: File) => void;
  onPhotoClear: () => void;
  svgRefCallback?: (svgElement: SVGSVGElement | null) => void;
  activeControlMode?: TouchControlMode;
  onControlModeChange?: (mode: TouchControlMode) => void;
}

export const FaceCanvasViewer: React.FC<FaceCanvasViewerProps> = ({
  faceShape,
  hair,
  hairColor,
  glasses,
  glassesColor,
  lensTint,
  beard,
  accessory,
  compatibility,
  userPhotoUrl,
  onPhotoUpload,
  onPhotoClear,
  svgRefCallback,
  activeControlMode,
  onControlModeChange,
}) => {
  // 모델 성별 상태: 남성형 / 여성형 (헤어 성별에 따라 스마트 기본값 제공)
  const [modelGender, setModelGender] = useState<"male" | "female">(
    hair.gender === "female" ? "female" : "male"
  );

  // 헤어 변경 시 성별이 명확한 경우 자동 동기화 (사용자가 수동 변경 가능)
  useEffect(() => {
    if (hair.gender === "female") {
      setModelGender("female");
    } else if (hair.gender === "male") {
      setModelGender("male");
    }
  }, [hair.id, hair.gender]);

  // 터치 조작 모드 (윤곽조각 / 안경직접조절 / 헤어직접조절 / 완성본)
  const [internalMode, setInternalMode] = useState<TouchControlMode>("sculpt");
  const controlMode = activeControlMode || internalMode;
  const setControlMode = (mode: TouchControlMode) => {
    setInternalMode(mode);
    if (onControlModeChange) onControlModeChange(mode);
  };

  // 실시간 윤곽 조각 모디파이어 (1.0 = 기본)
  const [cheekMod, setCheekMod] = useState(faceShape.svgModifiers.cheekCurve);
  const [jawMod, setJawMod] = useState(faceShape.svgModifiers.jawWidth);
  const [chinMod, setChinMod] = useState(faceShape.svgModifiers.chinDrop);
  const [foreheadMod, setForeheadMod] = useState(faceShape.svgModifiers.foreheadWidth);

  // 얼굴형 변경 시 베이스 수치 동기화
  useEffect(() => {
    setCheekMod(faceShape.svgModifiers.cheekCurve);
    setJawMod(faceShape.svgModifiers.jawWidth);
    setChinMod(faceShape.svgModifiers.chinDrop);
    setForeheadMod(faceShape.svgModifiers.foreheadWidth);
  }, [faceShape.id]);

  // 안경 직접 위치(X, Y) 및 크기(Scale)
  const [glassesOffsetX, setGlassesOffsetX] = useState(0);
  const [glassesOffsetY, setGlassesOffsetY] = useState(0);
  const [glassesScale, setGlassesScale] = useState(1.0);

  // 헤어 볼륨/스케일 및 높낮이(Y)
  const [hairScale, setHairScale] = useState(1.0);
  const [hairOffsetY, setHairOffsetY] = useState(0);

  // 드래그 제스처 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<
    "cheek_l" | "cheek_r" | "jaw_l" | "jaw_r" | "chin" | "glasses_move" | "glasses_scale" | "hair_move" | "hair_scale" | null
  >(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialValues, setInitialValues] = useState<any>({});

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 비포/애프터 비교 및 정밀 패널
  const [showOriginal, setShowOriginal] = useState(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [photoOpacity, setPhotoOpacity] = useState(0.85);

  // ViewBox: 400 x 480
  const cx = 200;
  const headTopY = 96;
  const chinY = 175 + 95 * chinMod; // ~270 for oval
  const cheekW = (modelGender === "female" ? 74 : 78) * cheekMod;
  const jawW = (modelGender === "female" ? 56 : 64) * jawMod;
  const foreheadW = (modelGender === "female" ? 68 : 72) * foreheadMod;

  // 인체공학적 부드러운 헤드 컨투어 패스 (황금 비율 두상)
  const facePath = `
    M ${cx - foreheadW} 145
    C ${cx - foreheadW * 1.02} ${headTopY}, ${cx + foreheadW * 1.02} ${headTopY}, ${cx + foreheadW} 145
    C ${cx + cheekW} 185, ${cx + jawW} 242, ${cx + (modelGender === "female" ? 12 : 16)} ${chinY - 5}
    Q ${cx} ${chinY}, ${cx - (modelGender === "female" ? 12 : 16)} ${chinY - 5}
    C ${cx - jawW} 242, ${cx - cheekW} 185, ${cx - foreheadW} 145
    Z
  `;

  // 터치/마우스 좌표를 SVG 뷰박스 (0~400, 0~480) 좌표로 변환
  const getSvgCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  // 드래그 시작
  const handlePointerDown = (
    e: React.PointerEvent,
    target: "cheek_l" | "cheek_r" | "jaw_l" | "jaw_r" | "chin" | "glasses_move" | "glasses_scale" | "hair_move" | "hair_scale"
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);

    const pos = getSvgCoordinates(e.clientX, e.clientY);
    setIsDragging(true);
    setDragTarget(target);
    setDragStartPos(pos);

    setInitialValues({
      cheekMod,
      jawMod,
      chinMod,
      foreheadMod,
      glassesOffsetX,
      glassesOffsetY,
      glassesScale,
      hairScale,
      hairOffsetY,
    });
  };

  // 드래그 이동 중 (실시간 조각 & 크기 조절)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragTarget) return;
    const pos = getSvgCoordinates(e.clientX, e.clientY);
    const dx = pos.x - dragStartPos.x;
    const dy = pos.y - dragStartPos.y;

    if (dragTarget === "cheek_l") {
      const nextCheek = Math.max(0.72, Math.min(1.35, initialValues.cheekMod - dx / 80));
      setCheekMod(nextCheek);
    } else if (dragTarget === "cheek_r") {
      const nextCheek = Math.max(0.72, Math.min(1.35, initialValues.cheekMod + dx / 80));
      setCheekMod(nextCheek);
    } else if (dragTarget === "jaw_l") {
      const nextJaw = Math.max(0.70, Math.min(1.35, initialValues.jawMod - dx / 70));
      setJawMod(nextJaw);
    } else if (dragTarget === "jaw_r") {
      const nextJaw = Math.max(0.70, Math.min(1.35, initialValues.jawMod + dx / 70));
      setJawMod(nextJaw);
    } else if (dragTarget === "chin") {
      const nextChin = Math.max(0.75, Math.min(1.30, initialValues.chinMod + dy / 100));
      setChinMod(nextChin);
    } else if (dragTarget === "glasses_move") {
      setGlassesOffsetX(initialValues.glassesOffsetX + dx);
      setGlassesOffsetY(initialValues.glassesOffsetY + dy);
    } else if (dragTarget === "glasses_scale") {
      const scaleDelta = (dx + dy) / 100;
      setGlassesScale(Math.max(0.75, Math.min(1.35, initialValues.glassesScale + scaleDelta)));
    } else if (dragTarget === "hair_move") {
      setHairOffsetY(initialValues.hairOffsetY + dy);
    } else if (dragTarget === "hair_scale") {
      const scaleDelta = (dx + dy) / 100;
      setHairScale(Math.max(0.80, Math.min(1.35, initialValues.hairScale + scaleDelta)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDragTarget(null);
    }
  };

  // 1초 원터치 쏙 넣기 액션
  const applyQuickTuck = (action: "v_line" | "cheek_in" | "chin_short" | "reset") => {
    if (action === "v_line") {
      setJawMod(0.82);
    } else if (action === "cheek_in") {
      setCheekMod(0.85);
    } else if (action === "chin_short") {
      setChinMod(0.90);
    } else if (action === "reset") {
      setCheekMod(faceShape.svgModifiers.cheekCurve);
      setJawMod(faceShape.svgModifiers.jawWidth);
      setChinMod(faceShape.svgModifiers.chinDrop);
      setForeheadMod(faceShape.svgModifiers.foreheadWidth);
      setGlassesOffsetX(0);
      setGlassesOffsetY(0);
      setGlassesScale(1.0);
      setHairOffsetY(0);
      setHairScale(1.0);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 flex flex-col select-none">
      {/* 1. 상단 모드 스위처 바 (4개 모드 균등 분할) */}
      <div className="w-full px-3 py-2 bg-slate-50/90 border-b border-slate-200 text-xs">
        <div className="grid grid-cols-4 gap-1 w-full bg-slate-200/80 p-0.5 rounded-xl font-bold">
          <button
            onClick={() => setControlMode("sculpt")}
            className={`flex items-center justify-center gap-1 py-1 rounded-lg transition-all ${
              controlMode === "sculpt"
                ? "bg-white text-[#3182F6] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>윤곽조각</span>
          </button>
          <button
            onClick={() => setControlMode("glasses")}
            className={`flex items-center justify-center gap-1 py-1 rounded-lg transition-all ${
              controlMode === "glasses"
                ? "bg-white text-[#3182F6] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Glasses className="w-3.5 h-3.5" />
            <span>안경조절</span>
          </button>
          <button
            onClick={() => setControlMode("hair")}
            className={`flex items-center justify-center gap-1 py-1 rounded-lg transition-all ${
              controlMode === "hair"
                ? "bg-white text-[#3182F6] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>헤어조절</span>
          </button>
          <button
            onClick={() => setControlMode("clean")}
            className={`flex items-center justify-center gap-1 py-1 rounded-lg transition-all ${
              controlMode === "clean"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>완성본</span>
          </button>
        </div>
      </div>

      {/* 2. 쏙 넣기 빠른 액션 칩 바 (윤곽조각 모드일 때 노출) */}
      {controlMode === "sculpt" && !showOriginal && (
        <div className="w-full px-3 py-1.5 bg-blue-50/70 border-b border-blue-100 flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-700">
          <span className="text-blue-700 shrink-0 font-bold flex items-center gap-0.5">
            <Hand className="w-3 h-3" /> 터치 쏙 넣기:
          </span>
          <button
            onClick={() => applyQuickTuck("v_line")}
            className="px-2 py-0.5 bg-white border border-blue-200 rounded-lg hover:border-blue-400 active:bg-blue-100 shrink-0 text-blue-900"
          >
            V라인 턱 깎기 ⚡
          </button>
          <button
            onClick={() => applyQuickTuck("cheek_in")}
            className="px-2 py-0.5 bg-white border border-blue-200 rounded-lg hover:border-blue-400 active:bg-blue-100 shrink-0 text-blue-900"
          >
            광대 쏙 넣기 💆
          </button>
          <button
            onClick={() => applyQuickTuck("chin_short")}
            className="px-2 py-0.5 bg-white border border-blue-200 rounded-lg hover:border-blue-400 active:bg-blue-100 shrink-0 text-blue-900"
          >
            턱끝 줄이기 🤏
          </button>
          <button
            onClick={() => applyQuickTuck("reset")}
            className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 shrink-0 text-slate-600"
          >
            초기화 ↺
          </button>
        </div>
      )}

      {/* 3. 메인 인터랙티브 SVG 뷰어 (직접 터치 조작 지원) */}
      <div
        className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]/80 flex items-center justify-center overflow-hidden touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 사용자 사진 모드 */}
        {userPhotoUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-opacity"
            style={{
              backgroundImage: `url(${userPhotoUrl})`,
              opacity: photoOpacity,
            }}
          />
        )}

        {/* 상단 뱃지 & 모델 성별 스위치 & 비포비교 버튼 */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-xs border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#3182F6]" />
            <span className="text-xs font-semibold text-slate-700">{faceShape.name}</span>
            <span className="text-xs font-bold text-[#3182F6]">{compatibility.score}점</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            {/* 남성 / 여성 아바타 모델 전환 */}
            <div className="flex items-center gap-0.5 bg-white/95 backdrop-blur-md border border-slate-200 p-0.5 rounded-full shadow-xs text-[11px] font-bold">
              <button
                onClick={() => setModelGender("male")}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  modelGender === "male"
                    ? "bg-[#3182F6] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                남성
              </button>
              <button
                onClick={() => setModelGender("female")}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  modelGender === "female"
                    ? "bg-rose-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                여성
              </button>
            </div>

            <button
              onMouseDown={() => setShowOriginal(true)}
              onMouseUp={() => setShowOriginal(false)}
              onTouchStart={() => setShowOriginal(true)}
              onTouchEnd={() => setShowOriginal(false)}
              className="flex items-center gap-1 px-2.5 py-1 bg-black/60 active:bg-black/80 text-white text-[11px] font-medium rounded-full backdrop-blur-md transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>비포비교</span>
            </button>
          </div>
        </div>

        {/* SVG 고품질 아바타 & 조작 레이어 */}
        <svg
          ref={(el) => {
            svgRef.current = el;
            if (svgRefCallback) svgRefCallback(el);
          }}
          viewBox="0 0 400 480"
          className="relative z-10 w-full h-full object-contain cursor-default"
        >
          <defs>
            {/* 3D 페이스 입체 피부 그라데이션 (중앙 하이라이트 & 외곽 은은한 음영) */}
            <radialGradient id="faceShadeGrad" cx="50%" cy="46%" r="54%">
              <stop offset="0%" stopColor="#fff2e8" />
              <stop offset="60%" stopColor="#fde0cc" />
              <stop offset="85%" stopColor="#f7c8ac" />
              <stop offset="100%" stopColor="#eab090" />
            </radialGradient>

            {/* 여성형 화사한 핑크빛 피부 */}
            <radialGradient id="femaleFaceGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#fff5ee" />
              <stop offset="62%" stopColor="#fee4d4" />
              <stop offset="85%" stopColor="#fac7ae" />
              <stop offset="100%" stopColor="#f1b194" />
            </radialGradient>

            {/* 귀 입체 그라데이션 */}
            <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8cbb0" />
              <stop offset="100%" stopColor="#ebb18c" />
            </linearGradient>

            {/* 틴트 선글라스 렌즈 그라데이션 */}
            <linearGradient id="lensTintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={lensTint.color} stopOpacity={lensTint.opacity} />
              <stop offset="100%" stopColor={lensTint.color} stopOpacity={Math.min(1.0, lensTint.opacity + 0.15)} />
            </linearGradient>

            {/* 렌즈 광택 반사광 */}
            <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="65%" stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.25" />
            </linearGradient>

            {/* 헤어 그라데이션 */}
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={hairColor.highlightHex} />
              <stop offset="45%" stopColor={hairColor.mainHex} />
              <stop offset="100%" stopColor={hairColor.shadowHex} />
            </linearGradient>

            {/* 입술 틴트 그라데이션 (여성: 체리 로즈 틴트) */}
            <radialGradient id="femaleLipGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="60%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#fda4af" />
            </radialGradient>

            {/* 입술 틴트 그라데이션 (남성: 자연스러운 생기 웜톤) */}
            <radialGradient id="maleLipGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.15" />
            </radialGradient>

            {/* 눈동자 리치 홍채 그라데이션 */}
            <radialGradient id="irisGrad" cx="45%" cy="38%" r="52%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="65%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>

            {/* 안구 상단 눈꺼풀 그림자 그라데이션 */}
            <linearGradient id="eyeShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 헤어 백 레이어 (뒤통수 & 어깨 뒤로 흐르는 뒷머리 볼륨 - 인체 뒤에 렌더링) */}
          {!showOriginal && (
            <g
              id="hairBackLayer"
              transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}
            >
              <HairSvgRenderer hairId={hair.id} color={hairColor} cx={cx} foreheadW={foreheadW} layer="back" />
            </g>
          )}

          {/* 목 & 쇄골 & 모던 스타일리시 의상 */}
          {!userPhotoUrl && (
            <g id="neckAndBody">
              {/* 목 기둥 */}
              <path
                d={
                  modelGender === "female"
                    ? `M 172 220 L 172 275 C 172 295, 125 325, 30 375 L 30 480 L 370 480 L 370 375 C 275 325, 228 295, 228 220 Z`
                    : `M 166 220 L 166 270 C 166 295, 120 320, 20 370 L 20 480 L 380 480 L 380 370 C 280 320, 234 295, 234 220 Z`
                }
                fill={modelGender === "female" ? "url(#femaleFaceGrad)" : "url(#faceShadeGrad)"}
              />

              {/* 턱 아래 목 그림자 (Jaw Ambient Occlusion Shadow) */}
              <ellipse
                cx={cx}
                cy={chinY + 7}
                rx={jawW * 0.68}
                ry="11"
                fill="#b47953"
                opacity="0.22"
              />

              {/* 목빗근(흉쇄유돌근) & 목 라인 음영 */}
              <path
                d={`M ${cx - 24} 242 Q ${cx - 18} 278 ${cx - 14} 302`}
                stroke="#c28b66"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.32"
              />
              <path
                d={`M ${cx + 24} 242 Q ${cx + 18} 278 ${cx + 14} 302`}
                stroke="#c28b66"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.32"
              />

              {/* 쇄골 뼈 음영 라인 (Clavicle) */}
              <g id="clavicle" opacity="0.35">
                <path
                  d={`M ${cx - 85} 324 Q ${cx - 45} 326 ${cx - 14} 312`}
                  stroke="#c28b66"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d={`M ${cx + 85} 324 Q ${cx + 45} 326 ${cx + 14} 312`}
                  stroke="#c28b66"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* 모던 프리미엄 의상 (어깨를 완벽히 감싸는 깔끔한 K-패션 스웨트셔츠 / 니트) */}
              {modelGender === "female" ? (
                // 여성형: 차분하고 세련된 슬레이트 보트넥 니트
                <g id="femaleOutfit">
                  <path
                    d={`M 25 380 C 75 340, 120 318, ${cx - 45} 308 Q ${cx} 334 ${cx + 45} 308 C 280 318, 325 340, 375 380 L 385 480 L 15 480 Z`}
                    fill="#334155"
                  />
                  {/* 니트 넥라인 립 디테일 */}
                  <path
                    d={`M ${cx - 45} 308 Q ${cx} 334 ${cx + 45} 308`}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${cx - 42} 306 Q ${cx} 332 ${cx + 42} 306`}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                </g>
              ) : (
                // 남성형: 클래식 딥네이비 크루넥 맨투맨 (어깨 완전 커버 & 탄탄한 핏)
                <g id="maleOutfit">
                  <path
                    d={`M 15 375 C 65 335, 115 315, ${cx - 42} 305 Q ${cx} 328 ${cx + 42} 305 C 285 315, 335 335, 385 375 L 390 480 L 10 480 Z`}
                    fill="#1e293b"
                  />
                  {/* 크루넥 시보리 밴드 */}
                  <path
                    d={`M ${cx - 42} 305 Q ${cx} 328 ${cx + 42} 305`}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M ${cx - 38} 303 Q ${cx} 326 ${cx + 38} 303`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  {/* 라글란 어깨 절개선 */}
                  <path
                    d={`M ${cx - 42} 308 Q ${cx - 90} 340 ${cx - 120} 420`}
                    stroke="#0f172a"
                    strokeWidth="1.4"
                    opacity="0.4"
                    fill="none"
                  />
                  <path
                    d={`M ${cx + 42} 308 Q ${cx + 90} 340 ${cx + 120} 420`}
                    stroke="#0f172a"
                    strokeWidth="1.4"
                    opacity="0.4"
                    fill="none"
                  />
                </g>
              )}
            </g>
          )}

          {/* 얼굴 윤곽 및 정밀 이목구비 */}
          {!userPhotoUrl && (
            <g id="headContour">
              {/* 귀 (Ears) - 섬세한 이륜/대이륜/이주 음영 */}
              <g id="ears">
                {/* 좌측 귀 외곽 */}
                <ellipse cx={cx - cheekW - 7} cy="196" rx="10" ry="19" fill="url(#earGrad)" stroke="#dca47e" strokeWidth="1.2" />
                <path
                  d={`M ${cx - cheekW - 7} 182 C ${cx - cheekW - 13} 188, ${cx - cheekW - 13} 203, ${cx - cheekW - 5} 208`}
                  fill="none"
                  stroke="#c28b66"
                  strokeWidth="1.4"
                  opacity="0.6"
                />
                <circle cx={cx - cheekW - 4} cy="196" r="2.2" fill="#c28b66" opacity="0.5" />

                {/* 우측 귀 외곽 */}
                <ellipse cx={cx + cheekW + 7} cy="196" rx="10" ry="19" fill="url(#earGrad)" stroke="#dca47e" strokeWidth="1.2" />
                <path
                  d={`M ${cx + cheekW + 7} 182 C ${cx + cheekW + 13} 188, ${cx + cheekW + 13} 203, ${cx + cheekW + 5} 208`}
                  fill="none"
                  stroke="#c28b66"
                  strokeWidth="1.4"
                  opacity="0.6"
                />
                <circle cx={cx + cheekW + 4} cy="196" r="2.2" fill="#c28b66" opacity="0.5" />
              </g>

              {/* 얼굴형 윤곽 (3D 래디얼 그라데이션) */}
              <path
                d={facePath}
                fill={modelGender === "female" ? "url(#femaleFaceGrad)" : "url(#faceShadeGrad)"}
                stroke="none"
              />

              {/* 하안부 턱선 및 볼 윤곽선 */}
              <path
                d={`
                  M ${cx - cheekW} 175
                  C ${cx - cheekW} 185, ${cx - jawW} 242, ${cx - (modelGender === "female" ? 12 : 16)} ${chinY - 5}
                  Q ${cx} ${chinY}, ${cx + (modelGender === "female" ? 12 : 16)} ${chinY - 5}
                  C ${cx + jawW} 242, ${cx + cheekW} 185, ${cx + cheekW} 175
                `}
                fill="none"
                stroke="#dca47e"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              {/* 은은한 볼 생기 & 치크 블러셔 (Cheek Blush) */}
              <ellipse
                cx={cx - 42}
                cy="214"
                rx={modelGender === "female" ? 17 : 13}
                ry={modelGender === "female" ? 9 : 6}
                fill={modelGender === "female" ? "#fb7185" : "#f43f5e"}
                opacity={modelGender === "female" ? 0.22 : 0.12}
              />
              <ellipse
                cx={cx + 42}
                cy="214"
                rx={modelGender === "female" ? 17 : 13}
                ry={modelGender === "female" ? 9 : 6}
                fill={modelGender === "female" ? "#fb7185" : "#f43f5e"}
                opacity={modelGender === "female" ? 0.22 : 0.12}
              />

              {/* 눈썹 (Eyebrows) */}
              <g id="eyebrows">
                {modelGender === "female" ? (
                  // 여성형: 부드러운 아치형 파우더 브로우
                  <>
                    <path
                      d={`M ${cx - 52} 173 Q ${cx - 34} 166 ${cx - 16} 174`}
                      fill="none"
                      stroke={hairColor.shadowHex}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      opacity="0.82"
                    />
                    <path
                      d={`M ${cx + 52} 173 Q ${cx + 34} 166 ${cx + 16} 174`}
                      fill="none"
                      stroke={hairColor.shadowHex}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      opacity="0.82"
                    />
                  </>
                ) : (
                  // 남성형: 샤프하고 또렷한 스트레이트 브로우
                  <>
                    <path
                      d={`M ${cx - 54} 174 Q ${cx - 36} 167 ${cx - 16} 175`}
                      fill="none"
                      stroke={hairColor.shadowHex}
                      strokeWidth="3.0"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${cx + 54} 174 Q ${cx + 36} 167 ${cx + 16} 175`}
                      fill="none"
                      stroke={hairColor.shadowHex}
                      strokeWidth="3.0"
                      strokeLinecap="round"
                    />
                  </>
                )}
              </g>

              {/* 눈 (Eyes) - 초고화질 K-뷰티 매력적인 눈망울 */}
              <g id="eyes">
                {/* 좌측 눈 (Left Eye) */}
                <g id="leftEye">
                  {/* 쌍꺼풀 라인 */}
                  <path
                    d={`M ${cx - 52} 184 Q ${cx - 36} 179 ${cx - 20} 185`}
                    fill="none"
                    stroke="#c28b66"
                    strokeWidth="1.0"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                  {/* 흰자위 */}
                  <path
                    d={`M ${cx - 54} 192 Q ${cx - 36} 182 ${cx - 18} 192 Q ${cx - 36} 201 ${cx - 54} 192 Z`}
                    fill="#ffffff"
                  />
                  {/* 안구 상단 그림자 */}
                  <path
                    d={`M ${cx - 54} 192 Q ${cx - 36} 182 ${cx - 18} 192 Q ${cx - 36} 189 ${cx - 54} 192 Z`}
                    fill="url(#eyeShadowGrad)"
                  />
                  {/* 홍채 & 동공 & 캐치라이트 */}
                  <circle cx={cx - 36} cy="191.5" r="5.8" fill="url(#irisGrad)" />
                  <circle cx={cx - 36} cy="191.5" r="2.6" fill="#000000" />
                  <circle cx={cx - 38} cy="189.5" r="1.8" fill="#ffffff" />
                  <circle cx={cx - 34} cy="193.5" r="0.9" fill="#ffffff" opacity="0.8" />
                  {/* 상단 아이라인 & 속눈썹 */}
                  <path
                    d={`M ${cx - 55} 192 C ${cx - 48} 183, ${cx - 24} 183, ${cx - 17} 192`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={modelGender === "female" ? "2.4" : "2.0"}
                    strokeLinecap="round"
                  />
                  {/* 여성형 눈꼬리 윙 */}
                  {modelGender === "female" && (
                    <path
                      d={`M ${cx - 53} 191 Q ${cx - 58} 189 ${cx - 59} 187`}
                      stroke="#0f172a"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                  {/* 애교살 음영 (자연스럽고 은은한 하이라이트 & 섀도우) */}
                  <path
                    d={`M ${cx - 50} 196 Q ${cx - 36} 200 ${cx - 22} 196`}
                    fill="none"
                    stroke="#fff5ee"
                    strokeWidth="1.2"
                    opacity="0.28"
                  />
                  <path
                    d={`M ${cx - 48} 198 Q ${cx - 36} 202 ${cx - 24} 198`}
                    fill="none"
                    stroke="#c28b66"
                    strokeWidth="0.9"
                    opacity="0.22"
                  />
                </g>

                {/* 우측 눈 (Right Eye) */}
                <g id="rightEye">
                  {/* 쌍꺼풀 라인 */}
                  <path
                    d={`M ${cx + 20} 185 Q ${cx + 36} 179 ${cx + 52} 184`}
                    fill="none"
                    stroke="#c28b66"
                    strokeWidth="1.0"
                    strokeLinecap="round"
                    opacity="0.65"
                  />
                  {/* 흰자위 */}
                  <path
                    d={`M ${cx + 18} 192 Q ${cx + 36} 182 ${cx + 54} 192 Q ${cx + 36} 201 ${cx + 18} 192 Z`}
                    fill="#ffffff"
                  />
                  {/* 안구 상단 그림자 */}
                  <path
                    d={`M ${cx + 18} 192 Q ${cx + 36} 182 ${cx + 54} 192 Q ${cx + 36} 189 ${cx + 18} 192 Z`}
                    fill="url(#eyeShadowGrad)"
                  />
                  {/* 홍채 & 동공 & 캐치라이트 */}
                  <circle cx={cx + 36} cy="191.5" r="5.8" fill="url(#irisGrad)" />
                  <circle cx={cx + 36} cy="191.5" r="2.6" fill="#000000" />
                  <circle cx={cx + 34} cy="189.5" r="1.8" fill="#ffffff" />
                  <circle cx={cx + 38} cy="193.5" r="0.9" fill="#ffffff" opacity="0.8" />
                  {/* 상단 아이라인 */}
                  <path
                    d={`M ${cx + 17} 192 C ${cx + 24} 183, ${cx + 48} 183, ${cx + 55} 192`}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={modelGender === "female" ? "2.4" : "2.0"}
                    strokeLinecap="round"
                  />
                  {/* 여성형 눈꼬리 윙 */}
                  {modelGender === "female" && (
                    <path
                      d={`M ${cx + 53} 191 Q ${cx + 58} 189 ${cx + 59} 187`}
                      stroke="#0f172a"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                  {/* 애교살 */}
                  <path
                    d={`M ${cx + 22} 196 Q ${cx + 36} 200 ${cx + 50} 196`}
                    fill="none"
                    stroke="#fff5ee"
                    strokeWidth="1.2"
                    opacity="0.28"
                  />
                  <path
                    d={`M ${cx + 24} 198 Q ${cx + 36} 202 ${cx + 48} 198`}
                    fill="none"
                    stroke="#c28b66"
                    strokeWidth="0.9"
                    opacity="0.22"
                  />
                </g>
              </g>

              {/* 코 (Nose) - 3D 콧대 음영 & 코끝 콧망울 하이라이트 */}
              <g id="nose">
                {/* 콧대 좌측 자연스러운 음영 */}
                <path
                  d={`M ${cx - 3} 188 L ${cx - 4} 214 Q ${cx - 8} 222 ${cx - 8} 225`}
                  fill="none"
                  stroke="#c28b66"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                {/* 콧망울 및 콧구멍 곡선 */}
                <path
                  d={`M ${cx - 8} 225 Q ${cx} 229 ${cx + 8} 225`}
                  fill="none"
                  stroke="#c28b66"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                {/* 콧구멍 소프트 음영 */}
                <ellipse cx={cx - 5} cy="226" rx="2.0" ry="1.2" fill="#a46d49" opacity="0.55" />
                <ellipse cx={cx + 5} cy="226" rx="2.0" ry="1.2" fill="#a46d49" opacity="0.55" />
                {/* 코끝 물광 하이라이트 */}
                <circle cx={cx} cy="222.5" r="2.4" fill="#ffffff" opacity="0.45" />
              </g>

              {/* 입술 (Lips) - 한국형 틴트 그라데이션 & 물광 볼륨 */}
              <g id="mouth">
                {/* 인중(Philtrum) 라인 */}
                <line x1={cx - 2.5} y1="232" x2={cx - 3.5} y2="240" stroke="#c28b66" strokeWidth="0.8" opacity="0.32" />
                <line x1={cx + 2.5} y1="232" x2={cx + 3.5} y2="240" stroke="#c28b66" strokeWidth="0.8" opacity="0.32" />

                {/* 윗입술 큐피트 활 (M라인) */}
                <path
                  d={`M ${cx - 20} 244 Q ${cx - 9} 240 ${cx} 242 Q ${cx + 9} 240 ${cx + 20} 244 Q ${cx} 246 ${cx - 20} 244 Z`}
                  fill={modelGender === "female" ? "url(#femaleLipGrad)" : "url(#maleLipGrad)"}
                />
                {/* 입술 중앙 분할 라인 */}
                <path
                  d={`M ${cx - 19} 245 Q ${cx} 247.5 ${cx + 19} 245`}
                  fill="none"
                  stroke="#9f1239"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  opacity="0.55"
                />
                {/* 아랫입술 볼륨 립 */}
                <path
                  d={`M ${cx - 19} 245 Q ${cx} 256 ${cx + 19} 245 Q ${cx} 247 ${cx - 19} 245 Z`}
                  fill={modelGender === "female" ? "url(#femaleLipGrad)" : "url(#maleLipGrad)"}
                />
                {/* 입꼬리 음영 */}
                <circle cx={cx - 20} cy="244" r="0.8" fill="#9f1239" opacity="0.5" />
                <circle cx={cx + 20} cy="244" r="0.8" fill="#9f1239" opacity="0.5" />
                {/* 아랫입술 은은한 물광 틴트 하이라이트 */}
                <ellipse cx={cx} cy="250.5" rx="5.5" ry="1.2" fill="#ffffff" opacity={modelGender === "female" ? 0.35 : 0.18} />
              </g>

              {/* 수염 (Beard) 렌더링 */}
              {renderBeardSvg(beard.id, cx, chinY)}
            </g>
          )}

          {/* 가상 피팅 레이어 (헤어 프론트, 안경, 모자) */}
          {!showOriginal && (
            <g id="virtualFittingLayer">
              {/* 1. 헤어 프론트 레이어 (정수리 볼륨 & 앞머리 가닥 & 옆머리 - 얼굴 앞에 렌더링) */}
              <g
                id="hairStyleFront"
                transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}
                onClick={() => setControlMode("hair")}
                className="cursor-pointer"
              >
                <HairSvgRenderer hairId={hair.id} color={hairColor} cx={cx} foreheadW={foreheadW} layer="front" />
              </g>

              {/* 2. 모자 / 악세서리 렌더링 */}
              {accessory.id !== "acc_none" && (
                <g id="accessory" transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}>
                  {renderAccessorySvg(accessory.id, cx)}
                </g>
              )}

              {/* 3. 안경 프레임 렌더링 (8대 스타일 고품질 아세테이트/메탈 렌더러 연결) */}
              <g
                id="eyewearFrame"
                transform={`translate(${cx + glassesOffsetX}, ${192 + glassesOffsetY}) scale(${glassesScale}) translate(${-cx}, -192)`}
                onClick={() => setControlMode("glasses")}
                className="cursor-pointer"
              >
                <GlassesSvgRenderer glasses={glasses} color={glassesColor} lensTint={lensTint} cx={cx} />
              </g>
            </g>
          )}

          {/* ==================================================== */}
          {/* 터치 조작 핸들 레이어 (Interactive Manipulation Handles) */}
          {/* ==================================================== */}

          {/* [모드 1: 윤곽 조각 핸들] 손으로 직접 밀어서 넣고 깎기 */}
          {controlMode === "sculpt" && !showOriginal && (
            <g id="sculptHandles" className="cursor-ew-resize">
              {/* 가이드 안내 점선 */}
              <path
                d={facePath}
                fill="none"
                stroke="#3182F6"
                strokeWidth="2.5"
                strokeDasharray="4,4"
                opacity="0.8"
              />

              {/* 좌측 광대 핸들 (밀어서 쏙 넣기) */}
              <g
                transform={`translate(${cx - cheekW}, 182)`}
                onPointerDown={(e) => handlePointerDown(e, "cheek_l")}
                className="cursor-ew-resize group"
              >
                <circle r="12" fill="#3182F6" opacity="0.2" className="animate-ping" />
                <circle r="7.5" fill="#3182F6" stroke="#ffffff" strokeWidth="2.5" />
                <text x="-12" y="-10" fill="#3182F6" fontSize="10" fontWeight="bold" textAnchor="end">
                  광대넣기
                </text>
              </g>

              {/* 우측 광대 핸들 */}
              <g
                transform={`translate(${cx + cheekW}, 182)`}
                onPointerDown={(e) => handlePointerDown(e, "cheek_r")}
                className="cursor-ew-resize group"
              >
                <circle r="12" fill="#3182F6" opacity="0.2" className="animate-ping" />
                <circle r="7.5" fill="#3182F6" stroke="#ffffff" strokeWidth="2.5" />
                <text x="12" y="-10" fill="#3182F6" fontSize="10" fontWeight="bold" textAnchor="start">
                  광대넣기
                </text>
              </g>

              {/* 좌측 턱선 핸들 (V라인 깎기) */}
              <g
                transform={`translate(${cx - jawW}, 250)`}
                onPointerDown={(e) => handlePointerDown(e, "jaw_l")}
                className="cursor-ew-resize group"
              >
                <circle r="12" fill="#10B981" opacity="0.2" className="animate-ping" />
                <circle r="7.5" fill="#10B981" stroke="#ffffff" strokeWidth="2.5" />
                <text x="-12" y="14" fill="#059669" fontSize="10" fontWeight="bold" textAnchor="end">
                  V라인깎기
                </text>
              </g>

              {/* 우측 턱선 핸들 */}
              <g
                transform={`translate(${cx + jawW}, 250)`}
                onPointerDown={(e) => handlePointerDown(e, "jaw_r")}
                className="cursor-ew-resize group"
              >
                <circle r="12" fill="#10B981" opacity="0.2" className="animate-ping" />
                <circle r="7.5" fill="#10B981" stroke="#ffffff" strokeWidth="2.5" />
                <text x="12" y="14" fill="#059669" fontSize="10" fontWeight="bold" textAnchor="start">
                  V라인깎기
                </text>
              </g>

              {/* 턱 끝 핸들 (턱 길이 줄이기/늘리기) */}
              <g
                transform={`translate(${cx}, ${chinY})`}
                onPointerDown={(e) => handlePointerDown(e, "chin")}
                className="cursor-ns-resize group"
              >
                <circle r="13" fill="#EC4899" opacity="0.2" className="animate-ping" />
                <circle r="8.0" fill="#EC4899" stroke="#ffffff" strokeWidth="2.5" />
                <text x="0" y="20" fill="#DB2777" fontSize="10" fontWeight="bold" textAnchor="middle">
                  턱끝 줄이기
                </text>
              </g>
            </g>
          )}

          {/* [모드 2: 안경 직접 조작 바운딩 박스] */}
          {controlMode === "glasses" && !showOriginal && (
            <g
              id="glassesTransformBox"
              transform={`translate(${cx + glassesOffsetX}, ${196 + glassesOffsetY}) scale(${glassesScale}) translate(${-cx}, -196)`}
            >
              {/* 테두리 가이드 박스 */}
              <rect
                x={cx - 88}
                y="166"
                width="176"
                height="62"
                rx="6"
                fill="none"
                stroke="#3182F6"
                strokeWidth="1.8"
                strokeDasharray="4,3"
                opacity="0.85"
              />

              {/* 가운데 이동 핸들 (Drag to Move) */}
              <g
                transform={`translate(${cx}, 166)`}
                onPointerDown={(e) => handlePointerDown(e, "glasses_move")}
                className="cursor-move"
              >
                <circle r="11" fill="#3182F6" stroke="#ffffff" strokeWidth="2" />
                <path d="M -4 0 L 4 0 M 0 -4 L 0 4" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
              </g>

              {/* 우측 하단 크기 조절 모서리 핸들 (Pinch to Scale) */}
              <g
                transform={`translate(${cx + 88}, 228)`}
                onPointerDown={(e) => handlePointerDown(e, "glasses_scale")}
                className="cursor-nwse-resize"
              >
                <circle r="9" fill="#3182F6" stroke="#ffffff" strokeWidth="2" />
                <path d="M -3 3 L 3 -3" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            </g>
          )}

          {/* [모드 3: 헤어 직접 조작 바운딩 박스] */}
          {controlMode === "hair" && !showOriginal && (
            <g
              id="hairTransformBox"
              transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}
            >
              <rect
                x={cx - 110}
                y="60"
                width="220"
                height="130"
                rx="8"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
                strokeDasharray="4,3"
                opacity="0.85"
              />
              <g transform={`translate(${cx}, 60)`} onPointerDown={(e) => handlePointerDown(e, "hair_move")} className="cursor-ns-resize">
                <circle r="11" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                <path d="M 0 -4 L 0 4 M -3 -1 L 0 -4 L 3 -1" stroke="#ffffff" strokeWidth="1.4" fill="none" />
              </g>
              <g transform={`translate(${cx + 110}, 60)`} onPointerDown={(e) => handlePointerDown(e, "hair_scale")} className="cursor-nwse-resize">
                <circle r="9" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                <path d="M -3 3 L 3 -3" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            </g>
          )}
        </svg>

        {showOriginal && (
          <div className="absolute top-12 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wider animate-pulse z-30">
            비포 원본 (생얼) 보는 중
          </div>
        )}
      </div>

      {/* 하단 터치 안내 배너 */}
      <div className="w-full px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
          <Hand className="w-3.5 h-3.5 text-[#3182F6]" />
          <span>
            {controlMode === "sculpt" && "동그라미 핸들을 손으로 밀면 턱·광대가 쏙 들어가요"}
            {controlMode === "glasses" && "안경을 직접 터치해 원하는 위치로 옮기고 모서리로 줄여보세요"}
            {controlMode === "hair" && "상단 핸들을 드래그해 헤어라인 높낮이와 볼륨을 조절해요"}
            {controlMode === "clean" && "핸들이 숨겨진 깔끔한 완성 스타일이에요"}
          </span>
        </div>

        <button
          onClick={() => setShowAdjustPanel(!showAdjustPanel)}
          className="text-[#3182F6] font-semibold flex items-center gap-0.5 hover:underline text-[11px]"
        >
          <Sliders className="w-3 h-3" />
          정밀수치
        </button>
      </div>

      {/* 정밀 슬라이더 패널 (토글) */}
      {showAdjustPanel && (
        <div className="w-full p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-3 z-20">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>정밀 수치 슬라이더</span>
            <button
              onClick={() => applyQuickTuck("reset")}
              className="flex items-center gap-1 text-[#3182F6] hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              전체 초기화
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1">
                볼살/턱선 너비: <span className="font-semibold text-slate-900">{Math.round(jawMod * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.70"
                max="1.35"
                step="0.02"
                value={jawMod}
                onChange={(e) => setJawMod(parseFloat(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">
                광대 돌출: <span className="font-semibold text-slate-900">{Math.round(cheekMod * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.72"
                max="1.35"
                step="0.02"
                value={cheekMod}
                onChange={(e) => setCheekMod(parseFloat(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">
                턱 끝 길이: <span className="font-semibold text-slate-900">{Math.round(chinMod * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.75"
                max="1.30"
                step="0.02"
                value={chinMod}
                onChange={(e) => setChinMod(parseFloat(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">
                안경 크기: <span className="font-semibold text-slate-900">{Math.round(glassesScale * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.02"
                value={glassesScale}
                onChange={(e) => setGlassesScale(parseFloat(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 내 실제 사진 올리기 바 */}
      <div className="w-full px-4 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onPhotoUpload(file);
            }
          }}
        />

        {!userPhotoUrl ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-[#3182F6] font-medium transition-colors"
          >
            <Camera className="w-4 h-4 text-[#3182F6]" />
            <span>내 실제 사진 위에 피팅해보기</span>
          </button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              ✓ 내 사진 적용 중
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-slate-600 hover:text-[#3182F6] font-medium"
              >
                사진 변경
              </button>
              <button
                onClick={onPhotoClear}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-medium flex items-center gap-0.5"
              >
                <Trash2 className="w-3 h-3" />
                삭제
              </button>
            </div>
          </div>
        )}

        <div className="text-[11px] text-slate-400 font-medium">
          손가락 터치 피팅
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 수염 (Beard & Mustache) SVG 렌더러
// ==========================================
function renderBeardSvg(beardId: string, cx: number, chinY: number) {
  if (beardId === "beard_none") return null;

  switch (beardId) {
    case "beard_mustache":
      return (
        <g id="beardMustache">
          {/* 클래식 콧수염 */}
          <path
            d={`M ${cx - 18} 242 Q ${cx - 9} 237 ${cx} 240 Q ${cx + 9} 237 ${cx + 18} 242 Q ${cx} 245 ${cx - 18} 242 Z`}
            fill="#27272a"
          />
        </g>
      );
    case "beard_goatee":
      return (
        <g id="beardGoatee">
          <path
            d={`M ${cx - 16} 242 Q ${cx} 239 ${cx + 16} 242 Q ${cx} 245 ${cx - 16} 242 Z`}
            fill="#27272a"
          />
          <path
            d={`M ${cx - 12} 265 Q ${cx} 263 ${cx + 12} 265 L ${cx + 8} ${chinY - 2} Q ${cx} ${chinY + 4} ${cx - 8} ${chinY - 2} Z`}
            fill="#27272a"
          />
        </g>
      );
    case "beard_short_boxed":
      return (
        <g id="beardShortBoxed" opacity="0.85">
          <path
            d={`M ${cx - 16} 242 Q ${cx} 239 ${cx + 16} 242 Q ${cx} 245 ${cx - 16} 242 Z`}
            fill="#27272a"
          />
          <path
            d={`M ${cx - 50} 240 C ${cx - 40} 265, ${cx - 20} ${chinY - 2}, ${cx} ${chinY} C ${cx + 20} ${chinY - 2}, ${cx + 40} 265, ${cx + 50} 240 L ${cx + 44} 245 C ${cx + 36} 260, ${cx + 16} ${chinY - 5}, ${cx} ${chinY - 4} C ${cx - 16} ${chinY - 5}, ${cx - 36} 260, ${cx - 44} 245 Z`}
            fill="#27272a"
          />
        </g>
      );
    case "beard_stubble":
      return (
        <g id="beardStubble" opacity="0.3">
          <ellipse cx={cx} cy="242" rx="16" ry="4" fill="#18181b" />
          <ellipse cx={cx} cy={chinY - 8} rx="24" ry="12" fill="#18181b" />
        </g>
      );
    default:
      return null;
  }
}

// ==========================================
// 모자 & 악세서리 SVG 렌더러
// ==========================================
function renderAccessorySvg(accId: string, cx: number) {
  switch (accId) {
    case "acc_ballcap":
      return (
        <g id="accBallcap">
          {/* 볼캡 돔 */}
          <path
            d={`M ${cx - 96} 145 C ${cx - 105} 45, ${cx + 105} 45, ${cx + 96} 145 C ${cx + 70} 125, ${cx - 70} 125, ${cx - 96} 145 Z`}
            fill="#1e293b"
          />
          {/* 볼캡 챙 (앞으로 뻗은 쉐이드) */}
          <path
            d={`M ${cx - 102} 145 Q ${cx} 128 ${cx + 102} 145 Q ${cx + 80} 162 ${cx} 160 Q ${cx - 80} 162 ${cx - 102} 145 Z`}
            fill="#0f172a"
          />
          <circle cx={cx} cy="50" r="3.5" fill="#334155" />
        </g>
      );
    case "acc_beanie":
      return (
        <g id="accBeanie">
          <path
            d={`M ${cx - 92} 150 C ${cx - 98} 38, ${cx + 98} 38, ${cx + 92} 150 Z`}
            fill="#3f3f46"
          />
          <rect x={cx - 95} y="132" width="190" height="22" rx="6" fill="#27272a" />
          <line x1={cx - 95} y1="143" x2={cx + 95} y2="143" stroke="#52525b" strokeWidth="1" strokeDasharray="3,3" />
        </g>
      );
    case "acc_beret":
      return (
        <g id="accBeret">
          <path
            d={`M ${cx - 110} 130 C ${cx - 100} 35, ${cx + 120} 55, ${cx + 105} 140 C ${cx + 60} 115, ${cx - 60} 115, ${cx - 110} 130 Z`}
            fill="#312e81"
          />
          <circle cx={cx + 10} cy="42" r="3" fill="#1e1b4b" />
        </g>
      );
    case "acc_headband":
      return (
        <g id="accHeadband">
          <rect x={cx - 92} y="130" width="184" height="18" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1={cx - 92} y1="139" x2={cx + 92} y2="139" stroke="#ef4444" strokeWidth="3" />
        </g>
      );
    default:
      return null;
  }
}
