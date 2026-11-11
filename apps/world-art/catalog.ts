/**
 * 월드아트맵 (world-art) - 세계 10대 미술관 & 16대 불멸의 명화 카탈로그
 * - 모든 수록 작품은 사후 70년 이상 경과한 퍼블릭 도메인(Public Domain) 인류 문화유산입니다.
 */

export type RegionKey = "all" | "europe" | "americas" | "asia";

export interface MuseumInfo {
  id: string;
  name: string;
  englishName: string;
  city: string;
  country: string;
  flag: string;
  region: "europe" | "americas" | "asia";
  /** 세계지도(1000 x 520) 상의 좌표 */
  mapX: number;
  mapY: number;
  foundedYear: string;
  annualVisitors: string;
  badgeColor: string;
  stampTitle: string;
  stampCode: string;
  desc: string;
  highlightTip: string;
}

export interface SecretHotspot {
  id: string;
  x: number; // 0 ~ 100 (%)
  y: number; // 0 ~ 100 (%)
  label: string;
  detail: string;
}

export interface MasterpieceItem {
  id: string;
  museumId: string;
  title: string;
  originalTitle: string;
  artist: string;
  artistLifespan: string;
  year: string;
  movement: string;
  medium: string;
  dimensions: string;
  estimatedValueText: string;
  estimatedValueBillionKrw: number; // 정렬용 (억 원 단위)
  valuationBasis: string;
  imageUrl: string;
  palette: [string, string, string];
  motif:
    | "monalisa"
    | "starry_night"
    | "sunflowers"
    | "pearl_earring"
    | "the_kiss"
    | "birth_of_venus"
    | "scream"
    | "great_wave"
    | "miindo"
    | "inwang"
    | "water_lilies"
    | "rhone_stars"
    | "arnolfini"
    | "las_meninas"
    | "liberty"
    | "gleaners";
  docentScript: string;
  vipBehindStory: string;
  secretPoints: SecretHotspot[];
  fortuneTag: {
    category: "재물·성공운" | "사랑·매력운" | "영감·창의운" | "치유·평온운" | "명예·돌파운";
    blessing: string;
  };
}

export const MUSEUMS: MuseumInfo[] = [
  {
    id: "louvre",
    name: "루브르 박물관",
    englishName: "Musée du Louvre",
    city: "파리",
    country: "프랑스",
    flag: "🇫🇷",
    region: "europe",
    mapX: 472,
    mapY: 162,
    foundedYear: "1793년",
    annualVisitors: "연간 890만 명 (세계 1위)",
    badgeColor: "#2563EB",
    stampTitle: "PARIS · LOUVRE",
    stampCode: "CDG-LVR-01",
    desc: "유리 피라미드 아래 38만 점의 인류 예술사를 품은 세계 최대의 박물관입니다.",
    highlightTip: "드농관(Denon Wing) 1층 711호에 모나리자가 방탄유리 안에 전시되어 있어요.",
  },
  {
    id: "orsay",
    name: "오르세 미술관",
    englishName: "Musée d'Orsay",
    city: "파리",
    country: "프랑스",
    flag: "🇫🇷",
    region: "europe",
    mapX: 462,
    mapY: 175,
    foundedYear: "1986년",
    annualVisitors: "연간 390만 명",
    badgeColor: "#0EA5E9",
    stampTitle: "PARIS · ORSAY",
    stampCode: "CDG-ORS-02",
    desc: "1900년 파리 만국박람회 기차역을 개조해 탄생한 인상주의 걸작들의 성지입니다.",
    highlightTip: "5층 대형 시계탑 창문 너머로 파리 센강과 몽마르트 언덕이 한눈에 내려다보여요.",
  },
  {
    id: "vangogh_nl",
    name: "반 고흐 미술관 & 마우리츠하위스",
    englishName: "Van Gogh Museum & Mauritshuis",
    city: "암스테르담·헤이그",
    country: "네덜란드",
    flag: "🇳🇱",
    region: "europe",
    mapX: 482,
    mapY: 144,
    foundedYear: "1973년",
    annualVisitors: "연간 220만 명",
    badgeColor: "#F59E0B",
    stampTitle: "AMSTERDAM · ART",
    stampCode: "AMS-VGM-03",
    desc: "고흐의 유화 200여 점과 베르메르의 '진주 귀걸이를 한 소녀'를 만나는 네덜란드 예술 심장부입니다.",
    highlightTip: "고흐의 붓터치 두께(임파스토 기법)를 측면 조명에서 관찰하면 입체감이 살아납니다.",
  },
  {
    id: "uffizi",
    name: "우피치 미술관",
    englishName: "Galleria degli Uffizi",
    city: "피렌체",
    country: "이탈리아",
    flag: "🇮🇹",
    region: "europe",
    mapX: 505,
    mapY: 188,
    foundedYear: "1581년",
    annualVisitors: "연간 220만 명",
    badgeColor: "#EC4899",
    stampTitle: "FIRENZE · UFFIZI",
    stampCode: "FLR-UFZ-04",
    desc: "메디치 가문이 수집한 르네상스 미술의 보고로, 보티첼리와 다빈치의 걸작이 숨 쉬는 공간입니다.",
    highlightTip: "보티첼리의 방(10~14호실)에 들어서면 '비너스의 탄생'과 '봄'이 나란히 관람객을 맞이합니다.",
  },
  {
    id: "belvedere",
    name: "벨베데레 궁전 미술관",
    englishName: "Schloss Belvedere",
    city: "빈",
    country: "오스트리아",
    flag: "🇦🇹",
    region: "europe",
    mapX: 522,
    mapY: 170,
    foundedYear: "1723년",
    annualVisitors: "연간 180만 명",
    badgeColor: "#D97706",
    stampTitle: "VIENNA · BELVEDERE",
    stampCode: "VIE-BLV-05",
    desc: "바로크 양식의 아름다운 궁전 안에 클림트의 황금빛 걸작 '키스'를 영구 소장하고 있습니다.",
    highlightTip: "실제 금박과 은박, 백금이 캔버스에 입혀져 있어 각도에 따라 진짜 황금빛이 반짝입니다.",
  },
  {
    id: "national_uk",
    name: "런던 내셔널 갤러리",
    englishName: "The National Gallery",
    city: "런던",
    country: "영국",
    flag: "🇬🇧",
    region: "europe",
    mapX: 455,
    mapY: 148,
    foundedYear: "1824년",
    annualVisitors: "연간 320만 명",
    badgeColor: "#4F46E5",
    stampTitle: "LONDON · TNG",
    stampCode: "LHR-TNG-06",
    desc: "트라팔가 광장 한가운데 자리한 영국 대표 미술관으로 얀 반 에이크부터 터너까지 소장하고 있습니다.",
    highlightTip: "시민들의 기부로 시작되어 상설 전시는 200년째 전 세계 누구나 무료로 입장할 수 있어요.",
  },
  {
    id: "prado",
    name: "프라도 미술관",
    englishName: "Museo Nacional del Prado",
    city: "마드리드",
    country: "스페인",
    flag: "🇪🇸",
    region: "europe",
    mapX: 448,
    mapY: 196,
    foundedYear: "1819년",
    annualVisitors: "연간 330만 명",
    badgeColor: "#DC2626",
    stampTitle: "MADRID · PRADO",
    stampCode: "MAD-PRD-07",
    desc: "스페인 왕실 컬렉션을 바탕으로 벨라스케스, 고야, 엘 그레코의 걸작을 보유한 유럽 3대 미술관입니다.",
    highlightTip: "벨라스케스의 '시녀들' 앞에 서면 내가 그림 속 국왕 부부가 된 듯한 착시 구도를 경험합니다.",
  },
  {
    id: "oslo_munch",
    name: "오슬로 국립미술관 & 뭉크 미술관",
    englishName: "Nasjonalmuseet & MUNCH",
    city: "오슬로",
    country: "노르웨이",
    flag: "🇳🇴",
    region: "europe",
    mapX: 500,
    mapY: 118,
    foundedYear: "1842년",
    annualVisitors: "연간 150만 명",
    badgeColor: "#EA580C",
    stampTitle: "OSLO · MUNCH",
    stampCode: "OSL-MNC-08",
    desc: "북유럽 피오르드의 붉은 노을과 현대인의 불안을 예술로 승화시킨 에드바르 뭉크의 본고장입니다.",
    highlightTip: "'절규'의 하늘이 붉은 이유는 1883년 크라카토아 화산 폭발로 인한 핏빛 노을 때문이라는 설이 유력해요.",
  },
  {
    id: "nyc_moma_met",
    name: "뉴욕 MoMA & 메트로폴리탄",
    englishName: "MoMA & The Met",
    city: "뉴욕",
    country: "미국",
    flag: "🇺🇸",
    region: "americas",
    mapX: 262,
    mapY: 195,
    foundedYear: "1870년 / 1929년",
    annualVisitors: "연간 750만 명",
    badgeColor: "#7C3AED",
    stampTitle: "NEW YORK · MOMA",
    stampCode: "JFK-NYM-09",
    desc: "고흐의 '별이 빛나는 밤'과 모네의 초대형 '수련' 파노라마가 전시된 아메리카 대륙 예술의 수도입니다.",
    highlightTip: "MoMA 5층 501호에 들어서면 전 세계 관람객이 가장 사랑하는 '별이 빛나는 밤'을 만날 수 있습니다.",
  },
  {
    id: "seoul_kansong",
    name: "간송미술관 & 국립중앙박물관",
    englishName: "Kansong & National Museum of Korea",
    city: "서울",
    country: "대한민국",
    flag: "🇰🇷",
    region: "asia",
    mapX: 815,
    mapY: 205,
    foundedYear: "1938년 / 1945년",
    annualVisitors: "연간 418만 명 (세계 6위)",
    badgeColor: "#059669",
    stampTitle: "SEOUL · KOREA",
    stampCode: "ICN-KOR-10",
    desc: "전형필 선생이 전 재산으로 지켜낸 '미인도·인왕제색도' 등 대한민국 국보·보물 걸작의 전당입니다.",
    highlightTip: "신윤복의 '미인도'와 정선의 '인왕제색도'는 보존을 위해 매년 특별전 기간에만 친견할 수 있는 귀한 작품이에요.",
  },
];

