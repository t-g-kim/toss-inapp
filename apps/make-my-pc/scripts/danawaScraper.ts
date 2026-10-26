/**
 * 다나와(Danawa) PC 부품 정밀 실시간 최저가 수집 모듈
 * 
 * 기능:
 * 1. Next.js 기반 최신 DOM 파싱 (data-product-seq 및 가격 태그 정밀 추출)
 * 2. 완제품 조립PC / 악세서리 / 타투기 / 가습기 / 수조 등 오매칭 상품 배제
 * 3. 제조사 브랜드 및 핵심 모델 식별자 일치 검증
 * 4. 시세 신뢰도 범위(0.65배 ~ 1.35배) 내의 단품 최저가 추출
 */

import { cleanSearchQuery, validateCandidate } from "./partValidator.js";

export interface DanawaPriceResult {
  query: string;
  matchedTitle?: string;
  price: number | null;
  danawaUrl: string;
  source: "danawa";
  timestamp: string;
}

export async function fetchDanawaLowestPrice(
  query: string,
  referencePrice?: number,
  sub?: string,
  categoryKey?: string
): Promise<DanawaPriceResult> {
  const cleanQuery = cleanSearchQuery(query, categoryKey);
  const danawaUrl = `https://search.danawa.com/?query=${encodeURIComponent(cleanQuery)}&tab=main`;

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

    // 1. Next.js 기반 최신 DOM 파싱 (data-product-seq)
    const seqRegex = /data-product-seq="(\d+)"/g;
    let match: RegExpExecArray | null;
    const seqs: Array<{ seq: string; index: number }> = [];

    while ((match = seqRegex.exec(html)) !== null) {
      seqs.push({ seq: match[1], index: match.index });
    }

    const candidates: Array<{ title: string; price: number }> = [];

    for (let i = 0; i < Math.min(seqs.length, 15); i++) {
      const start = seqs[i].index;
      const end = i + 1 < seqs.length ? seqs[i + 1].index : start + 35000;
      const chunk = html.substring(start, end);

      // 상품명 추출
      const titleMatch = chunk.match(/<p[^>]*class="[^"]*text-px16[^"]*"[^>]*><a[^>]*>(.*?)<\/a>/s);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

      // 최저가 추출 (<span class="text-px16">169,770원</span>)
      const priceMatch = chunk.match(/<span[^>]*class="[^"]*text-px16[^"]*"[^>]*>([0-9,]+)원<\/span>/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : null;

      if (title && price) {
        const validation = validateCandidate(query, sub, title, price, referencePrice);
        if (validation.valid) {
          candidates.push({ title, price });
        }
      }
    }

    // 2. 레거시 DOM 폴백 (<p class="prod_name">)
    if (candidates.length === 0) {
      const legacyRegex =
        /<p class="prod_name">\s*<a[^>]*>(.*?)<\/a>.*?<p class="price_sect">\s*<a[^>]*>.*?<strong>([0-9,]+)<\/strong>원/gs;
      let lm: RegExpExecArray | null;
      while ((lm = legacyRegex.exec(html)) !== null && candidates.length < 15) {
        const title = lm[1].replace(/<[^>]+>/g, "").trim();
        const price = parseInt(lm[2].replace(/,/g, ""), 10);
        if (title && price) {
          const validation = validateCandidate(query, sub, title, price, referencePrice);
          if (validation.valid) {
            candidates.push({ title, price });
          }
        }
      }
    }

    if (candidates.length === 0) {
      return { query, price: null, danawaUrl, source: "danawa", timestamp: new Date().toISOString() };
    }

    // 통과한 후보군 중 최저가 단품 선택
    candidates.sort((a, b) => a.price - b.price);
    const selected = candidates[0];

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
