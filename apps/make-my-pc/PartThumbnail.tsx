import React, { useState } from "react";
import { PartOption } from "./catalog";
import { BuildState } from "./engine";

interface PartThumbnailProps {
  category: keyof BuildState;
  part: PartOption;
  size?: number; // 기본 48px (12rem)
  className?: string;
}

const DEFAULT_THUMBNAILS: Record<string, string> = {
  // CPU
  cpu1: "https://img.danawa.com/prod_img/500000/499/694/img/21694499_1.jpg?shrink=130:130",   // Ryzen 5600
  cpu16: "https://img.danawa.com/prod_img/500000/499/694/img/21694499_1.jpg?shrink=130:130",  // Ryzen 7500F
  cpu3: "https://img.danawa.com/prod_img/500000/499/694/img/21694499_1.jpg?shrink=130:130",   // 7800X3D
  cpu7: "https://img.danawa.com/prod_img/500000/499/694/img/21694499_1.jpg?shrink=130:130",   // 9800X3D
  cpu19: "https://img.danawa.com/prod_img/500000/505/422/img/16422505_1.jpg?shrink=130:130",  // 12400F
  cpu2: "https://img.danawa.com/prod_img/500000/505/422/img/16422505_1.jpg?shrink=130:130",   // 14600K
  cpu17: "https://img.danawa.com/prod_img/500000/505/422/img/16422505_1.jpg?shrink=130:130",  // 12100F
  // GPU
  gpu2: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",   // RTX 4060
  gpu13: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",  // RTX 4060 Ti
  gpu16: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",  // RTX 4070S
  gpu6: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",   // RTX 5070
  gpu8: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",   // RTX 5080
  gpu9: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",   // RTX 5090
  gpu10: "https://img.danawa.com/prod_img/500000/989/461/img/20461989_1.jpg?shrink=130:130",  // RX 6600
  // MB
  mb1: "https://img.danawa.com/prod_img/500000/409/670/img/11670409_1.jpg?shrink=130:130",   // B550M
  mb4: "https://img.danawa.com/prod_img/500000/546/665/img/17665546_1.jpg?shrink=130:130",   // TUF B650M
  mb2: "https://img.danawa.com/prod_img/500000/409/670/img/11670409_1.jpg?shrink=130:130",   // B760M
  mb14: "https://img.danawa.com/prod_img/500000/409/670/img/11670409_1.jpg?shrink=130:130",  // MAXSUN
  // RAM
  ram2: "https://img.danawa.com/prod_img/500000/624/600/img/10600624_1.jpg?shrink=130:130",  // DDR4
  ram3: "https://img.danawa.com/prod_img/500000/841/220/img/18220841_1.jpg?shrink=130:130",  // DDR5 T-Create
  ram9: "https://img.danawa.com/prod_img/500000/841/220/img/18220841_1.jpg?shrink=130:130",  // G.SKILL RGB
  ram8: "https://img.danawa.com/prod_img/500000/841/220/img/18220841_1.jpg?shrink=130:130",  // DDR5 5600
  // Storage
  st5: "https://img.danawa.com/prod_img/500000/613/462/img/28462613_1.jpg?shrink=130:130",   // SN580
  st3: "https://img.danawa.com/prod_img/500000/961/708/img/17708961_1.jpg?shrink=130:130",   // 990 PRO
  st4: "https://img.danawa.com/prod_img/500000/961/708/img/17708961_1.jpg?shrink=130:130",   // 990 PRO 2TB
  st10: "https://img.danawa.com/prod_img/500000/961/708/img/17708961_1.jpg?shrink=130:130",  // P41
  st2: "https://img.danawa.com/prod_img/500000/613/462/img/28462613_1.jpg?shrink=130:130",   // 870 EVO
  // Cooler
  cl6: "https://img.danawa.com/prod_img/500000/685/658/img/16658685_1.jpg?shrink=130:130",   // PA120 SE
  cl2: "https://img.danawa.com/prod_img/500000/685/658/img/16658685_1.jpg?shrink=130:130",   // AK400
  cl3: "https://img.danawa.com/prod_img/500000/225/998/img/19998225_1.jpg?shrink=130:130",   // Kraken 240
  cl4: "https://img.danawa.com/prod_img/500000/225/998/img/19998225_1.jpg?shrink=130:130",   // Liquid Freezer 360
  // PSU
  psu1: "https://img.danawa.com/prod_img/500000/872/402/img/14402872_1.jpg?shrink=130:130",  // Classic II
  psu2: "https://img.danawa.com/prod_img/500000/872/402/img/14402872_1.jpg?shrink=130:130",  // 시소닉 FOCUS
  psu3: "https://img.danawa.com/prod_img/500000/872/402/img/14402872_1.jpg?shrink=130:130",  // RM850e
  // Case
  case2: "https://img.danawa.com/prod_img/500000/609/166/img/16166609_1.jpg?shrink=130:130", // DK352
  case3: "https://img.danawa.com/prod_img/500000/177/310/img/16310177_1.jpg?shrink=130:130", // O11D EVO
  case12: "https://img.danawa.com/prod_img/500000/904/716/img/18716904_1.jpg?shrink=130:130",// Fractal North
  case9: "https://img.danawa.com/prod_img/500000/609/166/img/16166609_1.jpg?shrink=130:130", // DLX21
  case8: "https://img.danawa.com/prod_img/500000/177/310/img/16310177_1.jpg?shrink=130:130", // S401
};

