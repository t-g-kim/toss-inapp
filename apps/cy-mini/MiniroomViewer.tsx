/**
 * 싸이감성 미니홈피 - 레트로 도트 미니룸 뷰어 컴포넌트
 * - 2.5D 레트로 픽셀 도트 미니룸 (벽지, 바닥 장판, 조명)
 * - 애니메이션 도트 미니미 & 말풍선
 * - 가구/소품 배치 및 BGM 사운드웨이브 플레이어
 */

import React, { useState, useEffect } from "react";
import {
  MiniroomTheme,
  MinimiChar,
  BpmTrack,
} from "./data";
import { retroAudioSynth } from "./audioSynth";
import { Volume2, VolumeX, Sparkles, Heart, MessageSquare } from "lucide-react";

interface MiniroomViewerProps {
  theme: MiniroomTheme;
  minimi: MinimiChar;
  bgm: BpmTrack;
  moodText: string;
  placedProps: string[]; // prop IDs
  todayCount: number;
  totalCount: number;
  homeTitle: string;
  eggCount?: number;
  roomFrameBg?: string;
  wallTag?: string;
}

export const MiniroomViewer: React.FC<MiniroomViewerProps> = ({
  theme,
  minimi,
  bgm,
  moodText,
  placedProps,
  todayCount,
  totalCount,
  homeTitle,
  eggCount = 42,
  roomFrameBg,
  wallTag,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      retroAudioSynth.play(bgm.id);
    }
  }, [bgm.id, isPlaying]);

  const handleToggleSound = () => {
    if (isPlaying) {
      retroAudioSynth.stop();
      setIsPlaying(false);
    } else {
      retroAudioSynth.play(bgm.id);
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`w-full max-w-[420px] mx-auto p-2.5 rounded-2xl border transition-all duration-300 shadow-sm select-none font-sans ${
        roomFrameBg || "bg-[#f1f5f9] border-[#cbd5e1]"
      }`}
    >
      {/* 1. 미니홈피 클래식 헤더 바 (TODAY / TOTAL & BGM 플레이어 - 차분하고 정돈된 TDS 스타일) */}
      <div className="bg-white/95 px-3 py-1.5 rounded-xl border border-gray-200/90 mb-2 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-gray-700 whitespace-nowrap">
            <span className="text-orange-600 font-black">TODAY</span>
            <span>{todayCount.toLocaleString()}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">TOTAL</span>
            <span>{totalCount.toLocaleString()}</span>
          </div>
        </div>

        {/* 상단 미니 BGM 플레이어 (단정하고 눈 편한 디자인) */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition max-w-[190px]"
          title="BGM 일시정지 / 재생"
        >
          {isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-orange-600 shrink-0 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          )}
          <span className="text-[10px] font-bold text-gray-700 truncate">
            {bgm.title}
          </span>
          {isPlaying && (
            <div className="flex items-end gap-0.5 h-2.5 shrink-0">
              <span className="w-0.5 bg-orange-500 h-2 animate-bounce" />
              <span className="w-0.5 bg-orange-500 h-3 animate-pulse" />
              <span className="w-0.5 bg-orange-500 h-1.5 animate-bounce" />
            </div>
          )}
        </button>
      </div>

      {/* 2. 메인 미니룸 그래픽 캔버스 */}
      <div
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-black/15 shadow-inner flex flex-col justify-between p-3"
        style={{ backgroundColor: theme.wallColor }}
      >
        {/* 상단 미니룸 타이틀 & 오리알 뱃지 */}
        <div className="flex items-center justify-between z-10">
          <div className="px-2.5 py-0.5 bg-white/90 backdrop-blur-xs rounded-full border border-gray-300/80 shadow-2xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span className="text-[11px] font-black text-gray-800 truncate max-w-[190px]">
              {homeTitle}
            </span>
          </div>

          <div className="px-2 py-0.5 bg-white/90 backdrop-blur-xs rounded-full text-[10px] font-black text-amber-800 border border-amber-200 shadow-2xs flex items-center gap-0.5">
            <span>🥚 {eggCount}</span>
          </div>
        </div>

        {/* 룸 상단 벽면 시그니처 사인 (친구마다 고유하게 표시!) */}
        {wallTag && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/45 backdrop-blur-xs rounded-full border border-white/20 text-[10px] font-black text-white/95 shadow-2xs tracking-wide z-5">
            {wallTag}
          </div>
        )}

        {/* 미니룸 바닥면 (원목/타일 사선 투시 원근감) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[48%] border-t-2 border-black/20 shadow-md"
          style={{
            backgroundColor: theme.floorColor,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,0,0,0.06) 15px, rgba(0,0,0,0.06) 30px)`,
          }}
        />

        {/* 룸 후면 벽면 몰딩 라인 */}
        <div className="absolute top-[52%] left-0 right-0 h-1 bg-black/15 opacity-40" />

        {/* 배치된 가구/소품 렌더링 (도트 그래픽 박스) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* 좌측 소품: CRT 모니터 PC */}
          {placedProps.includes("crt_pc") && (
            <div className="absolute bottom-8 left-3 flex flex-col items-center">
              <svg viewBox="0 0 44 44" className="w-11 h-11 drop-shadow-md">
                <rect x="4" y="6" width="36" height="28" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
                <rect x="8" y="10" width="28" height="20" rx="2" fill="#0284c7" />
                <rect x="10" y="12" width="24" height="16" fill="#38bdf8" opacity="0.6" />
                <rect x="18" y="34" width="8" height="6" fill="#94a3b8" />
                <rect x="12" y="38" width="20" height="4" rx="1" fill="#64748b" />
              </svg>
            </div>
          )}

          {/* 좌측 소품: 턴테이블 */}
          {placedProps.includes("turntable") && (
            <div className="absolute bottom-6 left-16 flex flex-col items-center">
              <svg viewBox="0 0 40 36" className="w-10 h-9 drop-shadow-md">
                <rect x="2" y="10" width="36" height="22" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
                <circle cx="18" cy="21" r="9" fill="#0f172a" />
                <circle cx="18" cy="21" r="3" fill="#ef4444" />
                <line x1="30" y1="13" x2="22" y2="21" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}

          {/* 좌측 소품: 몬스테라 화분 */}
          {placedProps.includes("room_plant") && (
            <div className="absolute bottom-8 left-14 flex flex-col items-center">
              <span className="text-2xl drop-shadow-md select-none">🪴</span>
            </div>
          )}

          {/* 우측 소품: 체크무늬 침대 */}
          {placedProps.includes("retro_bed") && (
            <div className="absolute bottom-8 right-2 flex flex-col items-center">
              <svg viewBox="0 0 65 45" className="w-16 h-11 drop-shadow-md">
                <rect x="4" y="12" width="56" height="28" rx="3" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
                <rect x="8" y="15" width="48" height="22" rx="2" fill="#f8fafc" />
                <rect x="40" y="16" width="14" height="12" rx="2" fill="#fed7aa" />
                <rect x="4" y="8" width="6" height="32" rx="1" fill="#78350f" />
              </svg>
            </div>
          )}

          {/* 우측 소품: 원목 공부 책상 */}
          {placedProps.includes("diary_desk") && (
            <div className="absolute bottom-7 right-14 flex flex-col items-center">
              <span className="text-2xl drop-shadow-md select-none">🪑</span>
            </div>
          )}

          {/* 우측 소품: 전신 거울 */}
          {placedProps.includes("stand_mirror") && (
            <div className="absolute bottom-8 right-16 flex flex-col items-center">
              <span className="text-2xl drop-shadow-md select-none">🪞</span>
            </div>
          )}

          {/* 우측 소품: 곰인형 */}
          {placedProps.includes("teddy_bear") && (
            <div className="absolute bottom-6 right-20 flex flex-col items-center">
              <span className="text-2xl drop-shadow-md select-none">🧸</span>
            </div>
          )}

          {/* 우측 소품: 통기타 */}
          {placedProps.includes("guitar") && (
            <div className="absolute bottom-9 right-3 flex flex-col items-center">
              <span className="text-2xl drop-shadow-md select-none">🎸</span>
            </div>
          )}
        </div>

        {/* 중앙 미니미 캐릭터 & 감성 말풍선 */}
        <div className="absolute left-1/2 bottom-5 -translate-x-1/2 z-20 flex flex-col items-center">
          {/* 말풍선 */}
          <div className="mb-1.5 px-3 py-1.5 bg-white border border-gray-700/80 rounded-2xl shadow-sm text-center max-w-[240px] animate-fade-in relative">
            <p className="text-[11px] font-bold text-gray-800 leading-tight">
              {moodText}
            </p>
            {/* 말풍선 꼬리 */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-700 rotate-45" />
          </div>

          {/* 미니미 도트 캐릭터 SVG (캐릭터 타입별 커스텀 렌더링!) */}
          <div className="relative group cursor-pointer transition hover:scale-105 active:scale-95">
            <svg viewBox="0 0 40 50" className="w-14 h-18 drop-shadow-md">
              {/* 그림자 */}
              <ellipse cx="20" cy="47" rx="12" ry="3" fill="#000000" opacity="0.25" />

              {/* 얼굴 베이스 */}
              <circle cx="20" cy="18" r="11" fill="#fde047" stroke="#0f172a" strokeWidth="1.5" />
              <circle cx="16" cy="19" r="1.5" fill="#0f172a" />
              <circle cx="24" cy="19" r="1.5" fill="#0f172a" />
              <ellipse cx="14" cy="22" rx="2" ry="1" fill="#fb7185" opacity="0.7" />
              <ellipse cx="26" cy="22" rx="2" ry="1" fill="#fb7185" opacity="0.7" />

              {/* 1. 소녀 미니미 (girl) */}
              {minimi.dotArt === "girl" && (
                <>
                  {/* 단발 헤어 & 리본 */}
                  <path d="M 8 18 Q 20 6 32 18 Q 30 11 20 11 Q 10 11 8 18 Z" fill="#451a03" />
                  <circle cx="20" cy="8" r="3" fill="#ec4899" />
                  {/* 교복 상의 & 넥타이 */}
                  <rect x="13" y="29" width="14" height="10" rx="1" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="20" y1="29" x2="20" y2="35" stroke="#ec4899" strokeWidth="2" />
                  {/* 치마 */}
                  <path d="M 12 39 L 28 39 L 30 45 L 10 45 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="16.5" cy="47" r="2" fill="#1e293b" />
                  <circle cx="23.5" cy="47" r="2" fill="#1e293b" />
                </>
              )}

              {/* 2. 락스타 미니미 (rocker) */}
              {minimi.dotArt === "rocker" && (
                <>
                  {/* 뾰족 락커 헤어 */}
                  <path d="M 7 15 L 13 6 L 20 9 L 27 6 L 33 15 Q 20 10 7 15 Z" fill="#171717" />
                  {/* 가죽 자켓 */}
                  <rect x="12" y="29" width="16" height="12" rx="1" fill="#09090b" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="16" y1="31" x2="16" y2="39" stroke="#94a3b8" strokeWidth="1.5" />
                  <rect x="14" y="40" width="5" height="7" fill="#18181b" />
                  <rect x="21" y="40" width="5" height="7" fill="#18181b" />
                  <circle cx="16.5" cy="47" r="2.5" fill="#ffffff" />
                  <circle cx="23.5" cy="47" r="2.5" fill="#ffffff" />
                </>
              )}

              {/* 3. 힙합 미니미 (hiphop) */}
              {minimi.dotArt === "hiphop" && (
                <>
                  {/* 비뚤게 쓴 스냅백 모자 */}
                  <path d="M 8 13 Q 20 5 32 13 Z" fill="#ea580c" />
                  <rect x="6" y="11" width="16" height="3" rx="1.5" fill="#f97316" />
                  {/* 오버핏 후드 & 골드 체인 */}
                  <rect x="11" y="28" width="18" height="13" rx="2" fill="#3f3f46" stroke="#0f172a" strokeWidth="1.5" />
                  <circle cx="20" cy="33" r="2" fill="#facc15" />
                  {/* 힙합 통바지 */}
                  <rect x="12" y="40" width="7" height="6" fill="#1e293b" />
                  <rect x="21" y="40" width="7" height="6" fill="#1e293b" />
                  <circle cx="15.5" cy="47" r="2.5" fill="#fbbf24" />
                  <circle cx="24.5" cy="47" r="2.5" fill="#fbbf24" />
                </>
              )}

              {/* 4. 고양이 잠옷 미니미 (cat) */}
              {minimi.dotArt === "cat" && (
                <>
                  {/* 냥이 귀 후드 */}
                  <polygon points="10,12 14,4 17,11" fill="#fda4af" stroke="#0f172a" strokeWidth="1" />
                  <polygon points="30,12 26,4 23,11" fill="#fda4af" stroke="#0f172a" strokeWidth="1" />
                  <path d="M 8 17 Q 20 7 32 17 Z" fill="#fbcfe8" />
                  {/* 잠옷 원피스 */}
                  <rect x="12" y="28" width="16" height="15" rx="3" fill="#fce7f3" stroke="#0f172a" strokeWidth="1.5" />
                  <circle cx="16.5" cy="46" r="2" fill="#fb7185" />
                  <circle cx="23.5" cy="46" r="2" fill="#fb7185" />
                </>
              )}

              {/* 5. 기본 소년 미니미 (boy) */}
              {minimi.dotArt === "boy" && (
                <>
                  {/* 단정 헤어 & 헤드폰 */}
                  <path d="M 9 17 Q 20 8 31 17 Q 28 10 20 10 Q 12 10 9 17 Z" fill="#78350f" />
                  <rect x="7" y="15" width="4" height="8" rx="2" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
                  <rect x="29" y="15" width="4" height="8" rx="2" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
                  <path d="M 9 15 Q 20 5 31 15" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                  {/* 파란 옷 & 바지 */}
                  <rect x="13" y="29" width="14" height="12" rx="2" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                  <rect x="14" y="39" width="5" height="7" fill="#1e293b" />
                  <rect x="21" y="39" width="5" height="7" fill="#1e293b" />
                  <circle cx="16.5" cy="46" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="23.5" cy="46" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
                </>
              )}
            </svg>
          </div>

          <span className="text-[10px] font-black text-gray-700 bg-white/90 px-2 py-0.5 rounded-full border border-gray-200 mt-1 shadow-2xs">
            {minimi.name}
          </span>
        </div>
      </div>
    </div>
  );
};
