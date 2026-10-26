/**
 * PC 부품 상품 검증 및 쿼리 정제 엔진 (Part Validator & Query Sanitizer)
 * 
 * 기능:
 * 1. 실시간 최저가 수집 시 오매칭 상품(가습기, 수조, 타투기, 세제, 완제품PC, 중고 등) 100% 필터링
 * 2. 제조사/브랜드 일치 검증 (Brand Match Validation)
 * 3. 핵심 모델명 식별자 일치 검증 (Model Token Validation - 4060, 7500F, D31 등)
 * 4. 시세 신뢰도 범위 검증 (Plausibility Validation: 0.65x ~ 1.35x)
 */

export interface BrandDef {
  name: string;
  aliases: (string | RegExp)[];
}

export const BRANDS: BrandDef[] = [
  { name: "삼성", aliases: ["삼성", "Samsung", "삼성전자"] },
  { name: "SK하이닉스", aliases: ["SK하이닉스", "하이닉스", "Hynix", "SK hynix"] },
  { name: "마이크론", aliases: ["마이크론", "Micron", "Crucial", "크루셜"] },
  { name: "WD", aliases: ["WD", "웨스턴디지털", "Western Digital"] },
  { name: "키오시아", aliases: ["키오시아", "KIOXIA", "도시바"] },
  { name: "AMD", aliases: ["AMD", "라이젠", "Ryzen", "에이엠디"] },
  { name: "인텔", aliases: ["인텔", "Intel", /\bCore\b/i, "엘더레이크", "랩터레이크"] },
  { name: "NVIDIA", aliases: ["지포스", "GeForce", "엔비디아", "NVIDIA", "RTX", "GTX"] },
  { name: "라데온", aliases: ["라데온", "Radeon", /\bRX\b/i] },
  { name: "ASUS", aliases: ["ASUS", "에이수스", "아수스", "TUF", "ROG", "PRIME"] },
  { name: "MSI", aliases: ["MSI", "엠에스아이", "벤투스", "박격포", "MAG", /\bPRO\b/i] },
  { name: "GIGABYTE", aliases: ["GIGABYTE", "기가바이트", "AORUS", "어어로스", "에어로스"] },
  { name: "ASRock", aliases: ["ASRock", "애즈락", "에즈락", "Riptide", "Pro4"] },
  { name: "맥스선", aliases: ["MAXSUN", "맥스선"] },
  { name: "컬러풀", aliases: ["Colorful", "컬러풀", "CVN"] },
  { name: "이엠텍", aliases: ["이엠텍", "EMTEK", "STORM", "MIRACLE"] },
  { name: "갤럭시", aliases: ["갤럭시", "GALAX"] },
  { name: "조텍", aliases: ["조텍", "조택", "ZOTAC"] },
  { name: "만리", aliases: ["MANLI", "만리"] },
  { name: "TeamGroup", aliases: ["TeamGroup", "팀그룹", "T-Create", "T-FORCE"] },
  { name: "G.SKILL", aliases: ["G.SKILL", "지스킬", "Flare", "Ripjaws", "Trident"] },
  { name: "에센코어", aliases: ["에센코어", "클레브", "KLEVV", "ESSENCORE"] },
  { name: "커세어", aliases: ["커세어", "CORSAIR", "벤전스"] },
  { name: "3RSYS", aliases: ["3RSYS", "쓰리알", "쓰리알시스", "Socoool"] },
  { name: "PCCOOLER", aliases: ["PCCOOLER", "피씨쿨러", "팔라딘", "PALADIN"] },
  { name: "DeepCool", aliases: ["DeepCool", "딥쿨"] },
  { name: "써멀라이트", aliases: ["써멀라이트", "Thermalright", "서멀라이트"] },
  { name: "발키리", aliases: ["발키리", "VALKYRIE"] },
  { name: "ARCTIC", aliases: ["ARCTIC", "아틱", "Liquid Freezer"] },
  { name: "NZXT", aliases: ["NZXT", "엔젝스티", "크라켄", "Kraken"] },
  { name: "darkFlash", aliases: ["darkFlash", "다크플래쉬", "다크플래시"] },
  { name: "마이크로닉스", aliases: ["마이크로닉스", "Micronics", "Classic II"] },
  { name: "잘만", aliases: ["잘만", "Zalman", "EcoMax"] },
  { name: "FSP", aliases: ["FSP", "에프에스피", "HYPER K", "Hydro"] },
  { name: "시소닉", aliases: ["시소닉", "Seasonic", "FOCUS", "VERTEX"] },
  { name: "SuperFlower", aliases: ["SuperFlower", "슈퍼플라워", "슈플"] },
  { name: "앱코", aliases: ["앱코", "ABKO", "NCORE"] },
  { name: "존스보", aliases: ["존스보", "JONSBO"] },
  { name: "안텍", aliases: ["안텍", "Antec"] },
  { name: "몬텍", aliases: ["몬텍", "Montech"] },
  { name: "리안리", aliases: ["리안리", "LIAN LI", "LIANLI"] },
  { name: "Fractal Design", aliases: ["Fractal", "프랙탈", "프랙탈디자인"] }
];

