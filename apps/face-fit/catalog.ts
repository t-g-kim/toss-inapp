export type FaceShapeKey = "oval" | "round" | "square" | "heart" | "oblong" | "diamond";

export interface FaceShapeInfo {
  id: FaceShapeKey;
  name: string;
  englishName: string;
  emoji: string;
  badge: string;
  desc: string;
  proportions: {
    ratio: string;
    jawline: string;
    forehead: string;
    cheekbone: string;
  };
  svgModifiers: {
    jawWidth: number; // 0.8 ~ 1.2
    chinDrop: number; // 0.8 ~ 1.2
    foreheadWidth: number;
    cheekCurve: number;
  };
  bestHair: string[];
  bestGlasses: string[];
  worstGlasses: string[];
  stylingAdvice: {
    hair: string;
    glasses: string;
  };
}

export const FACE_SHAPES: Record<FaceShapeKey, FaceShapeInfo> = {
  oval: {
    id: "oval",
    name: "계란형",
    englishName: "Oval Face",
    emoji: "🥚",
    badge: "황금 비율",
    desc: "이마와 턱의 균형이 완벽하고 턱선이 부드럽게 좁아지는 가장 이상적인 축복받은 얼굴형입니다.",
    proportions: {
      ratio: "세로 1.4 : 가로 1.0 (황금비)",
      jawline: "매끄럽고 갸름한 곡선",
      forehead: "적당히 넓고 둥근 라인",
      cheekbone: "과하지 않고 완만한 곡선",
    },
    svgModifiers: {
      jawWidth: 0.95,
      chinDrop: 1.05,
      foreheadWidth: 1.0,
      cheekCurve: 1.0,
    },
    bestHair: ["모든 헤어스타일 소화", "가일컷", "시스루 댄디컷", "레이어드 C컬", "히피펌"],
    bestGlasses: ["아넬형 뿔테", "크라운판토", "하금테", "원형 메탈", "스퀘어 메탈"],
    worstGlasses: ["얼굴 폭을 과도하게 벗어나는 오버사이즈"],
    stylingAdvice: {
      hair: "축복받은 얼굴형으로 어떤 헤어든 잘 어울려요. 이마를 시원하게 드러내면 신뢰감과 또렷한 이목구비가 돋보입니다.",
      glasses: "대부분의 프레임이 찰떡입니다! 콧대와 눈썹 라인에 자연스럽게 맞춰 취향껏 개성을 살려보세요.",
    },
  },
  round: {
    id: "round",
    name: "둥근형",
    englishName: "Round Face",
    emoji: "🌕",
    badge: "부드러운 동안상",
    desc: "얼굴의 가로와 세로 비율이 거의 비슷하며, 볼살이 부드럽고 턱 끝이 둥글어 친근하고 어려 보이는 인상입니다.",
    proportions: {
      ratio: "세로 1.1 : 가로 1.0 (균등)",
      jawline: "각이 거의 없는 둥근 턱선",
      forehead: "둥글고 볼륨감 있는 이마",
      cheekbone: "볼과 함께 이어지는 도톰한 라인",
    },
    svgModifiers: {
      jawWidth: 1.1,
      chinDrop: 0.9,
      foreheadWidth: 1.05,
      cheekCurve: 1.15,
    },
    bestHair: ["리프컷", "아이비리그컷", "사이드뱅 롱웨이브", "슬릭컷 단발", "애즈펌"],
    bestGlasses: ["스퀘어 사각 메탈", "아넬형 뿔테", "크라운판토", "하금테"],
    worstGlasses: ["완전 원형 메탈 (얼굴을 더 둥글게 보임)"],
    stylingAdvice: {
      hair: "정수리(탑) 볼륨을 살리고 옆머리를 슬림하게 다운펌 해주면 시선이 세로로 분산되어 얼굴이 갸름해 보여요.",
      glasses: "직선미나 상단에 각이 있는 스퀘어나 크라운판토, 하금테를 선택해 얼굴의 둥근 라인에 엣지를 더해주세요.",
    },
  },
  square: {
    id: "square",
    name: "각진형",
    englishName: "Square Face",
    emoji: "🔲",
    badge: "또렷한 카리스마",
    desc: "이마, 볼, 턱의 너비가 비슷하고 하관 턱선이 뚜렷하게 발달하여 남성적이고 신뢰감을 주는 서구적 얼굴형입니다.",
    proportions: {
      ratio: "세로 1.15 : 가로 1.0 (선명함)",
      jawline: "각이 또렷하고 단단한 하관",
      forehead: "넓고 직선에 가까운 라인",
      cheekbone: "옆으로 곧게 뻗은 구조",
    },
    svgModifiers: {
      jawWidth: 1.18,
      chinDrop: 0.95,
      foreheadWidth: 1.12,
      cheekCurve: 0.92,
    },
    bestHair: ["가일컷", "시스루 댄디컷", "허쉬컷", "자연스러운 쉐도우펌", "레이어드 롱펌"],
    bestGlasses: ["원형 티타늄 메탈", "보스턴형 콤비", "크라운판토", "타원형 뿔테"],
    worstGlasses: ["두꺼운 사각 각진 뿔테 (하관 각을 강조함)"],
    stylingAdvice: {
      hair: "자연스러운 웨이브와 텍스처로 강한 하관 라인을 부드럽게 감싸주세요. 가르마를 타 시선을 위로 끌어올리면 좋습니다.",
      glasses: "둥근 원형이나 부드러운 곡선형 프레임을 매치하면 인상이 한층 부드럽고 지적으로 바뀝니다.",
    },
  },
  heart: {
    id: "heart",
    name: "하트형",
    englishName: "Heart Face",
    emoji: "💖",
    badge: "세련된 V라인",
    desc: "이마와 광대 쪽이 넓고 턱 끝으로 내려갈수록 갸름하고 뾰족해지는 날렵하고 현대적인 브이라인 얼굴형입니다.",
    proportions: {
      ratio: "세로 1.3 : 가로 1.0 (역삼각)",
      jawline: "날렵하고 뾰족한 V라인",
      forehead: "넓고 시원한 상안부",
      cheekbone: "존재감 있는 입체적 광대",
    },
    svgModifiers: {
      jawWidth: 0.82,
      chinDrop: 1.08,
      foreheadWidth: 1.15,
      cheekCurve: 1.08,
    },
    bestHair: ["리프컷", "태슬컷 단발", "레이어드 C컬", "히피펌", "댄디컷"],
    bestGlasses: ["원형 메탈", "투명 뿔테", "하금테", "보스턴형 콤비", "무테"],
    worstGlasses: ["상단만 지나치게 두꺼운 캐츠아이 및 극단적 하금테"],
    stylingAdvice: {
      hair: "턱선 주변에 C컬이나 웨이브로 볼륨을 채워주면 좁은 하관이 보완되어 전체적인 균형미가 극대화됩니다.",
      glasses: "하단에 무게감이 있거나 투명한 프레임, 둥근 메탈 안경이 넓은 이마와 좁은 턱의 대비를 완화해 줍니다.",
    },
  },
  oblong: {
    id: "oblong",
    name: "긴형",
    englishName: "Oblong Face",
    emoji: "📏",
    badge: "지적이고 성숙한 상",
    desc: "얼굴의 세로 길이가 가로 너비보다 확연히 길어 성숙하고 단정하며 귀족적인 지적 분위기를 풍기는 얼굴형입니다.",
    proportions: {
      ratio: "세로 1.6 : 가로 1.0 (슬림 롱)",
      jawline: "길고 갸름하게 뻗은 하안부",
      forehead: "높고 시원한 상안부",
      cheekbone: "슬림하고 평평한 중안부",
    },
    svgModifiers: {
      jawWidth: 0.88,
      chinDrop: 1.25,
      foreheadWidth: 0.92,
      cheekCurve: 0.9,
    },
    bestHair: ["시스루 댄디컷(앞머리 커버)", "쉐도우펌", "레이어드 C컬(사이드 볼륨)", "히피펌", "빌드펌"],
    bestGlasses: ["아넬형 뿔테(상하폭 넓은)", "크라운판토", "오버사이즈 보스턴", "스퀘어 뿔테"],
    worstGlasses: ["상하 세로폭이 매우 좁은 슬림 메탈 (얼굴이 더 길어 보임)"],
    stylingAdvice: {
      hair: "이마를 앞머리로 살짝 가려주고 옆머리 볼륨을 풍성하게 살려 가로폭을 넓혀주면 이상적인 계란형처럼 보여요.",
      glasses: "세로 상하폭이 깊은 아넬형 뿔테나 오버사이즈 안경을 착용하면 긴 중안부를 단절시켜 얼굴이 작아 보입니다.",
    },
  },
  diamond: {
    id: "diamond",
    name: "다이아몬드형",
    englishName: "Diamond Face",
    emoji: "💎",
    badge: "샤프 & 세련미",
    desc: "광대 라인이 매력적이고 이마와 턱 끝으로 갈수록 갸름해지는 서구적이고 샤프한 마름모꼴 얼굴형입니다.",
    proportions: {
      ratio: "세로 1.35 : 가로 1.0 (입체적)",
      jawline: "날렵하고 뾰족한 턱선",
      forehead: "슬림하고 좁은 이마",
      cheekbone: "존재감 넘치는 입체적 광대",
    },
    svgModifiers: {
      jawWidth: 0.86,
      chinDrop: 1.04,
      foreheadWidth: 0.88,
      cheekCurve: 1.25,
    },
    bestHair: ["사이드뱅 롱웨이브", "리프컷", "시스루 댄디컷", "허쉬컷"],
    bestGlasses: ["원형 티타늄 메탈", "크라운판토", "타원형 뿔테", "보스턴형 콤비"],
    worstGlasses: ["가로폭이 너무 좁아 광대를 부각하는 직사각 메탈"],
    stylingAdvice: {
      hair: "광대 옆선을 부드럽게 감싸주는 사이드뱅이나 자연스러운 리프컷을 매치하면 매력적인 입체감이 돋보입니다.",
      glasses: "각진 광대를 중화해주는 부드러운 원형이나 크라운판토 프레임을 선택하면 고급스러운 인상이 완성됩니다.",
    },
  },
};

