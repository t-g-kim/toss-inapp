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
import { RAW_PARTS } from "../catalog.js";

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

      // 정품 표준 기준 시세 (RAW_PARTS) 확보 - 오염 방지용 절대 기준
      const baseOption = RAW_PARTS[catKey]?.options.find((o) => o.id === item.id);
      const basePrice = baseOption?.price || item.price || 50000;

      console.log(`  🔍 부품 시세 조회: ${item.name} (기준 정가: ₩${basePrice.toLocaleString()}원)`);

      const validPrices: number[] = [];

      // 1. 다나와 최저가 조회 (완제품/악세서리 필터링 + 브랜드/모델 검증)
      try {
        let danawa = await fetchDanawaLowestPrice(item.name, basePrice, item.sub, catKey);
        if (!danawa.price && item.name.includes("FOCUS")) {
          danawa = await fetchDanawaLowestPrice(item.name.replace(/FOCUS\s*/i, ""), basePrice, item.sub, catKey);
        }
        if (danawa.price && danawa.price >= basePrice * 0.65 && danawa.price <= basePrice * 1.35) {
          validPrices.push(danawa.price);
          item.danawaPrice = danawa.price;
          item.danawaUrl = danawa.danawaUrl;
          danawaSuccessCount++;
          console.log(`    ✓ 다나와 최저가 검증 통과: ₩${danawa.price.toLocaleString()}원 (${danawa.matchedTitle || "단품"})`);
        } else {
          item.danawaPrice = basePrice;
          item.danawaUrl = danawa.danawaUrl;
          console.log(`    ⚠ 다나와 검증 실패/시세 부재 -> 기준 정가(₩${basePrice.toLocaleString()}원) 유지`);
        }
      } catch (err) {
        console.warn(`    ✕ 다나와 조회 오류:`, err);
        item.danawaPrice = basePrice;
      }

      // 2. 쿠팡 파트너스 최저가 & 직링크 조회 (API 키 있을 경우 자동 연동 + 브랜드/모델/신뢰도 검증)
      try {
        const coupang = await fetchCoupangLowestPrice(item.name, basePrice, item.sub, catKey);
        if (coupang.isApiLinked && coupang.price && coupang.price >= basePrice * 0.65 && coupang.price <= basePrice * 1.35) {
          validPrices.push(coupang.price);
          item.coupangPrice = coupang.price;
          item.buyUrl = coupang.productUrl;
          coupangSuccessCount++;
          console.log(`    ✓ 쿠팡 파트너스 최저가 연동 성공: ₩${coupang.price.toLocaleString()}원 (${coupang.productName?.slice(0, 30) || item.name})`);
        } else {
          // 검증 실패 시(되팔이 뻥튀기 or 오매칭) 안전한 파트너스 검색 링크 반영
          item.coupangPrice = undefined;
          item.buyUrl = coupang.productUrl;
          console.log(`    ℹ 쿠팡 실시간 단품 미발견/되팔이 배제 -> 안전 검색 링크 매핑`);
        }
      } catch (err) {
        console.warn(`    ✕ 쿠팡 조회 오류:`, err);
      }

      // 최종 가격: 다나와/쿠팡 검증 통과 가격 중 최저가, 없으면 기준 정가 채택
      if (validPrices.length > 0) {
        item.price = Math.min(...validPrices);
      } else {
        item.price = basePrice;
      }
      console.log(`    ⭐ 최종 반영 시세: ₩${item.price.toLocaleString()}원`);

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
