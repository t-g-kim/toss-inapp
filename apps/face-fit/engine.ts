import { FaceShapeKey, FACE_SHAPES, StylingCompatibility } from "./catalog";

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    scores: Partial<Record<FaceShapeKey, number>>;
  }[];
}

export const DIAGNOSIS_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "얼굴의 세로와 가로 비율은 어떤가요?",
    subtitle: "거울을 정면에서 보았을 때 느껴지는 전체적인 윤곽 비율입니다.",
    options: [
      {
        label: "가로와 세로 비율이 거의 1:1로 비슷해요",
        description: "볼살이 부드럽고 가로폭이 세로만큼 넓은 편",
        scores: { round: 4, square: 2 },
      },
      {
        label: "세로 길이가 가로보다 살짝 더 긴 황금 비율이에요",
        description: "균형이 잘 맞고 과하게 길거나 넓지 않은 편",
        scores: { oval: 4, heart: 2 },
      },
      {
        label: "세로 길이가 가로 너비보다 확연히 길어요",
        description: "이마나 중안부, 턱이 길어 성숙한 인상을 주는 편",
        scores: { oblong: 4, oval: 1 },
      },
      {
        label: "이마는 넓은데 아래로 갈수록 급격히 좁아져요",
        description: "상안부가 넓고 턱 끝이 뾰족한 역삼각형 느낌",
        scores: { heart: 4, oval: 1 },
      },
    ],
  },
  {
    id: 2,
    question: "얼굴에서 가장 넓은 부위는 어디인가요?",
    subtitle: "이마, 광대(볼), 하관(턱) 중 시선이 가장 먼저 머무는 곳입니다.",
    options: [
      {
        label: "이마와 광대가 넓고 턱은 매우 갸름해요",
        description: "하관에 살이 없고 날렵한 V라인 형태",
        scores: { heart: 4, oval: 1 },
      },
      {
        label: "볼(광대) 부분이 도톰하고 볼륨이 있어요",
        description: "볼살이 있어 인상이 부드럽고 어려 보이는 편",
        scores: { round: 4, oval: 1 },
      },
      {
        label: "이마와 하관(턱)의 너비가 거의 대칭이에요",
        description: "턱 끝까지 너비감이 유지되는 탄탄한 윤곽",
        scores: { square: 4, oblong: 1 },
      },
      {
        label: "이마부터 턱까지 매끄럽게 계란처럼 좁아져요",
        description: "튀어나온 곳 없이 부드럽고 고른 밸런스",
        scores: { oval: 4, oblong: 1 },
      },
    ],
  },
  {
    id: 3,
    question: "턱선의 각도와 윤곽은 어떤 모양인가요?",
    subtitle: "귀 밑에서 턱 끝으로 이어지는 턱선 라인을 손으로 짚어보세요.",
    options: [
      {
        label: "귀 밑 턱 각이 또렷하고 각진 사각형이에요",
        description: "남성적이거나 카리스마 있고 단단한 하관 라인",
        scores: { square: 5 },
      },
      {
        label: "각이 거의 없이 둥글고 완만하게 연결돼요",
        description: "볼과 턱선이 부드럽게 이어지는 동안형 라인",
        scores: { round: 4, oval: 1 },
      },
      {
        label: "턱 끝이 뾰족한 세련된 날렵한 브이라인이에요",
        description: "턱 끝이 강조되고 갸름하게 빠진 라인",
        scores: { heart: 4 },
      },
      {
        label: "턱선이 길고 슬림하게 수직으로 떨어져요",
        description: "하안부 길이가 시원하게 뻗어있는 라인",
        scores: { oblong: 4, oval: 1 },
      },
    ],
  },
];

export function calculateDiagnosisResult(answers: number[]): FaceShapeKey {
  const tally: Record<FaceShapeKey, number> = {
    oval: 0,
    round: 0,
    square: 0,
    heart: 0,
    oblong: 0,
  };

  answers.forEach((choiceIndex, qIdx) => {
    const question = DIAGNOSIS_QUESTIONS[qIdx];
    if (!question) return;
    const option = question.options[choiceIndex];
    if (!option) return;

    Object.entries(option.scores).forEach(([key, val]) => {
      tally[key as FaceShapeKey] += val || 0;
    });
  });

  // Find face shape with highest tally
  let maxKey: FaceShapeKey = "oval";
  let maxScore = -1;

  (Object.keys(tally) as FaceShapeKey[]).forEach((key) => {
    if (tally[key] > maxScore) {
      maxScore = tally[key];
      maxKey = key;
    }
  });

  return maxKey;
}

// 친구 공유용 텍스트 생성
export function createShareText(
  faceName: string,
  hairName: string,
  hairColorName: string,
  glassesName: string,
  glassesColorName: string,
  compatibility: StylingCompatibility
): string {
  return `✨ [토스 페이스핏] 내 얼굴형 맞춤 헤어 & 안경 피팅 완료!

👤 얼굴형: ${faceName}
💇 헤어스타일: ${hairName} (${hairColorName})
👓 안경 프레임: ${glassesName} (${glassesColorName})
💯 어울림 지수: ${compatibility.score}점 (${compatibility.badge})

"친구야, 이 스타일 나한테 어울려? 투표해줘!"
1번: 완전 인생 스타일 찰떡이다! 👏
2번: 다른 안경이나 헤어도 시도해봐! 🤔

👉 토스 앱에서 '페이스핏' 검색하고 내 얼굴형도 진단해보세요!`;
}