export const BLACKLIST_KEYWORDS = [
  "노트북",
  "본체",
  "완제품",
  "조립PC",
  "조립컴퓨터",
  "게이밍PC",
  "다나와표준PC",
  "영웅컴퓨터",
  "포유컴퓨터",
  "마이피씨샵",
  "가습기",
  "수조",
  "타투",
  "문신",
  "물고기",
  "열대어",
  "사료",
  "키보드",
  "마우스",
  "스피커",
  "헤드셋",
  "써멀",
  "서멀",
  "구리스",
  "패드",
  "스티커",
  "세제",
  "케이블",
  "브라켓",
  "거치대",
  "지지대",
  "키트",
  "킷",
  "중고",
  "리퍼",
  "태블릿",
  "스마트폰",
  "보호필름",
  "파우치",
  "패널",
  "먼지필터",
  "오토바이",
  "배달",
  "범퍼케이스",
];

export function detectBrand(name: string, sub?: string): BrandDef | null {
  const combined = `${name} ${sub || ""}`;
  for (const b of BRANDS) {
    const matched = b.aliases.some((alias) => {
      if (typeof alias === "string") {
        return combined.toLowerCase().includes(alias.toLowerCase());
      }
      return alias.test(combined);
    });
    if (matched) return b;
  }
  return null;
}

export interface ModelTokenInfo {
  token: string;
  mustHaveTi?: boolean;
  mustHaveSuper?: boolean;
  exclude?: string[];
}

