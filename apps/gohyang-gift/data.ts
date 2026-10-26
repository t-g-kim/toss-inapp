/**
 * 고향사랑기부제 답례품 & 2026 개정세법 데이터셋
 * - 전국 17개 시도 대표 지자체 40+ 킬러 답례품
 * - 2026년 신설 개정세법 (10만 초과~20만 이하 44% 공제율 상향) 완벽 반영 계산 엔진
 */

export type RegionCode =
  | "all"
  | "jeju"
  | "gangwon"
  | "jeonnam"
  | "jeonbuk"
  | "gyeongbuk"
  | "gyeongnam"
  | "chungnam"
  | "chungbuk"
  | "gyeonggi"
  | "incheon"
  | "metro";

export type CategoryCode =
  | "all"
  | "meat"
  | "seafood"
  | "fruit_crop"
  | "processed"
  | "voucher"
  | "experience";

export interface RegionMeta {
  code: RegionCode;
  name: string;
  shortName: string;
  badgeEmoji: string;
}

export const REGIONS: RegionMeta[] = [
  { code: "all", name: "전국 전체", shortName: "전체", badgeEmoji: "🇰🇷" },
  { code: "jeju", name: "제주특별자치도", shortName: "제주", badgeEmoji: "🍊" },
  { code: "gangwon", name: "강원특별자치도", shortName: "강원", badgeEmoji: "🥔" },
  { code: "jeonnam", name: "전라남도", shortName: "전남", badgeEmoji: "🐟" },
  { code: "jeonbuk", name: "전북특별자치도", shortName: "전북", badgeEmoji: "🧀" },
  { code: "gyeongbuk", name: "경상북도", shortName: "경북", badgeEmoji: "🦀" },
  { code: "gyeongnam", name: "경상남도", shortName: "경남", badgeEmoji: "🦪" },
  { code: "chungnam", name: "충청남도", shortName: "충남", badgeEmoji: "🌰" },
  { code: "chungbuk", name: "충청북도", shortName: "충북", badgeEmoji: "🍇" },
  { code: "gyeonggi", name: "경기도", shortName: "경기", badgeEmoji: "🌾" },
  { code: "incheon", name: "인천광역시", shortName: "인천", badgeEmoji: "⚓" },
  { code: "metro", name: "광역시/기타", shortName: "광역시", badgeEmoji: "🏙️" },
];

export interface CategoryMeta {
  code: CategoryCode;
  name: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { code: "all", name: "전체 답례품", emoji: "🎁" },
  { code: "meat", name: "한우·한돈", emoji: "🥩" },
  { code: "seafood", name: "수산·해산물", emoji: "🦀" },
  { code: "fruit_crop", name: "과일·쌀·채소", emoji: "🍎" },
  { code: "processed", name: "가공식품·치즈", emoji: "🧀" },
  { code: "voucher", name: "지역화폐·상품권", emoji: "🎫" },
  { code: "experience", name: "이색체험·벌초", emoji: "🏄" },
];

export interface GiftItem {
  id: string;
  title: string;
  region: RegionCode;
  regionName: string;
  localityName: string; // 기초 지자체
  category: CategoryCode;
  point: number; // 30,000P (10만원 기부 시 받는 30%)
  minDonation: number; // 필요 기부금 (point / 0.3)
  rating: number;
  reviewCount: number;
  popularRank: number;
  imageEmoji: string;
  tag: string;
  description: string;
  provider: string;
  highlights: string[];
  is100kFit: boolean; // 10만원 기부 맞춤 (30,000P 이하)
  isBestSeller?: boolean;
}

