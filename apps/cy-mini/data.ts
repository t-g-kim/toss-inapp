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
  eggCost?: number;
  weatherEffect?: "none" | "sakura" | "rain" | "stars";
}

export interface MinimiChar {
  id: string;
  name: string;
  desc: string;
  dotArt: "boy" | "girl" | "rocker" | "cat" | "hiphop" | "boarder" | "gold_duck";
  eggCost?: number;
}

export interface MiniroomProp {
  id: string;
  name: string;
  category: "furniture" | "electronics" | "deco" | "pet";
  width: number;
  height: number;
  icon: string;
  defaultX: number; // 0 ~ 100 (%)
  defaultY: number; // 0 ~ 100 (%)
  eggCost?: number;
  interactMsg: string;
}

export interface PropPosition {
  x: number;
  y: number;
  flip?: boolean;
}

export interface RoomPreset {
  id: string;
  name: string;
  desc: string;
  badge: string;
  themeId: string;
  minimiId: string;
  bgmId: string;
  placedProps: string[];
  positions?: Record<string, PropPosition>;
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
  avatarType: "boy" | "girl" | "rocker" | "cat" | "hiphop" | "boarder" | "gold_duck";
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

export interface DiaryEntry {
  id: string;
  date: string;
  weather: "☀️ 맑음" | "🌧️ 비" | "☃️ 눈" | "🌙 새벽";
  mood: string;
  content: string;
  likes: number;
}

export interface QnaItem {
  id: string;
  q: string;
  a: string;
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

// 2. 미니룸 벽지/바닥 테마 6종
export const MINIROOM_THEMES: MiniroomTheme[] = [
  {
    id: "orange_classic",
    name: "시그니처 오렌지",
    wallColor: "#fed7aa",
    floorColor: "#d97706",
    gridColor: "#fb923c",
    tag: "인기 1위",
    weatherEffect: "none",
  },
  {
    id: "sky_blue",
    name: "하늘색 꿈",
    wallColor: "#bae6fd",
    floorColor: "#0284c7",
    gridColor: "#38bdf8",
    tag: "Y2K 감성",
    weatherEffect: "none",
  },
  {
    id: "strawberry_pink",
    name: "딸기우유 핑크",
    wallColor: "#fbcfe8",
    floorColor: "#db2777",
    gridColor: "#f472b6",
    tag: "러블리",
    weatherEffect: "none",
  },
  {
    id: "night_cyber",
    name: "미드나잇 사이버",
    wallColor: "#1e1b4b",
    floorColor: "#4338ca",
    gridColor: "#818cf8",
    tag: "새벽 감성",
    weatherEffect: "stars",
  },
  {
    id: "cherry_blossom",
    name: "봄날의 벚꽃 다락방",
    wallColor: "#ffe4e6",
    floorColor: "#be185d",
    gridColor: "#fda4af",
    tag: "벚꽃 낙하 🌸",
    eggCost: 3,
    weatherEffect: "sakura",
  },
  {
    id: "rainy_attic",
    name: "비 오는 날의 창가",
    wallColor: "#334155",
    floorColor: "#475569",
    gridColor: "#94a3b8",
    tag: "빗소리 무드 🌧️",
    eggCost: 3,
    weatherEffect: "rain",
  },
];

// 3. 미니미 아바타 7종
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
  {
    id: "boarder_boy",
    name: "Y2K 스노우보더",
    desc: "고글 장착! 겨울 스키장 간지 종결자",
    dotArt: "boarder",
    eggCost: 3,
  },
  {
    id: "gold_duck",
    name: "전설의 황금 오리왕",
    desc: "행운과 오리알을 부르는 레전드 아바타",
    dotArt: "gold_duck",
    eggCost: 5,
  },
];

// 4. 미니룸 도트 가구 & 소품 12종 (전체 픽셀 도트 SVG 렌더링 & 좌표/터치 반응 지원)
export const MINIROOM_PROPS: MiniroomProp[] = [
  {
    id: "crt_pc",
    name: "CRT 배불뚝이 모니터",
    category: "electronics",
    width: 48,
    height: 44,
    icon: "🖥️",
    defaultX: 14,
    defaultY: 66,
    interactMsg: "💬 [네이트온] 일촌 짱구님이 쪽지를 보냈습니다!",
  },
  {
    id: "turntable",
    name: "LP 오디오 턴테이블",
    category: "electronics",
    width: 44,
    height: 38,
    icon: "📻",
    defaultX: 29,
    defaultY: 75,
    interactMsg: "🎵 LP 턴테이블 바늘을 올려 레트로 BGM을 재생합니다!",
  },
  {
    id: "teddy_bear",
    name: "특대형 테디베어 인형",
    category: "deco",
    width: 40,
    height: 44,
    icon: "🧸",
    defaultX: 70,
    defaultY: 76,
    interactMsg: "🧸 폭신폭신 곰인형을 꾹 안아주었어요! (포근함 +10)",
  },
  {
    id: "guitar",
    name: "통기타 & 스탠드",
    category: "deco",
    width: 34,
    height: 50,
    icon: "🎸",
    defaultX: 88,
    defaultY: 68,
    interactMsg: "🎸 버즈 '가시' 인트로 기타 리프를 연주합니다~ 딩가딩♪",
  },
  {
    id: "retro_bed",
    name: "체크무늬 싱글 침대",
    category: "furniture",
    width: 68,
    height: 46,
    icon: "🛏️",
    defaultX: 82,
    defaultY: 63,
    interactMsg: "🛏️ 이불 밖은 위험해... 따끈한 체크무늬 침대!",
  },
  {
    id: "diary_desk",
    name: "원목 공부 책상",
    category: "furniture",
    width: 54,
    height: 44,
    icon: "🪑",
    defaultX: 33,
    defaultY: 61,
    interactMsg: "✍️ 책상 위 비밀 일기장에 오늘의 다짐을 적어봅니다.",
  },
  {
    id: "stand_mirror",
    name: "원목 전신 거울",
    category: "furniture",
    width: 32,
    height: 52,
    icon: "🪞",
    defaultX: 12,
    defaultY: 54,
    interactMsg: "🪞 거울 속 내 미니미의 오늘 코디 점수: 100점 만점!",
  },
  {
    id: "room_plant",
    name: "몬스테라 화분",
    category: "deco",
    width: 34,
    height: 42,
    icon: "🪴",
    defaultX: 22,
    defaultY: 58,
    interactMsg: "🪴 초록 화분에 물을 주었어요! 싱그러운 기분 UP!",
  },
  {
    id: "rain_window",
    name: "감성 아치 창문",
    category: "deco",
    width: 52,
    height: 48,
    icon: "🪟",
    defaultX: 50,
    defaultY: 32,
    eggCost: 2,
    interactMsg: "🪟 창밖 풍경을 바라보며 센치한 그 시절 추억에 잠깁니다...",
  },
  {
    id: "arcade_machine",
    name: "8비트 오락실 게임기",
    category: "electronics",
    width: 44,
    height: 54,
    icon: "🕹️",
    defaultX: 16,
    defaultY: 56,
    eggCost: 3,
    interactMsg: "🕹️ [보글보글 100판 돌파!] 오락실 최고 기록 경신!",
  },
  {
    id: "retro_puppy",
    name: "도트 강아지 뽀삐",
    category: "pet",
    width: 38,
    height: 36,
    icon: "🐶",
    defaultX: 62,
    defaultY: 81,
    eggCost: 3,
    interactMsg: "🐶 멍멍! 강아지 뽀삐가 꼬리를 흔들며 애교를 부려요 ♥",
  },
  {
    id: "lava_lamp",
    name: "네온 라바 무드등",
    category: "deco",
    width: 30,
    height: 44,
    icon: "💡",
    defaultX: 86,
    defaultY: 79,
    eggCost: 2,
    interactMsg: "💡 은은한 오렌지빛 네온 무드등이 방 안을 따뜻하게 비춥니다.",
  },
];

export const DEFAULT_PROP_POSITIONS: Record<string, PropPosition> = MINIROOM_PROPS.reduce(
  (acc, prop) => {
    acc[prop.id] = { x: prop.defaultX, y: prop.defaultY, flip: false };
    return acc;
  },
  {} as Record<string, PropPosition>
);

// 4-2. 원클릭 인테리어 방 프리셋 4종
export const ROOM_PRESETS: RoomPreset[] = [
  {
    id: "preset_orange",
    name: "2005 오렌지 공부방",
    desc: "CRT 모니터, LP 턴테이블과 체크 침대가 있는 정석 미니룸",
    badge: "시그니처",
    themeId: "orange_classic",
    minimiId: "headphone_boy",
    bgmId: "bgm_1",
    placedProps: ["crt_pc", "turntable", "retro_bed", "teddy_bear"],
  },
  {
    id: "preset_band",
    name: "홍대 인디밴드 합주실",
    desc: "통기타, LP 오디오, 전신 거울이 어우러진 락스타의 방",
    badge: "락 스피릿",
    themeId: "night_cyber",
    minimiId: "rocker_chic",
    bgmId: "bgm_5",
    placedProps: ["guitar", "turntable", "stand_mirror", "crt_pc"],
  },
  {
    id: "preset_pink",
    name: "러블리 핑크 다이어리룸",
    desc: "곰인형, 원목 공부 책상, 화분이 놓인 아기자기한 소녀의 방",
    badge: "인기 추천",
    themeId: "strawberry_pink",
    minimiId: "uniform_girl",
    bgmId: "bgm_3",
    placedProps: ["retro_bed", "teddy_bear", "diary_desk", "room_plant"],
  },
  {
    id: "preset_cozy",
    name: "하늘빛 냥집사 휴식방",
    desc: "화분과 곰인형, 배불뚝이 PC가 있는 포근한 집순이 하우스",
    badge: "힐링 감성",
    themeId: "sky_blue",
    minimiId: "cat_pajama",
    bgmId: "bgm_4",
    placedProps: ["teddy_bear", "crt_pc", "room_plant", "stand_mirror"],
  },
];

// 5. 오늘의 기분 프리셋 6종 (투데이 이즈...)
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

// 6-2. Y2K 싸이월드 외계어/감성체 자동 변환기
export function convertToCyStyle(input: string): string {
  if (!input.trim()) return "ㄴr는 ㄱr끔 눈물을 흘린ㄷr...★";
  let res = input
    .replace(/나는/g, "ㄴr는")
    .replace(/내가/g, "ㄴHㄱr")
    .replace(/가끔/g, "ㄱr끔")
    .replace(/사랑/g, "ㅅr랑")
    .replace(/사람/g, "ㅅr람")
    .replace(/마음/g, "ㅁr음")
    .replace(/바보/g, "ㅂr보")
    .replace(/안녕/g, "ㅇr녕")
    .replace(/진짜/g, "진ㅉr")
    .replace(/너무/g, "너뮤")
    .replace(/한다/g, "한ㄷr")
    .replace(/간다/g, "간ㄷr")
    .replace(/온다/g, "온ㄷr")
    .replace(/린다/g, "린ㄷr")
    .replace(/웃는다/g, "웃는ㄷr")
    .replace(/운다/g, "운ㄷr")
    .replace(/이다/g, "이ㄷr")
    .replace(/있다/g, "있ㄷr")
    .replace(/없다/g, "없ㄷr")
    .replace(/좋아/g, "좋ㅇr")
    .replace(/아파/g, "ㅇrㅍr");

  if (!res.includes("★") && !res.includes("♡") && !res.includes("...")) {
    res = `★..${res}..★`;
  }
  return res;
}

// 6-3. 기본 다이어리 기록 & 백문백답
export const DEFAULT_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "diary_1",
    date: "2005.10.12 WED",
    weather: "🌙 새벽",
    mood: "💧 센치함",
    content: "ㄴr는 ㄱr끔 눈물을 흘린ㄷr... 소리 없이 흐르는 눈물이 내 맘을 전해줄까...\n오늘도 이어폰을 꽂고 버즈 노래를 듣다가 잠이 든다.",
    likes: 24,
  },
  {
    id: "diary_2",
    date: "2005.10.10 MON",
    weather: "☀️ 맑음",
    mood: "☀️ 행복",
    content: "방과 후에 애들이랑 분식집에서 컵떡볶이랑 피카츄 돈까스 먹었다 ㅎㅎ\n코노 가서 1시간 동안 목 쉬도록 노래 부른 날! 우리 우정 영원하자 ★",
    likes: 41,
  },
];

