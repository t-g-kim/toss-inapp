export interface DeskPartOption {
  id: string;
  name: string;
  brand: string;
  price: number;
  tags?: string[];
  specs: string;
  imgUrl?: string;
  buyUrl?: string;
  danawaUrl?: string;
  // Specific physical specs for compatibility checks & 3D real-scale rendering
  deskWidth?: number; // mm (1200, 1400, 1600, 1800)
  deskDepth?: number; // mm (600, 700, 800)
  deskHeight?: number; // mm (720, or motion desk range)
  deskThickness?: number; // mm
  deskRearFrameClearance?: number; // mm (상판 뒷면 프레임 이격 거리, 모니터암 클램프 체결 여유)
  isMotionDesk?: boolean;
  color?: "black" | "white" | "wood";
  monitorSize?: number; // inch (24, 27, 32, 34)
  monitorWeight?: number; // kg
  monitorVesa?: "75x75" | "100x100" | "none";
  monitorType?: "single" | "dual" | "ultrawide";
  armMaxWeight?: number; // kg
  armType?: "single" | "dual" | "heavy";
  armMaxDeskThickness?: number; // mm
  chairType?: "mesh" | "leather" | "fabric";
  keyboardType?: "wireless" | "mechanical" | "silent";
  lightType?: "screenbar" | "ambient" | "none";
  powerWatts?: number;
}

export interface DeskItemPositions {
  // Monitor & Monitor Arm 3D Motion (자유 드래그 이동 지원)
  monitorX: number; // in mm (-950 ~ +950, 0 = center)
  monitorHeight: number; // in mm (0 ~ 200, 0 = lowest, 80 = standard eye-level, 180 = elevated)
  monitorDepth: number; // in mm (-150 ~ 150, -120 = pushed to wall, 0 = standard, +120 = pulled forward)
  monitorAngle: number; // degrees (-30 ~ +30, swivel)
  monitorPivot: boolean; // false = landscape (가로), true = portrait (세로 피벗 90°)
  isDemoAnimating?: boolean; // auto showcase demo

  // Placement of other peripherals (자유 이동)
  pcPlacement: "desk-right" | "desk-left" | "floor-right" | "floor-left";
  pcX?: number; // in mm (자유 드래그 X 좌표)
  keyboardX: number; // in mm (-700 ~ +700, 0 = center)
  speakerPlacement: "both" | "wide" | "none";
  accPlacement: "right" | "left" | "none";
}

export const DEFAULT_ITEM_POSITIONS: DeskItemPositions = {
  monitorX: 0,
  monitorHeight: 80,
  monitorDepth: 0,
  monitorAngle: 0,
  monitorPivot: false,
  pcPlacement: "floor-right",
  keyboardX: 0,
  speakerPlacement: "both",
  accPlacement: "right",
};

export type DeskSlotKey =
  | "deskShelf"
  | "monitorArm"
  | "lightingMat"
  | "accessories"
  | "keyboardMouse"
  | "chair"
  | "desk"
  | "monitor";

export const SLOT_LABELS: Record<DeskSlotKey, string> = {
  deskShelf: "데스크 쉘프 / 모니터 받침 선반",
  monitorArm: "모니터암 / 거치대",
  lightingMat: "조명 & 데스크매트",
  accessories: "선정리 트레이 & 편의 소품",
  keyboardMouse: "키보드 & 마우스",
  chair: "의자 / 인체공학 체어",
  desk: "책상 (옵션: 새로 구매 시)",
  monitor: "모니터 (옵션: 새로 구매 시)",
};

export const SLOT_ICONS: Record<DeskSlotKey, string> = {
  deskShelf: "Layers",
  monitorArm: "Maximize2",
  lightingMat: "Lamp",
  accessories: "Zap",
  keyboardMouse: "Keyboard",
  chair: "Armchair",
  desk: "Table",
  monitor: "Monitor",
};

export interface PurchaseLinks {
  partName: string;
  naver: string;
  danawa: string;
  coupang: string;
  ohou: string;
}

export const USER_COUPANG_SUBID = "AF6914951";
export const USER_COUPANG_PARTNERS_URL = `https://link.coupang.com/re/AFFSRP?lptag=${USER_COUPANG_SUBID}&pageKey=%EB%8D%B0%EC%8A%A4%ED%81%AC%ED%85%8C%EB%A6%AC%EC%96%B4`;

export const getCleanSearchQuery = (name: string): string => {
  if (!name) return "";
  let clean = name;
  clean = clean.replace(/\s*\([^\)]*\)/g, " ");
  clean = clean.replace(/\b(국민|가성비|추천|인기|신형|공식|정품|단품|세트)\b/g, " ");
  return clean.replace(/\s+/g, " ").trim();
};

export const getPurchaseLinks = (
  partName: string,
  customBuyUrl?: string,
  customDanawaUrl?: string
): PurchaseLinks => {
  const cleanName = getCleanSearchQuery(partName) || partName;
  const q = encodeURIComponent(cleanName);

  const coupangSearchUrl = `https://link.coupang.com/re/AFFSRP?lptag=${USER_COUPANG_SUBID}&pageKey=${q}`;

  return {
    partName,
    naver: `https://search.shopping.naver.com/search/all?query=${q}`,
    danawa: customDanawaUrl || `https://search.danawa.com/?query=${q}&tab=main`,
    coupang: customBuyUrl || coupangSearchUrl,
    ohou: `https://ohou.se/productions/feed?query=${q}`,
  };
};