export function extractModelToken(rawName: string): ModelTokenInfo | null {
  // 1. GPU
  if (/4060\s*Ti/i.test(rawName)) return { token: "4060", mustHaveTi: true, exclude: [] };
  if (/4070\s*Ti\s*SUPER/i.test(rawName)) return { token: "4070", mustHaveTi: true, mustHaveSuper: true, exclude: [] };
  if (/4070\s*Ti/i.test(rawName)) return { token: "4070", mustHaveTi: true, exclude: [] };
  if (/4070\s*SUPER/i.test(rawName)) return { token: "4070", mustHaveSuper: true, exclude: ["4070 Ti", "4070Ti"] };
  if (/4080\s*SUPER/i.test(rawName)) return { token: "4080", mustHaveSuper: true, exclude: [] };
  if (/5070\s*Ti/i.test(rawName)) return { token: "5070", mustHaveTi: true, exclude: [] };
  if (/RTX\s*(\d{4})/i.test(rawName)) {
    const num = rawName.match(/RTX\s*(\d{4})/i)![1];
    return { token: num, exclude: [`${num} Ti`, `${num}Ti`, `${num} SUPER`, `${num}SUPER`] };
  }
  if (/RX\s*(\d{4}(?:\s*XT)?)/i.test(rawName)) {
    const model = rawName.match(/RX\s*(\d{4}(?:\s*XT)?)/i)![1];
    return { token: model, exclude: [] };
  }

  // 2. CPU
  if (/7500F/i.test(rawName)) return { token: "7500F", exclude: [] };
  if (/5600G/i.test(rawName)) return { token: "5600G", exclude: [] };
  if (/5600/i.test(rawName)) return { token: "5600", exclude: ["5600G", "5600X"] };
  if (/7600X/i.test(rawName)) return { token: "7600X", exclude: [] };
  if (/7600/i.test(rawName)) return { token: "7600", exclude: ["7600X"] };
  if (/7700X/i.test(rawName)) return { token: "7700X", exclude: [] };
  if (/7700/i.test(rawName)) return { token: "7700", exclude: ["7700X"] };
  if (/12100F/i.test(rawName)) return { token: "12100", exclude: [] };
  if (/12400F/i.test(rawName)) return { token: "12400", exclude: [] };
  if (/13400F/i.test(rawName)) return { token: "13400", exclude: [] };
  if (/14400F/i.test(rawName)) return { token: "14400", exclude: [] };
  if (/14600K/i.test(rawName)) return { token: "14600", exclude: [] };
  if (/14700K/i.test(rawName)) return { token: "14700", exclude: [] };
  if (/14900K/i.test(rawName)) return { token: "14900", exclude: [] };
  if (/7800X3D/i.test(rawName)) return { token: "7800X3D", exclude: [] };
  if (/9800X3D/i.test(rawName)) return { token: "9800X3D", exclude: [] };
  if (/9600X/i.test(rawName)) return { token: "9600X", exclude: [] };
  if (/9700X/i.test(rawName)) return { token: "9700X", exclude: [] };
  if (/9950X/i.test(rawName)) return { token: "9950X", exclude: [] };
  if (/265K/i.test(rawName)) return { token: "265K", exclude: [] };
  if (/285K/i.test(rawName)) return { token: "285K", exclude: [] };

  // 3. SSD
  if (/P31/i.test(rawName)) return { token: "P31", exclude: [] };
  if (/P41/i.test(rawName)) return { token: "P41", exclude: [] };
  if (/990\s*PRO/i.test(rawName)) return { token: "990 PRO", exclude: [] };
  if (/980\s*PRO/i.test(rawName)) return { token: "980 PRO", exclude: [] };
  if (/870\s*EVO/i.test(rawName)) return { token: "870 EVO", exclude: [] };
  if (/MX500/i.test(rawName)) return { token: "MX500", exclude: [] };
  if (/SN580/i.test(rawName)) return { token: "SN580", exclude: [] };

  // 4. 메인보드 칩셋
  const mbMatch = rawName.match(/\b([ABHZXZ]\d{3}[A-Z]*(?:-[A-Z0-9]+)?)\b/i);
  if (mbMatch) return { token: mbMatch[1], exclude: [] };

  // 5. 쿨러/파워/케이스
  if (/PALADIN\s*400/i.test(rawName)) return { token: "PALADIN", exclude: [] };
  if (/AK400/i.test(rawName)) return { token: "AK400", exclude: [] };
  if (/AK620/i.test(rawName)) return { token: "AK620", exclude: [] };
  if (/Classic\s*II/i.test(rawName)) return { token: "Classic II", exclude: [] };
  if (/HYPER\s*K/i.test(rawName)) return { token: "HYPER K", exclude: [] };
  if (/EcoMax/i.test(rawName)) return { token: "EcoMax", exclude: [] };
  if (/RM850e/i.test(rawName)) return { token: "RM850", exclude: [] };
  if (/FOCUS/i.test(rawName)) return { token: "FOCUS", exclude: [] };
  if (/VERTEX/i.test(rawName)) return { token: "VERTEX", exclude: [] };
  if (/SF-1300/i.test(rawName)) return { token: "1300", exclude: [] };
  if (/DLX21/i.test(rawName)) return { token: "DLX21", exclude: [] };
  if (/DK352/i.test(rawName)) return { token: "DK352", exclude: [] };
  if (/G40/i.test(rawName)) return { token: "G40", exclude: [] };
  if (/M60/i.test(rawName)) return { token: "M60", exclude: [] };
  if (/i3\s*NEO/i.test(rawName)) return { token: "i3 NEO", exclude: [] };
  if (/S401/i.test(rawName)) return { token: "S401", exclude: [] };
  if (/D31/i.test(rawName)) return { token: "D31", exclude: [] };
  if (/C8/i.test(rawName)) return { token: "C8", exclude: [] };
  if (/KING\s*95/i.test(rawName)) return { token: "KING 95", exclude: [] };
  if (/O11D/i.test(rawName)) return { token: "O11D", exclude: [] };
  if (/O11\s*Vision/i.test(rawName)) return { token: "O11 Vision", exclude: [] };
  if (/North/i.test(rawName)) return { token: "North", exclude: [] };

  return null;
}

