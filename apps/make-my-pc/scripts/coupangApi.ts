/**
 * 쿠팡 파트너스(Coupang Partners) Open API 연동 모듈
 * 
 * 기능:
 * 1. 품목별 정밀 키워드 정제 (마케팅 문구, 잡음 단어 제거)
 * 2. 완제품, 노트북, 가습기, 수조, 타투기, 세제 등 오매칭 상품 필터링
 * 3. 제조사 브랜드 및 핵심 모델명(Token) 일치 여부 검증
 * 4. 기준 시세 기반 신뢰도 검증 (Plausibility Validation: 0.65x ~ 1.35x)
 * 5. 되팔이 뻥튀기 매물 배제 및 실시간 최저가 단품 추출
 * 6. 검증 실패 시 안전한 파트너스 검색 링크(SubID: AF6914951) 폴백
 */

import crypto from "crypto";
import { cleanSearchQuery, validateCandidate } from "./partValidator.js";

export const COUPANG_ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || "a4a8fd9a-06a4-45b2-8488-7e23adf8ecb8";
export const COUPANG_SECRET_KEY = process.env.COUPANG_SECRET_KEY || "ab27f4df23ddac60be0e787027163c665b1ecd01";
export const COUPANG_SUBID = "AF6914951";
export const DEFAULT_USER_COUPANG_URL = `https://link.coupang.com/re/AFFSRP?lptag=${COUPANG_SUBID}&pageKey=%EC%A1%B0%EB%A6%BDPC`;

export interface CoupangProductResult {
  query: string;
  price: number | null;
  productName: string | null;
  productUrl: string;
  source: "coupang";
  isApiLinked: boolean;
  timestamp: string;
}

export function generateCoupangAuth(
  method: string,
  urlPath: string,
  queryStr: string,
  accessKey: string,
  secretKey: string
): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = pad(now.getUTCMonth() + 1);
  const dd = pad(now.getUTCDate());
  const hh = pad(now.getUTCHours());
  const mi = pad(now.getUTCMinutes());
  const ss = pad(now.getUTCSeconds());
  const datetime = `${yy}${mm}${dd}T${hh}${mi}${ss}Z`;

  const message = `${datetime}${method}${urlPath}${queryStr}`;
  const signature = crypto.createHmac("sha256", secretKey).update(message).digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}

export async function fetchCoupangLowestPrice(
  keyword: string,
  referencePrice?: number,
  sub?: string,
  categoryKey?: string,
  envAccessKey?: string,
  envSecretKey?: string
): Promise<CoupangProductResult> {
  const accessKey = envAccessKey || COUPANG_ACCESS_KEY;
  const secretKey = envSecretKey || COUPANG_SECRET_KEY;

  const cleanKeyword = cleanSearchQuery(keyword, categoryKey);
  const fallbackSearchUrl = `https://link.coupang.com/re/AFFSRP?lptag=${COUPANG_SUBID}&pageKey=${encodeURIComponent(cleanKeyword)}`;

  const urlPath = "/v2/providers/affiliate_open_api/apis/openapi/products/search";
  const queryStr = `keyword=${encodeURIComponent(cleanKeyword)}&limit=10`;
  const fullUrl = `https://api-gateway.coupang.com${urlPath}?${queryStr}`;

  try {
    const authHeader = generateCoupangAuth("GET", urlPath, queryStr, accessKey, secretKey);
    const res = await fetch(fullUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[CoupangAPI] Response not ok (${res.status}) for "${keyword}"`);
      return {
        query: keyword,
        price: null,
        productName: null,
        productUrl: fallbackSearchUrl,
        source: "coupang",
        isApiLinked: false,
        timestamp: new Date().toISOString(),
      };
    }

    const data: any = await res.json();
    const items = data?.data?.productData || [];
    const candidates: Array<{ title: string; price: number; url: string }> = [];

    for (const it of items) {
      const title = (it.productName || "").trim();
      const price = typeof it.productPrice === "number" ? it.productPrice : 0;
      const productUrl = it.productUrl || fallbackSearchUrl;

      // 브랜드, 핵심모델, 블랙리스트, 시세범위(0.65x ~ 1.35x) 종합 검증
      const validation = validateCandidate(keyword, sub, title, price, referencePrice);
      if (validation.valid) {
        candidates.push({ title, price, url: productUrl });
      }
    }

    // 정상 검증된 후보 중 최저가 단품 선택
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.price - b.price);
      const best = candidates[0];
      return {
        query: keyword,
        price: best.price,
        productName: best.title,
        productUrl: best.url,
        source: "coupang",
        isApiLinked: true,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn(`[CoupangAPI] Error fetching "${keyword}":`, error);
  }

  // 검증 실패 시 (되팔이 뻥튀기 매물만 있거나 오매칭인 경우) 안전하게 파트너스 검색 링크 반환
  return {
    query: keyword,
    price: null,
    productName: null,
    productUrl: fallbackSearchUrl,
    source: "coupang",
    isApiLinked: false,
    timestamp: new Date().toISOString(),
  };
}
