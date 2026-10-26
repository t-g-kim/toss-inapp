import {
  DeskSlotKey,
  DeskPartOption,
  DESK_PARTS,
  SLOT_LABELS,
} from "./catalog";

export type DeskBuildState = Record<DeskSlotKey, string>;

export interface CompatibilityIssue {
  severity: "danger" | "warning" | "tip";
  title: string;
  desc: string;
}

export interface CompatibilityResult {
  isCompatible: boolean;
  score: number; // 0 ~ 100
  issues: CompatibilityIssue[];
}

export const getPartOption = (
  slot: DeskSlotKey,
  partId?: string
): DeskPartOption | undefined => {
  if (!partId) return undefined;
  return DESK_PARTS[slot].find((p) => p.id === partId);
};

export const calculateTotalPrice = (build: DeskBuildState): number => {
  let sum = 0;
  for (const [slot, id] of Object.entries(build)) {
    const part = getPartOption(slot as DeskSlotKey, id);
    if (part) {
      sum += part.price;
    }
  }
  return sum;
};

export const checkDeskCompatibility = (
  build: DeskBuildState
): CompatibilityResult => {
  const issues: CompatibilityIssue[] = [];
  let penalty = 0;

  const desk = getPartOption("desk", build.desk);
  const monitor = getPartOption("monitor", build.monitor);
  const arm = getPartOption("monitorArm", build.monitorArm);
  const chair = getPartOption("chair", build.chair);
  const km = getPartOption("keyboardMouse", build.keyboardMouse);
  const light = getPartOption("lightingMat", build.lightingMat);
  const acc = getPartOption("accessories", build.accessories);

  // 1. 모니터암 지지하중 vs 모니터 무게 검사 (핵심 안전성)
  if (monitor && arm) {
    const monWeight = monitor.monitorWeight || 4.0;
    const maxWeight = arm.armMaxWeight || 9.0;

    if (monWeight > maxWeight) {
      issues.push({
        severity: "danger",
        title: "모니터암 하중 초과 위험",
        desc: `선택하신 모니터 무게(${monWeight}kg)가 모니터암 최대 지지 하중(${maxWeight}kg)을 초과하여 모니터가 아래로 처질 수 있습니다. 고중량 모니터암을 권장합니다.`,
      });
      penalty += 35;
    } else if (monWeight >= maxWeight * 0.85) {
      issues.push({
        severity: "warning",
        title: "모니터암 하중 한계 근접 (85% 이상)",
        desc: `모니터 무게(${monWeight}kg)가 모니터암 한계(${maxWeight}kg)에 가깝습니다. 관절 장력을 강하게 조여 사용하세요.`,
      });
      penalty += 10;
    }

    // 듀얼 모니터 vs 모니터암 타입 매칭
    if (monitor.monitorType === "dual" && arm.armType !== "dual") {
      issues.push({
        severity: "danger",
        title: "듀얼 모니터 거치 불가",
        desc: "듀얼 모니터(2대) 세트를 선택하셨으나, 싱글 모니터암이 선택되었습니다. 듀얼 전용 모니터암(DMA-2 등)을 선택해 주세요.",
      });
      penalty += 30;
    }

    // 울트라와이드 모니터 권장 암
    if (monitor.monitorType === "ultrawide" && arm.armType !== "heavy") {
      issues.push({
        severity: "warning",
        title: "34인치 울트라와이드 전용 암 권장",
        desc: "34인치 울트라와이드는 좌우 토크(모멘트)가 커서 카멜 PMA-2D 등 고중량 전용 모니터암을 장착해야 고개 숙임이 없습니다.",
      });
      penalty += 10;
    }
  }

  // 2. 책상 상판 두께 vs 모니터암 클램프 호환
  if (desk && arm) {
    const deskThick = desk.deskThickness || 18;
    const maxClamp = arm.armMaxDeskThickness || 85;

    if (deskThick > maxClamp) {
      issues.push({
        severity: "danger",
        title: "책상 상판 클램프 장착 불가",
        desc: `책상 상판 두께(${deskThick}mm)가 모니터암 클램프 지원 범위(${maxClamp}mm)를 초과합니다.`,
      });
      penalty += 25;
    }
  }

  // 3. 책상 가로폭 vs 모니터 크기 조화
  if (desk && monitor) {
    const deskW = desk.deskWidth || 1200;
    if (deskW <= 1200 && (monitor.monitorSize === 34 || monitor.monitorType === "dual")) {
      issues.push({
        severity: "warning",
        title: "책상 가로폭 협소 주의 (1200mm)",
        desc: "34인치 와이드나 듀얼 모니터는 가로 폭이 80~100cm를 차지하므로, 1400mm 이상 책상을 선택하시면 스피커와 본체 배치가 훨씬 여유롭습니다.",
      });
      penalty += 10;
    }
  }

  // 4. 모션데스크 선택 시 케이블 정리 트레이 권장
  if (desk && desk.isMotionDesk) {
    if (!acc || acc.id !== "acc_cable_tray_set") {
      issues.push({
        severity: "tip",
        title: "모션데스크 승하강 케이블 당김 방지 팁",
        desc: "전동 모션데스크는 높이 조절 시 전선이 걸려 뽑히지 않도록 '언더데스크 케이블 트레이'와 3m 이상 넉넉한 멀티탭 설치를 추천합니다.",
      });
    }
  }

  // 5. 긍정적 시너지 피드백
  if (issues.length === 0) {
    issues.push({
      severity: "tip",
      title: "완벽한 황금 호환 셋업!",
      desc: "모니터 무게와 모니터암 지지력, 책상 규격 및 인체공학 밸런스가 결함 없이 완벽하게 어우러지는 이상적인 셋업입니다.",
    });
  }

  const score = Math.max(20, Math.min(100, 100 - penalty));
  const isCompatible = issues.filter((i) => i.severity === "danger").length === 0;

  return {
    isCompatible,
    score,
    issues,
  };
};
