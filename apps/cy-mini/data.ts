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

export interface GuestbookEntry {
  id: string;
  no: number;
  author: string;
  ilchonRelation: string;
  avatarType: "boy" | "girl" | "rocker" | "cat" | "hiphop";
  content: string;
  createdAt: string;
  isSecret?: boolean;
  duckEggGift?: number;
  sticker?: "scrap" | "pado" | "bgm" | "love" | "hi";
  reply?: {
    author: string;
    content: string;
    createdAt: string;
  };
}

// 1. 감성 레트로 Lo-Fi & 8-bit BGM 8곡 (저작권 프리 자체 오리지널)
export const CY_BGMS: BpmTrack[] = [
  { id: "bgm_1", title: "새벽 2시의 다이어리 (Lo-Fi)", artist: "미니룸 스튜디오", year: "2004" },
  { id: "bgm_2", title: "오렌지빛 미니룸 (Y2K Lounge)", artist: "도트 비트", year: "2005" },
  { id: "bgm_3", title: "그 시절, 너에게 (Acoustic)", artist: "레트로 소년", year: "2005" },
  { id: "bgm_4", title: "오리알로 산 추억 (Music Box)", artist: "오르골 밴드", year: "2003" },
  { id: "bgm_5", title: "방과 후 운동장 바람 (Chiptune)", artist: "8비트 히어로", year: "2005" },
  { id: "bgm_6", title: "비 오는 날의 창가 (Rain Lo-Fi)", artist: "센티멘탈 룸", year: "2006" },
  { id: "bgm_7", title: "파도타기 서핑 (Retro Synth)", artist: "사이버 키드", year: "2004" },
  { id: "bgm_8", title: "너와 나의 비밀 일기 (Piano)", artist: "미니미 멜로디", year: "2005" },
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
  { id: "memory", emoji: "🥚", label: "추억", status: "그리운 그 시절.. 오리알 10개만" },
];

// 6. 감성 싸이체 명대사 리스트
export const RETRO_CY_QUOTES = [
  "ㄴr는 ㄱr끔 눈물을 흘린ㄷr... 소리 없이 흐르는 눈물이 내 맘을 전해줄까...",
  "음악만이 나라에서 허락하는 유일한 마약이니까... 헤드폰을 쓴 순간 난 자유다.",
  "친구가 말했다. 잊으라고. 내가 웃었다. 어떻게 숨 쉬는 걸 잊냐고...",
  "퍼가요~♡ (비공개 스크랩 금지! 오리알 1개 선물되었습니다)",
  "바람이 분다. 서늘하다. 하지만 내 가슴은 아직 뜨겁다.",
  "오늘 밤도 너의 미니홈피를 몰래 파도타기 하다가 잠이 든다...",
];

// 7. 기본 일촌평 샘플
export const DEFAULT_ILCHON_COMMENTS: IlchonComment[] = [
  { id: "c1", ilchonName: "영혼의 단짝", author: "짱구", content: "야 오늘 방과후에 코노 가서 버즈 부를 사람? ㅋㅋㅋ", time: "10분 전" },
  { id: "c2", ilchonName: "기억속 첫사랑", author: "유진", content: "들렀다 간다~ BGM 선곡 대박이네 ^^ 감기 조심해!", time: "1시간 전" },
  { id: "c3", ilchonName: "동네 친구", author: "철수", content: "퍼가요~♡ 오리알 1개 쐈다! 방명록 남기고 감", time: "3시간 전" },
];

// 8. 레트로 감성 방명록 기본 데이터
export const DEFAULT_GUESTBOOK_ENTRIES: GuestbookEntry[] = [
  {
    id: "gb_1",
    no: 48,
    author: "짱구",
    ilchonRelation: "영혼의 단짝",
    avatarType: "boy",
    content: "야 오늘 방과후에 코노 가서 버즈 가시 부를 사람? ㅋㅋㅋ 늦게 오면 짤 없다. 오리알 1개 투척하고 감!",
    createdAt: "2005.10.12 16:40",
    isSecret: false,
    duckEggGift: 1,
    sticker: "scrap",
    reply: {
      author: "주인장",
      content: "콜 ㅋㅋㅋ 5시까지 버스정류장 앞으로 모여라",
      createdAt: "10분 전",
    },
  },
  {
    id: "gb_2",
    no: 47,
    author: "유진",
    ilchonRelation: "기억속 첫사랑",
    avatarType: "girl",
    content: "미니룸 새로 꾸몄네? 오렌지 벽지 너무 예쁘다 ㅎㅎ BGM 선곡도 완전 내 취향이야... 요즘 일교차 심한데 감기 조심해!",
    createdAt: "2005.10.12 14:15",
    isSecret: false,
    duckEggGift: 1,
    sticker: "love",
    reply: {
      author: "주인장",
      content: "고마워 유진아! 너두 따뜻하게 입고 다녀~ ^^",
      createdAt: "1시간 전",
    },
  },
  {
    id: "gb_3",
    no: 46,
    author: "철수",
    ilchonRelation: "동네 친구",
    avatarType: "rocker",
    content: "파도타기 하다가 네 미니홈피 발견 ㅋㅋㅋ 일촌평 남기러 왔다가 방명록 정독하고 간다. 내 홈피도 파도타서 놀러와라!",
    createdAt: "2005.10.12 11:20",
    isSecret: false,
    duckEggGift: 0,
    sticker: "pado",
  },
  {
    id: "gb_4",
    no: 45,
    author: "익명",
    ilchonRelation: "비밀 친구",
    avatarType: "cat",
    content: "사실 예전부터 너 지켜보고 있었어... 방과 후에 잠깐 복도에서 얘기할 수 있을까? 부담 갖진 마...",
    createdAt: "2005.10.11 22:50",
    isSecret: true,
    duckEggGift: 1,
    sticker: "love",
  },
];
