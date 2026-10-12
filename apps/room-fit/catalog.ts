/**
 * 원룸 가구 배치 3D - 가구 카탈로그 및 방 템플릿 데이터
 */

export interface RoomDoor {
  id: string;
  name: string;
  wall: "top" | "bottom" | "left" | "right";
  offset: number; // 벽 시작점으로부터의 거리 (cm)
  width: number; // 문 너비 (cm, 보통 75~90cm)
  swingDir: "inside" | "outside"; // 열림 방향
  hinge: "start" | "end"; // 경첩 위치
}

export interface RoomWindow {
  id: string;
  wall: "top" | "bottom" | "left" | "right";
  offset: number;
  width: number;
}

export interface RoomTemplate {
  id: string;
  name: string;
  py: number; // 평수
  sqm: number; // ㎡
  width: number; // 가로 폭 (cm)
  depth: number; // 세로 깊이 (cm)
  desc: string;
  doors: RoomDoor[];
  windows: RoomWindow[];
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: "bed" | "desk" | "storage" | "living";
  categoryLabel: string;
  width: number; // cm
  depth: number; // cm
  height: number; // cm
  color: string;
  accentColor?: string;
  desc: string;
  specSummary: string;
  searchQuery: string;
}

export interface PlacedFurniture {
  instanceId: string;
  furnitureId: string;
  x: number; // 방 좌상단 기준 X (cm)
  y: number; // 방 좌상단 기준 Y (cm)
  rotation: 0 | 90 | 180 | 270;
}

export interface RoomPreset {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  templateId: string;
  furniture: PlacedFurniture[];
}

// 1. 방 템플릿 3종
export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "room_5py",
    name: "5평 컴팩트 원룸",
    py: 4.8,
    sqm: 15.8,
    width: 320, // 3.2m
    depth: 490, // 4.9m
    desc: "가장 흔한 직사각형 분리형/일체형 소형 원룸",
    doors: [
      {
        id: "main_door",
        name: "현관문",
        wall: "bottom",
        offset: 30,
        width: 85,
        swingDir: "inside",
        hinge: "start",
      },
      {
        id: "bath_door",
        name: "화장실문",
        wall: "right",
        offset: 140,
        width: 75,
        swingDir: "inside",
        hinge: "start",
      },
    ],
    windows: [
      {
        id: "win_1",
        wall: "top",
        offset: 70,
        width: 180,
      },
    ],
  },
  {
    id: "room_7py",
    name: "7평 표준형 원룸",
    py: 6.8,
    sqm: 22.4,
    width: 370, // 3.7m
    depth: 600, // 6.0m
    desc: "소파나 2인 식탁까지 여유롭게 배치 가능한 국민 표준 원룸",
    doors: [
      {
        id: "main_door",
        name: "현관문",
        wall: "bottom",
        offset: 140,
        width: 90,
        swingDir: "inside",
        hinge: "start",
      },
      {
        id: "bath_door",
        name: "화장실문",
        wall: "left",
        offset: 200,
        width: 75,
        swingDir: "inside",
        hinge: "start",
      },
    ],
    windows: [
      {
        id: "win_1",
        wall: "top",
        offset: 80,
        width: 210,
      },
    ],
  },
  {
    id: "room_10py",
    name: "10평 와이드 오피스텔",
    py: 9.8,
    sqm: 32.4,
    width: 450, // 4.5m
    depth: 720, // 7.2m
    desc: "침실과 거실 공간 분리 인테리어가 가능한 넓은 오피스텔",
    doors: [
      {
        id: "main_door",
        name: "현관문",
        wall: "bottom",
        offset: 40,
        width: 95,
        swingDir: "inside",
        hinge: "start",
      },
      {
        id: "bath_door",
        name: "화장실문",
        wall: "right",
        offset: 240,
        width: 80,
        swingDir: "inside",
        hinge: "start",
      },
    ],
    windows: [
      {
        id: "win_1",
        wall: "top",
        offset: 80,
        width: 290,
      },
    ],
  },
];