export interface HairOption {
  id: string;
  name: string;
  gender: "male" | "female" | "unisex";
  badge: string;
  desc: string;
  hairLength: "short" | "medium" | "long";
  bangType: "forehead_covered" | "forehead_exposed" | "half_parted" | "side_bang";
  bestFaces: FaceShapeKey[];
  stylingTips: string;
}

export const HAIR_OPTIONS: HairOption[] = [
  // 남성/유니섹스 헤어
  {
    id: "hair_seethrough_dandy",
    name: "시스루 댄디컷",
    gender: "male",
    badge: "호불호 제로 1위",
    desc: "가볍고 자연스럽게 이마가 비치는 앞머리로 누구에게나 단정하고 훈훈한 남친룩을 선사합니다.",
    hairLength: "medium",
    bangType: "forehead_covered",
    bestFaces: ["oblong", "oval", "heart", "round"],
    stylingTips: "가벼운 텍스처 컬크림을 모발 끝에 발라 시스루한 결감을 살려주세요.",
  },
  {
    id: "hair_guile",
    name: "가일컷",
    gender: "male",
    badge: "남성미 & 트렌드",
    desc: "한쪽은 넘기고 한쪽은 자연스럽게 떨어뜨려 샤프함과 세련미를 동시에 잡는 스타일입니다.",
    hairLength: "short",
    bangType: "half_parted",
    bestFaces: ["square", "oval", "heart"],
    stylingTips: "드라이어로 넘길 쪽 뿌리를 세워 고정하고 포마드나 매트 왁스로 마무리합니다.",
  },
  {
    id: "hair_as_perm",
    name: "애즈펌",
    gender: "male",
    badge: "자연스러운 가르마",
    desc: "이마를 살짝 드러내며 부드러운 S컬 볼륨을 더해 훈훈하고 젠틀한 분위기를 연출합니다.",
    hairLength: "medium",
    bangType: "half_parted",
    bestFaces: ["round", "oval", "oblong"],
    stylingTips: "앞머리 뿌리 볼륨을 따뜻한 바람으로 3초간 쥐었다 식혀주면 볼륨이 오래 지속됩니다.",
  },
  {
    id: "hair_leaf",
    name: "리프컷",
    gender: "unisex",
    badge: "감성 끝판왕",
    desc: "나뭇잎처럼 귀 뒤로 부드럽게 넘어가는 감성적인 중단발 기장으로 힙하고 예술적인 무드를 줍니다.",
    hairLength: "medium",
    bangType: "side_bang",
    bestFaces: ["heart", "round", "oval"],
    stylingTips: "웨트 오일을 소량 펴 발라 윤기와 차분한 가닥 텍스처를 완성하세요.",
  },
  {
    id: "hair_ivy_league",
    name: "아이비리그컷",
    gender: "male",
    badge: "깔끔 샤프 숏컷",
    desc: "이마를 시원하게 드러내고 옆머리를 바짝 밀착시켜 이목구비를 또렷하게 강조합니다.",
    hairLength: "short",
    bangType: "forehead_exposed",
    bestFaces: ["oval", "round", "heart"],
    stylingTips: "앞머리를 위로 세우고 옆머리는 다운펌 또는 드라이로 강하게 눌러주세요.",
  },
  {
    id: "hair_shadow_perm",
    name: "쉐도우 펌",
    gender: "male",
    badge: "풍성한 볼륨감",
    desc: "자잘한 S자 컬이 풍성하게 어우러져 두상을 보완하고 귀엽고 캐주얼한 매력을 줍니다.",
    hairLength: "medium",
    bangType: "forehead_covered",
    bestFaces: ["oblong", "oval", "square"],
    stylingTips: "컬 에센스를 듬뿍 바르고 손가락으로 가볍게 구기듯 말려주면 컬이 탱글해져요.",
  },
  {
    id: "hair_slick_back",
    name: "슬릭백 언더컷",
    gender: "male",
    badge: "클래식 수트핏",
    desc: "올백으로 시원하게 빗어 넘겨 강렬한 카리스마와 신뢰감을 전달하는 클래식 헤어입니다.",
    hairLength: "short",
    bangType: "forehead_exposed",
    bestFaces: ["oval", "square"],
    stylingTips: "광택 있는 수성 포마드로 빗질해 단정하게 정돈해주세요.",
  },

  // 여성/유니섹스 헤어
  {
    id: "hair_layered_c_curl",
    name: "레이어드 C컬펌",
    gender: "female",
    badge: "여신 헤어 1위",
    desc: "자연스러운 층과 끝부분의 풍성한 C컬로 얼굴형을 부드럽게 감싸 작고 갸름해 보이게 합니다.",
    hairLength: "long",
    bangType: "side_bang",
    bestFaces: ["square", "round", "heart", "oval"],
    stylingTips: "얼굴 쪽으로 돌려가며 말려주면 턱선을 갸름하게 감싸는 C컬이 완성됩니다.",
  },
  {
    id: "hair_tassel_bob",
    name: "태슬컷 단발",
    gender: "female",
    badge: "시크 도회적 단발",
    desc: "칼단발의 똑 떨어지는 직선 라인과 모발 끝 질감 처리로 트렌디하고 세련된 도시미를 연출합니다.",
    hairLength: "short",
    bangType: "forehead_covered",
    bestFaces: ["heart", "oval", "round"],
    stylingTips: "스트레이트 매직기로 펴준 뒤 헤어 오일로 젖은 듯 찰랑이는 슬릭 텍스처를 줍니다.",
  },
  {
    id: "hair_sidebang_wave",
    name: "사이드뱅 롱웨이브",
    gender: "female",
    badge: "청순 우아함",
    desc: "광대 라인을 스쳐 지나가는 우아한 사이드뱅과 흐르는 듯한 굵은 웨이브로 고급스러운 분위기를 줍니다.",
    hairLength: "long",
    bangType: "side_bang",
    bestFaces: ["square", "heart", "round", "oval"],
    stylingTips: "큰 굵기의 구르프를 사이드뱅에 말아두었다가 빼내면 하루종일 볼륨이 살아있어요.",
  },
  {
    id: "hair_hippie_perm",
    name: "히피펌",
    gender: "female",
    badge: "자유로운 빈티지",
    desc: "뿌리부터 촘촘하게 흐르는 컬감으로 사랑스럽고 자유분방한 개성을 뽐낼 수 있습니다.",
    hairLength: "long",
    bangType: "forehead_covered",
    bestFaces: ["oval", "oblong", "heart"],
    stylingTips: "타월 드라이 후 컬 크림을 바르고 자연 건조하는 것이 부스스하지 않고 가장 예쁩니다.",
  },
  {
    id: "hair_hush_cut",
    name: "허쉬컷",
    gender: "female",
    badge: "가볍고 힙한 무드",
    desc: "가벼운 질감과 날렵한 레이어드로 턱선 라인을 살리고 무겁지 않은 스타일리시함을 연출합니다.",
    hairLength: "medium",
    bangType: "forehead_covered",
    bestFaces: ["square", "round", "oval"],
    stylingTips: "헤어 왁스를 엄지와 검지로 살짝 비벼 모발 끝을 뾰족하게 가닥가닥 모아주세요.",
  },
  {
    id: "hair_pixie_cut",
    name: "픽시 숏컷",
    gender: "female",
    badge: "감각적인 유니크",
    desc: "목선과 턱선을 시원하게 드러내 이목구비를 집중시키며 감각적인 패션 감성을 뽐냅니다.",
    hairLength: "short",
    bangType: "side_bang",
    bestFaces: ["oval", "heart"],
    stylingTips: "소프트 왁스를 손바닥 전체에 묻혀 정수리 볼륨을 살리고 앞머리를 결대로 넘겨줍니다.",
  },
  {
    id: "hair_build_perm",
    name: "세미롱 빌드펌",
    gender: "female",
    badge: "오피스 데일리 룩",
    desc: "어깨 라인에서 자연스럽게 뻗치는 C+S컬로 단정함과 페미닌함을 완벽하게 아우릅니다.",
    hairLength: "medium",
    bangType: "side_bang",
    bestFaces: ["oblong", "oval", "round"],
    stylingTips: "뒤에서 앞으로 바람을 쐬어주며 말리면 자연스러운 S컬 볼륨이 형성됩니다.",
  },
];