export const DEFAULT_QNA_ITEMS: QnaItem[] = [
  { id: "q1", q: "01. 나의 보물 1호는?", a: "아이리버 MP3 & 단짝 일촌들과 찍은 스티커 사진 ♥" },
  { id: "q2", q: "02. 노래방 18번 애창곡은?", a: "버즈 - 가시 / 프리스타일 - Y (Please Tell Me Why)" },
  { id: "q3", q: "03. 지금 좋아하는 사람 이니셜은?", a: "비밀 (ㅎㅈ... 눈치채면 바보 >_<)" },
  { id: "q4", q: "04. 지금 지갑 속에 있는 현금은?", a: "꼬깃꼬깃 천원짜리 3장 + 버스카드" },
  { id: "q5", q: "05. 20년 뒤 미래의 나에게 한마디!", a: "그때도 지금처럼 순수하고 따뜻한 음악을 사랑하길..★" },
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

export interface FriendSkin {
  themeName: string;
  bgClass: string;
  containerClass: string;
  frameBorder: string;
  headerBg: string;
  headerText: string;
  accentBg: string;
  accentText: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  roomFrameBg: string;
  roomWallTag: string;
}

export interface FriendMiniroom {
  id: string;
  ownerName: string;
  ilchonTitle: string;
  avatarEmoji: string;
  homeTitle: string;
  moodText: string;
  themeId: string;
  minimiId: string;
  bgmId: string;
  placedProps: string[];
  todayCount: number;
  totalCount: number;
  intro: string;
  skin: FriendSkin;
  guestbook: GuestbookEntry[];
}

export const FRIEND_MINIROOMS: FriendMiniroom[] = [
  {
    id: "friend_jjanggu",
    ownerName: "짱구",
    ilchonTitle: "영혼의 단짝",
    avatarEmoji: "🧢",
    homeTitle: "†..MC짱구의 힙합 전사 구역..†",
    moodText: "음악만이 나라가 허락한 유일한 마약 🎧",
    themeId: "night_cyber",
    minimiId: "hiphop_dandy",
    bgmId: "bgm_5",
    placedProps: ["crt_pc", "turntable", "guitar", "arcade_machine"],
    todayCount: 1204,
    totalCount: 42910,
    intro: "신발은 팀버랜드, 바지는 힙합 통바지. 일촌평 달면 100% 맞일촌 간다.",
    skin: {
      themeName: "스트릿 힙합 다크",
      bgClass: "bg-[#18181b]",
      containerClass: "text-zinc-100",
      frameBorder: "border-zinc-700",
      headerBg: "bg-zinc-900 border-zinc-800",
      headerText: "text-zinc-100",
      accentBg: "bg-amber-500 hover:bg-amber-600",
      accentText: "text-zinc-950 font-black",
      cardBg: "bg-zinc-900",
      cardBorder: "border-zinc-800",
      badgeBg: "bg-amber-950/80",
      badgeText: "text-amber-300",
      roomFrameBg: "bg-[#27272a] border-zinc-700",
      roomWallTag: "🎤 MC 짱구의 힙합 구역",
    },
    guestbook: [
      {
        id: "fb_1_1",
        no: 99,
        author: "철수",
        ilchonRelation: "동네 친구",
        avatarType: "rocker",
        content: "야 오늘 버즈 신곡 뮤비 봤냐? 민경훈 가죽자켓 미쳤다 ㅋㅋㅋ",
        createdAt: "2005.10.12 16:20",
        sticker: "bgm",
        duckEggGift: 1,
        reply: { author: "짱구", content: "당연히 봤지 내일 코노에서 가시 부른다", createdAt: "15분 전" },
      },
      {
        id: "fb_1_2",
        no: 98,
        author: "유진",
        ilchonRelation: "기억속 첫사랑",
        avatarType: "girl",
        content: "오늘 숙제 뭐였지? 수학 84페이지 맞나? 알려줘!",
        createdAt: "2005.10.12 13:40",
        sticker: "hi",
        duckEggGift: 1,
      },
    ],
  },
  {
    id: "friend_yujin",
    ownerName: "유진",
    ilchonTitle: "기억속 첫사랑",
    avatarEmoji: "👧",
    homeTitle: "🌸 유진이의 핑크빛 다이어리 🌸",
    moodText: "오늘 하루도 맑음 뒤 설렘 가득..♥",
    themeId: "strawberry_pink",
    minimiId: "uniform_girl",
    bgmId: "bgm_3",
    placedProps: ["retro_bed", "teddy_bear", "diary_desk", "rain_window"],
    todayCount: 890,
    totalCount: 31540,
    intro: "도서관 자리 맡아줄 사람 구함 ㅎㅎ 들렀다 갈 때 오리알 하나씩 두고 가기!",
    skin: {
      themeName: "러블리 핑크 다이어리",
      bgClass: "bg-[#fff1f2]",
      containerClass: "text-pink-950",
      frameBorder: "border-pink-200",
      headerBg: "bg-pink-100/90 border-pink-200",
      headerText: "text-pink-950",
      accentBg: "bg-rose-500 hover:bg-rose-600",
      accentText: "text-white font-black",
      cardBg: "bg-white",
      cardBorder: "border-pink-200/80",
      badgeBg: "bg-pink-100",
      badgeText: "text-rose-700",
      roomFrameBg: "bg-[#fff5f6] border-pink-200",
      roomWallTag: "🌸 유진이의 핑크빛 다이어리",
    },
    guestbook: [
      {
        id: "fb_2_1",
        no: 120,
        author: "소희",
        ilchonRelation: "절친",
        avatarType: "cat",
        content: "유진아 오늘 독서실 끝나고 와플 먹으러 가자! 내가 쏠게 >_<",
        createdAt: "2005.10.12 15:10",
        sticker: "love",
        duckEggGift: 2,
        reply: { author: "유진", content: "콜!! 딸기 생크림 와플 먹을래 히히", createdAt: "30분 전" },
      },
    ],
  },
  {
    id: "friend_chulsoo",
    ownerName: "철수",
    ilchonTitle: "락스타 민경훈",
    avatarEmoji: "🎸",
    homeTitle: "🎸 버즈 민경훈 가시 100만번 완창..🎸",
    moodText: "ㄴr는 ㄱr끔 눈물을 흘린ㄷr...💧",
    themeId: "orange_classic",
    minimiId: "rocker_chic",
    bgmId: "bgm_2",
    placedProps: ["guitar", "turntable", "stand_mirror", "lava_lamp"],
    todayCount: 560,
    totalCount: 19800,
    intro: "홍대 인디 클럽 오디션 D-3. 기타 줄 갈았다. 파도타기 환영!",
    skin: {
      themeName: "빈티지 락 밴드",
      bgClass: "bg-[#f1f5f9]",
      containerClass: "text-slate-900",
      frameBorder: "border-slate-300",
      headerBg: "bg-slate-800 border-slate-700",
      headerText: "text-white",
      accentBg: "bg-blue-600 hover:bg-blue-700",
      accentText: "text-white font-black",
      cardBg: "bg-white",
      cardBorder: "border-slate-200",
      badgeBg: "bg-blue-100",
      badgeText: "text-blue-800",
      roomFrameBg: "bg-[#f8fafc] border-slate-300",
      roomWallTag: "🎸 락스타 민경훈 존",
    },
    guestbook: [
      {
        id: "fb_3_1",
        no: 65,
        author: "짱구",
        ilchonRelation: "영혼의 단짝",
        avatarType: "hiphop",
        content: "철수야 기타 줄 튜닝이나 똑바로 해라 ㅋㅋㅋ 파도타고 왔다 감",
        createdAt: "2005.10.12 11:00",
        sticker: "pado",
        duckEggGift: 1,
      },
    ],
  },
  {
    id: "friend_cat",
    ownerName: "소희",
    ilchonTitle: "냥집사 동네친구",
    avatarEmoji: "🐱",
    homeTitle: "🐾 고양이 세 마리와 나른한 오후 🐾",
    moodText: "골골송 들으며 이불 속 뒹굴뒹굴 🐱",
    themeId: "sky_blue",
    minimiId: "cat_pajama",
    bgmId: "bgm_1",
    placedProps: ["teddy_bear", "crt_pc", "room_plant", "retro_puppy"],
    todayCount: 712,
    totalCount: 24300,
    intro: "우리 집 고양이 츄르 대신 오리알 받아요 🥚 오리알 쏘고 소원 빌기!",
    skin: {
      themeName: "웜 크림 냥이 하우스",
      bgClass: "bg-[#fefce8]",
      containerClass: "text-amber-950",
      frameBorder: "border-amber-200",
      headerBg: "bg-amber-100/90 border-amber-200",
      headerText: "text-amber-950",
      accentBg: "bg-amber-600 hover:bg-amber-700",
      accentText: "text-white font-black",
      cardBg: "bg-white",
      cardBorder: "border-amber-200/80",
      badgeBg: "bg-amber-100",
      badgeText: "text-amber-800",
      roomFrameBg: "bg-[#fffbeb] border-amber-200",
      roomWallTag: "🐾 소희의 냥냥 다락방",
    },
    guestbook: [
      {
        id: "fb_4_1",
        no: 82,
        author: "유진",
        ilchonRelation: "절친",
        avatarType: "girl",
        content: "소희야 고양이 사진 더 올려줘!! 너무 귀여워서 심장 아파 ㅠㅠ",
        createdAt: "2005.10.12 12:30",
        sticker: "love",
        duckEggGift: 1,
      },
    ],
  },
];
