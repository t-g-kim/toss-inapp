/**
 * 쿠팡 파트너스(Coupang Partners) Open API 연동 모듈
 * 
 * 공식 명세:
 * Authorization: CEA algorithm=HmacSHA256, access-key={ACCESS_KEY}, signed-date={DATETIME}, signature={SIGNATURE}
 */

import crypto from "crypto";

export const COUPANG_ACCESS_KEY = process.env.COUPANG_ACCESS_KEY || "a4a8fd9a-06a4-45b2-8488-7e23adf8ecb8";
export const COUPANG_SECRET_KEY = process.env.COUPANG_SECRET_KEY || "ab27f4df23ddac60be0e787027163c665b1ecd01";
export const COUPANG_SUBID = "AF6914951";
export const DEFAULT_USER_COUPANG_URL = "https://link.coupang.com/re/AFFSRP?lptag=AF6914951&pageKey=%EC%A1%B0%EB%A6%BDPC";

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
  // YYMMDDTHHmmssZ 포맷 (UTC)
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
  envAccessKey?: string,
  envSecretKey?: string
): Promise<CoupangProductResult> {
  const accessKey = envAccessKey || COUPANG_ACCESS_KEY;
  const secretKey = envSecretKey || COUPANG_SECRET_KEY;

  const urlPath = "/v2/providers/affiliate_open_api/apis/openapi/products/search";
  const queryStr = `keyword=${encodeURIComponent(keyword)}&limit=3`;
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
        productUrl: DEFAULT_USER_COUPANG_URL,
        source: "coupang",
        isApiLinked: false,
        timestamp: new Date().toISOString(),
      };
    }

    const data: any = await res.json();
    const items = data?.data?.productData || [];
    if (items.length > 0) {
      const best = items[0];
      return {
        query: keyword,
        price: best.productPrice || null,
        productName: best.productName || null,
        productUrl: best.productUrl || DEFAULT_USER_COUPANG_URL,
        source: "coupang",
        isApiLinked: true,
        timestamp: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn(`[CoupangAPI] Error fetching "${keyword}":`, error);
  }

  return {
    query: keyword,
    price: null,
    productName: null,
    productUrl: DEFAULT_USER_COUPANG_URL,
    source: "coupang",
    isApiLinked: false,
    timestamp: new Date().toISOString(),
  };
}
