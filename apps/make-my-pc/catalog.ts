export const BASE_DRAW = 55; // 메인보드, 팬, 기타 기본 전력 소모

export interface PartOption {
  id: string;
  name: string;
  sub?: string;
  price: number;
  score?: number;
  tdp?: number;
  socket?: string;
  mem?: "DDR4" | "DDR5";
  form?: string | string[];
  len?: number;
  capacity?: number;
  type?: "air" | "aio";
  height?: number;
  rad?: number;
  maxGpuLen?: number;
  maxCoolerH?: number;
  maxRad?: number;
  legacy?: boolean;
  buyUrl?: string; // 옵션별 전용 직링크 (쿠팡 파트너스 등)
}

export interface PurchaseLinks {
  partName: string;
  naver: string;
  danawa: string;
  coupang: string;
  compuzone: string;
}

export const getPurchaseLinks = (partName: string): PurchaseLinks => {
  const q = encodeURIComponent(partName);
  return {
    partName,
    naver: `https://search.shopping.naver.com/search/all?query=${q}`,
    danawa: `https://search.danawa.com/dsearch.php?query=${q}`,
    coupang: `https://www.coupang.com/np/search?component=&q=${q}`,
    compuzone: `https://www.compuzone.co.kr/search/search.php?SearchType=all&SearchText=${q}`,
  };
};

export interface PartCategory {
  label: string;
  iconName?: string;
  options: PartOption[];
}

export const CATALOG_SYNC_KEY = "toss_make_my_pc_catalog_v1";
export const DEFAULT_CATALOG_DATE = "2026.10 (실시간 연동)";

export const loadStoredCatalog = (): Record<string, PartCategory> | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CATALOG_SYNC_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.categories) {
      return parsed.categories;
    }
  } catch (e) {
    console.error("Failed to load cached catalog:", e);
  }
  return null;
};

export const saveStoredCatalog = (data: { updatedAt: string; categories: Record<string, PartCategory> }) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATALOG_SYNC_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to cache catalog:", e);
  }
};

