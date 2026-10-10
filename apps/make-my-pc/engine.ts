import { PARTS, BASE_DRAW, PartOption } from "./catalog";

export interface BuildState {
  cpu: string | null;
  mb: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  cooler: string | null;
  psu: string | null;
  case: string | null;
}

export const KEYS: (keyof BuildState)[] = ["case", "mb", "cpu", "ram", "gpu", "storage", "cooler", "psu"];
export const SHORT_LABEL: Record<keyof BuildState, string> = {
  case: "케이스",
  mb: "메인보드",
  cpu: "CPU",
  ram: "RAM",
  gpu: "그래픽카드",
  storage: "SSD",
  cooler: "쿨러",
  psu: "파워",
};

export function getPartOption(category: keyof BuildState, id: string | null): PartOption | null {
  if (!id || !PARTS[category]) return null;
  return PARTS[category].options.find((o) => o.id === id) || null;
}

export function calculateTotalPrice(state: BuildState): number {
  return KEYS.reduce((sum, key) => {
    const opt = getPartOption(key, state[key]);
    return sum + (opt ? opt.price : 0);
  }, 0);
}

export function checkCompatibility(state: BuildState): string[] {
  const issues: string[] = [];
  const cpu = getPartOption("cpu", state.cpu);
  const mb = getPartOption("mb", state.mb);
  const ram = getPartOption("ram", state.ram);
  const gpu = getPartOption("gpu", state.gpu);
  const cl = getPartOption("cooler", state.cooler);
  const cs = getPartOption("case", state.case);

  if (cpu && mb && cpu.socket !== mb.socket) {
    issues.push(`CPU 소켓(${cpu.socket}) ↔ 메인보드 소켓(${mb.socket}) 불일치`);
  }
  if (ram && mb && ram.mem !== mb.mem) {
    issues.push(`RAM 규격(${ram.mem}) ↔ 메인보드 규격(${mb.mem}) 불일치`);
  }
  if (mb && cs && cs.form) {
    const forms = Array.isArray(cs.form) ? cs.form : [cs.form];
    if (mb.form && !forms.includes(mb.form as string)) {
      issues.push(`메인보드 폼팩터(${mb.form}) ↔ 케이스 지원(${forms.join("/")}) 불일치`);
    }
  }
  if (gpu && cs && cs.maxGpuLen && gpu.len && gpu.len > cs.maxGpuLen) {
    issues.push(`그래픽카드 길이(${gpu.len}mm) > 케이스 장착 한계(${cs.maxGpuLen}mm) 간섭`);
  }
  if (cl && cs && cl.type === "air" && cl.height && cs.maxCoolerH && cl.height > cs.maxCoolerH) {
    issues.push(`공랭 쿨러 높이(${cl.height}mm) > 케이스 쿨러 한계(${cs.maxCoolerH}mm) 간섭`);
  }
  if (cl && cs && cl.type === "aio" && cl.rad && cs.maxRad && cl.rad > cs.maxRad) {
    issues.push(`수랭 라디에이터(${cl.rad}mm) > 케이스 수랭 규격(${cs.maxRad}mm) 초과`);
  }

  return issues;
}

export interface PowerInfo {
  draw: number;
  capacity: number;
  percent: number;
  status: "ok" | "tight" | "over";
  message: string;
}

export function calculatePower(state: BuildState): PowerInfo {
  const cpu = getPartOption("cpu", state.cpu);
  const gpu = getPartOption("gpu", state.gpu);
  const ram = getPartOption("ram", state.ram);
  const st = getPartOption("storage", state.storage);
  const psu = getPartOption("psu", state.psu);

  const draw = BASE_DRAW + (cpu?.tdp || 0) + (gpu?.tdp || 0) + (ram?.tdp || 0) + (st?.tdp || 0);
  const capacity = psu?.capacity || 0;
  const percent = capacity > 0 ? Math.round((draw / capacity) * 100) : 0;

  if (!psu) {
    return { draw, capacity: 0, percent: 0, status: "tight", message: "파워서플라이를 선택하세요" };
  }
  if (draw > capacity) {
    return { draw, capacity, percent, status: "over", message: `용량 초과 (${percent}%) - 부팅 실패 위험` };
  }
  if (draw > capacity * 0.8) {
    return { draw, capacity, percent, status: "tight", message: `용량 여유 부족 (${percent}%) - 고부하 시 꺼짐 위험` };
  }
  return { draw, capacity, percent, status: "ok", message: `전력 안정적 (${percent}%) - 충분한 여유 마진` };
}

