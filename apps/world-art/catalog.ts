/**
 * 월드아트맵 (world-art) - 6대주 21대 세계 미술관 & 28대 불멸의 명화 카탈로그
 * - 모든 수록 작품은 퍼블릭 도메인(Public Domain) 인류 문화유산이며,
 *   원화 고해상도 이미지가 로컬 에셋(/world-art/paintings/*.jpg)으로 즉시 로드됩니다.
 */

export type RegionKey = "all" | "americas" | "europe" | "asia" | "mea_oceania";

export interface MuseumInfo {
  id: string;
  name: string;
  englishName: string;
  city: string;
  country: string;
  countryIso: string;
  flag: string;
  region: "americas" | "europe" | "asia" | "mea_oceania";
  /** 세계지도(1000 x 520 Miller 투영) 상의 실제 지리 좌표 */
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
  estimatedValueBillionKrw: number;
  valuationBasis: string;
  imageUrl: string;
  palette: [string, string, string];
  motif: string;
  docentScript: string;
  vipBehindStory: string;
  secretPoints: SecretHotspot[];
  fortuneTag: {
    category: "재물·성공운" | "사랑·매력운" | "영감·창의운" | "치유·평온운" | "명예·돌파운";
    blessing: string;
  };
}

export const MUSEUMS: MuseumInfo[] = [
  // ================= 1. 북아메리카 & 중남미 (Americas - 5곳) =================
  {
    id: "nyc_moma_met",
    name: "뉴욕 MoMA & 메트로폴리탄",
    englishName: "MoMA & The Metropolitan Museum of Art",
    city: "뉴욕",
    country: "미국",
    countryIso: "USA",
    flag: "🇺🇸",
    region: "americas",
    mapX: 294.5,
    mapY: 203.4,
    foundedYear: "1870년 / 1929년",
    annualVisitors: "연간 750만 명",
    badgeColor: "#7C3AED",
    stampTitle: "NEW YORK · MOMA & MET",
    stampCode: "JFK-NYM-01",
    desc: "고흐의 '별이 빛나는 밤'과 미국 역사의 상징 '델라웨어강 도하'를 품은 미주 대륙 예술의 심장입니다.",
    highlightTip: "MoMA 5층 501호에 들어서면 전 세계 관람객이 가장 사랑하는 '별이 빛나는 밤' 진품을 만날 수 있어요.",
  },
  {
    id: "chicago_aic",
    name: "시카고 미술관",
    englishName: "The Art Institute of Chicago",
    city: "시카고",
    country: "미국",
    countryIso: "USA",
    flag: "🇺🇸",
    region: "americas",
    mapX: 256.6,
    mapY: 199.8,
    foundedYear: "1879년",
    annualVisitors: "연간 180만 명",
    badgeColor: "#2563EB",
    stampTitle: "CHICAGO · AIC",
    stampCode: "ORD-AIC-02",
    desc: "파리 외 지역에서 가장 방대한 인상주의·점묘법 컬렉션과 미국 리얼리즘 걸작을 보유한 3대 미술관입니다.",
    highlightTip: "쇠라의 '그랑드 자트 섬의 일요일 오후'와 그랜트 우드의 '아메리칸 고딕'이 나란히 시카고의 자랑으로 꼽힙니다.",
  },
  {
    id: "dc_nga",
    name: "워싱턴 내셔널 갤러리 오브 아트",
    englishName: "National Gallery of Art",
    city: "워싱턴 D.C.",
    country: "미국",
    countryIso: "USA",
    flag: "🇺🇸",
    region: "americas",
    mapX: 286.1,
    mapY: 209.3,
    foundedYear: "1937년",
    annualVisitors: "연간 380만 명",
    badgeColor: "#0284C7",
    stampTitle: "WASHINGTON · NGA",
    stampCode: "IAD-NGA-03",
    desc: "미 국회의사당 앞 내셔널 몰에 위치하며, 모네의 '양산을 쓴 여인'과 아메리카 유일의 다빈치 회화를 소장하고 있습니다.",
    highlightTip: "재무장관 앤드루 멜런의 기증으로 설립되어 전 세계 관람객에게 상설 전시가 100% 무료로 개방됩니다.",
  },
  {
    id: "mexico_bellas",
    name: "멕시코시티 국립미술관 & 소우마야",
    englishName: "MUNAL & Museo Soumaya",
    city: "멕시코시티",
    country: "멕시코",
    countryIso: "MEX",
    flag: "🇲🇽",
    region: "americas",
    mapX: 224.6,
    mapY: 266.3,
    foundedYear: "1904년 / 1994년",
    annualVisitors: "연간 240만 명",
    badgeColor: "#059669",
    stampTitle: "MEXICO CITY · ART",
    stampCode: "MEX-MNL-04",
    desc: "아즈텍 고원의 장엄한 화산 풍경화부터 중남미 근대 미술의 정수를 집대성한 라틴아메리카 문화 수도입니다.",
    highlightTip: "벨라스코가 그린 '멕시코 계곡'은 포포카테페틀 화산과 고대 테노치티틀란의 신비를 파노라마로 보여줍니다.",
  },
  {
    id: "saopaulo_masp",
    name: "상파울루 미술관 (MASP)",
    englishName: "Museu de Arte de São Paulo",
    city: "상파울루",
    country: "브라질",
    countryIso: "BRA",
    flag: "🇧🇷",
    region: "americas",
    mapX: 370.4,
    mapY: 383.4,
    foundedYear: "1947년",
    annualVisitors: "연간 110만 명",
    badgeColor: "#16A34A",
    stampTitle: "SAO PAULO · MASP",
    stampCode: "GRU-MSP-05",
    desc: "남반구에서 가장 중요한 유럽 및 중남미 미술 컬렉션을 보유한 브라질 현대 건축과 예술의 랜드마크입니다.",
    highlightTip: "유리 이젤(Crystal Easels) 위에 그림을 공중에 띄운 듯 전시하여 작품의 뒷면까지 감상할 수 있는 독창적 미술관입니다.",
  },

  // ================= 2. 아시아 (Asia - 4곳) =================
  {
    id: "seoul_kansong",
    name: "서울 간송미술관 & 국립중앙박물관",
    englishName: "Kansong & National Museum of Korea",
    city: "서울",
    country: "대한민국",
    countryIso: "KOR",
    flag: "🇰🇷",
    region: "asia",
    mapX: 852.7,
    mapY: 213.5,
    foundedYear: "1938년 / 1945년",
    annualVisitors: "연간 418만 명 (아시아 1위)",
    badgeColor: "#0D9488",
    stampTitle: "SEOUL · KOREA",
    stampCode: "ICN-KOR-06",
    desc: "전형필 선생이 전 재산으로 지켜낸 혜원 신윤복의 '미인도'와 겸재 정선의 '인왕제색도' 등 대한민국 국보의 전당입니다.",
    highlightTip: "신윤복의 '미인도'와 정선의 '인왕제색도'는 한지 보호를 위해 매년 특별전 기간에만 조도를 낮춰 공개됩니다.",
  },
  {
    id: "tokyo_tnm",
    name: "도쿄 국립박물관",
    englishName: "Tokyo National Museum",
    city: "도쿄",
    country: "일본",
    countryIso: "JPN",
    flag: "🇯🇵",
    region: "asia",
    mapX: 888.2,
    mapY: 219.1,
    foundedYear: "1872년",
    annualVisitors: "연간 250만 명",
    badgeColor: "#E11D48",
    stampTitle: "TOKYO · NATIONAL",
    stampCode: "HND-TNM-07",
    desc: "우에노 공원에 자리한 일본 최고(最古)의 박물관으로, 호쿠사이의 우키요에 판화와 동양 고미술 국보 89점을 소장하고 있습니다.",
    highlightTip: "호쿠사이의 '가나가와 해변의 높은 파도 아래'는 유럽 인상파 화가(고흐·모네·드뷔시)들에게 결정적 영감을 준 작품입니다.",
  },
  {
    id: "taipei_npm",
    name: "타이베이 국립고궁박물원",
    englishName: "National Palace Museum",
    city: "타이베이",
    country: "대만",
    countryIso: "TWN",
    flag: "🇹🇼",
    region: "asia",
    mapX: 837.6,
    mapY: 250.3,
    foundedYear: "1925년",
    annualVisitors: "연간 380만 명",
    badgeColor: "#0891B2",
    stampTitle: "TAIPEI · PALACE",
    stampCode: "TPE-NPM-08",
    desc: "북송 시대 산수화의 정점인 범관의 '계산행려도'를 비롯해 70만 점의 황실 보물을 간직한 동양 미술사의 보물창고입니다.",
    highlightTip: "범관의 '계산행려도' 오른쪽 아래 나뭇잎 수풀 속에는 화가의 두 글자 한자 서명('范寬')이 보물찾기처럼 숨어 있습니다.",
  },
  {
    id: "delhi_national",
    name: "뉴델리 국립박물관 & 근대미술관",
    englishName: "National Museum & NGMA New Delhi",
    city: "뉴델리",
    country: "인도",
    countryIso: "IND",
    flag: "🇮🇳",
    region: "asia",
    mapX: 714.5,
    mapY: 240.2,
    foundedYear: "1949년",
    annualVisitors: "연간 150만 명",
    badgeColor: "#D97706",
    stampTitle: "NEW DELHI · INDIA",
    stampCode: "DEL-NGM-09",
    desc: "인도 신화와 서양 유화 기법을 결합해 근대 인도 미술의 아버지로 불리는 라자 라비 바르마의 걸작들을 만날 수 있습니다.",
    highlightTip: "고대 산스크리트 희곡의 여주인공 '사쿤탈라'가 발의 가시를 빼는 척하며 연인을 뒤돌아보는 찰나의 연기를 감상해보세요.",
  },

  // ================= 3. 중동 · 아프리카 · 오세아니아 (MEA & Oceania - 3곳) =================
  {
    id: "cairo_gem",
    name: "카이로 이집트 박물관 (GEM)",
    englishName: "The Egyptian Museum & Grand Egyptian Museum",
    city: "카이로",
    country: "이집트",
    countryIso: "EGY",
    flag: "🇪🇬",
    region: "mea_oceania",
    mapX: 586.8,
    mapY: 236.0,
    foundedYear: "1902년 / 2024년",
    annualVisitors: "연간 350만 명",
    badgeColor: "#CA8A04",
    stampTitle: "CAIRO · EGYPT",
    stampCode: "CAI-GEM-10",
    desc: "3,300년의 세월을 넘어 찬란하게 빛나는 '투탕카멘의 황금 마스크'와 파라오의 영원한 예술을 품은 아프리카 대표 박물관입니다.",
    highlightTip: "11kg의 순금과 청금석(라피스 라줄리)으로 제작된 투탕카멘 마스크는 고대 인류 금세공 초상 예술의 정점입니다.",
  },
  {
    id: "abudhabi_louvre",
    name: "루브르 아부다비",
    englishName: "Louvre Abu Dhabi",
    city: "아부다비",
    country: "아랍에미리트",
    countryIso: "ARE",
    flag: "🇦🇪",
    region: "mea_oceania",
    mapX: 651.1,
    mapY: 252.0,
    foundedYear: "2017년",
    annualVisitors: "연간 140만 명",
    badgeColor: "#B45309",
    stampTitle: "ABU DHABI · LOUVRE",
    stampCode: "AUH-LAD-11",
    desc: "사막과 바다가 만나는 사디야트 섬 위에 '빛의 비(Rain of Light)' 돔을 얹은 아랍권 최초의 보편 박물관입니다.",
    highlightTip: "레오나르도 다 빈치의 밀라노 시절 걸작 '라 벨 페로니에르'가 파리 루브르와의 협약을 통해 중동 관객을 맞이합니다.",
  },
  {
    id: "melbourne_ngv",
    name: "멜버른 빅토리아 국립미술관 (NGV)",
    englishName: "National Gallery of Victoria",
    city: "멜버른",
    country: "호주",
    countryIso: "AUS",
    flag: "🇦🇺",
    region: "mea_oceania",
    mapX: 902.7,
    mapY: 425.5,
    foundedYear: "1861년",
    annualVisitors: "연간 260만 명 (오세아니아 1위)",
    badgeColor: "#0284C7",
    stampTitle: "MELBOURNE · NGV",
    stampCode: "MEL-NGV-12",
    desc: "호주에서 가장 오래되고 규모가 큰 미술관으로, 워터하우스의 신화 걸작과 렘브란트·티에폴로 컬렉션을 보유하고 있습니다.",
    highlightTip: "1891년 개관 첫해부터 시민들의 열광을 받은 워터하우스의 '율리시스와 세이렌'은 NGV 최고의 인기 포토존입니다.",
  },

  // ================= 4. 유럽 & 유라시아 (Europe & Eurasia - 9곳) =================
  {
    id: "louvre",
    name: "루브르 박물관",
    englishName: "Musée du Louvre",
    city: "파리",
    country: "프랑스",
    countryIso: "FRA",
    flag: "🇫🇷",
    region: "europe",
    mapX: 506.5,
    mapY: 176.5,
    foundedYear: "1793년",
    annualVisitors: "연간 890만 명 (세계 1위)",
    badgeColor: "#2563EB",
    stampTitle: "PARIS · LOUVRE",
    stampCode: "CDG-LVR-13",
    desc: "유리 피라미드 아래 38만 점의 인류 예술사를 품은 세계 최대의 박물관입니다.",
    highlightTip: "드농관(Denon Wing) 1층 711호에 모나리자가 방탄유리 안에 전시되어 있어요.",
  },
  {
    id: "orsay",
    name: "오르세 & 오랑주리 미술관",
    englishName: "Musée d'Orsay & Orangerie",
    city: "파리",
    country: "프랑스",
    countryIso: "FRA",
    flag: "🇫🇷",
    region: "europe",
    mapX: 505.8,
    mapY: 177.2,
    foundedYear: "1986년",
    annualVisitors: "연간 510만 명",
    badgeColor: "#0EA5E9",
    stampTitle: "PARIS · ORSAY",
    stampCode: "CDG-ORS-14",
    desc: "기차역을 개조한 오르세와 튈르리 정원의 오랑주리는 고흐·밀레·모네 인상주의 걸작들의 성지입니다.",
    highlightTip: "5층 시계탑 창문 너머로 파리 센강과 몽마르트 언덕이 한눈에 내려다보여요.",
  },
  {
    id: "national_uk",
    name: "런던 내셔널 갤러리",
    englishName: "The National Gallery",
    city: "런던",
    country: "영국",
    countryIso: "GBR",
    flag: "🇬🇧",
    region: "europe",
    mapX: 499.6,
    mapY: 167.2,
    foundedYear: "1824년",
    annualVisitors: "연간 320만 명",
    badgeColor: "#4F46E5",
    stampTitle: "LONDON · TNG",
    stampCode: "LHR-TNG-15",
    desc: "트라팔가 광장 한가운데 자리한 영국 대표 미술관으로 얀 반 에이크의 '아르놀피니 부부'와 고흐의 '해바라기'를 소장하고 있습니다.",
    highlightTip: "시민들의 기부로 시작되어 상설 전시는 200년째 전 세계 누구나 무료로 입장할 수 있어요.",
  },
  {
    id: "vangogh_nl",
    name: "암스테르담 반 고흐 & 마우리츠하위스",
    englishName: "Van Gogh Museum & Mauritshuis",
    city: "암스테르담",
    country: "네덜란드",
    countryIso: "NLD",
    flag: "🇳🇱",
    region: "europe",
    mapX: 513.6,
    mapY: 164.2,
    foundedYear: "1822년 / 1973년",
    annualVisitors: "연간 220만 명",
    badgeColor: "#F59E0B",
    stampTitle: "AMSTERDAM · ART",
    stampCode: "AMS-VGM-16",
    desc: "고흐의 유화 200여 점과 베르메르의 '진주 귀걸이를 한 소녀'를 만나는 네덜란드 황금시대의 심장부입니다.",
    highlightTip: "베르메르가 사용한 천연 청금석(울트라마린) 터번의 푸른빛은 360년이 지난 지금도 변색되지 않았습니다.",
  },
  {
    id: "uffizi",
    name: "피렌체 우피치 미술관",
    englishName: "Galleria degli Uffizi",
    city: "피렌체",
    country: "이탈리아",
    countryIso: "ITA",
    flag: "🇮🇹",
    region: "europe",
    mapX: 531.3,
    mapY: 193.6,
    foundedYear: "1581년",
    annualVisitors: "연간 220만 명",
    badgeColor: "#EC4899",
    stampTitle: "FIRENZE · UFFIZI",
    stampCode: "FLR-UFZ-17",
    desc: "메디치 가문이 수집한 르네상스 미술의 보고로, 보티첼리의 '비너스의 탄생'이 숨 쉬는 공간입니다.",
    highlightTip: "보티첼리의 방(10~14호실)에 들어서면 '비너스의 탄생'과 '봄(프리마베라)'이 나란히 관람객을 맞이합니다.",
  },
  {
    id: "belvedere",
    name: "빈 벨베데레 궁전 미술관",
    englishName: "Schloss Belvedere",
    city: "빈",
    country: "오스트리아",
    countryIso: "AUT",
    flag: "🇦🇹",
    region: "europe",
    mapX: 545.5,
    mapY: 178.8,
    foundedYear: "1723년",
    annualVisitors: "연간 180만 명",
    badgeColor: "#D97706",
    stampTitle: "VIENNA · BELVEDERE",
    stampCode: "VIE-BLV-18",
    desc: "바로크 양식의 아름다운 궁전 안에 클림트의 황금빛 걸작 '키스'를 영구 소장하고 있습니다.",
    highlightTip: "실제 금박과 은박, 백금이 캔버스에 입혀져 있어 각도에 따라 진짜 황금빛이 반짝입니다.",
  },
  {
    id: "prado",
    name: "마드리드 프라도 미술관",
    englishName: "Museo Nacional del Prado",
    city: "마드리드",
    country: "스페인",
    countryIso: "ESP",
    flag: "🇪🇸",
    region: "europe",
    mapX: 489.8,
    mapY: 204.5,
    foundedYear: "1819년",
    annualVisitors: "연간 330만 명",
    badgeColor: "#DC2626",
    stampTitle: "MADRID · PRADO",
    stampCode: "MAD-PRD-19",
    desc: "스페인 왕실 컬렉션을 바탕으로 벨라스케스, 고야, 엘 그레코의 걸작을 보유한 유럽 3대 미술관입니다.",
    highlightTip: "벨라스케스의 '시녀들' 앞에 서면 내가 그림 속 국왕 부부가 된 듯한 3차원 시선 교차를 경험합니다.",
  },
  {
    id: "oslo_munch",
    name: "오슬로 국립미술관 & 뭉크 미술관",
    englishName: "Nasjonalmuseet & MUNCH",
    city: "오슬로",
    country: "노르웨이",
    countryIso: "NOR",
    flag: "🇳🇴",
    region: "europe",
    mapX: 529.8,
    mapY: 135.6,
    foundedYear: "1842년",
    annualVisitors: "연간 150만 명",
    badgeColor: "#EA580C",
    stampTitle: "OSLO · MUNCH",
    stampCode: "OSL-MNC-20",
    desc: "북유럽 피오르드의 붉은 노을과 현대인의 불안을 예술로 승화시킨 에드바르 뭉크의 본고장입니다.",
    highlightTip: "'절규'의 하늘이 핏빛인 이유는 1883년 크라카토아 화산 폭발로 인한 전 지구적 적색 노을 때문이라는 설이 유력해요.",
  },
  {
    id: "hermitage_ru",
    name: "상트페테르부르크 에르미타주 박물관",
    englishName: "The State Hermitage Museum",
    city: "상트페테르부르크",
    country: "러시아",
    countryIso: "RUS",
    flag: "🇷🇺",
    region: "europe",
    mapX: 584.2,
    mapY: 135.5,
    foundedYear: "1764년",
    annualVisitors: "연간 320만 명",
    badgeColor: "#0D9488",
    stampTitle: "ST. PETERSBURG · HERMITAGE",
    stampCode: "LED-HRM-21",
    desc: "예카테리나 대제가 수집을 시작해 겨울궁전 등 6개 궁전에 300만 점의 유물을 보유한 세계 3대 박물관입니다.",
    highlightTip: "렘브란트가 생을 마감하기 직전 완성한 영혼의 걸작 '돌아온 탕자' 앞에 서면 관람객 모두가 침묵에 잠깁니다.",
  },
];

