/**
 * 싸이감성 미니홈피 - 레트로 도트 미니룸 뷰어 컴포넌트 (v1.1 인터랙티브 에디션)
 * - 12종 전체 가구/소품 커스텀 픽셀 도트 SVG 렌더링
 * - 7종 미니미 캐릭터 도트 SVG & 터치 감정표현/점프 인터랙션
 * - 드래그 앤 드롭(터치/마우스) 자유 배치 편집 모드 & 좌우 반전 지원
 * - 소품 터치 시 네이트온 쪽지/LP 재생/강아지 짓기 등 추억의 반응 토스트
 */

import React, { useState, useEffect, useRef } from "react";
import {
  MiniroomTheme,
  MinimiChar,
  BpmTrack,
  MINIROOM_PROPS,
  PropPosition,
  DEFAULT_PROP_POSITIONS,
} from "./data";
import { retroAudioSynth } from "./audioSynth";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Move,
  RotateCcw,
  FlipHorizontal,
  Check,
} from "lucide-react";

interface MiniroomViewerProps {
  theme: MiniroomTheme;
  minimi: MinimiChar;
  bgm: BpmTrack;
  moodText: string;
  placedProps: string[];
  propPositions?: Record<string, PropPosition>;
  minimiPosition?: PropPosition;
  onUpdatePropPosition?: (propId: string, pos: PropPosition) => void;
  onUpdateMinimiPosition?: (pos: PropPosition) => void;
  onResetPositions?: () => void;
  todayCount: number;
  totalCount: number;
  homeTitle: string;
  eggCount?: number;
  roomFrameBg?: string;
  wallTag?: string;
  editable?: boolean;
  vipFont?: boolean;
}

const MINIMI_EMOTES = [
  { id: "default", badge: "✨", label: "기본" },
  { id: "love", badge: "💓", label: "설렘" },
  { id: "cry", badge: "💧", label: "센치" },
  { id: "music", badge: "🎵", label: "리듬" },
  { id: "fire", badge: "🔥", label: "열정" },
];