export const PARTS: Record<string, PartCategory> = {
  cpu: {
    label: "CPU (프로세서)",
    options: [
      { id: "cpu17", name: "Core i3-12100F", sub: "4C8T / 4.3GHz / 가성비 롤/사무", score: 38, tdp: 58, price: 110000, socket: "LGA1700" },
      { id: "cpu1", name: "Ryzen 5 5600", sub: "6C12T / 4.4GHz / 국민 가성비", score: 44, tdp: 65, price: 140000, socket: "AM4" },
      { id: "cpu16", name: "Ryzen 5 7500F", sub: "6C12T / 5.0GHz / 차세대 게이밍 표준", score: 62, tdp: 65, price: 200000, socket: "AM5" },
      { id: "cpu2", name: "Core i5-14600K", sub: "14C20T / 5.3GHz / 고성능 작업·게임", score: 70, tdp: 125, price: 360000, socket: "LGA1700" },
      { id: "cpu5", name: "Ryzen 5 9600X", sub: "6C12T / 5.4GHz / 최신 Zen5", score: 76, tdp: 105, price: 280000, socket: "AM5" },
      { id: "cpu3", name: "Ryzen 7 7800X3D", sub: "8C16T / 3D V-Cache / 게이밍 끝판왕", score: 84, tdp: 120, price: 480000, socket: "AM5" },
      { id: "cpu6", name: "Core Ultra 7 265K", sub: "20C20T / LGA1851 / 차세대 AI", score: 88, tdp: 125, price: 550000, socket: "LGA1851" },
      { id: "cpu7", name: "Ryzen 7 9800X3D", sub: "8C16T / 3D V-Cache / 최고 프레임 머신", score: 92, tdp: 120, price: 720000, socket: "AM5" },
      { id: "cpu8", name: "Ryzen 9 9950X", sub: "16C32T / 5.7GHz / 워크스테이션급", score: 108, tdp: 170, price: 950000, socket: "AM5" },
    ],
  },
  mb: {
    label: "메인보드",
    options: [
      { id: "mb14", name: "MAXSUN B760M", sub: "LGA1700 · DDR4 · mATX", socket: "LGA1700", mem: "DDR4", form: "mATX", price: 90000 },
      { id: "mb1", name: "ASRock B550M Pro4", sub: "AM4 · DDR4 · mATX 국민보드", socket: "AM4", mem: "DDR4", form: "mATX", price: 100000 },
      { id: "mb2", name: "MSI PRO B760M-P DDR4", sub: "LGA1700 · DDR4 · mATX", socket: "LGA1700", mem: "DDR4", form: "mATX", price: 130000 },
      { id: "mb15", name: "Colorful CVN B650M", sub: "AM5 · DDR5 · mATX 가성비", socket: "AM5", mem: "DDR5", form: "mATX", price: 150000 },
      { id: "mb3", name: "GIGABYTE B760M AORUS ELITE", sub: "LGA1700 · DDR5 · mATX", socket: "LGA1700", mem: "DDR5", form: "mATX", price: 200000 },
      { id: "mb4", name: "ASUS TUF Gaming B650M-PLUS", sub: "AM5 · DDR5 · mATX 밀리터리 감성", socket: "AM5", mem: "DDR5", form: "mATX", price: 230000 },
      { id: "mb8", name: "GIGABYTE Z890 AORUS ELITE", sub: "LGA1851 · DDR5 · ATX", socket: "LGA1851", mem: "DDR5", form: "ATX", price: 400000 },
      { id: "mb5", name: "ASUS ROG STRIX X670E-F", sub: "AM5 · DDR5 · ATX 하이엔드", socket: "AM5", mem: "DDR5", form: "ATX", price: 450000 },
    ],
  },
  gpu: {
    label: "그래픽카드 (GPU)",
    options: [
      { id: "gpu1", name: "CPU 내장 그래픽", sub: "사무/문서/유튜브 시청용 (VRAM 공유)", score: 14, tdp: 15, price: 0, len: 0 },
      { id: "gpu2", name: "GeForce RTX 4060 8GB", sub: "FHD 풀옵션 정복 · 길이 245mm", score: 50, tdp: 115, price: 420000, len: 245 },
      { id: "gpu3", name: "Radeon RX 7800 XT 16GB", sub: "QHD 고주사율 게이밍 · 길이 287mm", score: 68, tdp: 265, price: 650000, len: 287 },
      { id: "gpu6", name: "GeForce RTX 5070 12GB", sub: "차세대 블랙웰 · DLSS4 지원 · 242mm", score: 78, tdp: 250, price: 900000, len: 242 },
      { id: "gpu7", name: "Radeon RX 9070 XT 16GB", sub: "RDNA4 최신 플래그십 · 300mm", score: 85, tdp: 304, price: 1100000, len: 300 },
      { id: "gpu8", name: "GeForce RTX 5080 16GB", sub: "4K 울트라 레이트레이싱 · 304mm", score: 98, tdp: 360, price: 1800000, len: 304 },
      { id: "gpu9", name: "GeForce RTX 5090 32GB", sub: "현존 최강 끝판왕 · 304mm", score: 115, tdp: 575, price: 3500000, len: 304 },
    ],
  },
  ram: {
    label: "메모리 (RAM)",
    options: [
      { id: "ram1", name: "8GB DDR4-3200", sub: "단일 채널 (사무용 기본)", score: 20, tdp: 6, price: 30000, mem: "DDR4" },
      { id: "ram2", name: "16GB DDR4-3600 (8GB x2)", sub: "듀얼 채널 국민 구성", score: 48, tdp: 9, price: 60000, mem: "DDR4" },
      { id: "ram3", name: "32GB DDR5-6000 (16GB x2)", sub: "고클럭 듀얼 게이밍 표준", score: 74, tdp: 12, price: 150000, mem: "DDR5" },
      { id: "ram4", name: "64GB DDR5-6000 (32GB x2)", sub: "영상 편집 / 3D 작업용 대용량", score: 88, tdp: 16, price: 290000, mem: "DDR5" },
    ],
  },
  storage: {
    label: "저장장치 (SSD)",
    options: [
      { id: "st2", name: "Samsung 870 EVO 500GB", sub: "SATA SSD / 560MB/s", score: 42, tdp: 4, price: 80000 },
      { id: "st5", name: "WD Blue SN580 1TB", sub: "NVMe M.2 / 4150MB/s 가성비", score: 68, tdp: 5, price: 95000 },
      { id: "st3", name: "Samsung 990 PRO 1TB", sub: "PCIe 4.0 플래그십 / 7450MB/s", score: 80, tdp: 7, price: 170000 },
      { id: "st4", name: "Samsung 990 PRO 2TB", sub: "대용량 고속 NVMe / 7450MB/s", score: 85, tdp: 8, price: 280000 },
    ],
  },
  cooler: {
    label: "CPU 쿨러",
    options: [
      { id: "cl1", name: "인텔/AMD 기본 쿨러", sub: "번들 공랭 · 높이 70mm", capacity: 95, price: 0, type: "air", height: 70 },
      { id: "cl2", name: "DeepCool AK400", sub: "120mm 싱글타워 공랭 · 높이 155mm", capacity: 180, price: 40000, type: "air", height: 155 },
      { id: "cl6", name: "써멀라이트 PA120 SE", sub: "듀얼타워 공랭 최강 가성비 · 높이 155mm", capacity: 245, price: 30000, type: "air", height: 155 },
      { id: "cl3", name: "NZXT Kraken 240", sub: "240mm AIO 수랭 쿨러", capacity: 250, price: 150000, type: "aio", rad: 240 },
      { id: "cl4", name: "ARCTIC Liquid Freezer III 360", sub: "360mm 3열 대장급 수랭", capacity: 350, price: 190000, type: "aio", rad: 360 },
    ],
  },
  psu: {
    label: "파워서플라이 (PSU)",
    options: [
      { id: "psu1", name: "마이크로닉스 Classic II 500W", sub: "80PLUS 브론즈 가성비", capacity: 500, price: 55000 },
      { id: "psu2", name: "시소닉 FOCUS GX-650W", sub: "80PLUS 골드 풀모듈러", capacity: 650, price: 120000 },
      { id: "psu3", name: "커세어 RM850e 850W", sub: "80PLUS 골드 ATX 3.0", capacity: 850, price: 160000 },
      { id: "psu4", name: "시소닉 PRIME TX-1000W", sub: "80PLUS 티타늄 최고 효율", capacity: 1000, price: 350000 },
      { id: "psu5", name: "커세어 HX1200i 1200W", sub: "80PLUS 플래티넘 RTX 5090 대응", capacity: 1200, price: 450000 },
    ],
  },
  case: {
    label: "PC 케이스",
    options: [
      { id: "case1", name: "앱코 NCORE 미니타워", sub: "mATX 전용 · GPU ≤280mm · 라디 ≤240mm", form: ["mATX"], maxGpuLen: 280, maxCoolerH: 160, maxRad: 240, price: 40000 },
      { id: "case2", name: "darkFlash DK352 미들타워", sub: "ATX/mATX 지원 · GPU ≤330mm · 라디 ≤360mm", form: ["mATX", "ATX"], maxGpuLen: 330, maxCoolerH: 165, maxRad: 360, price: 60000 },
      { id: "case4", name: "존스보 D31 파노라마", sub: "mATX 컴팩트 · GPU ≤400mm · 라디 ≤360mm", form: ["mATX"], maxGpuLen: 400, maxCoolerH: 168, maxRad: 360, price: 90000 },
      { id: "case3", name: "리안리 O11D EVO 빅타워", sub: "어항 케이스 끝판왕 · GPU ≤420mm", form: ["mATX", "ATX"], maxGpuLen: 420, maxCoolerH: 167, maxRad: 360, price: 190000 },
    ],
  },
};