export const MASTERPIECES: MasterpieceItem[] = [
  {
    id: "mona_lisa",
    museumId: "louvre",
    title: "모나리자",
    originalTitle: "Mona Lisa (La Gioconda)",
    artist: "레오나르도 다 빈치",
    artistLifespan: "1452 ~ 1519",
    year: "1503 ~ 1519년경",
    movement: "전성기 르네상스",
    medium: "포플러 나무판에 유채",
    dimensions: "77 × 53 cm",
    estimatedValueText: "약 1조 3,500억 원 (프랑스 국유 비매품)",
    estimatedValueBillionKrw: 13500,
    valuationBasis: "1962년 보험 산정가 1억 달러 → 물가상승 반영 시 약 10억 달러(1.35조 원) 돌파",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg",
    palette: ["#2c3e2e", "#8c6d46", "#d4b483"],
    motif: "monalisa",
    docentScript:
      "윤곽선을 안개처럼 부드럽게 피워내는 다빈치의 '스푸마토(Sfumato)' 기법으로 완성된 인류 최고가의 초상화입니다. 바라보는 각도와 관람자의 기분에 따라 미소를 짓는 듯도, 쓸쓸해 보이는 듯도 한 신비로운 표정이 500년째 전 세계인을 매료시키고 있습니다.",
    vipBehindStory:
      "1911년 루브르 박물관 직원이었던 빈센초 페루자가 코트 안에 모나리자를 숨겨 훔쳐 달아난 사건이 발생했습니다! 당시 용의자로 파블로 피카소까지 체포되었으나, 2년 뒤 피렌체에서 진범이 검거되며 모나리자는 전 세계 신문 1면을 장식한 불멸의 아이콘이 되었습니다.",
    secretPoints: [
      {
        id: "ml_1",
        x: 51,
        y: 34,
        label: "신비로운 스푸마토 미소",
        detail: "입꼬리 경계선을 수십 겹의 얇은 유화 물감으로 번지게 칠해, 시선을 눈에서 입으로 옮길 때 미소가 살아 움직이는 착시를 일으킵니다.",
      },
      {
        id: "ml_2",
        x: 49,
        y: 25,
        label: "사라진 눈썹과 속눈썹",
        detail: "고해상도 적외선 스캔 결과 원래 다빈치는 눈썹을 그렸으나, 세월이 흐르며 복원 세척 과정에서 옅어진 것으로 밝혀졌습니다.",
      },
      {
        id: "ml_3",
        x: 74,
        y: 44,
        label: "비대칭 수평선의 환상 풍경",
        detail: "모나리자 왼쪽 배경과 오른쪽 배경의 지평선 높이가 서로 다릅니다! 시선이 자연스럽게 인물 중심으로 모이게 한 다빈치의 천재적 설계입니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "다빈치의 통찰력과 온화한 미소가 오늘 당신의 대인관계와 중요한 협상을 유리하게 이끌어줍니다.",
    },
  },
  {
    id: "liberty_leading",
    museumId: "louvre",
    title: "민중을 이끄는 자유의 여신",
    originalTitle: "La Liberté guidant le peuple",
    artist: "외젠 들라크루아",
    artistLifespan: "1798 ~ 1863",
    year: "1830년",
    movement: "낭만주의",
    medium: "캔버스에 유채",
    dimensions: "260 × 325 cm",
    estimatedValueText: "약 4,200억 원 (프랑스 국보급 컬렉션)",
    estimatedValueBillionKrw: 4200,
    valuationBasis: "프랑스 화폐 도안 및 국가 상징 문화재 추정 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/800px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg",
    palette: ["#1e293b", "#dc2626", "#f59e0b"],
    motif: "liberty",
    docentScript:
      "1830년 파리 7월 혁명의 뜨거운 함성을 화폭에 담은 낭만주의 최고 걸작입니다. 붉은 프리기아 모자를 쓰고 삼색기를 높이 치켜든 자유의 여신을 중심으로 시민과 소년이 바리케이드를 넘어 전진하는 역동적 피라미드 구도가 압권입니다.",
    vipBehindStory:
      "록 밴드 콜드플레이(Coldplay)의 명반 'Viva La Vida' 앨범 커버로 쓰여 젊은 세대에게도 친숙한 작품입니다. 2024년 루브르 박물관이 6개월간 표면에 쌓인 200년 묵은 누런 니스를 제거하는 대복원을 마쳐, 현재는 들라크루아가 칠했던 눈부신 푸른빛과 붉은빛을 되찾았습니다.",
    secretPoints: [
      {
        id: "lb_1",
        x: 56,
        y: 18,
        label: "프랑스 혁명의 삼색기",
        detail: "자유(파랑)·평등(하양)·박애(빨강)를 상징하는 삼색기가 화폭 가장 높은 곳에서 빛을 발하며 시선을 집중시킵니다.",
      },
      {
        id: "lb_2",
        x: 31,
        y: 48,
        label: "실크해트를 쓴 신사 (화가의 자화상?)",
        detail: "총을 든 검은 모자의 부르주아 청년은 화가 들라크루아 자신의 모습을 투영했다는 설로 유명합니다.",
      },
      {
        id: "lb_3",
        x: 78,
        y: 52,
        label: "쌍권총을 든 소년 가브로슈",
        detail: "빅토르 위고의 소설 『레 미제라블』에 등장하는 용감한 거리 소년 '가브로슈'의 실제 모티프가 된 인물입니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "막혀 있던 일이나 미뤄둔 결단을 과감히 밀고 나가는 강력한 추진력과 승리의 기운을 불어넣어 줍니다.",
    },
  },
  {
    id: "starry_night",
    museumId: "nyc_moma_met",
    title: "별이 빛나는 밤",
    originalTitle: "The Starry Night",
    artist: "빈센트 반 고흐",
    artistLifespan: "1853 ~ 1890",
    year: "1889년 6월",
    movement: "후기 인상주의",
    medium: "캔버스에 유채",
    dimensions: "73.7 × 92.1 cm",
    estimatedValueText: "약 1조 1,000억 원 (MoMA 영구 소장)",
    estimatedValueBillionKrw: 11000,
    valuationBasis: "전 세계 미술사가 추산 현대미술 최고가 걸작 TOP 3",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    palette: ["#0f172a", "#1d4ed8", "#facc15"],
    motif: "starry_night",
    docentScript:
      "생레미 정신병원에 머물던 고흐가 새벽녘 철창 너머로 바라본 밤하늘과 기억 속 고향 마을을 결합해 그린 불후의 명작입니다. 소용돌이치는 코발트블루 밤하늘과 11개의 황금빛 별들이 어둠 속에서도 꺼지지 않는 생명력을 노래합니다.",
    vipBehindStory:
      "물리학자들이 고흐의 '별이 빛나는 밤' 속 소용돌이 패턴을 수학적으로 분석한 결과, 실제 유체역학의 '콜모고로프 난류(Turbulence) 방정식'과 놀라울 정도로 일치한다는 사실이 네이처(Nature)지에 발표되었습니다! 고흐는 극한의 고통 속에서 자연의 본질적인 에너지 흐름을 직관적으로 포착했던 것입니다.",
    secretPoints: [
      {
        id: "sn_1",
        x: 52,
        y: 31,
        label: "살아 꿈틀대는 은하수 소용돌이",
        detail: "두꺼운 물감을 튜브에서 짜내듯 칠하는 '임파스토' 기법으로 밤하늘의 대기가 요동치는 리듬감을 표현했습니다.",
      },
      {
        id: "sn_2",
        x: 20,
        y: 48,
        label: "하늘로 솟구치는 사이프러스 나무",
        detail: "불꽃처럼 솟아오른 어두운 삼나무는 땅과 밤하늘(우주)을 이어주는 다리 역할을 합니다.",
      },
      {
        id: "sn_3",
        x: 84,
        y: 22,
        label: "새벽을 밝히는 황금빛 초승달과 금성",
        detail: "천문학 계산에 따르면 1889년 5~6월 새벽 프랑스 남부 하늘에는 실제로 달 옆에 금성(샛별)이 가장 밝게 빛나고 있었습니다.",
      },
    ],
    fortuneTag: {
      category: "영감·창의운",
      blessing: "어두운 밤하늘에서 가장 밝게 빛나는 고흐의 별빛이 당신에게 남다른 아이디어와 반전의 행운을 가져다줍니다.",
    },
  },
  {
    id: "starry_rhone",
    museumId: "orsay",
    title: "아를의 별이 빛나는 밤",
    originalTitle: "Starry Night Over the Rhône",
    artist: "빈센트 반 고흐",
    artistLifespan: "1853 ~ 1890",
    year: "1888년 9월",
    movement: "후기 인상주의",
    medium: "캔버스에 유채",
    dimensions: "72.5 × 92 cm",
    estimatedValueText: "약 6,500억 원 (오르세 미술관 대표작)",
    estimatedValueBillionKrw: 6500,
    valuationBasis: "오르세 미술관 최고 가치 컬렉션 추정가",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Starry_Night_Over_the_Rh%C3%B4ne.jpg/800px-Starry_Night_Over_the_Rh%C3%B4ne.jpg",
    palette: ["#0c1938", "#0284c7", "#fbbf24"],
    motif: "rhone_stars",
    docentScript:
      "남프랑스 아를의 론강 강변에서 가스등 불빛이 물결에 길게 부서지는 황홀한 야경을 그린 작품입니다. 밤을 단순히 검은색으로 칠하지 않고 프러시안 블루와 에메랄드, 레몬 옐로의 조화로 담아낸 고흐의 가장 로맨틱한 밤 풍경입니다.",
    vipBehindStory:
      "고흐는 이 그림을 그리기 위해 밤에 밀짚모자 테두리에 촛불을 꽂고 이젤 앞에 섰다고 동생 테오에게 편지를 썼습니다. 강변 오른쪽 아래 다정하게 산책하는 연인을 그려 넣어, 외로웠던 고흐가 꿈꾸던 따뜻한 사랑의 온기를 남겼습니다.",
    secretPoints: [
      {
        id: "sr_1",
        x: 50,
        y: 18,
        label: "북두칠성 일곱 개의 별",
        detail: "밤하늘 한가운데 북두칠성(큰곰자리)의 별 일곱 개가 보석처럼 선명하게 빛나고 있습니다.",
      },
      {
        id: "sr_2",
        x: 62,
        y: 58,
        label: "론강 위에 비친 황금빛 가스등 반영",
        detail: "강물 위로 길게 일렁이는 노란 불빛들이 잔잔한 수면의 깊이와 낭만을 배가시킵니다.",
      },
      {
        id: "sr_3",
        x: 78,
        y: 84,
        label: "강변을 거니는 두 연인",
        detail: "전경 우측 하단에 팔짱을 낀 남녀 연인이 등장해 차가운 밤하늘과 대비되는 인간적인 따뜻함을 전합니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "론강의 잔잔한 물결과 별빛이 복잡한 머릿속을 맑게 비워주고 소중한 인연과의 다정한 시간을 선물합니다.",
    },
  },
  {
    id: "gleaners",
    museumId: "orsay",
    title: "이삭 줍는 여인들",
    originalTitle: "Des glaneuses (The Gleaners)",
    artist: "장 프랑수아 밀레",
    artistLifespan: "1814 ~ 1875",
    year: "1857년",
    movement: "사실주의 (바르비종파)",
    medium: "캔버스에 유채",
    dimensions: "83.5 × 110 cm",
    estimatedValueText: "약 4,800억 원",
    estimatedValueBillionKrw: 4800,
    valuationBasis: "오르세 미술관 3대 걸작 추정 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project.jpg/800px-Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project.jpg",
    palette: ["#78350f", "#d97706", "#fef3c7"],
    motif: "gleaners",
    docentScript:
      "추수가 끝난 들판에서 바닥에 떨어진 밀 이삭을 줍는 세 여인의 고된 노동을 성스러운 기념비처럼 그려낸 사실주의 명작입니다. 숙인 허리와 대지에 닿은 손길에서 삶을 지탱하는 성실함과 숭고한 품격이 느껴집니다.",
    vipBehindStory:
      "발표 당시에는 가난한 농민을 주인공으로 세웠다는 이유로 상류층 비평가들의 거센 논란을 불렀으나, 훗날 반 고흐가 이 작품을 보고 깊은 감명을 받아 여러 차례 모사작을 남겼을 만큼 후대 화가들에게 큰 존경을 받았습니다.",
    secretPoints: [
      {
        id: "gl_1",
        x: 42,
        y: 66,
        label: "세 여인의 리듬감 있는 동작",
        detail: "이삭을 찾는 여인, 줍는 여인, 묶는 여인의 3단계 연속 동작을 한 화면에 배치해 영화 같은 흐름을 만들었습니다.",
      },
      {
        id: "gl_2",
        x: 75,
        y: 34,
        label: "배경의 풍요로운 건초 더미와 마차",
        detail: "멀리 산더미처럼 쌓인 지주의 곡식 단과 전경의 낱알 몇 개가 극명한 대비를 이룹니다.",
      },
      {
        id: "gl_3",
        x: 26,
        y: 54,
        label: "붉은 두건과 파란 두건의 삼원색 조화",
        detail: "빨강·파랑·노랑 두건이 흙빛 들판 위에서 조화로운 색채 균형을 잡아줍니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "작은 노력과 성실함이 차곡차곡 쌓여 마침내 풍성한 수확과 자산의 결실로 돌아오는 기운을 담고 있습니다.",
    },
  },
  {
    id: "sunflowers",
    museumId: "vangogh_nl",
    title: "해바라기",
    originalTitle: "Sunflowers (Zonnebloemen)",
    artist: "빈센트 반 고흐",
    artistLifespan: "1853 ~ 1890",
    year: "1889년",
    movement: "후기 인상주의",
    medium: "캔버스에 유채",
    dimensions: "95 × 73 cm",
    estimatedValueText: "약 8,500억 원",
    estimatedValueBillionKrw: 8500,
    valuationBasis: "1987년 크리스티 경매 세계 최고가 경신 후 현재 가치 환산",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg",
    palette: ["#ca8a04", "#facc15", "#fef08a"],
    motif: "sunflowers",
    docentScript:
      "아를의 '노란 집'에 함께 살기로 한 친구 폴 고갱의 방을 장식하기 위해 온 열정을 다해 그린 해바라기 연작입니다. 크롬 옐로 하나로만 배경부터 화병, 꽃잎까지 수십 가지의 황금빛 톤을 창조해낸 태양의 찬가입니다.",
    vipBehindStory:
      "풍수지리와 재테크 애호가들 사이에서 '현관이나 거실에 걸어두면 재물과 복이 들어오는 최고의 그림' 1위로 꼽히는 작품입니다! 고흐 자신도 해바라기가 '감사(Gratitude)'를 상징한다고 말하며 자신의 시그니처로 여겼습니다.",
    secretPoints: [
      {
        id: "sf_1",
        x: 50,
        y: 38,
        label: "만개한 꽃과 씨앗이 맺힌 꽃의 공존",
        detail: "활짝 핀 꽃잎부터 시들어 씨앗만 남은 송이까지 생명의 순환 전체를 한 화병에 담았습니다.",
      },
      {
        id: "sf_2",
        x: 42,
        y: 72,
        label: "화병에 새겨진 푸른 서명 'Vincent'",
        detail: "성이 아닌 친근한 이름 '빈센트(Vincent)'만 적은 이유는 누구에게나 따뜻한 친구로 기억되고 싶었기 때문입니다.",
      },
      {
        id: "sf_3",
        x: 55,
        y: 18,
        label: "3가지 노란색만으로 완성한 교향곡",
        detail: "19세기 신소재 안료였던 '크롬 옐로'를 아낌없이 두껍게 발라 눈부신 채도를 구현했습니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "황금빛 태양을 닮은 해바라기 에너지가 금전운과 밝은 기운을 강하게 끌어당겨 줍니다!",
    },
  },
  {
    id: "pearl_earring",
    museumId: "vangogh_nl",
    title: "진주 귀걸이를 한 소녀",
    originalTitle: "Meisje met de parel",
    artist: "요하네스 베르메르",
    artistLifespan: "1632 ~ 1675",
    year: "1665년경",
    movement: "네덜란드 황금기 바로크",
    medium: "캔버스에 유채",
    dimensions: "44.5 × 39 cm",
    estimatedValueText: "약 7,000억 원 (네덜란드의 모나리자)",
    estimatedValueBillionKrw: 7000,
    valuationBasis: "마우리츠하위스 미술관 영구 비매품 추정 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
    palette: ["#090d16", "#1d4ed8", "#eab308"],
    motif: "pearl_earring",
    docentScript:
      "칠흑 같은 어둠 속에서 막 고개를 돌려 관람객과 눈을 마주친 찰나를 포착한 '북유럽의 모나리자'입니다. 귀한 라피스라줄리(청금석)로 칠한 푸른 터번과 단 두 번의 붓터치로 완성된 영롱한 진주 귀걸이가 압도적 존재감을 뿜어냅니다.",
    vipBehindStory:
      "놀랍게도 과학자들이 초고배율 현미경으로 분석한 결과, 소녀의 진주 귀걸이에는 귀와 연결된 '고리'가 아예 그려져 있지 않습니다! 단지 상단 하이라이트 한 점과 하단 반사광 한 점, 딱 두 번의 흰색 붓질만으로 완벽한 진주의 착시를 만들어낸 빛의 마술입니다.",
    secretPoints: [
      {
        id: "pe_1",
        x: 56,
        y: 53,
        label: "단 두 번의 붓터치로 빚은 진주",
        detail: "윤곽선도 고리도 없이 빛의 반사 점 두 개만으로 묵직한 물방울 진주의 입체감을 완성했습니다.",
      },
      {
        id: "pe_2",
        x: 52,
        y: 24,
        label: "금보다 비쌌던 천연 청금석(울트라마린) 터번",
        detail: "아프가니스탄에서 수입한 보석 라피스라줄리를 갈아 만든 최고급 파란 물감으로 터번을 칠해 350년이 지나도 색이 바래지 않았습니다.",
      },
      {
        id: "pe_3",
        x: 42,
        y: 52,
        label: "살짝 벌어진 촉촉한 입술",
        detail: "입술 끝에 찍은 아주 작은 흰색 하이라이트가 마치 지금 막 말을 건네려는 듯한 생동감을 줍니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "어둠 속에서도 단번에 시선을 사로잡는 진주빛 아우라가 당신의 매력과 존재감을 빛내줍니다.",
    },
  },
  {
    id: "birth_of_venus",
    museumId: "uffizi",
    title: "비너스의 탄생",
    originalTitle: "Nascita di Venere",
    artist: "산드로 보티첼리",
    artistLifespan: "1445 ~ 1510",
    year: "1485년경",
    movement: "초기 르네상스",
    medium: "캔버스에 템페라",
    dimensions: "172.5 × 278.5 cm",
    estimatedValueText: "약 9,200억 원 (이탈리아 국보급 유산)",
    estimatedValueBillionKrw: 9200,
    valuationBasis: "우피치 미술관 1순위 대표작 추정 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/800px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg",
    palette: ["#0e7490", "#fbcfe8", "#fde68a"],
    motif: "birth_of_venus",
    docentScript:
      "서풍의 신 제피로스가 불어주는 봄바람을 타고 커다란 조개껍데기 위에 서서 키프로스 섬에 당도하는 미의 여신 비너스를 그린 작품입니다. 중세의 엄숙함을 깨고 인간과 자연의 아름다움을 찬미한 르네상스의 상징입니다.",
    vipBehindStory:
      "비너스의 모델은 당시 피렌체 최고의 미녀로 칭송받던 '시모네타 베스푸치'입니다. 아메리카 대륙의 이름 유래가 된 아메리고 베스푸치의 사촌 형수였던 그녀를 보티첼리는 평생 짝사랑하며 자신의 사후 그녀의 발치에 묻어달라는 유언을 남겼고 실제로 피렌체 오니산티 성당에 나란히 잠들어 있습니다.",
    secretPoints: [
      {
        id: "bv_1",
        x: 52,
        y: 44,
        label: "황금빛 물결처럼 흐르는 비너스의 머리카락",
        detail: "실제 금가루를 섞어 칠한 비너스의 긴 금발이 봄바람에 우아한 곡선을 그리며 흩날립니다.",
      },
      {
        id: "bv_2",
        x: 20,
        y: 34,
        label: "장미꽃 바람을 부는 서풍의 신 제피로스",
        detail: "봄바람의 신 제피로스와 님프 클로리스가 서로 껴안은 채 입김으로 분홍빛 장미꽃을 흩뿌리고 있습니다.",
      },
      {
        id: "bv_3",
        x: 80,
        y: 48,
        label: "꽃무늬 망토를 건네는 계절의 여신 호라",
        detail: "수레국화와 데이지가 수놓아진 붉은 비단 망토로 막 태어난 비너스를 맞이합니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "봄바람에 실려 오는 장미꽃처럼 새로운 인연과 설레는 시작의 기운이 당신에게 찾아옵니다.",
    },
  },
  {
    id: "the_kiss",
    museumId: "belvedere",
    title: "키스",
    originalTitle: "Der Kuss (The Kiss)",
    artist: "구스타프 클림트",
    artistLifespan: "1862 ~ 1918",
    year: "1907 ~ 1908년",
    movement: "빈 분리파 · 아르누보",
    medium: "캔버스에 유채 및 순금박·은박·백금",
    dimensions: "180 × 180 cm",
    estimatedValueText: "약 7,800억 원 (오스트리아 국보)",
    estimatedValueBillionKrw: 7800,
    valuationBasis: "클림트 '아델레 블로흐바우어의 초상' 경매가 기준 환산",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    palette: ["#78350f", "#eab308", "#fde047"],
    motif: "the_kiss",
    docentScript:
      "금세공 장인의 아들로 태어난 클림트가 캔버스 위에 실제 순금박(Gold Leaf)을 입혀 완성한 '황금 시기'의 정점입니다. 꽃밭이 펼쳐진 벼랑 끝에서 황금 망토에 감싸여 입을 맞추는 연인의 모습은 영원한 사랑의 황홀경을 보여줍니다.",
    vipBehindStory:
      "오스트리아 정부는 이 작품이 얼마나 소중했던지 1908년 전시회가 시작되자마자 그림이 다 마르기도 전에 당시 최고가의 5배 금액을 주고 즉시 국가 소장품으로 매입했습니다. 남자의 옷에는 직사각형(남성성), 여자의 옷에는 원형과 꽃무늬(여성성)가 수놓아져 두 세계의 합일을 상징합니다.",
    secretPoints: [
      {
        id: "tk_1",
        x: 52,
        y: 22,
        label: "황홀경에 눈을 감은 여인의 얼굴",
        detail: "두 손을 남자의 목에 감은 채 황홀하게 눈을 감은 표정이 금빛 후광 속에서 빛납니다.",
      },
      {
        id: "tk_2",
        x: 48,
        y: 55,
        label: "사각형 패턴과 원형 꽃무늬의 조화",
        detail: "남성의 각진 흑백 직사각형 패턴과 여성의 부드러운 동심원 패턴이 하나의 황금 망토 안에서 녹아듭니다.",
      },
      {
        id: "tk_3",
        x: 62,
        y: 88,
        label: "아슬아슬한 꽃밭 절벽 끝의 발끝",
        detail: "여인의 발가락이 금빛 벼랑 끝에 아슬아슬하게 걸려 있어, 사랑의 황홀함과 동시에 위태로운 긴장감을 암시합니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "순금박으로 빛나는 클림트의 축복이 사랑의 결실과 풍요로운 금전적 행운을 동시에 선사합니다.",
    },
  },
  {
    id: "arnolfini",
    museumId: "national_uk",
    title: "아르놀피니 부부의 초상",
    originalTitle: "The Arnolfini Portrait",
    artist: "얀 반 에이크",
    artistLifespan: "1390 ~ 1441",
    year: "1434년",
    movement: "북유럽 르네상스",
    medium: "오크 나무판에 유채",
    dimensions: "82.2 × 60 cm",
    estimatedValueText: "약 5,500억 원",
    estimatedValueBillionKrw: 5500,
    valuationBasis: "런던 내셔널 갤러리 1호 핵심 소장품 추정 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg",
    palette: ["#1e293b", "#15803d", "#b91c1c"],
    motif: "arnolfini",
    docentScript:
      "유화 기법을 완성한 북유럽의 천재 얀 반 에이크가 그린 가장 정교한 미스터리 걸작입니다. 방 안의 샹들리에, 오렌지, 강아지, 나막신 하나하나에 숨겨진 상징과 벽면 볼록거울 속 초미세 디테일은 사진기보다 더 정밀한 경이로움을 보여줍니다.",
    vipBehindStory:
      "벽 한가운데 걸린 동전만 한 볼록거울을 확대해 보면, 부부의 뒷모습뿐만 아니라 문 앞에 서 있는 '두 명의 방문객(증인)'까지 또렷이 비치고 있습니다! 그리고 거울 바로 위 벽면에는 '얀 반 에이크가 이곳에 있었다(Johannes de eyck fuit hic 1434)'라는 서명이 적혀 있어, 화가가 두 사람의 서약 증인이었음을 증명합니다.",
    secretPoints: [
      {
        id: "ar_1",
        x: 50,
        y: 42,
        label: "문 앞 증인까지 비추는 5cm 볼록거울",
        detail: "거울 테두리에는 예수의 수난 장면 10컷이 손톱보다 작은 크기로 세밀하게 그려져 있고, 거울 속에는 화가 자신이 비칩니다.",
      },
      {
        id: "ar_2",
        x: 50,
        y: 16,
        label: "단 한 자루만 켜진 샹들리에 촛불",
        detail: "대낮임에도 샹들리에 왼쪽에 촛불 하나가 켜져 있는데, 이는 모든 것을 지켜보는 신의 눈 또는 서약의 빛을 뜻합니다.",
      },
      {
        id: "ar_3",
        x: 47,
        y: 84,
        label: "부부의 충절을 상징하는 그리폰 테리어 강아지",
        detail: "털 한 올 한 올까지 살아 있는 강아지는 부부간의 신의(Fidelitas)와 화목을 상징합니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "거상 아르놀피니의 부유함과 치밀한 계약의 기운이 중요한 계약 성사와 재산 증식을 도와줍니다.",
    },
  },
  {
    id: "las_meninas",
    museumId: "prado",
    title: "시녀들",
    originalTitle: "Las Meninas",
    artist: "디에고 벨라스케스",
    artistLifespan: "1599 ~ 1660",
    year: "1656년",
    movement: "스페인 바로크",
    medium: "캔버스에 유채",
    dimensions: "318 × 276 cm",
    estimatedValueText: "약 8,000억 원 (프라도 미술관 국보 1호)",
    estimatedValueBillionKrw: 8000,
    valuationBasis: "프라도 미술관 반출 금지 1호 국보 추정 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/800px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg",
    palette: ["#27272a", "#a16207", "#fde68a"],
    motif: "las_meninas",
    docentScript:
      "서양 미술사상 '시선과 공간의 마술'을 가장 완벽하게 구현한 걸작입니다. 금발의 마르가리타 공주와 시녀들, 그리고 거대한 캔버스 뒤에서 정면(관람객)을 바라보는 화가 벨라스케스의 눈빛이 우리를 그림 속 국왕 부부의 자리로 초대합니다.",
    vipBehindStory:
      "피카소는 이 '시녀들'에 얼마나 매료되었는지 무려 58점의 변주 연작을 그렸고, 초현실주의 거장 살바도르 달리는 '만약 프라도 미술관에 불이 난다면 나는 주저 없이 시녀들이 걸린 방의 공기라도 들고 나오겠다'고 극찬했습니다.",
    secretPoints: [
      {
        id: "lm_1",
        x: 51,
        y: 72,
        label: "중심에서 빛나는 5살 마르가리타 공주",
        detail: "화려한 베르두가도(버팀대 드레스)를 입은 공주에게 오른쪽 창문 빛이 스포트라이트처럼 쏟아집니다.",
      },
      {
        id: "lm_2",
        x: 24,
        y: 48,
        label: "붓을 들고 우리를 바라보는 화가 벨라스케스",
        detail: "가슴에 스페인 최고 귀족 훈장인 '산티아고 십자가'가 그려져 있는데, 벨라스케스 사후 국왕이 직접 그려 넣었다는 전설이 있습니다.",
      },
      {
        id: "lm_3",
        x: 44,
        y: 44,
        label: "뒷벽 거울에 비친 국왕 펠리페 4세 부부",
        detail: "배경 거울 속에 왕과 왕비가 비치고 있어, 지금 그림을 보고 있는 관람객의 위치가 바로 국왕 부부가 서 있는 자리임을 알려줍니다!",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "궁정 수석화가 벨라스케스의 품격과 중심의 아우라가 당신의 사회적 위상과 리더십을 높여줍니다.",
    },
  },
  {
    id: "the_scream",
    museumId: "oslo_munch",
    title: "절규",
    originalTitle: "Skrik (The Scream)",
    artist: "에드바르 뭉크",
    artistLifespan: "1863 ~ 1944",
    year: "1893년",
    movement: "표현주의 선구",
    medium: "판지에 템페라·유채·파스텔",
    dimensions: "91 × 73.5 cm",
    estimatedValueText: "약 5,200억 원",
    estimatedValueBillionKrw: 5200,
    valuationBasis: "2012년 소더비 경매 파스텔 버전 1억 1,992만 달러 낙찰 → 유화 원본 환산가",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
    palette: ["#dc2626", "#ea580c", "#1e3a8a"],
    motif: "scream",
    docentScript:
      "해 질 녘 오슬로 피오르드 다리 위를 걷던 뭉크가 핏빛으로 물든 하늘에서 느낀 '자연을 관통하는 거대한 외침'을 시각화한 현대 미술의 아이콘입니다. 인물이 소리를 지르는 것이 아니라, 자연의 거대한 절규에 압도되어 두 귀를 막고 있는 모습입니다.",
    vipBehindStory:
      "그림 왼쪽 위 붉은 구름 부분을 적외선으로 촬영하자 연필로 작게 적힌 문장이 발견되었습니다: '미친 사람만이 그릴 수 있었을 것이다(Kan kun være malet af en gal mand)!' 한동안 낙서 테러인 줄 알았으나 필적 감정 결과 뭉크 본인이 자신의 정신 상태를 비난한 평론가들에게 상처받아 직접 적어 넣은 문구로 확인되었습니다.",
    secretPoints: [
      {
        id: "sc_1",
        x: 49,
        y: 66,
        label: "자연의 외침에 두 귀를 막은 인물",
        detail: "우리가 흔히 생각하는 것과 달리 인물이 비명을 지르는 게 아니라, 세상의 불안한 소리에 귀를 막고 있는 자세입니다.",
      },
      {
        id: "sc_2",
        x: 50,
        y: 16,
        label: "핏빛으로 일렁이는 피오르드 노을",
        detail: "뭉크가 직접 연필로 '미친 사람만이 그릴 수 있었다'라는 비밀 메모를 남긴 상단 붉은 구름 영역입니다.",
      },
      {
        id: "sc_3",
        x: 16,
        y: 44,
        label: "무심하게 걸어가는 두 친구의 실루엣",
        detail: "주인공의 극심한 내면의 공포와 달리 아무 일 없다는 듯 멀어져 가는 두 친구가 현대인의 고독을 극대화합니다.",
      },
    ],
    fortuneTag: {
      category: "영감·창의운",
      blessing: "내면의 불안과 스트레스를 모두 털어내고 독창적인 표현력으로 세상을 놀라게 할 에너지를 줍니다.",
    },
  },
  {
    id: "water_lilies",
    museumId: "nyc_moma_met",
    title: "수련",
    originalTitle: "Les Nymphéas (Water Lilies)",
    artist: "클로드 모네",
    artistLifespan: "1840 ~ 1926",
    year: "1906 ~ 1919년",
    movement: "인상주의",
    medium: "캔버스에 유채",
    dimensions: "130 × 200 cm",
    estimatedValueText: "약 4,500억 원",
    estimatedValueBillionKrw: 4500,
    valuationBasis: "크리스티·소더비 모네 수련 대작 낙찰가 및 미술관 소장 가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/800px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    palette: ["#0d9488", "#38bdf8", "#f472b6"],
    motif: "water_lilies",
    docentScript:
      "모네가 생애 마지막 30년 동안 직접 가꾼 지베르니 정원의 연못을 응시하며 탄생시킨 빛과 물의 시(詩)입니다. 지평선도 하늘도 생략한 채 오직 수면 위에 비친 구름과 버드나무 그림자, 그리고 보석처럼 떠 있는 수련만을 담아 무한한 평온을 선사합니다.",
    vipBehindStory:
      "노년의 모네는 백내장으로 시력을 거의 잃어갔지만, 물감 튜브의 위치와 순서를 외워서 끝까지 붓을 놓지 않았습니다. 하늘을 보지 않고도 연못 수면에 반사된 빛만으로 오전·정오·석양의 대기를 구분해낸 인상주의의 결정체입니다.",
    secretPoints: [
      {
        id: "wl_1",
        x: 68,
        y: 42,
        label: "에메랄드 수면 위에 피어난 연분홍 수련",
        detail: "짧고 두툼한 터치로 차가운 물빛 위에 따뜻한 분홍빛과 흰빛 꽃잎을 입체적으로 띄웠습니다.",
      },
      {
        id: "wl_2",
        x: 28,
        y: 30,
        label: "물속에 비친 하늘과 구름의 그림자",
        detail: "실제 하늘을 그리지 않고도 연못 수면의 보랏빛·푸른빛 반영을 통해 머리 위의 하늘을 느끼게 합니다.",
      },
      {
        id: "wl_3",
        x: 45,
        y: 78,
        label: "경계를 허문 추상미술의 예고편",
        detail: "가까이서 보면 물감의 추상적 향연이지만, 한 걸음 물러서면 고요한 연못이 펼쳐지는 시각적 마법을 보여줍니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "지베르니 연못의 고요한 물결이 지친 마음을 다독여주고 흔들리지 않는 마음의 여유를 선물합니다.",
    },
  },
  {
    id: "great_wave",
    museumId: "nyc_moma_met",
    title: "가나가와 해변의 높은 파도 아래",
    originalTitle: "神奈川沖浪裏 (The Great Wave off Kanagawa)",
    artist: "가쓰시카 호쿠사이",
    artistLifespan: "1760 ~ 1849",
    year: "1831년경",
    movement: "에도 시대 우키요에",
    medium: "다색 목판화 (니시키에)",
    dimensions: "25.7 × 37.9 cm",
    estimatedValueText: "약 380억 원 (초판본 기준)",
    estimatedValueBillionKrw: 380,
    valuationBasis: "2023년 크리스티 경매 목판화 역대 최고가 경신 및 초판본 희소가치",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/800px-Tsunami_by_hokusai_19th_century.jpg",
    palette: ["#1e3a8a", "#eff6ff", "#fde68a"],
    motif: "great_wave",
    docentScript:
      "호쿠사이가 72세에 발표한 『후지산 36경』 중 가장 유명한 작품으로, 거대한 파도가 발톱을 세워 덮치는 찰나와 저 멀리 고요하게 솟은 후지산을 극적으로 대비시켰습니다. 고흐, 모네, 드뷔시 등 유럽 인상파 예술가들에게 엄청난 충격을 준 동양 판화의 아이콘입니다.",
    vipBehindStory:
      "이 작품이 유독 강렬한 파란빛을 띠는 이유는 당시 유럽에서 막 수입된 최초의 합성 안료 '프러시안 블루(베로 아이)'를 과감하게 사용했기 때문입니다! 작곡가 클로드 드뷔시는 자신의 작업실에 이 그림을 걸어두고 교향시 『바다(La Mer)』를 작곡했습니다.",
    secretPoints: [
      {
        id: "gw_1",
        x: 32,
        y: 28,
        label: "독수리 발톱처럼 부서지는 파도 포말",
        detail: "거대한 파도 끝이 마치 살아 있는 생물의 발톱처럼 배들을 향해 쏟아져 내리는 역동적인 순간을 포착했습니다.",
      },
      {
        id: "gw_2",
        x: 56,
        y: 74,
        label: "파도를 정면으로 가르며 노 젓는 어부들",
        detail: "자세히 보면 거친 파도 속에 세 척의 빠른 운반선(오시오쿠리부네)과 몸을 낮춘 사공 30명이 필사적으로 노를 젓고 있습니다.",
      },
      {
        id: "gw_3",
        x: 74,
        y: 66,
        label: "파도 속에 숨은 눈 덮인 후지산",
        detail: "앞쪽의 작은 파도 능선 모양이 멀리 보이는 후지산의 실루엣과 똑같은 프랙탈 구도를 이룹니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "거친 파도도 정면으로 돌파해 목적지에 닿는 어부들처럼 어떤 난관도 넘어서는 담대함을 전해줍니다.",
    },
  },
  {
    id: "miindo",
    museumId: "seoul_kansong",
    title: "미인도 (보물)",
    originalTitle: "美人圖 (Portrait of a Beauty)",
    artist: "혜원 신윤복",
    artistLifespan: "1758 ~ 미상",
    year: "18세기 말 ~ 19세기 초 (조선 정조~순조 연간)",
    movement: "조선 후기 풍속화·미인화",
    medium: "비단에 채색 (견본채색)",
    dimensions: "114.2 × 45.7 cm",
    estimatedValueText: "추정 가치 환산 불가 (약 1,000억 원+ 문화재 가치)",
    estimatedValueBillionKrw: 1000,
    valuationBasis: "대한민국 국가 지정 보물 · 간송미술관 대표 문화유산",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Shin_Yun-bok-Miindo.jpg/600px-Shin_Yun-bok-Miindo.jpg",
    palette: ["#d6d3d1", "#1d4ed8", "#be123c"],
    motif: "miindo",
    docentScript:
      "조선 시대 여인의 기품과 섬세한 아름다움을 가장 완벽하게 담아낸 '한국의 모나리자'입니다. 볼륨감 있게 얹은 트레머리와 짧고 꼭 맞는 연노랑 삼회장저고리, 구름처럼 풍성하게 퍼진 쪽빛 치마, 그리고 옷고름과 노리개를 살짝 쥔 손끝에서 단아한 설렘이 전해집니다.",
    vipBehindStory:
      "미인의 머리칼과 눈썹을 확대해 보면 머리카락 한 올 한 올을 머리카락보다 가는 세필(細筆)로 수천 번 그어 완성한 극세밀 묘사에 감탄하게 됩니다! 왼쪽 여백에는 신윤복이 직접 적은 '가슴속에 만 가지 봄기운이 일어난다(盤礴胸中萬化春)'라는 시가 적혀 있습니다.",
    secretPoints: [
      {
        id: "mi_1",
        x: 52,
        y: 20,
        label: "수천 번의 붓질로 완성한 트레머리와 자주색 댕기",
        detail: "초승달 같은 눈썹과 앵두빛 입술, 귀 밑으로 살짝 흘러내린 잔머리 몇 가닥이 생생한 숨결을 불어넣습니다.",
      },
      {
        id: "mi_2",
        x: 49,
        y: 38,
        label: "자주색 옷고름과 삼작노리개를 쥔 고운 손길",
        detail: "짧은 삼회장저고리 아래로 살짝 드러난 속적삼과 노리개를 만지작거리는 손끝에서 애틋한 심리가 읽힙니다.",
      },
      {
        id: "mi_3",
        x: 52,
        y: 68,
        label: "풍성한 쪽빛 치마와 살짝 드러난 외씨버선",
        detail: "얇은 먹선과 쪽빛 채색으로 비단 치마의 우아한 주름과 버선코의 맵시를 살려냈습니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "'가슴속 만 가지 봄기운'이라는 화제(畫題)처럼 당신의 일상과 인연에 따스한 봄날의 기품을 더해줍니다.",
    },
  },
  {
    id: "inwang_jesaekdo",
    museumId: "seoul_kansong",
    title: "인왕제색도 (국보 제216호)",
    originalTitle: "仁旺霽色圖 (Scene of Mt. Inwang After Rain)",
    artist: "겸재 정선",
    artistLifespan: "1676 ~ 1759",
    year: "1751년 (영조 27년, 정선 76세)",
    movement: "조선 후기 진경산수화",
    medium: "종이에 수묵 (지본수묵)",
    dimensions: "79.2 × 138.2 cm",
    estimatedValueText: "약 1,500억 원+ (국보 제216호 · 국립중앙박물관)",
    estimatedValueBillionKrw: 1500,
    valuationBasis: "고(故) 이건희 회장 기증품 중 최고가치 국보 산수화",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jeong_Seon_-_Inwangjesaekdo.jpg/800px-Jeong_Seon_-_Inwangjesaekdo.jpg",
    palette: ["#18181b", "#52525b", "#f4f4f5"],
    motif: "inwang",
    docentScript:
      "여름날 소나기가 막 지나간 뒤, 짙은 안개 구름 위로 웅장하게 모습을 드러낸 서울 인왕산의 젖은 바위산을 그린 한국 미술사 최고의 진경산수화입니다. 붓을 눕혀 위에서 아래로 힘차게 쓸어내린 먹빛 바위(치마준법)가 화면을 압도합니다.",
    vipBehindStory:
      "겸재 정선이 76세 노년에 평생의 절친이었던 시인 사천 이병연이 위독하다는 소식을 듣고, 비가 개인 인왕산처럼 친구의 병이 깨끗이 낫기를 기원하며 혼신을 다해 그린 우정의 걸작입니다. 안타깝게도 그림이 완성된 지 며칠 뒤 친구는 세상을 떠났고, 이 그림은 영원한 우정의 기념비로 남았습니다.",
    secretPoints: [
      {
        id: "iw_1",
        x: 52,
        y: 28,
        label: "비에 젖어 묵직하게 빛나는 인왕산 치마바위",
        detail: "큰 붓에 짙은 먹을 듬뿍 묻혀 단숨에 내리그은 과감한 필치로 화강암 암벽의 거대한 중량감을 표현했습니다.",
      },
      {
        id: "iw_2",
        x: 46,
        y: 62,
        label: "산허리를 휘감아 피어오르는 하얀 안개 구름",
        detail: "검은 바위와 하얀 비구름의 강렬한 흑백 대비가 막 비가 갠 뒤의 청량한 공기를 그대로 전해줍니다.",
      },
      {
        id: "iw_3",
        x: 78,
        y: 86,
        label: "산 아래 고즈넉한 기와집 (친구 이병연의 집)",
        detail: "우측 하단 소나무 숲 사이에 병석에 누운 벗 이병연의 집과 그곳으로 향하는 골목길을 정성껏 그려 넣었습니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "비 온 뒤 더욱 웅장하고 맑게 빛나는 인왕산처럼 모든 어려움을 씻어내고 굳건한 기상을 회복시켜 줍니다.",
    },
  },
];

export interface TasteQuestion {
  id: string;
  question: string;
  options: Array<{
    label: string;
    sub: string;
    scores: Record<string, number>; // masterpieceId -> weight
  }>;
}

export const ART_TASTE_QUIZ: TasteQuestion[] = [
  {
    id: "q1",
    question: "Q1. 지금 내 방 창문을 열었을 때 펼쳐졌으면 하는 풍경은?",
    options: [
      {
        label: "🌌 별빛과 가스등이 일렁이는 푸른 밤하늘",
        sub: "감성적이고 신비로운 새벽의 에너지",
        scores: { starry_night: 4, starry_rhone: 3, the_scream: 1 },
      },
      {
        label: "☀️ 따스한 햇살과 황금빛 꽃밭이 가득한 정원",
        sub: "풍요롭고 긍정적인 생명력과 온기",
        scores: { sunflowers: 4, the_kiss: 3, birth_of_venus: 2 },
      },
      {
        label: "🌊 안개 낀 산봉우리나 고요한 연못의 물결",
        sub: "마음이 차분해지는 자연의 품격과 여백",
        scores: { inwang_jesaekdo: 4, water_lilies: 4, great_wave: 2 },
      },
      {
        label: "🏛️ 비밀스러운 이야기가 숨겨진 고전 궁전과 살롱",
        sub: "지적인 호기심과 우아한 클래식 무드",
        scores: { mona_lisa: 4, pearl_earring: 3, arnolfini: 3, miindo: 3 },
      },
    ],
  },
  {
    id: "q2",
    question: "Q2. 요즘 내가 가장 끌어당기고 싶은 행운의 기운은?",
    options: [
      {
        label: "💰 든든한 재물운과 자산의 결실",
        sub: "황금빛 풍요와 성공적인 계약",
        scores: { sunflowers: 4, arnolfini: 3, gleaners: 3, the_kiss: 2 },
      },
      {
        label: "💓 설레는 사랑과 나를 빛내는 독보적 매력",
        sub: "누구에게나 사랑받는 아우라",
        scores: { the_kiss: 4, pearl_earring: 4, birth_of_venus: 3, miindo: 3 },
      },
      {
        label: "🚀 막힌 일을 뚫어내는 돌파력과 명예",
        sub: "큰 무대에서 인정받는 존재감",
        scores: { liberty_leading: 4, great_wave: 4, las_meninas: 3, mona_lisa: 3 },
      },
      {
        label: "✨ 남다른 창의적 영감과 마음의 치유",
        sub: "스트레스 해소와 반짝이는 아이디어",
        scores: { starry_night: 4, water_lilies: 4, starry_rhone: 3, inwang_jesaekdo: 3 },
      },
    ],
  },
  {
    id: "q3",
    question: "Q3. 미술관에서 내 발걸음을 멈추게 하는 그림의 디테일은?",
    options: [
      {
        label: "🔍 돋보기로 봐야 보이는 초정밀 숨은 그림",
        sub: "거울 속 반사상, 머리카락 한 올의 완벽함",
        scores: { arnolfini: 4, miindo: 4, las_meninas: 3, mona_lisa: 2 },
      },
      {
        label: "🎨 손으로 만져질 듯 두껍고 강렬한 붓터치",
        sub: "화가의 열정이 그대로 굳어진 입체감",
        scores: { starry_night: 4, sunflowers: 3, inwang_jesaekdo: 3, the_scream: 2 },
      },
      {
        label: "✨ 어둠 속에서 보석처럼 반짝이는 빛과 황금",
        sub: "극적인 명암 대비와 화려한 색채",
        scores: { pearl_earring: 4, the_kiss: 4, starry_rhone: 3 },
      },
      {
        label: "🌊 화면 밖으로 튀어나올 듯한 드라마틱한 구도",
        sub: "역동적인 에너지와 웅장한 스케일",
        scores: { great_wave: 4, liberty_leading: 4, birth_of_venus: 3, gleaners: 2 },
      },
    ],
  },
];
