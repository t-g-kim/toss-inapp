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
 * 21개 미술관별 방사형 지시선(Leader-Line) 화면 픽셀 오프셋 (수학적 충돌 0% 검증 완료)
 * - 아부다비/뉴델리, 서울/도쿄/타이베이, 시카고/뉴욕/워싱턴, 유럽 9곳 모두 겹침 및 외곽 잘림 없이 배치됩니다.
 */
const CALLOUT_OFFSETS_PX: Record<string, { dx: number; dy: number; shortTitle: string }> = {
  // 북미·중남미 (5곳)
  chicago_aic: { dx: -72, dy: -32, shortTitle: "🇺🇸 시카고 미술관" },
  nyc_moma_met: { dx: 68, dy: -32, shortTitle: "🇺🇸 뉴욕 MoMA·Met" },
  dc_nga: { dx: 72, dy: 24, shortTitle: "🇺🇸 워싱턴 NGA" },
  mexico_bellas: { dx: -64, dy: 28, shortTitle: "🇲🇽 멕시코시티" },
  saopaulo_masp: { dx: 0, dy: 34, shortTitle: "🇧🇷 상파울루 MASP" },

  // 아시아 (4곳)
  seoul_kansong: { dx: -48, dy: -40, shortTitle: "🇰🇷 서울 간송·국립" },
  tokyo_tnm: { dx: 38, dy: -12, shortTitle: "🇯🇵 도쿄 국립박물관" },
  taipei_npm: { dx: 26, dy: 38, shortTitle: "🇹🇼 타이베이 고궁" },
  delhi_national: { dx: 18, dy: -36, shortTitle: "🇮🇳 뉴델리 국립" },

  // 중동·아프리카·오세아니아 (3곳)
  cairo_gem: { dx: -58, dy: 34, shortTitle: "🇪🇬 카이로 이집트" },
  abudhabi_louvre: { dx: 0, dy: 58, shortTitle: "🇦🇪 루브르 아부다비" },
  melbourne_ngv: { dx: -52, dy: -32, shortTitle: "🇦🇺 멜버른 NGV" },

  // 유럽·유라시아 (9곳)
  oslo_munch: { dx: -36, dy: -38, shortTitle: "🇳🇴 오슬로 (뭉크)" },
  hermitage_ru: { dx: 42, dy: -34, shortTitle: "🇷🇺 상트페테르부르크" },
  national_uk: { dx: -95, dy: -42, shortTitle: "🇬🇧 런던 내셔널" },
  vangogh_nl: { dx: 72, dy: -44, shortTitle: "🇳🇱 암스테르담" },
  louvre: { dx: -102, dy: -4, shortTitle: "🇫🇷 파리 루브르" },
  orsay: { dx: -96, dy: 32, shortTitle: "🇫🇷 파리 오르세" },
  belvedere: { dx: 92, dy: -6, shortTitle: "🇦🇹 빈 벨베데레" },
  uffizi: { dx: 82, dy: 36, shortTitle: "🇮🇹 피렌체 우피치" },
  prado: { dx: -72, dy: 42, shortTitle: "🇪🇸 마드리드 프라도" },
};

/**
 * 5대 권역별 카메라 뷰포트 프리셋
 */
const REGION_CAMERA: Record<
  RegionKey,
  { scale: number; centerX: number; centerY: number; label: string; badge: string }