// 2. 가구 표준 카탈로그 18종
export const FURNITURE_CATALOG: FurnitureItem[] = [
  // --- 침대 (Bed) ---
  {
    id: "bed_ss",
    name: "슈퍼싱글 침대 (SS)",
    category: "bed",
    categoryLabel: "침대",
    width: 110,
    depth: 200,
    height: 50,
    color: "#e2e8f0",
    accentColor: "#94a3b8",
    desc: "성인 1인 가구 최다 선호 표준 규격 침대",
    specSummary: "110 × 200 cm",
    searchQuery: "슈퍼싱글 침대 프레임 매트리스",
  },
  {
    id: "bed_q",
    name: "퀸 침대 (Q)",
    category: "bed",
    categoryLabel: "침대",
    width: 150,
    depth: 200,
    height: 55,
    color: "#cbd5e1",
    accentColor: "#64748b",
    desc: "넓은 수면 공간을 선호하는 1~2인용 퀸 침대",
    specSummary: "150 × 200 cm",
    searchQuery: "퀸 침대 프레임",
  },
  {
    id: "bed_storage",
    name: "수납형 벙커 침대 (SS)",
    category: "bed",
    categoryLabel: "침대",
    width: 115,
    depth: 205,
    height: 85,
    color: "#f1f5f9",
    accentColor: "#3b82f6",
    desc: "하단에 대용량 서랍/벙커가 내장된 원룸 수납 끝판왕",
    specSummary: "115 × 205 cm",
    searchQuery: "수납 침대 슈퍼싱글 서랍형",
  },
  {
    id: "bed_single",
    name: "싱글 침대 (S)",
    category: "bed",
    categoryLabel: "침대",
    width: 100,
    depth: 200,
    height: 45,
    color: "#f8fafc",
    accentColor: "#cbd5e1",
    desc: "초소형 원룸을 위한 공간 절약형 싱글 침대",
    specSummary: "100 × 200 cm",
    searchQuery: "싱글 침대 1인용",
  },

  // --- 책상/테이블 (Desk & Table) ---
  {
    id: "desk_standard",
    name: "1인 표준 컴퓨터 책상",
    category: "desk",
    categoryLabel: "책상/테이블",
    width: 120,
    depth: 60,
    height: 72,
    color: "#475569",
    accentColor: "#0f172a",
    desc: "듀얼 모니터 또는 노트북+모니터에 딱 맞는 1200 책상",
    specSummary: "120 × 60 cm",
    searchQuery: "1200 컴퓨터 책상 120x60",
  },
  {
    id: "desk_wide",
    name: "와이드 게이밍 데스크",
    category: "desk",
    categoryLabel: "책상/테이블",
    width: 150,
    depth: 70,
    height: 72,
    color: "#1e293b",
    accentColor: "#10b981",
    desc: "본체 상판 거치 및 쾌적한 작업 공간의 1500 와이드 책상",
    specSummary: "150 × 70 cm",
    searchQuery: "1500 와이드 데스크 게이밍 책상",
  },
  {
    id: "desk_mini",
    name: "미니 콤팩트 데스크",
    category: "desk",
    categoryLabel: "책상/테이블",
    width: 80,
    depth: 50,
    height: 72,
    color: "#64748b",
    accentColor: "#334155",
    desc: "노트북 1대로 좁은 틈새에 배치 가능한 800 책상",
    specSummary: "80 × 50 cm",
    searchQuery: "800 미니 책상 80x50",
  },
  {
    id: "table_dining",
    name: "2인 원형/사각 다이닝 테이블",
    category: "desk",
    categoryLabel: "책상/테이블",
    width: 75,
    depth: 75,
    height: 74,
    color: "#f8fafc",
    accentColor: "#f59e0b",
    desc: "식사 및 감성 홈카페용 2인 식탁 테이블",
    specSummary: "75 × 75 cm",
    searchQuery: "원룸 2인 식탁 카페 테이블",
  },
  {
    id: "table_low",
    name: "원룸 좌식 소파 테이블",
    category: "desk",
    categoryLabel: "책상/테이블",
    width: 80,
    depth: 50,
    height: 35,
    color: "#cbd5e1",
    accentColor: "#94a3b8",
    desc: "바닥이나 러그 위에 두고 쓰는 접이식 좌식 테이블",
    specSummary: "80 × 50 cm",
    searchQuery: "접이식 좌식 테이블 소파 테이블",
  },

  // --- 수납/옷장 (Storage & Wardrobe) ---
  {
    id: "wardrobe_2door",
    name: "2문 도어 옷장",
    category: "storage",
    categoryLabel: "수납/옷장",
    width: 80,
    depth: 60,
    height: 190,
    color: "#334155",
    accentColor: "#1e293b",
    desc: "긴 코트와 외투를 깔끔하게 보관하는 스탠다드 옷장",
    specSummary: "80 × 60 cm (높이 190)",
    searchQuery: "원룸 800 옷장 2문",
  },
  {
    id: "storage_drawers",
    name: "3단 와이드 서랍장",
    category: "storage",
    categoryLabel: "수납/옷장",
    width: 80,
    depth: 40,
    height: 85,
    color: "#e2e8f0",
    accentColor: "#94a3b8",
    desc: "상판에 디퓨저/거울을 올려 화장대로도 활용 가능한 서랍장",
    specSummary: "80 × 40 cm",
    searchQuery: "3단 서랍장 800",
  },
  {
    id: "shelf_metal",
    name: "4단 철제 선반장",
    category: "storage",
    categoryLabel: "수납/옷장",
    width: 70,
    depth: 35,
    height: 150,
    color: "#0f172a",
    accentColor: "#475569",
    desc: "전자레인지, 밥솥, 책 등을 시원하게 개방형으로 수납",
    specSummary: "70 × 35 cm",
    searchQuery: "원룸 4단 철제 선반 렌지대",
  },
  {
    id: "hanger_stand",
    name: "선반 일체형 스탠드 행거",
    category: "storage",
    categoryLabel: "수납/옷장",
    width: 90,
    depth: 45,
    height: 160,
    color: "#64748b",
    accentColor: "#f59e0b",
    desc: "자주 입는 데일리 외투와 가방을 수납하는 오픈형 행거",
    specSummary: "90 × 45 cm",
    searchQuery: "스탠드 옷걸이 행거 선반형",
  },

  // --- 휴식/가전 (Living & Appliances) ---
  {
    id: "sofa_1p",
    name: "1인 패브릭 안락 소파",
    category: "living",
    categoryLabel: "휴식/가전",
    width: 85,
    depth: 80,
    height: 75,
    color: "#60a5fa",
    accentColor: "#2563eb",
    desc: "책 읽거나 TV 볼 때 나만의 힐링 공간 1인 소파",
    specSummary: "85 × 80 cm",
    searchQuery: "1인용 패브릭 소파 암체어",
  },
  {
    id: "sofa_2p",
    name: "2인 콤팩트 패브릭 소파",
    category: "living",
    categoryLabel: "휴식/가전",
    width: 130,
    depth: 75,
    height: 75,
    color: "#38bdf8",
    accentColor: "#0284c7",
    desc: "원룸 거실존을 완성해 주는 미니멀 2인 소파",
    specSummary: "130 × 75 cm",
    searchQuery: "2인용 소파 패브릭 미니",
  },
  {
    id: "fridge_mini",
    name: "소형 냉장고 (150L)",
    category: "living",
    categoryLabel: "휴식/가전",
    width: 50,
    depth: 55,
    height: 115,
    color: "#94a3b8",
    accentColor: "#475569",
    desc: "빌트인이 없는 원룸에 필수적인 소형 2도어 냉장고",
    specSummary: "50 × 55 cm",
    searchQuery: "원룸 소형 냉장고 150L",
  },
  {
    id: "mirror_stand",
    name: "스탠드 전신거울",
    category: "living",
    categoryLabel: "휴식/가전",
    width: 40,
    depth: 35,
    height: 160,
    color: "#cbd5e1",
    accentColor: "#f43f5e",
    desc: "출근 전 OOTD 착장 점검을 위한 슬림 전신거울",
    specSummary: "40 × 35 cm",
    searchQuery: "원룸 스탠드 전신거울 400",
  },
  {
    id: "rug_circle",
    name: "포근한 원형 러그 (120Ø)",
    category: "living",
    categoryLabel: "휴식/가전",
    width: 120,
    depth: 120,
    height: 2,
    color: "#fed7aa",
    accentColor: "#ea580c",
    desc: "차가운 바닥을 가려주고 인테리어 분위기를 살리는 원형 러그",
    specSummary: "지름 120 cm",
    searchQuery: "원형 러그 120cm 카페트",
  },
];

