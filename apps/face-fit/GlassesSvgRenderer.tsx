import React from "react";
import { GlassesOption, GlassesColorOption, LensTintOption } from "./catalog";

export interface GlassesSvgRendererProps {
  glasses: GlassesOption;
  color: GlassesColorOption;
  lensTint: LensTintOption;
  cx: number;
}

export const GlassesSvgRenderer: React.FC<GlassesSvgRendererProps> = ({
  glasses,
  color,
  lensTint,
  cx,
}) => {
  // 눈 위치(y = 192)에 완벽하게 일치하는 안경 중심선
  const cy = 192;
  const frameColor = color.frameColor;
  const templeColor = color.templeColor;
  const opacity = color.opacity;

  // 동공 중심(cx +- 38)에 완벽하게 비례하는 렌즈 중심
  const leftLensX = cx - 36;
  const rightLensX = cx + 36;
  const lensFill = "url(#lensTintGrad)";

  // 코받침 (Nose Pads) 실리콘 패드 렌더러
  const renderNosePads = (isMetal = true) => (
    <g id="nosePads" opacity={0.88}>
      {/* 좌측 패드 암 & 실리콘 패드 */}
      <path
        d={`M ${cx - 10} ${cy - 1} Q ${cx - 7} ${cy + 3} ${cx - 8} ${cy + 8}`}
        stroke={isMetal ? "#94a3b8" : "#cbd5e1"}
        strokeWidth="1.2"
        fill="none"
      />
      <ellipse cx={cx - 8} cy={cy + 7} rx="2.2" ry="4.0" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" opacity="0.85" />

      {/* 우측 패드 암 & 실리콘 패드 */}
      <path
        d={`M ${cx + 10} ${cy - 1} Q ${cx + 7} ${cy + 3} ${cx + 8} ${cy + 8}`}
        stroke={isMetal ? "#94a3b8" : "#cbd5e1"}
        strokeWidth="1.2"
        fill="none"
      />
      <ellipse cx={cx + 8} cy={cy + 7} rx="2.2" ry="4.0" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" opacity="0.85" />
    </g>
  );

  // 렌즈 광택 반사광 (대각선 더블 슬릿 반사)
  const renderLensGlint = (x: number, y: number, w: number, h: number, rx = 7) => (
    <g opacity={0.55} pointerEvents="none">
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="url(#lensReflect)" />
      {/* 렌즈 상단 미세 하이라이트 라인 */}
      <path
        d={`M ${x + 5} ${y + 3} Q ${x + w / 2} ${y + 1.5} ${x + w - 5} ${y + 3}`}
        stroke="#ffffff"
        strokeWidth="1.0"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </g>
  );

  switch (glasses.shapeStyle) {
    // 1. 아넬형 뿔테 (Moscot / Tart Optical 클래식 보스턴)
    case "arnel":
      return (
        <g id="glassesArnel" opacity={opacity}>
          {/* 키홀 브릿지 (Keyhole Bridge) */}
          <path
            d={`M ${leftLensX + 17} ${cy - 6} C ${cx - 6} ${cy - 9}, ${cx + 6} ${cy - 9}, ${rightLensX - 17} ${cy - 6} L ${rightLensX - 17} ${cy + 5} C ${cx + 5} ${cy + 1}, ${cx + 3} ${cy - 3}, ${cx} ${cy - 3} C ${cx - 3} ${cy - 3}, ${cx - 5} ${cy + 1}, ${leftLensX + 17} ${cy + 5} Z`}
            fill={frameColor}
          />
          {/* 브릿지 상단 미세 하이라이트 */}
          <path
            d={`M ${cx - 10} ${cy - 7} Q ${cx} ${cy - 8.5} ${cx + 10} ${cy - 7}`}
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.3"
          />

          {/* 좌측 렌즈 & 세련된 아세테이트 림 */}
          <rect
            x={leftLensX - 20}
            y={cy - 15}
            width="38"
            height="31"
            rx="9"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          {renderLensGlint(leftLensX - 18, cy - 13, 34, 27, 7)}

          {/* 우측 렌즈 & 세련된 아세테이트 림 */}
          <rect
            x={rightLensX - 18}
            y={cy - 15}
            width="38"
            height="31"
            rx="9"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          {renderLensGlint(rightLensX - 16, cy - 13, 34, 27, 7)}

          {/* 아넬 시그니처: 프론트 엔드피스 다이아몬드 리벳 */}
          <g id="rivetsArnel">
            <polygon
              points={`${leftLensX - 18},${cy - 10} ${leftLensX - 16.5},${cy - 8.5} ${leftLensX - 18},${cy - 7} ${leftLensX - 19.5},${cy - 8.5}`}
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="0.4"
            />
            <polygon
              points={`${rightLensX + 18},${cy - 10} ${rightLensX + 19.5},${cy - 8.5} ${rightLensX + 18},${cy - 7} ${rightLensX + 16.5},${cy - 8.5}`}
              fill="#e2e8f0"
              stroke="#94a3b8"
              strokeWidth="0.4"
            />
          </g>

          {/* 템플 (다리) */}
          <path
            d={`M ${leftLensX - 20} ${cy - 9} C ${leftLensX - 28} ${cy - 8}, ${leftLensX - 36} ${cy - 7}, ${leftLensX - 44} ${cy - 6}`}
            stroke={templeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M ${rightLensX + 20} ${cy - 9} C ${rightLensX + 28} ${cy - 8}, ${rightLensX + 36} ${cy - 7}, ${rightLensX + 44} ${cy - 6}`}
            stroke={templeColor}
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );

    // 2. 크라운 판토 (프렌치 빈티지 각진 상단)
    case "crown_panto":
      return (
        <g id="glassesCrownPanto" opacity={opacity}>
          {/* 브릿지 */}
          <path
            d={`M ${leftLensX + 16} ${cy - 7} C ${cx - 5} ${cy - 10}, ${cx + 5} ${cy - 10}, ${rightLensX - 16} ${cy - 7} L ${rightLensX - 16} ${cy - 2} C ${cx + 4} ${cy - 4}, ${cx - 4} ${cy - 4}, ${leftLensX + 16} ${cy - 2} Z`}
            fill={frameColor}
          />

          {/* 좌측 프렌치 판토 림: 상단 3다면 + 하단 보스턴 라운드 */}
          <path
            d={`
              M ${leftLensX - 19} ${cy - 6}
              L ${leftLensX - 9} ${cy - 15}
              L ${leftLensX + 9} ${cy - 15}
              L ${leftLensX + 17} ${cy - 6}
              C ${leftLensX + 19} ${cy + 9}, ${leftLensX + 8} ${cy + 17}, ${leftLensX - 1} ${cy + 17}
              C ${leftLensX - 10} ${cy + 17}, ${leftLensX - 20} ${cy + 9}, ${leftLensX - 19} ${cy - 6}
              Z
            `}
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          {renderLensGlint(leftLensX - 16, cy - 13, 32, 27, 8)}

          {/* 우측 프렌치 판토 림 */}
          <path
            d={`
              M ${rightLensX + 19} ${cy - 6}
              L ${rightLensX + 9} ${cy - 15}
              L ${rightLensX - 9} ${cy - 15}
              L ${rightLensX - 17} ${cy - 6}
              C ${rightLensX - 19} ${cy + 9}, ${rightLensX - 8} ${cy + 17}, ${rightLensX + 1} ${cy + 17}
              C ${rightLensX + 10} ${cy + 17}, ${rightLensX + 20} ${cy + 9}, ${rightLensX + 19} ${cy - 6}
              Z
            `}
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          {renderLensGlint(rightLensX - 16, cy - 13, 32, 27, 8)}

          {/* 원형 리벳 핀 */}
          <circle cx={leftLensX - 17} cy={cy - 8} r="1.1" fill="#cbd5e1" />
          <circle cx={rightLensX + 17} cy={cy - 8} r="1.1" fill="#cbd5e1" />

          {/* 템플 */}
          <line x1={leftLensX - 19} y1={cy - 7} x2={leftLensX - 42} y2={cy - 5} stroke={templeColor} strokeWidth="2.8" strokeLinecap="round" />
          <line x1={rightLensX + 19} y1={cy - 7} x2={rightLensX + 42} y2={cy - 5} stroke={templeColor} strokeWidth="2.8" strokeLinecap="round" />
        </g>
      );

    // 3. 하금테 (블로우라인 - 상단 두터운 아세테이트 + 하단 슬림 메탈)
    case "browline":
      return (
        <g id="glassesBrowline" opacity={opacity}>
          {renderNosePads(true)}
          {/* 메탈 브릿지 */}
          <path
            d={`M ${leftLensX + 17} ${cy - 5} Q ${cx} ${cy - 8} ${rightLensX - 17} ${cy - 5}`}
            stroke="#94a3b8"
            strokeWidth="2.0"
            fill="none"
          />

          {/* 좌측 하단 메탈 와이어 림 */}
          <rect
            x={leftLensX - 19}
            y={cy - 14}
            width="37"
            height="30"
            rx="8"
            fill={lensFill}
            stroke="#94a3b8"
            strokeWidth="1.6"
          />
          {renderLensGlint(leftLensX - 17, cy - 12, 33, 26, 7)}

          {/* 우측 하단 메탈 와이어 림 */}
          <rect
            x={rightLensX - 18}
            y={cy - 14}
            width="37"
            height="30"
            rx="8"
            fill={lensFill}
            stroke="#94a3b8"
            strokeWidth="1.6"
          />
          {renderLensGlint(rightLensX - 16, cy - 12, 33, 26, 7)}

          {/* 좌측 상단 강렬한 눈썹(블로우) 아세테이트 바 */}
          <path
            d={`M ${leftLensX - 22} ${cy - 7} C ${leftLensX - 22} ${cy - 15}, ${leftLensX - 8} ${cy - 17}, ${leftLensX + 18} ${cy - 14} L ${leftLensX + 18} ${cy - 9} C ${leftLensX - 3} ${cy - 11}, ${leftLensX - 17} ${cy - 10}, ${leftLensX - 22} ${cy - 7} Z`}
            fill={frameColor}
          />
          {/* 우측 상단 눈썹 아세테이트 바 */}
          <path
            d={`M ${rightLensX + 22} ${cy - 7} C ${rightLensX + 22} ${cy - 15}, ${rightLensX + 8} ${cy - 17}, ${rightLensX - 18} ${cy - 14} L ${rightLensX - 18} ${cy - 9} C ${rightLensX + 3} ${cy - 11}, ${rightLensX + 17} ${cy - 10}, ${rightLensX + 22} ${cy - 7} Z`}
            fill={frameColor}
          />

          {/* 엔드피스 실버 핀 */}
          <circle cx={leftLensX - 20} cy={cy - 11} r="1.1" fill="#f8fafc" />
          <circle cx={rightLensX + 20} cy={cy - 11} r="1.1" fill="#f8fafc" />

          {/* 템플 */}
          <line x1={leftLensX - 22} y1={cy - 10} x2={leftLensX - 44} y2={cy - 7} stroke={templeColor} strokeWidth="3.2" strokeLinecap="round" />
          <line x1={rightLensX + 22} y1={cy - 10} x2={rightLensX + 44} y2={cy - 7} stroke={templeColor} strokeWidth="3.2" strokeLinecap="round" />
        </g>
      );

    // 4. 원형 티타늄 메탈 (라운드 클래식 메탈)
    case "round_metal":
      return (
        <g id="glassesRoundMetal" opacity={opacity}>
          {renderNosePads(true)}
          {/* 아치형 슬림 메탈 브릿지 */}
          <path
            d={`M ${leftLensX + 16} ${cy - 2} Q ${cx} ${cy - 7} ${rightLensX - 16} ${cy - 2}`}
            stroke={frameColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* 좌측 원형 렌즈 & 초정밀 티타늄 림 */}
          <circle
            cx={leftLensX}
            cy={cy}
            r="16.5"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.0"
          />
          {renderLensGlint(leftLensX - 14, cy - 14, 28, 28, 14)}

          {/* 우측 원형 렌즈 & 초정밀 티타늄 림 */}
          <circle
            cx={rightLensX}
            cy={cy}
            r="16.5"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.0"
          />
          {renderLensGlint(rightLensX - 14, cy - 14, 28, 28, 14)}

          {/* 슬림 템플 */}
          <line x1={leftLensX - 16.5} y1={cy - 2} x2={leftLensX - 42} y2={cy - 3} stroke={templeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1={rightLensX + 16.5} y1={cy - 2} x2={rightLensX + 42} y2={cy - 3} stroke={templeColor} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );

    // 5. 스퀘어 사각 메탈 (샤프한 직사각 메탈)
    case "square_metal":
      return (
        <g id="glassesSquareMetal" opacity={opacity}>
          {renderNosePads(true)}
          <path
            d={`M ${leftLensX + 17} ${cy - 3} Q ${cx} ${cy - 6} ${rightLensX - 17} ${cy - 3}`}
            stroke={frameColor}
            strokeWidth="2.0"
            fill="none"
          />

          <rect
            x={leftLensX - 19}
            y={cy - 13}
            width="37"
            height="27"
            rx="5"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.0"
          />
          {renderLensGlint(leftLensX - 17, cy - 11, 33, 23, 4)}

          <rect
            x={rightLensX - 18}
            y={cy - 13}
            width="37"
            height="27"
            rx="5"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.0"
          />
          {renderLensGlint(rightLensX - 16, cy - 11, 33, 23, 4)}

          <line x1={leftLensX - 19} y1={cy - 5} x2={leftLensX - 42} y2={cy - 4} stroke={templeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1={rightLensX + 18} y1={cy - 5} x2={rightLensX + 42} y2={cy - 4} stroke={templeColor} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );

    // 6. 보스턴형 콤비 / 다각 메탈
    case "boston_combi":
    case "octa_metal":
      return (
        <g id="glassesBostonCombi" opacity={opacity}>
          {renderNosePads(true)}
          <path
            d={`M ${leftLensX + 16} ${cy - 3} Q ${cx} ${cy - 7} ${rightLensX - 16} ${cy - 3}`}
            stroke={frameColor}
            strokeWidth="2.0"
            fill="none"
          />

          {/* 좌측 팔각 림 */}
          <polygon
            points={`
              ${leftLensX - 11},${cy - 15}
              ${leftLensX + 11},${cy - 15}
              ${leftLensX + 17},${cy - 6}
              ${leftLensX + 17},${cy + 7}
              ${leftLensX + 11},${cy + 15}
              ${leftLensX - 11},${cy + 15}
              ${leftLensX - 17},${cy + 7}
              ${leftLensX - 17},${cy - 6}
            `}
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.0"
            strokeLinejoin="round"
          />
          {renderLensGlint(leftLensX - 15, cy - 13, 30, 26, 6)}

          {/* 우측 팔각 림 */}
          <polygon
            points={`
              ${rightLensX - 11},${cy - 15}
              ${rightLensX + 11},${cy - 15}
              ${rightLensX + 17},${cy - 6}
              ${rightLensX + 17},${cy + 7}
              ${rightLensX + 11},${cy + 15}
              ${rightLensX - 11},${cy + 15}
              ${rightLensX - 17},${cy + 7}
              ${rightLensX - 17},${cy - 6}
            `}
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="2.0"
            strokeLinejoin="round"
          />
          {renderLensGlint(rightLensX - 15, cy - 13, 30, 26, 6)}

          <line x1={leftLensX - 17} y1={cy - 4} x2={leftLensX - 42} y2={cy - 4} stroke={templeColor} strokeWidth="1.8" strokeLinecap="round" />
          <line x1={rightLensX + 17} y1={cy - 4} x2={rightLensX + 42} y2={cy - 4} stroke={templeColor} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      );

    // 7. 투명 클리어 뿔테 (샴페인/크리스탈 아세테이트)
    case "clear_horn":
      return (
        <g id="glassesClearHorn" opacity={opacity}>
          {/* 투명 아세테이트 브릿지 & 내부 메탈 심지 와이어 */}
          <path
            d={`M ${leftLensX + 17} ${cy - 5} C ${cx - 5} ${cy - 8}, ${cx + 5} ${cy - 8}, ${rightLensX - 17} ${cy - 5} L ${rightLensX - 17} ${cy + 3} C ${cx + 4} ${cy}, ${cx - 4} ${cy}, ${leftLensX + 17} ${cy + 3} Z`}
            fill={frameColor}
            stroke="#ffffff"
            strokeWidth="0.8"
          />

          <rect
            x={leftLensX - 19}
            y={cy - 14}
            width="37"
            height="29"
            rx="8"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          {renderLensGlint(leftLensX - 17, cy - 12, 33, 25, 6)}

          <rect
            x={rightLensX - 18}
            y={cy - 14}
            width="37"
            height="29"
            rx="8"
            fill={lensFill}
            stroke={frameColor}
            strokeWidth="3.6"
            strokeLinejoin="round"
          />
          {renderLensGlint(rightLensX - 16, cy - 12, 33, 25, 6)}

          {/* 투명 템플 속 메탈 코어 와이어 (Luxury Core Wire) */}
          <line x1={leftLensX - 19} y1={cy - 7} x2={leftLensX - 42} y2={cy - 5} stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <path
            d={`M ${leftLensX - 19} ${cy - 7} L ${leftLensX - 42} ${cy - 5}`}
            stroke={frameColor}
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />

          <line x1={rightLensX + 18} y1={cy - 7} x2={rightLensX + 42} y2={cy - 5} stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
          <path
            d={`M ${rightLensX + 18} ${cy - 7} L ${rightLensX + 42} ${cy - 5}`}
            stroke={frameColor}
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      );

    // 8. 무테 (미니멀 림리스 티타늄)
    case "rimless":
      return (
        <g id="glassesRimless" opacity={opacity}>
          {renderNosePads(true)}
          {/* 미니멀 브릿지 */}
          <path
            d={`M ${leftLensX + 16} ${cy - 2} Q ${cx} ${cy - 6} ${rightLensX - 16} ${cy - 2}`}
            stroke={frameColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          {/* 렌즈 결합 실버 나사 핀 */}
          <circle cx={leftLensX + 14} cy={cy - 2} r="1.0" fill="#64748b" />
          <circle cx={rightLensX - 14} cy={cy - 2} r="1.0" fill="#64748b" />

          {/* 무테 렌즈 본체 (외곽선 없이 렌즈 틴트와 은은한 글래스 엣지 반사만 존재) */}
          <rect
            x={leftLensX - 18}
            y={cy - 13}
            width="35"
            height="27"
            rx="7"
            fill={lensFill}
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.75"
          />
          {renderLensGlint(leftLensX - 16, cy - 11, 31, 23, 6)}

          <rect
            x={rightLensX - 17}
            y={cy - 13}
            width="35"
            height="27"
            rx="7"
            fill={lensFill}
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeOpacity="0.75"
          />
          {renderLensGlint(rightLensX - 15, cy - 11, 31, 23, 6)}

          {/* 템플 결합 나사 및 미니멀 티타늄 템플 */}
          <circle cx={leftLensX - 16} cy={cy - 4} r="1.0" fill="#64748b" />
          <line x1={leftLensX - 18} y1={cy - 4} x2={leftLensX - 42} y2={cy - 3} stroke={templeColor} strokeWidth="1.6" strokeLinecap="round" />

          <circle cx={rightLensX + 16} cy={cy - 4} r="1.0" fill="#64748b" />
          <line x1={rightLensX + 18} y1={cy - 4} x2={rightLensX + 42} y2={cy - 3} stroke={templeColor} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      );

    default:
      return null;
  }
};
