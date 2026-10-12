/**
 * 다나와(Danawa) PC 부품 정밀 실시간 최저가 수집 모듈
 * 
 * 기능:
 * 1. 완제품 조립PC / 완제 시스템 필터링 (부품 단품 가격만 추출)
 * 2. 케이블/브라켓/악세서리 오매칭 방지
 * 3. 기준 시세 기반 신뢰도 검증 (Plausibility Filter)
 */

export interface DanawaPriceResult {
  query: string;
  matchedTitle?: string;
  price: number | null;
  danawaUrl: string;
  source: "danawa";
  timestamp: string;
}

const BLACKLIST_KEYWORDS = [
  "다나와표준PC",
  "조립PC",
  "완제품",
  "패키지",
  "본체",
  "브라켓",
  "가이드",
  "패널",
  "키트",
  "킷",
  "케이블",
  "슬리빙",
  "연장선",
  "거치대",
  "지지대",
  "먼지필터",
];

export async function fetchDanawaLowestPrice(
  query: string,
  referencePrice?: number
): Promise<DanawaPriceResult> {
  const danawaUrl = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}&tab=main`;

  try {
    const res = await fetch(danawaUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8",
      },
    });

    if (!res.ok) {
      return { query, price: null, danawaUrl, source: "danawa", timestamp: new Date().toISOString() };
    }

    const html = await res.text();

    // 상품 리스트 정밀 파싱: <p class="prod_name"> + <p class="price_sect">
    const regex =
      /<p class="prod_name">\s*<a[^>]*>(.*?)<\/a>.*?<p class="price_sect">\s*<a[^>]*>.*?<strong>([0-9,]+)<\/strong>원/gs;
    let m: RegExpExecArray | null;
    const candidates: Array<{ title: string; price: number }> = [];

    while ((m = regex.exec(html)) !== null && candidates.length < 15) {
      const title = m[1].replace(/<[^>]+>/g, "").trim();
      const price = parseInt(m[2].replace(/,/g, ""), 10);

      // 완제품/악세서리 제외
      const isBlacklisted = BLACKLIST_KEYWORDS.some((kw) => title.includes(kw));
      if (!isBlacklisted && price > 3000) {
        candidates.push({ title, price });
      }
    }

    if (candidates.length === 0) {
      return { query, price: null, danawaUrl, source: "danawa", timestamp: new Date().toISOString() };
    }

    // 기준 가격이 있는 경우 정상 범위(0.6배 ~ 1.45배) 내의 단품 매칭 우선
    let selected: { title: string; price: number } | null = candidates[0];
    if (referencePrice && referencePrice > 0) {
      const plausible = candidates.filter(
        (c) => c.price >= referencePrice * 0.6 && c.price <= referencePrice * 1.45
      );
      if (plausible.length > 0) {
        selected = plausible[0];
      } else {
        // 정상 범위를 벗어난 경우 (되팔이 뻥튀기 or 케이블/브라켓 오매칭) 채택하지 않음
        selected = null;
      }
    }

    if (!selected) {
      return { query, price: null, danawaUrl, source: "danawa", timestamp: new Date().toISOString() };
    }

    return {
      query,
      matchedTitle: selected.title,
      price: selected.price,
      danawaUrl,
      source: "danawa",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[DanawaScraper] Error fetching "${query}":`, error);
    return {
      query,
      price: null,
      danawaUrl,
      source: "danawa",
      timestamp: new Date().toISOString(),
    };
  }
}
