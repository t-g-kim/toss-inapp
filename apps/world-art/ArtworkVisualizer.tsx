import React, { useState, useRef, useEffect } from "react";
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
 * 실제 고해상도 명화 원화 이미지 + 인터랙티브 3.5x 돋보기 렌더러
 * - 이미지 실제 렌더링 영역(inline-block 래퍼) 내부에 비밀 포인트 마커를 배치하여,
 *   세로형(모나리자·미인도 등)/가로형 비율과 무관하게 100% 정확한 명화 좌표에 번호 핀이 표시됩니다.
 * - 상단 배지가 명화를 가리지 않도록 컨트롤 바와 메타데이터 바를 액자 외부에 깔끔하게 배치했습니다.
 */
export const ArtworkVisualizer: React.FC<ArtworkVisualizerProps> = ({
  artwork,
  interactive = false,
  activeHotspotId = null,
  height = 320,
  framed = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">(interactive ? "contain" : "cover");
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // 다른 작품 선택 시 줌/패닝/에러 상태 초기화
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImgError(false);
    setFitMode(interactive ? "contain" : "cover");
  }, [artwork.id, interactive]);

  // 하단 비밀 포인트 버튼 클릭 시 해당 좌표로 번호 핀 표시 & 부드러운 클로즈업
  useEffect(() => {
    if (!interactive) return;
    if (!activeHotspotId) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }
    const spot = artwork.secretPoints.find((s) => s.id === activeHotspotId);
    if (!spot) return;
    const targetZoom = 2.0;
    setZoom(targetZoom);
    // 선택된 포인트가 화면 중앙 부근에 오도록 패닝 오프셋 계산
    const offsetX = (50 - spot.x) * 1.65;
    const offsetY = (50 - spot.y) * 1.65;
    setPan({
      x: Math.max(-120, Math.min(120, offsetX)),
      y: Math.max(-120, Math.min(120, offsetY)),
    });
  }, [activeHotspotId, interactive, artwork.secretPoints]);

  const handleZoomChange = (nextZoom: number) => {
    const clamped = Math.max(1, Math.min(3.5, Number(nextZoom.toFixed(1))));
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
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
    const maxOffset = (zoom - 1) * 115;
    setPan({
      x: Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.panX + dx)),
      y: Math.max(-maxOffset, Math.min(maxOffset, dragStartRef.current.panY + dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const activeSpotIndex = activeHotspotId
    ? artwork.secretPoints.findIndex((s) => s.id === activeHotspotId)
    : -1;
  const activeSpot = activeSpotIndex >= 0 ? artwork.secretPoints[activeSpotIndex] : null;
  const innerHeight = framed ? height - 18 : height;

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* 클래식 미술관 골드 액자 프레임 */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: `${height}px`,
          borderRadius: framed ? "18px" : "12px",
          padding: framed ? "9px" : "0px",
          background: framed
            ? "linear-gradient(135deg, #6B4E23 0%, #D4AF37 28%, #8B6914 55%, #F3E5AB 78%, #5C4018 100%)"
            : "transparent",
          boxShadow: framed
            ? "0 12px 28px rgba(15, 23, 42, 0.22), inset 0 2px 4px rgba(255,255,255,0.45)"
            : "none",
          overflow: "hidden",
          boxSizing: "border-box",
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
            background: "#0B0F19",
            cursor: interactive ? (zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default") : "pointer",
            boxShadow: framed ? "inset 0 0 18px rgba(0,0,0,0.65)" : "none",
            touchAction: zoom > 1 ? "none" : "pan-y",
          }}
        >
          {/* 1. 여백을 우아하게 채우는 앰비언트 블러 배경 */}
          {!imgError && (
            <img
              src={artwork.imageUrl}
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-16px",
                width: "calc(100% + 32px)",
                height: "calc(100% + 32px)",
                objectFit: "cover",
                filter: "blur(20px) brightness(0.38)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* 2. 줌 & 패닝 플렉스 센터 컨테이너 */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.34s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {!imgError ? (
              /* 이미지 실제 렌더링 크기에 100% 밀착되는 inline-block 래퍼 -> 세로형/가로형 어디서든 좌표 오차 0% */
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  lineHeight: 0,
                  width: fitMode === "cover" ? "100%" : "auto",
                  height: fitMode === "cover" ? "100%" : "auto",
                  maxWidth: "100%",
                  maxHeight: `${innerHeight}px`,
                }}
              >
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  onError={() => setImgError(true)}
                  style={{
                    width: fitMode === "cover" ? "100%" : "auto",
                    height: fitMode === "cover" ? `${innerHeight}px` : "auto",
                    maxWidth: "100%",
                    maxHeight: `${innerHeight}px`,
                    objectFit: fitMode === "cover" ? "cover" : "contain",
                    display: "block",
                    pointerEvents: "none",
                    borderRadius: "4px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.45)",
                  }}
                />

                {/* 3. 아래 비밀 포인트 버튼을 눌렀을 때만 실제 그림 영역 내부의 정확한 (x%, y%) 좌표에 번호 핀 표시 */}
                {interactive && activeSpot && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${activeSpot.x}%`,
                      top: `${activeSpot.y}%`,
                      transform: `translate(-50%, -50%) scale(${1 / Math.sqrt(zoom)})`,
                      pointerEvents: "none",
                      zIndex: 15,
                      display: "flex",
                      flexDirection: activeSpot.y > 72 ? "column-reverse" : "column",
                      alignItems: "center",
                    }}
                  >
                    {/* 번호 원형 배지 */}
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        border: "2.5px solid #FFFFFF",
                        background: "linear-gradient(135deg, #FF3B30, #FF9500)",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 900,
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                          "0 0 0 6px rgba(255, 149, 0, 0.42), 0 4px 14px rgba(0,0,0,0.7)",
                      }}
                    >
                      {activeSpotIndex + 1}
                    </div>

                    {/* 핀 캡션 라벨 (화면 가장자리 잘림 방지) */}
                    <div
                      style={{
                        marginTop: activeSpot.y > 72 ? "0px" : "4px",
                        marginBottom: activeSpot.y > 72 ? "4px" : "0px",
                        transform:
                          activeSpot.x < 24
                            ? "translateX(28%)"
                            : activeSpot.x > 76
                            ? "translateX(-28%)"
                            : "none",
                        background: "rgba(15, 23, 42, 0.94)",
                        color: "#FDE68A",
                        border: "1px solid rgba(250, 204, 21, 0.65)",
                        borderRadius: "999px",
                        padding: "4px 9px",
                        fontSize: "10px",
                        lineHeight: 1.2,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.55)",
                      }}
                    >
                      {activeSpot.label}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: `linear-gradient(135deg, ${artwork.palette[0]}, ${artwork.palette[1]}, ${artwork.palette[2]})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 800,
                }}
              >
                🎨 {artwork.title} ({artwork.artist})
              </div>
            )}
          </div>

          {/* 비인터랙티브 카드 목록에서만 좌측 하단에 작고 깔끔한 사조 캡션 표시 */}
          {!interactive && (
            <div
              style={{
                position: "absolute",
                bottom: "8px",
                left: "8px",
                background: "rgba(15, 23, 42, 0.78)",
                backdropFilter: "blur(6px)",
                color: "#F8FAFC",
                padding: "3px 8px",
                borderRadius: "999px",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                pointerEvents: "none",
              }}
            >
              <span>🎨 {artwork.movement}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ color: "#FDE68A" }}>{artwork.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* 인터랙티브 돋보기 & 비율 컨트롤 바 (명화 이미지를 전혀 가리지 않도록 액자 바로 아래 배치) */}
      {interactive && (
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#F2F4F6",
            padding: "8px 10px",
            borderRadius: "12px",
            gap: "6px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#333D4B" }}>
              🔍 돋보기
            </span>
            <span
              style={{
                background: "#3182F6",
                color: "#FFFFFF",
                padding: "2px 6px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 800,
              }}
            >
              {zoom.toFixed(1)}x
            </span>
            <button
              type="button"
              onClick={() => setFitMode((prev) => (prev === "contain" ? "cover" : "contain"))}
              style={{
                border: "1px solid #D1D6DB",
                background: "#FFFFFF",
                color: "#4E5968",
                borderRadius: "8px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {fitMode === "contain" ? "↔ 액자 채우기" : "🖼️ 전체 비율"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {[1, 1.8, 2.6, 3.5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => handleZoomChange(level)}
                style={{
                  border: "none",
                  borderRadius: "8px",
                  padding: "5px 8px",
                  fontSize: "11.5px",
                  fontWeight: 800,
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