export const PRESET_BUILDS = [
  {
    id: "budget-game",
    title: "🎮 100만원대 국민 게이밍",
    desc: "배그·로아·오버워치 FHD 풀옵션 쾌적 플레이",
    priceRange: "약 97만원",
    parts: {
      cpu: "cpu1",      // Ryzen 5600
      mb: "mb1",        // ASRock B550M
      gpu: "gpu2",      // RTX 4060
      ram: "ram2",      // 16GB DDR4
      storage: "st5",   // WD Blue 1TB
      cooler: "cl6",    // 써멀라이트 PA120 SE
      psu: "psu2",      // 650W 골드
      case: "case2",    // darkFlash 미들타워
    },
  },
  {
    id: "high-game",
    title: "🔥 200만원대 QHD 풀옵션",
    desc: "사이버펑크·스팀 대작 QHD 144Hz 정복",
    priceRange: "약 210만원",
    parts: {
      cpu: "cpu16",     // Ryzen 7500F
      mb: "mb4",        // ASUS TUF B650M
      gpu: "gpu6",      // RTX 5070
      ram: "ram3",      // 32GB DDR5
      storage: "st3",   // 990 PRO 1TB
      cooler: "cl3",    // NZXT Kraken 240
      psu: "psu3",      // 850W 골드
      case: "case2",    // darkFlash 미들타워
    },
  },
  {
    id: "flagship",
    title: "⚡ 350만원대 4K 하이엔드",
    desc: "4K 풀옵션 & 영상 렌더링 초고속 작업",
    priceRange: "약 360만원",
    parts: {
      cpu: "cpu3",      // Ryzen 7800X3D
      mb: "mb5",        // ASUS ROG X670E
      gpu: "gpu8",      // RTX 5080
      ram: "ram4",      // 64GB DDR5
      storage: "st4",   // 990 PRO 2TB
      cooler: "cl4",    // ARCTIC Liquid 360
      psu: "psu4",      // 1000W 티타늄
      case: "case3",    // 리안리 O11D EVO
    },
  },
  {
    id: "office",
    title: "💼 50만원대 롤/사무용",
    desc: "리그 오브 레전드·발로란트·문서작업 원활",
    priceRange: "약 49만원",
    parts: {
      cpu: "cpu17",     // i3-12100F
      mb: "mb14",       // MAXSUN B760M
      gpu: "gpu1",      // 내장
      ram: "ram1",      // 8GB
      storage: "st5",   // 1TB NVMe
      cooler: "cl1",    // 기본 쿨러
      psu: "psu1",      // 500W
      case: "case1",    // 앱코 미니
    },
  },
];
