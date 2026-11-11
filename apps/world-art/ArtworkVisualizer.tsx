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
 * - 명화 원화 위에 시야를 가리는 번호 핀을 올리지 않고 100% 깨끗한 원화를 감상할 수 있습니다.
 * - 하단 비밀 포인트 칩을 선택하면 해당 디테일 좌표로 부드럽게 클로즈업됩니다.
 */
export const ArtworkVisualizer: React.FC<ArtworkVisualizerProps> = ({
  artwork,
  interactive = false,
  activeHotspotId = null,
  height = 310,
  framed = true,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">(interactive ? "contain" : "cover");
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const initialMountRef = useRef<boolean>(true);

  // 다른 작품 선택 시 줌/패닝/에러 상태 초기화
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setImgError(false);
    setFitMode(interactive ? "contain" : "cover");
    initialMountRef.current = true;
  }, [artwork.id, interactive]);

  // 사용자가 비밀 포인트 칩을 클릭해 activeHotspotId가 변경되면 해당 위치로 부드럽게 포커스 이동
  useEffect(() => {
    if (!interactive || !activeHotspotId) return;
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    const spot = artwork.secretPoints.find((s) => s.id === activeHotspotId);
    if (!spot) return;
    const targetZoom = Math.max(zoom, 2.0);
    setZoom(targetZoom);
    const offsetX = (50 - spot.x) * 2.0;
    const offsetY = (50 - spot.y) * 2.0;
    setPan({
      x: Math.max(-135, Math.min(135, offsetX)),
      y: Math.max(-135, Math.min(135, offsetY)),
    });
  }, [activeHotspotId]);

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
    const maxOffset = (zoom - 1) * 105;
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
            background: "#0B0F19",
            cursor: interactive ? (zoom > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in") : "pointer",
            boxShadow: framed ? "inset 0 0 18px rgba(0,0,0,0.65)" : "none",
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
            {!imgError ? (
              <>
                {/* 1. 여백을 우아하게 채우는 앰비언트 블러 배경 */}
                <img
                  src={artwork.imageUrl}
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "-12px",
                    width: "calc(100% + 24px)",
                    height: "calc(100% + 24px)",
                    objectFit: "cover",
                    filter: "blur(18px) brightness(0.42)",
                    pointerEvents: "none",
                  }}
                />

                {/* 2. 실제 고해상도 명화 원화 이미지 (번호 핀 없이 깨끗하게 표시) */}
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  onError={() => setImgError(true)}
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    objectFit: fitMode,
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
              </>
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

            {/* 미술관 스포트라이트 질감 오버레이 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 50% 25%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.22) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* 좌측 상단 배지: 사조 & 제작연도 */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(15, 23, 42, 0.82)",
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

          {/* 우측 상단: 원화 전체 비율 / 액자 꽉 채우기 전환 토글 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFitMode((prev) => (prev === "contain" ? "cover" : "contain"));
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(15, 23, 42, 0.82)",
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
            {fitMode === "contain" ? "↔ 액자 꽉 채우기" : "🖼️ 원화 전체 비율"}
          </button>
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#333D4B",
            }}
          >
            <span>🔍 초고화질 원화 돋보기</span>
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