export interface ThermalInfo {
  ratio: number;
  level: "ok" | "hot" | "throttle" | "crash";
  factor: number;
  message: string;
}

export function calculateThermal(state: BuildState): ThermalInfo | null {
  const cpu = getPartOption("cpu", state.cpu);
  const cl = getPartOption("cooler", state.cooler);
  if (!cpu || !cl || !cl.capacity) return null;

  const ratio = (cpu.tdp || 65) / cl.capacity;
  if (ratio > 1.4) {
    return { ratio, level: "crash", factor: 0, message: "냉각 불가 - 과열 셧다운 위험" };
  }
  if (ratio > 1.0) {
    return { ratio, level: "throttle", factor: 0.78, message: "서멀 스로틀링 발생 (CPU 성능 -22%)" };
  }
  if (ratio > 0.85) {
    return { ratio, level: "hot", factor: 0.94, message: "온도 높음 (소폭 성능 저하)" };
  }
  return { ratio, level: "ok", factor: 1.0, message: "냉각 여유 충분 (최적 쿨링)" };
}

export interface BenchmarkResult {
  overall: number;
  gaming: number;
  rendering: number;
  multitask: number;
  tier: string;
  fpsBattleground: { fhd: number; qhd: number };
  fpsCyberpunk: { fhd: number; qhd: number };
  fpsLol: { fhd: number; qhd: number };
  fpsLostark: { fhd: number; qhd: number };
  valueScore: number;
  totalPrice: number;
}

export function runBenchmarkSimulation(state: BuildState): BenchmarkResult {
  const cpu = getPartOption("cpu", state.cpu);
  const gpu = getPartOption("gpu", state.gpu);
  const ram = getPartOption("ram", state.ram);
  const st = getPartOption("storage", state.storage);
  const psu = getPartOption("psu", state.psu);
  const thermal = calculateThermal(state);

  const cpuEff = (cpu?.score || 30) * (thermal?.factor || 1.0);
  const gpuScore = gpu?.score || 15;
  const ramScore = ram?.score || 20;
  const stScore = st?.score || 20;

  const power = calculatePower(state);
  const stability = power.status === "tight" ? 0.92 : 1.0;

  const overall = Math.round((cpuEff * 0.35 + gpuScore * 0.35 + ramScore * 0.15 + stScore * 0.15) * stability);
  const rendering = Math.round((cpuEff * 0.5 + ramScore * 0.3 + stScore * 0.2) * stability);
  const gaming = Math.round((gpuScore * 0.6 + cpuEff * 0.3 + ramScore * 0.1) * stability);
  const multitask = Math.round((cpuEff * 0.4 + ramScore * 0.45 + stScore * 0.15) * stability);

  let tier = "엔트리 캐주얼";
  if (overall >= 85) tier = "4K 익스트림 플래그십";
  else if (overall >= 65) tier = "QHD 고성능 게이밍";
  else if (overall >= 45) tier = "FHD 국민 게이밍";

  // Real game FPS estimates
  const fpsBattleground = {
    fhd: Math.max(30, Math.round(gaming * 1.8 + 20)),
    qhd: Math.max(20, Math.round(gaming * 1.3 + 10)),
  };
  const fpsCyberpunk = {
    fhd: Math.max(20, Math.round(gaming * 1.2 + 10)),
    qhd: Math.max(15, Math.round(gaming * 0.85 + 5)),
  };
  const fpsLol = {
    fhd: Math.max(60, Math.round(gaming * 3.2 + 80)),
    qhd: Math.max(60, Math.round(gaming * 2.6 + 60)),
  };
  const fpsLostark = {
    fhd: Math.max(30, Math.round(gaming * 1.6 + 30)),
    qhd: Math.max(20, Math.round(gaming * 1.2 + 15)),
  };

  const totalPrice = calculateTotalPrice(state);
  const valueScore = totalPrice > 0 ? Math.round((overall / (totalPrice / 100000)) * 10) / 10 : 0;

  return {
    overall,
    gaming,
    rendering,
    multitask,
    tier,
    fpsBattleground,
    fpsCyberpunk,
    fpsLol,
    fpsLostark,
    valueScore,
    totalPrice,
  };
}