export interface HairColorOption {
  id: string;
  name: string;
  badge: string;
  mainHex: string;
  highlightHex: string;
  shadowHex: string;
}

export const HAIR_COLORS: HairColorOption[] = [
  {
    id: "color_natural_black",
    name: "내추럴 블랙",
    badge: "단정 & 또렷함",
    mainHex: "#1c1917",
    highlightHex: "#44403c",
    shadowHex: "#0c0a09",
  },
  {
    id: "color_dark_espresso",
    name: "다크 에스프레소",
    badge: "차분한 웜톤",
    mainHex: "#3e2723",
    highlightHex: "#5d4037",
    shadowHex: "#271b16",
  },
  {
    id: "color_milk_brown",
    name: "밀크 브라운",
    badge: "부드러운 데일리",
    mainHex: "#795548",
    highlightHex: "#a1887f",
    shadowHex: "#4e342e",
  },
  {
    id: "color_ash_grey",
    name: "애쉬 그레이",
    badge: "시크 & 쿨톤",
    mainHex: "#607d8b",
    highlightHex: "#90a4ae",
    shadowHex: "#37474f",
  },
  {
    id: "color_wine_burgundy",
    name: "와인 버건디",
    badge: "매혹적인 포인트",
    mainHex: "#880e4f",
    highlightHex: "#ad1457",
    shadowHex: "#4a0026",
  },
  {
    id: "color_warm_beige",
    name: "웜 베이지 블론드",
    badge: "화사한 아이돌 컬러",
    mainHex: "#d7ccc8",
    highlightHex: "#efebe9",
    shadowHex: "#a1887f",
  },
  {
    id: "color_rose_pink",
    name: "로즈 브라운",
    badge: "생기 가득 로맨틱",
    mainHex: "#b07d83",
    highlightHex: "#d4a5ab",
    shadowHex: "#7f5056",
  },
  {
    id: "color_golden_honey",
    name: "골든 허니",
    badge: "입체감 넘치는 볼륨",
    mainHex: "#c5a059",
    highlightHex: "#e0c58a",
    shadowHex: "#8f7033",
  },
];