// 캔버스 기반 고해상도 포토카드 이미지 생성 (인스타 스토리/카카오톡 공유 규격: 720 x 1080)
export async function renderShareCardCanvas(params: {
  faceName: string;
  hairName: string;
  hairColorName: string;
  glassesName: string;
  glassesColorName: string;
  score: number;
  badge: string;
  userPhotoUrl?: string | null;
  avatarSvgString?: string;
}): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  // 1. 배경 그라데이션 (TDS 스타일 미니멀 & 프리미엄)
  const bgGrad = ctx.createLinearGradient(0, 0, 720, 1080);
  bgGrad.addColorStop(0, "#F2F4F6");
  bgGrad.addColorStop(0.5, "#E8ECEF");
  bgGrad.addColorStop(1, "#DFE4E8");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 720, 1080);

  // 상단 부드러운 토스 블루 글로우
  const glowGrad = ctx.createRadialGradient(360, 200, 20, 360, 200, 400);
  glowGrad.addColorStop(0, "rgba(49, 130, 246, 0.12)");
  glowGrad.addColorStop(1, "rgba(49, 130, 246, 0)");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, 720, 500);

  // 2. 상단 헤더 카드
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, 40, 40, 640, 80, 20);
  ctx.fill();

  // 토스 페이스핏 뱃지
  ctx.fillStyle = "#3182F6";
  roundRect(ctx, 60, 56, 110, 48, 12);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif";
  ctx.fillText("페이스핏", 78, 88);

  ctx.fillStyle = "#191F28";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif";
  ctx.fillText("얼굴형 맞춤 헤어 & 안경 피팅", 190, 88);

  // 3. 메인 아바타 / 사진 영역 프레임
  const avatarX = 60;
  const avatarY = 150;
  const avatarW = 600;
  const avatarH = 540;

  // 카드 배경
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, avatarX, avatarY, avatarW, avatarH, 32);
  ctx.fill();
  ctx.shadowColor = "transparent";

  // 사용자 업로드 사진 또는 SVG 렌더링
  if (params.userPhotoUrl) {
    try {
      const img = await loadImage(params.userPhotoUrl);
      ctx.save();
      roundRect(ctx, avatarX + 16, avatarY + 16, avatarW - 32, avatarH - 32, 24);
      ctx.clip();
      ctx.drawImage(img, avatarX + 16, avatarY + 16, avatarW - 32, avatarH - 32);
      ctx.restore();
    } catch {
      drawPlaceholderAvatar(ctx, avatarX + avatarW / 2, avatarY + avatarH / 2);
    }
  } else if (params.avatarSvgString) {
    try {
      const svgBlob = new Blob([params.avatarSvgString], { type: "image/svg+xml;charset=utf-8" });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = await loadImage(blobURL);
      ctx.save();
      roundRect(ctx, avatarX + 16, avatarY + 16, avatarW - 32, avatarH - 32, 24);
      ctx.clip();
      ctx.drawImage(img, avatarX + 16, avatarY + 16, avatarW - 32, avatarH - 32);
      ctx.restore();
      URL.revokeObjectURL(blobURL);
    } catch {
      drawPlaceholderAvatar(ctx, avatarX + avatarW / 2, avatarY + avatarH / 2);
    }
  } else {
    drawPlaceholderAvatar(ctx, avatarX + avatarW / 2, avatarY + avatarH / 2);
  }

  // 피팅 점수 플로팅 뱃지 (우상단)
  ctx.fillStyle = "rgba(25, 31, 40, 0.9)";
  roundRect(ctx, avatarX + avatarW - 170, avatarY + 28, 142, 54, 27);
  ctx.fill();

  ctx.fillStyle = "#3182F6";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${params.score}점`, avatarX + avatarW - 152, avatarY + 65);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("매치", avatarX + avatarW - 80, avatarY + 64);

  // 4. 스타일 스펙 카드 (하단 정보 3종)
  const infoY = 720;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, 60, infoY, 600, 200, 28);
  ctx.fill();

  // 배지
  ctx.fillStyle = "#E8F3FF";
  roundRect(ctx, 84, infoY + 24, 180, 36, 10);
  ctx.fill();
  ctx.fillStyle = "#3182F6";
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`✨ ${params.badge}`, 100, infoY + 48);

  // 얼굴형
  ctx.fillStyle = "#6B7684";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("얼굴형", 84, infoY + 95);
  ctx.fillStyle = "#191F28";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(params.faceName, 84, infoY + 125);

  // 헤어스타일
  ctx.fillStyle = "#6B7684";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("헤어스타일", 260, infoY + 95);
  ctx.fillStyle = "#191F28";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${params.hairName}`, 260, infoY + 125);
  ctx.fillStyle = "#8B95A1";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(params.hairColorName, 260, infoY + 150);

  // 안경 프레임
  ctx.fillStyle = "#6B7684";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("아이웨어", 480, infoY + 95);
  ctx.fillStyle = "#191F28";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(params.glassesName, 480, infoY + 125);
  ctx.fillStyle = "#8B95A1";
  ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(params.glassesColorName, 480, infoY + 150);

  // 5. 투표 유도 푸터 카드
  ctx.fillStyle = "#3182F6";
  roundRect(ctx, 60, 940, 600, 95, 24);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("💬 친구야, 이 스타일 나한테 어울려? 투표해줘!", 96, 982);

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("토스 앱에서 '페이스핏' 검색하고 함께 피팅해보기", 155, 1012);

  return canvas.toDataURL("image/png");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function drawPlaceholderAvatar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = "#F2F4F6";
  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3182F6";
  ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("FaceFit Avatar", cx, cy + 12);
  ctx.textAlign = "start";
}