export const GIFT_ITEMS: GiftItem[] = [
  // 1. 제주특별자치도
  {
    id: "jeju-pork-1",
    title: "제주 흑돼지 구이용 모둠세트 (오겹살+목살 800g)",
    region: "jeju",
    regionName: "제주특별자치도",
    localityName: "제주시",
    category: "meat",
    point: 30000,
    minDonation: 100000,
    rating: 4.95,
    reviewCount: 3840,
    popularRank: 1,
    imageEmoji: "🥩",
    tag: "제주 1위 특산품",
    description: "제주 청정 화산 암반수를 마시고 자란 고소한 1등급 제주 흑돼지 구이 세트입니다.",
    provider: "제주양돈농협",
    highlights: ["10만원 기부 시 실부담 0원", "냉장 신선 배송", "육즙 가득 두툼한 두께"],
    is100kFit: true,
    isBestSeller: true,
  },
  {
    id: "jeju-orange-1",
    title: "서귀포 고당도 하우스 감귤 (3kg 선물상자)",
    region: "jeju",
    regionName: "제주특별자치도",
    localityName: "서귀포시",
    category: "fruit_crop",
    point: 30000,
    minDonation: 100000,
    rating: 4.92,
    reviewCount: 2910,
    popularRank: 3,
    imageEmoji: "🍊",
    tag: "당도 12브릭스 보장",
    description: "따스한 서귀포 햇살과 해풍으로 길러낸 껍질이 얇고 당도가 높은 프리미엄 감귤입니다.",
    provider: "서귀포농업기술센터 인증농가",
    highlights: ["무착색·무왁스 자연 출하", "산도와 당도의 황금비율", "선물용 안전 포장"],
    is100kFit: true,
    isBestSeller: true,
  },
  {
    id: "jeju-fish-1",
    title: "제주 은갈치 & 당일바리 옥돔 손질 혼합세트",
    region: "jeju",
    regionName: "제주특별자치도",
    localityName: "제주시",
    category: "seafood",
    point: 30000,
    minDonation: 100000,
    rating: 4.88,
    reviewCount: 1720,
    popularRank: 8,
    imageEmoji: "🐟",
    tag: "제주 바다 직송",
    description: "제주 연근해 채낚기로 잡은 반짝이는 은갈치와 담백한 옥돔을 깔끔 손질해 개별 진공포장했습니다.",
    provider: "제주시수협",
    highlights: ["머리·내장 완전 제거 깔끔 손질", "소금 간 완료 즉석 조리", "냉동 진공팩 포장"],
    is100kFit: true,
  },
  {
    id: "jeju-voucher-1",
    title: "제주도 탐나는전 모바일 상품권 (30,000원권)",
    region: "jeju",
    regionName: "제주특별자치도",
    localityName: "제주도청",
    category: "voucher",
    point: 30000,
    minDonation: 100000,
    rating: 4.98,
    reviewCount: 5210,
    popularRank: 2,
    imageEmoji: "🎫",
    tag: "제주 여행 필수품",
    description: "제주도 여행 시 맛집, 렌터카, 카페, 동문시장 등 전역 가맹점에서 현금처럼 쓸 수 있는 지역화폐입니다.",
    provider: "제주특별자치도청",
    highlights: ["문자 모바일 PIN 즉시 발송", "유효기간 5년 넉넉한 사용", "제주 전역 가맹점 4만여곳"],
    is100kFit: true,
    isBestSeller: true,
  },

  // 2. 강원특별자치도
  {
    id: "gangwon-beef-1",
    title: "횡성축협 1++ 한우 국거리 & 불고기 혼합세트 (600g)",
    region: "gangwon",
    regionName: "강원특별자치도",
    localityName: "횡성군",
    category: "meat",
    point: 30000,
    minDonation: 100000,
    rating: 4.96,
    reviewCount: 4120,
    popularRank: 4,
    imageEmoji: "🥩",
    tag: "대한민국 1등 한우",
    description: "맑은 물과 해발 300m 고지대에서 정성껏 사육한 국가 인증 명품 횡성 한우 1++ 등급 세트입니다.",
    provider: "횡성축산업협동조합",
    highlights: ["1++(투플러스) 정품 인증", "산소차단 스킨포장", "10만원 기부 시 실부담 0원"],
    is100kFit: true,
    isBestSeller: true,
  },
  {
    id: "gangwon-surf-1",
    title: "양양 죽도해변 서핑 입문 강습 1인권 + 장비 렌탈",
    region: "gangwon",
    regionName: "강원특별자치도",
    localityName: "양양군",
    category: "experience",
    point: 30000,
    minDonation: 100000,
    rating: 4.91,
    reviewCount: 1480,
    popularRank: 7,
    imageEmoji: "🏄",
    tag: "MZ세대 최애 체험",
    description: "서핑의 성지 양양 죽도·인구 해변에서 슈트 대여, 보드 렌탈, 전문 코치 2시간 강습이 포함된 패키지입니다.",
    provider: "양양서핑협동조합",
    highlights: ["성수기/주말 추가금 없음", "장비·슈트 풀세트 포함", "유효기간 2026년 말까지"],
    is100kFit: true,
  },
  {
    id: "gangwon-dakgalbi-1",
    title: "춘천 전통 숯불 닭갈비 밀키트 (순살 1kg + 떡/야채/양념)",
    region: "gangwon",
    regionName: "강원특별자치도",
    localityName: "춘천시",
    category: "processed",
    point: 30000,
    minDonation: 100000,
    rating: 4.89,
    reviewCount: 2240,
    popularRank: 10,
    imageEmoji: "🍗",
    tag: "춘천 원조 골목 맛",
    description: "100% 국내산 냉장 닭다리살만 발라내 비법 숙성 양념에 재운 춘천 정통 닭갈비입니다.",
    provider: "춘천명물닭갈비협회",
    highlights: ["국내산 냉장 닭다리살 100%", "우동사리+특제소스 추가 증정", "캠핑용 조리 용기 포함"],
    is100kFit: true,
  },
  {
    id: "gangwon-potato-1",
    title: "춘천 감자빵 오리지널 & 옥수수빵 혼합세트 (10입)",
    region: "gangwon",
    regionName: "강원특별자치도",
    localityName: "춘천시",
    category: "processed",
    point: 30000,
    minDonation: 100000,
    rating: 4.87,
    reviewCount: 1890,
    popularRank: 14,
    imageEmoji: "🥔",
    tag: "SNS 대란 디저트",
    description: "강원도 홍감자를 으깨어 쫀득한 찹쌀 피에 듬뿍 채운 겉바속촉 국민 디저트 선물세트입니다.",
    provider: "강원농업법인 밭",
    highlights: ["진짜 감자 모양 비주얼", "에어프라이어 5분 간편 조리", "개별 포장 냉동 보관"],
    is100kFit: true,
  },

  // 3. 전라남도
  {
    id: "jeonnam-gulbi-1",
    title: "영광 법성포 참굴비 엮음 세트 (20미, 1.8kg)",
    region: "jeonnam",
    regionName: "전라남도",
    localityName: "영광군",
    category: "seafood",
    point: 30000,
    minDonation: 100000,
    rating: 4.94,
    reviewCount: 3620,
    popularRank: 5,
    imageEmoji: "🐟",
    tag: "밥도둑 굴비 명품",
    description: "영광 법성포 하늬바람과 천일염으로 섶간하여 짜지 않고 쫄깃 담백한 정통 밥도둑 굴비입니다.",
    provider: "영광군수협 지정가공원",
    highlights: ["법성포 전통 섶간 비법", "선물용 오동나무함 포장", "조기 살이 꽉 찬 20미"],
    is100kFit: true,
    isBestSeller: true,
  },
  {
    id: "jeonnam-abalone-1",
    title: "완도 청정바다 산지직송 활전복 세트 (10~12미, 1kg)",
    region: "jeonnam",
    regionName: "전라남도",
    localityName: "완도군",
    category: "seafood",
    point: 30000,
    minDonation: 100000,
    rating: 4.93,
    reviewCount: 2850,
    popularRank: 6,
    imageEmoji: "🦪",
    tag: "완도 살아있는 활전복",
    description: "완도 다시마와 미역을 먹고 자란 싱싱한 전복을 산소 포장해 살아서 식탁까지 배송합니다.",
    provider: "완도전복생산자연합회",
    highlights: ["살아있는 생물 산소팩 배송", "회·버터구이·죽 다용도", "세척 솔 & 손질 가이드 동봉"],
    is100kFit: true,
  },
  {
    id: "jeonnam-tteokgalbi-1",
    title: "담양 한우 떡갈비 수제 구이세트 (600g, 6쪽)",
    region: "jeonnam",
    regionName: "전라남도",
    localityName: "담양군",
    category: "meat",
    point: 30000,
    minDonation: 100000,
    rating: 4.9,
    reviewCount: 1640,
    popularRank: 12,
    imageEmoji: "🍖",
    tag: "담양 50년 전통 비법",
    description: "담양산 한우 갈빗살을 직접 다져 참숯 향을 입힌 부드럽고 촉촉한 수제 떡갈비입니다.",
    provider: "담양전통명인식품",
    highlights: ["잡육 없는 한우 100%", "은은한 참숯 불향", "개별 냉동 소포장"],
    is100kFit: true,
  },
  {
    id: "jeonnam-naju-pear-1",
    title: "나주 친환경 명품 신고배 (7.5kg, 9~10과)",
    region: "jeonnam",
    regionName: "전라남도",
    localityName: "나주시",
    category: "fruit_crop",
    point: 30000,
    minDonation: 100000,
    rating: 4.88,
    reviewCount: 1530,
    popularRank: 15,
    imageEmoji: "🍐",
    tag: "당도 13브릭스 나주배",
    description: "영산강 비옥한 토양에서 자라 과즙이 풍부하고 아삭아삭한 식감이 일품인 특등품 나주배입니다.",
    provider: "나주배원예농협",
    highlights: ["과즙 뚝뚝 대과 사이즈", "명절/가정용 최고 인기", "산지직송 에어캡 포장"],
    is100kFit: true,
  },

  // 4. 전북특별자치도
  {
    id: "jeonbuk-cheese-1",
    title: "임실 순수 프리미엄 치즈 & 요거트 7종 종합선물세트",
    region: "jeonbuk",
    regionName: "전북특별자치도",
    localityName: "임실군",
    category: "processed",
    point: 30000,
    minDonation: 100000,
    rating: 4.94,
    reviewCount: 3120,
    popularRank: 9,
    imageEmoji: "🧀",
    tag: "직장인 간식 만족도 1위",
    description: "임실 청정 원유 100%로 빚은 구워먹는 치즈, 스트링 치즈, 떠먹는 농후 요거트 풀패키지입니다.",
    provider: "임실치즈농업협동조합",
    highlights: ["무방부제 무색소 신선 원유", "구워먹는 치즈 2팩 포함", "아이·어른 영양 간식"],
    is100kFit: true,
    isBestSeller: true,
  },
  {
    id: "jeonbuk-eel-1",
    title: "고창 선운사 풍천장어 초벌구이 세트 (1kg, 2~3마리 + 특제소스)",
    region: "jeonbuk",
    regionName: "전북특별자치도",
    localityName: "고창군",
    category: "seafood",
    point: 30000,
    minDonation: 100000,
    rating: 4.92,
    reviewCount: 1980,
    popularRank: 11,
    imageEmoji: "🍱",
    tag: "고창 최고 보양식",
    description: "담수와 해수가 만나는 고창 풍천에서 자란 탱탱하고 기름진 장어를 초벌하여 보내드립니다.",
    provider: "고창풍천장어협회",
    highlights: ["참숯 90% 초벌 손질 완료", "순한맛·매운맛 양념장 2종 동봉", "프라이팬 3분 완성"],
    is100kFit: true,
  },

  // 5. 경상북도
  {
    id: "gyeongbuk-crab-1",
    title: "영덕 축산항 당일조업 살 꽉찬 영덕대게 (3마리, 자숙배송)",
    region: "gyeongbuk",
    regionName: "경상북도",
    localityName: "영덕군",
    category: "seafood",
    point: 30000,
    minDonation: 100000,
    rating: 4.91,
    reviewCount: 2740,
    popularRank: 13,
    imageEmoji: "🦀",
    tag: "영덕 바다 대게 정품",
    description: "영덕 앞바다에서 건져 올려 살수율 80% 이상의 달달하고 고소한 대게를 맛있게 쪄서 보냅니다.",
    provider: "영덕강구항수협",
    highlights: ["전문 찜기 자숙 후 발송", "받아서 바로 먹는 간편함", "달콤한 게살과 녹진한 게장"],
    is100kFit: true,
  },
  {
    id: "gyeongbuk-andong-1",
    title: "안동 이동삼 명인 간고등어 (순살 10팩) + 전통 안동소주",
    region: "gyeongbuk",
    regionName: "경상북도",
    localityName: "안동시",
    category: "processed",
    point: 30000,
    minDonation: 100000,
    rating: 4.89,
    reviewCount: 2050,
    popularRank: 16,
    imageEmoji: "🍶",
    tag: "안동 양반가 명물",
    description: "50년 명인의 섶간 간고등어 순살 팩과 대한민국 민속주 안동소주를 함께 담았습니다.",
    provider: "안동간고등어협동조합",
    highlights: ["가시 99% 제거 순살팩", "전통방식 증류식 안동소주", "냉동실 쟁여두는 필수 반찬"],
    is100kFit: true,
  },
  {
    id: "gyeongbuk-sangju-1",
    title: "상주 곶감 프리미엄 반건시 세트 (30과)",
    region: "gyeongbuk",
    regionName: "경상북도",
    localityName: "상주시",
    category: "fruit_crop",
    point: 30000,
    minDonation: 100000,
    rating: 4.88,
    reviewCount: 1420,
    popularRank: 18,
    imageEmoji: "🧡",
    tag: "쫀득 달콤 자연 당도",
    description: "상주 둥시 감으로 깎아 말려 겉은 쫀득하고 속은 꿀처럼 촉촉한 명품 반건시입니다.",
    provider: "상주원예농협",
    highlights: ["인공 첨가물 0% 자연 당도", "호두말이·디저트 활용", "고급 지함 선물 포장"],
    is100kFit: true,
  },

  // 6. 충청남도 / 충청북도
  {
    id: "chungnam-ginseng-1",
    title: "금산 6년근 수삼 & 홍삼정 농축액 스틱 (30포)",
    region: "chungnam",
    regionName: "충청남도",
    localityName: "금산군",
    category: "processed",
    point: 30000,
    minDonation: 100000,
    rating: 4.92,
    reviewCount: 2490,
    popularRank: 17,
    imageEmoji: "🪵",
    tag: "인삼의 본고장 금산",
    description: "금산 땅의 기운을 머금은 6년근 고려인삼만을 엄선하여 진하게 농축한 면역력 충전 스틱입니다.",
    provider: "금산인삼약초산업진흥원",
    highlights: ["사포닌 진세노사이드 고함량", "휴대 간편한 스틱형 포장", "부모님 효도 선물 1위"],
    is100kFit: true,
  },
  {
    id: "chungnam-gongju-chestnut-1",
    title: "공주 정안알밤 특상 (3kg) + 밤 파이 디저트",
    region: "chungnam",
    regionName: "충청남도",
    localityName: "공주시",
    category: "fruit_crop",
    point: 30000,
    minDonation: 100000,
    rating: 4.87,
    reviewCount: 1380,
    popularRank: 20,
    imageEmoji: "🌰",
    tag: "포슬포슬 단밤",
    description: "차령산맥 밤나무 숲에서 수확한 달고 알이 굵은 정안밤과 바삭한 밤파이 세트입니다.",
    provider: "정안농업협동조합",
    highlights: ["벌레 먹지 않은 선별 특상", "에어프라이어 군밤 조리", "달콤한 밤 앙금 파이 포함"],
    is100kFit: true,
  },
  {
    id: "chungbuk-wine-1",
    title: "영동 샤인머스캣 와이너리 스위트 와인 2병 세트",
    region: "chungbuk",
    regionName: "충청북도",
    localityName: "영동군",
    category: "processed",
    point: 30000,
    minDonation: 100000,
    rating: 4.89,
    reviewCount: 1610,
    popularRank: 19,
    imageEmoji: "🍷",
    tag: "국내산 영동 와인",
    description: "과일의 고장 충북 영동의 유기농 포도와 샤인머스캣으로 빚어낸 향긋한 디저트 와인입니다.",
    provider: "영동와인생산자협회",
    highlights: ["도수 12% 산뜻한 단맛", "홈파티/선물용 와인박스", "국제 와인품평회 수상작"],
    is100kFit: true,
  },

  // 7. 경기도 / 인천
  {
    id: "gyeonggi-rice-1",
    title: "이천 임금님표 이천쌀 햅쌀 (10kg, 2026 수확)",
    region: "gyeonggi",
    regionName: "경기도",
    localityName: "이천시",
    category: "fruit_crop",
    point: 30000,
    minDonation: 100000,
    rating: 4.95,
    reviewCount: 3950,
    popularRank: 3,
    imageEmoji: "🍚",
    tag: "조선 왕실 진상미",
    description: "찰기가 넘치고 밥알이 윤택하여 밥만 먹어도 단맛이 도는 대한민국 대표 쌀입니다.",
    provider: "이천농협연합미곡처리장",
    highlights: ["최근 1주일 내 당일 도정", "품종 순도 90% 이상 상등급", "10만원 기부 시 실부담 0원"],
    is100kFit: true,
    isBestSeller: true,
  },
  {
    id: "incheon-ganghwa-rice-1",
    title: "강화도 고시히카리 섬쌀 (10kg) + 순무김치 (1kg)",
    region: "incheon",
    regionName: "인천광역시",
    localityName: "강화군",
    category: "fruit_crop",
    point: 30000,
    minDonation: 100000,
    rating: 4.88,
    reviewCount: 1240,
    popularRank: 22,
    imageEmoji: "🌾",
    tag: "강화 해풍 맞은 섬쌀",
    description: "서해안 해풍과 일조량으로 영근 쫀득한 고시히카리 쌀과 알싸한 명물 순무김치입니다.",
    provider: "강화옹진축협",
    highlights: ["밥맛 좋은 고시히카리 단일품종", "강화 특산 알싸한 순무김치", "지하 암반수로 세척 도정"],
    is100kFit: true,
  },

  // 8. 효도 & 이색 서비스 (전국 지자체)
  {
    id: "service-beolcho-1",
    title: "고향 조상 묘 벌초 대행 1회 지원 할인권",
    region: "gangwon",
    regionName: "전국 지자체 (강원/경북/전남 등)",
    localityName: "산림조합중앙회 협약지",
    category: "experience",
    point: 30000,
    minDonation: 100000,
    rating: 4.97,
    reviewCount: 2310,
    popularRank: 15,
    imageEmoji: "🌿",
    tag: "부모님 효도 1순위",
    description: "바쁜 직장인을 위해 산림조합 전문 작업단이 고향 선산 묘소를 벌초하고 전후 사진을 보고해드립니다.",
    provider: "산림조합중앙회 벌초지원단",
    highlights: ["벌초 전/후 GPS 사진 전송", "예초 전문 작업단 파견", "추석/한식 전 예약 필수"],
    is100kFit: true,
  },
  {
    id: "voucher-local-pay-1",
    title: "지자체 모바일 지역사랑상품권 3만원권 (전국 100여곳 선택)",
    region: "metro",
    regionName: "전국 100여개 지자체",
    localityName: "희망 지자체 선택",
    category: "voucher",
    point: 30000,
    minDonation: 100000,
    rating: 4.96,
    reviewCount: 4890,
    popularRank: 4,
    imageEmoji: "💳",
    tag: "현금성 포인트 100%",
    description: "원하는 지자체의 전통시장, 식당, 카페, 학원 등에서 현금처럼 결제할 수 있는 모바일 상품권입니다.",
    provider: "한국조폐공사 chak / 행정안전부",
    highlights: ["선택한 지자체 앱으로 충전", "유효기간 5년 넉넉한 기한", "가맹점 어디서나 사용 가능"],
    is100kFit: true,
    isBestSeller: true,
  },
];