export interface GlassesOption {
  id: string;
  name: string;
  englishName: string;
  emoji: string;
  badge: string;
  desc: string;
  shapeStyle: "arnel" | "crown_panto" | "browline" | "round_metal" | "clear_horn" | "square_metal" | "boston_combi" | "rimless";
  frameThickness: "thin" | "medium" | "thick";
  lensHeightRatio: number; // 0.7 ~ 1.1
  lensWidthRatio: number;
  bestFaces: FaceShapeKey[];
  worstFaces: FaceShapeKey[];
  vibe: string;
}

export const GLASSES_OPTIONS: GlassesOption[] = [
  {
    id: "glasses_arnel",
    name: "아넬형 뿔테",
    englishName: "Arnel Horn-Rimmed",
    emoji: "👓",
    badge: "클래식 빈티지 1위",
    desc: "키홀 브릿지와 웰링턴 상단 곡선으로 조니뎁, 봉태규 등 패셔니스타들이 사랑하는 불멸의 아이웨어입니다.",
    shapeStyle: "arnel",
    frameThickness: "thick",
    lensHeightRatio: 0.95,
    lensWidthRatio: 1.05,
    bestFaces: ["oblong", "round", "oval"],
    worstFaces: [],
    vibe: "지적이고 앤틱하며 또렷한 인상",
  },
  {
    id: "glasses_crown_panto",
    name: "크라운판토",
    englishName: "Crown Panto",
    emoji: "👓",
    badge: "프랑스 빈티지 감성",
    desc: "상단은 왕관처럼 각이 져 있고 하단은 둥글어 어떤 얼굴형도 조화롭게 중화시켜주는 마법의 밸런서입니다.",
    shapeStyle: "crown_panto",
    frameThickness: "medium",
    lensHeightRatio: 0.98,
    lensWidthRatio: 1.0,
    bestFaces: ["round", "square", "oval", "oblong"],
    worstFaces: [],
    vibe: "예술적이고 지적인 파리지앵 무드",
  },
  {
    id: "glasses_browline",
    name: "하금테",
    englishName: "Browline Frame",
    emoji: "👓",
    badge: "스마트 엘리트 룩",
    desc: "상단은 뿔테, 하단은 얇은 메탈로 눈썹 라인을 선명하게 강조해 카리스마와 스마트함을 선사합니다.",
    shapeStyle: "browline",
    frameThickness: "medium",
    lensHeightRatio: 0.9,
    lensWidthRatio: 1.05,
    bestFaces: ["round", "oval", "square"],
    worstFaces: ["heart"],
    vibe: "신뢰감 넘치는 비즈니스 & 전문직 무드",
  },
  {
    id: "glasses_round_metal",
    name: "원형 티타늄 메탈",
    englishName: "Round Titanium Metal",
    emoji: "👓",
    badge: "가볍고 편안한 데일리",
    desc: "얇고 슬림한 티타늄 와이어 프레임으로 무게감이 적고 부드러우며 다정한 모범생 이미지를 줍니다.",
    shapeStyle: "round_metal",
    frameThickness: "thin",
    lensHeightRatio: 1.0,
    lensWidthRatio: 0.98,
    bestFaces: ["square", "heart", "oval"],
    worstFaces: ["round"],
    vibe: "다정하고 편안하며 자연스러운 인상",
  },
  {
    id: "glasses_clear_horn",
    name: "투명 클리어 뿔테",
    englishName: "Clear Acetate Frame",
    emoji: "👓",
    badge: "트렌디 힙스터",
    desc: "답답함 없이 얼굴빛을 밝혀주며 계절을 타지 않는 맑고 영(Young)한 감성의 투명 프레임입니다.",
    shapeStyle: "clear_horn",
    frameThickness: "thick",
    lensHeightRatio: 0.94,
    lensWidthRatio: 1.02,
    bestFaces: ["heart", "oblong", "oval", "round"],
    worstFaces: [],
    vibe: "시원하고 트렌디하며 부담 없는 스타일",
  },
  {
    id: "glasses_square_metal",
    name: "스퀘어 사각 메탈",
    englishName: "Square Slim Metal",
    emoji: "👓",
    badge: "샤프 & 모던",
    desc: "직선적인 라인과 절제된 각도로 둥근 얼굴에 엣지를 주고 세련된 도시적 프로페셔널을 완성합니다.",
    shapeStyle: "square_metal",
    frameThickness: "thin",
    lensHeightRatio: 0.82,
    lensWidthRatio: 1.12,
    bestFaces: ["round", "oval"],
    worstFaces: ["square", "oblong"],
    vibe: "냉철하고 샤프한 도시적 전문가",
  },
  {
    id: "glasses_boston_combi",
    name: "보스턴형 콤비",
    englishName: "Boston Combi",
    emoji: "👓",
    badge: "캐주얼 만능 프레임",
    desc: "역삼각형 모양으로 좁아지는 둥근 라인에 메탈 코받침이 결합되어 착용감이 우수하고 편안합니다.",
    shapeStyle: "boston_combi",
    frameThickness: "medium",
    lensHeightRatio: 0.95,
    lensWidthRatio: 1.0,
    bestFaces: ["square", "heart", "oval"],
    worstFaces: [],
    vibe: "친근하고 편안한 캐주얼 클래식",
  },
  {
    id: "glasses_rimless",
    name: "Y2K 무테",
    englishName: "Rimless Minimalist",
    emoji: "👓",
    badge: "미니멀 Y2K 감성",
    desc: "프레임이 없어 안 쓴 듯 가볍고 본래의 이목구비와 눈매를 100% 살려주는 세련된 미니멀 프레임입니다.",
    shapeStyle: "rimless",
    frameThickness: "thin",
    lensHeightRatio: 0.88,
    lensWidthRatio: 1.05,
    bestFaces: ["heart", "oval", "square"],
    worstFaces: ["oblong"],
    vibe: "투명하고 깨끗한 퓨어 미니멀리즘",
  },
];

