import React, { useState, useRef, useEffect } from "react";
import { MuseumInfo, MasterpieceItem, RegionKey } from "./catalog";
import { WORLD_COUNTRIES } from "./worldMapData";

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
 * 미술관 보유 국가 ISO 코드 -> 대표 미술관 매핑 (국가 폴리곤 클릭 시 해당 미술관으로 즉시 이동)
 */
const HOST_COUNTRY_TO_MUSEUM: Record<string, { museumId: string; fill: string; stroke: string }> = {
  FRA: { museumId: "louvre", fill: "#2563EB", stroke: "#93C5FD" },
  GBR: { museumId: "national_uk", fill: "#4F46E5", stroke: "#A5B4FC" },
  NLD: { museumId: "vangogh_nl", fill: "#D97706", stroke: "#FDE68A" },
  ITA: { museumId: "uffizi", fill: "#DB2777", stroke: "#F9A8D4" },
  AUT: { museumId: "belvedere", fill: "#B45309", stroke: "#FCD34D" },
  ESP: { museumId: "prado", fill: "#DC2626", stroke: "#FCA5A5" },
  NOR: { museumId: "oslo_munch", fill: "#EA580C", stroke: "#FDBA74" },
  USA: { museumId: "nyc_moma_met", fill: "#4338CA", stroke: "#A5B4FC" },
  KOR: { museumId: "seoul_kansong", fill: "#059669", stroke: "#6EE7B7" },
};

/**
 * 유럽 확대 뷰(scale >= 2.1)에서 핀과 라벨이 절대 서로 겹치지 않도록 설계된 방사형 지시선(Leader-line) 오프셋
 * (단위: 화면 픽셀 기준 오프셋이므로 줌 배율과 무관하게 일정한 간격을 유지합니다)
 */
const CALLOUT_OFFSETS_PX: Record<string, { dx: number; dy: number; shortTitle: string }> = {
  oslo_munch: { dx: 0, dy: -38, shortTitle: "🇳🇴 오슬로 (뭉크)" },
  national_uk: { dx: -82, dy: -34, shortTitle: "🇬🇧 런던 (내셔널)" },
  vangogh_nl: { dx: 78, dy: -36, shortTitle: "🇳🇱 암스테르담 (고흐)" },
  louvre: { dx: -88, dy: 4, shortTitle: "🇫🇷 파리 (루브르)" },
  orsay: { dx: -76, dy: 38, shortTitle: "🇫🇷 파리 (오르세)" },
  belvedere: { dx: 88, dy: 2, shortTitle: "🇦🇹 빈 (벨베데레)" },
  uffizi: { dx: 76, dy: 42, shortTitle: "🇮🇹 피렌체 (우피치)" },
  prado: { dx: -68, dy: 46, shortTitle: "🇪🇸 마드리드 (프라도)" },
  nyc_moma_met: { dx: 0, dy: -38, shortTitle: "🇺🇸 뉴욕 (MoMA·Met)" },
  seoul_kansong: { dx: 0, dy: -38, shortTitle: "🇰🇷 서울 (간송·국립중앙)" },
};

/**
 * 대륙별 카메라 뷰포트 프리셋 (1000 x 520 실제 세계지도 투영 기준)
 */
const REGION_CAMERA: Record<
  RegionKey,
  { scale: number; centerX: number; centerY: number; label: string; badge: string }
