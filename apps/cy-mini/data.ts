/**
 * 싸이감성 미니홈피 - 레트로 Y2K 데이터 및 프리셋
 */

export interface BpmTrack {
  id: string;
  title: string;
  artist: string;
  year: string;
}

export interface MiniroomTheme {
  id: string;
  name: string;
  wallColor: string;
  floorColor: string;
  gridColor: string;
  tag: string;
}

export interface MinimiChar {
  id: string;
  name: string;
  desc: string;
  dotArt: string; // SVG 도트 비주얼 타입
}

export interface MiniroomProp {
  id: string;
  name: string;
  category: "furniture" | "electronics" | "deco";
  width: number;
  height: number;
  icon: string;
}

export interface IlchonComment {
  id: string;
  ilchonName: string;
  author: string;
  content: string;
  time: string;
}

// 1. 전설의 싸이월드 BGM 8곡
export const CY_BGMS: BpmTrack[] = [
  { id: "bgm_1", title: "Y (Please Tell Me Why)", artist: "프리스타일", year: "2004" },
  { id: "bgm_2", title: "Fly (feat. Amin. J)", artist: "에픽하이", year: "2005" },
  { id: "bgm_3", title: "사랑했나봐", artist: "윤도현", year: "2005" },
  { id: "bgm_4", title: "She Is", artist: "클래지콰이", year: "2005" },
  { id: "bgm_5", title: "너에게 쓰는 편지", artist: "MC몽 (feat. 린)", year: "2004" },
  { id: "bgm_6", title: "가시", artist: "버즈", year: "2005" },
  { id: "bgm_7", title: "낭만고양이", artist: "체리필터", year: "2002" },
  { id: "bgm_8", title: "내사람 (Partner For Life)", artist: "SG워너비", year: "2006" },
];

// 2. 미니룸 벽지/바닥 테마 4종
export const MINIROOM_THEMES: MiniroomTheme[] = [
  {
    id: "orange_classic",
    name: "시그니처 오렌지",
    wallColor: "#fed7aa", // 오렌지 벽지
    floorColor: "#d97706", // 우드 장판
    gridColor: "#fb923c",
    tag: "인기 1위",
  },
  {
    id: "sky_blue",
    name: "하늘색 꿈",
    wallColor: "#bae6fd", // 파스텔 하늘
    floorColor: "#0284c7", // 타일 바닥
    gridColor: "#38bdf8",
    tag: "Y2K 감성",
  },
  {
    id: "strawberry_pink",
    name: "딸기우유 핑크",
    wallColor: "#fbcfe8", // 핑크 벽지
    floorColor: "#db2777", // 핑크 체크
    gridColor: "#f472b6",
    tag: "러블리",
  },
  {
    id: "night_cyber",
    name: "미드나잇 사이버",
    wallColor: "#1e1b4b", // 다크 네이비
    floorColor: "#4338ca", // 네온 퍼플
    gridColor: "#818cf8",
    tag: "새벽 감성",
  },
];

// 3. 미니미 아바타 5종
export const MINIMI_CHARS: MinimiChar[] = [
  {
    id: "headphone_boy",
    name: "헤드폰 감성 소년",
    desc: "음악만이 나라가 허락한 유일한 마약",
    dotArt: "boy",
  },
  {
    id: "uniform_girl",
    name: "단발 교복 소녀",
    desc: "방과 후 떡볶이 먹으러 갈 일촌 구함",
    dotArt: "girl",
  },
  {
    id: "rocker_chic",
    name: "락스타 가죽자켓",
    desc: "버즈 민경훈 두성 창법 연마 중",
    dotArt: "rocker",
  },
  {
    id: "cat_pajama",
    name: "고양이 잠옷 집순이",
    desc: "미니홈피 파도타기 하느라 밤샘",
    dotArt: "cat",
  },
  {
    id: "hiphop_dandy",
    name: "통바지 힙합퍼",
    desc: "비트 위에 몸을 맡긴 힙합 전사",
    dotArt: "hiphop",
  },
];

// 4. 미니룸 도트 가구 & 소품 8종
export const MINIROOM_PROPS: MiniroomProp[] = [
  { id: "crt_pc", name: "CRT 배불뚝이 모니터", category: "electronics", width: 44, height: 40, icon: "🖥️" },
  { id: "turntable", name: "LP 오디오 턴테이블", category: "electronics", width: 40, height: 35, icon: "📻" },
  { id: "teddy_bear", name: "특대형 테디베어 인형", category: "deco", width: 36, height: 42, icon: "🧸" },
  { id: "guitar", name: "통기타 & 스탠드", category: "deco", width: 28, height: 50, icon: "🎸" },
  { id: "retro_bed", name: "체크무늬 싱글 침대", category: "furniture", width: 65, height: 45, icon: "🛏️" },
  { id: "diary_desk", name: "원목 공부 책상", category: "furniture", width: 55, height: 40, icon: "🪑" },
  { id: "stand_mirror", name: "전신 거울", category: "furniture", width: 26, height: 55, icon: "🪞" },
  { id: "room_plant", name: "몬스테라 화분", category: "deco", width: 28, height: 38, icon: "🪴" },
];

// 5. 오늘의 기분 프리셋 6종
export const MOOD_PRESETS = [
  { id: "cry", emoji: "💧", label: "눈물", status: "ㄴr는 ㄱr끔 눈물을 흘린ㄷr..." },
  { id: "happy", emoji: "☀️", label: "행복", status: "햇살 좋은 날.. 감기조심해..★" },
  { id: "love", emoji: "💓", label: "설렘", status: "심장이 쿵쾅쿵쾅.. 너 때문일까?" },
  { id: "study", emoji: "✍️", label: "열공", status: "내 미래는 내가 만든ㄷr.. 시험 D-3" },
  { id: "tired", emoji: "✌️", label: "피-쓰", status: "세상이 날 힘들게 해도 난 웃는ㄷr.." },
  { id: "memory", emoji: "🌰", label: "추억", status: "그리운 그 시절.. 도토리 10개만" },
];

// 6. 감성 싸이체 명대사 리스트
export const RETRO_CY_QUOTES = [
  "ㄴr는 ㄱr끔 눈물을 흘린ㄷr... 소리 없이 흐르는 눈물이 내 맘을 전해줄까...",
  "음악만이 나라에서 허락하는 유일한 마약이니까... 헤드폰을 쓴 순간 난 자유다.",
  "친구가 말했다. 잊으라고. 내가 웃었다. 어떻게 숨 쉬는 걸 잊냐고...",
  "퍼가요~♡ (비공개 스크랩 금지! 도토리 1개 차감되었습니다)",
  "바람이 분다. 서늘하다. 하지만 내 가슴은 아직 뜨겁다.",
  "오늘 밤도 너의 미니홈피를 몰래 파도타기 하다가 잠이 든다...",
];

// 7. 기본 일촌평 샘플
export const DEFAULT_ILCHON_COMMENTS: IlchonComment[] = [
  { id: "c1", ilchonName: "영혼의 단짝", author: "짱구", content: "야 오늘 방과후에 코노 가서 버즈 부를 사람? ㅋㅋㅋ", time: "10분 전" },
  { id: "c2", ilchonName: "기억속 첫사랑", author: "유진", content: "들렀다 간다~ BGM 선곡 대박이네 ^^ 감기 조심해!", time: "1시간 전" },
  { id: "c3", ilchonName: "동네 친구", author: "철수", content: "퍼가요~♡ 도토리 1개 쐈다! 일촌평 남기고 감", time: "3시간 전" },
];