export interface GlassesColorOption {
  id: string;
  name: string;
  badge: string;
  frameColor: string;
  templeColor: string;
  opacity: number;
}

export const GLASSES_COLORS: GlassesColorOption[] = [
  {
    id: "frame_matte_black",
    name: "매트 블랙",
    badge: "시그니처 베스트",
    frameColor: "#18181b",
    templeColor: "#27272a",
    opacity: 0.95,
  },
  {
    id: "frame_amber_tortoise",
    name: "앰버 호피",
    badge: "클래식 앤틱",
    frameColor: "#78350f",
    templeColor: "#92400e",
    opacity: 0.9,
  },
  {
    id: "frame_silver_metal",
    name: "클래식 실버",
    badge: "차가운 지성미",
    frameColor: "#94a3b8",
    templeColor: "#cbd5e1",
    opacity: 0.95,
  },
  {
    id: "frame_champagne_gold",
    name: "샴페인 골드",
    badge: "은은한 럭셔리",
    frameColor: "#ca8a04",
    templeColor: "#eab308",
    opacity: 0.95,
  },
  {
    id: "frame_crystal_clear",
    name: "크리스탈 투명",
    badge: "투명 트렌디",
    frameColor: "#e2e8f0",
    templeColor: "#f1f5f9",
    opacity: 0.55,
  },
  {
    id: "frame_rose_gold",
    name: "로즈 골드",
    badge: "화사한 페미닌",
    frameColor: "#fb7185",
    templeColor: "#fda4af",
    opacity: 0.95,
  },
];