export function cleanSearchQuery(rawName: string, categoryKey?: string): string {
  let q = rawName;
  // 1. 괄호 내용 제거
  q = q.replace(/\s*\([^\)]*\)/g, " ");
  // 2. 검색 방해 잡음 키워드 제거
  q = q.replace(/\b(대원씨티에스|서린|풀체인지|벌크|멀티팩|정품|미들타워|미니타워|빅타워|어항|파노라마|우드)\b/g, " ");
  // 3. 친화 변환
  if (/Ryzen/i.test(q)) {
    q = q.replace(/Ryzen\s*/i, "라이젠 ");
  }
  if (/GeForce\s*/i.test(q)) {
    q = q.replace(/GeForce\s*/i, "");
  }
  // 4. 케이스 카테고리인 경우 '케이스' 보강
  if (categoryKey === "case" && !/케이스/i.test(q)) {
    q = `${q} 케이스`;
  }
  // 5. RAM 포맷 간소화: 32GB DDR5-5600 -> DDR5 5600 32GB
  const mRam = q.match(/(\d+GB)\s+(DDR\d+)[^\d]*(\d+)/i);
  if (mRam) {
    q = `${mRam[2]} ${mRam[3]} ${mRam[1]}`;
  }
  return q.replace(/\s+/g, " ").trim();
}

export function validateCandidate(
  partName: string,
  sub: string | undefined,
  candidateTitle: string,
  candidatePrice: number,
  referencePrice?: number
): { valid: boolean; reason?: string } {
  // 1. 블랙리스트 검사
  const isBl = BLACKLIST_KEYWORDS.some((kw) => candidateTitle.includes(kw));
  if (isBl) return { valid: false, reason: "Blacklisted keyword" };

  // 2. 브랜드 검증
  const brand = detectBrand(partName, sub);
  if (brand) {
    const lowerCand = candidateTitle.toLowerCase();
    const hasBrand = brand.aliases.some((alias) => {
      if (typeof alias === "string") {
        return lowerCand.includes(alias.toLowerCase());
      }
      return alias.test(candidateTitle);
    });
    if (!hasBrand) {
      return { valid: false, reason: `Brand mismatch (expected ${brand.name})` };
    }
  }

  // 3. 핵심 모델 토큰 검증
  const modelInfo = extractModelToken(partName);
  if (modelInfo) {
    const lowerTitle = candidateTitle.toLowerCase();
    if (!lowerTitle.includes(modelInfo.token.toLowerCase())) {
      return { valid: false, reason: `Model token missing (${modelInfo.token})` };
    }
    if (modelInfo.mustHaveTi && !/ti\b/i.test(candidateTitle)) {
      return { valid: false, reason: "Missing Ti" };
    }
    if (modelInfo.mustHaveSuper && !/super\b/i.test(candidateTitle)) {
      return { valid: false, reason: "Missing SUPER" };
    }
    if (modelInfo.exclude && modelInfo.exclude.some((ex) => candidateTitle.includes(ex))) {
      return { valid: false, reason: "Matched excluded variant" };
    }
  }

  // 4. 정상 시세 범위 검증 (0.65배 ~ 1.35배)
  if (referencePrice && referencePrice > 0) {
    if (candidatePrice < referencePrice * 0.65 || candidatePrice > referencePrice * 1.35) {
      return {
        valid: false,
        reason: `Price outlier (₩${candidatePrice.toLocaleString()} outside 0.65x~1.35x of ₩${referencePrice.toLocaleString()})`,
      };
    }
  } else if (candidatePrice < 3000) {
    return { valid: false, reason: "Price too low (< 3,000)" };
  }

  return { valid: true };
}