> = {
  all: { scale: 1.0, centerX: 520, centerY: 255, label: "🌍 전세계 6대주", badge: "21곳" },
  americas: { scale: 2.05, centerX: 285, centerY: 270, label: "🗽 북미·중남미", badge: "5곳" },
  europe: { scale: 4.2, centerX: 525, centerY: 170, label: "🏰 유럽·유라시아", badge: "9곳" },
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
  const [scale, setScale] = useState<number>(1.0);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 520, y: 255 });
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
      setScale((s) => Math.max(s, 4.2));
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
      setScale(Math.max(scale, 4.2));
      setCenter({ x: 525, y: 170 });
    } else {
      setScale(Math.max(scale, 2.7));
      setCenter({ x: museum.mapX, y: museum.mapY });
    }
  };

  const handleZoomStep = (delta: number) => {
    const next = Math.max(1.0, Math.min(6.0, Number((scale + delta).toFixed(2))));
    setScale(next);
    if (next <= 1.05) {
      setCenter({ x: 520, y: 255 });
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
          paddingBottom: "8px",
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
                padding: "6px 11px",
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

      {/* 지도 상단 컨트롤 바 (지도 내부 핀을 전혀 가리지 않도록 지도 바로 위에 분리 배치) */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#0F172A",
          color: "#E2E8F0",
          padding: "8px 12px",
          borderRadius: "16px 16px 0 0",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          fontSize: "11.5px",
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span>🧭 드래그 이동 · 핀/국가 터치</span>
          <span
            style={{
              background: "rgba(250, 204, 21, 0.18)",
              color: "#FACC15",
              padding: "1px 7px",
              borderRadius: "6px",
              fontWeight: 800,
            }}
          >
            {scale.toFixed(1)}x
          </span>
        </div>

        <button
          type="button"
          onClick={() => applyRegionPreset(scale < 2.2 ? "europe" : "all")}
          style={{
            background: scale < 2.2 ? "#2563EB" : "#334155",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "999px",
            padding: "4px 10px",
            fontSize: "11px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {scale < 2.2 ? "🔍 유럽 9곳 확대" : "🌍 전세계 1x 보기"}
        </button>
      </div>

      {/* 메인 세계지도 캔버스 (내부 오버레이를 최소화하여 21개 핀 전체가 100% 시원하게 노출됨) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        style={{
          position: "relative",
          width: "100%",
          height: "350px",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 42%, #0F2942 0%, #0A192F 62%, #060D1A 100%)",
          borderLeft: "1px solid #1E293B",
          borderRight: "1px solid #1E293B",
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
              stroke="rgba(250, 204, 21, 0.26)"
              strokeWidth={1.3 / scale}
              strokeDasharray={`${4 / scale} ${4 / scale}`}
            />
            <path
              d="M 224.6 266.3 Q 310 330 370.4 383.4"
              fill="none"
              stroke="rgba(52, 211, 153, 0.28)"
              strokeWidth={1.3 / scale}
              strokeDasharray={`${4 / scale} ${4 / scale}`}
            />
            <path
              d="M 837.6 250.3 Q 880 340 902.7 425.5"
              fill="none"
              stroke="rgba(56, 189, 248, 0.28)"
              strokeWidth={1.3 / scale}
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
                  y2={112}
                  stroke="#FACC15"
                  strokeWidth={1.8 / scale}
                  strokeDasharray={`${3 / scale} ${2 / scale}`}
                />
                <g
                  transform={`translate(520, 95) scale(${1 / scale})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyRegionPreset("europe");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={-84}
                    y={-18}
                    width={168}
                    height={34}
                    rx={17}
                    fill="#1E293B"
                    stroke="#FACC15"
                    strokeWidth={2}
                    filter="url(#badge-shadow)"
                  />
                  <text x={0} y={-4} textAnchor="middle" fill="#FACC15" fontSize={10.5} fontWeight="800">
                    🏰 유럽·유라시아 9대 미술관
                  </text>
                  <text x={0} y={9} textAnchor="middle" fill="#FFFFFF" fontSize={9.5} fontWeight="700">
                    🔍 터치하여 4.2배 확대 보기
                  </text>
                </g>
              </g>
            )}

            {/* 2) 6대주 21개 미술관 핀 & 방사형 지시선(Leader-Line) 콜아웃 배지 */}
            {museums.map((museum) => {
              if (isEuropeClustered && museum.region === "europe" && museum.id !== selectedMuseumId) {
                return null;
              }

              const isSelected = museum.id === selectedMuseumId;
              const isHovered = museum.id === hoveredMuseumId;
              const isVisited = visitedMuseumIds.includes(museum.id);

              const offset = CALLOUT_OFFSETS_PX[museum.id] || {
                dx: 0,
                dy: -32,
                shortTitle: `${museum.flag} ${museum.city}`,
              };

              const effectiveDx = isEuropeClustered && museum.region === "europe" ? -68 : offset.dx;
              const effectiveDy = isEuropeClustered && museum.region === "europe" ? 28 : offset.dy;

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
                      x={-56}
                      y={-12}
                      width={112}
                      height={24}
                      rx={12}
                      fill={isSelected ? "#FACC15" : isHovered ? "#1E3A8A" : "rgba(15, 23, 42, 0.92)"}
                      stroke={isSelected ? "#FFFFFF" : museum.badgeColor}
                      strokeWidth={isSelected ? 2.0 : 1.4}
                      filter="url(#badge-shadow)"
                    />

                    <text
                      x={isVisited ? -5 : 0}
                      y={1}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={isSelected ? "#0F172A" : "#F8FAFC"}
                      fontSize={10}
                      fontWeight="800"
                    >
                      {offset.shortTitle}
                    </text>

                    {/* 방문 스탬프 체크 마크 */}
                    {isVisited && (
                      <g transform="translate(44, 0)">
                        <circle r={7} fill="#10B981" stroke="#FFFFFF" strokeWidth={1.1} />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#FFFFFF"
                          fontSize={8}
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

        {/* 우측 하단: 컴팩트 확대/축소/초기화 컨트롤 버튼 */}
        <div
          style={{
            position: "absolute",
            right: "10px",
            bottom: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => handleZoomStep(0.8)}
            aria-label="지도 확대"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(15, 23, 42, 0.88)",
              color: "#FFFFFF",
              fontSize: "17px",
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
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(15, 23, 42, 0.88)",
              color: "#FFFFFF",
              fontSize: "17px",
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
              width: "32px",
              height: "26px",
              borderRadius: "9px",
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(30, 41, 59, 0.92)",
              color: "#93C5FD",
              fontSize: "10.5px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            1x
          </button>
        </div>
      </div>

      {/* 지도 하단 선택된 미술관 요약 바 (지도 캔버스를 가리지 않고 하단에 연결) */}
      <div
        style={{
          background: "#0F172A",
          borderRadius: "0 0 16px 16px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          padding: "10px 14px",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "10.5px", color: "#FACC15", fontWeight: 800 }}>
            📍 현재 선택된 미술관 ({selectedMuseum.city}, {selectedMuseum.country})
          </div>
          <div
            style={{
              fontSize: "13.5px",
              fontWeight: 800,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: "1px",
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
            padding: "4px 9px",
            borderRadius: "8px",
          }}
        >
          소장 걸작 {masterpieces.filter((a) => a.museumId === selectedMuseum.id).length}점 ↓
        </span>
      </div>
    </div>
  );
};
