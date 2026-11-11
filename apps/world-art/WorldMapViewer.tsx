import React, { useState, useRef } from "react";
import { MuseumInfo, MasterpieceItem, RegionKey } from "./catalog";

interface WorldMapViewerProps {
  museums: MuseumInfo[];
  masterpieces: MasterpieceItem[];
  selectedMuseumId: string;
  visitedMuseumIds: string[];
  activeRegion: RegionKey;
  onSelectMuseum: (museumId: string) => void;
  onChangeRegion: (region: RegionKey) => void;
}

/**
 * 대륙별 카메라 뷰포트 프리셋 (1000 x 520 월드맵 기준)
 * - 유럽에 미술관이 밀집해 있으므로 '유럽 집중확대' 시 핀들이 겹치지 않고 쾌적하게 펼쳐집니다.
 */
const REGION_CAMERA: Record<
  RegionKey,
  { scale: number; centerX: number; centerY: number; label: string; badge: string }
> = {
  all: { scale: 1, centerX: 500, centerY: 250, label: "🌍 전세계 한눈에", badge: "10개 미술관" },
  europe: { scale: 2.65, centerX: 502, centerY: 162, label: "🏰 유럽 집중확대", badge: "7개 대미술관" },
  americas: { scale: 2.3, centerX: 280, centerY: 195, label: "🗽 미주(뉴욕)", badge: "MoMA" },
  asia: { scale: 2.35, centerX: 830, centerY: 205, label: "🏯 한국·아시아", badge: "서울·도쿄" },
};