// 3. 원터치 추천 황금 배치 템플릿
export const GOLDEN_PRESETS: RoomPreset[] = [
  {
    id: "preset_sleep",
    name: "꿀잠 힐링형",
    subtitle: "창가 자연채광 침대와 침실 중심 아늑한 휴식 배치",
    tag: "인기 1위",
    templateId: "room_5py",
    furniture: [
      { instanceId: "f_1", furnitureId: "bed_ss", x: 200, y: 15, rotation: 0 },
      { instanceId: "f_2", furnitureId: "desk_standard", x: 15, y: 15, rotation: 0 },
      { instanceId: "f_3", furnitureId: "wardrobe_2door", x: 15, y: 240, rotation: 0 },
      { instanceId: "f_4", furnitureId: "mirror_stand", x: 15, y: 390, rotation: 0 },
    ],
  },
  {
    id: "preset_work",
    name: "재택근무 집중형",
    subtitle: "와이드 데스크를 채광 좋은 창가에 둔 생산성 중심 배치",
    tag: "직장인 추천",
    templateId: "room_7py",
    furniture: [
      { instanceId: "f_1", furnitureId: "desk_wide", x: 110, y: 15, rotation: 0 },
      { instanceId: "f_2", furnitureId: "bed_ss", x: 245, y: 220, rotation: 0 },
      { instanceId: "f_3", furnitureId: "sofa_1p", x: 20, y: 380, rotation: 0 },
      { instanceId: "f_4", furnitureId: "storage_drawers", x: 20, y: 80, rotation: 90 },
      { instanceId: "f_5", furnitureId: "hanger_stand", x: 260, y: 440, rotation: 0 },
    ],
  },
  {
    id: "preset_lounge",
    name: "호텔식 라운지형",
    subtitle: "2인 소파와 다이닝 테이블로 친구 초대하기 좋은 파티 배치",
    tag: "오피스텔 추천",
    templateId: "room_10py",
    furniture: [
      { instanceId: "f_1", furnitureId: "bed_q", x: 280, y: 20, rotation: 0 },
      { instanceId: "f_2", furnitureId: "sofa_2p", x: 20, y: 120, rotation: 90 },
      { instanceId: "f_3", furnitureId: "table_dining", x: 140, y: 140, rotation: 0 },
      { instanceId: "f_4", furnitureId: "wardrobe_2door", x: 20, y: 380, rotation: 0 },
      { instanceId: "f_5", furnitureId: "desk_standard", x: 20, y: 480, rotation: 0 },
    ],
  },
];

export const getFurnitureById = (id: string): FurnitureItem | undefined => {
  return FURNITURE_CATALOG.find((f) => f.id === id);
};

export const getTemplateById = (id: string): RoomTemplate => {
  return ROOM_TEMPLATES.find((t) => t.id === id) || ROOM_TEMPLATES[0];
};
