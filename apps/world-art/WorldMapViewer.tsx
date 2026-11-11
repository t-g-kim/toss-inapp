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
 * 21개 세계 미술관 보유 국가 ISO -> 대표 미술관 매핑 (국가 영토 클릭 시 즉시 해당 미술관 선택)
 */
const HOST_COUNTRY_TO_MUSEUM: Record<string, string> = {
  USA: "nyc_moma_met",
  MEX: "mexico_bellas",
  BRA: "saopaulo_masp",
  KOR: "seoul_kansong",
  JPN: "tokyo_tnm",
  TWN: "taipei_npm",
  IND: "delhi_national",
  EGY: "cairo_gem",
  ARE: "abudhabi_louvre",
  AUS: "melbourne_ngv",
  FRA: "louvre",
  GBR: "national_uk",
  NLD: "vangogh_nl",
  ITA: "uffizi",
  AUT: "belvedere",
  ESP: "prado",
  NOR: "oslo_munch",
  RUS: "hermitage_ru",
};

/**
 * 21개 미술관별 방사형 지시선(Leader-Line) 화면 픽셀 오프셋
 * - 인접한 도시(뉴욕·워싱턴·시카고 / 서울·도쿄·타이베이 / 유럽 9곳)가 어떤 배율에서도 절대 서로 겹치지 않도록 설계되었습니다.
 */
const CALLOUT_OFFSETS_PX: Record<string, { dx: number; dy: number; shortTitle: string }> = {
  // 북미·중남미 (5곳)
  chicago_aic: { dx: -68, dy: -32, shortTitle: "🇺🇸 시카고 미술관" },
  nyc_moma_met: { dx: 68, dy: -32, shortTitle: "🇺🇸 뉴욕 MoMA·Met" },
  dc_nga: { dx: 66, dy: 28, shortTitle: "🇺🇸 워싱턴 NGA" },
  mexico_bellas: { dx: -56, dy: 28, shortTitle: "🇲🇽 멕시코시티" },
  saopaulo_masp: { dx: 58, dy: 0, shortTitle: "🇧🇷 상파울루 MASP" },

  // 아시아 (4곳)
  seoul_kansong: { dx: -52, dy: -34, shortTitle: "🇰🇷 서울 간송·국립" },
  tokyo_tnm: { dx: 58, dy: -16, shortTitle: "🇯🇵 도쿄 국립박물관" },
  taipei_npm: { dx: 54, dy: 28, shortTitle: "🇹🇼 타이베이 고궁" },
  delhi_national: { dx: 0, dy: 34, shortTitle: "🇮🇳 뉴델리 국립" },

  // 중동·아프리카·오세아니아 (3곳)
  cairo_gem: { dx: -54, dy: 32, shortTitle: "🇪🇬 카이로 이집트" },
  abudhabi_louvre: { dx: 52, dy: 32, shortTitle: "🇦🇪 루브르 아부다비" },
  melbourne_ngv: { dx: -52, dy: -30, shortTitle: "🇦🇺 멜버른 NGV" },

  // 유럽·유라시아 (9곳)
  oslo_munch: { dx: -38, dy: -36, shortTitle: "🇳🇴 오슬로 (뭉크)" },
  hermitage_ru: { dx: 64, dy: -34, shortTitle: "🇷🇺 상트페테르부르크" },
  national_uk: { dx: -86, dy: -32, shortTitle: "🇬🇧 런던 내셔널" },
  vangogh_nl: { dx: 76, dy: -32, shortTitle: "🇳🇱 암스테르담" },
  louvre: { dx: -92, dy: 2, shortTitle: "🇫🇷 파리 루브르" },
  orsay: { dx: -82, dy: 34, shortTitle: "🇫🇷 파리 오르세" },
  belvedere: { dx: 88, dy: 2, shortTitle: "🇦🇹 빈 벨베데레" },
  uffizi: { dx: 76, dy: 38, shortTitle: "🇮🇹 피렌체 우피치" },
  prado: { dx: -72, dy: 44, shortTitle: "🇪🇸 마드리드 프라도" },
};

