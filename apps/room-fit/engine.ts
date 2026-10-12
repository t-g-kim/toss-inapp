/**
 * 원룸 가구 배치 3D - 실시간 간섭 및 공간 진단 엔진
 */

import {
  RoomTemplate,
  RoomDoor,
  PlacedFurniture,
  getFurnitureById,
} from "./catalog";

export interface Box2D {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CollisionPair {
  instanceA: string;
  instanceB: string;
  nameA: string;
  nameB: string;
}

export interface DoorConflict {
  doorId: string;
  doorName: string;
  blockedByInstanceId: string;
  blockedByFurnitureName: string;
  message: string;
}

export interface RoomDiagnostics {
  roomAreaSqm: number;
  roomPy: number;
  furnitureAreaSqm: number;
  occupancyPercent: number; // 가구 점유율 %
  freeAreaSqm: number;
  isSafe: boolean; // 충돌 및 문 간섭 없음
  collisions: CollisionPair[];
  doorConflicts: DoorConflict[];
  outOfBounds: string[]; // 벽 밖으로 나간 가구 IDs
  comfortScore: number; // 0 ~ 100 점
  comfortTier: "최상(쾌적)" | "적정(황금비율)" | "주의(답답함)" | "과밀(이동불가)";
  tips: string[];
}

/**
 * 가구 회전각을 반영한 2D Bounding Box 계산
 */
export function getFurnitureBox(item: PlacedFurniture): Box2D {
  const meta = getFurnitureById(item.furnitureId);
  const rawW = meta ? meta.width : 100;
  const rawD = meta ? meta.depth : 100;

  // 90도 또는 270도 회전 시 가로/세로 스왑
  const isRotated = item.rotation === 90 || item.rotation === 270;
  const w = isRotated ? rawD : rawW;
  const h = isRotated ? rawW : rawD;

  return {
    x: item.x,
    y: item.y,
    w,
    h,
  };
}

/**
 * 2개의 사각형(Box2D) 간 겹침(AABB) 여부 판정
 */
export function isIntersecting(a: Box2D, b: Box2D): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * 문 개폐 회전 반경(Sweep Box) 계산
 */
export function getDoorSweepBox(door: RoomDoor, roomWidth: number, roomDepth: number): Box2D {
  const dW = door.width;

  switch (door.wall) {
    case "bottom": {
      // 아래쪽 벽에서 방 안쪽(위쪽)으로 열림
      return {
        x: door.offset,
        y: roomDepth - dW,
        w: dW,
        h: dW,
      };
    }
    case "top": {
      // 위쪽 벽에서 방 안쪽(아래쪽)으로 열림
      return {
        x: door.offset,
        y: 0,
        w: dW,
        h: dW,
      };
    }
    case "left": {
      // 왼쪽 벽에서 방 안쪽(오른쪽)으로 열림
      return {
        x: 0,
        y: door.offset,
        w: dW,
        h: dW,
      };
    }
    case "right": {
      // 오른쪽 벽에서 방 안쪽(왼쪽)으로 열림
      return {
        x: roomWidth - dW,
        y: door.offset,
        w: dW,
        h: dW,
      };
    }
    default:
      return { x: 0, y: 0, w: 0, h: 0 };
  }
}

/**
 * 실시간 공간 및 간섭 종합 진단
 */
export function analyzeRoomLayout(
  template: RoomTemplate,
  placed: PlacedFurniture[]
): RoomDiagnostics {
  const roomAreaSqm = Number(((template.width * template.depth) / 10000).toFixed(1));
  const roomPy = Number((roomAreaSqm / 3.30578).toFixed(1));

  let totalFurnitureAreaCm2 = 0;
  const outOfBounds: string[] = [];
  const collisions: CollisionPair[] = [];
  const doorConflicts: DoorConflict[] = [];

  // 1. 벽 이탈 및 개별 면적 계산
  placed.forEach((p) => {
    const meta = getFurnitureById(p.furnitureId);
    if (!meta) return;

    // 러그(카페트)는 겹쳐도 되는 인테리어 소품으로 면적 집계만 하고 충돌 검사에서 제외
    const isRug = p.furnitureId === "rug_circle";
    if (!isRug) {
      totalFurnitureAreaCm2 += meta.width * meta.depth;
    }

    const box = getFurnitureBox(p);

    // 벽 밖으로 나갔는지 판정
    if (
      box.x < 0 ||
      box.y < 0 ||
      box.x + box.w > template.width ||
      box.y + box.h > template.depth
    ) {
      outOfBounds.push(p.instanceId);
    }
  });

  // 2. 가구 간 겹침 충돌 검사 (O(N^2))
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const p1 = placed[i];
      const p2 = placed[j];

      // 러그는 가구 밑에 깔리므로 충돌에서 제외
      if (p1.furnitureId === "rug_circle" || p2.furnitureId === "rug_circle") {
        continue;
      }

      const box1 = getFurnitureBox(p1);
      const box2 = getFurnitureBox(p2);

      if (isIntersecting(box1, box2)) {
        const meta1 = getFurnitureById(p1.furnitureId);
        const meta2 = getFurnitureById(p2.furnitureId);
        collisions.push({
          instanceA: p1.instanceId,
          instanceB: p2.instanceId,
          nameA: meta1?.name || "가구",
          nameB: meta2?.name || "가구",
        });
      }
    }
  }

  // 3. 문 개폐 반경 침범 검사 (가장 치명적인 간섭)
  template.doors.forEach((door) => {
    const sweepBox = getDoorSweepBox(door, template.width, template.depth);

    placed.forEach((p) => {
      // 러그는 문 아래로 지나갈 수 있으므로 예외
      if (p.furnitureId === "rug_circle") return;

      const fBox = getFurnitureBox(p);
      if (isIntersecting(sweepBox, fBox)) {
        const meta = getFurnitureById(p.furnitureId);
        doorConflicts.push({
          doorId: door.id,
          doorName: door.name,
          blockedByInstanceId: p.instanceId,
          blockedByFurnitureName: meta?.name || "가구",
          message: `${door.name} 개폐 반경에 ${meta?.name || "가구"}이(가) 걸려 문이 완전히 열리지 않습니다!`,
        });
      }
    });
  });

  // 4. 점유율 및 여유 공간 산출
  const furnitureAreaSqm = Number((totalFurnitureAreaCm2 / 10000).toFixed(1));
  const occupancyPercent = Math.min(
    100,
    Math.round((furnitureAreaSqm / roomAreaSqm) * 100)
  );
  const freeAreaSqm = Math.max(0, Number((roomAreaSqm - furnitureAreaSqm).toFixed(1)));

  // 5. 쾌적도 점수 산출 (100점 만점)
  let score = 100;

  // 문 간섭 시 치명적 감점 (-30점 per door)
  score -= doorConflicts.length * 30;
  // 가구 간 겹침 감점 (-20점 per pair)
  score -= collisions.length * 20;
  // 벽 이탈 감점 (-20점 per item)
  score -= outOfBounds.length * 20;

  // 가구 점유율에 따른 점수 조정 (황금 점유율: 25% ~ 38%)
  if (occupancyPercent > 55) {
    score -= (occupancyPercent - 55) * 1.5;
  } else if (occupancyPercent > 42) {
    score -= (occupancyPercent - 42) * 0.8;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let comfortTier: RoomDiagnostics["comfortTier"] = "적정(황금비율)";
  if (doorConflicts.length > 0 || collisions.length > 0 || outOfBounds.length > 0) {
    comfortTier = "과밀(이동불가)";
  } else if (occupancyPercent <= 32) {
    comfortTier = "최상(쾌적)";
  } else if (occupancyPercent <= 42) {
    comfortTier = "적정(황금비율)";
  } else if (occupancyPercent <= 52) {
    comfortTier = "주의(답답함)";
  } else {
    comfortTier = "과밀(이동불가)";
  }

  // 6. 맞춤형 인테리어 조언 팁 생성
  const tips: string[] = [];
  if (doorConflicts.length > 0) {
    tips.push("🚨 문이 완전히 열리지 않으면 이삿날 가구 이동 및 일상 출입에 심각한 불편이 생겨요.");
  }
  if (collisions.length > 0) {
    tips.push("⚠️ 가구끼리 겹쳐 배치되어 있어요. 위치나 회전 각도를 조정해 주세요.");
  }
  if (occupancyPercent > 45) {
    tips.push("💡 수납침대나 벽면 선반을 활용해 바닥 가구 점유율을 35% 이하로 낮추면 방이 훨씬 넓어 보여요.");
  }
  if (template.windows.length > 0) {
    tips.push("☀️ 창가 쪽에 책상을 두면 자연 채광으로 작업 집중도와 눈 피로도가 개선돼요.");
  }
  if (placed.some((p) => p.furnitureId === "bed_q") && roomPy < 6) {
    tips.push("🛏️ 5평 이하 소형 원룸에는 퀸(Q) 대신 슈퍼싱글(SS)을 두어야 동선 60cm가 확보돼요.");
  }

  return {
    roomAreaSqm,
    roomPy,
    furnitureAreaSqm,
    occupancyPercent,
    freeAreaSqm,
    isSafe: doorConflicts.length === 0 && collisions.length === 0 && outOfBounds.length === 0,
    collisions,
    doorConflicts,
    outOfBounds,
    comfortScore: score,
    comfortTier,
    tips,
  };
}