export interface LensTintOption {
  id: string;
  name: string;
  badge: string;
  color: string;
  opacity: number;
}

export const LENS_TINTS: LensTintOption[] = [
  { id: "lens_clear", name: "클리어 (도수렌즈)", badge: "투명 데일리", color: "#ffffff", opacity: 0.08 },
  { id: "lens_dark", name: "다크 블랙 선글라스", badge: "UV 차단 선글라스", color: "#09090b", opacity: 0.8 },
  { id: "lens_green", name: "클래식 그린 틴트", badge: "레이벤 시그니처", color: "#14532d", opacity: 0.62 },
  { id: "lens_yellow", name: "레트로 옐로우 틴트", badge: "야간 & 스트릿 무드", color: "#eab308", opacity: 0.52 },
  { id: "lens_ocean", name: "오션 블루 틴트", badge: "청량 힙스터", color: "#0284c7", opacity: 0.58 },
  { id: "lens_rose", name: "빈티지 로즈 틴트", badge: "감성 페미닌", color: "#f43f5e", opacity: 0.48 },
  { id: "lens_sunset", name: "선셋 오렌지 틴트", badge: "Y2K 레트로 룩", color: "#ea580c", opacity: 0.58 },
];

export interface BeardOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
}

export const BEARD_OPTIONS: BeardOption[] = [
  { id: "beard_none", name: "클린 쉐이빙", badge: "수염 없음", desc: "깔끔하고 단정한 인상" },
  { id: "beard_mustache", name: "클래식 콧수염", badge: "신사적 무드", desc: "인중에 얇고 단정하게 다듬은 콧수염" },
  { id: "beard_goatee", name: "턱수염 고티", badge: "샤프한 턱선", desc: "턱 끝에 포인트를 주어 턱선을 갸름하게 보완" },
  { id: "beard_short_boxed", name: "댄디 턱선 수염", badge: "카리스마", desc: "턱선 라인을 따라 정리된 정갈한 수염" },
  { id: "beard_stubble", name: "러프 섀도우", badge: "남성미", desc: "자연스러운 하루치 수염 그림자" },
];

