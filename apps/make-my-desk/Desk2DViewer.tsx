import React, { useState } from "react";
import { DeskBuildState, getPartOption } from "./engine";
import { Sun, Moon, Sparkles, RefreshCw } from "lucide-react";

interface Desk2DViewerProps {
  build: DeskBuildState;
  score: number;
}

export const Desk2DViewer: React.FC<Desk2DViewerProps> = ({ build, score }) => {
  const [isNightMode, setIsNightMode] = useState(false);

  const desk = getPartOption("desk", build.desk);
  const monitor = getPartOption("monitor", build.monitor);
  const arm = getPartOption("monitorArm", build.monitorArm);
  const chair = getPartOption("chair", build.chair);
  const km = getPartOption("keyboardMouse", build.keyboardMouse);
  const light = getPartOption("lightingMat", build.lightingMat);

  // Dynamic desk styling
  const deskColor = desk?.color || "wood";
  const deskWidthMm = desk?.deskWidth || 1400;
  const isMotionDesk = desk?.isMotionDesk || false;

  // Monitor layout properties
  const monType = monitor?.monitorType || "single";
  const monSize = monitor?.monitorSize || 27;

  // Lighting properties
  const hasScreenBar = light?.lightType === "screenbar";
  const hasAmbient = light?.lightType === "ambient";
  const isRgbMat = light?.id === "lm_rgb_gaming_mat";

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border transition-all duration-500 select-none shadow-md ${
        isNightMode
          ? "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-800 text-white"
          : "bg-gradient-to-b from-sky-50/70 via-white to-gray-50 border-gray-200 text-gray-800"
      }`}
    >
      {/* Top Controller Bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 backdrop-blur-md shadow-xs ${
              isNightMode
                ? "bg-slate-800/90 text-amber-300 border border-slate-700"
                : "bg-white/90 text-blue-600 border border-blue-100"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            {desk?.name.split(" ")[0]} 셋업 ({deskWidthMm}mm)
          </span>
          {isMotionDesk && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 backdrop-blur-md">
              전동 높이조절
            </span>
          )}
        </div>

        <button
          onClick={() => setIsNightMode(!isNightMode)}
          className={`pointer-events-auto px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
            isNightMode
              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30"
              : "bg-slate-800 text-white hover:bg-slate-700"
          }`}
        >
          {isNightMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>낮 모드</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              <span>밤 감성 모드</span>
            </>
          )}
        </button>
      </div>

      {/* SVG Canvas Stage */}
      <div className="w-full aspect-[4/3] sm:aspect-[16/10] relative flex items-center justify-center pt-8 pb-4">
        <svg
          viewBox="0 0 600 420"
          className="w-full h-full max-h-[380px]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient Lighting Gradient */}
            <radialGradient id="ambientGlow" cx="50%" cy="40%" r="55%">
              <stop
                offset="0%"
                stopColor={
                  hasAmbient
                    ? isNightMode
                      ? "#a855f7"
                      : "#38bdf8"
                    : "#60a5fa"
                }
                stopOpacity={isNightMode ? (hasAmbient ? "0.6" : "0.2") : "0.15"}
              />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* ScreenBar Light Cone */}
            <linearGradient id="screenBarCone" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity={isNightMode ? "0.7" : "0.35"} />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
            </linearGradient>

            {/* Desk Wood Texture / Colors */}
            <linearGradient id="deskWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2b17a" />
              <stop offset="100%" stopColor="#c59154" />
            </linearGradient>
            <linearGradient id="deskWhite" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
            <linearGradient id="deskBlack" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#18181b" />
            </linearGradient>

            {/* Screen Wallpaper */}
            <linearGradient id="screenArt" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* 1. Background Ambient Aura */}
          {(hasAmbient || isNightMode) && (
            <ellipse cx="300" cy="180" rx="260" ry="160" fill="url(#ambientGlow)" />
          )}

          {/* Wall Baseboard Line */}
          <line
            x1="20"
            y1="340"
            x2="580"
            y2="340"
            stroke={isNightMode ? "#334155" : "#e2e8f0"}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* 2. Monitor Arm Joint & Pole */}
          <g id="monitorArmGroup">
            {/* Base Clamp */}
            <rect
              x="288"
              y="235"
              width="24"
              height="22"
              rx="3"
              fill={deskColor === "white" ? "#cbd5e1" : "#0f172a"}
              stroke="#64748b"
              strokeWidth="1"
            />
            {/* Pole / Articulated Arm */}
            <path
              d="M 300 240 L 300 200 L 275 165 L 300 150"
              stroke={deskColor === "white" ? "#94a3b8" : "#334155"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {arm?.armType === "dual" && (
              <path
                d="M 300 180 L 325 165 L 300 150"
                stroke={deskColor === "white" ? "#94a3b8" : "#334155"}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* 3. ScreenBar Light Cone Casting over Desk */}
          {hasScreenBar && (
            <polygon
              points="240,110 360,110 430,260 170,260"
              fill="url(#screenBarCone)"
              className="pointer-events-none transition-opacity duration-300"
            />
          )}

          {/* 4. Monitor & Display Layout */}
          <g id="monitorGroup">
            {/* A: Dual Monitor Mode */}
            {monType === "dual" && (
              <>
                {/* Left Monitor (Pivoted / Angled) */}
                <rect
                  x="150"
                  y="90"
                  width="135"
                  height="95"
                  rx="6"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <rect x="154" y="94" width="127" height="87" rx="3" fill="url(#screenArt)" />
                {/* Right Monitor */}
                <rect
                  x="300"
                  y="90"
                  width="135"
                  height="95"
                  rx="6"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <rect x="304" y="94" width="127" height="87" rx="3" fill="#1e293b" />
                {/* Editor lines on right screen */}
                <line x1="315" y1="108" x2="380" y2="108" stroke="#38bdf8" strokeWidth="3" />
                <line x1="315" y1="120" x2="410" y2="120" stroke="#f43f5e" strokeWidth="3" />
                <line x1="315" y1="132" x2="360" y2="132" stroke="#10b981" strokeWidth="3" />
                <line x1="315" y1="144" x2="395" y2="144" stroke="#eab308" strokeWidth="3" />
              </>
            )}

            {/* B: 34-inch Ultrawide Curved Mode */}
            {monType === "ultrawide" && (
              <>
                <rect
                  x="160"
                  y="95"
                  width="280"
                  height="98"
                  rx="8"
                  fill="#090d16"
                  stroke={isNightMode ? "#818cf8" : "#0284c7"}
                  strokeWidth="2.5"
                />
                <rect x="165" y="100" width="270" height="88" rx="5" fill="url(#screenArt)" />
                {/* Ultrawide 3-column app mockups */}
                <rect x="175" y="108" width="75" height="72" rx="3" fill="#000000" fillOpacity="0.35" />
                <rect x="258" y="108" width="85" height="72" rx="3" fill="#000000" fillOpacity="0.35" />
                <rect x="351" y="108" width="75" height="72" rx="3" fill="#000000" fillOpacity="0.35" />
              </>
            )}

            {/* C: Single Standard 27" / 32" Mode */}
            {monType === "single" && (
              <>
                {/* Monitor Frame */}
                <rect
                  x={monSize === 32 ? "190" : "205"}
                  y={monSize === 32 ? "85" : "98"}
                  width={monSize === 32 ? "220" : "190"}
                  height={monSize === 32 ? "130" : "115"}
                  rx="7"
                  fill="#0a0e17"
                  stroke={deskColor === "white" ? "#94a3b8" : "#3b82f6"}
                  strokeWidth="2"
                />
                {/* Screen Content */}
                <rect
                  x={monSize === 32 ? "195" : "210"}
                  y={monSize === 32 ? "90" : "103"}
                  width={monSize === 32 ? "210" : "180"}
                  height={monSize === 32 ? "120" : "105"}
                  rx="4"
                  fill="url(#screenArt)"
                />
              </>
            )}

            {/* ScreenBar Hardware attached on top of monitor */}
            {hasScreenBar && (
              <g id="screenBarFixture">
                <rect x="250" y="88" width="100" height="7" rx="3" fill="#334155" />
                <rect
                  x="255"
                  y="92"
                  width="90"
                  height="3"
                  rx="1"
                  fill="#fef08a"
                  className={isNightMode ? "animate-pulse" : ""}
                />
              </g>
            )}
          </g>

          {/* 5. Desk Tabletop & Legs */}
          <g id="deskGroup">
            {/* Tabletop Surface (Width responsive: 1200=460px, 1400=500px, 1600=540px) */}
            {(() => {
              const svgW = deskWidthMm >= 1600 ? 530 : deskWidthMm >= 1400 ? 490 : 440;
              const svgX = 300 - svgW / 2;
              const fillSource =
                deskColor === "white"
                  ? "url(#deskWhite)"
                  : deskColor === "black"
                  ? "url(#deskBlack)"
                  : "url(#deskWood)";

              return (
                <>
                  {/* Tabletop Perspective Chamfer */}
                  <polygon
                    points={`${svgX + 15},240 ${svgX + svgW - 15},240 ${svgX + svgW},255 ${svgX},255`}
                    fill={fillSource}
                    filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.15))"
                  />
                  {/* Tabletop Front Edge */}
                  <rect
                    x={svgX}
                    y="255"
                    width={svgW}
                    height="14"
                    rx="3"
                    fill={deskColor === "white" ? "#d1d5db" : deskColor === "black" ? "#09090b" : "#a16207"}
                  />

                  {/* Desk Legs (2 Columns or T-Shape Motion Legs) */}
                  {/* Left Leg */}
                  <rect
                    x={svgX + 35}
                    y="269"
                    width={isMotionDesk ? "18" : "12"}
                    height="105"
                    rx="3"
                    fill={deskColor === "white" ? "#e2e8f0" : "#1e293b"}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  {/* Left Foot */}
                  <rect
                    x={svgX + 20}
                    y="370"
                    width="48"
                    height="8"
                    rx="3"
                    fill={deskColor === "white" ? "#cbd5e1" : "#0f172a"}
                  />

                  {/* Right Leg */}
                  <rect
                    x={svgX + svgW - (isMotionDesk ? 53 : 47)}
                    y="269"
                    width={isMotionDesk ? "18" : "12"}
                    height="105"
                    rx="3"
                    fill={deskColor === "white" ? "#e2e8f0" : "#1e293b"}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  {/* Right Foot */}
                  <rect
                    x={svgX + svgW - 68}
                    y="370"
                    width="48"
                    height="8"
                    rx="3"
                    fill={deskColor === "white" ? "#cbd5e1" : "#0f172a"}
                  />
                </>
              );
            })()}
          </g>

          {/* 6. Desk Mat, Keyboard, Mouse, and Accessories */}
          <g id="deskTopItems">
            {/* Desk Mat (Center bottom of desk) */}
            <rect
              x="200"
              y="244"
              width="200"
              height="18"
              rx="4"
              fill={
                isRgbMat
                  ? "#0284c7"
                  : light?.id === "lm_felt_wool_mat"
                  ? "#475569"
                  : "#18181b"
              }
              stroke={isRgbMat ? "#f43f5e" : "#000000"}
              strokeWidth={isRgbMat ? "1.5" : "0.5"}
            />

            {/* Keyboard */}
            <rect
              x="230"
              y="246"
              width="85"
              height="12"
              rx="2.5"
              fill={km?.keyboardType === "wireless" ? "#e2e8f0" : "#0f172a"}
              stroke="#64748b"
              strokeWidth="0.8"
            />
            {/* Keycap lines */}
            <line x1="235" y1="252" x2="310" y2="252" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />

            {/* Mouse */}
            <rect
              x="345"
              y="247"
              width="14"
              height="10"
              rx="5"
              fill={km?.id?.includes("white") ? "#ffffff" : "#0f172a"}
              stroke="#64748b"
              strokeWidth="0.8"
            />

            {/* MagSafe 3-in-1 or Acc item on desk right side */}
            <rect x="420" y="243" width="16" height="15" rx="3" fill="#94a3b8" />
            <line x1="428" y1="243" x2="428" y2="230" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="428" cy="230" r="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* 7. Ergonomic Chair Silhouette (Front Layer) */}
          <g id="chairGroup" opacity="0.95">
            {/* Chair Backrest */}
            <rect
              x="265"
              y="275"
              width="70"
              height="80"
              rx="12"
              fill={chair?.chairType === "mesh" ? "#1e293b" : "#0f172a"}
              stroke={deskColor === "white" ? "#cbd5e1" : "#475569"}
              strokeWidth="1.5"
            />
            {/* Headrest */}
            <rect
              x="285"
              y="255"
              width="30"
              height="14"
              rx="6"
              fill="#0f172a"
              stroke="#64748b"
              strokeWidth="1"
            />
            {/* Lumbar Spine Accent */}
            <line x1="275" y1="315" x2="325" y2="315" stroke="#3b82f6" strokeWidth="2.5" />
            {/* Chair Stem & 5-Star Wheels Base */}
            <rect x="296" y="355" width="8" height="30" fill="#334155" />
            <ellipse cx="300" cy="388" rx="42" ry="7" fill="#0f172a" />
          </g>
        </svg>
      </div>

      {/* Bottom Setup Indicators */}
      <div
        className={`px-4 py-2.5 border-t flex items-center justify-between text-xs ${
          isNightMode
            ? "bg-slate-900/90 border-slate-800 text-slate-300"
            : "bg-white/80 border-gray-100 text-gray-600"
        }`}
      >
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-bold text-toss-blue">{monitor?.brand} {monSize}"</span>
          <span>·</span>
          <span>{arm?.brand} {arm?.armType === "dual" ? "듀얼암" : "암"}</span>
          <span>·</span>
          <span>{chair?.brand}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-gray-400">호환 점수</span>
          <span
            className={`font-black text-xs px-2 py-0.5 rounded-full ${
              score >= 90
                ? "bg-emerald-500/20 text-emerald-400"
                : score >= 70
                ? "bg-amber-500/20 text-amber-400"
                : "bg-rose-500/20 text-rose-400"
            }`}
          >
            {score}점
          </span>
        </div>
      </div>
    </div>
  );
};
