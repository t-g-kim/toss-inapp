/**
 * PC 부품 카탈로그 최신화 및 실시간 가격 동기화 자동화 스크립트
 * 
 * 기능:
 * 1. 다나와(Danawa) 실시간 최저가 크롤러 연동
 * 2. 쿠팡 파트너스(Coupang Partners) Open API 연동
 * 3. catalog-latest.json 업데이트 및 시세 동기화
 * 
 * 실행:
 * npm run update-catalog
 * 또는 node --loader tsx apps/make-my-pc/scripts/update-catalog.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchDanawaLowestPrice } from "./danawaScraper.js";
import { fetchCoupangLowestPrice } from "./coupangApi.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_JSON_PATH = path.resolve(__dirname, "../catalog-latest.json");

interface CatalogJson {
  updatedAt: string;
  version: string;
  source: string;
  exchangeRateUsd: number;
  stats?: {
    totalParts: number;
    danawaUpdated: number;
    coupangUpdated: number;
  };
  categories: Record<string, { label: string; options: any[] }>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateAllPartPrices() {
  console.log("==================================================");
  console.log("⚡ [MakeMyPc] PC 부품 실시간 시세 및 카탈로그 동기화 시작");
  console.log("==================================================");

  if (!fs.existsSync(CATALOG_JSON_PATH)) {
    console.error(`❌ 카탈로그 파일 없음: ${CATALOG_JSON_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(CATALOG_JSON_PATH, "utf-8");
  const catalog: CatalogJson = JSON.parse(raw);

  let totalCount = 0;
  let danawaSuccessCount = 0;
  let coupangSuccessCount = 0;

  const categories = Object.keys(catalog.categories);

  for (const catKey of categories) {
    const category = catalog.categories[catKey];
    console.log(`\n📂 카테고리 동기화 중: [${category.label}] (${category.options.length}개 품목)`);

    for (const item of category.options) {
      totalCount++;

      // 0원(내장그래픽 등) 또는 무료 옵션은 건너뜀
      if (item.price === 0 && item.id === "gpu1") {
        console.log(`  - ${item.name}: 내장 그래픽 (건너뜀)`);
        continue;
      }

      console.log(`  🔍 부품 시세 조회: ${item.name} (기존: ₩${item.price?.toLocaleString()}원)`);

      // 1. 다나와 최저가 조회 (완제품/악세서리 필터링)
      try {
        let danawa = await fetchDanawaLowestPrice(item.name, item.price);
        if (!danawa.price && item.name.includes("FOCUS")) {
          danawa = await fetchDanawaLowestPrice(item.name.replace(/FOCUS\s*/i, ""), item.price);
        }
        if (danawa.price && danawa.price > 1000) {
          const oldPrice = item.price;
          item.price = danawa.price;
          item.danawaPrice = danawa.price;
          item.danawaUrl = danawa.danawaUrl;
          danawaSuccessCount++;
          console.log(`    ✓ 다나와 최저가 반영: ₩${danawa.price.toLocaleString()}원 (${danawa.matchedTitle || "단품"}) (변동: ₩${(danawa.price - oldPrice).toLocaleString()}원)`);
        } else {
          console.log(`    ⚠ 다나와 시세 유지: ₩${item.price?.toLocaleString()}원`);
        }
      } catch (err) {
        console.warn(`    ✕ 다나와 조회 오류:`, err);
      }

      // 2. 쿠팡 파트너스 최저가 & 직링크 조회 (API 키 있을 경우 자동 연동)
      try {
        const coupang = await fetchCoupangLowestPrice(item.name);
        if (coupang.isApiLinked && coupang.price) {
          item.coupangPrice = coupang.price;
          item.buyUrl = coupang.productUrl;
          coupangSuccessCount++;
          console.log(`    ✓ 쿠팡 파트너스 API 연동 성공: ₩${coupang.price.toLocaleString()}원 (${coupang.productUrl})`);
        } else {
          // 키 미등록 시 기본 파트너스 링크 유지
          item.buyUrl = item.buyUrl || coupang.productUrl;
        }
      } catch (err) {
        console.warn(`    ✕ 쿠팡 조회 오류:`, err);
      }

      item.lastSyncedAt = new Date().toISOString();

      // 서버 부하 및 레이트 리밋 방지 (0.5초 딜레이)
      await sleep(500);
    }
  }

  const now = new Date().toISOString();
  catalog.updatedAt = now;
  catalog.exchangeRateUsd = 1385;
  catalog.stats = {
    totalParts: totalCount,
    danawaUpdated: danawaSuccessCount,
    coupangUpdated: coupangSuccessCount,
  };

  fs.writeFileSync(CATALOG_JSON_PATH, JSON.stringify(catalog, null, 2), "utf-8");

  console.log("\n==================================================");
  console.log(`🎉 [MakeMyPc] 카탈로그 실시간 최신화 완료!`);
  console.log(`- 전체 부품 수: ${totalCount}종`);
  console.log(`- 다나와 최저가 갱신: ${danawaSuccessCount}건`);
  console.log(`- 쿠팡 파트너스 연동: ${coupangSuccessCount}건`);
  console.log(`- 동기화 시각: ${now}`);
  console.log("==================================================");
}

updateAllPartPrices().catch((err) => {
  console.error("❌ 업데이트 실패:", err);
  process.exit(1);
});
