/**
 * 원룸 가구 배치 3D - 2D 인터랙티브 평면도 뷰어
 * - 터치/마우스 드래그 앤 드롭으로 가구 위치 이동
 * - 90도 회전, 삭제, 문 개폐 반경(호) 실시간 표시
 * - 가구 간 충돌 및 문 간섭 시 붉은 경고 펄스
 */

import React, { useRef, useState, useEffect } from "react";
import {
  RoomTemplate,
  PlacedFurniture,
  getFurnitureById,
} from "./catalog";
import {
  getFurnitureBox,
  RoomDiagnostics,
  getDoorSweepBox,
} from "./engine";
import { RotateCw, Trash2, AlertTriangle, Sun, Compass } from "lucide-react";

interface Room2DViewerProps {
  template: RoomTemplate;
  placed: PlacedFurniture[];
  selectedId: string | null;
  diagnostics: RoomDiagnostics;
  onSelect: (instanceId: string | null) => void;
  onMove: (instanceId: string, x: number, y: number) => void;
  onRotate: (instanceId: string) => void;
  onDelete: (instanceId: string) => void;
}

export const Room2DViewer: React.FC<Room2DViewerProps> = ({
  template,
  placed,
  selectedId,
  diagnostics,
  onSelect,
  onMove,
  onRotate,
  onDelete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 뷰포트 여백 (벽 두께 및 치수 라벨 공간)
  const padding = 35;
  const svgWidth = template.width + padding * 2;
  const svgHeight = template.depth + padding * 2;

  // 마우스/터치 좌표를 방 내부 cm 좌표로 변환
  const getRoomCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;

    const screenX = (clientX - rect.left) * scaleX - padding;
    const screenY = (clientY - rect.top) * scaleY - padding;

    return {
      x: Math.round(screenX),
      y: Math.round(screenY),
    };
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    item: PlacedFurniture
  ) => {
    e.stopPropagation();
    onSelect(item.instanceId);
    setDraggingId(item.instanceId);

    const coords = getRoomCoords(e.clientX, e.clientY);
    setDragOffset({
      x: coords.x - item.x,
      y: coords.y - item.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;

    const coords = getRoomCoords(e.clientX, e.clientY);
    const item = placed.find((p) => p.instanceId === draggingId);
    if (!item) return;

    const meta = getFurnitureById(item.furnitureId);
    const isRotated = item.rotation === 90 || item.rotation === 270;
    const w = isRotated ? (meta?.depth || 100) : (meta?.width || 100);
    const h = isRotated ? (meta?.width || 100) : (meta?.depth || 100);

    // 5cm 그리드 스냅 및 방 벽면 클램핑
    let newX = Math.round((coords.x - dragOffset.x) / 5) * 5;
    let newY = Math.round((coords.y - dragOffset.y) / 5) * 5;

    newX = Math.max(0, Math.min(template.width - w, newX));
    newY = Math.max(0, Math.min(template.depth - h, newY));

    onMove(draggingId, newX, newY);
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  useEffect(() => {
    const onWindowPointerUp = () => setDraggingId(null);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => window.removeEventListener("pointerup", onWindowPointerUp);
  }, []);

  const selectedItem = placed.find((p) => p.instanceId === selectedId);

  return (
    <div className="flex flex-col items-center select-none w-full">
      {/* 2D 평면도 캔버스 컨테이너 */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => onSelect(null)}
        className="relative w-full max-w-[420px] aspect-[4/5] bg-slate-900 rounded-3xl p-2 shadow-inner border border-slate-800 touch-none overflow-hidden cursor-crosshair flex items-center justify-center"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* 10cm 간격 정밀 모눈종이 그리드 패턴 */}
            <pattern
              id="grid50"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#334155"
                strokeWidth="0.8"
                strokeDasharray="2,2"
              />
            </pattern>
            {/* 원목 마루 질감 패턴 */}
            <pattern
              id="woodFloor"
              width="60"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <rect width="60" height="20" fill="#f8fafc" />
              <line x1="0" y1="20" x2="60" y2="20" stroke="#e2e8f0" strokeWidth="0.8" />
              <line x1="30" y1="0" x2="30" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* 원룸 바깥 벽체 베벨 영역 */}
          <g transform={`translate(${padding}, ${padding})`}>
            {/* 방 바닥면 */}
            <rect
              x="0"
              y="0"
              width={template.width}
              height={template.depth}
              fill="url(#woodFloor)"
              rx="4"
            />
            {/* 모눈 그리드 오버레이 */}
            <rect
              x="0"
              y="0"
              width={template.width}
              height={template.depth}
              fill="url(#grid50)"
              opacity="0.6"
            />

            {/* 창문 렌더링 (자연 채광 및 바람 표시) */}
            {template.windows.map((win) => {
              if (win.wall === "top") {
                return (
                  <g key={win.id}>
                    {/* 창문 채광 그라디언트 빛 */}
                    <polygon
                      points={`${win.offset},0 ${win.offset + win.width},0 ${win.offset + win.width + 40},80 ${win.offset - 40},80`}
                      fill="#38bdf8"
                      opacity="0.12"
                    />
                    <rect
                      x={win.offset}
                      y="-4"
                      width={win.width}
                      height="8"
                      fill="#38bdf8"
                      rx="2"
                    />
                    <line
                      x1={win.offset}
                      y1="0"
                      x2={win.offset + win.width}
                      y2="0"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={win.offset + win.width / 2}
                      y="-12"
                      textAnchor="middle"
                      fill="#38bdf8"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      ☀️ 창문 채광 ({win.width}cm)
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* 문 렌더링 (열림 반경 호 Sweep Arc & 간섭 감지) */}
            {template.doors.map((door) => {
              const sweep = getDoorSweepBox(door, template.width, template.depth);
              const isBlocked = diagnostics.doorConflicts.some((c) => c.doorId === door.id);
              const arcColor = isBlocked ? "#ef4444" : "#10b981";
              const fillColor = isBlocked ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.1)";

              return (
                <g key={door.id}>
                  {/* 문 개폐 반경 영역 부채꼴 / 호 */}
                  {door.wall === "bottom" && (
                    <path
                      d={`M ${door.offset} ${template.depth} A ${door.width} ${door.width} 0 0 1 ${door.offset + door.width} ${template.depth - door.width} L ${door.offset + door.width} ${template.depth} Z`}
                      fill={fillColor}
                      stroke={arcColor}
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                  )}
                  {door.wall === "right" && (
                    <path
                      d={`M ${template.width} ${door.offset} A ${door.width} ${door.width} 0 0 0 ${template.width - door.width} ${door.offset + door.width} L ${template.width} ${door.offset + door.width} Z`}
                      fill={fillColor}
                      stroke={arcColor}
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                  )}
                  {door.wall === "left" && (
                    <path
                      d={`M 0 ${door.offset} A ${door.width} ${door.width} 0 0 1 ${door.width} ${door.offset + door.width} L 0 ${door.offset + door.width} Z`}
                      fill={fillColor}
                      stroke={arcColor}
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* 문 라벨 */}
                  <text
                    x={sweep.x + sweep.w / 2}
                    y={sweep.y + sweep.h / 2 + 4}
                    textAnchor="middle"
                    fill={arcColor}
                    fontSize="11"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {isBlocked ? `⚠️ ${door.name} 걸림!` : `${door.name} (${door.width}cm)`}
                  </text>
                </g>
              );
            })}

            {/* 배치된 가구 렌더링 */}
            {placed.map((item) => {
              const meta = getFurnitureById(item.furnitureId);
              if (!meta) return null;

              const box = getFurnitureBox(item);
              const isSelected = item.instanceId === selectedId;
              const hasCollision = diagnostics.collisions.some(
                (c) => c.instanceA === item.instanceId || c.instanceB === item.instanceId
              );
              const blocksDoor = diagnostics.doorConflicts.some(
                (c) => c.blockedByInstanceId === item.instanceId
              );
              const isOut = diagnostics.outOfBounds.includes(item.instanceId);
              const isAlert = hasCollision || blocksDoor || isOut;

              const isRug = item.furnitureId === "rug_circle";

              return (
                <g
                  key={item.instanceId}
                  transform={`translate(${box.x}, ${box.y})`}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  className="cursor-move group"
                >
                  {/* 가구 본체 (러그는 원형, 나머지는 둥근 사각형) */}
                  {isRug ? (
                    <circle
                      cx={box.w / 2}
                      cy={box.h / 2}
                      r={box.w / 2}
                      fill={meta.color}
                      stroke={isSelected ? "#3182f6" : meta.accentColor || "#cbd5e1"}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray="4,2"
                      opacity="0.85"
                    />
                  ) : (
                    <rect
                      x="0"
                      y="0"
                      width={box.w}
                      height={box.h}
                      rx="4"
                      fill={meta.color}
                      stroke={
                        isAlert
                          ? "#ef4444"
                          : isSelected
                            ? "#3182f6"
                            : meta.accentColor || "#64748b"
                      }
                      strokeWidth={isSelected || isAlert ? 3 : 1.5}
                      className={isAlert ? "animate-pulse" : ""}
                    />
                  )}

                  {/* 가구 세부 비주얼 디테일 (침대 베개, 책상 상판, 옷장 문틀) */}
                  {!isRug && (
                    <>
                      {meta.category === "bed" && (
                        /* 침대 베개 헤드 */
                        <rect
                          x="10"
                          y="8"
                          width={box.w - 20}
                          height="24"
                          rx="3"
                          fill="#ffffff"
                          opacity="0.85"
                        />
                      )}
                      {meta.category === "desk" && (
                        /* 책상 키보드 & 모니터 실루엣 */
                        <rect
                          x={box.w / 2 - 20}
                          y="6"
                          width="40"
                          height="8"
                          rx="1.5"
                          fill="#0f172a"
                          opacity="0.7"
                        />
                      )}
                      {meta.category === "storage" && (
                        /* 옷장/서랍장 분할선 */
                        <line
                          x1="0"
                          y1={box.h / 2}
                          x2={box.w}
                          y2={box.h / 2}
                          stroke="#ffffff"
                          strokeWidth="1"
                          opacity="0.4"
                        />
                      )}
                    </>
                  )}

                  {/* 가구 이름 및 치수 라벨 */}
                  <text
                    x={box.w / 2}
                    y={box.h / 2 - 2}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize={box.w < 60 || box.h < 40 ? "9" : "11"}
                    fontWeight="900"
                    className="select-none pointer-events-none drop-shadow-xs"
                  >
                    {meta.name.split(" ")[0]}
                  </text>
                  <text
                    x={box.w / 2}
                    y={box.h / 2 + 11}
                    textAnchor="middle"
                    fill="#475569"
                    fontSize="9"
                    fontWeight="bold"
                    className="select-none pointer-events-none"
                  >
                    {box.w}×{box.h}
                  </text>

                  {/* 선택된 경우 4개 모서리 포인트 */}
                  {isSelected && (
                    <>
                      <circle cx="0" cy="0" r="4" fill="#3182f6" />
                      <circle cx={box.w} cy="0" r="4" fill="#3182f6" />
                      <circle cx="0" cy={box.h} r="4" fill="#3182f6" />
                      <circle cx={box.w} cy={box.h} r="4" fill="#3182f6" />
                    </>
                  )}

                  {/* 충돌/간섭 경고 아이콘 */}
                  {isAlert && (
                    <g transform={`translate(${box.w - 18}, 4)`}>
                      <circle cx="8" cy="8" r="8" fill="#ef4444" />
                      <text
                        x="8"
                        y="12"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="black"
                      >
                        !
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 방 외곽 콘크리트 벽체 프레임 (두께 8px) */}
            <rect
              x="0"
              y="0"
              width={template.width}
              height={template.depth}
              fill="none"
              stroke="#0f172a"
              strokeWidth="6"
              rx="4"
            />
          </g>

          {/* 외곽 치수 안내 (가로 x 세로 cm 및 평수) */}
          <text
            x={svgWidth / 2}
            y="20"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
            fontWeight="bold"
          >
            ↔ 가로 {template.width} cm
          </text>
          <text
            x="15"
            y={svgHeight / 2}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
            fontWeight="bold"
            transform={`rotate(-90, 15, ${svgHeight / 2})`}
          >
            ↕ 세로 {template.depth} cm
          </text>
        </svg>

        {/* 캔버스 우하단 평수 배지 */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 shadow-lg">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>실평수 {template.py}평 ({template.sqm}㎡)</span>
        </div>
      </div>

      {/* 선택된 가구 퀵 조작 툴바 (회전 / 삭제 / 치수) */}
      {selectedItem && (
        <div className="w-full max-w-[420px] mt-2 p-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-between gap-2 animate-fade-in">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-gray-900 block truncate">
              {getFurnitureById(selectedItem.furnitureId)?.name}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              위치 ({selectedItem.x}, {selectedItem.y}) · 각도 {selectedItem.rotation}°
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onRotate(selectedItem.instanceId)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>90° 회전</span>
            </button>
            <button
              onClick={() => onDelete(selectedItem.instanceId)}
              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer active:scale-95"
              title="가구 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