export const DESK_PARTS: Record<DeskSlotKey, DeskPartOption[]> = {
  desk: [
    {
      id: "desk_apix_1200",
      name: "에이픽스 GD001 게이밍 데스크 1200 (블랙)",
      brand: "에이픽스",
      price: 89000,
      tags: ["가성비 1위", "1200×600", "카본 블랙"],
      specs: "1200×600×720mm / 카본 패턴 상판 / 두께 18mm / 최대하중 150kg",
      deskWidth: 1200,
      deskDepth: 600,
      deskHeight: 720,
      deskThickness: 18,
      isMotionDesk: false,
      color: "black",
    },
    {
      id: "desk_dodot_1206",
      name: "두닷 콰트로 에어 데스크 1206 (올화이트)",
      brand: "두닷",
      price: 125000,
      tags: ["화이트 감성", "1200×600", "둥근 모서리"],
      specs: "1200×600×720mm / 친환경 E0 LPM 상판 / 두께 18mm / 흔들림 제로",
      deskWidth: 1200,
      deskDepth: 600,
      deskHeight: 720,
      deskThickness: 18,
      isMotionDesk: false,
      color: "white",
    },
    {
      id: "desk_desker_1200",
      name: "일룸 데스커 컴퓨터 데스크 1200 (내추럴 우드)",
      brand: "데스커",
      price: 149000,
      tags: ["원룸 추천", "1200×600", "내추럴 오크"],
      specs: "1200×600×720mm / 독일 Schattdecor LPM / 두께 28mm / 견고한 H형 다리",
      deskWidth: 1200,
      deskDepth: 600,
      deskHeight: 720,
      deskThickness: 28,
      isMotionDesk: false,
      color: "wood",
    },
    {
      id: "desk_desker_1400",
      name: "일룸 데스커 컴퓨터 데스크 1400 (빈티지 블랙/우드)",
      brand: "데스커",
      price: 185000,
      tags: ["직장인 선호", "1400×700", "배선홀 일체형"],
      specs: "1400×700×720mm / 독일 Schattdecor LPM / 두께 28mm / 모니터암 완벽 지원",
      deskWidth: 1400,
      deskDepth: 700,
      deskHeight: 720,
      deskThickness: 28,
      isMotionDesk: false,
      color: "wood",
    },
    {
      id: "desk_dodot_1407",
      name: "두닷 콰트로 에어 데스크 1407 (올화이트)",
      brand: "두닷",
      price: 155000,
      tags: ["화이트 베스트", "1400×700", "여유로운 깊이"],
      specs: "1400×700×720mm / 친환경 E0 LPM / 두께 18mm / 견고한 타원형 다리",
      deskWidth: 1400,
      deskDepth: 700,
      deskHeight: 720,
      deskThickness: 18,
      isMotionDesk: false,
      color: "white",
    },
    {
      id: "desk_209_1600",
      name: "209애비뉴 제로데스크 1600 (매트 블랙)",
      brand: "209애비뉴",
      price: 198000,
      tags: ["대형 1600", "1600×800", "트리플 모니터"],
      specs: "1600×800×720mm / 1.4T 사각 파이프 / 두께 20mm / 4면 모니터암 클램프 지원",
      deskWidth: 1600,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 20,
      isMotionDesk: false,
      color: "black",
    },
    {
      id: "desk_dodot_1608",
      name: "두닷 콰트로 에어 데스크 1608 (올화이트)",
      brand: "두닷",
      price: 189000,
      tags: ["대형 화이트", "1600×800", "넓은 듀얼 세팅"],
      specs: "1600×800×720mm / 친환경 E0 LPM / 두께 18mm / 대형 작업 공간",
      deskWidth: 1600,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 18,
      isMotionDesk: false,
      color: "white",
    },
    {
      id: "desk_zenix_motion",
      name: "제닉스 아레나-X 전동 모션데스크 1200 (카본 블랙)",
      brand: "제닉스",
      price: 199000,
      tags: ["전동 높이조절", "1200×750", "모션데스크 입문"],
      specs: "1200×750×730~1230mm / 전동 싱글모터 / 높이 메모리 / 두께 18mm",
      deskWidth: 1200,
      deskDepth: 750,
      deskHeight: 730,
      deskThickness: 18,
      isMotionDesk: true,
      color: "black",
    },
    {
      id: "desk_lunalab_dual",
      name: "루나랩 전동 듀얼모터 모션데스크 1500 (내추럴 우드)",
      brand: "루나랩",
      price: 289000,
      tags: ["전동 듀얼모터", "1500×750", "4단 메모리"],
      specs: "1500×750×650~1250mm / 3단 듀얼모터 / 저소음 승하강 / 두께 25mm / 하중 130kg",
      deskWidth: 1500,
      deskDepth: 750,
      deskHeight: 720,
      deskThickness: 25,
      isMotionDesk: true,
      color: "wood",
    },
    {
      id: "desk_erectus_pro",
      name: "에렉투스 프리미엄 3단 모션데스크 1600 (월넛 우드)",
      brand: "에렉투스",
      price: 580000,
      tags: ["하이엔드", "1600×800", "리낙 듀얼모터"],
      specs: "1600×800×630~1280mm / 덴마크 LINAK 모터 / 두께 30mm 원목 자작나무 상판",
      deskWidth: 1600,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 30,
      isMotionDesk: true,
      color: "wood",
    },
    {
      id: "desk_dodot_1808",
      name: "두닷 콰트로 에어 데스크 1808 (퓨어 화이트)",
      brand: "두닷",
      price: 219000,
      tags: ["와이드 1800", "1800×800", "화이트 듀얼"],
      specs: "1800×800×720mm / 친환경 E0 LPM / 상판 두께 18mm / 견고한 듀얼 프레임",
      deskWidth: 1800,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 18,
      deskRearFrameClearance: 15,
      isMotionDesk: false,
      color: "white",
    },
    {
      id: "desk_desker_1800",
      name: "일룸 데스커 컴퓨터 데스크 1800 (내추럴 오크/블랙)",
      brand: "데스커",
      price: 249000,
      tags: ["국민 와이드", "1800×800", "모니터암 완벽지원"],
      specs: "1800×800×720mm / 독일 LPM 강화 상판 / 상판 두께 28mm / 배선 트레이 내장",
      deskWidth: 1800,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 28,
      deskRearFrameClearance: 70,
      isMotionDesk: false,
      color: "wood",
    },
    {
      id: "desk_209_2000",
      name: "209애비뉴 제로데스크 2000 (매트 블랙)",
      brand: "209애비뉴",
      price: 279000,
      tags: ["롱 데스크 2000", "2000×800", "모니터암 전용설계"],
      specs: "2000×800×720mm / 4면 모니터암 클램프 완벽 지원 / 두께 25mm / 흔들림 제로 보강바",
      deskWidth: 2000,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 25,
      deskRearFrameClearance: 90,
      isMotionDesk: false,
      color: "black",
    },
    {
      id: "desk_dodot_2008",
      name: "두닷 콰트로 에어 데스크 2008 (올화이트)",
      brand: "두닷",
      price: 289000,
      tags: ["대형 2미터", "2000×800", "화이트 미니멀"],
      specs: "2000×800×720mm / 친환경 E0 LPM / 상판 두께 25mm / 듀얼 모니터+스튜디오",
      deskWidth: 2000,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 25,
      deskRearFrameClearance: 15,
      isMotionDesk: false,
      color: "white",
    },
    {
      id: "desk_dodot_2108",
      name: "두닷 콰트로 2108 슈퍼 와이드 데스크 (내추럴 오크)",
      brand: "두닷",
      price: 319000,
      tags: ["슈퍼와이드 2100", "2100×800", "개발자 트리플"],
      specs: "2100×800×720mm / 친환경 E0 상판 / 두께 28mm / 중앙 다리 없는 광폭 프레임",
      deskWidth: 2100,
      deskDepth: 800,
      deskHeight: 720,
      deskThickness: 28,
      deskRearFrameClearance: 15,
      isMotionDesk: false,
      color: "wood",
    },
    {
      id: "desk_desker_2400",
      name: "일룸 데스커 빅테이블 2400 (내추럴 우드/화이트)",
      brand: "데스커",
      price: 389000,
      tags: ["초대형 2400", "2400×900", "2인/스튜디오 종결"],
      specs: "2400×900×720mm / 독일 LPM 상판 / 두께 30mm / 중앙 콘센트 수납 덕트 / 300kg 하중",
      deskWidth: 2400,
      deskDepth: 900,
      deskHeight: 720,
      deskThickness: 30,
      deskRearFrameClearance: 75,
      isMotionDesk: false,
      color: "wood",
    },
    {
      id: "desk_209_2400",
      name: "209애비뉴 제로데스크 2400 와이드 (올블랙)",
      brand: "209애비뉴",
      price: 398000,
      tags: ["초대형 2400", "2400×900", "4면 모니터암 지원"],
      specs: "2400×900×720mm / 4면 클램프 완벽 지원 / 두께 30mm / H형 트러스 하부 프레임",
      deskWidth: 2400,
      deskDepth: 900,
      deskHeight: 720,
      deskThickness: 30,
      deskRearFrameClearance: 95,
      isMotionDesk: false,
      color: "black",
    },
    {
      id: "desk_lunalab_2400_motion",
      name: "루나랩 하이엔드 4기둥 듀얼모터 모션데스크 2400",
      brand: "루나랩",
      price: 680000,
      tags: ["초대형 모션 2400", "2400×900", "4단 기둥 흔들림제로"],
      specs: "2400×900×650~1280mm / 4단 지지 컬럼 / 덴마크 LINAK 모터 / 두께 30mm 원목 상판",
      deskWidth: 2400,
      deskDepth: 900,
      deskHeight: 720,
      deskThickness: 30,
      deskRearFrameClearance: 80,
      isMotionDesk: true,
      color: "white",
    },
  ],

  deskShelf: [
    {
      id: "shelf_none",
      name: "선반 미사용 (모니터암 직접 거치)",
      brand: "없음",
      price: 0,
      tags: ["깔끔 미니멀", "모니터암 직결"],
      specs: "선반 없이 책상 상판을 최대한 넓게 쓰는 심플한 세팅",
    },
    {
      id: "shelf_wood_1000",
      name: "원목 솔리드 데스크 쉘프 1000mm (월넛/오크)",
      brand: "데스크랩",
      price: 49000,
      tags: ["인스타 1위", "원목 감성", "키보드 밑 수납"],
      specs: "1000×230×110mm / 북미산 FAS 월넛·오크 / 알루미늄 다리 / 하단 키보드 수납",
    },
    {
      id: "shelf_aluminum_dual",
      name: "알루미늄 슬림 듀얼 모니터 받침 선반",
      brand: "아트뮤",
      price: 32000,
      tags: ["맥북 감성", "듀얼 모니터", "쿨링 알루미늄"],
      specs: "980×200×90mm / 4mm 통 알루미늄 합금 / 미끄럼 방지 실리콘 / 하중 25kg",
    },
    {
      id: "shelf_felt_drawer",
      name: "2단 모듈러 펠트 서랍 데스크 쉘프 1050mm",
      brand: "오센트",
      price: 69000,
      tags: ["프리미엄", "펠트 서랍", "수납 극대화"],
      specs: "1050×240×120mm / 펜·외장하드 숨김 서랍 / 천연 원목 상판 / 케이블 홀더",
    },
    {
      id: "shelf_acrylic_clear",
      name: "미니멀 아크릴 클리어 데스크 라이저",
      brand: "뉴비",
      price: 19000,
      tags: ["투명 감성", "가성비", "공간 확장"],
      specs: "500×200×80mm / 8mm 고강도 투명 아크릴 / 모던 클리어 뷰",
    },
  ],

  monitor: [
    {
      id: "mon_alphascan_27",
      name: "알파스캔 AOC 27B2H2 27인치 FHD 100Hz",
      brand: "알파스캔",
      price: 149000,
      tags: ["가성비 1위", "시력보호", "IPS 광시야각"],
      specs: "27형 FHD(1920x1080) / IPS / 100Hz / VESA 100×100 / 3.4kg",
      monitorSize: 27,
      monitorWeight: 3.4,
      monitorVesa: "100x100",
      monitorType: "single",
    },
    {
      id: "mon_samsung_g3",
      name: "삼성전자 오디세이 G3 S27AG320 27인치 165Hz (화이트)",
      brand: "삼성전자",
      price: 189000,
      tags: ["화이트 게이밍", "165Hz 고주사율", "피벗 스탠드"],
      specs: "27형 FHD(1920x1080) / VA / 165Hz / 1ms / VESA 100×100 / 3.8kg",
      monitorSize: 27,
      monitorWeight: 3.8,
      monitorVesa: "100x100",
      monitorType: "single",
    },
    {
      id: "mon_lg_27gp850",
      name: "LG전자 울트라기어 27GP850 QHD 180Hz 나노IPS",
      brand: "LG전자",
      price: 399000,
      tags: ["국민 게이밍", "나노 IPS 1ms", "QHD 고해상도"],
      specs: "27형 QHD(2560x1440) / Nano-IPS / 180Hz / HDR400 / VESA 100×100 / 4.2kg",
      monitorSize: 27,
      monitorWeight: 4.2,
      monitorVesa: "100x100",
      monitorType: "single",
    },
    {
      id: "mon_dell_g2724d",
      name: "델(Dell) G2724D 27인치 QHD 165Hz Fast IPS",
      brand: "Dell",
      price: 349000,
      tags: ["작업·게임 겸용", "정확한 색감", "델 3년 무상보증"],
      specs: "27형 QHD(2560x1440) / Fast IPS / 165Hz / sRGB 99% / VESA 100×100 / 3.6kg",
      monitorSize: 27,
      monitorWeight: 3.6,
      monitorVesa: "100x100",
      monitorType: "single",
    },
    {
      id: "mon_samsung_s7_32",
      name: "삼성전자 뷰피니티 S7 S32A704 32인치 4K UHD",
      brand: "삼성전자",
      price: 369000,
      tags: ["32인치 대화면", "4K 초고화질", "사무·영상 최적화"],
      specs: "32형 4K UHD(3840x2160) / VA / HDR10 / 10억 컬러 / VESA 100×100 / 5.5kg",
      monitorSize: 32,
      monitorWeight: 5.5,
      monitorVesa: "100x100",
      monitorType: "single",
    },
    {
      id: "mon_lg_32un650",
      name: "LG전자 32UN650 32인치 4K UHD IPS 모니터",
      brand: "LG전자",
      price: 439000,
      tags: ["디자이너 원픽", "IPS 4K", "내장 스피커"],
      specs: "32형 4K(3840x2160) / IPS / DCI-P3 95% / HDR10 / VESA 100×100 / 6.5kg",
      monitorSize: 32,
      monitorWeight: 6.5,
      monitorVesa: "100x100",
      monitorType: "single",
    },
    {
      id: "mon_lg_34wn750",
      name: "LG전자 울트라와이드 34WN750 34인치 WQHD",
      brand: "LG전자",
      price: 520000,
      tags: ["21:9 와이드", "주식·코딩 최적", "창 3개 분할"],
      specs: "34형 WQHD(3440x1440) / IPS / 75Hz / HDR10 / VESA 100×100 / 6.9kg",
      monitorSize: 34,
      monitorWeight: 6.9,
      monitorVesa: "100x100",
      monitorType: "ultrawide",
    },
    {
      id: "mon_dell_dual_24",
      name: "델(Dell) P2422H 24인치 IPS 듀얼 모니터 세트 (2대)",
      brand: "Dell",
      price: 320000,
      tags: ["듀얼 모니터", "개발자 강추", "피벗 세로 직캠"],
      specs: "24형 FHD×2대 / 3면 슬림베젤 / ComfortView Plus / VESA 100×100 / 총 6.2kg",
      monitorSize: 24,
      monitorWeight: 6.2,
      monitorVesa: "100x100",
      monitorType: "dual",
    },
  ],

  monitorArm: [
    {
      id: "arm_nb_f80",
      name: "노스바유(NorthBayou) NB-F80 가스실린더 싱글 모니터암",
      brand: "NorthBayou",
      price: 18900,
      tags: ["역대 최다 판매", "가성비 끝판왕", "17~30인치"],
      specs: "지지하중 2~9kg / VESA 75·100 / 클램프 두께 최대 90mm / 가스스프링",
      armMaxWeight: 9,
      armType: "single",
      armMaxDeskThickness: 90,
    },
    {
      id: "arm_camel_bma2",
      name: "카멜마운트 BMA-2 싱글 모니터암 (화이트/블랙)",
      brand: "카멜마운트",
      price: 34000,
      tags: ["국내 A/S 1년", "셀프 밸런스 텐션", "깔끔한 디자인"],
      specs: "지지하중 2~9kg / 17~32인치 지원 / 클램프 85mm / 탈착식 베사판",
      armMaxWeight: 9,
      armType: "single",
      armMaxDeskThickness: 85,
    },
    {
      id: "arm_camel_dma2",
      name: "카멜마운트 DMA-2 듀얼 모니터암",
      brand: "카멜마운트",
      price: 69000,
      tags: ["듀얼 모니터 필수", "좌우 독립 조절", "케이블 수납"],
      specs: "암당 2~9kg (총 18kg) / 17~32인치 2대 지원 / 클램프 85mm",
      armMaxWeight: 9,
      armType: "dual",
      armMaxDeskThickness: 85,
    },
    {
      id: "arm_camel_pma2d",
      name: "카멜마운트 PMA-2D 대형 고중량 모니터암",
      brand: "카멜마운트",
      price: 89000,
      tags: ["울트라와이드 전용", "최대 15kg 지지", "쳐짐 방지"],
      specs: "지지하중 최대 15kg / 27~39인치 고중량 지원 / 클램프 85mm / 고급 무광 도장",
      armMaxWeight: 15,
      armType: "heavy",
      armMaxDeskThickness: 85,
    },
    {
      id: "arm_ergotron_lx",
      name: "어고트론(Ergotron) LX 데스크 마운트 싱글 모니터암 (알루미늄)",
      brand: "어고트론",
      price: 198000,
      tags: ["모니터암 종결자", "10년 보증", "특허 CF 모션"],
      specs: "지지하중 3.2~11.3kg / 최대 34인치 / 특허 Constant Force™ 10년 품질보증",
      armMaxWeight: 11.3,
      armType: "single",
      armMaxDeskThickness: 66,
    },
    {
      id: "arm_none",
      name: "모니터 기본 스탠드 거치 (0원)",
      brand: "기본 번들",
      price: 0,
      tags: ["기본 스탠드", "비용 0원"],
      specs: "별도 모니터암 없이 모니터 순정 받침대를 그대로 사용합니다.",
      armMaxWeight: 10,
      armType: "single",
    },
  ],

  chair: [
    {
      id: "chair_existing",
      name: "기존 보유 의자 사용 (0원)",
      brand: "보유 가구",
      price: 0,
      tags: ["보유중", "비용 0원"],
      specs: "현재 집/사무실에서 사용 중인 의자를 그대로 3D 배치합니다.",
      chairType: "mesh",
    },
    {
      id: "chair_linback_lb13",
      name: "린백 LB13HB 메쉬 요추지지 사무용 의자",
      brand: "린백",
      price: 69000,
      tags: ["가성비 1위", "헤드레스트 포함", "원룸 컴팩트"],
      specs: "통기성 3D 에어메쉬 / 조절형 럼버서포트 / 틸팅 텐션 조절 / 하중 100kg",
      chairType: "mesh",
    },
    {
      id: "chair_zenix_prime",
      name: "제닉스 아레나 프라임 게이밍체어 (블랙)",
      brand: "제닉스",
      price: 169000,
      tags: ["버킷 시트", "180도 리클라이닝", "발받침대 일체형"],
      specs: "프리미엄 PU 가죽 / 180도 침대형 리클라이너 / 메탈 프레임 / 허리 쿠션 증정",
      chairType: "leather",
    },
    {
      id: "chair_sidiz_t50_light",
      name: "시디즈 T50 라이트 (T500L) 화이트쉘/블랙",
      brand: "시디즈",
      price: 189000,
      tags: ["시디즈 베스트셀러", "깔끔한 화이트쉘", "등판 메쉬"],
      specs: "싱크로나이즈드 틸팅 / 럼버서포트 / 나일론 캐스터 / 체형 맞춤형 S커브",
      chairType: "mesh",
    },
    {
      id: "chair_duoback_d3",
      name: "듀오백 D3 풀메쉬 인체공학 의자 (헤드레스트형)",
      brand: "듀오백",
      price: 249000,
      tags: ["풀메쉬 시원함", "좌판 슬라이딩", "3년 무상보증"],
      specs: "듀얼 럼버 서포트 / 좌판 앞뒤 깊이조절 / 풀 에어로 메쉬 / 3D 암레스트",
      chairType: "mesh",
    },
    {
      id: "chair_sidiz_t50_air",
      name: "시디즈 T50 에어 (T500HLDA 에어) 풀메쉬",
      brand: "시디즈",
      price: 369000,
      tags: ["국민 의자 종결", "에어스킨 메쉬 좌판", "땀 차지 않음"],
      specs: "전체 풀메쉬 좌판·등판 / 3D 조절 암레스트 / 멀티 리미티드 틸팅",
      chairType: "mesh",
    },
    {
      id: "chair_sidiz_t80",
      name: "시디즈 T80 플래그십 인체공학 중역 의자",
      brand: "시디즈",
      price: 580000,
      tags: ["시디즈 끝판왕", "독일 이토 디자인", "얼티밋 싱크 틸트"],
      specs: "독일 ITO 디자인 스튜디오 합작 / 얼티밋 싱크 메커니즘 / 고급 알루미늄 다리",
      chairType: "fabric",
    },
  ],

  keyboardMouse: [
    {
      id: "km_existing",
      name: "기존 보유 키보드 & 마우스 (0원)",
      brand: "보유 기기",
      price: 0,
      tags: ["보유중", "비용 0원"],
      specs: "현재 사용 중인 키보드와 마우스를 그대로 책상 위에 배치합니다.",
      keyboardType: "wireless",
    },
    {
      id: "km_logitech_mk295",
      name: "로지텍 MK295 사일런트 무소음 무선 콤보",
      brand: "로지텍",
      price: 36900,
      tags: ["무소음 90% 감쇄", "원룸·사무실 필수", "배터리 24개월"],
      specs: "SilentTouch 기술 / 풀배열 104키 / 2.4GHz 무선 나노 수신기 / 방수 설계",
      keyboardType: "silent",
    },
    {
      id: "km_aula_f87_g304",
      name: "AULA 독거미 F87 Pro 유무선 기계식 + 로지텍 G304 무선",
      brand: "AULA/로지텍",
      price: 79000,
      tags: ["가스켓 쫀득한 타건", "RGB 백라이트", "국민 무선마우스"],
      specs: "87키 텐키리스 / 가스켓 구조 / 핫스왑 지원 / 로지텍 HERO 센서 12,000 DPI",
      keyboardType: "mechanical",
    },
    {
      id: "km_logitech_mx_set",
      name: "로지텍 MX Keys S + MX Master 3S 마우스 세트",
      brand: "로지텍",
      price: 269000,
      tags: ["직장인·개발자 1위", "맥·윈도우 동시연결", "무한 휠 스크롤"],
      specs: "퍼펙트 스트로크 로우프로파일 / 스마트 백라이트 / 전자기 스크롤 8,000 DPI / 블루투스",
      keyboardType: "wireless",
    },
    {
      id: "km_razer_wireless_set",
      name: "레이저 블랙위도우 V3 Pro 무선 + 데스에더 V3 Pro",
      brand: "Razer",
      price: 339000,
      tags: ["e스포츠 게이밍", "레이저 옐로우축", "63g 초경량"],
      specs: "HyperSpeed 무선 1ms / 기계식 옐로우 리니어 / Focus Pro 30K 센서 / Chroma RGB",
      keyboardType: "mechanical",
    },
    {
      id: "km_logitech_gpro_set",
      name: "로지텍 G PRO X TKL 무선 + 지슈라2 (PRO X SUPERLIGHT 2)",
      brand: "로지텍",
      price: 349000,
      tags: ["프로게이머 표준", "60g 깃털 무게", "LIGHTSPEED"],
      specs: "LIGHTSPEED 무선 / GX 옵티컬 스위치 / HERO 2 센서 32,000 DPI / 4K 폴링 지원",
      keyboardType: "mechanical",
    },
  ],

  lightingMat: [
    {
      id: "lm_baseus_iwok",
      name: "베이스어스(Baseus) i-wok 모니터 LED 스크린바 2세대",
      brand: "베이스어스",
      price: 28000,
      tags: ["시력보호 1위", "화면 반사 없음", "3가지 색온도"],
      specs: "비대칭 광원 / 화면 눈부심 제로 / USB-C 전원 / 3단계 색온도(2800K~5500K)",
      lightType: "screenbar",
    },
    {
      id: "lm_benq_halo",
      name: "벤큐(BenQ) ScreenBar Halo 무선 다이얼 모니터 조명",
      brand: "BenQ",
      price: 219000,
      tags: ["조명 끝판왕", "무선 스마트 다이얼", "후면 백라이트"],
      specs: "무선 컨트롤러 / 커브드 모니터 전용 패치 / 듀얼 라이트(전면+후면) / 자동 밝기 센서",
      lightType: "screenbar",
    },
    {
      id: "lm_philips_hue",
      name: "필립스 휴(Hue) 플레이 라이트바 2팩 (스마트 조명)",
      brand: "필립스",
      price: 169000,
      tags: ["1600만 컬러 감성", "모니터 화면 연동 싱크", "스마트폰 제어"],
      specs: "Philips Hue 싱크 박스 호환 / 1600만 가지 RGB / 모니터 후면 거치대 포함 / 1060lm",
      lightType: "ambient",
    },
    {
      id: "lm_leather_mat_900",
      name: "모던 방수 가죽 대형 데스크패드 (900×400mm)",
      brand: "데스크랩",
      price: 14900,
      tags: ["생활 방수", "스크래치 방지", "모던 미니멀"],
      specs: "900×400mm 대형 사이즈 / 친환경 PU 가죽 / 미끄럼 방지 논슬립 스웨이드 하단",
      lightType: "none",
    },
    {
      id: "lm_felt_wool_mat",
      name: "프리미엄 울 펠트 데스크매트 900×400 (다크그레이/베이지)",
      brand: "오센트",
      price: 22000,
      tags: ["북유럽 감성", "따뜻한 질감", "키보드 소음 흡수"],
      specs: "900×400mm / 4mm 고밀도 펠트 / 정전기 방지 / 모서리 오버로크 마감",
      lightType: "none",
    },
    {
      id: "lm_rgb_gaming_mat",
      name: "RGB 엣지 게이밍 와이드 장패드 (800×300mm)",
      brand: "에이픽스",
      price: 18000,
      tags: ["화려한 튜닝", "14가지 RGB 모드", "방수 코팅"],
      specs: "800×300mm / 고밀도 패브릭 / 14가지 RGB 라이팅 모드 / 4mm 쿠션감",
      lightType: "ambient",
    },
  ],

  accessories: [
    {
      id: "acc_none",
      name: "추가 데스크 소품 없음 (0원)",
      brand: "선택안함",
      price: 0,
      tags: ["미니멀", "비용 0원"],
      specs: "추가 소품 없이 심플하고 넓은 상판을 유지합니다.",
    },
    {
      id: "acc_cable_tray_set",
      name: "언더데스크 케이블 메쉬 트레이 + 안전 6구 멀티탭 (3m)",
      brand: "데스커/현대",
      price: 24900,
      tags: ["책상 밑 선정리 종결", "바닥 선 제로", "개별 스위치"],
      specs: "무타공 클램프 고정 트레이 / 16A 3200W 고용량 개별스위치 6구 멀티탭 / 벨크로 타이 증정",
      powerWatts: 3200,
    },
    {
      id: "acc_arm_plate",
      name: "카멜마운트 모니터암 상판 보강판 (스틸 듀얼 플레이트)",
      brand: "카멜마운트",
      price: 9900,
      tags: ["상판 휨 방지", "압력 분산", "원목·유리 보호"],
      specs: "2.5mm 고강도 스틸 / 190×153mm 상하 듀얼 플레이트 / EVA 완충 패드 / 모니터암 흔들림 방지",
    },
    {
      id: "acc_magsafe_3in1",
      name: "알루미늄 3 in 1 맥세이프 고속 무선충전 거치대",
      brand: "아트뮤",
      price: 34900,
      tags: ["아이폰+워치+에어팟", "15W 맥세이프 고속", "스탠바이 모드"],
      specs: "애플 MFM 인증 규격 / 금속 헤비 베이스 / 가로·세로 회전 마그네틱 / 15W 출력",
      powerWatts: 35,
    },
    {
      id: "acc_aluminum_headset",
      name: "메탈 알루미늄 헤드폰 스탠드 거치대",
      brand: "뉴비",
      price: 12900,
      tags: ["헤드셋 정리", "안정적인 알루미늄", "실리콘 패드"],
      specs: "통 알루미늄 기둥 / 흔들림 없는 원형 받침 / 헤드폰 밴드 변형 방지 곡면 받침",
    },
    {
      id: "acc_desktop_humidifier",
      name: "데스크탑 저소음 무선 미니 가습기 (무드등 겸용)",
      brand: "오아",
      price: 19800,
      tags: ["눈·피부 촉촉", "초음파 25dB 저소음", "은은한 웜화이트"],
      specs: "500ml 대용량 / 듀얼 분무 노즐 / USB-C 충전식 / 8시간 연속 가습",
      powerWatts: 5,
    },
    {
      id: "acc_belkin_65w_gan",
      name: "벨킨 65W GaN 듀얼 USB-C 초고속 충전기",
      brand: "Belkin",
      price: 39900,
      tags: ["노트북+스마트폰 동시", "초소형 질화갈륨", "250만원 연결보증"],
      specs: "USB-PD 3.0 PPS / 65W 단일 최대 / 듀얼 포트 지능형 전력 배분 / 초소형 플러그",
      powerWatts: 65,
    },
  ],
};

