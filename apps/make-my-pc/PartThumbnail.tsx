import React, { useState } from "react";
import { PartOption } from "./catalog";
import { BuildState } from "./engine";

interface PartThumbnailProps {
  category: keyof BuildState;
  part: PartOption;
  size?: number; // 기본 46px
  className?: string;
}

export const PartThumbnail: React.FC<PartThumbnailProps> = ({
  category,
  part,
  size = 46,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);
  const targetImg = part.imageUrl;

  // 검증된 실물 사진이 존재하고 에러가 없는 경우에만 이미지 렌더링
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

  // 실물과 동일한 정밀 하드웨어 비주얼 렌더러 (오매칭 외부 이미지 원천 차단)
  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-1 shadow-2xs select-none transition group hover:border-slate-300 ${className}`}
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

/**
 * 부품 모델별 맞춤형 정밀 하드웨어 비주얼 SVG 렌더러
 * - 외부 CDN의 잘못된 카테고리(신발, 패션 등) 매칭을 원천 제거하고
 * - 각 부품의 실제 폼팩터, 히트스프레더, 쿨러 팬, 브랜딩 색상을 정확히 반영
 */
function renderHardwareVisual(category: keyof BuildState, part: PartOption) {
  const name = part.name.toLowerCase();

  switch (category) {
    case "cpu": {
      const isAmd =
        name.includes("ryzen") ||
        name.includes("amd") ||
        name.includes("5600") ||
        name.includes("7500") ||
        name.includes("7800") ||
        name.includes("9600") ||
        name.includes("9800") ||
        name.includes("9950");

      if (isAmd) {
        // AMD Ryzen (AM5 / AM4 특유의 히트스프레더 형태 & 오렌지 각인)
        return (
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
            {/* AM5 다크 서브스트레이트 PCB 기판 */}
            <rect x="4" y="4" width="36" height="36" rx="2.5" fill="#1e293b" />
            <rect x="5" y="5" width="34" height="34" rx="2" fill="#0f172a" />
            {/* 금도금 모서리 마커 (골드 트라이앵글) */}
            <polygon points="5,5 11,5 5,11" fill="#f59e0b" />
            {/* AM5 특유의 문어발형 8개 홈 히트스프레더 */}
            <rect x="9" y="9" width="26" height="26" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            {/* 중앙 레이저 각인 영역 */}
            <rect x="13" y="13" width="18" height="18" rx="1" fill="#e2e8f0" />
            {/* AMD RYZEN 오렌지 브랜드 바 & 라인 */}
            <line x1="15" y1="17" x2="29" y2="17" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="15" y1="21" x2="25" y2="21" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
            <line x1="15" y1="24" x2="27" y2="24" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
            <line x1="15" y1="27" x2="21" y2="27" stroke="#94a3b8" strokeWidth="0.8" strokeLinecap="round" />
          </svg>
        );
      }

      // Intel Core (LGA 1700/1851 직사각형 폼팩터 & 인텔 블루 각인)
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* LGA 직사각형 기판 */}
          <rect x="6" y="4" width="32" height="36" rx="2.5" fill="#1e293b" />
          <rect x="7" y="5" width="30" height="34" rx="2" fill="#0f172a" />
          {/* 금도금 정렬 핀 */}
          <polygon points="7,5 12,5 7,10" fill="#f59e0b" />
          {/* 실버 니켈 도금 직사각형 IHS 히트스프레더 */}
          <rect x="10" y="8" width="24" height="28" rx="2" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          {/* 좌우 고정 날개 홈 */}
          <rect x="9" y="18" width="2" height="8" rx="1" fill="#0f172a" />
          <rect x="33" y="18" width="2" height="8" rx="1" fill="#0f172a" />
          {/* Intel 블루 레이저 각인 */}
          <rect x="14" y="12" width="16" height="20" rx="1" fill="#e2e8f0" />
          <line x1="16" y1="16" x2="28" y2="16" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16" y1="20" x2="26" y2="20" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
          <line x1="16" y1="23" x2="28" y2="23" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    }

    case "gpu": {
      // 내장 그래픽 옵션
      const isIntegrated = part.price === 0 || name.includes("내장") || name.includes("apu");
      if (isIntegrated) {
        return (
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
            <rect x="6" y="6" width="32" height="32" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <rect x="12" y="12" width="20" height="20" rx="2" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="22" cy="22" r="5" fill="#38bdf8" opacity="0.3" />
            <path d="M18 22 L26 22 M22 18 L22 26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="18" y="34" width="8" height="2" fill="#f59e0b" />
          </svg>
        );
      }

      const isTriple = (part.len || 240) > 280;
      const isNvidia = !name.includes("radeon") && !name.includes("rx");
      const ledColor = isNvidia ? "#10b981" : "#ef4444"; // 지포스 에메랄드 그린 / 라데온 레드

      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* GPU 건메탈 슈라우드 하우징 */}
          <rect x="4" y="10" width="36" height="24" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* 상단 메탈 백플레이트 엣지 */}
          <rect x="4" y="9" width="36" height="3" rx="1" fill="#64748b" />
          {/* 상단 측면 LED 라인 */}
          <line x1="6" y1="13" x2="22" y2="13" stroke={ledColor} strokeWidth="1.8" strokeLinecap="round" />
          {/* 쿨링팬 3개 (트리플) 또는 2개 (듀얼) */}
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
          {/* 하단 골드 PCIe x16 단자 접점 */}
          <rect x="10" y="34" width="18" height="2.5" rx="0.5" fill="#f59e0b" />
          <rect x="30" y="34" width="6" height="2.5" rx="0.5" fill="#f59e0b" />
        </svg>
      );
    }

    case "mb": {
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 블랙 다층 PCB 기판 */}
          <rect x="5" y="5" width="34" height="34" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          {/* 대형 VRM 전원부 알루미늄 방열판 */}
          <rect x="7" y="7" width="8" height="15" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="0.6" />
          <rect x="15" y="7" width="13" height="5" rx="1" fill="#475569" stroke="#94a3b8" strokeWidth="0.6" />
          {/* CPU 소켓 */}
          <rect x="16" y="13" width="10" height="10" rx="1" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          <rect x="18" y="15" width="6" height="6" fill="#94a3b8" opacity="0.6" />
          {/* RAM 슬롯 2개 */}
          <rect x="30" y="9" width="2" height="16" rx="0.5" fill="#334155" />
          <rect x="34" y="9" width="2" height="16" rx="0.5" fill="#334155" />
          {/* 스틸 아머 강화 PCIe 4.0/5.0 슬롯 */}
          <rect x="8" y="27" width="26" height="3" rx="0.6" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
          {/* M.2 방열판 및 칩셋 히트싱크 */}
          <rect x="8" y="31" width="14" height="4" rx="0.8" fill="#334155" />
          <rect x="25" y="31" width="10" height="6" rx="1" fill="#475569" />
        </svg>
      );
    }

    case "ram": {
      const isRgb = name.includes("rgb") || name.includes("cl30");
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 듀얼 채널 구성 - 후면 모듈 실루엣 */}
          <rect x="16" y="7" width="8" height="27" rx="1.5" fill="#1e293b" opacity="0.5" />
          {/* 전면 튜닝 방열판 본체 */}
          <rect x="9" y="10" width="26" height="24" rx="2" fill="#334155" stroke="#475569" strokeWidth="0.8" />
          {/* 방열판 알루미늄 슬롯 엠보싱 */}
          <line x1="13" y1="18" x2="31" y2="18" stroke="#1e293b" strokeWidth="1" />
          <line x1="13" y1="22" x2="31" y2="22" stroke="#1e293b" strokeWidth="1" />
          <line x1="13" y1="26" x2="31" y2="26" stroke="#1e293b" strokeWidth="1" />
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
            x="9"
            y="9"
            width="26"
            height="3.5"
            rx="1"
            fill={isRgb ? "url(#rgbGrad)" : "#cbd5e1"}
          />
          {/* 하단 골드 접점 핀 단자 */}
          <rect x="11" y="34" width="22" height="2" fill="#f59e0b" />
        </svg>
      );
    }

    case "storage": {
      const isSata = (part.sub || "").includes("SATA") || name.includes("870 evo");
      if (isSata) {
        // 2.5인치 SATA SSD (메탈 하우징 & 브랜드 라벨)
        return (
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
            <rect x="7" y="10" width="30" height="24" rx="2.5" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <rect x="11" y="13" width="22" height="13" rx="1.5" fill="#334155" />
            <line x1="14" y1="17" x2="24" y2="17" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="21" x2="28" y2="21" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
            {/* 하단 SATA 전원 및 데이터 핀 */}
            <rect x="11" y="34" width="14" height="2" fill="#f59e0b" />
            <rect x="27" y="34" width="8" height="2" fill="#f59e0b" />
          </svg>
        );
      }
      // 고속 M.2 NVMe SSD (2280 규격 스틱 & 히트싱크)
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* M.2 기판 */}
          <rect x="7" y="14" width="30" height="16" rx="1.5" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
          {/* 알루미늄 방열판 패널 */}
          <rect x="10" y="15" width="24" height="14" rx="1" fill="#334155" stroke="#64748b" strokeWidth="0.5" />
          {/* 낸드 플래시 메모리 & 컨트롤러 칩 */}
          <rect x="12" y="17" width="8" height="10" rx="0.5" fill="#0f172a" />
          <rect x="22" y="17" width="10" height="10" rx="0.5" fill="#0f172a" />
          {/* 금도금 M.2 커넥터 핀 */}
          <rect x="36" y="16" width="2" height="12" fill="#f59e0b" />
          {/* 고정 나사 체결 홈 */}
          <circle cx="7" cy="22" r="1.5" fill="#f8fafc" />
        </svg>
      );
    }

    case "cooler": {
      const isAio =
        part.type === "aio" ||
        name.includes("kraken") ||
        name.includes("liquid") ||
        name.includes("수랭");

      if (isAio) {
        // 일체형 3열 / 2열 수랭 쿨러 (라디에이터 + 튜브 + LCD 인피니티 미러 펌프 헤드)
        return (
          <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
            {/* 상단 라디에이터 및 팬 */}
            <rect x="6" y="7" width="32" height="10" rx="1.5" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
            <circle cx="14" cy="12" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
            <circle cx="22" cy="12" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
            <circle cx="30" cy="12" r="3.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
            {/* 슬리빙 직조 쿨링 호스 2가닥 */}
            <path d="M12 17 Q 10 26, 18 28" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 17 Q 14 28, 22 30" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" />
            {/* 원형 워터블럭 펌프 헤드 (인피니티 미러 ARGB 발광) */}
            <circle cx="22" cy="30" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <circle cx="22" cy="30" r="5" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="22" cy="30" r="2.5" fill="#38bdf8" opacity="0.8" />
          </svg>
        );
      }

      // 공랭 쿨러 (대형 알루미늄 타워 핀 스택 & 구리 히트파이프 & 120mm 팬)
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 공랭 타워 방열핀 스택 */}
          <rect x="10" y="11" width="24" height="22" rx="1.5" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
          {/* 수평 방열핀 라인 */}
          {[14, 17, 20, 23, 26, 29].map((y) => (
            <line key={y} x1="10" y1={y} x2="34" y2={y} stroke="#94a3b8" strokeWidth="0.8" />
          ))}
          {/* 상단 돌출 순구리 히트파이프 캡 4개 */}
          {[14, 19, 25, 30].map((x) => (
            <rect key={x} x={x - 1} y="8" width="2" height="3.5" rx="0.5" fill="#b45309" />
          ))}
          {/* 전면 120mm 쿨링팬 하우징 */}
          <rect x="7" y="12" width="6" height="20" rx="1" fill="#1e293b" />
          <circle cx="10" cy="22" r="2" fill="#64748b" />
        </svg>
      );
    }

    case "psu": {
      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 파워 무광 블랙 강판 섀시 */}
          <rect x="6" y="10" width="32" height="24" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {/* 골드 80PLUS 원형 흡기 팬 그릴 */}
          <circle cx="20" cy="22" r="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="20" cy="22" r="5" fill="none" stroke="#f59e0b" strokeWidth="0.6" />
          <circle cx="20" cy="22" r="2.5" fill="#f59e0b" />
          {/* 우측 풀모듈러 케이블 포트 단자 배열 */}
          <rect x="31" y="13" width="4" height="3" fill="#0f172a" />
          <rect x="31" y="18" width="4" height="3" fill="#0f172a" />
          <rect x="31" y="23" width="4" height="6" fill="#0f172a" />
        </svg>
      );
    }

    case "case": {
      const isPanoramic =
        name.includes("어항") ||
        name.includes("파노라마") ||
        name.includes("o11d") ||
        name.includes("vision") ||
        name.includes("s401");
      const isWood = name.includes("north") || name.includes("우드");

      return (
        <svg viewBox="0 0 44 44" className="w-full h-full drop-shadow-xs">
          {/* 메인 케이스 프레임 섀시 */}
          <rect x="8" y="6" width="28" height="32" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1" />
          {isWood ? (
            /* Fractal North 북유럽 원목 루버 슬랫 & 골드 포인트 */
            <>
              <rect x="10" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="14" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="18" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="22" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="26" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              <rect x="30" y="8" width="3" height="28" fill="#78350f" rx="0.5" />
              {/* 상단 골드 전원 버튼 */}
              <circle cx="33" cy="7" r="0.8" fill="#f59e0b" />
            </>
          ) : isPanoramic ? (
            /* 어항형 듀얼 챔버 파노라마 강화유리 쇼케이스 (O11D EVO, S401 등) */
            <>
              {/* 전면/측면 강화유리 쇼케이스 영역 */}
              <rect
                x="10"
                y="8"
                width="24"
                height="22"
                rx="1"
                fill="#38bdf8"
                opacity="0.25"
                stroke="#38bdf8"
                strokeWidth="0.8"
              />
              {/* 내부 튜닝 팬 발광 실루엣 */}
              <circle cx="22" cy="17" r="4" fill="#38bdf8" opacity="0.6" />
              <rect x="12" y="22" width="12" height="3" rx="0.5" fill="#94a3b8" opacity="0.8" />
              {/* 하단 파워/드라이브 챔버 */}
              <rect x="10" y="30" width="24" height="6" rx="1" fill="#0f172a" />
            </>
          ) : (
            /* 전면 3팬 고통기성 메쉬 케이스 (DLX21, DK352 등) */
            <>
              <rect x="10" y="8" width="24" height="22" rx="1" fill="#0f172a" />
              {/* 전면 흡기 120mm RGB 링팬 3개 */}
              <circle cx="16" cy="12" r="3" fill="#38bdf8" opacity="0.8" />
              <circle cx="16" cy="18" r="3" fill="#38bdf8" opacity="0.8" />
              <circle cx="16" cy="24" r="3" fill="#38bdf8" opacity="0.8" />
              {/* 하단 파워 슈라우드 */}
              <rect x="10" y="30" width="24" height="6" rx="1" fill="#0f172a" />
            </>
          )}
          {/* 하단 고무 진동 방지 스탠드 받침대 */}
          <rect x="10" y="38" width="4" height="1.5" rx="0.3" fill="#09090b" />
          <rect x="30" y="38" width="4" height="1.5" rx="0.3" fill="#09090b" />
        </svg>
      );
    }

    default:
      return null;
  }
}