export const WorldMapViewer: React.FC<WorldMapViewerProps> = ({
  museums,
  masterpieces,
  selectedMuseumId,
  visitedMuseumIds,
  activeRegion,
  onSelectMuseum,
  onChangeRegion,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 500, y: 250 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  // 대륙 탭 전환 시 카메라 부드럽게 이동
  const applyRegionPreset = (region: RegionKey) => {
    onChangeRegion(region);
    const preset = REGION_CAMERA[region];
    setScale(preset.scale);
    setCenter({ x: preset.centerX, y: preset.centerY });
  };

  // 특정 미술관 핀 클릭 시 해당 위치로 줌인 및 선택
  const handlePinClick = (museum: MuseumInfo) => {
    onSelectMuseum(museum.id);
    const targetScale = museum.region === "europe" ? Math.max(scale, 2.6) : Math.max(scale, 2.0);
    setScale(targetScale);
    setCenter({
      x: Math.max(160, Math.min(840, museum.mapX)),
      y: Math.max(100, Math.min(420, museum.mapY)),
    });
  };

  const handleZoomStep = (delta: number) => {
    const next = Math.max(1, Math.min(3.8, Number((scale + delta).toFixed(2))));
    setScale(next);
    if (next === 1) {
      setCenter({ x: 500, y: 250 });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: center.x,
      origY: center.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragRef.current) return;
    const dx = (e.clientX - dragRef.current.startX) * (1.6 / scale);
    const dy = (e.clientY - dragRef.current.startY) * (1.6 / scale);
    setCenter({
      x: Math.max(140, Math.min(860, dragRef.current.origX - dx)),
      y: Math.max(90, Math.min(430, dragRef.current.origY - dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  // 현재 카메라 중심과 배율에 따른 SVG transform 계산
  const translateX = 500 - center.x * scale;
  const translateY = 260 - center.y * scale;

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* 대륙별 퀵 줌 필터 칩 */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "10px",
          scrollbarWidth: "none",
        }}
      >
        {(Object.keys(REGION_CAMERA) as RegionKey[]).map((key) => {
          const item = REGION_CAMERA[key];
          const isActive = activeRegion === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => applyRegionPreset(key)}
              style={{
                flexShrink: 0,
                border: isActive ? "1.5px solid #3182F6" : "1px solid #E5E8EB",
                background: isActive ? "#E8F3FF" : "#FFFFFF",
                color: isActive ? "#1B64DA" : "#4E5968",
                borderRadius: "999px",
                padding: "7px 12px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.18s ease",
              }}
            >
              <span>{item.label}</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 6px",
                  borderRadius: "999px",
                  background: isActive ? "#3182F6" : "#F2F4F6",
                  color: isActive ? "#FFFFFF" : "#6B7684",
                }}
              >
                {item.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* 인터랙티브 세계지도 뷰포트 */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          position: "relative",
          width: "100%",
          height: "285px",
          borderRadius: "20px",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 35%, #172554 0%, #0F172A 65%, #090D16 100%)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.22)",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <svg
          viewBox="0 0 1000 520"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="continent-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <filter id="pin-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.55" />
            </filter>
          </defs>

          <g
            transform={`translate(${translateX}, ${translateY}) scale(${scale})`}
            style={{
              transition: isDragging ? "none" : "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* 위도/경도 그리드 라인 */}
            {[100, 180, 260, 340, 420].map((y) => (
              <line
                key={`lat-${y}`}
                x1="0"
                y1={y}
                x2="1000"
                y2={y}
                stroke="rgba(148, 163, 184, 0.12)"
                strokeDasharray="4 6"
                strokeWidth={1 / scale}
              />
            ))}
            {[160, 320, 480, 640, 800].map((x) => (
              <line
                key={`lon-${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="520"
                stroke="rgba(148, 163, 184, 0.12)"
                strokeDasharray="4 6"
                strokeWidth={1 / scale}
              />
            ))}

            {/* 6대주 스타일라이즈드 대륙 실루엣 */}
            {/* 북아메리카 */}
            <path
              d="M 85 75 L 235 60 L 325 135 L 295 225 L 220 265 L 155 235 L 95 155 Z"
              fill="url(#continent-fill)"
              stroke="#475569"
              strokeWidth={1.5 / scale}
            />
            {/* 남아메리카 */}
            <path
              d="M 245 280 L 345 305 L 365 395 L 305 485 L 255 440 L 235 335 Z"
              fill="url(#continent-fill)"
              stroke="#475569"
              strokeWidth={1.5 / scale}
            />
            {/* 유럽 */}
            <path
              d="M 435 72 L 565 65 L 595 145 L 555 205 L 448 205 L 425 145 Z"
              fill="#283548"
              stroke="#64748B"
              strokeWidth={1.8 / scale}
            />
            {/* 아프리카 */}
            <path
              d="M 445 220 L 585 225 L 625 320 L 565 445 L 495 440 L 435 315 Z"
              fill="url(#continent-fill)"
              stroke="#475569"
              strokeWidth={1.5 / scale}
            />
            {/* 아시아 */}
            <path
              d="M 585 68 L 875 78 L 915 195 L 845 285 L 710 295 L 605 215 Z"
              fill="#243247"
              stroke="#64748B"
              strokeWidth={1.8 / scale}
            />
            {/* 한반도 & 일본 열도 디테일 포인트 */}
            <path
              d="M 808 188 L 826 188 L 828 214 L 810 214 Z"
              fill="#3B4F6B"
              stroke="#93C5FD"
              strokeWidth={1.2 / scale}
            />
            <path
              d="M 845 182 L 872 195 L 862 222 L 842 212 Z"
              fill="#3B4F6B"
              stroke="#93C5FD"
              strokeWidth={1.2 / scale}
            />
            {/* 오세아니아 */}
            <path
              d="M 760 350 L 895 345 L 910 445 L 785 450 Z"
              fill="url(#continent-fill)"
              stroke="#475569"
              strokeWidth={1.5 / scale}
            />

            {/* 대륙 라벨 */}
            <text x="195" y="145" fill="rgba(255,255,255,0.22)" fontSize={13 / Math.sqrt(scale)} fontWeight="800">
              NORTH AMERICA
            </text>
            <text x="485" y="92" fill="rgba(255,255,255,0.28)" fontSize={12 / Math.sqrt(scale)} fontWeight="800">
              EUROPE
            </text>
            <text x="715" y="145" fill="rgba(255,255,255,0.25)" fontSize={13 / Math.sqrt(scale)} fontWeight="800">
              ASIA
            </text>

            {/* 미술관 간 항공 투어 라인 */}
            <polyline
              points={museums.map((m) => `${m.mapX},${m.mapY}`).join(" ")}
              fill="none"
              stroke="rgba(250, 204, 21, 0.25)"
              strokeWidth={1.8 / scale}
              strokeDasharray={`${5 / scale} ${5 / scale}`}
            />

            {/* 10대 미술관 인터랙티브 핀 */}
            {museums.map((museum) => {
              const isSelected = museum.id === selectedMuseumId;
              const isVisited = visitedMuseumIds.includes(museum.id);
              const count = masterpieces.filter((art) => art.museumId === museum.id).length;
              const pinRadius = (isSelected ? 17 : 13) / Math.sqrt(scale);
              const fontSize = (isSelected ? 11.5 : 10) / Math.sqrt(scale);

              return (
                <g
                  key={museum.id}
                  transform={`translate(${museum.mapX}, ${museum.mapY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePinClick(museum);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* 선택된 미술관 펄스 링 */}
                  {isSelected && (
                    <circle
                      r={pinRadius * 1.9}
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth={2.5 / scale}
                      opacity="0.85"
                    />
                  )}

                  {/* 핀 원형 배지 */}
                  <circle
                    r={pinRadius}
                    fill={isSelected ? "#F59E0B" : museum.badgeColor}
                    stroke="#FFFFFF"
                    strokeWidth={2.2 / scale}
                    filter="url(#pin-glow)"
                  />

                  {/* 국기 이모지 */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={pinRadius * 1.05}
                  >
                    {museum.flag}
                  </text>

                  {/* 방문 완료 스탬프 체크 배지 */}
                  {isVisited && (
                    <g transform={`translate(${pinRadius * 0.78}, ${-pinRadius * 0.78})`}>
                      <circle r={6.5 / Math.sqrt(scale)} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.2 / scale} />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FFFFFF"
                        fontSize={7.5 / Math.sqrt(scale)}
                        fontWeight="900"
                      >
                        ✓
                      </text>
                    </g>
                  )}

                  {/* 도시/미술관 캡션 라벨 */}
                  <g transform={`translate(0, ${pinRadius + 10 / Math.sqrt(scale)})`}>
                    <rect
                      x={-42 / Math.sqrt(scale)}
                      y={-8 / Math.sqrt(scale)}
                      width={84 / Math.sqrt(scale)}
                      height={16 / Math.sqrt(scale)}
                      rx={6 / Math.sqrt(scale)}
                      fill={isSelected ? "#FEF08A" : "rgba(15, 23, 42, 0.88)"}
                      stroke={isSelected ? "#CA8A04" : "rgba(255,255,255,0.22)"}
                      strokeWidth={1 / scale}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? "#1E293B" : "#F8FAFC"}
                      fontSize={fontSize}
                      fontWeight="800"
                    >
                      {museum.city} ({count})
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 좌측 상단: 현재 줌 상태 안내 */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "12px",
            background: "rgba(15, 23, 42, 0.76)",
            backdropFilter: "blur(6px)",
            padding: "5px 10px",
            borderRadius: "999px",
            color: "#E2E8F0",
            fontSize: "11px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            pointerEvents: "none",
          }}
        >
          <span>🧭 드래그 이동 · 핀 터치</span>
          <span style={{ color: "#FACC15" }}>{scale.toFixed(1)}x</span>
        </div>

        {/* 우측 하단: 확대/축소/초기화 버튼 */}
        <div
          style={{
            position: "absolute",
            right: "12px",
            bottom: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <button
            type="button"
            onClick={() => handleZoomStep(0.65)}
            aria-label="지도 확대"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(15, 23, 42, 0.85)",
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => handleZoomStep(-0.65)}
            aria-label="지도 축소"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(15, 23, 42, 0.85)",
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => applyRegionPreset("all")}
            aria-label="지도 초기화"
            style={{
              width: "34px",
              height: "30px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(30, 41, 59, 0.9)",
              color: "#93C5FD",
              fontSize: "11px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            1x
          </button>
        </div>
      </div>
    </div>
  );
};