export interface DeskPreset {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  deskteriorPrice: number; // 데스크테리어 소품 전용 견적 (책상/모니터 제외)
  totalPrice: number;      // 전체 신규 구매 견적
  parts: Record<DeskSlotKey, string>;
  highlights: string[];
}

export const PRESET_SETUPS: DeskPreset[] = [
  {
    id: "preset_budget",
    name: "5만원 실속 선정리 & 데스크패드 팩",
    subtitle: "모니터암 + 대형 가죽패드 + 언더데스크 메쉬 트레이",
    tag: "알뜰 데스크테리어",
    tagColor: "bg-emerald-100 text-emerald-800",
    deskteriorPrice: 58700,
    totalPrice: 296700,
    parts: {
      deskShelf: "shelf_none",
      monitorArm: "arm_nb_f80",
      lightingMat: "lm_leather_mat_900",
      accessories: "acc_cable_tray_set",
      keyboardMouse: "km_existing",
      chair: "chair_existing",
      desk: "desk_apix_1200",
      monitor: "mon_alphascan_27",
    },
    highlights: ["국민 모니터암 NB F80", "900×400 가죽 방수 데스크패드", "선정리 종결 메쉬 트레이"],
  },
  {
    id: "preset_white_minimal",
    name: "9만원 화이트 미니멀 조명 & 알루미늄 팩",
    subtitle: "알루미늄 듀얼 받침 선반 + 화이트 스크린바 + 모니터암",
    tag: "인스타 감성 1위",
    tagColor: "bg-blue-100 text-blue-800",
    deskteriorPrice: 94900,
    totalPrice: 408900,
    parts: {
      deskShelf: "shelf_aluminum_dual",
      monitorArm: "arm_camel_bma2",
      lightingMat: "lm_baseus_iwok",
      accessories: "acc_none",
      keyboardMouse: "km_existing",
      chair: "chair_existing",
      desk: "desk_dodot_1206",
      monitor: "mon_samsung_g3",
    },
    highlights: [
      "알루미늄 슬림 듀얼 모니터 선반",
      "시력보호 비대칭 스크린바 조명",
      "카멜 BMA-2 화이트 모니터암",
    ],
  },
  {
    id: "preset_wood_shelf",
    name: "13만원 북미산 원목 쉘프 & 펠트 셋업 팩",
    subtitle: "Grovemade 스타일 1000mm 원목 데스크 쉘프 + 4mm 울 펠트 매트",
    tag: "원목 감성 추천",
    tagColor: "bg-amber-100 text-amber-800",
    deskteriorPrice: 129900,
    totalPrice: 463900,
    parts: {
      deskShelf: "shelf_wood_1000",
      monitorArm: "arm_camel_bma2",
      lightingMat: "lm_felt_wool_mat",
      accessories: "acc_cable_tray_set",
      keyboardMouse: "km_existing",
      chair: "chair_existing",
      desk: "desk_desker_1400",
      monitor: "mon_dell_g2724d",
    },
    highlights: [
      "1000mm 원목 솔리드 데스크 쉘프",
      "키보드 소음 흡수 4mm 울 펠트 매트",
      "언더데스크 케이블 메쉬 트레이",
    ],
  },
  {
    id: "preset_gaming_rgb",
    name: "18만원 올블랙 RGB & 고중량 와이드 팩",
    subtitle: "울트라와이드 전용 고중량 모니터암 + 스마트 RGB 조명 + 3in1",
    tag: "e스포츠 게이밍",
    tagColor: "bg-rose-100 text-rose-800",
    deskteriorPrice: 181900,
    totalPrice: 909900,
    parts: {
      deskShelf: "shelf_acrylic_clear",
      monitorArm: "arm_camel_pma2d",
      lightingMat: "lm_rgb_gaming_mat",
      accessories: "acc_magsafe_3in1",
      keyboardMouse: "km_existing",
      chair: "chair_existing",
      desk: "desk_209_1600",
      monitor: "mon_lg_34wn750",
    },
    highlights: [
      "15kg 지지 카멜 PMA-2D 고중량 암",
      "14가지 모드 RGB 와이드 장패드",
      "알루미늄 3in1 맥세이프 고속 충전기",
    ],
  },
  {
    id: "preset_dev_master",
    name: "25만원 프로 개발자 듀얼 선반 & 벤큐 헤일로 팩",
    subtitle: "2단 펠트 서랍 데스크 쉘프 + 듀얼 모니터암 + 벤큐 헤일로 조명",
    tag: "개발자 끝판왕",
    tagColor: "bg-purple-100 text-purple-800",
    deskteriorPrice: 251900,
    totalPrice: 1475900,
    parts: {
      deskShelf: "shelf_felt_drawer",
      monitorArm: "arm_camel_dma2",
      lightingMat: "lm_benq_halo",
      accessories: "acc_cable_tray_set",
      keyboardMouse: "km_existing",
      chair: "chair_existing",
      desk: "desk_desker_1400",
      monitor: "mon_dell_dual_24",
    },
    highlights: [
      "2단 모듈러 펠트 서랍 데스크 쉘프",
      "카멜 DMA-2 듀얼 모니터암",
      "벤큐 ScreenBar Halo 무선 다이얼 조명",
    ],
  },
];
