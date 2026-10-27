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
  // External control mode if passed
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
  activeControlMode: externalMode,
  onControlModeChange,
}) => {
  const [internalMode, setInternalMode] = useState<TouchControlMode>("sculpt");
  const controlMode = externalMode !== undefined ? externalMode : internalMode;
  const setControlMode = (m: TouchControlMode) => {
    setInternalMode(m);
    if (onControlModeChange) onControlModeChange(m);
  };

  const [showOriginal, setShowOriginal] = useState(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [photoOpacity, setPhotoOpacity] = useState(0.9);

  // 1. 얼굴 윤곽 실시간 조각 파라미터 (손으로 직접 넣고 깎기)
  const [jawMod, setJawMod] = useState(faceShape.svgModifiers.jawWidth);
  const [cheekMod, setCheekMod] = useState(faceShape.svgModifiers.cheekCurve);
  const [chinMod, setChinMod] = useState(faceShape.svgModifiers.chinDrop);
  const [foreheadMod, setForeheadMod] = useState(faceShape.svgModifiers.foreheadWidth);

  // 얼굴형 프리셋 변경 시 동기화
  useEffect(() => {
    setJawMod(faceShape.svgModifiers.jawWidth);
    setCheekMod(faceShape.svgModifiers.cheekCurve);
    setChinMod(faceShape.svgModifiers.chinDrop);
    setForeheadMod(faceShape.svgModifiers.foreheadWidth);
  }, [faceShape]);

  // 2. 안경 위치 & 크기 직접 터치 조절 파라미터
  const [glassesScale, setGlassesScale] = useState(1.0);
  const [glassesOffsetX, setGlassesOffsetX] = useState(0);
  const [glassesOffsetY, setGlassesOffsetY] = useState(0);

  // 3. 헤어 볼륨 & 위치 직접 터치 조절 파라미터
  const [hairScale, setHairScale] = useState(1.0);
  const [hairOffsetY, setHairOffsetY] = useState(0);

  // 드래그 제스처 상태
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<
    "cheek_l" | "cheek_r" | "jaw_l" | "jaw_r" | "chin" | "forehead_l" | "forehead_r" | "glasses_move" | "glasses_scale" | "hair_move" | "hair_scale" | null
  >(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialValues, setInitialValues] = useState<any>({});

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ViewBox: 400 x 460
  const cx = 200;
  const cy = 200;

  // Head proportions computed with user's direct sculpted modifiers
  const headTopY = 75;
  const chinY = 175 + 100 * chinMod; // ~275 for oval
  const cheekW = 80 * cheekMod;
  const jawW = 66 * jawMod;
  const foreheadW = 76 * foreheadMod;

  // Sculpted head contour path
  const facePath = `
    M ${cx - foreheadW} 135
    C ${cx - foreheadW * 1.05} ${headTopY}, ${cx + foreheadW * 1.05} ${headTopY}, ${cx + foreheadW} 135
    C ${cx + cheekW} 180, ${cx + jawW} 250, ${cx + 18} ${chinY - 6}
    Q ${cx} ${chinY}, ${cx - 18} ${chinY - 6}
    C ${cx - jawW} 250, ${cx - cheekW} 180, ${cx - foreheadW} 135
    Z
  `;

  // 터치/마우스 좌표를 SVG 뷰박스 (0~400, 0~460) 좌표로 변환
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
    target: "cheek_l" | "cheek_r" | "jaw_l" | "jaw_r" | "chin" | "forehead_l" | "forehead_r" | "glasses_move" | "glasses_scale" | "hair_move" | "hair_scale"
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
      // 좌측 광대 드래그: 오른쪽으로 밀면 광대 쏙 넣기(-), 왼쪽으로 당기면 광대 키우기(+)
      const deltaMod = -dx / 70;
      setCheekMod(Math.min(1.4, Math.max(0.75, initialValues.cheekMod + deltaMod)));
    } else if (dragTarget === "cheek_r") {
      // 우측 광대 드래그: 왼쪽으로 밀면 광대 쏙 넣기(-), 오른쪽으로 당기면 광대 키우기(+)
      const deltaMod = dx / 70;
      setCheekMod(Math.min(1.4, Math.max(0.75, initialValues.cheekMod + deltaMod)));
    } else if (dragTarget === "jaw_l") {
      // 좌측 턱선 드래그: 오른쪽으로 밀면 V라인 턱 깎기(-), 왼쪽으로 당기면 사각턱(+)
      const deltaMod = -dx / 60;
      setJawMod(Math.min(1.4, Math.max(0.72, initialValues.jawMod + deltaMod)));
    } else if (dragTarget === "jaw_r") {
      // 우측 턱선 드래그: 왼쪽으로 밀면 V라인 턱 깎기(-), 오른쪽으로 당기면 사각턱(+)
      const deltaMod = dx / 60;
      setJawMod(Math.min(1.4, Math.max(0.72, initialValues.jawMod + deltaMod)));
    } else if (dragTarget === "chin") {
      // 턱끝 드래그: 위로 올리면 턱끝 줄이기(-), 아래로 내리면 턱끝 늘리기(+)
      const deltaMod = dy / 80;
      setChinMod(Math.min(1.35, Math.max(0.75, initialValues.chinMod + deltaMod)));
    } else if (dragTarget === "forehead_l" || dragTarget === "forehead_r") {
      const sign = dragTarget === "forehead_r" ? 1 : -1;
      const deltaMod = (dx * sign) / 70;
      setForeheadMod(Math.min(1.3, Math.max(0.78, initialValues.foreheadMod + deltaMod)));
    } else if (dragTarget === "glasses_move") {
      setGlassesOffsetX(initialValues.glassesOffsetX + dx);
      setGlassesOffsetY(initialValues.glassesOffsetY + dy);
    } else if (dragTarget === "glasses_scale") {
      const scaleDelta = (dx + dy) / 100;
      setGlassesScale(Math.min(1.35, Math.max(0.7, initialValues.glassesScale + scaleDelta)));
    } else if (dragTarget === "hair_move") {
      setHairOffsetY(initialValues.hairOffsetY + dy);
    } else if (dragTarget === "hair_scale") {
      const scaleDelta = (dx - dy) / 100;
      setHairScale(Math.min(1.3, Math.max(0.8, initialValues.hairScale + scaleDelta)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
      setDragTarget(null);
    }
  };

  // 원터치 퀵 조각 프리셋 (성형 깎기)
  const applyQuickTuck = (type: "v_line" | "cheek_in" | "chin_short" | "reset") => {
    if (type === "v_line") {
      setJawMod((prev) => Math.max(0.72, prev - 0.1));
    } else if (type === "cheek_in") {
      setCheekMod((prev) => Math.max(0.75, prev - 0.1));
    } else if (type === "chin_short") {
      setChinMod((prev) => Math.max(0.75, prev - 0.1));
    } else if (type === "reset") {
      setJawMod(faceShape.svgModifiers.jawWidth);
      setCheekMod(faceShape.svgModifiers.cheekCurve);
      setChinMod(faceShape.svgModifiers.chinDrop);
      setForeheadMod(faceShape.svgModifiers.foreheadWidth);
      setGlassesScale(1.0);
      setGlassesOffsetX(0);
      setGlassesOffsetY(0);
      setHairScale(1.0);
      setHairOffsetY(0);
    }
  };

  return (
    <div className="relative w-full max-w-[420px] mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col items-center select-none">
      {/* 1. 상단 터치 조작 모드 탭 (얼굴 윤곽 조각 / 안경 직접 조절 / 헤어 직접 조절 / 깔끔 보기) */}
      <div className="w-full bg-slate-100 p-1.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
        <button
          onClick={() => setControlMode("sculpt")}
          className={`flex-1 py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
            controlMode === "sculpt" ? "bg-white text-[#3182F6] shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
          title="얼굴 윤곽을 직접 손으로 깎고 넣기"
        >
          <Smile className="w-3.5 h-3.5" />
          <span>윤곽조각</span>
        </button>

        <button
          onClick={() => setControlMode("glasses")}
          className={`flex-1 py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
            controlMode === "glasses" ? "bg-white text-[#3182F6] shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
          title="안경을 손으로 직접 줄이고 늘리고 이동"
        >
          <Glasses className="w-3.5 h-3.5" />
          <span>안경조절</span>
        </button>

        <button
          onClick={() => setControlMode("hair")}
          className={`flex-1 py-1.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
            controlMode === "hair" ? "bg-white text-[#3182F6] shadow-xs" : "text-slate-600 hover:text-slate-900"
          }`}
          title="헤어 볼륨과 높낮이 직접 조절"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>헤어조절</span>
        </button>

        <button
          onClick={() => setControlMode("clean")}
          className={`py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-all ${
            controlMode === "clean" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
          }`}
          title="핸들을 숨기고 완성된 스타일 확인"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>완성본</span>
        </button>
      </div>

      {/* 2. 원터치 퀵 조각 툴바 (윤곽조각 모드일 때 노출) */}
      {controlMode === "sculpt" && (
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
        className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200/90 flex items-center justify-center overflow-hidden touch-none"
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

        {/* 상단 뱃지 & 비포비교 버튼 */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full shadow-xs border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#3182F6]" />
            <span className="text-xs font-semibold text-slate-700">{faceShape.name}</span>
            <span className="text-xs font-bold text-[#3182F6]">{compatibility.score}점</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
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

        {/* SVG 아바타 & 조작 레이어 */}
        <svg
          ref={(el) => {
            svgRef.current = el;
            if (svgRefCallback) svgRefCallback(el);
          }}
          viewBox="0 0 400 460"
          className="relative z-10 w-full h-full object-contain cursor-default"
        >
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fee2cc" />
              <stop offset="65%" stopColor="#fad0b2" />
              <stop offset="100%" stopColor="#f3be9b" />
            </linearGradient>

            <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f7c5a4" />
              <stop offset="100%" stopColor="#ebb18c" />
            </linearGradient>

            {/* 틴트 선글라스 렌즈 그라데이션 */}
            <linearGradient id="lensTintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={lensTint.color} stopOpacity={lensTint.opacity} />
              <stop offset="100%" stopColor={lensTint.color} stopOpacity={Math.min(1.0, lensTint.opacity + 0.15)} />
            </linearGradient>

            <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={hairColor.highlightHex} />
              <stop offset="50%" stopColor={hairColor.mainHex} />
              <stop offset="100%" stopColor={hairColor.shadowHex} />
            </linearGradient>

            <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f48fb1" />
              <stop offset="100%" stopColor="#e91e63" />
            </linearGradient>
          </defs>

          {/* 목 & 어깨 */}
          {!userPhotoUrl && (
            <g id="neckAndBody">
              <path
                d="M 160 220 L 160 275 C 160 290 120 310 50 335 L 50 460 L 350 460 L 350 335 C 280 310 240 290 240 220 Z"
                fill="url(#skinGrad)"
                stroke="#dca47e"
                strokeWidth="1.2"
              />
              <ellipse cx="200" cy="272" rx="26" ry="6" fill="#dca47e" opacity="0.3" />

              <path
                d="M 125 315 Q 200 345 275 315 L 350 460 L 50 460 Z"
                fill="#1e293b"
              />
              <path
                d="M 125 315 Q 200 345 275 315"
                fill="none"
                stroke="#334155"
                strokeWidth="5"
              />
            </g>
          )}

          {/* 얼굴 윤곽 및 이목구비 */}
          {!userPhotoUrl && (
            <g id="headContour">
              <ellipse cx={cx - cheekW - 7} cy="198" rx="10" ry="18" fill="url(#earGrad)" stroke="#dca47e" strokeWidth="1.2" />
              <ellipse cx={cx - cheekW - 6} cy="198" rx="4.5" ry="9" fill="#dca47e" opacity="0.35" />

              <ellipse cx={cx + cheekW + 7} cy="198" rx="10" ry="18" fill="url(#earGrad)" stroke="#dca47e" strokeWidth="1.2" />
              <ellipse cx={cx + cheekW + 6} cy="198" rx="4.5" ry="9" fill="#dca47e" opacity="0.35" />

              {/* 얼굴형 윤곽선 */}
              <path
                d={facePath}
                fill="url(#skinGrad)"
                stroke="#dca47e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />

              {/* 볼 생기 */}
              <ellipse cx={cx - 42} cy="216" rx="15" ry="7" fill="#f43f5e" opacity="0.09" />
              <ellipse cx={cx + 42} cy="216" rx="15" ry="7" fill="#f43f5e" opacity="0.09" />

              {/* 눈썹 */}
              <path
                d={`M ${cx - 58} 175 Q ${cx - 38} 168 ${cx - 18} 176`}
                fill="none"
                stroke={hairColor.shadowHex}
                strokeWidth="3.0"
                strokeLinecap="round"
              />
              <path
                d={`M ${cx + 58} 175 Q ${cx + 38} 168 ${cx + 18} 176`}
                fill="none"
                stroke={hairColor.shadowHex}
                strokeWidth="3.0"
                strokeLinecap="round"
              />

              {/* 눈 */}
              <g id="eyes">
                <path d={`M ${cx - 56} 196 Q ${cx - 38} 187 ${cx - 20} 196`} fill="#ffffff" stroke="#1f2937" strokeWidth="1.8" />
                <path d={`M ${cx - 56} 196 Q ${cx - 38} 205 ${cx - 20} 196`} fill="#ffffff" stroke="#1f2937" strokeWidth="1.2" />
                <circle cx={cx - 38} cy="196" r="5.5" fill="#18181b" />
                <circle cx={cx - 40} cy="194" r="1.8" fill="#ffffff" />

                <path d={`M ${cx + 20} 196 Q ${cx + 38} 187 ${cx + 56} 196`} fill="#ffffff" stroke="#1f2937" strokeWidth="1.8" />
                <path d={`M ${cx + 20} 196 Q ${cx + 38} 205 ${cx + 56} 196`} fill="#ffffff" stroke="#1f2937" strokeWidth="1.2" />
                <circle cx={cx + 38} cy="196" r="5.5" fill="#18181b" />
                <circle cx={cx + 36} cy="194" r="1.8" fill="#ffffff" />
              </g>

              {/* 코 */}
              <path
                d={`M ${cx} 192 L ${cx} 224 Q ${cx + 5} 230 ${cx} 232 Q ${cx - 6} 232 ${cx - 8} 228`}
                fill="none"
                stroke="#dca47e"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={cx - 5} cy="229" r="1.1" fill="#c28b66" />
              <circle cx={cx + 5} cy="229" r="1.1" fill="#c28b66" />

              {/* 입술 */}
              <g id="mouth">
                <path
                  d={`M ${cx - 20} 248 Q ${cx - 9} 244 ${cx} 246 Q ${cx + 9} 244 ${cx + 20} 248 Q ${cx} 251 ${cx - 20} 248 Z`}
                  fill="url(#lipGrad)"
                  opacity="0.85"
                />
                <path
                  d={`M ${cx - 20} 248 Q ${cx} 260 ${cx + 20} 248 Q ${cx} 252 ${cx - 20} 248 Z`}
                  fill="url(#lipGrad)"
                  opacity="0.95"
                />
              </g>

              {/* 수염 (Beard) 렌더링 */}
              {renderBeardSvg(beard.id, cx, chinY)}
            </g>
          )}

          {/* 가상 피팅 레이어 (헤어, 안경, 모자) */}
          {!showOriginal && (
            <g id="virtualFittingLayer">
              {/* 1. 헤어스타일 렌더링 */}
              <g
                id="hairStyle"
                transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}
                onClick={() => setControlMode("hair")}
                className="cursor-pointer"
              >
                {renderCleanHairSvg(hair.id, hairColor, cx, foreheadW)}
              </g>

              {/* 2. 모자 / 악세서리 렌더링 */}
              {accessory.id !== "acc_none" && (
                <g id="accessory" transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}>
                  {renderAccessorySvg(accessory.id, cx)}
                </g>
              )}

              {/* 3. 안경 프레임 렌더링 */}
              <g
                id="eyewearFrame"
                transform={`translate(${cx + glassesOffsetX}, ${196 + glassesOffsetY}) scale(${glassesScale}) translate(${-cx}, -196)`}
                onClick={() => setControlMode("glasses")}
                className="cursor-pointer"
              >
                {renderCleanGlassesSvg(glasses, glassesColor, lensTint, cx)}
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
                transform={`translate(${cx - cheekW}, 180)`}
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
                transform={`translate(${cx + cheekW}, 180)`}
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

              {/* 턱 끝 길이 핸들 (위아래 줄이기/늘리기) */}
              <g
                transform={`translate(${cx}, ${chinY})`}
                onPointerDown={(e) => handlePointerDown(e, "chin")}
                className="cursor-ns-resize group"
              >
                <circle r="12" fill="#F43F5E" opacity="0.2" className="animate-ping" />
                <circle r="8" fill="#F43F5E" stroke="#ffffff" strokeWidth="2.5" />
                <text x="0" y="20" fill="#E11D48" fontSize="10" fontWeight="bold" textAnchor="middle">
                  턱끝 줄이기
                </text>
              </g>
            </g>
          )}

          {/* [모드 2: 안경 직접 조절 핸들] 손으로 직접 끌어다 놓고 코너를 잡아 늘리고 줄이기 */}
          {controlMode === "glasses" && !showOriginal && (
            <g id="glassesTransformBox">
              <g transform={`translate(${cx + glassesOffsetX}, ${196 + glassesOffsetY}) scale(${glassesScale}) translate(${-cx}, -196)`}>
                {/* 안경 둘레 바운딩 박스 */}
                <rect
                  x={cx - 75}
                  y={174}
                  width="150"
                  height="46"
                  rx="6"
                  fill="rgba(49, 130, 246, 0.08)"
                  stroke="#3182F6"
                  strokeWidth="1.8"
                  strokeDasharray="4,3"
                />

                {/* 중앙 이동 핸들 */}
                <g
                  transform={`translate(${cx}, 196)`}
                  onPointerDown={(e) => handlePointerDown(e, "glasses_move")}
                  className="cursor-move"
                >
                  <circle r="10" fill="#3182F6" stroke="#ffffff" strokeWidth="2" />
                  <path d="M -4 0 L 4 0 M 0 -4 L 0 4" stroke="#ffffff" strokeWidth="1.8" />
                </g>

                {/* 우하단 크기 조절 코너 핸들 (직접 손으로 줄이고 늘리기) */}
                <g
                  transform={`translate(${cx + 75}, 220)`}
                  onPointerDown={(e) => handlePointerDown(e, "glasses_scale")}
                  className="cursor-nwse-resize"
                >
                  <circle r="8" fill="#3182F6" stroke="#ffffff" strokeWidth="2" />
                  <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" stroke="#ffffff" strokeWidth="1.2" />
                </g>
              </g>
            </g>
          )}

          {/* [모드 3: 헤어 직접 조절 핸들] */}
          {controlMode === "hair" && !showOriginal && (
            <g id="hairTransformBox">
              <g transform={`translate(${cx}, ${120 + hairOffsetY}) scale(${hairScale}) translate(${-cx}, -120)`}>
                <rect
                  x={cx - 110}
                  y={55}
                  width="220"
                  height="165"
                  rx="10"
                  fill="rgba(16, 185, 129, 0.06)"
                  stroke="#10B981"
                  strokeWidth="1.8"
                  strokeDasharray="4,3"
                />

                {/* 상하 위치 조절 핸들 */}
                <g
                  transform={`translate(${cx}, 60)`}
                  onPointerDown={(e) => handlePointerDown(e, "hair_move")}
                  className="cursor-ns-resize"
                >
                  <circle r="9" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                  <path d="M 0 -4 L 0 4 M -3 -1 L 0 -4 L 3 -1" stroke="#ffffff" strokeWidth="1.4" fill="none" />
                </g>

                {/* 헤어 볼륨 코너 핸들 */}
                <g
                  transform={`translate(${cx + 110}, 60)`}
                  onPointerDown={(e) => handlePointerDown(e, "hair_scale")}
                  className="cursor-nwse-resize"
                >
                  <circle r="8" fill="#10B981" stroke="#ffffff" strokeWidth="2" />
                  <path d="M -3 3 L 3 -3" stroke="#ffffff" strokeWidth="1.5" />
                </g>
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
                min="0.72"
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
                min="0.75"
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
                max="1.3"
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
                max="1.3"
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
          {/* 콧수염 */}
          <path
            d={`M ${cx - 16} 242 Q ${cx} 239 ${cx + 16} 242 Q ${cx} 245 ${cx - 16} 242 Z`}
            fill="#27272a"
          />
          {/* 턱 끝 고티 수염 */}
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
          {/* 턱선 따라 연결된 단정한 수염 */}
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
          {/* 볼캡 스티치 & 버튼 */}
          <circle cx={cx} cy="50" r="3.5" fill="#334155" />
        </g>
      );
    case "acc_beanie":
      return (
        <g id="accBeanie">
          {/* 니트 비니 돔 */}
          <path
            d={`M ${cx - 92} 150 C ${cx - 98} 38, ${cx + 98} 38, ${cx + 92} 150 Z`}
            fill="#3f3f46"
          />
          {/* 비니 접힌 밑단 */}
          <rect x={cx - 95} y="132" width="190" height="22" rx="6" fill="#27272a" />
          <line x1={cx - 95} y1="143" x2={cx + 95} y2="143" stroke="#52525b" strokeWidth="1" strokeDasharray="3,3" />
        </g>
      );
    case "acc_beret":
      return (
        <g id="accBeret">
          {/* 프렌치 베레모 (사선으로 얹음) */}
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
          {/* 스포티 헤어밴드 */}
          <rect x={cx - 92} y="130" width="184" height="18" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1={cx - 92} y1="139" x2={cx + 92} y2="139" stroke="#ef4444" strokeWidth="3" />
        </g>
      );
    default:
      return null;
  }
}

// ==========================================
// 고품질 헤어스타일 SVG 렌더러
// ==========================================
function renderCleanHairSvg(hairId: string, color: HairColorOption, cx: number, foreheadW: number) {
  const hairFill = "url(#hairGrad)";

  switch (hairId) {
    case "hair_seethrough_dandy":
      return (
        <g id="hairSeethroughDandy">
          <path
            d={`M ${cx - 94} 150 C ${cx - 104} 65, ${cx + 104} 65, ${cx + 94} 150 C ${cx + 92} 190, ${cx + 82} 220, ${cx + 76} 225 L ${cx + 70} 185 C ${cx + 65} 160, ${cx + 45} 145, ${cx} 145 C ${cx - 45} 145, ${cx - 65} 160, ${cx - 70} 185 L ${cx - 76} 225 C ${cx - 82} 220, ${cx - 92} 190, ${cx - 94} 150 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 78} 140 C ${cx - 60} 165, ${cx - 48} 175, ${cx - 38} 176 Q ${cx - 26} 170, ${cx - 14} 177 Q ${cx} 170, ${cx + 14} 177 Q ${cx + 26} 170, ${cx + 38} 176 C ${cx + 50} 172, ${cx + 65} 160, ${cx + 78} 140 C ${cx + 40} 146, ${cx - 40} 146, ${cx - 78} 140 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 45} 95 Q ${cx} 84 ${cx + 45} 95`}
            stroke={color.highlightHex}
            strokeWidth="3.2"
            fill="none"
            opacity="0.5"
            strokeLinecap="round"
          />
        </g>
      );

    case "hair_guile":
      return (
        <g id="hairGuile">
          <path
            d={`M ${cx - 95} 155 C ${cx - 105} 65, ${cx + 105} 65, ${cx + 95} 155 C ${cx + 95} 220, ${cx + 82} 245, ${cx + 78} 248 L ${cx + 72} 205 C ${cx + 70} 175, ${cx + 40} 155, ${cx} 155 C ${cx - 40} 155, ${cx - 70} 175, ${cx - 72} 205 L ${cx - 78} 248 C ${cx - 82} 245, ${cx - 95} 220, ${cx - 95} 155 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 80} 150 C ${cx - 60} 140, ${cx - 30} 155, ${cx - 15} 175 C ${cx - 30} 160, ${cx - 60} 158, ${cx - 78} 170 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 15} 175 C ${cx + 10} 160, ${cx + 50} 165, ${cx + 62} 185 C ${cx + 45} 175, ${cx + 20} 172, ${cx - 10} 175 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_as_perm":
      return (
        <g id="hairAsPerm">
          <path
            d={`M ${cx - 98} 160 C ${cx - 108} 62, ${cx + 108} 62, ${cx + 98} 160 C ${cx + 95} 220, ${cx + 80} 250, ${cx + 74} 248 L ${cx + 70} 205 C ${cx + 65} 170, ${cx + 35} 155, ${cx} 155 C ${cx - 35} 155, ${cx - 65} 170, ${cx - 70} 205 L ${cx - 74} 248 C ${cx - 80} 250, ${cx - 95} 220, ${cx - 98} 160 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 8} 152 C ${cx - 20} 175, ${cx - 45} 178, ${cx - 60} 185 C ${cx - 48} 168, ${cx - 28} 160, ${cx - 8} 152 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx + 8} 152 C ${cx + 20} 175, ${cx + 45} 178, ${cx + 60} 185 C ${cx + 48} 168, ${cx + 28} 160, ${cx + 8} 152 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_leaf":
      return (
        <g id="hairLeaf">
          <path
            d={`M ${cx - 105} 155 C ${cx - 115} 60, ${cx + 115} 60, ${cx + 105} 155 C ${cx + 108} 225, ${cx + 92} 280, ${cx + 68} 305 C ${cx + 82} 260, ${cx + 88} 210, ${cx + 78} 170 C ${cx - 78} 170, ${cx - 88} 210, ${cx - 82} 260 C ${cx - 68} 305, ${cx - 92} 280, ${cx - 105} 155 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx - 45} 170, ${cx - 75} 185, ${cx - 85} 205 C ${cx - 70} 175, ${cx - 35} 158, ${cx} 145 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx + 45} 170, ${cx + 75} 185, ${cx + 85} 205 C ${cx + 70} 175, ${cx + 35} 158, ${cx} 145 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_ivy_league":
      return (
        <g id="hairIvyLeague">
          <path
            d={`M ${cx - 85} 155 C ${cx - 90} 80, ${cx + 90} 80, ${cx + 85} 155 C ${cx + 82} 195, ${cx + 75} 225, ${cx + 70} 225 L ${cx + 66} 190 C ${cx + 60} 160, ${cx + 30} 150, ${cx} 148 C ${cx - 30} 150, ${cx - 60} 160, ${cx - 66} 190 L ${cx - 70} 225 C ${cx - 75} 225, ${cx - 82} 195, ${cx - 85} 155 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 35} 155 C ${cx - 20} 135, ${cx + 20} 135, ${cx + 35} 155 L ${cx + 20} 165 L ${cx - 20} 165 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_layered_c_curl":
    case "hair_sidebang_wave":
      return (
        <g id="hairLongWave">
          <path
            d={`M ${cx - 110} 150 C ${cx - 120} 58, ${cx + 120} 58, ${cx + 110} 150 C ${cx + 125} 260, ${cx + 120} 370, ${cx + 90} 430 C ${cx + 105} 340, ${cx + 95} 240, ${cx + 82} 180 C ${cx - 82} 180, ${cx - 95} 240, ${cx - 105} 340 C ${cx - 120} 370, ${cx - 125} 260, ${cx - 110} 150 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx - 45} 170, ${cx - 80} 210, ${cx - 65} 260 C ${cx - 58} 220, ${cx - 38} 180, ${cx} 155 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx + 45} 170, ${cx + 80} 210, ${cx + 65} 260 C ${cx + 58} 220, ${cx + 38} 180, ${cx} 155 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_tassel_bob":
      return (
        <g id="hairTasselBob">
          <path
            d={`M ${cx - 102} 150 C ${cx - 110} 65, ${cx + 110} 65, ${cx + 102} 150 L ${cx + 98} 290 L ${cx + 74} 290 L ${cx + 80} 180 C ${cx - 80} 180, ${cx - 74} 290, ${cx - 74} 290 L ${cx - 98} 290 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 60} 150 C ${cx - 40} 180, ${cx + 40} 180, ${cx + 60} 150 Z`}
            fill={hairFill}
          />
        </g>
      );

    default:
      return (
        <g id="hairDefault">
          <path
            d={`M ${cx - 96} 160 C ${cx - 105} 65, ${cx + 105} 65, ${cx + 96} 160 C ${cx + 95} 220, ${cx + 82} 245, ${cx + 78} 250 L ${cx + 72} 210 C ${cx + 70} 180, ${cx + 50} 160, ${cx} 160 C ${cx - 50} 160, ${cx - 70} 180, ${cx - 72} 210 L ${cx - 78} 250 C ${cx - 82} 245, ${cx - 95} 220, ${cx - 96} 160 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx - 75} 150 C ${cx - 40} 180, ${cx + 40} 180, ${cx + 75} 150 Z`}
            fill={hairFill}
          />
        </g>
      );
  }
}

// ==========================================
// 고품질 안경 SVG 렌더러 (틴트 렌즈 & 도수렌즈 완벽 반영)
// ==========================================
function renderCleanGlassesSvg(
  glasses: GlassesOption,
  color: GlassesColorOption,
  lensTint: LensTintOption,
  cx: number
) {
  const cy = 196;
  const frameColor = color.frameColor;
  const templeColor = color.templeColor;
  const opacity = color.opacity;

  const leftLensX = cx - 38;
  const rightLensX = cx + 38;
  const lensFill = "url(#lensTintGrad)";

  switch (glasses.shapeStyle) {
    case "arnel":
      return (
        <g id="glassesArnel" opacity={opacity}>
          {/* 키홀 브릿지 */}
          <path
            d={`M ${leftLensX + 22} ${cy - 7} Q ${cx} ${cy - 10} ${rightLensX - 22} ${cy - 7} L ${rightLensX - 22} ${cy + 5} Q ${cx} ${cy - 1} ${leftLensX + 22} ${cy + 5} Z`}
            fill={frameColor}
          />
          {/* 좌측 렌즈 & 림 */}
          <rect
            x={leftLensX - 26}
            y={cy - 19}
            width="48"
            height="38"
            rx="10"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="5.5"
          />
          <rect
            x={leftLensX - 24}
            y={cy - 17}
            width="44"
            height="34"
            rx="8"
            fill="url(#lensReflect)"
          />

          {/* 우측 렌즈 & 림 */}
          <rect
            x={rightLensX - 22}
            y={cy - 19}
            width="48"
            height="38"
            rx="10"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="5.5"
          />
          <rect
            x={rightLensX - 20}
            y={cy - 17}
            width="44"
            height="34"
            rx="8"
            fill="url(#lensReflect)"
          />

          {/* 다이아몬드 리벳 */}
          <circle cx={leftLensX - 22} cy={cy - 12} r="1.3" fill="#e2e8f0" />
          <circle cx={rightLensX + 22} cy={cy - 12} r="1.3" fill="#e2e8f0" />

          {/* 템플 */}
          <line x1={leftLensX - 26} y1={cy - 12} x2={leftLensX - 48} y2={cy - 9} stroke={templeColor} strokeWidth="4" strokeLinecap="round" />
          <line x1={rightLensX + 26} y1={cy - 12} x2={rightLensX + 48} y2={cy - 9} stroke={templeColor} strokeWidth="4" strokeLinecap="round" />
        </g>
      );

    case "crown_panto":
      return (
        <g id="glassesCrownPanto" opacity={opacity}>
          <path d={`M ${cx - 12} ${cy - 5} Q ${cx} ${cy - 8} ${cx + 12} ${cy - 5}`} stroke={frameColor} strokeWidth="4" fill="none" />

          <path
            d={`M ${leftLensX - 23} ${cy - 8} L ${leftLensX - 11} ${cy - 18} L ${leftLensX + 11} ${cy - 18} L ${leftLensX + 21} ${cy - 8} C ${leftLensX + 21} ${cy + 16}, ${leftLensX - 23} ${cy + 16}, ${leftLensX - 23} ${cy - 8} Z`}
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path
            d={`M ${rightLensX - 21} ${cy - 8} L ${rightLensX - 11} ${cy - 18} L ${rightLensX + 11} ${cy - 18} L ${rightLensX + 23} ${cy - 8} C ${rightLensX + 23} ${cy + 16}, ${rightLensX - 21} ${cy + 16}, ${rightLensX - 21} ${cy - 8} Z`}
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          <line x1={leftLensX - 23} y1={cy - 8} x2={leftLensX - 46} y2={cy - 5} stroke={templeColor} strokeWidth="3" />
          <line x1={rightLensX + 23} y1={cy - 8} x2={rightLensX + 46} y2={cy - 5} stroke={templeColor} strokeWidth="3" />
        </g>
      );

    case "browline":
      return (
        <g id="glassesBrowline" opacity={opacity}>
          <path d={`M ${cx - 13} ${cy - 2} Q ${cx} ${cy - 7} ${cx + 13} ${cy - 2}`} stroke="#cbd5e1" strokeWidth="2.5" fill="none" />

          <path
            d={`M ${leftLensX - 28} ${cy - 5} Q ${leftLensX} ${cy - 20} ${leftLensX + 22} ${cy - 7} L ${leftLensX + 19} ${cy - 1} Q ${leftLensX} ${cy - 13} ${leftLensX - 25} ${cy - 1} Z`}
            fill={frameColor}
          />
          <path
            d={`M ${rightLensX - 22} ${cy - 7} Q ${rightLensX} ${cy - 20} ${rightLensX + 28} ${cy - 5} L ${rightLensX + 25} ${cy - 1} Q ${rightLensX} ${cy - 13} ${rightLensX - 19} ${cy - 1} Z`}
            fill={frameColor}
          />

          <path
            d={`M ${leftLensX - 25} ${cy - 2} C ${leftLensX - 25} ${cy + 18}, ${leftLensX + 19} ${cy + 18}, ${leftLensX + 19} ${cy - 2}`}
            stroke="#94a3b8"
            strokeWidth="2.2"
            fill={lensFill}
          />
          <path
            d={`M ${rightLensX - 19} ${cy - 2} C ${rightLensX - 19} ${cy + 18}, ${rightLensX + 25} ${cy + 18}, ${rightLensX + 25} ${cy - 2}`}
            stroke="#94a3b8"
            strokeWidth="2.2"
            fill={lensFill}
          />

          <line x1={leftLensX - 28} y1={cy - 5} x2={leftLensX - 48} y2={cy - 3} stroke={templeColor} strokeWidth="3" />
          <line x1={rightLensX + 28} y1={cy - 5} x2={rightLensX + 48} y2={cy - 3} stroke={templeColor} strokeWidth="3" />
        </g>
      );

    case "round_metal":
      return (
        <g id="glassesRoundMetal" opacity={opacity}>
          <path d={`M ${cx - 13} ${cy - 3} Q ${cx} ${cy - 10} ${cx + 13} ${cy - 3}`} stroke={frameColor} strokeWidth="2.0" fill="none" />

          <circle cx={leftLensX} cy={cy} r="21" fill={lensFill} stroke={frameColor} strokeWidth="2.0" />
          <circle cx={rightLensX} cy={cy} r="21" fill={lensFill} stroke={frameColor} strokeWidth="2.0" />

          <circle cx={leftLensX} cy={cy} r="20" fill="url(#lensReflect)" />
          <circle cx={rightLensX} cy={cy} r="20" fill="url(#lensReflect)" />

          <line x1={leftLensX - 21} y1={cy} x2={leftLensX - 46} y2={cy + 2} stroke={templeColor} strokeWidth="1.8" />
          <line x1={rightLensX + 21} y1={cy} x2={rightLensX + 46} y2={cy + 2} stroke={templeColor} strokeWidth="1.8" />
        </g>
      );

    case "square_metal":
      return (
        <g id="glassesSquareMetal" opacity={opacity}>
          <line x1={cx - 12} y1={cy - 5} x2={cx + 12} y2={cy - 5} stroke={frameColor} strokeWidth="2.2" />

          <rect
            x={leftLensX - 24}
            y={cy - 15}
            width="45"
            height="30"
            rx="4"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.2"
          />
          <rect
            x={rightLensX - 21}
            y={cy - 15}
            width="45"
            height="30"
            rx="4"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.2"
          />

          <line x1={leftLensX - 24} y1={cy - 11} x2={leftLensX - 46} y2={cy - 8} stroke={templeColor} strokeWidth="1.8" />
          <line x1={rightLensX + 24} y1={cy - 11} x2={rightLensX + 46} y2={cy - 8} stroke={templeColor} strokeWidth="1.8" />
        </g>
      );

    case "rimless":
      return (
        <g id="glassesRimless" opacity={0.88}>
          <path d={`M ${cx - 12} ${cy - 3} Q ${cx} ${cy - 8} ${cx + 12} ${cy - 3}`} stroke="#94a3b8" strokeWidth="1.8" fill="none" />
          <circle cx={cx - 12} cy={cy - 3} r="1.3" fill="#475569" />
          <circle cx={cx + 12} cy={cy - 3} r="1.3" fill="#475569" />

          <rect
            x={leftLensX - 23}
            y={cy - 13}
            width="43"
            height="27"
            rx="5"
            fill={lensFill}
            stroke="#94a3b8"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
          <rect
            x={rightLensX - 20}
            y={cy - 13}
            width="43"
            height="27"
            rx="5"
            fill={lensFill}
            stroke="#94a3b8"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />

          <circle cx={leftLensX - 23} cy={cy - 8} r="1.3" fill="#475569" />
          <circle cx={rightLensX + 23} cy={cy - 8} r="1.3" fill="#475569" />
          <line x1={leftLensX - 23} y1={cy - 8} x2={leftLensX - 45} y2={cy - 6} stroke="#94a3b8" strokeWidth="1.6" />
          <line x1={rightLensX + 23} y1={cy - 8} x2={rightLensX + 45} y2={cy - 6} stroke="#94a3b8" strokeWidth="1.6" />
        </g>
      );

    default:
      return (
        <g id="glassesDefault" opacity={opacity}>
          <line x1={cx - 13} y1={cy - 5} x2={cx + 13} y2={cy - 5} stroke={frameColor} strokeWidth="4.5" />
          <rect x={leftLensX - 24} y={cy - 17} width="46" height="34" rx="8" fill={lensFill} stroke={frameColor} strokeWidth="5" />
          <rect x={rightLensX - 22} y={cy - 17} width="46" height="34" rx="8" fill={lensFill} stroke={frameColor} strokeWidth="5" />
          <line x1={leftLensX - 24} y1={cy - 10} x2={leftLensX - 46} y2={cy - 7} stroke={templeColor} strokeWidth="3.5" />
          <line x1={rightLensX + 24} y1={cy - 10} x2={rightLensX + 46} y2={cy - 7} stroke={templeColor} strokeWidth="3.5" />
        </g>
      );
  }
}