> = {
  all: { scale: 1.05, centerX: 520, centerY: 225, label: "🌍 전세계 한눈에", badge: "10개 미술관" },
  europe: { scale: 4.2, centerX: 516, centerY: 174, label: "🏰 유럽 집중확대", badge: "8개 대미술관" },
  americas: { scale: 3.0, centerX: 285, centerY: 202, label: "🗽 미주(뉴욕)", badge: "MoMA·Met" },
  asia: { scale: 3.4, centerX: 845, centerY: 212, label: "🏯 한국·아시아", badge: "서울 국보전" },
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
  const [scale, setScale] = useState<number>(1.05);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 520, y: 225 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredMuseumId, setHoveredMuseumId] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const prevMuseumRef = useRef<string>(selectedMuseumId);

  const selectedMuseum = museums.find((m) => m.id === selectedMuseumId) || museums[0];
  const isEuropeClustered = scale < 2.15;

  // 하단 미술관 카드 클릭 등으로 selectedMuseumId가 변경되면 해당 지역으로 카메라 자동 포커스
  useEffect(() => {
    if (prevMuseumRef.current === selectedMuseumId) return;
    prevMuseumRef.current = selectedMuseumId;
    const target = museums.find((m) => m.id === selectedMuseumId);
    if (!target) return;
    if (target.region === "europe") {
      setScale((s) => Math.max(s, 4.2));
      setCenter({ x: 516, y: 174 });
    } else if (target.region === "americas") {
      setScale((s) => Math.max(s, 3.0));
      setCenter({ x: target.mapX, y: target.mapY });
    } else {
      setScale((s) => Math.max(s, 3.4));
      setCenter({ x: target.mapX, y: target.mapY });
    }
  }, [selectedMuseumId, museums]);

  // 대륙 탭 전환 시 카메라 부드럽게 이동
  const applyRegionPreset = (region: RegionKey) => {
    onChangeRegion(region);
    const preset = REGION_CAMERA[region];
    setScale(preset.scale);
    setCenter({ x: preset.centerX, y: preset.centerY });
  };

  // 특정 미술관 선택 및 해당 도시로 스마트 줌인
  const focusMuseum = (museum: MuseumInfo) => {
    onSelectMuseum(museum.id);
    if (museum.region === "europe") {
      onChangeRegion("europe");
      const nextScale = Math.max(scale, 4.2);
      setScale(nextScale);
      setCenter({ x: 516, y: 174 });
    } else if (museum.region === "americas") {
      onChangeRegion("americas");
      setScale(Math.max(scale, 3.0));
      setCenter({ x: museum.mapX, y: museum.mapY });
    } else {
      onChangeRegion("asia");
      setScale(Math.max(scale, 3.4));
      setCenter({ x: museum.mapX, y: museum.mapY });
    }
  };

  const handleZoomStep = (delta: number) => {
    const next = Math.max(1.0, Math.min(6.0, Number((scale + delta).toFixed(2))));
    setScale(next);
    if (next <= 1.1) {
      setCenter({ x: 520, y: 225 });
      onChangeRegion("all");
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.55 : -0.55;
    handleZoomStep(delta);
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
    const dx = (e.clientX - dragRef.current.startX) * (1.45 / scale);
    const dy = (e.clientY - dragRef.current.startY) * (1.45 / scale);
    setCenter({
      x: Math.max(120, Math.min(900, dragRef.current.origX - dx)),
      y: Math.max(75, Math.min(445, dragRef.current.origY - dy)),
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  const translateX = 500 - center.x * scale;
  const translateY = 260 - center.y * scale;

  return (
    <div style={{ width: "100%", userSelect: "none" }}>
      {/* 상단 대륙별 퀵 카메라 프리셋 칩 */}
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

      {/* 메인 세계지도 캔버스 (실제 176개국 Natural Earth 지형 + 스마트 클러스터/지시선) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{
          position: "relative",
          width: "100%",
          height: "370px",
          borderRadius: "20px",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 40%, #0F2942 0%, #0A192F 60%, #060D1A 100%)",
          border: "1px solid #1E293B",
          boxShadow: "0 14px 32px rgba(15, 23, 42, 0.24)",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
      >
        <svg
          viewBox="0 0 1000 520"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{ display: "block" }}
        >
          <defs>
            <linearGradient id="land-default" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#162032" />
            </linearGradient>
            <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.65" />
            </filter>
          </defs>

          <g
            transform={`translate(${translateX}, ${translateY}) scale(${scale})`}
            style={{
              transition: isDragging ? "none" : "transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* 경위도 격자선 (Ocean Graticules) */}
            {[80, 150, 220, 290, 360, 430].map((y) => (
              <line
                key={`lat-${y}`}
                x1="0"
                y1={y}
                x2="1000"
                y2={y}
                stroke={y === 290 ? "rgba(56, 189, 248, 0.22)" : "rgba(148, 163, 184, 0.08)"}
                strokeDasharray={y === 290 ? "none" : "3 5"}
                strokeWidth={0.9 / scale}
              />
            ))}
            {[150, 300, 450, 600, 750, 900].map((x) => (
              <line
                key={`lon-${x}`}
                x1={x}
                y1="0"
                x2={x}
                y2="520"
                stroke="rgba(148, 163, 184, 0.08)"
                strokeDasharray="3 5"
                strokeWidth={0.9 / scale}
              />
            ))}

            {/* 실제 176개국 세계지도 폴리곤 렌더링 */}
            {WORLD_COUNTRIES.map((country) => {
              const hostInfo = HOST_COUNTRY_TO_MUSEUM[country.id];
              const isSelectedCountry =
                hostInfo &&
                museums.find((m) => m.id === selectedMuseumId)?.country ===
                  museums.find((m) => m.id === hostInfo.museumId)?.country;

              return (
                <path
                  key={country.id}
                  d={country.d}
                  onClick={(e) => {
                    if (hostInfo) {
                      e.stopPropagation();
                      const target = museums.find((m) => m.id === hostInfo.museumId);
                      if (target) focusMuseum(target);
                    }
                  }}
                  fill={
                    isSelectedCountry
                      ? "#F59E0B"
                      : hostInfo
                      ? "rgba(59, 130, 246, 0.42)"
                      : "url(#land-default)"
                  }
                  stroke={
                    isSelectedCountry
                      ? "#FEF08A"
                      : hostInfo
                      ? "#60A5FA"
                      : "rgba(100, 116, 139, 0.45)"
                  }
                  strokeWidth={(hostInfo ? 1.1 : 0.65) / scale}
                  style={{
                    cursor: hostInfo ? "pointer" : "grab",
                    transition: "fill 0.25s ease",
                  }}
                >
                  <title>{country.name}</title>
                </path>
              );
            })}

            {/* 대륙 워터마크 라벨 (저배율에서만 은은하게 표시) */}
            {scale < 2.2 && (
              <g style={{ pointerEvents: "none" }} opacity={0.32}>
                <text x="210" y="165" fill="#94A3B8" fontSize={11} fontWeight="800" textAnchor="middle">
                  NORTH AMERICA
                </text>
                <text x="305" y="365" fill="#94A3B8" fontSize={10} fontWeight="800" textAnchor="middle">
                  SOUTH AMERICA
                </text>
                <text x="535" y="295" fill="#94A3B8" fontSize={11} fontWeight="800" textAnchor="middle">
                  AFRICA
                </text>
                <text x="725" y="165" fill="#94A3B8" fontSize={11} fontWeight="800" textAnchor="middle">
                  ASIA
                </text>
                <text x="845" y="395" fill="#94A3B8" fontSize={10} fontWeight="800" textAnchor="middle">
                  OCEANIA
                </text>
              </g>
            )}

            {/* 대륙 간 항공 투어 아크 곡선 (뉴욕 <-> 파리 <-> 서울) */}
            <path
              d="M 294.5 203.4 Q 400 120 506.5 176.5"
              fill="none"
              stroke="rgba(250, 204, 21, 0.35)"
              strokeWidth={1.6 / scale}
              strokeDasharray={`${5 / scale} ${4 / scale}`}
            />
            <path
              d="M 506.5 176.5 Q 680 115 852.7 213.5"
              fill="none"
              stroke="rgba(56, 189, 248, 0.35)"
              strokeWidth={1.6 / scale}
              strokeDasharray={`${5 / scale} ${4 / scale}`}
            />

            {/* 1) 전세계 저배율(scale < 2.15)일 때: 유럽은 깔끔한 통합 클러스터 허브 배지로 표시하여 겹침 완벽 방지 */}
            {isEuropeClustered && (
              <g>
                {/* 유럽 각 미술관의 실제 도시 위치에는 빛나는 골드 비콘 점 표시 */}
                {museums
                  .filter((m) => m.region === "europe")
                  .map((m) => (
                    <circle
                      key={`dot-${m.id}`}
                      cx={m.mapX}
                      cy={m.mapY}
                      r={(m.id === selectedMuseumId ? 5.5 : 3.5) / scale}
                      fill={m.id === selectedMuseumId ? "#FACC15" : "#38BDF8"}
                      stroke="#FFFFFF"
                      strokeWidth={1 / scale}
                    />
                  ))}

                {/* 유럽 상단 지시선 & 클러스터 허브 버튼 */}
                <line
                  x1={512}
                  y1={174}
                  x2={512}
                  y2={118}
                  stroke="#FACC15"
                  strokeWidth={1.8 / scale}
                  strokeDasharray={`${3 / scale} ${2 / scale}`}
                />
                <g
                  transform={`translate(512, 102) scale(${1 / scale})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyRegionPreset("europe");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={-88}
                    y={-20}
                    width={176}
                    height={38}
                    rx={19}
                    fill="#1E293B"
                    stroke="#FACC15"
                    strokeWidth={2}
                    filter="url(#badge-shadow)"
                  />
                  <text x={0} y={-4} textAnchor="middle" fill="#FACC15" fontSize={11} fontWeight="800">
                    🏰 유럽 8대 미술관 밀집지역
                  </text>
                  <text x={0} y={11} textAnchor="middle" fill="#FFFFFF" fontSize={10} fontWeight="700">
                    🔍 터치하여 4.2배 확대 보기
                  </text>
                </g>
              </g>
            )}

            {/* 2) 개별 미술관 핀 & 방사형 지시선(Leader-Line) 콜아웃 배지 */}
            {museums.map((museum) => {
              // 저배율일 때 유럽 미술관은 클러스터 배지로 통합되므로, 현재 선택된 유럽 미술관 1개만 하단에 표시
              if (isEuropeClustered && museum.region === "europe" && museum.id !== selectedMuseumId) {
                return null;
              }

              const isSelected = museum.id === selectedMuseumId;
              const isHovered = museum.id === hoveredMuseumId;
              const isVisited = visitedMuseumIds.includes(museum.id);
              const count = masterpieces.filter((art) => art.museumId === museum.id).length;

              const offset = CALLOUT_OFFSETS_PX[museum.id] || {
                dx: 0,
                dy: -34,
                shortTitle: `${museum.flag} ${museum.city}`,
              };

              // 저배율에서 선택된 유럽 미술관은 아래쪽으로 지시선을 빼서 클러스터 배지와 겹치지 않게 처리
              const effectiveDx = isEuropeClustered && museum.region === "europe" ? 0 : offset.dx;
              const effectiveDy = isEuropeClustered && museum.region === "europe" ? 42 : offset.dy;

              const targetX = museum.mapX + effectiveDx / scale;
              const targetY = museum.mapY + effectiveDy / scale;

              return (
                <g
                  key={museum.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusMuseum(museum);
                  }}
                  onMouseEnter={() => setHoveredMuseumId(museum.id)}
                  onMouseLeave={() => setHoveredMuseumId(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* 실제 지리적 도시 위치 고정점 (Anchor Dot) */}
                  {isSelected && (
                    <circle
                      cx={museum.mapX}
                      cy={museum.mapY}
                      r={10 / scale}
                      fill="rgba(250, 204, 21, 0.28)"
                      stroke="#FACC15"
                      strokeWidth={1.5 / scale}
                    />
                  )}
                  <circle
                    cx={museum.mapX}
                    cy={museum.mapY}
                    r={(isSelected ? 5 : 3.8) / scale}
                    fill={isSelected ? "#FACC15" : museum.badgeColor}
                    stroke="#FFFFFF"
                    strokeWidth={1.4 / scale}
                  />

                  {/* 도시 고정점과 콜아웃 캡슐을 잇는 지시선 (Leader Line) */}
                  <line
                    x1={museum.mapX}
                    y1={museum.mapY}
                    x2={targetX}
                    y2={targetY}
                    stroke={isSelected ? "#FACC15" : "rgba(226, 232, 240, 0.75)"}
                    strokeWidth={(isSelected ? 2.0 : 1.3) / scale}
                  />

                  {/* 화면 배율에 상관없이 항상 선명하고 겹치지 않는 캡슐형 핀 배지 */}
                  <g transform={`translate(${targetX}, ${targetY}) scale(${1 / scale})`}>
                    <rect
                      x={-64}
                      y={-14}
                      width={128}
                      height={28}
                      rx={14}
                      fill={isSelected ? "#FACC15" : isHovered ? "#1E3A8A" : "rgba(15, 23, 42, 0.92)"}
                      stroke={isSelected ? "#FFFFFF" : museum.badgeColor}
                      strokeWidth={isSelected ? 2.2 : 1.6}
                      filter="url(#badge-shadow)"
                    />

                    <text
                      x={isVisited ? -6 : 0}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? "#0F172A" : "#F8FAFC"}
                      fontSize={11}
                      fontWeight="800"
                    >
                      {offset.shortTitle} ({count})
                    </text>

                    {/* 방문 스탬프 체크 배지 */}
                    {isVisited && (
                      <g transform="translate(50, 0)">
                        <circle r={8} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.2} />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#FFFFFF"
                          fontSize={9}
                          fontWeight="900"
                        >
                          ✓
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 좌측 상단: 인터랙션 가이드 & 현재 줌 배율 */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "rgba(15, 23, 42, 0.84)",
            backdropFilter: "blur(8px)",
            padding: "6px 11px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#E2E8F0",
            fontSize: "11px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "6px",
            pointerEvents: "none",
          }}
        >
          <span>🧭 드래그·휠 확대 · 국가/핀 터치</span>
          <span style={{ color: "#FACC15", fontWeight: 800 }}>{scale.toFixed(1)}x</span>
        </div>

        {/* 우측 상단: 유럽 집중확대 / 전체보기 원터치 토글 버튼 */}
        <button
          type="button"
          onClick={() => applyRegionPreset(scale < 2.2 ? "europe" : "all")}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: scale < 2.2 ? "linear-gradient(135deg, #2563EB, #1D4ED8)" : "rgba(15, 23, 42, 0.88)",
            color: "#FFFFFF",
            border: "1px solid rgba(255,255,255,0.28)",
            borderRadius: "999px",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          {scale < 2.2 ? "🔍 유럽 8대 미술관 확대하기" : "🌍 전세계 지도로 축소"}
        </button>

        {/* 좌측 하단: 현재 선택된 미술관 미니 HUD 오버레이 */}
        <div
          style={{
            position: "absolute",
            left: "12px",
            bottom: "12px",
            right: "58px",
            background: "rgba(15, 23, 42, 0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "14px",
            padding: "9px 12px",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "10px", color: "#FACC15", fontWeight: 800 }}>
              📍 현재 선택된 미술관 ({selectedMuseum.city}, {selectedMuseum.country})
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedMuseum.flag} {selectedMuseum.name}
            </div>
          </div>
          <span
            style={{
              flexShrink: 0,
              background: selectedMuseum.badgeColor,
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: "8px",
            }}
          >
            걸작 {masterpieces.filter((a) => a.museumId === selectedMuseum.id).length}점
          </span>
        </div>

        {/* 우측 하단: 확대/축소/초기화 컨트롤 버튼 */}
        <div
          style={{
            position: "absolute",
            right: "12px",
            bottom: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <button
            type="button"
            onClick={() => handleZoomStep(0.8)}
            aria-label="지도 확대"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(15, 23, 42, 0.9)",
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
            onClick={() => handleZoomStep(-0.8)}
            aria-label="지도 축소"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(15, 23, 42, 0.9)",
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
              height: "28px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(30, 41, 59, 0.95)",
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