export interface AccessoryOption {
  id: string;
  name: string;
  badge: string;
  desc: string;
}

export const ACCESSORY_OPTIONS: AccessoryOption[] = [
  { id: "acc_none", name: "착용 안 함", badge: "헤어 본연 스타일", desc: "기본 헤어스타일 강조" },
  { id: "acc_ballcap", name: "스트릿 볼캡", badge: "캐주얼 힙스터", desc: "깊이 눌러쓴 스트릿 볼캡" },
  { id: "acc_beanie", name: "감성 숏 비니", badge: "미니멀 무드", desc: "이마선 위에 걸친 와치캡 비니" },
  { id: "acc_beret", name: "클래식 베레모", badge: "예술가 감성", desc: "사선으로 얹은 프렌치 베레모" },
  { id: "acc_headband", name: "스포티 헤어밴드", badge: "액티브 무드", desc: "앞머리를 넘긴 스포티 밴드" },
];

// 어울림 점수 계산 함수
export interface StylingCompatibility {
  score: number; // 70 ~ 99
  grade: "S+" | "S" | "A" | "B";
  badge: string;
  title: string;
  comment: string;
  expertTip: string;
}

export function calculateCompatibility(
  faceKey: FaceShapeKey,
  hairId: string,
  glassesId: string
): StylingCompatibility {
  const face = FACE_SHAPES[faceKey];
  const hair = HAIR_OPTIONS.find((h) => h.id === hairId) || HAIR_OPTIONS[0];
  const glasses = GLASSES_OPTIONS.find((g) => g.id === glassesId) || GLASSES_OPTIONS[0];

  let score = 84; // base score

  // 헤어 보너스
  if (hair.bestFaces.includes(faceKey)) {
    score += 8;
  }

  // 안경 보너스 / 패널티
  if (glasses.bestFaces.includes(faceKey)) {
    score += 7;
  } else if (glasses.worstFaces.includes(faceKey)) {
    score -= 8;
  }

  // 얼굴형별 특별 시너지 조합
  if (faceKey === "oval") {
    score += 2; // 계란형은 황금비율 가산점
  } else if (faceKey === "round" && glasses.shapeStyle === "square_metal") {
    score += 3; // 둥근형 + 사각메탈 엣지 보완
  } else if (faceKey === "square" && glasses.shapeStyle === "round_metal") {
    score += 3; // 각진형 + 원형메탈 유화 보완
  } else if (faceKey === "oblong" && glasses.shapeStyle === "arnel") {
    score += 3; // 긴형 + 상하폭 넓은 아넬 중안부 단절
  } else if (faceKey === "diamond" && (glasses.shapeStyle === "round_metal" || glasses.shapeStyle === "crown_panto")) {
    score += 3; // 다이아몬드형 + 라운드 프레임 광대 완화
  }

  // 범위 클램핑 (72 ~ 99)
  score = Math.min(99, Math.max(72, score));

  let grade: StylingCompatibility["grade"] = "B";
  let badge = "무난한 조화";
  let title = "자연스러운 매일의 데일리 조합";

  if (score >= 95) {
    grade = "S+";
    badge = "인생 스타일 찰떡 궁합";
    title = `${face.name}의 매력을 극대화한 퍼펙트 조합!`;
  } else if (score >= 90) {
    grade = "S";
    badge = "황금 밸런스 매치";
    title = `이목구비 단점을 완벽히 커버하는 스마트 매치`;
  } else if (score >= 82) {
    grade = "A";
    badge = "안정적인 굿 매치";
    title = `얼굴선에 부드럽게 스며드는 조화로운 피팅`;
  } else {
    badge = "개성 넘치는 믹스앤매치";
    title = `자신만의 뚜렷한 아이덴티티를 뽐내는 조합`;
  }

  const comment = `${face.name} 특유의 ${face.proportions.jawline} 라인에 ${hair.name}의 볼륨감과 ${glasses.name} 프레임이 어우러져 ${glasses.vibe}을 연출합니다.`;
  const expertTip = `${face.name} 스타일링 팁: ${face.stylingAdvice.hair} ${glasses.name} 착용 시 ${glasses.desc}`;

  return {
    score,
    grade,
    badge,
    title,
    comment,
    expertTip,
  };
}
