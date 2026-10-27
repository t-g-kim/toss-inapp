import React, { useRef, useState } from "react";
import {
  FaceShapeInfo,
  HairOption,
  HairColorOption,
  GlassesOption,
  GlassesColorOption,
  StylingCompatibility,
} from "./catalog";
import {
  Upload,
  RefreshCw,
  Eye,
  Sliders,
  Sparkles,
  Camera,
  Trash2,
} from "lucide-react";

interface FaceCanvasViewerProps {
  faceShape: FaceShapeInfo;
  hair: HairOption;
  hairColor: HairColorOption;
  glasses: GlassesOption;
  glassesColor: GlassesColorOption;
  compatibility: StylingCompatibility;
  userPhotoUrl: string | null;
  onPhotoUpload: (file: File) => void;
  onPhotoClear: () => void;
  svgRefCallback?: (svgElement: SVGSVGElement | null) => void;
}

export const FaceCanvasViewer: React.FC<FaceCanvasViewerProps> = ({
  faceShape,
  hair,
  hairColor,
  glasses,
  glassesColor,
  compatibility,
  userPhotoUrl,
  onPhotoUpload,
  onPhotoClear,
  svgRefCallback,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showAdjustPanel, setShowAdjustPanel] = useState(false);
  const [glassesScale, setGlassesScale] = useState(1.0);
  const [glassesOffsetY, setGlassesOffsetY] = useState(0);
  const [hairScale, setHairScale] = useState(1.0);
  const [photoOpacity, setPhotoOpacity] = useState(0.9);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { jawWidth, chinDrop, foreheadWidth, cheekCurve } = faceShape.svgModifiers;

  // ViewBox: 400 x 460
  const cx = 200;
  const cy = 200;

  // Head proportions
  const headTopY = 75;
  const chinY = 175 + 100 * chinDrop; // ~275 for oval
  const cheekW = 80 * cheekCurve; // ~80
  const jawW = 66 * jawWidth; // ~63
  const foreheadW = 76 * foreheadWidth; // ~76

  // Natural head contour path
  const facePath = `
    M ${cx - foreheadW} 135
    C ${cx - foreheadW * 1.05} ${headTopY}, ${cx + foreheadW * 1.05} ${headTopY}, ${cx + foreheadW} 135
    C ${cx + cheekW} 180, ${cx + jawW} 250, ${cx + 18} ${chinY - 6}
    Q ${cx} ${chinY}, ${cx - 18} ${chinY - 6}
    C ${cx - jawW} 250, ${cx - cheekW} 180, ${cx - foreheadW} 135
    Z
  `;

  return (
    <div className="relative w-full max-w-[420px] mx-auto bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col items-center">
      {/* 상단 오버레이 헤더 */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* 점수 뱃지 */}
        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-xs border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-[#3182F6]" />
          <span className="text-xs font-semibold text-slate-700">{faceShape.name}</span>
          <span className="text-xs font-bold text-[#3182F6]">{compatibility.score}점</span>
        </div>

        {/* 액션 버튼 */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black/60 active:bg-black/80 text-white text-[11px] font-medium rounded-full backdrop-blur-md transition-colors"
            title="누르고 있으면 비포 확인"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>비포비교</span>
          </button>

          <button
            onClick={() => setShowAdjustPanel(!showAdjustPanel)}
            className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
              showAdjustPanel ? "bg-[#3182F6] text-white" : "bg-white/90 text-slate-700 border border-slate-200"
            }`}
            title="미세 조정"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 메인 SVG 뷰어 */}
      <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200/90 flex items-center justify-center overflow-hidden">
        {userPhotoUrl && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-opacity"
            style={{
              backgroundImage: `url(${userPhotoUrl})`,
              opacity: photoOpacity,
            }}
          />
        )}

        <svg
          ref={(el) => {
            if (svgRefCallback) svgRefCallback(el);
          }}
          viewBox="0 0 400 460"
          className="relative z-10 w-full h-full object-contain transition-all duration-200"
        >
          <defs>
            {/* 자연스러운 피부 톤 그라데이션 */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fee2cc" />
              <stop offset="65%" stopColor="#fad0b2" />
              <stop offset="100%" stopColor="#f3be9b" />
            </linearGradient>

            <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f7c5a4" />
              <stop offset="100%" stopColor="#ebb18c" />
            </linearGradient>

            <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
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

          {/* 목 & 바디 */}
          {!userPhotoUrl && (
            <g id="neckAndBody">
              {/* 자연스러운 목과 어깨선 */}
              <path
                d="M 160 220 L 160 275 C 160 290 120 310 50 335 L 50 460 L 350 460 L 350 335 C 280 310 240 290 240 220 Z"
                fill="url(#skinGrad)"
                stroke="#dca47e"
                strokeWidth="1.2"
              />
              {/* 목 밑 쇄골 음영 */}
              <ellipse cx="200" cy="272" rx="26" ry="6" fill="#dca47e" opacity="0.3" />

              {/* 티셔츠 */}
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
              {/* 귀 (좌/우) - 눈높이부터 코끝까지 자연스러운 위치 */}
              <ellipse cx={cx - cheekW - 7} cy="198" rx="10" ry="18" fill="url(#earGrad)" stroke="#dca47e" strokeWidth="1.2" />
              <ellipse cx={cx - cheekW - 6} cy="198" rx="4.5" ry="9" fill="#dca47e" opacity="0.35" />

              <ellipse cx={cx + cheekW + 7} cy="198" rx="10" ry="18" fill="url(#earGrad)" stroke="#dca47e" strokeWidth="1.2" />
              <ellipse cx={cx + cheekW + 6} cy="198" rx="4.5" ry="9" fill="#dca47e" opacity="0.35" />

              {/* 얼굴형 맞춤 두상 메인 패스 */}
              <path
                d={facePath}
                fill="url(#skinGrad)"
                stroke="#dca47e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />

              {/* 치크 생기 */}
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

              {/* 눈 (매끄럽고 훈훈한 눈매) */}
              <g id="eyes">
                {/* 좌측 눈 */}
                <path d={`M ${cx - 56} 196 Q ${cx - 38} 187 ${cx - 20} 196`} fill="#ffffff" stroke="#1f2937" strokeWidth="1.8" />
                <path d={`M ${cx - 56} 196 Q ${cx - 38} 205 ${cx - 20} 196`} fill="#ffffff" stroke="#1f2937" strokeWidth="1.2" />
                <circle cx={cx - 38} cy="196" r="5.5" fill="#18181b" />
                <circle cx={cx - 40} cy="194" r="1.8" fill="#ffffff" />

                {/* 우측 눈 */}
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
            </g>
          )}

          {/* 가상 피팅 레이어 */}
          {!showOriginal && (
            <g id="virtualFittingLayer">
              {/* 1. 헤어스타일 렌더링 */}
              <g
                id="hairStyle"
                transform={`translate(${cx}, 120) scale(${hairScale}) translate(${-cx}, -120)`}
              >
                {renderCleanHairSvg(hair.id, hairColor, cx, foreheadW)}
              </g>

              {/* 2. 안경 프레임 렌더링 */}
              <g
                id="eyewearFrame"
                transform={`translate(${cx}, ${196 + glassesOffsetY}) scale(${glassesScale}) translate(${-cx}, -196)`}
              >
                {renderCleanGlassesSvg(glasses, glassesColor, cx)}
              </g>
            </g>
          )}
        </svg>

        {showOriginal && (
          <div className="absolute top-14 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wider animate-pulse z-30">
            비포 원본 (생얼) 보는 중
          </div>
        )}
      </div>

      {/* 미세 조정 패널 */}
      {showAdjustPanel && (
        <div className="w-full p-4 bg-slate-50 border-t border-slate-200 text-xs space-y-3 z-20">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>피팅 위치 & 크기 미세 조정</span>
            <button
              onClick={() => {
                setGlassesScale(1.0);
                setGlassesOffsetY(0);
                setHairScale(1.0);
                setPhotoOpacity(0.9);
              }}
              className="flex items-center gap-1 text-[#3182F6] hover:underline"
            >
              <RefreshCw className="w-3 h-3" />
              초기화
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 block mb-1">
                안경 크기: <span className="font-semibold text-slate-900">{Math.round(glassesScale * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.8"
                max="1.25"
                step="0.02"
                value={glassesScale}
                onChange={(e) => setGlassesScale(parseFloat(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">
                안경 높낮이: <span className="font-semibold text-slate-900">{glassesOffsetY}px</span>
              </label>
              <input
                type="range"
                min="-20"
                max="25"
                step="1"
                value={glassesOffsetY}
                onChange={(e) => setGlassesOffsetY(parseInt(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">
                헤어 볼륨: <span className="font-semibold text-slate-900">{Math.round(hairScale * 100)}%</span>
              </label>
              <input
                type="range"
                min="0.85"
                max="1.18"
                step="0.02"
                value={hairScale}
                onChange={(e) => setHairScale(parseFloat(e.target.value))}
                className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
            {userPhotoUrl && (
              <div>
                <label className="text-slate-600 block mb-1">
                  사진 투명도: <span className="font-semibold text-slate-900">{Math.round(photoOpacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.05"
                  value={photoOpacity}
                  onChange={(e) => setPhotoOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#3182F6] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 내 사진 올리기 바 */}
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
          3초 즉시 어울림 진단
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 고품질 헤어스타일 SVG 렌더러 (자연스러운 두상 밀착 & 결감)
// ==========================================
function renderCleanHairSvg(hairId: string, color: HairColorOption, cx: number, foreheadW: number) {
  const hairFill = "url(#hairGrad)";

  switch (hairId) {
    case "hair_seethrough_dandy":
      return (
        <g id="hairSeethroughDandy">
          {/* 전체 헤어 헬멧/볼륨 (정수리부터 구레나룻까지 자연스럽게 감쌈) */}
          <path
            d={`M ${cx - 94} 150 C ${cx - 104} 65, ${cx + 104} 65, ${cx + 94} 150 C ${cx + 92} 190, ${cx + 82} 220, ${cx + 76} 225 L ${cx + 70} 185 C ${cx + 65} 160, ${cx + 45} 145, ${cx} 145 C ${cx - 45} 145, ${cx - 65} 160, ${cx - 70} 185 L ${cx - 76} 225 C ${cx - 82} 220, ${cx - 92} 190, ${cx - 94} 150 Z`}
            fill={hairFill}
          />
          {/* 시스루 앞머리 곡선 및 텍스처 결 (눈썹 위로 훈훈하게 떨어짐) */}
          <path
            d={`M ${cx - 78} 140 C ${cx - 60} 165, ${cx - 48} 175, ${cx - 38} 176 Q ${cx - 26} 170, ${cx - 14} 177 Q ${cx} 170, ${cx + 14} 177 Q ${cx + 26} 170, ${cx + 38} 176 C ${cx + 50} 172, ${cx + 65} 160, ${cx + 78} 140 C ${cx + 40} 146, ${cx - 40} 146, ${cx - 78} 140 Z`}
            fill={hairFill}
          />
          {/* 하이라이트 엔젤링 */}
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
          {/* 가일컷: 한쪽 뒤로 넘기고, 한쪽은 쉼표/자연스럽게 떨어뜨림 */}
          <path
            d={`M ${cx - 95} 155 C ${cx - 105} 65, ${cx + 105} 65, ${cx + 95} 155 C ${cx + 95} 220, ${cx + 82} 245, ${cx + 78} 248 L ${cx + 72} 205 C ${cx + 70} 175, ${cx + 40} 155, ${cx} 155 C ${cx - 40} 155, ${cx - 70} 175, ${cx - 72} 205 L ${cx - 78} 248 C ${cx - 82} 245, ${cx - 95} 220, ${cx - 95} 155 Z`}
            fill={hairFill}
          />
          {/* 넘긴 쪽 (좌측 올백 라인) */}
          <path
            d={`M ${cx - 80} 150 C ${cx - 60} 140, ${cx - 30} 155, ${cx - 15} 175 C ${cx - 30} 160, ${cx - 60} 158, ${cx - 78} 170 Z`}
            fill={hairFill}
          />
          {/* 떨어진 쪽 (우측 쉼표 가일 앞머리) */}
          <path
            d={`M ${cx - 15} 175 C ${cx + 10} 160, ${cx + 50} 165, ${cx + 62} 202 C ${cx + 45} 182, ${cx + 20} 178, ${cx - 10} 180 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_as_perm":
      return (
        <g id="hairAsPerm">
          {/* 애즈펌: 부드러운 가르마 웨이브 */}
          <path
            d={`M ${cx - 98} 160 C ${cx - 108} 62, ${cx + 108} 62, ${cx + 98} 160 C ${cx + 95} 220, ${cx + 80} 250, ${cx + 74} 248 L ${cx + 70} 205 C ${cx + 65} 170, ${cx + 35} 155, ${cx} 155 C ${cx - 35} 155, ${cx - 65} 170, ${cx - 70} 205 L ${cx - 74} 248 C ${cx - 80} 250, ${cx - 95} 220, ${cx - 98} 160 Z`}
            fill={hairFill}
          />
          {/* 좌측 S컬 뱅 */}
          <path
            d={`M ${cx - 8} 152 C ${cx - 20} 175, ${cx - 50} 185, ${cx - 65} 198 C ${cx - 52} 175, ${cx - 28} 162, ${cx - 8} 152 Z`}
            fill={hairFill}
          />
          {/* 우측 S컬 뱅 */}
          <path
            d={`M ${cx + 8} 152 C ${cx + 20} 175, ${cx + 50} 185, ${cx + 65} 198 C ${cx + 52} 175, ${cx + 28} 162, ${cx + 8} 152 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_leaf":
      return (
        <g id="hairLeaf">
          {/* 리프컷: 귀 뒤로 넘어가는 감성 중단발 */}
          <path
            d={`M ${cx - 105} 155 C ${cx - 115} 60, ${cx + 115} 60, ${cx + 105} 155 C ${cx + 108} 225, ${cx + 92} 280, ${cx + 68} 305 C ${cx + 82} 260, ${cx + 88} 210, ${cx + 78} 170 C ${cx - 78} 170, ${cx - 88} 210, ${cx - 82} 260 C ${cx - 68} 305, ${cx - 92} 280, ${cx - 105} 155 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx - 45} 175, ${cx - 78} 195, ${cx - 88} 220 C ${cx - 70} 185, ${cx - 35} 162, ${cx} 145 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx + 45} 175, ${cx + 78} 195, ${cx + 88} 220 C ${cx + 70} 185, ${cx + 35} 162, ${cx} 145 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_ivy_league":
      return (
        <g id="hairIvyLeague">
          {/* 아이비리그컷: 짧고 샤프하게 세운 프론트 */}
          <path
            d={`M ${cx - 85} 155 C ${cx - 90} 80, ${cx + 90} 80, ${cx + 85} 155 C ${cx + 82} 195, ${cx + 75} 225, ${cx + 70} 225 L ${cx + 66} 190 C ${cx + 60} 160, ${cx + 30} 150, ${cx} 148 C ${cx - 30} 150, ${cx - 60} 160, ${cx - 66} 190 L ${cx - 70} 225 C ${cx - 75} 225, ${cx - 82} 195, ${cx - 85} 155 Z`}
            fill={hairFill}
          />
          {/* 센터 업 텍스처 */}
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
          {/* 어깨 라인으로 풍성하게 흐르는 롱 C컬 */}
          <path
            d={`M ${cx - 110} 150 C ${cx - 120} 58, ${cx + 120} 58, ${cx + 110} 150 C ${cx + 125} 260, ${cx + 120} 370, ${cx + 90} 430 C ${cx + 105} 340, ${cx + 95} 240, ${cx + 82} 180 C ${cx - 82} 180, ${cx - 95} 240, ${cx - 105} 340 C ${cx - 120} 370, ${cx - 125} 260, ${cx - 110} 150 Z`}
            fill={hairFill}
          />
          {/* 얼굴선 감싸는 사이드뱅 */}
          <path
            d={`M ${cx} 145 C ${cx - 45} 175, ${cx - 85} 230, ${cx - 68} 280 C ${cx - 60} 240, ${cx - 38} 190, ${cx} 158 Z`}
            fill={hairFill}
          />
          <path
            d={`M ${cx} 145 C ${cx + 45} 175, ${cx + 85} 230, ${cx + 68} 280 C ${cx + 60} 240, ${cx + 38} 190, ${cx} 158 Z`}
            fill={hairFill}
          />
        </g>
      );

    case "hair_tassel_bob":
      return (
        <g id="hairTasselBob">
          {/* 칼단발 태슬컷 */}
          <path
            d={`M ${cx - 102} 150 C ${cx - 110} 65, ${cx + 110} 65, ${cx + 102} 150 L ${cx + 98} 290 L ${cx + 74} 290 L ${cx + 80} 180 C ${cx - 80} 180, ${cx - 74} 290, ${cx - 74} 290 L ${cx - 98} 290 Z`}
            fill={hairFill}
          />
          {/* 풀뱅 */}
          <path
            d={`M ${cx - 60} 150 C ${cx - 40} 192, ${cx + 40} 192, ${cx + 60} 150 Z`}
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
            d={`M ${cx - 75} 150 C ${cx - 40} 195, ${cx + 40} 195, ${cx + 75} 150 Z`}
            fill={hairFill}
          />
        </g>
      );
  }
}

// ==========================================
// 고품질 안경 SVG 렌더러 (눈 위치 cx=200, cy=212에 완벽 정렬)
// ==========================================
function renderCleanGlassesSvg(glasses: GlassesOption, color: GlassesColorOption, cx: number) {
  const cy = 196;
  const frameColor = color.frameColor;
  const templeColor = color.templeColor;
  const opacity = color.opacity;

  const leftLensX = cx - 38;
  const rightLensX = cx + 38;

  switch (glasses.shapeStyle) {
    case "arnel":
      return (
        <g id="glassesArnel" opacity={opacity}>
          {/* 키홀 브릿지 */}
          <path
            d={`M ${leftLensX + 22} ${cy - 7} Q ${cx} ${cy - 10} ${rightLensX - 22} ${cy - 7} L ${rightLensX - 22} ${cy + 5} Q ${cx} ${cy - 1} ${leftLensX + 22} ${cy + 5} Z`}
            fill={frameColor}
          />
          {/* 좌측 아넬 림 */}
          <rect
            x={leftLensX - 26}
            y={cy - 19}
            width="48"
            height="38"
            rx="10"
            fill="url(#lensReflect)"
            stroke={frameColor}
            strokeWidth="5.5"
          />
          {/* 우측 아넬 림 */}
          <rect
            x={rightLensX - 22}
            y={cy - 19}
            width="48"
            height="38"
            rx="10"
            fill="url(#lensReflect)"
            stroke={frameColor}
            strokeWidth="5.5"
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
          {/* 브릿지 */}
          <path d={`M ${cx - 12} ${cy - 5} Q ${cx} ${cy - 8} ${cx + 12} ${cy - 5}`} stroke={frameColor} strokeWidth="4" fill="none" />

          {/* 좌측 크라운판토 */}
          <path
            d={`M ${leftLensX - 23} ${cy - 8} L ${leftLensX - 11} ${cy - 18} L ${leftLensX + 11} ${cy - 18} L ${leftLensX + 21} ${cy - 8} C ${leftLensX + 21} ${cy + 16}, ${leftLensX - 23} ${cy + 16}, ${leftLensX - 23} ${cy - 8} Z`}
            fill="url(#lensReflect)"
            stroke={frameColor}
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          {/* 우측 크라운판토 */}
          <path
            d={`M ${rightLensX - 21} ${cy - 8} L ${rightLensX - 11} ${cy - 18} L ${rightLensX + 11} ${cy - 18} L ${rightLensX + 23} ${cy - 8} C ${rightLensX + 23} ${cy + 16}, ${rightLensX - 21} ${cy + 16}, ${rightLensX - 21} ${cy - 8} Z`}
            fill="url(#lensReflect)"
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

          {/* 상단 뿔테 브로우 */}
          <path
            d={`M ${leftLensX - 28} ${cy - 5} Q ${leftLensX} ${cy - 20} ${leftLensX + 22} ${cy - 7} L ${leftLensX + 19} ${cy - 1} Q ${leftLensX} ${cy - 13} ${leftLensX - 25} ${cy - 1} Z`}
            fill={frameColor}
          />
          <path
            d={`M ${rightLensX - 22} ${cy - 7} Q ${rightLensX} ${cy - 20} ${rightLensX + 28} ${cy - 5} L ${rightLensX + 25} ${cy - 1} Q ${rightLensX} ${cy - 13} ${rightLensX - 19} ${cy - 1} Z`}
            fill={frameColor}
          />

          {/* 하단 얇은 메탈 림 */}
          <path
            d={`M ${leftLensX - 25} ${cy - 2} C ${leftLensX - 25} ${cy + 18}, ${leftLensX + 19} ${cy + 18}, ${leftLensX + 19} ${cy - 2}`}
            stroke="#94a3b8"
            strokeWidth="2.2"
            fill="url(#lensReflect)"
          />
          <path
            d={`M ${rightLensX - 19} ${cy - 2} C ${rightLensX - 19} ${cy + 18}, ${rightLensX + 25} ${cy + 18}, ${rightLensX + 25} ${cy - 2}`}
            stroke="#94a3b8"
            strokeWidth="2.2"
            fill="url(#lensReflect)"
          />

          <line x1={leftLensX - 28} y1={cy - 5} x2={leftLensX - 48} y2={cy - 3} stroke={templeColor} strokeWidth="3" />
          <line x1={rightLensX + 28} y1={cy - 5} x2={rightLensX + 48} y2={cy - 3} stroke={templeColor} strokeWidth="3" />
        </g>
      );

    case "round_metal":
      return (
        <g id="glassesRoundMetal" opacity={opacity}>
          <path d={`M ${cx - 13} ${cy - 3} Q ${cx} ${cy - 10} ${cx + 13} ${cy - 3}`} stroke={frameColor} strokeWidth="2.0" fill="none" />

          {/* 원형 림 */}
          <circle cx={leftLensX} cy={cy} r="21" fill="url(#lensReflect)" stroke={frameColor} strokeWidth="2.0" />
          <circle cx={rightLensX} cy={cy} r="21" fill="url(#lensReflect)" stroke={frameColor} strokeWidth="2.0" />

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
            fill="url(#lensReflect)"
            stroke={frameColor}
            strokeWidth="2.2"
          />
          <rect
            x={rightLensX - 21}
            y={cy - 15}
            width="45"
            height="30"
            rx="4"
            fill="url(#lensReflect)"
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
            fill="url(#lensReflect)"
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
            fill="url(#lensReflect)"
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
          <rect x={leftLensX - 24} y={cy - 17} width="46" height="34" rx="8" fill="url(#lensReflect)" stroke={frameColor} strokeWidth="5" />
          <rect x={rightLensX - 22} y={cy - 17} width="46" height="34" rx="8" fill="url(#lensReflect)" stroke={frameColor} strokeWidth="5" />
          <line x1={leftLensX - 24} y1={cy - 10} x2={leftLensX - 46} y2={cy - 7} stroke={templeColor} strokeWidth="3.5" />
          <line x1={rightLensX + 24} y1={cy - 10} x2={rightLensX + 46} y2={cy - 7} stroke={templeColor} strokeWidth="3.5" />
        </g>
      );
  }
}
