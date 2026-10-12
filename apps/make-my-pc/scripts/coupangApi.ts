/**
 * 쿠팡 파트너스(Coupang Partners) Open API 연동 모듈
 * 
 * 공식 명세:
 * Authorization: CEA algorithm=HmacSHA256, access-key={ACCESS_KEY}, signed-date={DATETIME}, signature={SIGNATURE}
 */

import crypto from "crypto";

export const DEFAULT_USER_COUPANG_URL = "https://link.coupang.com/a/hJYE2tA1Lw";

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
  const accessKey = envAccessKey || process.env.COUPANG_ACCESS_KEY;
  const secretKey = envSecretKey || process.env.COUPANG_SECRET_KEY;

  // API 키가 없는 경우 사용자 파트너스 링크로 Fallback
  if (!accessKey || !secretKey) {
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

  const urlPath = "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";
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