export const MASTERPIECES: MasterpieceItem[] = [
  // 1. 파리 루브르 - 모나리자
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
    imageUrl: "/world-art/paintings/mona_lisa.jpg",
    palette: ["#2c3e2e", "#8c6d46", "#d4b483"],
    motif: "monalisa",
    docentScript:
      "윤곽선을 안개처럼 부드럽게 피워내는 다빈치의 '스푸마토(Sfumato)' 기법으로 완성된 인류 최고가의 초상화입니다. 바라보는 각도와 관람자의 기분에 따라 미소를 짓는 듯도, 쓸쓸해 보이는 듯도 한 신비로운 표정이 500년째 전 세계인을 매료시키고 있습니다.",
    vipBehindStory:
      "1911년 루브르 박물관 직원이었던 빈센초 페루자가 코트 안에 모나리자를 숨겨 훔쳐 달아난 사건이 발생했습니다! 당시 용의자로 파블로 피카소까지 체포되었으나, 2년 뒤 피렌체에서 진범이 검거되며 모나리자는 전 세계 신문 1면을 장식한 불멸의 아이콘이 되었습니다.",
    secretPoints: [
      {
        id: "ml_1",
        x: 47,
        y: 31,
        label: "신비로운 스푸마토 미소",
        detail: "입꼬리 경계선을 수십 겹의 얇은 유화 물감으로 번지게 칠해, 시선을 눈에서 입으로 옮길 때 미소가 살아 움직이는 착시를 일으킵니다.",
      },
      {
        id: "ml_2",
        x: 46,
        y: 23,
        label: "사라진 눈썹과 속눈썹",
        detail: "고해상도 적외선 스캔 결과 원래 다빈치는 눈썹을 그렸으나, 세월이 흐르며 복원 세척 과정에서 옅어진 것으로 밝혀졌습니다.",
      },
      {
        id: "ml_3",
        x: 80,
        y: 36,
        label: "비대칭 배경 지평선의 착시",
        detail: "오른쪽 지평선과 왼쪽 지평선의 높이가 서로 다릅니다! 시선이 이동할 때마다 인물이 미묘하게 커 보이는 다빈치의 광학 설계입니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "어떠한 상황에서도 흔들리지 않는 여유와 독보적인 아우라가 당신을 빛내줄 거예요.",
    },
  },

  // 2. 뉴욕 MoMA - 별이 빛나는 밤
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
    estimatedValueText: "약 1조 8,000억 원 이상 (비매품)",
    estimatedValueBillionKrw: 18000,
    valuationBasis: "MoMA 최고 핵심 자산 · 현대 미술사상 가장 사랑받는 캔버스 유화",
    imageUrl: "/world-art/paintings/starry_night.jpg",
    palette: ["#0f172a", "#1d4ed8", "#facc15"],
    motif: "starry_night",
    docentScript:
      "고흐가 생레미 정신병원 요양 시절 새벽 창살 너머로 바라본 밤하늘에 상상의 마을을 더해 그린 걸작입니다. 굽이치는 푸른 밤하늘의 소용돌이와 황금빛으로 폭발하는 11개의 별들은 고통 속에서도 꺼지지 않던 예술가의 희망을 노래합니다.",
    vipBehindStory:
      "2004년 허블 우주망원경 과학자들이 이 그림의 소용돌이 패턴을 분석한 결과, 실제 유체역학의 '콜모고로프 난류(Turbulence) 방정식'과 수학적으로 거의 일치한다는 놀라운 연구 결과를 발표했습니다.",
    secretPoints: [
      {
        id: "sn_1",
        x: 52,
        y: 32,
        label: "은하수 난류 소용돌이",
        detail: "짧고 두꺼운 임파스토 붓터치를 겹겹이 쌓아 밤하늘의 대기가 실제로 회전하며 맥동하는 듯한 운동 에너지를 구현했습니다.",
      },
      {
        id: "sn_2",
        x: 18,
        y: 55,
        label: "하늘로 솟구치는 사이프러스 나무",
        detail: "불꽃처럼 검푸르게 솟아오른 사이프러스 나무는 대지와 별의 세계를 이어주는 영혼의 안테나 역할을 합니다.",
      },
      {
        id: "sn_3",
        x: 84,
        y: 22,
        label: "태양처럼 타오르는 초승달",
        detail: "크롬 옐로우와 인디안 옐로우 물감을 아낌없이 바른 초승달이 어두운 새벽하늘 전체를 황금빛 온기로 밝혀줍니다.",
      },
    ],
    fortuneTag: {
      category: "영감·창의운",
      blessing: "어두운 밤일수록 별은 더 밝게 빛납니다. 오늘 당신에게 천재적인 영감이 찾아옵니다.",
    },
  },

  // 3. 뉴욕 메트로폴리탄 - 워싱턴의 델라웨어강 도하
  {
    id: "washington_delaware",
    museumId: "nyc_moma_met",
    title: "워싱턴의 델라웨어강 도하",
    originalTitle: "Washington Crossing the Delaware",
    artist: "엠마누엘 로이체",
    artistLifespan: "1816 ~ 1868",
    year: "1851년",
    movement: "낭만주의 역사화",
    medium: "캔버스에 유채",
    dimensions: "378.5 × 647.7 cm",
    estimatedValueText: "약 4,500억 원 (메트로폴리탄 대표작)",
    estimatedValueBillionKrw: 4500,
    valuationBasis: "미국 독립전쟁을 상징하는 6.4m 초대형 국보급 대작 (2022년 소규모 습작만 600억 원 낙찰)",
    imageUrl: "/world-art/paintings/washington_delaware.jpg",
    palette: ["#1e293b", "#64748b", "#f8fafc"],
    motif: "liberty",
    docentScript:
      "1776년 크리스마스 밤, 조지 워싱턴 장군이 유빙이 떠다니는 델라웨어강을 건너 기습 작전을 감행하는 극적인 순간을 가로 6.5m의 거대한 캔버스에 담아낸 아메리카 미술의 상징입니다.",
    vipBehindStory:
      "독일 뒤셀도르프에서 제작된 첫 번째 원본은 제2차 세계대전 당시 영국군의 공습으로 불타 소실되었고, 다행히 화가가 직후에 다시 그린 두 번째 대작이 뉴욕 메트로폴리탄 미술관에 무사히 전해졌습니다.",
    secretPoints: [
      {
        id: "wd_1",
        x: 36,
        y: 36,
        label: "뱃머리에 선 조지 워싱턴",
        detail: "거센 눈보라와 얼음 조각 속에서도 흔들림 없이 정면을 응시하는 초대 대통령 워싱턴의 결연한 옆모습입니다.",
      },
      {
        id: "wd_2",
        x: 24,
        y: 66,
        label: "얼음을 밀어내는 병사들의 노",
        detail: "스코틀랜드 모자, 원주민 복장, 흑인 병사 등 다양한 배경의 이민자들이 한 배를 타고 얼음을 깨며 전진합니다.",
      },
      {
        id: "wd_3",
        x: 45,
        y: 25,
        label: "성조기와 새벽의 샛별",
        detail: "먹구름 사이로 빛나는 새벽별과 펄럭이는 성조기가 절망적인 전세를 뒤집는 승리의 서막을 암시합니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "거센 얼음 강물도 당신의 결단력을 막을 수 없습니다. 정면 돌파가 큰 승리를 부릅니다!",
    },
  },

  // 4. 시카고 미술관 - 그랑드 자트 섬의 일요일 오후
  {
    id: "sunday_grande_jatte",
    museumId: "chicago_aic",
    title: "그랑드 자트 섬의 일요일 오후",
    originalTitle: "A Sunday on La Grande Jatte",
    artist: "조르주 쇠라",
    artistLifespan: "1859 ~ 1891",
    year: "1884 ~ 1886년",
    movement: "신인상주의 (점묘파)",
    medium: "캔버스에 유채",
    dimensions: "207.5 × 308.1 cm",
    estimatedValueText: "약 9,500억 원 (시카고 미술관 영구 소장)",
    estimatedValueBillionKrw: 9500,
    valuationBasis: "프랑스 정부가 백지 수표로 환수를 시도했으나 시카고 미술관이 거절한 불멸의 점묘화",
    imageUrl: "/world-art/paintings/sunday_grande_jatte.jpg",
    palette: ["#166534", "#fde047", "#3b82f6"],
    motif: "water_lilies",
    docentScript:
      "물감을 팔레트에서 섞지 않고 수백만 개의 순색 점(Dot)을 캔버스에 촘촘히 찍어, 관람자의 망막에서 색이 혼합되도록 설계한 '점묘법(Pointillism)'의 최고 걸작입니다. 파리 센강변의 평화로운 일요일 오후가 영원한 정적 속에 멈춰 있습니다.",
    vipBehindStory:
      "쇠라는 2년 동안 매일 아침 강변에 나가 풍경을 스케치하고 오후에는 작업실에서 수백만 개의 점을 찍었습니다. 현대 디지털 모니터의 픽셀(RGB) 원리를 19세기에 이미 회화로 구현한 선구적 작품입니다.",
    secretPoints: [
      {
        id: "sgj_1",
        x: 78,
        y: 56,
        label: "양산을 든 여인과 애완 원숭이",
        detail: "오른쪽 산책하는 부부의 발밑을 확대해 보면 강아지뿐만 아니라 목줄을 한 작은 원숭이가 함께 산책하고 있는 위트 있는 디테일이 보입니다!",
      },
      {
        id: "sgj_2",
        x: 49,
        y: 52,
        label: "정면을 바라보는 흰 옷의 소녀",
        detail: "그림 속 40여 명의 인물 중 유일하게 관람객을 정면으로 응시하며 화면 전체의 중심축을 잡아주는 인물입니다.",
      },
      {
        id: "sgj_3",
        x: 22,
        y: 78,
        label: "수백만 개의 보색 점묘 터치",
        detail: "초록 잔디밭 위에 노란색과 파란색, 보라색 점들을 나란히 찍어 햇살의 눈부신 진동을 과학적으로 재현했습니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "작은 점들이 모여 위대한 명작이 되듯, 당신의 성실한 하루하루가 빛나는 결실을 맺습니다.",
    },
  },

  // 5. 시카고 미술관 - 아메리칸 고딕
  {
    id: "american_gothic",
    museumId: "chicago_aic",
    title: "아메리칸 고딕",
    originalTitle: "American Gothic",
    artist: "그랜트 우드",
    artistLifespan: "1891 ~ 1942",
    year: "1930년",
    movement: "미국 지역주의 (Regionalism)",
    medium: "비aver 보드에 유채",
    dimensions: "78 × 65.3 cm",
    estimatedValueText: "약 4,200억 원 (미국 팝컬처 아이콘)",
    estimatedValueBillionKrw: 4200,
    valuationBasis: "모나리자·절규와 함께 세계에서 가장 많이 패러디된 20세기 미국 회화 최고작",
    imageUrl: "/world-art/paintings/american_gothic.jpg",
    palette: ["#78350f", "#eab308", "#1e293b"],
    motif: "arnolfini",
    docentScript:
      "대공황 시기 미국 중서부 아이오와주의 고딕 양식 목조 주택 앞에서 삼지창을 든 농부와 그의 딸을 정밀하게 묘사한 작품입니다. 금욕적이면서도 굳건한 개척 정신을 상징하며 미국인이 가장 사랑하는 초상화가 되었습니다.",
    vipBehindStory:
      "많은 사람이 그림 속 두 사람을 부부로 오해하지만, 실제 모델은 화가 그랜트 우드의 여동생(난 우드)과 화가의 단골 치과의사(바이런 맥키비 박사)였습니다!",
    secretPoints: [
      {
        id: "ag_1",
        x: 72,
        y: 65,
        label: "삼지창과 청바지 스티치의 반복",
        detail: "농부가 쥔 삼지창의 세 갈래 선이 그의 멜빵바지 줄무늬와 셔츠, 심지어 2층 고딕 창문 모양과 완벽한 대구를 이룹니다.",
      },
      {
        id: "ag_2",
        x: 50,
        y: 18,
        label: "아이오와 카펜터 고딕 창문",
        detail: "화가가 아이오와주 엘던 마을을 지나다 발견한 실제 하얀 목조 주택의 아치형 고딕 창문이 이 그림의 제목이 되었습니다.",
      },
      {
        id: "ag_3",
        x: 31,
        y: 38,
        label: "풀린 머리칼 한 가닥과 카메오 브로치",
        detail: "단정하게 묶은 여인의 금발 귀 옆으로 살짝 삐져나온 머리칼 한 가닥이 엄격한 분위기 속에 인간적인 숨결을 불어넣습니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "흔들리지 않는 기본기와 뚝심이 결국 가장 단단한 자산과 성공을 만들어 줍니다.",
    },
  },

  // 6. 워싱턴 NGA - 양산을 쓴 여인
  {
    id: "woman_parasol",
    museumId: "dc_nga",
    title: "양산을 쓴 여인 (모네 부인과 아들)",
    originalTitle: "Woman with a Parasol - Madame Monet and Her Son",
    artist: "클로드 모네",
    artistLifespan: "1840 ~ 1926",
    year: "1875년",
    movement: "인상주의",
    medium: "캔버스에 유채",
    dimensions: "100 × 81 cm",
    estimatedValueText: "약 4,800억 원 (워싱턴 NGA 대표작)",
    estimatedValueBillionKrw: 4800,
    valuationBasis: "모네가 사랑한 아내 카미유의 생전 모습을 담은 가장 빛나는 야외 인물화",
    imageUrl: "/world-art/paintings/woman_parasol.jpg",
    palette: ["#38bdf8", "#f8fafc", "#4ade80"],
    motif: "water_lilies",
    docentScript:
      "아르장퇴유 언덕 위에서 여름 바람에 흩날리는 하얀 드레스와 초록빛 양산을 든 아내 카미유, 그리고 7살 아들 장을 아래에서 올려다보는 시선으로 포착한 인상주의의 찬란한 순간입니다.",
    vipBehindStory:
      "모네는 스튜디오가 아닌 야외 언덕에서 단 몇 시간 만에 이 작품을 단숨에 완성했습니다. 바람의 속도감과 햇살의 역광을 그대로 붙잡기 위해 빠른 붓질로 구름과 풀잎을 그렸습니다.",
    secretPoints: [
      {
        id: "wp_1",
        x: 56,
        y: 22,
        label: "초록빛이 투과된 양산 안쪽",
        detail: "아래쪽 초원 풀밭에서 반사된 초록빛이 양산 안쪽과 카미유의 얼굴 그림자에 스며든 모네 특유의 색채 관찰력이 돋보입니다.",
      },
      {
        id: "wp_2",
        x: 42,
        y: 52,
        label: "바람에 휘감기는 베일과 드레스",
        detail: "소용돌이치는 흰색과 하늘색 붓터치만으로 여름날 언덕을 스치는 시원한 바람을 시각적으로 느끼게 해줍니다.",
      },
      {
        id: "wp_3",
        x: 24,
        y: 66,
        label: "언덕 너머로 바라보는 아들 장",
        detail: "풀꽃 사이에 서서 아버지 모네를 가만히 바라보는 어린 아들 장의 귀여운 눈동자가 가족의 따뜻한 사랑을 전합니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "기분 좋은 산들바람처럼 설레는 인연과 따뜻한 행복이 당신의 일상으로 불어옵니다.",
    },
  },

  // 7. 멕시코시티 - 멕시코 계곡
  {
    id: "mexican_valley",
    museumId: "mexico_bellas",
    title: "산타 이사벨 언덕에서 본 멕시코 계곡",
    originalTitle: "The Valley of Mexico from the Santa Isabel Mountain Range",
    artist: "호세 마리아 벨라스코",
    artistLifespan: "1840 ~ 1912",
    year: "1877년",
    movement: "멕시코 낭만주의 풍경화",
    medium: "캔버스에 유채",
    dimensions: "160.5 × 229.7 cm",
    estimatedValueText: "약 1,900억 원 (멕시코 국가 예술유산)",
    estimatedValueBillionKrw: 1900,
    valuationBasis: "파리 만국박람회 수상작이자 중남미 풍경화의 최고봉으로 꼽히는 국보급 대작",
    imageUrl: "/world-art/paintings/mexican_valley.jpg",
    palette: ["#0284c7", "#eab308", "#78350f"],
    motif: "inwang",
    docentScript:
      "해발 2,200m의 광활한 멕시코 고원과 만년설이 덮인 포포카테페틀·이스타시우아틀 쌍둥이 화산, 그리고 고대 아즈텍의 수도였던 텍스코코 호수를 독수리의 시선으로 담아낸 장엄한 대작입니다.",
    vipBehindStory:
      "벨라스코는 단순한 화가가 아니라 식물학·지질학·광학을 연구한 과학자였습니다. 이 그림 속 암석과 용설란 식물, 구름의 층위는 실제 지질학적 조사와 완벽히 일치합니다.",
    secretPoints: [
      {
        id: "mv_1",
        x: 34,
        y: 38,
        label: "만년설의 포포카테페틀 화산",
        detail: "아즈텍 신화에서 전사와 공주의 사랑 전설이 깃든 멕시코의 영산 두 봉우리가 투명한 대기 원근법 속에 빛납니다.",
      },
      {
        id: "mv_2",
        x: 56,
        y: 52,
        label: "텍스코코 호수와 과달루페 성당",
        detail: "넓은 평원 한가운데 반짝이는 호수와 멕시코시티로 이어지는 고대 수로와 성당 건축물이 정교하게 묘사되어 있습니다.",
      },
      {
        id: "mv_3",
        x: 68,
        y: 78,
        label: "언덕을 오르는 원주민 모녀",
        detail: "웅장한 대자연의 스케일과 대비되는 전경의 원주민 가족이 대지의 평화로움과 삶의 온기를 더해줍니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "높은 산에 오르면 시야가 트이듯, 큰 그림을 보는 당신에게 드넓은 기회가 열립니다.",
    },
  },

  // 8. 상파울루 MASP - 라파엘로 그리스도의 부활
  {
    id: "raphael_resurrection",
    museumId: "saopaulo_masp",
    title: "그리스도의 부활 (킨케이드의 라파엘로)",
    originalTitle: "Resurrection of Christ",
    artist: "라파엘로 산치오",
    artistLifespan: "1483 ~ 1520",
    year: "1499 ~ 1502년경",
    movement: "이탈리아 르네상스",
    medium: "나무판에 유채",
    dimensions: "52 × 44 cm",
    estimatedValueText: "약 3,800억 원 (남반구 유일의 라파엘로 진품)",
    estimatedValueBillionKrw: 3800,
    valuationBasis: "남반구 대륙 전체에서 유일하게 미술관이 소장 중인 르네상스 3대 거장 라파엘로의 진품 회화",
    imageUrl: "/world-art/paintings/raphael_resurrection.jpg",
    palette: ["#dc2626", "#facc15", "#1d4ed8"],
    motif: "birth_of_venus",
    docentScript:
      "르네상스 천재 화가 라파엘로가 10대 후반에 그린 초기 걸작으로, 찬란한 황금빛 새벽하늘 아래 두 천사 사이로 떠오르는 부활의 순간과 놀라 쓰러지는 병사들의 역동적인 신체 움직임이 보석 같은 색채로 빛납니다.",
    vipBehindStory:
      "1954년 상파울루 미술관(MASP) 창립자 피에트로 마리아 바르디가 런던에서 이 작품을 매입할 당시 유럽 미술계는 남미로 라파엘로 진품이 건너간다는 사실에 큰 충격을 받았습니다.",
    secretPoints: [
      {
        id: "rr_1",
        x: 50,
        y: 28,
        label: "붉은 망토와 승리의 깃발",
        detail: "무중력 상태로 공중에 떠오른 인물 주변으로 대칭을 이루는 두 천사가 완벽한 기하학적 조화를 보여줍니다.",
      },
      {
        id: "rr_2",
        x: 28,
        y: 74,
        label: "놀라 뒤로 젖혀진 로마 병사",
        detail: "갑작스러운 빛에 눈이 부셔 손을 들어 올리는 병사들의 생생한 동세에서 젊은 라파엘로의 천재적 데생력이 드러납니다.",
      },
      {
        id: "rr_3",
        x: 78,
        y: 48,
        label: "움브리아 지방의 새벽 풍경",
        detail: "배경의 잔잔한 언덕과 새벽빛 그라데이션은 스승 페루지노의 화풍을 넘어선 라파엘로만의 서정미를 담고 있습니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "어려움을 딛고 새롭게 도약하는 부활의 에너지처럼, 막혔던 일이 시원하게 풀립니다!",
    },
  },

  // 9. 서울 간송미술관 - 신윤복 미인도
  {
    id: "miindo",
    museumId: "seoul_kansong",
    title: "미인도 (혜원 신윤복)",
    originalTitle: "Portrait of a Beauty (美人圖)",
    artist: "신윤복 (혜원)",
    artistLifespan: "1758 ~ 미상",
    year: "조선 후기 (18세기 말)",
    movement: "조선 후기 진경·풍속화",
    medium: "비단에 채색 (견본채색)",
    dimensions: "114.2 × 45.7 cm",
    estimatedValueText: "약 5,000억 원 이상 (대한민국 보물 · 국보급 비매품)",
    estimatedValueBillionKrw: 5000,
    valuationBasis: "동양 인물화의 정수 · 한국의 모나리자로 불리는 조선 미인도의 최고봉",
    imageUrl: "/world-art/paintings/miindo.jpg",
    palette: ["#e7d8b9", "#1e3a5f", "#991b1b"],
    motif: "miindo",
    docentScript:
      "풍성한 트레머리와 갸름한 얼굴, 살짝 머금은 미소, 그리고 유려하게 흘러내리는 쪽빛 치마폭까지 조선 시대 여인의 기품과 아름다움을 극치로 끌어올린 한국 미술사 최고의 초상화입니다.",
    vipBehindStory:
      "일제강점기 해외로 반출될 뻔한 이 작품을 간송 전형필 선생이 거금을 주고 되찾아와 우리 곁에 남겼습니다. 머리카락 한 올까지 세필 붓으로 수백 번 그어 완성한 초정밀 채색화입니다.",
    secretPoints: [
      {
        id: "md_1",
        x: 50,
        y: 21,
        label: "초승달 눈썹과 앵두빛 입술",
        detail: "가늘고 고운 눈매와 살포시 다문 붉은 입술에서 단아하면서도 매혹적인 조선 여인의 생동감이 느껴집니다.",
      },
      {
        id: "md_2",
        x: 52,
        y: 35,
        label: "자주색 고름과 삼회장저고리",
        detail: "짧고 꼭 맞는 저고리와 만지작거리는 자주색 옷고름, 살짝 드러난 붉은 속고름이 세련된 배색 감각을 보여줍니다.",
      },
      {
        id: "md_3",
        x: 50,
        y: 66,
        label: "구름처럼 부풀어 오른 쪽빛 치마",
        detail: "옅은 먹선과 은은한 청색 바림으로 치마 주름의 풍성한 볼륨감을 우아하게 살려냈습니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "은은하면서도 잊히지 않는 당신만의 품격과 매력이 주변 사람들의 시선을 사로잡습니다.",
    },
  },

  // 10. 서울 국립중앙박물관/간송 - 정선 인왕제색도
  {
    id: "inwang_jesaekdo",
    museumId: "seoul_kansong",
    title: "인왕제색도 (국보 제216호)",
    originalTitle: "Inwang Jesaekdo (Clearing after Rain on Mt. Inwang)",
    artist: "정선 (겸재)",
    artistLifespan: "1676 ~ 1759",
    year: "1751년 (영조 27년)",
    movement: "조선 후기 진경산수화",
    medium: "종이에 수묵 (지본수묵)",
    dimensions: "79.2 × 138.2 cm",
    estimatedValueText: "약 7,000억 원 이상 (대한민국 국보 제216호)",
    estimatedValueBillionKrw: 7000,
    valuationBasis: "고(故) 이건희 회장 기증품 중 최고 걸작으로 평가받는 겸재 정선 진경산수화의 정점",
    imageUrl: "/world-art/paintings/inwang_jesaekdo.jpg",
    palette: ["#1c1917", "#78716c", "#f5f5f4"],
    motif: "inwang",
    docentScript:
      "여름날 소나기가 쏟아진 직후, 비에 젖어 검게 빛나는 인왕산의 거대한 화강암 바위 봉우리와 골짜기에서 피어오르는 하얀 물안개를 과감한 붓질로 단숨에 그려낸 조선 진경산수화의 불멸의 명작입니다.",
    vipBehindStory:
      "76세의 노대가 정선이 평생의 절친이었던 시인 이병연이 위독하다는 소식을 듣고, 비가 개인 인왕산처럼 친구의 병이 깨끗이 낫기를 기원하며 혼신을 다해 그린 우정의 그림입니다.",
    secretPoints: [
      {
        id: "ij_1",
        x: 48,
        y: 35,
        label: "비에 젖은 거대한 검은 암봉",
        detail: "큰 붓에 짙은 먹을 듬뿍 묻혀 위에서 아래로 힘차게 쓸어내린 '적묵법'으로 인왕산 바위의 압도적인 중량감을 표현했습니다.",
      },
      {
        id: "ij_2",
        x: 52,
        y: 65,
        label: "골짜기를 감싸는 하얀 비안개",
        detail: "검은 바위와 극적인 흑백 대비를 이루는 하얀 안개 여백이 산 전체가 살아 숨 쉬는 듯한 청량감을 선사합니다.",
      },
      {
        id: "ij_3",
        x: 78,
        y: 84,
        label: "산자락 아래 친구 이병연의 기와집",
        detail: "오른쪽 아래 작은 기와집과 산길을 걸어가는 인물을 통해 대자연 속에 깃든 선비의 삶과 우정을 담아냈습니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "비 온 뒤 땅이 굳고 맑은 산빛이 드러나듯, 걱정이 씻겨 나가고 든든한 기운이 차오릅니다.",
    },
  },

  // 11. 도쿄 국립박물관 - 가나가와 해변의 높은 파도 아래
  {
    id: "great_wave",
    museumId: "tokyo_tnm",
    title: "가나가와 해변의 높은 파도 아래",
    originalTitle: "The Great Wave off Kanagawa",
    artist: "가쓰시카 호쿠사이",
    artistLifespan: "1760 ~ 1849",
    year: "1831년경",
    movement: "에도 시대 우키요에 목판화",
    medium: "다색 목판화 (니시키에)",
    dimensions: "25.7 × 37.8 cm",
    estimatedValueText: "약 40억 원 (초판본 1점 경매 최고가 기준)",
    estimatedValueBillionKrw: 4,
    valuationBasis: "2023년 크리스티 뉴욕 경매에서 초판본 1점이 276만 달러(약 38억 원)에 낙찰된 세계 최고가 판화",
    imageUrl: "/world-art/paintings/great_wave.jpg",
    palette: ["#1e3a8a", "#93c5fd", "#fef3c7"],
    motif: "great_wave",
    docentScript:
      "거대한 파도가 발톱을 세운 듯 솟구치며 세 척의 고깃배를 덮치려는 찰나와, 그 파도 능선 너머로 고요히 서 있는 눈 덮인 후지산을 극적인 원근법으로 대비시킨 세계에서 가장 유명한 동양 판화입니다.",
    vipBehindStory:
      "당시 일본에 갓 수입된 유럽산 화학 안료 '프러시안 블루(베로 아이)'를 사용해 이전 목판화에서는 볼 수 없었던 깊고 강렬한 코발트빛 바다를 탄생시켰습니다. 고흐와 드뷔시가 자신의 작업실에 걸어두고 극찬한 작품입니다.",
    secretPoints: [
      {
        id: "gw_1",
        x: 34,
        y: 28,
        label: "발톱처럼 부서지는 파도 물보라",
        detail: "하얗게 부서지는 파도 끝의 포말들이 마치 살아있는 바다 괴물의 발톱처럼 역동적인 프랙탈 곡선을 그립니다.",
      },
      {
        id: "gw_2",
        x: 56,
        y: 74,
        label: "파도 속에 몸을 숙인 뱃사공들",
        detail: "거대한 파도 골짜기 사이에 세 척의 빠른 운반선(오시아게부네)과 노를 꼭 잡고 버티는 사공들이 숨어 있습니다!",
      },
      {
        id: "gw_3",
        x: 72,
        y: 78,
        label: "파도처럼 작아진 원경의 후지산",
        detail: "거대한 파도의 곡선 프레임 한가운데에 눈 덮인 후지산을 작게 배치해 흔들리지 않는 중심을 잡았습니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "거센 파도가 몰아쳐도 결국 파도를 타고 넘는 사람이 주인공이 됩니다. 과감히 도전하세요!",
    },
  },

  // 12. 타이베이 국립고궁박물원 - 범관 계산행려도
  {
    id: "travelers_mountains",
    museumId: "taipei_npm",
    title: "계산행려도 (북송 산수화의 신품)",
    originalTitle: "Travelers Among Mountains and Streams (谿山行旅圖)",
    artist: "범관 (范寬)",
    artistLifespan: "950 ~ 1032년경",
    year: "1000년경 (북송 시대)",
    movement: "북송 시대 대관 산수화",
    medium: "비단에 수묵 (견본수묵)",
    dimensions: "206.3 × 103.3 cm",
    estimatedValueText: "약 1조 원 이상 (대만 최고 국보 · 해외 반출 금지)",
    estimatedValueBillionKrw: 10000,
    valuationBasis: "동양 산수화 1,000년 역사상 단 하나의 최고 걸작으로 꼽히는 대만 국립고궁박물원 제1호 진보",
    imageUrl: "/world-art/paintings/travelers_mountains.jpg",
    palette: ["#292524", "#78716c", "#d6d3d1"],
    motif: "inwang",
    docentScript:
      "화면의 3분의 2를 압도적으로 채운 거대한 주봉(主峰)과 폭포에서 떨어지는 물줄기, 그리고 산비탈 아랫길을 걸어가는 손톱만 한 나귀 행렬을 통해 대자연의 영원함과 인간 존재의 겸허함을 일깨우는 천년의 명작입니다.",
    vipBehindStory:
      "오랫동안 화가의 서명이 없는 무관(無款) 작품으로 알려졌으나, 1958년 고궁박물원 학예사가 돋보기로 오른쪽 아래 나귀 몰이꾼 뒤의 나뭇잎 수풀을 조사하던 중 나뭇잎 사이에 정교하게 숨겨진 '范寬(범관)' 두 글자 친필 서명을 발견해 세계 미술계를 뒤집어 놓았습니다!",
    secretPoints: [
      {
        id: "tm_1",
        x: 50,
        y: 28,
        label: "빗방울처럼 찍어낸 우점준 암벽",
        detail: "수만 번의 붓끝 점으로 바위의 거친 질감을 표현한 '우점준(雨點皴)' 기법이 천 년 전 산의 숨결을 그대로 전합니다.",
      },
      {
        id: "tm_2",
        x: 78,
        y: 45,
        label: "절벽 틈을 가르는 은빛 폭포",
        detail: "어두운 암벽 사이로 한 줄기 가늘고 곧은 흰 선으로 떨어지는 폭포수가 정적인 산에 생동감 넘치는 물소리를 불어넣습니다.",
      },
      {
        id: "tm_3",
        x: 74,
        y: 88,
        label: "나귀 행렬과 나뭇잎 속 숨은 서명",
        detail: "오른쪽 아래 작은 나귀 대열 뒤쪽 수풀 속에 화가 범관의 친필 서명이 950년 동안 비밀처럼 숨겨져 있었습니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "천 년을 버틴 태산처럼 흔들리지 않는 평온함과 깊은 지혜가 당신의 마음을 지켜줍니다.",
    },
  },

  // 13. 뉴델리 인도 국립미술관 - 사쿤탈라
  {
    id: "shakuntala_varma",
    museumId: "delhi_national",
    title: "사쿤탈라 (사랑의 뒤돌아봄)",
    originalTitle: "Shakuntala Looking Back for Dushyanta",
    artist: "라자 라비 바르마",
    artistLifespan: "1848 ~ 1906",
    year: "1870년",
    movement: "인도 근대 낭만주의 회화",
    medium: "캔버스에 유채",
    dimensions: "120 × 84 cm",
    estimatedValueText: "약 850억 원 (인도 국가 지정 예술보물)",
    estimatedValueBillionKrw: 850,
    valuationBasis: "인도 정부가 국외 반출을 엄격히 금지한 9대 국보 화가 라자 라비 바르마의 대표작",
    imageUrl: "/world-art/paintings/shakuntala_varma.jpg",
    palette: ["#b45309", "#15803d", "#fde047"],
    motif: "birth_of_venus",
    docentScript:
      "인도 고전 시인 칼리다사의 희곡 속 여주인공 사쿤탈라가 숲속에서 만난 두샨타 왕을 한 번 더 바라보고 싶어, 발에 가시가 박힌 척 멈춰 서서 뒤돌아보는 설레는 사랑의 순간을 포착한 인도 근대 회화의 걸작입니다.",
    vipBehindStory:
      "인도 케랄라 왕족 출신이었던 바르마는 유럽의 유화 기법과 원근법을 독학으로 익혀 인도 신화와 서사시 속 인물들에게 살아 숨 쉬는 입체감을 부여함으로써 인도인들의 시각 문화를 완전히 바꾸어 놓았습니다.",
    secretPoints: [
      {
        id: "sv_1",
        x: 48,
        y: 28,
        label: "연인을 향한 애틋한 눈빛",
        detail: "고개를 살짝 돌려 뒤쪽의 왕을 바라보는 사쿤탈라의 눈동자에 설렘과 수줍음이 동시에 담겨 있습니다.",
      },
      {
        id: "sv_2",
        x: 62,
        y: 75,
        label: "발바닥 가시를 빼는 척하는 손길",
        detail: "실제로는 가시가 박히지 않았지만 걸음을 멈추기 위해 발을 어루만지는 섬세한 손끝 연기가 미소를 자아냅니다.",
      },
      {
        id: "sv_3",
        x: 32,
        y: 55,
        label: "황금빛 사리와 열대 숲의 조화",
        detail: "전통 사리 복식의 우아한 주름과 인도 남부의 울창한 숲 풍경이 유화의 풍부한 색감으로 빛납니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "사소한 순간에도 당신을 돌아보게 만드는 특별한 인연과 로맨틱한 행운이 다가옵니다.",
    },
  },

  // 14. 카이로 이집트 박물관 - 투탕카멘의 황금 마스크
  {
    id: "mask_tutankhamun",
    museumId: "cairo_gem",
    title: "투탕카멘의 황금 마스크",
    originalTitle: "Mask of Tutankhamun",
    artist: "고대 이집트 제18왕조 왕실 공방",
    artistLifespan: "기원전 1323년경",
    year: "기원전 1323년경 (신왕국 시대)",
    movement: "고대 이집트 왕실 황금 미술",
    medium: "순금, 청금석, 홍옥수, 터키석, 흑요석",
    dimensions: "54 × 39.3 cm (무게 10.23 kg)",
    estimatedValueText: "환산 불가 (인류 고고학 최고 가치 유물 · 약 5조 원 이상 추정)",
    estimatedValueBillionKrw: 50000,
    valuationBasis: "이집트 정부 해외 대여 영구 금지 제1호 유물 · 3,300년 전 고대 문명의 정점",
    imageUrl: "/world-art/paintings/mask_tutankhamun.jpg",
    palette: ["#eab308", "#1d4ed8", "#0f172a"],
    motif: "the_kiss",
    docentScript:
      "19세의 나이로 세상을 떠난 소년 파라오 투탕카멘의 미라 얼굴을 감싸고 있던 10.23kg의 순금 장례 마스크입니다. 변치 않는 황금의 살결과 깊고 푸른 청금석 눈매는 3,300년의 시간을 초월한 영원한 생명을 상징합니다.",
    vipBehindStory:
      "1922년 영국 고고학자 하워드 카터가 왕가의 계곡에서 도굴되지 않은 투탕카멘의 무덤(KV62)을 열었을 때, 촛불 불빛에 반사된 황금빛 유물들을 보고 '놀라운 것들이 보인다(Wonderful things!)'라고 외친 일화는 고고학 역사의 전설로 남아 있습니다.",
    secretPoints: [
      {
        id: "mt_1",
        x: 50,
        y: 16,
        label: "상·하 이집트를 수호하는 독수리와 코브라",
        detail: "이마 정중앙에 조각된 독수리 여신 네크베트와 코브라 여신 우아제트가 파라오의 절대 권력을 상징합니다.",
      },
      {
        id: "mt_2",
        x: 50,
        y: 38,
        label: "석영과 흑요석으로 빚은 살아있는 눈",
        detail: "흰 석영과 검은 흑요석을 박아 넣은 두 눈과 짙은 청금석 아이라인이 마치 살아 숨 쉬는 청년의 시선을 재현합니다.",
      },
      {
        id: "mt_3",
        x: 50,
        y: 78,
        label: "오시리스 신의 땋은 황금 턱수염",
        detail: "죽음과 부활의 신 오시리스와 하나가 되었음을 뜻하는 황금과 푸른 유리 세공 턱수염입니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "3,300년 동안 변치 않은 순금의 빛처럼, 당신에게 강력한 재물운과 영원한 품격이 깃듭니다.",
    },
  },

  // 15. 루브르 아부다비 - 다빈치 라 벨 페로니에르
  {
    id: "belle_ferronniere",
    museumId: "abudhabi_louvre",
    title: "라 벨 페로니에르 (밀라노 여인의 초상)",
    originalTitle: "La Belle Ferronnière",
    artist: "레오나르도 다 빈치",
    artistLifespan: "1452 ~ 1519",
    year: "1490 ~ 1496년경",
    movement: "전성기 르네상스",
    medium: "호두나무 판에 유채",
    dimensions: "62 × 44 cm",
    estimatedValueText: "약 6,500억 원 (루브르 & 아부다비 핵심 대작)",
    estimatedValueBillionKrw: 6500,
    valuationBasis: "전 세계에 15점뿐인 레오나르도 다 빈치의 진품 유화 중 하나 (살바토르 문디 6,000억 원 낙찰 기준)",
    imageUrl: "/world-art/paintings/belle_ferronniere.jpg",
    palette: ["#7f1d1d", "#090d16", "#fcd34d"],
    motif: "monalisa",
    docentScript:
      "다빈치가 밀라노 공작 궁정에 머물던 시절 그린 초상화로, 이마를 가로지르는 보석 머리띠(페로니에르)와 붉은 벨벳 드레스, 그리고 관람자의 눈을 살짝 비껴가는 듯한 매혹적이고 지적인 시선이 압권인 걸작입니다.",
    vipBehindStory:
      "하단 난간(파라펫)에 반사된 붉은 드레스의 미세한 빛 반사까지 계산한 다빈치의 과학적 광학 연구가 담겨 있으며, 루브르 아부다비 개관을 기념해 중동에서 가장 주목받은 대표 전시작입니다.",
    secretPoints: [
      {
        id: "bf_1",
        x: 49,
        y: 23,
        label: "이마 위의 보석 장식 페로니에르",
        detail: "가느다란 검은 끈에 매달린 루비 장식이 여인의 단정한 가르마와 백옥 같은 이마를 더욱 돋보이게 합니다.",
      },
      {
        id: "bf_2",
        x: 48,
        y: 34,
        label: "수수께끼 같은 옆눈길 시선",
        detail: "몸은 왼쪽을 향하고 고개와 눈동자는 정면 약간 오른쪽을 응시해, 관람객과 무언의 대화를 나누는 긴장감을 만듭니다.",
      },
      {
        id: "bf_3",
        x: 52,
        y: 72,
        label: "금실 리본으로 묶은 붉은 벨벳 소매",
        detail: "밀라노 궁정 패션의 정수를 보여주는 황금 매듭과 붉은 원단의 빛 반사가 돌난간 위에 은은하게 비칩니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "보석처럼 빛나는 지성과 우아한 카리스마가 중요한 자리에서 당신을 주인공으로 만들어 줍니다.",
    },
  },

  // 16. 멜버른 NGV - 율리시스와 세이렌
  {
    id: "ulysses_sirens",
    museumId: "melbourne_ngv",
    title: "율리시스와 세이렌",
    originalTitle: "Ulysses and the Sirens",
    artist: "존 윌리엄 워터하우스",
    artistLifespan: "1849 ~ 1917",
    year: "1891년",
    movement: "라파엘 전파 · 신고전주의",
    medium: "캔버스에 유채",
    dimensions: "100.6 × 202 cm",
    estimatedValueText: "약 1,200억 원 (호주 NGV 최고 인기작)",
    estimatedValueBillionKrw: 1200,
    valuationBasis: "1891년 멜버른 빅토리아 국립미술관이 인수한 이래 남반구에서 가장 사랑받는 서양 명화",
    imageUrl: "/world-art/paintings/ulysses_sirens.jpg",
    palette: ["#1e3a8a", "#b45309", "#f8fafc"],
    motif: "great_wave",
    docentScript:
      "호메로스의 《오디세이아》 신화 속 장면을 그린 작품입니다. 치명적인 노랫소리로 선원들을 유혹하는 반인반조(半人半鳥) 세이렌들의 노래를 직접 듣기 위해, 귀를 밀랍으로 막은 부하들에게 자신의 몸을 돛대에 꽁꽁 묶게 한 영웅 율리시스(오디세우스)의 극적인 모험을 묘사했습니다.",
    vipBehindStory:
      "일반적으로 세이렌을 인어로 그리는 후대 관습과 달리, 워터하우스는 고대 그리스 도자기 벽화를 고증하여 세이렌을 아름다운 여인의 얼굴과 독수리의 날개·발톱을 가진 고대 원형 그대로 재현해 당시 미술계의 극찬을 받았습니다.",
    secretPoints: [
      {
        id: "us_1",
        x: 42,
        y: 44,
        label: "돛대에 몸을 묶은 영웅 율리시스",
        detail: "유혹에 빠지지 않으면서도 미지의 세계를 경험하려는 인간 지성과 자제력의 상징으로 묘사되었습니다.",
      },
      {
        id: "us_2",
        x: 34,
        y: 55,
        label: "뱃전을 붙잡고 노래하는 세이렌",
        detail: "거문고(리라)를 연주하며 날개를 펼친 일곱 마리의 세이렌이 선원들의 코앞까지 날아와 유혹하는 긴박한 구도입니다.",
      },
      {
        id: "us_3",
        x: 58,
        y: 65,
        label: "귀를 밀랍으로 막고 노를 젓는 선원들",
        detail: "머리에 흰 천을 두르고 귀를 막은 채 오직 앞만 보며 필사적으로 노를 젓는 선원들의 근육과 표정이 생생합니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "어떠한 유혹이나 방해에도 흔들리지 않는 집중력이 당신을 목표의 항구로 완주하게 해줍니다!",
    },
  },

  // 17. 상트페테르부르크 에르미타주 - 렘브란트 돌아온 탕자
  {
    id: "prodigal_son",
    museumId: "hermitage_ru",
    title: "돌아온 탕자",
    originalTitle: "The Return of the Prodigal Son",
    artist: "렘브란트 반 레인",
    artistLifespan: "1606 ~ 1669",
    year: "1668년경",
    movement: "네덜란드 바로크 황금시대",
    medium: "캔버스에 유채",
    dimensions: "262 × 205 cm",
    estimatedValueText: "약 8,500억 원 (에르미타주 박물관 제1보물)",
    estimatedValueBillionKrw: 8500,
    valuationBasis: "렘브란트 생애 마지막 해에 완성된 인류 미술사상 가장 숭고한 용서와 치유의 대작",
    imageUrl: "/world-art/paintings/prodigal_son.jpg",
    palette: ["#451a03", "#b45309", "#facc15"],
    motif: "arnolfini",
    docentScript:
      "모든 재산을 탕진하고 거지꼴이 되어 돌아온 둘째 아들을 노년의 아버지가 두 손으로 따뜻하게 감싸 안는 순간입니다. 어둠 속에서 아버지의 붉은 망토와 아들의 등을 어루만지는 두 손에만 따스한 황금빛 조명이 내려앉아 보는 이의 눈시울을 적십니다.",
    vipBehindStory:
      "자세히 보면 아들의 등을 감싸 쥔 아버지의 두 손 모양이 서로 다릅니다! 왼손은 강인하고 투박한 남성의 손으로, 오른손은 가늘고 부드러운 어머니(여성)의 손으로 그려 부성애와 모성애를 동시에 표현했습니다.",
    secretPoints: [
      {
        id: "ps_1",
        x: 34,
        y: 48,
        label: "부성과 모성을 담은 비대칭 두 손",
        detail: "왼쪽 손은 든든하게 감싸는 아버지의 손, 오른쪽 손은 부드럽게 쓰다듬는 어머니의 손으로 묘사된 렘브란트의 깊은 철학입니다.",
      },
      {
        id: "ps_2",
        x: 26,
        y: 86,
        label: "벗겨진 낡은 신발과 상처 난 발바닥",
        detail: "달아오른 방황의 길을 걸어온 아들의 닳아빠진 신발 한 짝과 맨발이 고통스러웠던 여정을 말없이 보여줍니다.",
      },
      {
        id: "ps_3",
        x: 78,
        y: 46,
        label: "어둠 속에서 지켜보는 큰아들",
        detail: "오른쪽에서 팔짱을 낀 채 복잡한 표정으로 이 장면을 내려다보는 형의 모습까지 빛과 그림자로 깊이 있게 담아냈습니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "지난 실수나 피로를 따뜻하게 감싸 안아주는 깊은 위로와 평안이 당신의 마음에 찾아옵니다.",
    },
  },

  // 18. 파리 루브르 - 민중을 이끄는 자유의 여신
  {
    id: "liberty_leading",
    museumId: "louvre",
    title: "민중을 이끄는 자유의 여신",
    originalTitle: "Liberty Leading the People",
    artist: "외젠 들라크루아",
    artistLifespan: "1798 ~ 1863",
    year: "1830년",
    movement: "프랑스 낭만주의",
    medium: "캔버스에 유채",
    dimensions: "260 × 325 cm",
    estimatedValueText: "약 6,000억 원 (프랑스 공화국 상징 국보)",
    estimatedValueBillionKrw: 6000,
    valuationBasis: "프랑스 지폐 도안 및 자유의 여신상의 모티프가 된 루브르 박물관 대표 대작",
    imageUrl: "/world-art/paintings/liberty_leading.jpg",
    palette: ["#1e3a8a", "#dc2626", "#f59e0b"],
    motif: "liberty",
    docentScript:
      "1830년 파리 7월 혁명의 바리케이드 위에서 삼색기를 높이 치켜든 자유의 여신 '마리안'이 시민들을 이끌고 전진하는 드라마틱한 걸작입니다. 피라미드 구도와 강렬한 색채가 승리의 에너지를 뿜어냅니다.",
    vipBehindStory:
      "빅토르 위고의 소설 《레 미제라블》 속 소년 가브로슈의 실제 모티프가 바로 이 그림 오른쪽에서 두 자루의 권총을 들고 달려 나오는 소년이며, 왼쪽 실크해트를 쓴 신사는 화가 들라크루아 자신의 자화상이라는 설이 유명합니다.",
    secretPoints: [
      {
        id: "ll_1",
        x: 52,
        y: 22,
        label: "프랑스 삼색기와 프리기아 모자",
        detail: "여신이 쓴 붉은 고대 로마 해방 노예의 모자(프리기아 모자)와 청·백·적 삼색기가 자유와 평등을 상징합니다.",
      },
      {
        id: "ll_2",
        x: 74,
        y: 48,
        label: "양손에 권총을 든 용감한 소년",
        detail: "훗날 뮤지컬과 소설 《레 미제라블》의 캐릭터 가브로슈를 탄생시킨 파리의 어린 시민 영웅입니다.",
      },
      {
        id: "ll_3",
        x: 84,
        y: 52,
        label: "연기 너머로 보이는 노트르담 대성당",
        detail: "오른쪽 자욱한 포연 너머로 파리 노트르담 대성당의 두 탑이 희미하게 묘사되어 현장감을 극대화합니다.",
      },
    ],
    fortuneTag: {
      category: "명예·돌파운",
      blessing: "당신이 앞장서는 프로젝트와 리더십이 주변 사람들의 지지를 얻어 승리의 깃발을 꽂게 됩니다!",
    },
  },

  // 19. 파리 오르세 - 론강의 별이 빛나는 밤
  {
    id: "starry_rhone",
    museumId: "orsay",
    title: "론강의 별이 빛나는 밤",
    originalTitle: "Starry Night Over the Rhône",
    artist: "빈센트 반 고흐",
    artistLifespan: "1853 ~ 1890",
    year: "1888년 9월",
    movement: "후기 인상주의",
    medium: "캔버스에 유채",
    dimensions: "72.5 × 92 cm",
    estimatedValueText: "약 8,000억 원 (오르세 미술관 최고 인기작)",
    estimatedValueBillionKrw: 8000,
    valuationBasis: "고흐의 아를 시절 야경 연작 중 가장 서정적이고 완벽한 색채 대비를 보여주는 걸작",
    imageUrl: "/world-art/paintings/starry_rhone.jpg",
    palette: ["#0f172a", "#1e40af", "#facc15"],
    motif: "rhone_stars",
    docentScript:
      "남프랑스 아를의 론강 산책로에서 밤하늘의 북두칠성과 강물 위로 길게 일렁이는 노란 가스등 불빛을 그린 작품입니다. 고흐는 '밤이 낮보다 훨씬 더 다채롭고 살아있는 색으로 가득하다'며 밀짚모자에 촛불을 꽂고 이 야경을 완성했습니다.",
    vipBehindStory:
      "화면 오른쪽 아래 다정하게 팔짱을 끼고 걸어가는 연인을 그려 넣어, 외로웠던 고흐가 꿈꾸었던 따뜻한 사랑과 위로의 소망을 밤하늘의 별빛 속에 담아냈습니다.",
    secretPoints: [
      {
        id: "sr_1",
        x: 52,
        y: 22,
        label: "밤하늘에 빛나는 북두칠성",
        detail: "프러시안 블루와 코발트블루 하늘 위에 에메랄드빛과 레몬 옐로우로 일곱 개의 북두칠성 별자리를 선명하게 찍어냈습니다.",
      },
      {
        id: "sr_2",
        x: 45,
        y: 58,
        label: "론강 물결에 비친 황금 가스등 기둥",
        detail: "강변 도시의 가스등 불빛이 잔물결을 따라 황금빛 피아노 건반처럼 길게 반사되어 환상적인 분위기를 자아냅니다.",
      },
      {
        id: "sr_3",
        x: 78,
        y: 84,
        label: "강변을 산책하는 연인",
        detail: "전경의 작은 나룻배 옆으로 다정하게 걸어가는 두 연인이 푸른 밤풍경에 로맨틱한 온기를 불어넣습니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "잔잔한 강물 위에 비친 별빛처럼 낭만적인 만남과 마음 설레는 밤이 당신을 기다립니다.",
    },
  },

  // 20. 파리 오르세 - 이삭 줍는 여인들
  {
    id: "gleaners",
    museumId: "orsay",
    title: "이삭 줍는 여인들",
    originalTitle: "The Gleaners (Des glaneuses)",
    artist: "장프랑수아 밀레",
    artistLifespan: "1814 ~ 1875",
    year: "1857년",
    movement: "바르비종파 · 사실주의",
    medium: "캔버스에 유채",
    dimensions: "83.5 × 111 cm",
    estimatedValueText: "약 4,500억 원 (오르세 미술관 대표작)",
    estimatedValueBillionKrw: 4500,
    valuationBasis: "'만종'과 함께 밀레를 세계적인 거장으로 만든 리얼리즘 미술사의 기념비적 작품",
    imageUrl: "/world-art/paintings/gleaners.jpg",
    palette: ["#ca8a04", "#78350f", "#fef08a"],
    motif: "gleaners",
    docentScript:
      "추수가 끝난 바르비종 들판에서 떨어진 밀 이삭을 한 톨씩 줍는 세 여인의 모습을 숭고한 조각상처럼 묘사한 작품입니다. 황금빛 저녁 햇살 아래 정직한 노동의 가치와 인간의 존엄성을 따뜻하게 감싸 안았습니다.",
    vipBehindStory:
      "멀리 배경에는 말 탄 지주와 산더미처럼 쌓인 풍성한 곡식 단이 보이고, 앞쪽에는 떨어진 낱알을 줍는 가난한 여인들이 배치되어 1857년 파리 살롱전 공개 당시 귀족 사회에 큰 사회적 울림을 주었습니다.",
    secretPoints: [
      {
        id: "gl_1",
        x: 38,
        y: 66,
        label: "찾기·줍기·모으기 3단계 연속 동작",
        detail: "세 여인의 자세가 마치 슬로모션 영화처럼 '이삭을 찾고 → 손으로 줍고 → 허리를 펴 묶는' 연속 동작으로 설계되어 있습니다.",
      },
      {
        id: "gl_2",
        x: 78,
        y: 42,
        label: "원경의 거대한 짚단과 말 탄 감독관",
        detail: "지평선 근처의 풍요로운 수확 풍경이 전경의 여인들과 대비되면서도 황금빛 노을 속에 하나로 어우러집니다.",
      },
      {
        id: "gl_3",
        x: 50,
        y: 52,
        label: "지평선 아래로 배치된 여인들의 머리",
        detail: "세 여인의 머리가 모두 지평선보다 낮게 위치해 대지와 하나가 된 성실함과 겸손의 미학을 보여줍니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "작은 기회도 소중히 거두어들이는 당신의 정성이 결국 황금빛 들판 같은 큰 부를 이룹니다.",
    },
  },

  // 21. 파리 오랑주리 - 모네 수련
  {
    id: "water_lilies",
    museumId: "orsay",
    title: "수련 (지베르니의 빛의 정원)",
    originalTitle: "Water Lilies (Nymphéas)",
    artist: "클로드 모네",
    artistLifespan: "1840 ~ 1926",
    year: "1916 ~ 1919년경",
    movement: "인상주의",
    medium: "캔버스에 유채",
    dimensions: "200 × 180 cm (연작)",
    estimatedValueText: "약 1,500억 원 (연작 1점 경매가 기준)",
    estimatedValueBillionKrw: 1500,
    valuationBasis: "2018년 크리스티 경매에서 수련 연작 1점이 8,468만 달러(약 1,150억 원)에 낙찰",
    imageUrl: "/world-art/paintings/water_lilies.jpg",
    palette: ["#0f766e", "#3b82f6", "#f472b6"],
    motif: "water_lilies",
    docentScript:
      "모네가 생애 마지막 30년 동안 직접 가꾼 지베르니 정원의 연못을 그린 작품입니다. 지평선과 하늘을 과감히 생략하고 오직 수면 위에 비친 구름과 버드나무 그림자, 그리고 물 위에 피어난 수련 꽃잎만으로 무한한 우주를 창조했습니다.",
    vipBehindStory:
      "노년의 모네는 백내장으로 시력을 거의 잃어가는 고통 속에서도 물감 튜브의 라벨 순서와 붓의 감각을 기억해 이 찬란한 빛의 교향곡을 완성했습니다.",
    secretPoints: [
      {
        id: "wl_1",
        x: 64,
        y: 58,
        label: "수면 위에 뜬 분홍빛·흰빛 수련",
        detail: "물감을 두껍게 얹은 몇 번의 대담한 터치만으로 물 위에 둥실 떠 있는 수련 꽃잎의 생명력을 피워냈습니다.",
      },
      {
        id: "wl_2",
        x: 34,
        y: 35,
        label: "연못 속에 거꾸로 비친 하늘과 구름",
        detail: "하늘을 직접 그리지 않고도 수면의 보랏빛과 푸른빛 반영을 통해 연못 위 하늘의 날씨와 시간대를 느끼게 합니다.",
      },
      {
        id: "wl_3",
        x: 22,
        y: 72,
        label: "수직으로 드리운 수양버들 그림자",
        detail: "가로로 퍼지는 수련 잎과 수직으로 내려오는 버드나무 반영이 교차하며 화면에 깊은 공간감을 부여합니다.",
      },
    ],
    fortuneTag: {
      category: "치유·평온운",
      blessing: "고요한 연못 위에 피어난 수련처럼 복잡한 생각이 맑아지고 마음에 깊은 평화가 찾아옵니다.",
    },
  },

  // 22. 런던 내셔널 갤러리 - 고흐 해바라기
  {
    id: "sunflowers",
    museumId: "national_uk",
    title: "해바라기 (15송이 아를 연작)",
    originalTitle: "Sunflowers (Still Life: Vase with Fifteen Sunflowers)",
    artist: "빈센트 반 고흐",
    artistLifespan: "1853 ~ 1890",
    year: "1888년 8월",
    movement: "후기 인상주의",
    medium: "캔버스에 유채",
    dimensions: "92.1 × 73 cm",
    estimatedValueText: "약 3,500억 원 이상 (런던 내셔널 갤러리 1위)",
    estimatedValueBillionKrw: 3500,
    valuationBasis: "1987년 이미 당시 세계 최고가 경매 기록을 경신한 태양과 재물의 상징작",
    imageUrl: "/world-art/paintings/sunflowers.jpg",
    palette: ["#eab308", "#ca8a04", "#78350f"],
    motif: "sunflowers",
    docentScript:
      "고흐가 남프랑스 아를의 '노란 집'에 찾아올 동료 화가 폴 고갱의 방을 장식하기 위해 온 마음을 다해 그린 열다섯 송이의 해바라기입니다. 세 가지 다른 톤의 노란색만으로 눈부신 태양의 생명력과 감사의 마음을 폭발시켰습니다.",
    vipBehindStory:
      "고흐는 자신이 정말 만족한 작품에만 성(Van Gogh) 대신 이름인 'Vincent(빈센트)'를 서명했는데, 이 꽃병 한가운데 파란 물감으로 또렷하게 적힌 'Vincent'는 우정과 진심의 인장입니다.",
    secretPoints: [
      {
        id: "sf_1",
        x: 38,
        y: 74,
        label: "꽃병에 새겨진 푸른 서명 'Vincent'",
        detail: "외국인들이 자신의 성(반 고흐)을 발음하기 어려워하자, 누구에게나 친근한 친구로 불리고 싶어 남긴 이름 서명입니다.",
      },
      {
        id: "sf_2",
        x: 52,
        y: 35,
        label: "활짝 핀 꽃과 시든 꽃의 공존",
        detail: "만개한 꽃부터 꽃잎이 떨어진 씨방까지 한 화병에 함께 담아 생명의 순환과 시간의 깊이를 표현했습니다.",
      },
      {
        id: "sf_3",
        x: 50,
        y: 66,
        label: "노란색 위의 노란색 (크롬 옐로우)",
        detail: "19세기에 새로 발명된 크롬 옐로우 물감을 조각처럼 두껍게 발라 실제 꽃잎이 캔버스 밖으로 돋아난 듯한 질감을 만듭니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "황금빛 해바라기의 기운이 가득합니다! 뜻밖의 금전적 행운과 든든한 귀인이 찾아옵니다.",
    },
  },

  // 23. 런던 내셔널 갤러리 - 아르놀피니 부부의 초상
  {
    id: "arnolfini",
    museumId: "national_uk",
    title: "아르놀피니 부부의 초상",
    originalTitle: "The Arnolfini Portrait",
    artist: "얀 반 에이크",
    artistLifespan: "1390년경 ~ 1441",
    year: "1434년",
    movement: "북유럽 르네상스 (초기 플랑드르파)",
    medium: "오크 나무판에 유채",
    dimensions: "82.2 × 60 cm",
    estimatedValueText: "약 6,200억 원 (유화 기법 최초의 마스터피스)",
    estimatedValueBillionKrw: 6200,
    valuationBasis: "서양 미술사상 가장 치밀한 디테일과 상징이 숨겨진 북유럽 르네상스 최고 국보",
    imageUrl: "/world-art/paintings/arnolfini.jpg",
    palette: ["#14532d", "#7f1d1d", "#78350f"],
    motif: "arnolfini",
    docentScript:
      "벨기에 브뤼주에 머물던 이탈리아 상인 조반니 아르놀피니와 아내의 모습을 사진보다 더 정밀한 유화 기법으로 기록한 걸작입니다. 샹들리에의 촛불 하나, 바닥의 나막신, 강아지 털 한 올까지 모두 숨겨진 암호를 담고 있습니다.",
    vipBehindStory:
      "부부 뒤쪽 벽에 걸린 동그란 볼록거울을 확대해 보면, 부부의 뒷모습뿐만 아니라 문가에 서 있는 두 명의 증인(그중 한 명은 화가 얀 반 에이크 본인!)이 비치며, 거울 위 벽면에는 '얀 반 에이크가 이곳에 있었다(1434)'라는 라틴어 서명이 적혀 있습니다.",
    secretPoints: [
      {
        id: "ar_1",
        x: 50,
        y: 42,
        label: "벽면의 볼록거울과 화가의 서명",
        detail: "5cm 크기의 볼록거울 테두리에 예수의 수난 10장면이 세밀화로 그려져 있고, 거울 속에 방 안 전체와 화가 자신이 반사되어 있습니다!",
      },
      {
        id: "ar_2",
        x: 50,
        y: 16,
        label: "단 하나만 켜진 샹들리에 촛불",
        detail: "대낮인데도 왼쪽 위 샹들리에에 촛불이 하나 켜져 있는 것은 모든 것을 지켜보는 신의 현존과 영원한 서약을 의미합니다.",
      },
      {
        id: "ar_3",
        x: 47,
        y: 86,
        label: "충절과 신의를 상징하는 작은 강아지",
        detail: "부부 발치의 브뤼셀 그리폰 강아지는 털 한 올 한 올이 살아 움직일 듯 묘사되어 부부간의 변치 않는 신의를 상징합니다.",
      },
    ],
    fortuneTag: {
      category: "재물·성공운",
      blessing: "신뢰와 품격이 깃든 중요한 계약이나 파트너십이 성사되어 풍요로운 결실을 안겨줍니다.",
    },
  },

  // 24. 네덜란드 마우리츠하위스 - 진주 귀걸이를 한 소녀
  {
    id: "pearl_earring",
    museumId: "vangogh_nl",
    title: "진주 귀걸이를 한 소녀",
    originalTitle: "Girl with a Pearl Earring",
    artist: "요하네스 베르메르",
    artistLifespan: "1632 ~ 1675",
    year: "1665년경",
    movement: "네덜란드 바로크 황금시대",
    medium: "캔버스에 유채",
    dimensions: "44.5 × 39 cm",
    estimatedValueText: "약 7,500억 원 (네덜란드의 모나리자)",
    estimatedValueBillionKrw: 7500,
    valuationBasis: "전 세계에 30여 점뿐인 베르메르 진품 중 압도적 인지도 1위의 비매품 걸작",
    imageUrl: "/world-art/paintings/pearl_earring.jpg",
    palette: ["#090d16", "#1d4ed8", "#eab308"],
    motif: "pearl_earring",
    docentScript:
      "'북유럽의 모나리자'로 불리는 이 작품은 칠흑 같은 검은 배경 속에서 푸른 터번을 두른 소녀가 막 누군가에게 이름을 불린 듯 어깨너머로 뒤돌아보는 찰나를 포착한 빛의 마법입니다.",
    vipBehindStory:
      "놀랍게도 소녀의 귀에 걸린 커다란 진주는 귀와 연결된 고리가 아예 그려져 있지 않습니다! 단지 하얀 물감 두 번의 터치만으로 어둠 속에서 영롱하게 떠 있는 거대한 진주의 착시를 만들어낸 베르메르의 신기(神技)입니다.",
    secretPoints: [
      {
        id: "pe_1",
        x: 56,
        y: 52,
        label: "단 두 번의 붓터치로 빚은 진주",
        detail: "위쪽의 강렬한 흰색 하이라이트와 아래쪽 흰 옷깃이 반사된 은은한 빛만으로 완벽한 구형 진주의 입체감을 완성했습니다.",
      },
      {
        id: "pe_2",
        x: 52,
        y: 28,
        label: "금보다 비쌌던 천연 울트라마린 터번",
        detail: "아프가니스탄산 천연 청금석을 갈아 만든 최고급 울트라마린 블루 안료를 아낌없이 사용해 신비로운 푸른빛을 냅니다.",
      },
      {
        id: "pe_3",
        x: 42,
        y: 48,
        label: "살짝 벌어진 촉촉한 입술",
        detail: "입꼬리에 찍힌 작은 흰색 빛점이 소녀가 지금 막 무언가 말을 건네려는 듯한 생생한 현장감을 부여합니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "어둠 속의 진주처럼 단번에 시선을 사로잡는 당신의 매력이 빛을 발하는 날입니다.",
    },
  },

  // 25. 피렌체 우피치 - 비너스의 탄생
  {
    id: "birth_of_venus",
    museumId: "uffizi",
    title: "비너스의 탄생",
    originalTitle: "The Birth of Venus (La nascita di Venere)",
    artist: "산드로 보티첼리",
    artistLifespan: "1445 ~ 1510",
    year: "1485년경",
    movement: "초기 르네상스 (피렌체파)",
    medium: "캔버스에 템페라",
    dimensions: "172.5 × 278.9 cm",
    estimatedValueText: "약 9,000억 원 (이탈리아 국보 · 우피치 1위)",
    estimatedValueBillionKrw: 9000,
    valuationBasis: "르네상스 인문주의의 부활을 알린 이탈리아 최고 문화유산",
    imageUrl: "/world-art/paintings/birth_of_venus.jpg",
    palette: ["#0ea5e9", "#f472b6", "#fde047"],
    motif: "birth_of_venus",
    docentScript:
      "서풍의 신 제피로스의 숨결과 흩날리는 분홍 장미꽃 비 속에서 커다란 가리비 조개를 타고 키프로스 해안에 당도하는 미의 여신 비너스를 그린 르네상스의 찬가입니다.",
    vipBehindStory:
      "비너스의 금발 머리카락과 조개껍데기 테두리, 숲속 오렌지 나무의 잎사귀에는 실제 순금 가루가 칠해져 있어 우피치 미술관 조명 아래에서 은은한 금빛 아우라를 발산합니다.",
    secretPoints: [
      {
        id: "bv_1",
        x: 50,
        y: 42,
        label: "순금 가루로 빛나는 긴 금발",
        detail: "바람에 물결치는 비너스의 머리카락 결마다 실제 금분(Gold leaf) 하이라이트가 입혀져 신성한 아름다움을 강조합니다.",
      },
      {
        id: "bv_2",
        x: 22,
        y: 34,
        label: "서풍의 신 제피로스와 장미꽃 바람",
        detail: "고대 신화에서 사랑의 탄생을 축하하며 하늘에서 최초로 피어난 꽃인 분홍 장미가 바람을 타고 흩날립니다.",
      },
      {
        id: "bv_3",
        x: 78,
        y: 48,
        label: "봄꽃 망토를 건네는 계절의 여신 호라",
        detail: "수레국화와 데이지 꽃이 수놓아진 붉은 망토를 펼쳐 여신을 맞이하는 봄의 정령입니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "장미꽃 바람을 타고 온 비너스처럼 설레는 시작과 눈부신 아름다움이 당신과 함께합니다.",
    },
  },

  // 26. 빈 벨베데레 - 클림트 키스
  {
    id: "the_kiss",
    museumId: "belvedere",
    title: "키스 (황금 시대의 정점)",
    originalTitle: "The Kiss (Der Kuss)",
    artist: "구스타프 클림트",
    artistLifespan: "1862 ~ 1918",
    year: "1907 ~ 1908년",
    movement: "빈 분리파 · 아르누보",
    medium: "캔버스에 유채 및 순금박·은박·백금박",
    dimensions: "180 × 180 cm",
    estimatedValueText: "약 8,200억 원 (오스트리아 국보 제1호)",
    estimatedValueBillionKrw: 8200,
    valuationBasis: "1908년 전시가 끝나기도 전에 오스트리아 정부가 역대 최고가의 5배를 주고 즉시 매입한 국보",
    imageUrl: "/world-art/paintings/the_kiss.jpg",
    palette: ["#eab308", "#78350f", "#facc15"],
    motif: "the_kiss",
    docentScript:
      "야생화가 만발한 절벽 끝에서 황금빛 아우라에 감싸인 채 입을 맞추는 연인을 그린 클림트 '황금 시대'의 최고 걸작입니다. 금박 세공사의 아들이었던 클림트가 실제 순금박과 백금을 캔버스에 입혀 영원한 사랑의 황홀경을 완성했습니다.",
    vipBehindStory:
      "남성의 옷에는 강인한 흑백 직사각형 패턴을, 여성의 옷에는 부드러운 원형과 소용돌이 꽃무늬를 그려 넣었으며, 두 사람이 서 있는 절벽 끝은 위태로움 속에서 더욱 불타오르는 사랑의 절정을 의미합니다.",
    secretPoints: [
      {
        id: "tk_1",
        x: 48,
        y: 26,
        label: "두 손을 감싸 쥔 연인의 입맞춤",
        detail: "눈을 감고 평온하게 얼굴을 맡긴 여인과 그 뺨을 조심스럽게 감싼 남성의 손길에서 깊은 신뢰와 황홀함이 전해집니다.",
      },
      {
        id: "tk_2",
        x: 48,
        y: 55,
        label: "사각형(남성)과 원형(여성)의 황금 모자이크",
        detail: "서로 다른 두 기하학적 세계가 하나의 황금 망토 안에서 완전한 조화를 이루는 클림트만의 조형 언어입니다.",
      },
      {
        id: "tk_3",
        x: 56,
        y: 88,
        label: "꽃밭 절벽 끝을 움켜쥔 발가락",
        detail: "낭떠러지 끝에서 떨어지지 않으려는 듯 발가락에 힘을 준 디테일이 황홀경 속의 아찔한 긴장감을 더해줍니다.",
      },
    ],
    fortuneTag: {
      category: "사랑·매력운",
      blessing: "순금빛 아우라가 당신의 인간관계와 사랑을 감싸 안아 가장 빛나는 순간을 선물합니다.",
    },
  },

  // 27. 마드리드 프라도 - 시녀들
  {
    id: "las_meninas",
    museumId: "prado",
    title: "시녀들 (라스 메니나스)",
    originalTitle: "Las Meninas",
    artist: "디에고 벨라스케스",
    artistLifespan: "1599 ~ 1660",
    year: "1656년",
    movement: "스페인 바로크 황금시대",
    medium: "캔버스에 유채",
    dimensions: "318 × 276 cm",
    estimatedValueText: "약 9,800억 원 (스페인 왕실 최고 국보)",
    estimatedValueBillionKrw: 9800,
    valuationBasis: "피카소가 평생 58점의 변주곡을 그리며 경배한 서양 회화 구도의 최고봉",
    imageUrl: "/world-art/paintings/las_meninas.jpg",
    palette: ["#1c1917", "#78350f", "#fde68a"],
    motif: "las_meninas",
    docentScript:
      "스페인 마드리드 왕궁 작업실에서 어린 마르가리타 공주와 시녀들, 그리고 거대한 캔버스 앞에 서서 정면(관람객)을 바라보는 화가 벨라스케스 자신을 그린 시공간 초월의 걸작입니다.",
    vipBehindStory:
      "방 가장 안쪽 벽에 걸린 작은 거울 속에는 스페인 국왕 펠리페 4세와 왕비의 모습이 비치고 있습니다! 즉, 그림 속 모든 인물이 바라보고 있는 관람객의 자리가 바로 국왕 부부가 서 있던 자리라는 천재적인 1인칭 시점 트릭입니다.",
    secretPoints: [
      {
        id: "lm_1",
        x: 49,
        y: 66,
        label: "정면을 바라보는 마르가리타 공주",
        detail: "화사한 조명을 한 몸에 받는 5살 마르가리타 공주가 시녀들의 시중을 받으며 부모(국왕 부부)를 바라봅니다.",
      },
      {
        id: "lm_2",
        x: 24,
        y: 48,
        label: "붓을 들고 서 있는 벨라스케스 자화상",
        detail: "가슴에 스페인 최고 기사 작위인 산티아고 십자가 문장을 달고 관람객을 응시하는 궁정 화가 자신입니다.",
      },
      {
        id: "lm_3",
        x: 42,
        y: 44,
        label: "배경 거울 속에 비친 국왕과 왕비",
        detail: "저 멀리 벽면의 거울 속에 그림 밖 관람객의 위치에 서 있는 국왕 부부의 상반신이 또렷하게 반사되어 있습니다!",
      },
    ],
    fortuneTag: {
      category: "영감·창의운",
      blessing: "고정관념을 뒤집는 입체적인 시선과 아이디어가 당신을 업계의 독보적인 리더로 세워줍니다.",
    },
  },

  // 28. 오슬로 국립미술관 - 절규
  {
    id: "the_scream",
    museumId: "oslo_munch",
    title: "절규",
    originalTitle: "The Scream (Skrik)",
    artist: "에드바르 뭉크",
    artistLifespan: "1863 ~ 1944",
    year: "1893년",
    movement: "표현주의 선구작",
    medium: "판지에 템페라, 유채, 파스텔",
    dimensions: "91 × 73.5 cm",
    estimatedValueText: "약 1,700억 원 (2012년 파스텔 버전 경매가 기준)",
    estimatedValueBillionKrw: 1700,
    valuationBasis: "2012년 소더비 경매에서 파스텔 버전이 1억 1,992만 달러(약 1,650억 원)에 낙찰, 본 오슬로 제1원본은 비매품",
    imageUrl: "/world-art/paintings/the_scream.jpg",
    palette: ["#dc2626", "#f97316", "#1e293b"],
    motif: "scream",
    docentScript:
      "오슬로 에케베르그 언덕 다리 위에서 핏빛으로 물든 해 질 녘 하늘을 보며 '자연을 관통하는 거대하고 끝없는 절규'를 듣고 귀를 막은 순간을 그린 현대 표현주의의 출발점입니다.",
    vipBehindStory:
      "화면 왼쪽 위 붉은 구름 부분을 초고화질 적외선으로 확대한 결과, 연필로 작게 적힌 '미친 사람만이 그릴 수 있었다(Kan kun være malet af en gal Mand!)'라는 뭉크 자신의 친필 문장이 발견되어 화제를 모았습니다.",
    secretPoints: [
      {
        id: "sc_1",
        x: 50,
        y: 58,
        label: "비명을 지르는 것이 아니라 귀를 막은 인물",
        detail: "흔히 인물이 소리를 지른다고 생각하지만, 실제로는 자연 전체에서 울려 퍼지는 거대한 절규 소리에 두려워하며 두 귀를 막고 있는 모습입니다.",
      },
      {
        id: "sc_2",
        x: 45,
        y: 16,
        label: "핏빛으로 물든 피오르드 노을과 친필 문구",
        detail: "상단 붉은 구름 위에 뭉크가 직접 연필로 적어 넣은 비밀 문구가 숨겨져 있습니다.",
      },
      {
        id: "sc_3",
        x: 12,
        y: 42,
        label: "아무렇지 않게 걸어가는 두 친구",
        detail: "급격한 대각선 다리 저 멀리에서 주인공의 내면적 공포도 모른 채 무심하게 걸어가는 두 실루엣이 고독감을 극대화합니다.",
      },
    ],
    fortuneTag: {
      category: "영감·창의운",
      blessing: "마음속의 불안과 스트레스를 솔직하게 마주할 때 오히려 가장 창의적인 해답이 터져 나옵니다.",
    },
  },
];

export interface TasteQuestion {
  id: string;
  question: string;
  options: Array<{
    label: string;
    sub: string;
    scores: Record<string, number>;
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
        scores: { starry_night: 4, starry_rhone: 4, the_scream: 2 },
      },
      {
        label: "☀️ 따스한 햇살과 황금빛 꽃밭이 가득한 정원",
        sub: "풍요롭고 긍정적인 생명력과 온기",
        scores: { sunflowers: 4, the_kiss: 4, woman_parasol: 3, sunday_grande_jatte: 3 },
      },
      {
        label: "🌊 안개 낀 산봉우리나 푸른 바다의 거센 파도",
        sub: "가슴이 뻥 뚫리는 대자연의 품격",
        scores: { inwang_jesaekdo: 4, travelers_mountains: 4, great_wave: 4, mexican_valley: 3 },
      },
      {
        label: "🏛️ 비밀스러운 이야기가 숨겨진 황금 궁전과 살롱",
        sub: "지적인 호기심과 우아한 클래식 무드",
        scores: { mona_lisa: 4, pearl_earring: 4, mask_tutankhamun: 4, miindo: 3, belle_ferronniere: 3 },
      },
    ],
  },
  {
    id: "q2",
    question: "Q2. 요즘 내가 가장 끌어당기고 싶은 행운의 기운은?",
    options: [
      {
        label: "💰 든든한 재물운과 황금빛 자산의 결실",
        sub: "순금처럼 변치 않는 풍요와 성공적인 계약",
        scores: { mask_tutankhamun: 4, sunflowers: 4, arnolfini: 3, gleaners: 3, american_gothic: 3 },
      },
      {
        label: "💓 설레는 사랑과 나를 빛내는 독보적 매력",
        sub: "누구에게나 사랑받는 아우라",
        scores: { the_kiss: 4, pearl_earring: 4, birth_of_venus: 4, miindo: 4, shakuntala_varma: 3 },
      },
      {
        label: "🚀 막힌 일을 뚫어내는 돌파력과 명예",
        sub: "큰 무대에서 인정받는 리더십",
        scores: { washington_delaware: 4, liberty_leading: 4, great_wave: 4, ulysses_sirens: 3, mona_lisa: 3 },
      },
      {
        label: "✨ 남다른 창의적 영감과 마음의 치유",
        sub: "스트레스 해소와 반짝이는 아이디어",
        scores: { starry_night: 4, water_lilies: 4, prodigal_son: 4, inwang_jesaekdo: 3, las_meninas: 3 },
      },
    ],
  },
  {
    id: "q3",
    question: "Q3. 미술관에서 내 발걸음을 멈추게 하는 그림의 디테일은?",
    options: [
      {
        label: "🔍 돋보기로 봐야 보이는 초정밀 숨은 그림",
        sub: "거울 속 반사상, 나뭇잎 속 서명, 머리카락 한 올",
        scores: { arnolfini: 4, travelers_mountains: 4, miindo: 4, las_meninas: 3, sunday_grande_jatte: 3 },
      },
      {
        label: "🎨 손으로 만져질 듯 두껍고 강렬한 붓터치",
        sub: "화가의 열정이 그대로 굳어진 입체감",
        scores: { starry_night: 4, sunflowers: 4, inwang_jesaekdo: 4, woman_parasol: 3 },
      },
      {
        label: "✨ 어둠 속에서 보석처럼 반짝이는 순금과 빛",
        sub: "극적인 명암 대비와 황홀한 색채",
        scores: { mask_tutankhamun: 4, pearl_earring: 4, the_kiss: 4, prodigal_son: 4, belle_ferronniere: 3 },
      },
      {
        label: "🌊 화면 밖으로 튀어나올 듯한 드라마틱한 구도",
        sub: "역동적인 에너지와 웅장한 스케일",
        scores: { great_wave: 4, washington_delaware: 4, ulysses_sirens: 4, liberty_leading: 3, raphael_resurrection: 3 },
      },
    ],
  },
];
