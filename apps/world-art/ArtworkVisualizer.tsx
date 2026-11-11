import React, { useState, useRef } from "react";
import { MasterpieceItem, SecretHotspot } from "./catalog";

interface ArtworkVisualizerProps {
  artwork: MasterpieceItem;
  interactive?: boolean;
  activeHotspotId?: string | null;
  onSelectHotspot?: (hotspot: SecretHotspot) => void;
  showHotspots?: boolean;
  height?: number;
  framed?: boolean;
}

/**
 * 명화 일러스트 SVG 모티프 + 위키미디어 고해상도 원화 하이브리드 렌더러
 * - 네트워크 환경과 무관하게 즉시 아름다운 미술관 액자 & 벡터 아트를 렌더링하며,
 *   고해상도 원화 이미지가 로드되면 자연스럽게 오버레이합니다.
 * - interactive 모드에서는 1x ~ 3.5x 줌인, 드래그 패닝, 숨은 비밀 포인트(①②③) 핀 터치를 지원합니다.
 */
export const ArtworkVisualizer: React.FC<ArtworkVisualizerProps> = ({
  artwork,
  interactive = false,
  activeHotspotId = null,
  onSelectHotspot,
  showHotspots = true,
  height = 300,
  framed = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [renderMode, setRenderMode] = useState<"original" | "vector">("original");
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const handleZoomChange = (nextZoom: number) => {
    const clamped = Math.max(1, Math.min(3.5, Number(nextZoom.toFixed(1))));
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const focusOnHotspot = (spot: SecretHotspot) => {
    onSelectHotspot?.(spot);
    if (interactive) {
      const targetZoom = Math.max(zoom, 2.2);
      setZoom(targetZoom);
      // 중심(50, 50) 기준으로 해당 포인트가 중앙에 오도록 패닝 오프셋 계산
      const offsetX = (50 - spot.x) * 2.2;
      const offsetY = (50 - spot.y) * 2.2;
      setPan({
        x: Math.max(-130, Math.min(130, offsetX)),
        y: Math.max(-130, Math.min(130, offsetY)),
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive || zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const maxOffset = (zoom - 1) * 95;
    setPan({
      x: Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.panX + dx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.panY + dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* 클래식 미술관 골드/우드 액자 프레임 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${height}px`,
          borderRadius: framed ? "18px" : "12px",
          padding: framed ? "10px" : "0px",
          background: framed
            ? "linear-gradient(135deg, #6B4E23 0%, #D4AF37 28%, #8B6914 55%, #F3E5AB 78%, #5C4018 100%)"
            : "transparent",
          boxShadow: framed
            ? "0 14px 32px rgba(15, 23, 42, 0.25), inset 0 2px 4px rgba(255,255,255,0.45)"
            : "none",
          overflow: "hidden",
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: framed ? "11px" : "12px",
            overflow: "hidden",
            background: artwork.palette[0],
            cursor: interactive ? (zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in") : "pointer",
            boxShadow: framed ? "inset 0 0 18px rgba(0,0,0,0.55)" : "none",
            touchAction: zoom > 1 ? "none" : "pan-y",
          }}
        >
          {/* 줌 & 패닝 컨테이너 */}
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* 1. 기본 커스텀 명화 벡터 아트워크 (즉시 표시 및 아트 그래픽 모드) */}
            <MotifSvgRenderer motif={artwork.motif} palette={artwork.palette} />

            {/* 2. 고해상도 원화 이미지 (로드 완료 시 자연스럽게 표시) */}
            {!imgError && renderMode === "original" && (
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: imgLoaded ? 1 : 0,
                  transition: "opacity 0.4s ease",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* 캔버스 유화 질감 라이트 오버레이 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 25%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.28) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* 3. 그림 속 숨은 비밀 포인트 핀 (①, ②, ③) */}
            {showHotspots &&
              artwork.secretPoints.map((spot, idx) => {
                const isSelected = activeHotspotId === spot.id;
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusOnHotspot(spot);
                    }}
                    title={spot.label}
                    style={{
                      position: "absolute",
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / Math.sqrt(zoom)})`,
                      width: isSelected ? "32px" : "26px",
                      height: isSelected ? "32px" : "26px",
                      borderRadius: "50%",
                      border: "2px solid #FFFFFF",
                      background: isSelected
                        ? "linear-gradient(135deg, #FF3B30, #FF9500)"
                        : "rgba(25, 31, 40, 0.86)",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: isSelected
                        ? "0 0 0 6px rgba(255, 149, 0, 0.35), 0 4px 12px rgba(0,0,0,0.5)"
                        : "0 0 0 4px rgba(255, 255, 255, 0.25), 0 3px 10px rgba(0,0,0,0.45)",
                      transition: "all 0.2s ease",
                      zIndex: isSelected ? 10 : 5,
                      padding: 0,
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
          </div>

          {/* 좌측 상단 배지: 사조 & 제작연도 */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(15, 23, 42, 0.76)",
              backdropFilter: "blur(6px)",
              color: "#F8FAFC",
              padding: "4px 9px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "5px",
              pointerEvents: "none",
            }}
          >
            <span>🎨 {artwork.movement}</span>
            <span style={{ opacity: 0.6 }}>|</span>
            <span style={{ color: "#FDE68A" }}>{artwork.year}</span>
          </div>

          {/* 우측 상단: 원화/그래픽 전환 토글 (인터랙티브 모드) */}
          {interactive && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenderMode((prev) => (prev === "original" ? "vector" : "original"));
              }}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(15, 23, 42, 0.78)",
                backdropFilter: "blur(6px)",
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                zIndex: 15,
              }}
            >
              {renderMode === "original" && !imgError ? "🖼️ 아트 일러스트 보기" : "🏛️ 원화 사진 보기"}
            </button>
          )}
        </div>
      </div>

      {/* 인터랙티브 돋보기 컨트롤 바 */}
      {interactive && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F2F4F6",
            padding: "8px 12px",
            borderRadius: "12px",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#333D4B" }}>
            <span>🔍 초고화질 돋보기</span>
            <span
              style={{
                background: "#3182F6",
                color: "#FFFFFF",
                padding: "2px 7px",
                borderRadius: "6px",
                fontSize: "11px",
              }}
            >
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            {[1, 1.8, 2.6, 3.5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleZoomChange(level)}
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 9px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: Math.abs(zoom - level) < 0.2 ? "#191F28" : "#FFFFFF",
                  color: Math.abs(zoom - level) < 0.2 ? "#FFFFFF" : "#4E5968",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
              >
                {level === 1 ? "원본" : `${level}x`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 16대 명화별 상징적인 구도와 색채를 정교한 SVG 아트로 표현하는 렌더러
 */
const MotifSvgRenderer: React.FC<{
  motif: MasterpieceItem["motif"];
  palette: [string, string, string];
}> = ({ motif, palette }) => {
  const [c1, c2, c3] = palette;

  switch (motif) {
    case "starry_night":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="sn-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="55%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#sn-sky)" />
          {/* 소용돌이 은하수 */}
          <path
            d="M 40 90 C 120 30, 200 140, 290 75 C 330 45, 360 95, 320 120 C 260 150, 170 70, 95 130"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 55 95 C 130 45, 205 135, 285 80"
            fill="none"
            stroke="#FDE047"
            strokeWidth="6"
            strokeDasharray="12 8"
            strokeLinecap="round"
          />
          {/* 초승달과 별빛 */}
          <circle cx="335" cy="58" r="28" fill="#FACC15" opacity="0.35" />
          <circle cx="335" cy="58" r="18" fill="#FEF08A" />
          {[
            [75, 48, 12],
            [145, 42, 10],
            [225, 52, 14],
            [190, 125, 11],
            [275, 132, 9],
          ].map(([cx, cy, r], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r * 1.6} fill="#FDE047" opacity="0.3" />
              <circle cx={cx} cy={cy} r={r * 0.7} fill="#FEF9C3" />
            </g>
          ))}
          {/* 생레미 마을과 교회 첨탑 */}
          <path d="M 0 220 Q 140 190 260 225 T 400 210 L 400 300 L 0 300 Z" fill="#0F172A" />
          <polygon points="222,235 230,145 238,235" fill="#1E293B" stroke="#93C5FD" strokeWidth="1.5" />
          {/* 왼쪽 사이프러스 나무 */}
          <path
            d="M 55 300 C 42 220, 48 140, 68 35 C 82 120, 98 200, 92 300 Z"
            fill="#06281E"
            stroke="#34D399"
            strokeWidth="1.5"
            opacity="0.95"
          />
        </svg>
      );

    case "sunflowers":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="300" fill="#FDE047" />
          <rect y="215" width="400" height="85" fill="#CA8A04" />
          {/* 꽃병 */}
          <path d="M 145 170 L 255 170 L 270 235 C 270 265, 130 265, 130 235 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="3" />
          <path d="M 138 205 L 262 205" stroke="#1D4ED8" strokeWidth="3" />
          <text x="165" y="232" fill="#1D4ED8" fontSize="14" fontWeight="bold" fontStyle="italic">
            Vincent
          </text>
          {/* 해바라기 송이들 */}
          {[
            [200, 90, 32],
            [145, 115, 26],
            [255, 112, 28],
            [170, 148, 24],
            [230, 150, 25],
            [125, 160, 20],
            [275, 158, 22],
          ].map(([cx, cy, r], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r={r} fill="#F59E0B" stroke="#D97706" strokeWidth="4" strokeDasharray="6 3" />
              <circle cx={cx} cy={cy} r={r * 0.52} fill={idx % 2 === 0 ? "#78350F" : "#92400E"} />
            </g>
          ))}
        </svg>
      );

    case "monalisa":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ml-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B4D3E" />
              <stop offset="50%" stopColor="#5C6B57" />
              <stop offset="100%" stopColor="#1F1916" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#ml-bg)" />
          {/* 원경 산과 다리 */}
          <path d="M 0 130 Q 80 95 150 135 T 400 120 L 400 200 L 0 200 Z" fill="#2D3A30" opacity="0.7" />
          <path d="M 275 155 Q 310 142 345 155" fill="none" stroke="#A3B18A" strokeWidth="4" />
          {/* 인물 실루엣 & 스푸마토 얼굴 */}
          <path d="M 110 300 C 115 210, 150 180, 200 180 C 250 180, 285 210, 290 300 Z" fill="#1C1917" />
          <ellipse cx="200" cy="115" rx="46" ry="58" fill="#292524" />
          <ellipse cx="200" cy="118" rx="35" ry="45" fill="#D6B38E" />
          {/* 신비로운 미소와 눈매 */}
          <path d="M 182 108 Q 190 104 196 108" fill="none" stroke="#44403C" strokeWidth="2.5" />
          <path d="M 206 108 Q 214 104 220 108" fill="none" stroke="#44403C" strokeWidth="2.5" />
          <path d="M 188 138 Q 200 145 213 136" fill="none" stroke="#57534E" strokeWidth="2.5" strokeLinecap="round" />
          {/* 포개진 두 손 */}
          <ellipse cx="195" cy="252" rx="34" ry="15" fill="#C8A27C" />
        </svg>
      );

    case "pearl_earring":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="300" fill="#090D16" />
          {/* 황금빛 상의 */}
          <path d="M 125 300 C 135 215, 165 185, 215 185 C 260 185, 280 230, 285 300 Z" fill="#CA8A04" />
          <path d="M 155 190 L 210 215 L 185 245 Z" fill="#F8FAFC" />
          {/* 울트라마린 블루 터번 */}
          <path d="M 145 95 C 145 45, 245 45, 255 100 C 275 130, 270 195, 245 225 L 220 165 Z" fill="#1D4ED8" />
          <path d="M 148 92 C 180 78, 225 82, 252 102" fill="none" stroke="#FACC15" strokeWidth="14" strokeLinecap="round" />
          {/* 얼굴 */}
          <ellipse cx="192" cy="132" rx="38" ry="46" fill="#FDE6D8" />
          {/* 진주 귀걸이 하이라이트 */}
          <circle cx="222" cy="162" r="11" fill="#E2E8F0" />
          <circle cx="219" cy="159" r="5" fill="#FFFFFF" />
          {/* 붉은 입술 */}
          <ellipse cx="176" cy="155" rx="9" ry="4.5" fill="#E11D48" />
        </svg>
      );

    case "the_kiss":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="300" fill="#3B2F1E" />
          {/* 꽃밭 절벽 */}
          <path d="M 70 300 Q 200 245 330 300 Z" fill="#15803D" />
          {/* 황금 망토 아우라 */}
          <path d="M 125 300 L 135 75 C 135 35, 265 35, 265 75 L 275 300 Z" fill="#EAB308" stroke="#FEF08A" strokeWidth="3" />
          {/* 클림트 기하학 패턴 (사각형 + 원형) */}
          {[
            [155, 120],
            [172, 145],
            [150, 175],
            [168, 205],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="16" height="24" fill={i % 2 === 0 ? "#1C1917" : "#F8FAFC"} opacity="0.85" />
          ))}
          {[
            [225, 135],
            [240, 168],
            [222, 202],
            [242, 232],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="13" fill="none" stroke="#D97706" strokeWidth="3.5" />
          ))}
          {/* 포옹하는 두 얼굴 */}
          <circle cx="190" cy="82" r="20" fill="#D6A87C" />
          <circle cx="214" cy="92" r="19" fill="#F5D0B5" />
        </svg>
      );

    case "scream":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          {/* 핏빛 노을 파동 */}
          <rect width="400" height="300" fill="#1E293B" />
          <path d="M 0 35 Q 140 5 260 45 T 400 25 L 400 120 L 0 120 Z" fill="#DC2626" />
          <path d="M 0 65 Q 150 95 280 55 T 400 85" fill="none" stroke="#F97316" strokeWidth="18" />
          <path d="M 0 105 Q 140 75 270 115 T 400 95" fill="none" stroke="#FACC15" strokeWidth="12" />
          {/* 피오르 다리 난간 */}
          <polygon points="0,120 260,300 400,300 0,210" fill="#475569" opacity="0.85" />
          <line x1="0" y1="120" x2="290" y2="300" stroke="#94A3B8" strokeWidth="5" />
          {/* 절규하는 인물 */}
          <path d="M 165 300 C 160 230, 180 200, 205 200 C 230 200, 240 230, 235 300 Z" fill="#0F172A" />
          <ellipse cx="202" cy="162" rx="26" ry="34" fill="#E2D5B5" />
          <ellipse cx="193" cy="155" rx="5" ry="7" fill="#1E293B" />
          <ellipse cx="211" cy="155" rx="5" ry="7" fill="#1E293B" />
          <ellipse cx="202" cy="178" rx="8" ry="13" fill="#1E293B" />
        </svg>
      );

    case "great_wave":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="300" fill="#F3E5AB" />
          {/* 멀리 보이는 후지산 */}
          <polygon points="245,255 290,195 335,255" fill="#1E3A8A" />
          <polygon points="274,216 290,195 306,216" fill="#FFFFFF" />
          {/* 거대한 프러시안 블루 파도 */}
          <path
            d="M 0 280 Q 40 70 215 65 C 155 110, 145 190, 240 225 Q 320 245 400 190 L 400 300 L 0 300 Z"
            fill="#1E3A8A"
          />
          <path
            d="M 140 75 C 185 50, 235 65, 250 100"
            fill="none"
            stroke="#F8FAFC"
            strokeWidth="14"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
        </svg>
      );

    case "miindo":
    case "inwang":
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <rect width="400" height="300" fill={motif === "miindo" ? "#E7D8B9" : "#D6D3C9"} />
          {motif === "inwang" ? (
            <>
              {/* 인왕제색도 거대한 수묵 암봉 */}
              <path d="M 30 280 C 60 80, 175 35, 240 160 C 285 60, 355 85, 380 280 Z" fill="#1C1917" />
              {/* 골짜기 흰 안개 */}
              <rect x="0" y="185" width="400" height="38" fill="#F5F5F4" opacity="0.82" />
            </>
          ) : (
            <>
              {/* 신윤복 미인도 한복 실루엣 */}
              <ellipse cx="200" cy="78" rx="34" ry="30" fill="#1C1917" />
              <ellipse cx="200" cy="96" rx="20" ry="24" fill="#F5E6D3" />
              <path d="M 165 125 L 235 125 L 245 168 L 155 168 Z" fill="#FEF3C7" stroke="#991B1B" strokeWidth="2" />
              <path d="M 195 142 L 225 205" stroke="#991B1B" strokeWidth="6" strokeLinecap="round" />
              <path d="M 130 295 C 135 190, 160 165, 200 165 C 240 165, 265 190, 270 295 Z" fill="#1E3A5F" />
            </>
          )}
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id={`grad-${motif}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={c1} />
              <stop offset="55%" stopColor={c2} />
              <stop offset="100%" stopColor={c3} />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#grad-${motif})`} />
          <circle cx="200" cy="145" r="85" fill={c3} opacity="0.28" />
          <circle cx="200" cy="145" r="52" fill={c2} opacity="0.45" />
        </svg>
      );
  }
};