export const MiniroomViewer: React.FC<MiniroomViewerProps> = ({
  theme,
  minimi,
  bgm,
  moodText,
  placedProps,
  propPositions = DEFAULT_PROP_POSITIONS,
  minimiPosition = { x: 50, y: 82, flip: false },
  onUpdatePropPosition,
  onUpdateMinimiPosition,
  onResetPositions,
  todayCount,
  totalCount,
  homeTitle,
  eggCount = 42,
  roomFrameBg,
  wallTag,
  editable = true,
  vipFont = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null); // propId or "minimi"
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [interactToast, setInteractToast] = useState<string | null>(null);
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const [emoteIdx, setEmoteIdx] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [windowWeather, setWindowWeather] = useState<"day" | "night" | "rain" | "snow">("night");

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      retroAudioSynth.play(bgm.id);
    }
  }, [bgm.id, isPlaying]);

  const showToast = (msg: string) => {
    setInteractToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setInteractToast(null);
    }, 2400);
  };

  const handleToggleSound = () => {
    if (isPlaying) {
      retroAudioSynth.stop();
      setIsPlaying(false);
    } else {
      retroAudioSynth.play(bgm.id);
      setIsPlaying(true);
      showToast(`🎵 재생 중: ${bgm.title} - ${bgm.artist}`);
    }
  };

  const handlePropClick = (propId: string) => {
    if (isEditMode) {
      setSelectedTarget(propId);
      retroAudioSynth.playSfx("pop");
      return;
    }

    const meta = MINIROOM_PROPS.find((p) => p.id === propId);
    setBouncingId(propId);
    window.setTimeout(() => setBouncingId(null), 450);

    if (propId === "turntable") {
      handleToggleSound();
      return;
    }
    if (propId === "rain_window") {
      const modes: Array<"day" | "night" | "rain" | "snow"> = ["day", "night", "rain", "snow"];
      const next = modes[(modes.indexOf(windowWeather) + 1) % modes.length];
      setWindowWeather(next);
      retroAudioSynth.playSfx("pop");
      const labels = { day: "☀️ 맑은 오후", night: "🌙 별이 빛나는 밤", rain: "🌧️ 센치한 빗소리", snow: "☃️ 첫눈 내리는 밤" };
      showToast(`🪟 창밖 풍경이 [${labels[next]}] 모드로 바뀌었어요!`);
      return;
    }
    if (propId === "retro_puppy") {
      retroAudioSynth.playSfx("bark");
    } else if (propId === "arcade_machine") {
      retroAudioSynth.playSfx("coin");
    } else {
      retroAudioSynth.playSfx("pop");
    }

    if (meta?.interactMsg) {
      showToast(meta.interactMsg);
    }
  };

  const handleMinimiClick = () => {
    if (isEditMode) {
      setSelectedTarget("minimi");
      retroAudioSynth.playSfx("pop");
      return;
    }
    retroAudioSynth.playSfx("jump");
    setIsJumping(true);
    const nextIdx = (emoteIdx + 1) % MINIMI_EMOTES.length;
    setEmoteIdx(nextIdx);
    window.setTimeout(() => setIsJumping(false), 500);
    const emote = MINIMI_EMOTES[nextIdx];
    showToast(`${emote.badge} ${minimi.name}: "${moodText}" (${emote.label} 모드)`);
  };

  // 포인터 드래그 핸들러
  const handlePointerDown = (e: React.PointerEvent, targetId: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(targetId);
    setSelectedTarget(targetId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditMode || !draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.max(8, Math.min(92, Math.round(rawX)));
    const clampedY = Math.max(22, Math.min(92, Math.round(rawY)));

    if (draggingId === "minimi") {
      onUpdateMinimiPosition?.({
        ...minimiPosition,
        x: clampedX,
        y: clampedY,
      });
    } else {
      const current = propPositions[draggingId] || DEFAULT_PROP_POSITIONS[draggingId] || { x: 50, y: 70 };
      onUpdatePropPosition?.(draggingId, {
        ...current,
        x: clampedX,
        y: clampedY,
      });
    }
  };

  const handlePointerUp = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };

  const handleFlipSelected = () => {
    if (!selectedTarget) return;
    retroAudioSynth.playSfx("pop");
    if (selectedTarget === "minimi") {
      onUpdateMinimiPosition?.({
        ...minimiPosition,
        flip: !minimiPosition.flip,
      });
    } else {
      const cur = propPositions[selectedTarget] || DEFAULT_PROP_POSITIONS[selectedTarget] || { x: 50, y: 70 };
      onUpdatePropPosition?.(selectedTarget, {
        ...cur,
        flip: !cur.flip,
      });
    }
  };

  // 소품별 커스텀 픽셀/도트 그래픽 SVG 렌더러
  const renderPropSvg = (propId: string) => {
    switch (propId) {
      case "crt_pc":
        return (
          <svg viewBox="0 0 48 44" className="w-12 h-11 drop-shadow-md">
            {/* 책상 받침 */}
            <rect x="4" y="34" width="40" height="8" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
            {/* CRT 모니터 본체 */}
            <rect x="7" y="4" width="34" height="26" rx="3" fill="#e2e8f0" stroke="#334155" strokeWidth="1.5" />
            <rect x="10" y="7" width="28" height="19" rx="2" fill="#0284c7" stroke="#1e293b" strokeWidth="1" />
            {/* 메신저 창 그래픽 */}
            <rect x="12" y="9" width="16" height="11" rx="1" fill="#f8fafc" />
            <rect x="12" y="9" width="16" height="3" fill="#f97316" />
            <line x1="14" y1="14" x2="24" y2="14" stroke="#64748b" strokeWidth="1.5" />
            <line x1="14" y1="17" x2="21" y2="17" stroke="#94a3b8" strokeWidth="1.5" />
            {/* 전원 불빛 */}
            <circle cx="35" cy="27.5" r="1.2" fill="#22c55e" />
            {/* 모니터 받침 & 키보드 */}
            <rect x="19" y="30" width="10" height="4" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <rect x="11" y="34" width="26" height="3.5" rx="1" fill="#f1f5f9" stroke="#475569" strokeWidth="1" />
          </svg>
        );

      case "turntable":
        return (
          <svg viewBox="0 0 44 38" className="w-11 h-10 drop-shadow-md">
            <rect x="3" y="10" width="38" height="24" rx="3" fill="#b45309" stroke="#451a03" strokeWidth="1.5" />
            <rect x="5" y="12" width="34" height="20" rx="2" fill="#d97706" />
            {/* 회전하는 LP 레코드판 */}
            <g className={isPlaying ? " origin-[19px_22px] animate-spin" : ""}>
              <circle cx="19" cy="22" r="9" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              <circle cx="19" cy="22" r="6" fill="none" stroke="#334155" strokeWidth="0.6" strokeDasharray="2 2" />
              <circle cx="19" cy="22" r="3" fill="#ef4444" />
              <circle cx="19" cy="22" r="1" fill="#f8fafc" />
            </g>
            {/* 톤암 바늘 */}
            <circle cx="34" cy="15" r="2.2" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <line
              x1="34"
              y1="15"
              x2={isPlaying ? "24" : "32"}
              y2={isPlaying ? "22" : "26"}
              stroke="#f1f5f9"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {isPlaying && (
              <text x="8" y="8" fontSize="8" fill="#ea580c" fontWeight="bold">
                ♪ ♬
              </text>
            )}
          </svg>
        );

      case "retro_bed":
        return (
          <svg viewBox="0 0 68 46" className="w-17 h-12 drop-shadow-md">
            {/* 침대 헤드보드 */}
            <rect x="4" y="6" width="8" height="36" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            {/* 매트리스 베이스 */}
            <rect x="10" y="16" width="54" height="24" rx="3" fill="#fff7ed" stroke="#451a03" strokeWidth="1.5" />
            {/* 베개 */}
            <rect x="13" y="18" width="14" height="10" rx="2.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
            {/* 오렌지 체크무늬 이불 */}
            <rect x="26" y="17" width="37" height="22" rx="2.5" fill="#fb923c" stroke="#9a3412" strokeWidth="1.2" />
            <line x1="38" y1="17" x2="38" y2="39" stroke="#fed7aa" strokeWidth="2" opacity="0.7" />
            <line x1="50" y1="17" x2="50" y2="39" stroke="#fed7aa" strokeWidth="2" opacity="0.7" />
            <line x1="26" y1="25" x2="63" y2="25" stroke="#fed7aa" strokeWidth="2" opacity="0.7" />
            <line x1="26" y1="33" x2="63" y2="33" stroke="#fed7aa" strokeWidth="2" opacity="0.7" />
          </svg>
        );

      case "teddy_bear":
        return (
          <svg viewBox="0 0 40 44" className="w-10 h-11 drop-shadow-md">
            {/* 귀 */}
            <circle cx="11" cy="10" r="4.5" fill="#b45309" stroke="#451a03" strokeWidth="1.4" />
            <circle cx="11" cy="10" r="2.2" fill="#fde68a" />
            <circle cx="29" cy="10" r="4.5" fill="#b45309" stroke="#451a03" strokeWidth="1.4" />
            <circle cx="29" cy="10" r="2.2" fill="#fde68a" />
            {/* 몸통 & 팔다리 */}
            <ellipse cx="20" cy="31" rx="11" ry="10" fill="#b45309" stroke="#451a03" strokeWidth="1.4" />
            <ellipse cx="20" cy="32" rx="6.5" ry="6" fill="#fde68a" />
            <circle cx="10" cy="36" r="4" fill="#92400e" stroke="#451a03" strokeWidth="1.3" />
            <circle cx="30" cy="36" r="4" fill="#92400e" stroke="#451a03" strokeWidth="1.3" />
            {/* 얼굴 */}
            <circle cx="20" cy="17" r="9.5" fill="#d97706" stroke="#451a03" strokeWidth="1.4" />
            <ellipse cx="20" cy="19.5" rx="4.2" ry="3.2" fill="#fef3c7" />
            <circle cx="16.5" cy="15.5" r="1.3" fill="#1e293b" />
            <circle cx="23.5" cy="15.5" r="1.3" fill="#1e293b" />
            <ellipse cx="20" cy="18.5" rx="1.6" ry="1.1" fill="#451a03" />
            {/* 빨간 리본 */}
            <path d="M 16 25 L 24 25 L 20 27 Z" fill="#ef4444" />
            <circle cx="20" cy="25.5" r="1.6" fill="#dc2626" />
          </svg>
        );

      case "guitar":
        return (
          <svg viewBox="0 0 36 52" className="w-9 h-13 drop-shadow-md">
            {/* 스탠드 */}
            <line x1="10" y1="48" x2="26" y2="48" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="30" x2="18" y2="48" stroke="#334155" strokeWidth="2" />
            {/* 기타 넥 & 헤드 */}
            <rect x="16" y="4" width="4" height="22" rx="1" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            <rect x="15" y="2" width="6" height="5" rx="1" fill="#451a03" />
            {/* 기타 바디 */}
            <path
              d="M 18 21 C 11 21 10 28 13 31 C 9 34 9 43 18 43 C 27 43 27 34 23 31 C 26 28 25 21 18 21 Z"
              fill="#d97706"
              stroke="#451a03"
              strokeWidth="1.5"
            />
            <circle cx="18" cy="31" r="3.5" fill="#451a03" stroke="#fde68a" strokeWidth="1" />
            <rect x="15" y="37" width="6" height="2" fill="#451a03" />
          </svg>
        );

      case "diary_desk":
        return (
          <svg viewBox="0 0 54 44" className="w-13 h-11 drop-shadow-md">
            {/* 책상 다리 */}
            <rect x="6" y="22" width="4" height="19" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            <rect x="44" y="22" width="4" height="19" fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
            {/* 책상 상판 & 서랍 */}
            <rect x="4" y="16" width="46" height="8" rx="1.5" fill="#b45309" stroke="#451a03" strokeWidth="1.4" />
            <rect x="28" y="24" width="16" height="12" fill="#92400e" stroke="#451a03" strokeWidth="1.2" />
            <circle cx="36" cy="30" r="1.2" fill="#fde047" />
            {/* 스탠드 조명 & 펼쳐진 일기장 */}
            <rect x="12" y="11" width="14" height="5" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
            <line x1="19" y1="11" x2="19" y2="16" stroke="#94a3b8" strokeWidth="1" />
            <path d="M 38 16 L 42 7 L 34 7" fill="none" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
            <polygon points="31,7 37,7 35,11 29,11" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
          </svg>
        );

      case "stand_mirror":
        return (
          <svg viewBox="0 0 34 52" className="w-8.5 h-13 drop-shadow-md">
            {/* 받침 다리 */}
            <line x1="7" y1="48" x2="27" y2="48" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            {/* 원목 프레임 */}
            <rect x="7" y="4" width="20" height="42" rx="10" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
            {/* 거울 유리면 */}
            <rect x="10" y="7" width="14" height="36" rx="7" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
            {/* 거울 반사광 */}
            <line x1="13" y1="14" x2="20" y2="9" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <line x1="13" y1="20" x2="21" y2="14" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </svg>
        );

      case "room_plant":
        return (
          <svg viewBox="0 0 36 42" className="w-9 h-10.5 drop-shadow-md">
            {/* 테라코타 화분 */}
            <polygon points="11,26 25,26 23,39 13,39" fill="#c2410c" stroke="#7c2d12" strokeWidth="1.4" />
            <rect x="9.5" y="23" width="17" height="4" rx="1" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.3" />
            {/* 몬스테라 잎사귀 */}
            <path d="M 18 23 Q 8 18 9 10 Q 16 11 18 23 Z" fill="#16a34a" stroke="#14532d" strokeWidth="1.3" />
            <path d="M 18 23 Q 28 18 27 9 Q 20 11 18 23 Z" fill="#22c55e" stroke="#14532d" strokeWidth="1.3" />
            <path d="M 18 23 Q 18 9 18 5 Q 23 11 18 23 Z" fill="#4ade80" stroke="#14532d" strokeWidth="1.3" />
          </svg>
        );

      case "rain_window":
        return (
          <svg viewBox="0 0 52 48" className="w-13 h-12 drop-shadow-md">
            {/* 창문 바깥 풍경 */}
            <rect
              x="6"
              y="6"
              width="40"
              height="34"
              rx="4"
              fill={
                windowWeather === "day"
                  ? "#38bdf8"
                  : windowWeather === "rain"
                  ? "#334155"
                  : windowWeather === "snow"
                  ? "#1e293b"
                  : "#0f172a"
              }
              stroke="#78350f"
              strokeWidth="2.5"
            />
            {/* 날씨 디테일 */}
            {windowWeather === "day" && <circle cx="35" cy="15" r="5" fill="#fde047" />}
            {windowWeather === "night" && (
              <>
                <circle cx="35" cy="15" r="4.5" fill="#fef08a" />
                <circle cx="15" cy="14" r="1" fill="#ffffff" />
                <circle cx="23" cy="20" r="1.2" fill="#ffffff" />
              </>
            )}
            {windowWeather === "rain" && (
              <>
                <line x1="15" y1="12" x2="13" y2="20" stroke="#93c5fd" strokeWidth="1.3" />
                <line x1="25" y1="15" x2="23" y2="23" stroke="#93c5fd" strokeWidth="1.3" />
                <line x1="36" y1="11" x2="34" y2="19" stroke="#93c5fd" strokeWidth="1.3" />
              </>
            )}
            {windowWeather === "snow" && (
              <>
                <circle cx="15" cy="15" r="1.6" fill="#ffffff" />
                <circle cx="26" cy="21" r="1.8" fill="#ffffff" />
                <circle cx="36" cy="14" r="1.5" fill="#ffffff" />
                <circle cx="20" cy="30" r="1.4" fill="#ffffff" />
              </>
            )}
            {/* 창살 & 창틀 */}
            <line x1="26" y1="6" x2="26" y2="40" stroke="#78350f" strokeWidth="2" />
            <line x1="6" y1="23" x2="46" y2="23" stroke="#78350f" strokeWidth="2" />
            <rect x="4" y="39" width="44" height="4" rx="1.5" fill="#92400e" stroke="#451a03" strokeWidth="1.2" />
          </svg>
        );

      case "arcade_machine":
        return (
          <svg viewBox="0 0 44 54" className="w-11 h-13.5 drop-shadow-md">
            {/* 오락기 캐비닛 */}
            <rect x="7" y="4" width="30" height="46" rx="3" fill="#2563eb" stroke="#1e3a8a" strokeWidth="1.5" />
            {/* 상단 간판 */}
            <rect x="9" y="6" width="26" height="6" rx="1" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            {/* 브라운관 화면 */}
            <rect x="10" y="14" width="24" height="16" rx="2" fill="#09090b" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="13" y="18" width="5" height="5" fill="#4ade80" />
            <circle cx="26" cy="21" r="2.5" fill="#fb7185" />
            {/* 조이스틱 패널 */}
            <polygon points="7,31 37,31 40,36 4,36" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
            <line x1="15" y1="33" x2="15" y2="29" stroke="#1e293b" strokeWidth="1.5" />
            <circle cx="15" cy="28.5" r="2" fill="#ef4444" />
            <circle cx="26" cy="33" r="1.5" fill="#ef4444" />
            <circle cx="30" cy="32.5" r="1.5" fill="#eab308" />
            {/* 동전 투입구 */}
            <rect x="17" y="40" width="10" height="7" rx="1" fill="#1e293b" />
            <rect x="21" y="42" width="2" height="3" fill="#ef4444" />
          </svg>
        );

      case "retro_puppy":
        return (
          <svg viewBox="0 0 38 36" className="w-9.5 h-9 drop-shadow-md">
            {/* 그림자 */}
            <ellipse cx="19" cy="33" rx="11" ry="2.5" fill="#000000" opacity="0.2" />
            {/* 몸통 */}
            <ellipse cx="21" cy="25" rx="9" ry="6.5" fill="#fef3c7" stroke="#78350f" strokeWidth="1.4" />
            {/* 흔드는 꼬리 */}
            <path d="M 29 22 Q 35 17 33 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            {/* 앞발/뒷발 */}
            <rect x="14" y="28" width="3.5" height="5" rx="1.5" fill="#fef3c7" stroke="#78350f" strokeWidth="1.2" />
            <rect x="24" y="28" width="3.5" height="5" rx="1.5" fill="#fef3c7" stroke="#78350f" strokeWidth="1.2" />
            {/* 얼굴 & 접힌 귀 */}
            <circle cx="14" cy="17" r="7.5" fill="#fef3c7" stroke="#78350f" strokeWidth="1.4" />
            <ellipse cx="8" cy="16" rx="2.5" ry="4.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
            <ellipse cx="20" cy="16" rx="2.5" ry="4.5" fill="#d97706" stroke="#78350f" strokeWidth="1.2" />
            <circle cx="11.5" cy="16.5" r="1.2" fill="#1e293b" />
            <circle cx="16" cy="16.5" r="1.2" fill="#1e293b" />
            <circle cx="13.5" cy="19" r="1.5" fill="#451a03" />
            {/* 빨간 목줄 */}
            <path d="M 10 23 Q 14 25 19 23" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case "lava_lamp":
        return (
          <svg viewBox="0 0 30 44" className="w-7.5 h-11 drop-shadow-md">
            {/* 후광 효과 */}
            <circle cx="15" cy="21" r="12" fill="#fb923c" opacity="0.28" />
            {/* 받침대 */}
            <polygon points="9,39 21,39 18,31 12,31" fill="#475569" stroke="#1e293b" strokeWidth="1.3" />
            {/* 유리 램프 관 */}
            <path d="M 12 10 L 18 10 L 20 31 L 10 31 Z" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.4" />
            {/* 라바 방울 */}
            <circle cx="15" cy="24" r="3.2" fill="#f97316" />
            <circle cx="14" cy="16" r="2.2" fill="#fb923c" />
            {/* 상단 캡 */}
            <polygon points="12,10 18,10 16.5,5 13.5,5" fill="#475569" stroke="#1e293b" strokeWidth="1.3" />
          </svg>
        );

      default:
        return null;
    }
  };

  const currentEmote = MINIMI_EMOTES[emoteIdx];

  return (
    <div
      className={`w-full max-w-[420px] mx-auto p-2.5 rounded-2xl border transition-all duration-300 shadow-sm select-none font-sans ${
        roomFrameBg || "bg-[#f1f5f9] border-[#cbd5e1]"
      }`}
    >
      {/* 1. 미니홈피 클래식 헤더 바 (TODAY / TOTAL & BGM 플레이어) */}
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

        {/* 상단 미니 BGM 플레이어 */}
        <button
          type="button"
          onClick={handleToggleSound}
          className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg cursor-pointer transition max-w-[195px]"
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
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => {
          if (isEditMode) setSelectedTarget(null);
        }}
        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border shadow-inner flex flex-col justify-between p-3 touch-none ${
          isEditMode ? "border-orange-500 ring-2 ring-orange-400/50" : "border-black/15"
        }`}
        style={{
          backgroundColor: theme.wallColor,
          backgroundImage: `radial-gradient(${theme.gridColor}33 1px, transparent 1px)`,
          backgroundSize: "14px 14px",
        }}
      >
        {/* 테마 날씨/배경 이펙트 */}
        {theme.weatherEffect === "stars" && (
          <div className="absolute inset-x-0 top-0 h-[50%] pointer-events-none opacity-70">
            <span className="absolute top-6 left-8 text-[10px] text-yellow-200 animate-pulse">✦</span>
            <span className="absolute top-12 left-28 text-[8px] text-indigo-200 animate-ping">★</span>
            <span className="absolute top-8 right-12 text-[11px] text-yellow-100 animate-pulse">✧</span>
            <span className="absolute top-16 right-28 text-[9px] text-sky-200">✦</span>
          </div>
        )}
        {theme.weatherEffect === "sakura" && (
          <div className="absolute inset-x-0 top-0 h-[55%] pointer-events-none opacity-80">
            <span className="absolute top-6 left-10 text-xs animate-bounce">🌸</span>
            <span className="absolute top-14 left-32 text-[10px] animate-pulse">🌸</span>
            <span className="absolute top-8 right-14 text-xs animate-bounce">🌸</span>
            <span className="absolute top-18 right-28 text-[10px]">🌸</span>
          </div>
        )}
        {theme.weatherEffect === "rain" && (
          <div className="absolute inset-x-0 top-0 h-[55%] pointer-events-none opacity-60">
            <span className="absolute top-7 left-12 text-xs text-sky-200 animate-pulse">💧</span>
            <span className="absolute top-14 left-36 text-[10px] text-sky-300">💧</span>
            <span className="absolute top-9 right-16 text-xs text-sky-200 animate-pulse">💧</span>
          </div>
        )}

        {/* 상단 미니룸 타이틀 & 오리알 뱃지 & 배치편집 토글 */}
        <div className="flex items-center justify-between z-30 gap-1">
          <div className="px-2.5 py-0.5 bg-white/92 backdrop-blur-xs rounded-full border border-gray-300/80 shadow-2xs flex items-center gap-1 min-w-0">
            <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
            <span
              className={`text-[11px] font-black text-gray-800 truncate max-w-[175px] ${
                vipFont ? "tracking-wider font-mono text-orange-950" : ""
              }`}
            >
              {homeTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="px-2 py-0.5 bg-white/92 backdrop-blur-xs rounded-full text-[10px] font-black text-amber-800 border border-amber-200 shadow-2xs flex items-center gap-0.5">
              <span>🥚 {eggCount}</span>
            </div>

            {editable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditMode((prev) => !prev);
                  setSelectedTarget(null);
                  retroAudioSynth.playSfx("pop");
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs flex items-center gap-0.5 transition cursor-pointer ${
                  isEditMode
                    ? "bg-orange-600 text-white border-orange-700"
                    : "bg-white/92 text-gray-700 border-gray-300 hover:bg-orange-50"
                }`}
                title="가구 및 미니미 직접 드래그 배치"
              >
                {isEditMode ? (
                  <>
                    <Check className="w-2.5 h-2.5" />
                    <span>완료</span>
                  </>
                ) : (
                  <>
                    <Move className="w-2.5 h-2.5 text-orange-600" />
                    <span>배치 이동</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 룸 상단 벽면 시그니처 사인 (친구 방문 시) */}
        {wallTag && !isEditMode && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-black/50 backdrop-blur-xs rounded-full border border-white/20 text-[10px] font-black text-white/95 shadow-2xs tracking-wide z-10 whitespace-nowrap">
            {wallTag}
          </div>
        )}

        {/* 인터랙션 반응 토스트 배너 */}
        {interactToast && !isEditMode && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-40 px-3 py-1 bg-slate-900/90 text-white rounded-full text-[10px] font-bold shadow-lg border border-white/15 whitespace-nowrap animate-fade-in">
            {interactToast}
          </div>
        )}

        {/* 편집 모드 컨트롤 툴바 */}
        {isEditMode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-40 px-2.5 py-1 bg-slate-900/92 text-white rounded-full text-[10px] font-bold shadow-lg border border-orange-400/50 flex items-center gap-2 whitespace-nowrap animate-fade-in"
          >
            <span className="text-orange-300">✋ 소품/미니미를 드래그해 이동하세요</span>
            {selectedTarget && (
              <button
                type="button"
                onClick={handleFlipSelected}
                className="px-1.5 py-0.5 bg-white/15 hover:bg-white/25 rounded text-[9px] flex items-center gap-0.5 cursor-pointer"
              >
                <FlipHorizontal className="w-2.5 h-2.5" />
                <span>좌우반전</span>
              </button>
            )}
            {onResetPositions && (
              <button
                type="button"
                onClick={() => {
                  onResetPositions();
                  retroAudioSynth.playSfx("pop");
                  showToast("🔄 가구 배치가 기본 위치로 정렬되었어요!");
                }}
                className="px-1.5 py-0.5 bg-rose-500/80 hover:bg-rose-500 rounded text-[9px] flex items-center gap-0.5 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>초기화</span>
              </button>
            )}
          </div>
        )}

        {/* 미니룸 바닥면 (원목/타일 사선 투시 원근감) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[48%] border-t-2 border-black/20 shadow-md pointer-events-none"
          style={{
            backgroundColor: theme.floorColor,
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 15px, rgba(0,0,0,0.07) 15px, rgba(0,0,0,0.07) 30px)`,
          }}
        />

        {/* 룸 후면 벽면 걸레받이 몰딩 라인 */}
        <div className="absolute top-[52%] left-0 right-0 h-1.5 bg-black/20 opacity-45 pointer-events-none" />

        {/* 배치된 가구/소품 렌더링 (드래그/터치 반응 지원) */}
        <div className="absolute inset-0 z-10">
          {placedProps.map((propId) => {
            const pos = propPositions[propId] || DEFAULT_PROP_POSITIONS[propId] || { x: 50, y: 70 };
            const isSelected = isEditMode && selectedTarget === propId;
            const isBouncing = bouncingId === propId;

            return (
              <div
                key={propId}
                onPointerDown={(e) => handlePointerDown(e, propId)}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePropClick(propId);
                }}
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  zIndex: Math.round(pos.y),
                  transform: `translate(-50%, -85%) ${pos.flip ? "scaleX(-1)" : ""}`,
                }}
                className={`absolute cursor-pointer transition-transform ${
                  isBouncing ? "scale-115" : "hover:scale-105 active:scale-95"
                } ${
                  isSelected
                    ? "ring-2 ring-orange-500 bg-orange-500/15 rounded-xl p-0.5"
                    : isEditMode
                    ? "ring-1 ring-dashed ring-white/70 rounded-xl"
                    : ""
                }`}
              >
                {renderPropSvg(propId)}
              </div>
            );
          })}
        </div>

        {/* 미니미 캐릭터 & 감성 말풍선 (자유 이동 & 터치 점프/감정표현) */}
        <div
          onPointerDown={(e) => handlePointerDown(e, "minimi")}
          onClick={(e) => {
            e.stopPropagation();
            handleMinimiClick();
          }}
          style={{
            left: `${minimiPosition.x}%`,
            top: `${minimiPosition.y}%`,
            zIndex: Math.max(25, Math.round(minimiPosition.y) + 5),
            transform: "translate(-50%, -90%)",
          }}
          className={`absolute flex flex-col items-center cursor-pointer ${
            isEditMode && selectedTarget === "minimi"
              ? "ring-2 ring-orange-500 bg-orange-500/15 rounded-2xl p-1"
              : ""
          }`}
        >
          {/* 말풍선 */}
          <div className="mb-1 px-2.5 py-1 bg-white/95 border border-gray-800/80 rounded-2xl shadow-sm text-center max-w-[220px] relative whitespace-nowrap">
            <p
              className={`text-[10px] font-bold text-gray-800 leading-tight truncate max-w-[200px] ${
                vipFont ? "font-mono text-orange-950" : ""
              }`}
            >
              {currentEmote.id !== "default" && <span className="mr-1">{currentEmote.badge}</span>}
              {moodText}
            </p>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-gray-800 rotate-45" />
          </div>

          {/* 미니미 도트 캐릭터 SVG */}
          <div
            className={`relative transition-transform duration-300 ${
              isJumping ? "-translate-y-3 scale-110" : "hover:scale-105 active:scale-95"
            } ${minimiPosition.flip ? "scale-x-[-1]" : ""}`}
          >
            {/* 머리 위 감정 이펙트 */}
            {currentEmote.id !== "default" && (
              <span className="absolute -top-2 -right-2 text-xs animate-bounce select-none z-10">
                {currentEmote.badge}
              </span>
            )}

            <svg viewBox="0 0 40 50" className="w-14 h-17 drop-shadow-md">
              {/* 바닥 그림자 */}
              <ellipse cx="20" cy="47" rx="12" ry="3" fill="#000000" opacity="0.25" />

              {/* 얼굴 베이스 */}
              <circle
                cx="20"
                cy="18"
                r="11"
                fill={minimi.dotArt === "gold_duck" ? "#facc15" : "#fde047"}
                stroke="#0f172a"
                strokeWidth="1.5"
              />
              {/* 눈 표정 (감정모드 연동) */}
              {currentEmote.id === "cry" ? (
                <>
                  <line x1="14" y1="19" x2="18" y2="19" stroke="#0f172a" strokeWidth="1.6" />
                  <line x1="22" y1="19" x2="26" y2="19" stroke="#0f172a" strokeWidth="1.6" />
                  <line x1="15.5" y1="20" x2="15.5" y2="25" stroke="#38bdf8" strokeWidth="1.8" />
                  <line x1="24.5" y1="20" x2="24.5" y2="25" stroke="#38bdf8" strokeWidth="1.8" />
                </>
              ) : (
                <>
                  <circle cx="16" cy="19" r="1.5" fill="#0f172a" />
                  <circle cx="24" cy="19" r="1.5" fill="#0f172a" />
                </>
              )}
              <ellipse cx="14" cy="22" rx="2" ry="1" fill="#fb7185" opacity="0.75" />
              <ellipse cx="26" cy="22" rx="2" ry="1" fill="#fb7185" opacity="0.75" />

              {/* 1. 소녀 미니미 (girl) */}
              {minimi.dotArt === "girl" && (
                <>
                  <path d="M 8 18 Q 20 6 32 18 Q 30 11 20 11 Q 10 11 8 18 Z" fill="#451a03" />
                  <circle cx="20" cy="8" r="3" fill="#ec4899" />
                  <rect x="13" y="29" width="14" height="10" rx="1" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />
                  <line x1="20" y1="29" x2="20" y2="35" stroke="#ec4899" strokeWidth="2" />
                  <path d="M 12 39 L 28 39 L 30 45 L 10 45 Z" fill="#1e3a8a" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="16.5" cy="47" r="2" fill="#1e293b" />
                  <circle cx="23.5" cy="47" r="2" fill="#1e293b" />
                </>
              )}

              {/* 2. 락스타 미니미 (rocker) */}
              {minimi.dotArt === "rocker" && (
                <>
                  <path d="M 7 15 L 13 6 L 20 9 L 27 6 L 33 15 Q 20 10 7 15 Z" fill="#171717" />
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
                  <path d="M 8 13 Q 20 5 32 13 Z" fill="#ea580c" />
                  <rect x="6" y="11" width="16" height="3" rx="1.5" fill="#f97316" />
                  <rect x="11" y="28" width="18" height="13" rx="2" fill="#3f3f46" stroke="#0f172a" strokeWidth="1.5" />
                  <circle cx="20" cy="33" r="2" fill="#facc15" />
                  <rect x="12" y="40" width="7" height="6" fill="#1e293b" />
                  <rect x="21" y="40" width="7" height="6" fill="#1e293b" />
                  <circle cx="15.5" cy="47" r="2.5" fill="#fbbf24" />
                  <circle cx="24.5" cy="47" r="2.5" fill="#fbbf24" />
                </>
              )}

              {/* 4. 고양이 잠옷 미니미 (cat) */}
              {minimi.dotArt === "cat" && (
                <>
                  <polygon points="10,12 14,4 17,11" fill="#fda4af" stroke="#0f172a" strokeWidth="1" />
                  <polygon points="30,12 26,4 23,11" fill="#fda4af" stroke="#0f172a" strokeWidth="1" />
                  <path d="M 8 17 Q 20 7 32 17 Z" fill="#fbcfe8" />
                  <rect x="12" y="28" width="16" height="15" rx="3" fill="#fce7f3" stroke="#0f172a" strokeWidth="1.5" />
                  <circle cx="16.5" cy="46" r="2" fill="#fb7185" />
                  <circle cx="23.5" cy="46" r="2" fill="#fb7185" />
                </>
              )}

              {/* 5. Y2K 스노우보더 미니미 (boarder) */}
              {minimi.dotArt === "boarder" && (
                <>
                  {/* 비니 & 고글 */}
                  <path d="M 8 15 Q 20 4 32 15 Z" fill="#0284c7" stroke="#0f172a" strokeWidth="1.2" />
                  <rect x="10" y="10" width="9" height="5" rx="2" fill="#f97316" stroke="#0f172a" strokeWidth="1" />
                  <rect x="21" y="10" width="9" height="5" rx="2" fill="#f97316" stroke="#0f172a" strokeWidth="1" />
                  {/* 보드 패딩 자켓 */}
                  <rect x="11" y="28" width="18" height="13" rx="2" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
                  <rect x="17" y="28" width="6" height="13" fill="#f8fafc" />
                  <rect x="12" y="40" width="7" height="6" fill="#0f172a" />
                  <rect x="21" y="40" width="7" height="6" fill="#0f172a" />
                  <circle cx="15.5" cy="47" r="2.5" fill="#ffffff" />
                  <circle cx="24.5" cy="47" r="2.5" fill="#ffffff" />
                </>
              )}

              {/* 6. 전설의 황금 오리왕 미니미 (gold_duck) */}
              {minimi.dotArt === "gold_duck" && (
                <>
                  {/* 황금 왕관 & 오리 부리 */}
                  <polygon points="13,9 16,3 20,7 24,3 27,9" fill="#eab308" stroke="#713f12" strokeWidth="1.2" />
                  <ellipse cx="20" cy="22" rx="4.5" ry="2.2" fill="#f97316" stroke="#7c2d12" strokeWidth="1" />
                  {/* 황금 망토 & 코스튬 */}
                  <rect x="11" y="28" width="18" height="14" rx="4" fill="#fde047" stroke="#854d0e" strokeWidth="1.5" />
                  <circle cx="20" cy="35" r="3" fill="#ffffff" />
                  <circle cx="16" cy="46" r="2.8" fill="#f97316" />
                  <circle cx="24" cy="46" r="2.8" fill="#f97316" />
                </>
              )}

              {/* 7. 기본 소년 미니미 (boy) */}
              {minimi.dotArt === "boy" && (
                <>
                  <path d="M 9 17 Q 20 8 31 17 Q 28 10 20 10 Q 12 10 9 17 Z" fill="#78350f" />
                  <rect x="7" y="15" width="4" height="8" rx="2" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
                  <rect x="29" y="15" width="4" height="8" rx="2" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
                  <path d="M 9 15 Q 20 5 31 15" fill="none" stroke="#0284c7" strokeWidth="2.5" />
                  <rect x="13" y="29" width="14" height="12" rx="2" fill="#3b82f6" stroke="#0f172a" strokeWidth="1.5" />
                  <rect x="14" y="39" width="5" height="7" fill="#1e293b" />
                  <rect x="21" y="39" width="5" height="7" fill="#1e293b" />
                  <circle cx="16.5" cy="46" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
                  <circle cx="23.5" cy="46" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
                </>
              )}
            </svg>
          </div>

          <span className="text-[9px] font-black text-gray-700 bg-white/92 px-2 py-0.5 rounded-full border border-gray-200 mt-0.5 shadow-2xs whitespace-nowrap">
            {minimi.name}
          </span>
        </div>
      </div>

      {/* 3. 하단 인터랙션 안내 캡션 */}
      <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-gray-500">
        <span>💡 미니미·소품을 터치하면 소리와 함께 반응해요!</span>
        {editable && (
          <button
            type="button"
            onClick={() => setIsEditMode((p) => !p)}
            className="text-orange-600 font-bold hover:underline cursor-pointer"
          >
            {isEditMode ? "편집 닫기" : "자유 배치하기 →"}
          </button>
        )}
      </div>
    </div>
  );
};
