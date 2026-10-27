import React from "react";
import { HairColorOption } from "./catalog";

export interface HairSvgRendererProps {
  hairId: string;
  color: HairColorOption;
  cx: number;
  foreheadW: number;
  layer?: "back" | "front" | "all";
}

export const HairSvgRenderer: React.FC<HairSvgRendererProps> = ({
  hairId,
  color,
  cx,
  foreheadW,
  layer = "all",
}) => {
  const hairFill = "url(#hairGrad)";
  const highlightStroke = color.highlightHex;
  const shadowFill = color.shadowHex;

  // 이마 위 부드러운 앰비언트 그림자
  const renderForeheadShadow = (pathD: string, opacity = 0.15) => (
    <path d={pathD} fill="#09090b" opacity={opacity} pointerEvents="none" />
  );

  // 헤어 정수리 엔젤링 윤기 하이라이트
  const renderAngelRing = (pathD: string, opacity = 0.5, strokeWidth = 2.8) => (
    <path
      d={pathD}
      stroke={highlightStroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      opacity={opacity}
      pointerEvents="none"
    />
  );

  // 모발 결감 하이라이트 라인 (반드시 모발 실루엣 내부에만 위치)
  const renderStrand = (pathD: string, opacity = 0.5, strokeWidth = 1.6) => (
    <path
      d={pathD}
      stroke={highlightStroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
      opacity={opacity}
      pointerEvents="none"
    />
  );

  // ==========================================
  // 1. 시스루 댄디컷 (훈훈 남친룩 1위)
  // ==========================================
  if (hairId === "hair_seethrough_dandy") {
    if (layer === "back") {
      return (
        <g id="seethroughDandyBack">
          <path
            d={`
              M ${cx - 86} 145
              C ${cx - 96} 92, ${cx - 56} 68, ${cx} 68
              C ${cx + 56} 68, ${cx + 96} 92, ${cx + 86} 145
              C ${cx + 84} 190, ${cx + 76} 226, ${cx + 68} 230
              L ${cx + 62} 185
              L ${cx - 62} 185
              L ${cx - 68} 230
              C ${cx - 76} 226, ${cx - 84} 190, ${cx - 86} 145
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="seethroughDandyFront">
        {renderForeheadShadow(`M ${cx - 52} 140 C ${cx - 26} 166, ${cx + 26} 166, ${cx + 52} 140 Z`)}
        <path
          d={`
            M ${cx - 86} 145
            C ${cx - 96} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 96} 90, ${cx + 86} 145
            C ${cx + 86} 175, ${cx + 78} 205, ${cx + 74} 212
            L ${cx + 67} 170
            C ${cx + 64} 148, ${cx + 54} 160, ${cx + 42} 164
            C ${cx + 34} 164, ${cx + 30} 158, ${cx + 22} 162
            C ${cx + 14} 162, ${cx + 10} 156, ${cx + 2} 161
            C ${cx - 4} 158, ${cx - 10} 163, ${cx - 18} 163
            C ${cx - 26} 157, ${cx - 32} 164, ${cx - 42} 164
            C ${cx - 54} 160, ${cx - 64} 148, ${cx - 67} 170
            L ${cx - 74} 212
            C ${cx - 78} 205, ${cx - 86} 175, ${cx - 86} 145
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 44} 92 Q ${cx} 80 ${cx + 44} 92`)}
        {renderAngelRing(`M ${cx - 32} 102 Q ${cx} 92 ${cx + 32} 102`, 0.3, 2.0)}
      </g>
    );
  }

  // ==========================================
  // 2. 가일컷 (7:3 쉼표머리 반깐)
  // ==========================================
  if (hairId === "hair_guile") {
    if (layer === "back") {
      return (
        <g id="guileBack">
          <path
            d={`
              M ${cx - 88} 145
              C ${cx - 96} 92, ${cx - 56} 68, ${cx} 68
              C ${cx + 56} 68, ${cx + 96} 92, ${cx + 88} 145
              C ${cx + 86} 190, ${cx + 78} 226, ${cx + 70} 228
              L ${cx + 62} 185
              L ${cx - 62} 185
              L ${cx - 70} 228
              C ${cx - 78} 226, ${cx - 86} 190, ${cx - 88} 145
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="guileFront">
        <path
          d={`
            M ${cx - 88} 145
            C ${cx - 96} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 96} 90, ${cx + 88} 145
            C ${cx + 86} 180, ${cx + 80} 210, ${cx + 74} 216
            L ${cx + 67} 172
            C ${cx + 62} 142, ${cx + 40} 132, ${cx + 12} 134
            C ${cx - 4} 134, ${cx - 14} 142, ${cx - 15} 148
            C ${cx - 18} 165, ${cx - 28} 173, ${cx - 40} 173
            C ${cx - 32} 160, ${cx - 26} 146, ${cx - 38} 140
            C ${cx - 58} 140, ${cx - 64} 154, ${cx - 67} 174
            L ${cx - 74} 216
            C ${cx - 80} 210, ${cx - 86} 180, ${cx - 88} 145
            Z
          `}
          fill={hairFill}
        />
        {/* 쉼표 컬 윤기 */}
        {renderStrand(`M ${cx - 20} 146 Q ${cx - 26} 160 ${cx - 36} 168`, 0.65, 1.8)}
        {/* 올린 머리 윤기 */}
        {renderStrand(`M ${cx + 16} 136 C ${cx + 32} 134, ${cx + 52} 142, ${cx + 66} 158`, 0.55, 1.6)}
        {renderAngelRing(`M ${cx - 44} 92 Q ${cx} 80 ${cx + 44} 92`)}
      </g>
    );
  }

  // ==========================================
  // 3. 애즈펌 (S컬 가르마)
  // ==========================================
  if (hairId === "hair_as_perm") {
    if (layer === "back") {
      return (
        <g id="asPermBack">
          <path
            d={`
              M ${cx - 88} 145
              C ${cx - 96} 92, ${cx - 56} 68, ${cx} 68
              C ${cx + 56} 68, ${cx + 96} 92, ${cx + 88} 145
              C ${cx + 86} 190, ${cx + 78} 226, ${cx + 70} 228
              L ${cx + 62} 185
              L ${cx - 62} 185
              L ${cx - 70} 228
              C ${cx - 78} 226, ${cx - 86} 190, ${cx - 88} 145
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="asPermFront">
        {renderForeheadShadow(`M ${cx - 38} 142 Q ${cx} 136 ${cx + 38} 142 L ${cx + 28} 155 L ${cx - 28} 155 Z`)}
        <path
          d={`
            M ${cx - 88} 145
            C ${cx - 96} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 96} 90, ${cx + 88} 145
            C ${cx + 86} 180, ${cx + 78} 210, ${cx + 72} 216
            L ${cx + 66} 175
            C ${cx + 62} 150, ${cx + 46} 165, ${cx + 26} 165
            C ${cx + 15} 165, ${cx + 7} 155, ${cx + 6} 140
            C ${cx} 136, ${cx - 6} 140, ${cx - 7} 155
            C ${cx - 15} 165, ${cx - 26} 165, ${cx - 46} 165
            C ${cx - 62} 150, ${cx - 66} 175, ${cx - 72} 216
            C ${cx - 78} 210, ${cx - 86} 180, ${cx - 88} 145
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 44} 92 Q ${cx} 80 ${cx + 44} 92`)}
      </g>
    );
  }

  // ==========================================
  // 4. 리프컷 (감성적인 중단발)
  // ==========================================
  if (hairId === "hair_leaf") {
    if (layer === "back") {
      return (
        <g id="leafBack">
          <path
            d={`
              M ${cx - 84} 155
              C ${cx - 96} 200, ${cx - 105} 260, ${cx - 74} 320
              C ${cx - 44} 335, ${cx - 20} 320, ${cx} 310
              C ${cx + 20} 320, ${cx + 44} 335, ${cx + 74} 320
              C ${cx + 105} 260, ${cx + 96} 200, ${cx + 84} 155
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="leafFront">
        {renderForeheadShadow(`M ${cx - 36} 142 Q ${cx} 135 ${cx + 36} 142 L ${cx + 26} 156 L ${cx - 26} 156 Z`)}
        <path
          d={`
            M ${cx - 88} 145
            C ${cx - 96} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 96} 90, ${cx + 88} 145
            C ${cx + 88} 185, ${cx + 80} 220, ${cx + 74} 240
            C ${cx + 66} 210, ${cx + 60} 180, ${cx + 54} 172
            C ${cx + 42} 162, ${cx + 24} 165, ${cx + 12} 146
            C ${cx} 135, ${cx - 12} 146, ${cx - 24} 165
            C ${cx - 42} 162, ${cx - 54} 172, ${cx - 60} 180
            C ${cx - 66} 210, ${cx - 74} 240, ${cx - 74} 240
            C ${cx - 80} 220, ${cx - 88} 185, ${cx - 88} 145
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 44} 92 Q ${cx} 80 ${cx + 44} 92`)}
      </g>
    );
  }

  // ==========================================
  // 5. 아이비리그컷 (숏컷)
  // ==========================================
  if (hairId === "hair_ivy_league") {
    if (layer === "back") {
      return (
        <g id="ivyLeagueBack">
          <path
            d={`M ${cx - 84} 140 C ${cx - 90} 95, ${cx - 55} 74, ${cx} 74 C ${cx + 55} 74, ${cx + 90} 95, ${cx + 84} 140 C ${cx + 82} 175, ${cx + 74} 200, ${cx + 68} 205 L ${cx + 62} 165 L ${cx - 62} 165 L ${cx - 68} 205 C ${cx - 74} 200, ${cx - 82} 175, ${cx - 84} 140 Z`}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="ivyLeagueFront">
        <path
          d={`
            M ${cx - 84} 140
            C ${cx - 90} 92, ${cx - 55} 72, ${cx} 72 C ${cx + 55} 72, ${cx + 90} 92, ${cx + 84} 140
            C ${cx + 82} 170, ${cx + 74} 195, ${cx + 70} 200
            L ${cx + 65} 160
            C ${cx + 62} 136, ${cx + 50} 126, ${cx + 34} 122
            C ${cx + 18} 118, ${cx + 7} 118, ${cx} 116
            C ${cx - 7} 118, ${cx - 18} 118, ${cx - 34} 122
            C ${cx - 50} 126, ${cx - 62} 136, ${cx - 65} 160
            L ${cx - 70} 200
            C ${cx - 74} 195, ${cx - 82} 170, ${cx - 84} 140
            Z
          `}
          fill={hairFill}
        />
        {renderStrand(`M ${cx - 14} 120 Q ${cx - 10} 104 ${cx - 7} 92`, 0.6, 1.6)}
        {renderStrand(`M ${cx} 116 L ${cx} 86`, 0.7, 1.8)}
        {renderStrand(`M ${cx + 14} 120 Q ${cx + 10} 104 ${cx + 7} 92`, 0.6, 1.6)}
        {renderAngelRing(`M ${cx - 38} 92 Q ${cx} 80 ${cx + 38} 92`, 0.45)}
      </g>
    );
  }

  // ==========================================
  // 6. 쉐도우 펌
  // ==========================================
  if (hairId === "hair_shadow_perm") {
    if (layer === "back") {
      return (
        <g id="shadowPermBack">
          <path
            d={`M ${cx - 88} 145 C ${cx - 96} 92, ${cx - 60} 68, ${cx} 68 C ${cx + 60} 68, ${cx + 96} 92, ${cx + 88} 145 C ${cx + 86} 195, ${cx + 78} 225, ${cx + 70} 228 L ${cx + 64} 185 L ${cx - 64} 185 L ${cx - 70} 228 C ${cx - 78} 225, ${cx - 86} 195, ${cx - 88} 145 Z`}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="shadowPermFront">
        {renderForeheadShadow(`M ${cx - 52} 142 C ${cx - 26} 166, ${cx + 26} 166, ${cx + 52} 142 Z`)}
        <path
          d={`
            M ${cx - 88} 145
            C ${cx - 96} 90, ${cx - 60} 66, ${cx} 66 C ${cx + 60} 66, ${cx + 96} 90, ${cx + 88} 145
            C ${cx + 86} 178, ${cx + 80} 208, ${cx + 74} 215
            L ${cx + 68} 172
            C ${cx + 62} 150, ${cx + 50} 162, ${cx + 42} 162
            C ${cx + 32} 162, ${cx + 26} 154, ${cx + 18} 159
            C ${cx + 8} 164, ${cx + 3} 154, ${cx - 3} 157
            C ${cx - 10} 163, ${cx - 18} 154, ${cx - 24} 159
            C ${cx - 34} 163, ${cx - 42} 150, ${cx - 52} 163
            C ${cx - 62} 150, ${cx - 66} 172, ${cx - 70} 215
            C ${cx - 78} 208, ${cx - 86} 178, ${cx - 88} 145
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 44} 92 Q ${cx} 80 ${cx + 44} 92`)}
      </g>
    );
  }

  // ==========================================
  // 7. 슬릭백 언더컷
  // ==========================================
  if (hairId === "hair_slick_back") {
    if (layer === "back") {
      return (
        <g id="slickBackUnderBack">
          <path
            d={`M ${cx - 86} 140 C ${cx - 92} 95, ${cx - 56} 72, ${cx} 72 C ${cx + 56} 72, ${cx + 92} 95, ${cx + 86} 140 C ${cx + 84} 185, ${cx + 76} 210, ${cx + 70} 215 L ${cx + 64} 170 L ${cx - 64} 170 L ${cx - 70} 215 C ${cx - 76} 210, ${cx - 84} 185, ${cx - 86} 140 Z`}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="slickBackUnderFront">
        <path
          d={`
            M ${cx - 86} 140
            C ${cx - 92} 92, ${cx - 56} 70, ${cx} 70 C ${cx + 56} 70, ${cx + 92} 92, ${cx + 86} 140
            C ${cx + 84} 170, ${cx + 74} 200, ${cx + 70} 205
            L ${cx + 66} 160
            C ${cx + 62} 132, ${cx + 50} 120, ${cx + 32} 116
            C ${cx + 14} 113, ${cx - 14} 113, ${cx - 32} 116
            C ${cx - 50} 120, ${cx - 62} 132, ${cx - 66} 160
            L ${cx - 70} 205
            C ${cx - 74} 200, ${cx - 84} 170, ${cx - 86} 140
            Z
          `}
          fill={hairFill}
        />
        {renderStrand(`M ${cx - 20} 118 Q ${cx - 16} 96 ${cx - 12} 82`, 0.6, 1.6)}
        {renderStrand(`M ${cx} 114 L ${cx} 78`, 0.7, 2.0)}
        {renderStrand(`M ${cx + 20} 118 Q ${cx + 16} 96 ${cx + 12} 82`, 0.6, 1.6)}
        {renderAngelRing(`M ${cx - 42} 90 Q ${cx} 78 ${cx + 42} 90`)}
      </g>
    );
  }

  // ==========================================
  // 8. 레이어드 C컬펌 (여성 여신 헤어 1위)
  // ==========================================
  if (hairId === "hair_layered_c_curl") {
    if (layer === "back") {
      return (
        <g id="layeredCCurlBack">
          {/* 어깨와 가슴으로 흐르는 긴 웨이브 뒷머리 */}
          <path
            d={`
              M ${cx - 84} 148
              C ${cx - 105} 210, ${cx - 118} 280, ${cx - 96} 360
              C ${cx - 80} 395, ${cx - 50} 400, ${cx - 35} 390
              C ${cx - 15} 370, ${cx - 10} 320, ${cx - 20} 280
              L ${cx + 20} 280
              C ${cx + 10} 320, ${cx + 15} 370, ${cx + 35} 390
              C ${cx + 50} 400, ${cx + 80} 395, ${cx + 96} 360
              C ${cx + 118} 280, ${cx + 105} 210, ${cx + 84} 148
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="layeredCCurlFront">
        {/* 자연스러운 이마 위 소프트 섀도우 */}
        {renderForeheadShadow(`M ${cx - 38} 146 Q ${cx} 140 ${cx + 38} 146 L ${cx + 28} 158 L ${cx - 28} 158 Z`)}
        {/* 여성스러운 6:4 사이드뱅 & 안쪽 C컬 레이어 */}
        <path
          d={`
            M ${cx - 84} 142
            C ${cx - 94} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 94} 90, ${cx + 84} 142
            C ${cx + 88} 190, ${cx + 78} 240, ${cx + 66} 295
            C ${cx + 58} 325, ${cx + 40} 338, ${cx + 32} 330
            C ${cx + 42} 305, ${cx + 48} 255, ${cx + 48} 205
            C ${cx + 48} 180, ${cx + 24} 156, ${cx + 2} 146
            C ${cx - 2} 146, ${cx - 24} 156, ${cx - 48} 180
            C ${cx - 48} 205, ${cx - 48} 255, ${cx - 42} 305
            C ${cx - 34} 330, ${cx - 42} 338, ${cx - 58} 325
            C ${cx - 66} 295, ${cx - 78} 240, ${cx - 88} 190
            C ${cx - 84} 142, ${cx - 84} 142, ${cx - 84} 142
            Z
          `}
          fill={hairFill}
        />
        {/* 모발 내부 안쪽에만 은은하게 들어가는 결감 윤기 */}
        {renderStrand(`M ${cx - 68} 170 C ${cx - 65} 215, ${cx - 58} 260, ${cx - 46} 300`, 0.55, 1.8)}
        {renderStrand(`M ${cx + 68} 170 C ${cx + 65} 215, ${cx + 58} 260, ${cx + 46} 300`, 0.55, 1.8)}
        {renderAngelRing(`M ${cx - 44} 90 Q ${cx} 78 ${cx + 44} 90`)}
      </g>
    );
  }

  // 9. 태슬컷 단발 (칼단발)
  if (hairId === "hair_tassel_bob") {
    if (layer === "back") {
      return (
        <g id="tasselBobBack">
          <path
            d={`
              M ${cx - 84} 148
              C ${cx - 94} 195, ${cx - 92} 240, ${cx - 78} 268
              L ${cx + 78} 268
              C ${cx + 92} 240, ${cx + 94} 195, ${cx + 84} 148
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="tasselBobFront">
        {renderForeheadShadow(`M ${cx - 52} 140 C ${cx - 26} 164, ${cx + 26} 164, ${cx + 52} 140 Z`)}
        <path
          d={`
            M ${cx - 84} 142
            C ${cx - 94} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 94} 90, ${cx + 84} 142
            C ${cx + 88} 185, ${cx + 86} 230, ${cx + 76} 265
            L ${cx + 64} 265
            C ${cx + 62} 215, ${cx + 54} 172, ${cx + 38} 162
            C ${cx + 28} 162, ${cx + 22} 157, ${cx + 14} 159
            C ${cx + 6} 159, ${cx + 2} 155, ${cx - 2} 157
            C ${cx - 6} 155, ${cx - 12} 159, ${cx - 20} 159
            C ${cx - 28} 157, ${cx - 34} 162, ${cx - 42} 162
            C ${cx - 56} 172, ${cx - 64} 215, ${cx - 66} 265
            L ${cx - 78} 265
            C ${cx - 86} 230, ${cx - 88} 185, ${cx - 84} 142
            Z
          `}
          fill={hairFill}
        />
        {renderStrand(`M ${cx - 72} 215 L ${cx - 72} 255`, 0.5, 1.4)}
        {renderStrand(`M ${cx + 72} 215 L ${cx + 72} 255`, 0.5, 1.4)}
        {renderAngelRing(`M ${cx - 44} 90 Q ${cx} 78 ${cx + 44} 90`)}
      </g>
    );
  }

  // 10. 사이드뱅 롱웨이브
  if (hairId === "hair_sidebang_wave") {
    if (layer === "back") {
      return (
        <g id="sidebangWaveBack">
          <path
            d={`
              M ${cx - 86} 148
              C ${cx - 108} 210, ${cx - 120} 280, ${cx - 100} 370
              C ${cx - 85} 405, ${cx - 52} 410, ${cx - 35} 395
              L ${cx + 35} 395
              C ${cx + 52} 410, ${cx + 85} 405, ${cx + 100} 370
              C ${cx + 120} 280, ${cx + 108} 210, ${cx + 86} 148
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="sidebangWaveFront">
        {renderForeheadShadow(`M ${cx - 38} 146 Q ${cx} 140 ${cx + 38} 146 L ${cx + 28} 158 L ${cx - 28} 158 Z`)}
        <path
          d={`
            M ${cx - 84} 142
            C ${cx - 94} 90, ${cx - 56} 66, ${cx} 66
            C ${cx + 56} 66, ${cx + 94} 90, ${cx + 84} 142
            C ${cx + 88} 195, ${cx + 80} 250, ${cx + 70} 305
            C ${cx + 62} 335, ${cx + 42} 345, ${cx + 34} 335
            C ${cx + 44} 295, ${cx + 52} 240, ${cx + 52} 185
            C ${cx + 48} 178, ${cx + 24} 156, ${cx + 4} 146
            C ${cx - 4} 146, ${cx - 24} 156, ${cx - 48} 178
            C ${cx - 52} 215, ${cx - 44} 270, ${cx - 34} 325
            C ${cx - 44} 335, ${cx - 62} 325, ${cx - 70} 295
            C ${cx - 80} 240, ${cx - 88} 190, ${cx - 84} 142
            Z
          `}
          fill={hairFill}
        />
        {renderStrand(`M ${cx + 65} 170 C ${cx + 62} 215, ${cx + 56} 265, ${cx + 46} 310`, 0.65, 1.8)}
        {renderStrand(`M ${cx - 65} 170 C ${cx - 62} 215, ${cx - 56} 265, ${cx - 46} 310`, 0.65, 1.8)}
        {renderAngelRing(`M ${cx - 44} 90 Q ${cx} 78 ${cx + 44} 90`)}
      </g>
    );
  }

  // 11. 히피펌
  if (hairId === "hair_hippie_perm") {
    if (layer === "back") {
      return (
        <g id="hippiePermBack">
          <path
            d={`
              M ${cx - 90} 148
              C ${cx - 115} 210, ${cx - 128} 280, ${cx - 105} 370
              C ${cx - 88} 405, ${cx - 52} 410, ${cx - 35} 395
              L ${cx + 35} 395
              C ${cx + 52} 410, ${cx + 88} 405, ${cx + 105} 370
              C ${cx + 128} 280, ${cx + 115} 210, ${cx + 90} 148
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="hippieFront">
        {renderForeheadShadow(`M ${cx - 52} 140 C ${cx - 26} 164, ${cx + 26} 164, ${cx + 52} 140 Z`)}
        <path
          d={`
            M ${cx - 88} 142
            C ${cx - 98} 90, ${cx - 60} 66, ${cx} 66 C ${cx + 60} 66, ${cx + 98} 90, ${cx + 88} 142
            C ${cx + 92} 185, ${cx + 84} 230, ${cx + 78} 275
            L ${cx + 64} 275
            C ${cx + 62} 220, ${cx + 54} 180, ${cx + 42} 164
            C ${cx + 32} 164, ${cx + 24} 157, ${cx + 16} 161
            C ${cx + 8} 161, ${cx} 155, ${cx - 8} 161
            C ${cx - 16} 161, ${cx - 24} 157, ${cx - 32} 164
            C ${cx - 44} 180, ${cx - 52} 220, ${cx - 56} 275
            L ${cx - 68} 275
            C ${cx - 76} 230, ${cx - 84} 185, ${cx - 88} 142
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 44} 90 Q ${cx} 78 ${cx + 44} 90`)}
      </g>
    );
  }

  // 12. 허쉬컷
  if (hairId === "hair_hush_cut") {
    if (layer === "back") {
      return (
        <g id="hushCutBack">
          <path
            d={`
              M ${cx - 82} 155
              C ${cx - 95} 210, ${cx - 100} 270, ${cx - 75} 325
              L ${cx + 75} 325
              C ${cx + 100} 270, ${cx + 95} 210, ${cx + 82} 155
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="hushCutFront">
        {renderForeheadShadow(`M ${cx - 52} 140 C ${cx - 26} 164, ${cx + 26} 164, ${cx + 52} 140 Z`)}
        <path
          d={`
            M ${cx - 84} 142
            C ${cx - 94} 90, ${cx - 56} 66, ${cx} 66 C ${cx + 56} 66, ${cx + 94} 90, ${cx + 84} 142
            C ${cx + 86} 180, ${cx + 80} 215, ${cx + 74} 235
            L ${cx + 64} 205
            C ${cx + 60} 172, ${cx + 50} 160, ${cx + 40} 162
            C ${cx + 30} 162, ${cx + 22} 156, ${cx + 14} 158
            C ${cx + 6} 158, ${cx} 154, ${cx - 6} 158
            C ${cx - 14} 158, ${cx - 22} 156, ${cx - 30} 162
            C ${cx - 40} 160, ${cx - 50} 172, ${cx - 56} 205
            L ${cx - 66} 235
            C ${cx - 72} 215, ${cx - 78} 180, ${cx - 84} 142
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 44} 90 Q ${cx} 78 ${cx + 44} 90`)}
      </g>
    );
  }

  // 13. 픽시 숏컷
  if (hairId === "hair_pixie_cut") {
    if (layer === "back") {
      return (
        <g id="pixieBack">
          <path
            d={`M ${cx - 84} 140 C ${cx - 90} 95, ${cx - 55} 72, ${cx} 72 C ${cx + 55} 72, ${cx + 90} 95, ${cx + 84} 140 C ${cx + 82} 180, ${cx + 72} 205, ${cx + 66} 210 L ${cx + 60} 165 L ${cx - 60} 165 L ${cx - 66} 210 C ${cx - 72} 205, ${cx - 82} 180, ${cx - 84} 140 Z`}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="pixieFront">
        {renderForeheadShadow(`M ${cx - 48} 140 C ${cx - 24} 162, ${cx + 24} 162, ${cx + 48} 140 Z`)}
        <path
          d={`
            M ${cx - 84} 140
            C ${cx - 90} 90, ${cx - 55} 68, ${cx} 68 C ${cx + 55} 68, ${cx + 90} 90, ${cx + 84} 140
            C ${cx + 80} 170, ${cx + 72} 198, ${cx + 68} 205
            L ${cx + 62} 160
            C ${cx + 58} 138, ${cx + 46} 154, ${cx + 34} 157
            C ${cx + 22} 157, ${cx + 12} 152, ${cx + 2} 155
            C ${cx - 8} 155, ${cx - 18} 150, ${cx - 28} 156
            C ${cx - 40} 148, ${cx - 54} 150, ${cx - 60} 165
            L ${cx - 64} 205
            C ${cx - 68} 198, ${cx - 78} 170, ${cx - 84} 140
            Z
          `}
          fill={hairFill}
        />
        {renderAngelRing(`M ${cx - 42} 90 Q ${cx} 78 ${cx + 42} 90`)}
      </g>
    );
  }

  // 14. 빌드펌
  if (hairId === "hair_build_perm") {
    if (layer === "back") {
      return (
        <g id="buildPermBack">
          <path
            d={`
              M ${cx - 84} 148
              C ${cx - 105} 210, ${cx - 118} 275, ${cx - 96} 350
              C ${cx - 80} 380, ${cx - 50} 385, ${cx - 35} 375
              L ${cx + 35} 375
              C ${cx + 50} 385, ${cx + 80} 380, ${cx + 96} 350
              C ${cx + 118} 275, ${cx + 105} 210, ${cx + 84} 148
              Z
            `}
            fill={shadowFill}
          />
        </g>
      );
    }
    return (
      <g id="buildPermFront">
        {renderForeheadShadow(`M ${cx - 38} 146 Q ${cx} 140 ${cx + 38} 146 L ${cx + 28} 158 L ${cx - 28} 158 Z`)}
        <path
          d={`
            M ${cx - 84} 142
            C ${cx - 94} 90, ${cx - 56} 66, ${cx} 66 C ${cx + 56} 66, ${cx + 94} 90, ${cx + 84} 142
            C ${cx + 88} 190, ${cx + 80} 240, ${cx + 68} 285
            C ${cx + 60} 310, ${cx + 42} 320, ${cx + 34} 310
            C ${cx + 44} 280, ${cx + 52} 230, ${cx + 54} 185
            C ${cx + 48} 178, ${cx + 24} 156, ${cx + 4} 146
            C ${cx - 4} 146, ${cx - 24} 156, ${cx - 48} 178
            C ${cx - 54} 185, ${cx - 52} 230, ${cx - 44} 280
            C ${cx - 34} 310, ${cx - 42} 320, ${cx - 60} 310
            C ${cx - 68} 285, ${cx - 80} 240, ${cx - 88} 190
            C ${cx - 84} 142, ${cx - 84} 142, ${cx - 84} 142
            Z
          `}
          fill={hairFill}
        />
        {renderStrand(`M ${cx - 64} 170 C ${cx - 60} 210, ${cx - 52} 250, ${cx - 42} 290`, 0.6, 1.8)}
        {renderStrand(`M ${cx + 64} 170 C ${cx + 60} 210, ${cx + 52} 250, ${cx + 42} 290`, 0.6, 1.8)}
        {renderAngelRing(`M ${cx - 44} 90 Q ${cx} 78 ${cx + 44} 90`)}
      </g>
    );
  }

  return null;
};