export const PartThumbnail: React.FC<PartThumbnailProps> = ({
  category,
  part,
  size = 48,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const targetImg = part.imageUrl || DEFAULT_THUMBNAILS[part.id];

  // 실물 사진이 존재하고 에러가 없는 경우 실물 사진 렌더링
  if (targetImg && !imgError) {
    return (
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden bg-white border border-gray-200/80 p-1 flex items-center justify-center shadow-2xs group ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={targetImg}
          alt={part.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain rounded-lg transition duration-200 group-hover:scale-105"
        />
      </div>
    );
  }

  // 실물 사진이 없거나 로딩 실패 시: 부품별 정밀 하드웨어 비주얼 썸네일
  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-1 shadow-2xs ${className}`}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
      title={part.name}
    >
      {renderHardwareVisual(category, part)}
    </div>
  );
};

// 부품 모델별 맞춤형 하드웨어 비주얼 SVG 렌더러
function renderHardwareVisual(category: keyof BuildState, part: PartOption) {
  const name = part.name.toLowerCase();

  switch (category) {
    case "cpu": {
      const isAmd = name.includes("ryzen");
      const accent = isAmd ? "#ea580c" : "#0284c7"; // AMD 주황 / 인텔 파랑
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 초록/다크 PCB 기판 */}
          <rect x="4" y="4" width="36" height="36" rx="3" fill="#1e293b" />
          <rect x="5" y="5" width="34" height="34" rx="2" fill="#0f172a" />
          {/* 금도금 모서리 마커 */}
          <polygon points="4,4 10,4 4,10" fill="#f59e0b" />
          {/* 실버 니켈 도금 IHS 히트스프레더 */}
          <rect x="9" y="9" width="26" height="26" rx="2.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          {/* 중앙 각인 영역 */}
          <rect x="13" y="13" width="18" height="18" rx="1.5" fill="#e2e8f0" />
          <line x1="15" y1="17" x2="29" y2="17" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="21" x2="25" y2="21" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
          <line x1="15" y1="24" x2="27" y2="24" stroke="#64748b" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    }

    case "gpu": {
      const isTriple = (part.len || 240) > 280;
      const isNvidia = name.includes("geforce") || name.includes("rtx");
      const ledColor = isNvidia ? "#10b981" : "#ef4444"; // 지포스 그린 / 라데온 레드
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* GPU 건메탈 슈라우드 하우징 */}
          <rect x="4" y="10" width="36" height="24" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* 상단 메탈 백플레이트 엣지 */}
          <rect x="4" y="9" width="36" height="3" rx="1" fill="#94a3b8" />
          {/* 측면 LED 라인 */}
          <line x1="6" y1="13" x2="22" y2="13" stroke={ledColor} strokeWidth="1.5" strokeLinecap="round" />
          {/* 쿨링팬 2개 또는 3개 */}
          {isTriple ? (
            <>
              <circle cx="11" cy="22" r="5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <circle cx="11" cy="22" r="2" fill="#94a3b8" />
              <circle cx="22" cy="22" r="5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <circle cx="22" cy="22" r="2" fill="#94a3b8" />
              <circle cx="33" cy="22" r="5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <circle cx="33" cy="22" r="2" fill="#94a3b8" />
            </>
          ) : (
            <>
              <circle cx="15" cy="22" r="6.5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <circle cx="15" cy="22" r="2.5" fill="#94a3b8" />
              <circle cx="29" cy="22" r="6.5" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <circle cx="29" cy="22" r="2.5" fill="#94a3b8" />
            </>
          )}
          {/* 골드 PCIe 단자 핀 */}
          <rect x="10" y="34" width="16" height="2" fill="#f59e0b" />
        </svg>
      );
    }

    case "mb": {
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 블랙 PCB 기판 */}
          <rect x="5" y="5" width="34" height="34" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          {/* 대형 VRM 알루미늄 방열판 */}
          <rect x="7" y="7" width="8" height="14" rx="1" fill="#64748b" stroke="#94a3b8" strokeWidth="0.5" />
          <rect x="15" y="7" width="12" height="5" rx="1" fill="#64748b" stroke="#94a3b8" strokeWidth="0.5" />
          {/* CPU 소켓 */}
          <rect x="16" y="13" width="10" height="10" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          {/* RAM 슬롯 2개 */}
          <rect x="29" y="9" width="2" height="16" rx="0.5" fill="#334155" />
          <rect x="33" y="9" width="2" height="16" rx="0.5" fill="#334155" />
          {/* 스틸 PCIe 슬롯 */}
          <rect x="10" y="27" width="24" height="3" rx="0.5" fill="#94a3b8" />
          {/* 칩셋 방열판 */}
          <rect x="26" y="31" width="8" height="6" rx="1" fill="#475569" />
        </svg>
      );
    }

    case "ram": {
      const isRgb = name.includes("rgb") || name.includes("cl30");
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 후면 스틱 그림자 */}
          <rect x="16" y="8" width="8" height="26" rx="1.5" fill="#1e293b" opacity="0.6" />
          {/* 전면 튜닝 RAM 방열판 */}
          <rect x="10" y="10" width="24" height="24" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          {/* 방열판 질감 그루브 */}
          <line x1="14" y1="18" x2="30" y2="18" stroke="#1e293b" strokeWidth="1" />
          <line x1="14" y1="22" x2="30" y2="22" stroke="#1e293b" strokeWidth="1" />
          <line x1="14" y1="26" x2="30" y2="26" stroke="#1e293b" strokeWidth="1" />
          {/* 상단 ARGB 라이트 바 디퓨저 */}
          {isRgb ? (
            <defs>
              <linearGradient id="rgbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="33%" stopColor="#a855f7" />
                <stop offset="66%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          ) : null}
          <rect
            x="10"
            y="9"
            width="24"
            height="3.5"
            rx="1"
            fill={isRgb ? "url(#rgbGrad)" : "#cbd5e1"}
          />
          {/* 하단 골드 접점 핀 */}
          <rect x="12" y="34" width="20" height="2" fill="#f59e0b" />
        </svg>
      );
    }

    case "storage": {
      const isSata = (part.sub || "").includes("SATA");
      if (isSata) {
        return (
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
            <rect x="8" y="10" width="28" height="24" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="12" y="13" width="20" height="12" rx="1" fill="#334155" />
            <rect x="14" y="16" width="10" height="2" fill="#f59e0b" />
            <rect x="14" y="20" width="16" height="2" fill="#cbd5e1" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* M.2 PCB 스틱 */}
          <rect x="8" y="14" width="28" height="16" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
          {/* 알루미늄 방열판 */}
          <rect x="11" y="15" width="22" height="14" rx="1" fill="#475569" stroke="#64748b" strokeWidth="0.5" />
          {/* 플래시 낸드 칩 & 컨트롤러 */}
          <rect x="13" y="17" width="7" height="10" rx="0.5" fill="#1e293b" />
          <rect x="22" y="17" width="9" height="10" rx="0.5" fill="#1e293b" />
          {/* M.2 금도금 단자 핀 */}
          <rect x="34" y="16" width="2" height="12" fill="#f59e0b" />
          {/* 고정 나사 반원 홈 */}
          <circle cx="8" cy="22" r="1.5" fill="#f8fafc" />
        </svg>
      );
    }

    case "cooler": {
      const isAio = part.type === "aio";
      if (isAio) {
        return (
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
            {/* 상단 라디에이터 */}
            <rect x="6" y="8" width="32" height="10" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <circle cx="14" cy="13" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
            <circle cx="22" cy="13" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
            <circle cx="30" cy="13" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
            {/* 호스 2가닥 */}
            <path d="M12 18 Q 10 26, 20 28" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 18 Q 14 28, 24 30" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
            {/* 원형 펌프 헤드 (인피니티 미러/LCD 발광) */}
            <circle cx="22" cy="30" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <circle cx="22" cy="30" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="22" cy="30" r="2.5" fill="#38bdf8" opacity="0.8" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 공랭 타워 방열핀 스택 */}
          <rect x="10" y="11" width="24" height="22" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          {/* 수평 핀 그루브 라인들 */}
          {[14, 17, 20, 23, 26, 29].map((y) => (
            <line key={y} x1="10" y1={y} x2="34" y2={y} stroke="#94a3b8" strokeWidth="0.8" />
          ))}
          {/* 상단 돌출 구리 히트파이프 캡 4개 */}
          {[14, 19, 25, 30].map((x) => (
            <rect key={x} x={x - 1} y="8" width="2" height="3.5" rx="0.5" fill="#b45309" />
          ))}
          {/* 120mm 쿨링팬 프레임 */}
          <rect x="7" y="12" width="6" height="20" rx="1" fill="#1e293b" />
          <circle cx="10" cy="22" r="2" fill="#64748b" />
        </svg>
      );
    }

    case "psu": {
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 파워 무광 블랙 섀시 */}
          <rect x="6" y="10" width="32" height="24" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* 골드 80PLUS 팬 그릴 */}
          <circle cx="20" cy="22" r="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="20" cy="22" r="5" fill="none" stroke="#f59e0b" strokeWidth="0.6" />
          <circle cx="20" cy="22" r="2.5" fill="#f59e0b" />
          {/* 모듈러 케이블 포트 */}
          <rect x="31" y="14" width="4" height="3" fill="#0f172a" />
          <rect x="31" y="19" width="4" height="3" fill="#0f172a" />
          <rect x="31" y="24" width="4" height="6" fill="#0f172a" />
        </svg>
      );
    }

    case "case": {
      const isPanoramic = name.includes("어항") || name.includes("파노라마") || name.includes("vision");
      const isWood = name.includes("north") || name.includes("우드");
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 케이스 프레임 */}
          <rect x="8" y="6" width="28" height="32" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {isWood ? (
            /* Fractal North 우드 루버 슬랫 */
            <>
              <rect x="10" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="14" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="18" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="22" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="26" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="30" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
            </>
          ) : isPanoramic ? (
            /* 어항 파노라마 유리 쇼케이스 */
            <>
              <rect x="10" y="8" width="24" height="22" rx="1" fill="#38bdf8" opacity="0.25" stroke="#38bdf8" strokeWidth="0.8" />
              <circle cx="22" cy="18" r="3.5" fill="#38bdf8" opacity="0.5" />
              <rect x="10" y="30" width="24" height="6" rx="1" fill="#0f172a" />
            </>
          ) : (
            /* 전면 3팬 메쉬 케이스 */
            <>
              <rect x="10" y="8" width="24" height="22" rx="1" fill="#0f172a" />
              <circle cx="16" cy="13" r="3" fill="#38bdf8" opacity="0.7" />
              <circle cx="16" cy="19" r="3" fill="#38bdf8" opacity="0.7" />
              <circle cx="16" cy="25" r="3" fill="#38bdf8" opacity="0.7" />
              <rect x="10" y="30" width="24" height="6" rx="1" fill="#0f172a" />
            </>
          )}
          {/* 케이스 발받침 */}
          <rect x="10" y="38" width="4" height="1.5" fill="#09090b" />
          <rect x="30" y="38" width="4" height="1.5" fill="#09090b" />
        </svg>
      );
    }

    default:
      return null;
  }
}