/**
 * 5대 권역별 카메라 뷰포트 프리셋
 */
const REGION_CAMERA: Record<
  RegionKey,
  { scale: number; centerX: number; centerY: number; label: string; badge: string }
> = {
  all: { scale: 1.02, centerX: 525, centerY: 245, label: "🌍 전세계 6대주", badge: "21개 미술관" },
  americas: { scale: 2.05, centerX: 285, centerY: 265, label: "🗽 북미·중남미", badge: "5곳" },
  europe: { scale: 4.1, centerX: 525, centerY: 170, label: "🏰 유럽·유라시아", badge: "9곳" },
  asia: { scale: 2.75, centerX: 815, centerY: 235, label: "🏯 아시아·한국", badge: "4곳" },
  mea_oceania: { scale: 1.75, centerX: 735, centerY: 325, label: "🐪 중동·아프리카·호주", badge: "3곳" },
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
  const [scale, setScale] = useState<number>(1.02);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 525, y: 245 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [hoveredMuseumId, setHoveredMuseumId] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const prevMuseumRef = useRef<string>(selectedMuseumId);

  const selectedMuseum = museums.find((m) => m.id === selectedMuseumId) || museums[0];
  const isEuropeClustered = scale < 2.2;

  // 외부에서 미술관 선택 변경 시 해당 권역/도시로 카메라 자동 이동
  useEffect(() => {
    if (prevMuseumRef.current === selectedMuseumId) return;
    prevMuseumRef.current = selectedMuseumId;
    const target = museums.find((m) => m.id === selectedMuseumId);
    if (!target) return;
    if (target.region === "europe") {
      setScale((s) => Math.max(s, 4.1));
      setCenter({ x: 525, y: 170 });
    } else if (target.region === "americas") {
      setScale((s) => Math.max(s, 2.5));
      setCenter({ x: target.mapX, y: target.mapY });
    } else if (target.region === "asia") {
      setScale((s) => Math.max(s, 2.9));
      setCenter({ x: target.mapX, y: target.mapY });
    } else {
      setScale((s) => Math.max(s, 2.4));
      setCenter({ x: target.mapX, y: target.mapY });
    }
  }, [selectedMuseumId, museums]);

  const applyRegionPreset = (region: RegionKey) => {
    onChangeRegion(region);
    const preset = REGION_CAMERA[region];
    setScale(preset.scale);
    setCenter({ x: preset.centerX, y: preset.centerY });
  };

  const focusMuseum = (museum: MuseumInfo) => {
    prevMuseumRef.current = museum.id;
    onSelectMuseum(museum.id);
    onChangeRegion(museum.region);
    if (museum.region === "europe") {
      setScale(Math.max(scale, 4.1));
      setCenter({ x: 525, y: 170 });
    } else {
      setScale(Math.max(scale, 2.7));
      setCenter({ x: museum.mapX, y: museum.mapY });
    }
  };

  const handleZoomStep = (delta: number) => {
    const next = Math.max(1.0, Math.min(6.0, Number((scale + delta).toFixed(2))));
    setScale(next);
    if (next <= 1.08) {
      setCenter({ x: 525, y: 245 });
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
      x: Math.max(100, Math.min(920, dragRef.current.origX - dx)),
      y: Math.max(70, Math.min(455, dragRef.current.origY - dy)),
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
      {/* 상단 5대 권역 퀵 카메라 프리셋 칩 */}
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
                padding: "7px 11px",
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

      {/* 메인 세계지도 캔버스 (실제 176개국 지형 + 6대주 21개 미술관 핀) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{
          position: "relative",
          width: "100%",
          height: "390px",
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
            {/* 위도/경도 격자선 */}
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
              const mappedMuseumId = HOST_COUNTRY_TO_MUSEUM[country.id];
              const isSelectedCountry = selectedMuseum.countryIso === country.id;

              return (
                <path
                  key={country.id}
                  d={country.d}
                  onClick={(e) => {
                    if (mappedMuseumId) {
                      e.stopPropagation();
                      const target = museums.find((m) => m.id === mappedMuseumId);
                      if (target) focusMuseum(target);
                    }
                  }}
                  fill={
                    isSelectedCountry
                      ? "#F59E0B"
                      : mappedMuseumId
                      ? "rgba(59, 130, 246, 0.38)"
                      : "url(#land-default)"
                  }
                  stroke={
                    isSelectedCountry
                      ? "#FEF08A"
                      : mappedMuseumId
                      ? "#60A5FA"
                      : "rgba(100, 116, 139, 0.45)"
                  }
                  strokeWidth={(mappedMuseumId ? 1.0 : 0.65) / scale}
                  style={{
                    cursor: mappedMuseumId ? "pointer" : "grab",
                    transition: "fill 0.25s ease",
                  }}
                >
                  <title>{country.name}</title>
                </path>
              );
            })}

            {/* 6대주 글로벌 아트 항로 아크 */}
            <path
              d="M 224.6 266.3 L 256.6 199.8 L 294.5 203.4 Q 400 130 506.5 176.5 L 586.8 236.0 L 651.1 252.0 L 714.5 240.2 L 837.6 250.3 L 852.7 213.5 L 888.2 219.1"
              fill="none"
              stroke="rgba(250, 204, 21, 0.28)"
              strokeWidth={1.4 / scale}
              strokeDasharray={`${4 / scale} ${4 / scale}`}
            />
            <path
              d="M 224.6 266.3 Q 310 330 370.4 383.4"
              fill="none"
              stroke="rgba(52, 211, 153, 0.3)"
              strokeWidth={1.4 / scale}
              strokeDasharray={`${4 / scale} ${4 / scale}`}
            />
            <path
              d="M 837.6 250.3 Q 880 340 902.7 425.5"
              fill="none"
              stroke="rgba(56, 189, 248, 0.3)"
              strokeWidth={1.4 / scale}
              strokeDasharray={`${4 / scale} ${4 / scale}`}
            />

            {/* 1) 전세계 뷰(scale < 2.2)에서 유럽 9곳은 깔끔한 통합 클러스터 허브 배지로 묶어 표시 */}
            {isEuropeClustered && (
              <g>
                {museums
                  .filter((m) => m.region === "europe")
                  .map((m) => (
                    <circle
                      key={`eur-dot-${m.id}`}
                      cx={m.mapX}
                      cy={m.mapY}
                      r={(m.id === selectedMuseumId ? 5.2 : 3.5) / scale}
                      fill={m.id === selectedMuseumId ? "#FACC15" : "#38BDF8"}
                      stroke="#FFFFFF"
                      strokeWidth={1 / scale}
                    />
                  ))}

                <line
                  x1={520}
                  y1={168}
                  x2={520}
                  y2={108}
                  stroke="#FACC15"
                  strokeWidth={1.8 / scale}
                  strokeDasharray={`${3 / scale} ${2 / scale}`}
                />
                <g
                  transform={`translate(520, 92) scale(${1 / scale})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyRegionPreset("europe");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={-88}
                    y={-19}
                    width={176}
                    height={36}
                    rx={18}
                    fill="#1E293B"
                    stroke="#FACC15"
                    strokeWidth={2}
                    filter="url(#badge-shadow)"
                  />
                  <text x={0} y={-4} textAnchor="middle" fill="#FACC15" fontSize={10.5} fontWeight="800">
                    🏰 유럽·유라시아 9대 미술관
                  </text>
                  <text x={0} y={10} textAnchor="middle" fill="#FFFFFF" fontSize={9.5} fontWeight="700">
                    🔍 터치하여 4.1배 확대 보기
                  </text>
                </g>
              </g>
            )}

            {/* 2) 6대주 21개 미술관 핀 & 방사형 지시선(Leader-Line) 콜아웃 배지 */}
            {museums.map((museum) => {
              // 저배율일 때 유럽은 클러스터 허브로 묶고, 비유럽(북미·남미·아시아·중동·아프리카·호주 12곳)은 모두 전세계 지도에 펼쳐서 표시!
              if (isEuropeClustered && museum.region === "europe" && museum.id !== selectedMuseumId) {
                return null;
              }

              const isSelected = museum.id === selectedMuseumId;
              const isHovered = museum.id === hoveredMuseumId;
              const isVisited = visitedMuseumIds.includes(museum.id);
              const count = masterpieces.filter((art) => art.museumId === museum.id).length;

              const offset = CALLOUT_OFFSETS_PX[museum.id] || {
                dx: 0,
                dy: -32,
                shortTitle: `${museum.flag} ${museum.city}`,
              };

              // 저배율에서 선택된 유럽 미술관은 클러스터 배지 아래쪽으로 빼서 겹침 방지
              const effectiveDx = isEuropeClustered && museum.region === "europe" ? -65 : offset.dx;
              const effectiveDy = isEuropeClustered && museum.region === "europe" ? 32 : offset.dy;

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
                  {/* 실제 지리적 도시 위치 고정점 (Anchor Beacon) */}
                  {isSelected && (
                    <circle
                      cx={museum.mapX}
                      cy={museum.mapY}
                      r={9.5 / scale}
                      fill="rgba(250, 204, 21, 0.28)"
                      stroke="#FACC15"
                      strokeWidth={1.5 / scale}
                    />
                  )}
                  <circle
                    cx={museum.mapX}
                    cy={museum.mapY}
                    r={(isSelected ? 4.8 : 3.6) / scale}
                    fill={isSelected ? "#FACC15" : museum.badgeColor}
                    stroke="#FFFFFF"
                    strokeWidth={1.3 / scale}
                  />

                  {/* 도시 고정점과 캡슐 배지를 잇는 지시선 */}
                  <line
                    x1={museum.mapX}
                    y1={museum.mapY}
                    x2={targetX}
                    y2={targetY}
                    stroke={isSelected ? "#FACC15" : "rgba(226, 232, 240, 0.72)"}
                    strokeWidth={(isSelected ? 2.0 : 1.2) / scale}
                  />

                  {/* 캡슐형 미술관 배지 */}
                  <g transform={`translate(${targetX}, ${targetY}) scale(${1 / scale})`}>
                    <rect
                      x={-62}
                      y={-13}
                      width={124}
                      height={26}
                      rx={13}
                      fill={isSelected ? "#FACC15" : isHovered ? "#1E3A8A" : "rgba(15, 23, 42, 0.92)"}
                      stroke={isSelected ? "#FFFFFF" : museum.badgeColor}
                      strokeWidth={isSelected ? 2.2 : 1.5}
                      filter="url(#badge-shadow)"
                    />

                    <text
                      x={isVisited ? -5 : 0}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? "#0F172A" : "#F8FAFC"}
                      fontSize={10.5}
                      fontWeight="800"
                    >
                      {offset.shortTitle} ({count})
                    </text>

                    {/* 방문 스탬프 체크 마크 */}
                    {isVisited && (
                      <g transform="translate(48, 0)">
                        <circle r={7.5} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.2} />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#FFFFFF"
                          fontSize={8.5}
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
          <span>🌍 6대주 21개 미술관 · 핀/국가 터치</span>
          <span style={{ color: "#FACC15", fontWeight: 800 }}>{scale.toFixed(1)}x</span>
        </div>

        {/* 우측 상단: 유럽 집중확대 / 전세계 보기 토글 */}
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
          {scale < 2.2 ? "🔍 유럽 9곳 확대" : "🌍 전세계 1x 보기"}
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
              📍 현재 선택 ({selectedMuseum.city}, {selectedMuseum.country})
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