/**
 * 2026년 개정세법 세액공제 & 답례품 계산 모델
 * 1) 10만원 이하: 100% 전액 세액공제 (100,000원 공제)
 * 2) 10만원 초과 ~ 20만원 이하: 44% 세액공제 (2026년 개정 신설)
 * 3) 20만원 초과 ~ 2,000만원 이하: 16.5% 세액공제
 * + 기부금의 30%를 답례품 포인트로 무조건 환급!
 */
export interface TaxBenefitResult {
  donationAmount: number;
  taxCredit: number; // 세액공제 환급액
  giftPoint: number; // 답례품 포인트 (30%)
  totalBenefit: number; // 총 환급 혜택
  realCost: number; // 실제 지출 부담금 (donationAmount - taxCredit)
  profitRate: number; // 체감 수익률 (%)
  isSweetSpot100k: boolean; // 10만원 꿀구간 (실부담 0원)
}

export function calculate2026TaxBenefit(donation: number): TaxBenefitResult {
  const amount = Math.max(0, Math.min(donation, 20000000)); // 연간 한도 2천만원
  let taxCredit = 0;

  if (amount <= 100000) {
    taxCredit = amount; // 10만원까지 100% 공제
  } else if (amount <= 200000) {
    taxCredit = 100000 + (amount - 100000) * 0.44; // 10만 초과분 44% 공제 (2026 신설)
  } else {
    taxCredit = 100000 + 100000 * 0.44 + (amount - 200000) * 0.165; // 20만 초과분 16.5%
  }

  const giftPoint = Math.floor(amount * 0.3); // 30% 답례품
  const totalBenefit = Math.round(taxCredit + giftPoint);
  const realCost = Math.max(0, Math.round(amount - taxCredit));
  const profitRate = amount > 0 ? Math.round(((totalBenefit - amount) / amount) * 100) : 0;

  return {
    donationAmount: amount,
    taxCredit: Math.round(taxCredit),
    giftPoint,
    totalBenefit,
    realCost,
    profitRate,
    isSweetSpot100k: amount === 100000,
  };
}
