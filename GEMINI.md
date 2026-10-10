# 토스 인앱(toss-inapp) 프로젝트 지침 (Project Constitution & Guidelines)

이 레포지토리는 토스(Apps in Toss) 플랫폼을 위한 미니앱 스위트입니다.

---

## 🏛️ [최상위 헌법] 앱인토스 공식 가이드 준수 (Supreme Law)

> **공식 표준 가이드라인**: [https://developers-apps-in-toss.toss.im/ai-vibe-coding#codex](https://developers-apps-in-toss.toss.im/ai-vibe-coding#codex)

모든 앱의 기획, UI/UX 설계, 코드 개발, 외부 서비스 연동 및 검수 준비 시 **반드시 위 공식 사이트의 명세와 가이드를 최우선 기준(헌법)으로 삼아 개발해야 합니다.**

1. **정책 준수**:
   - [앱인토스 서비스 오픈 정책](https://developers-apps-in-toss.toss.im/guide/exposure), 비게임/게임 출시 가이드, 정산 정책을 사전에 검토하고 위배되지 않도록 구현합니다.
2. **토스 디자인 시스템(TDS) & UX**:
   - 토스 공식 UI/UX 스타일(TDS 컬러, 여백, 폰트, 바텀시트, 모달)을 엄격히 준수합니다.
3. **표준 기능 연동**:
   - 광고(AdMob 배너/보상형), 토스페이 결제, 토스 로그인, Storage API 연동 시 공식 규격을 따릅니다.
4. **플러그인 및 하네스 생태계**:
   - Codex/Claude/AI 개발 시 `toss/apps-in-toss-harness` (`ait@apps-in-toss`) 및 `apps-in-toss-console` 워크플로를 참조합니다.

---

## ⚡ 작업 완료 시 필수 워크플로 (Strict Enforcement)

각 작업(기능 추가, 버그 수정, 리팩토링, 설정 변경 등)을 마칠 때마다 **반드시** 아래 단계를 수행해야 합니다:

1. **빌드 및 테스트 검증 (Always Test & Build)**
   ```bash
   npm run build
   # 또는 bun run build
   ```
   - TypeScript 컴파일 에러, Vite 빌드 에러, 누락된 import가 없는지 100% 검증합니다.
   - 빌드가 통과하지 않으면 커밋/푸시를 진행하지 않고 즉시 문제를 수정합니다.

2. **Git Commit & Push (Always Push)**
   ```bash
   git add .
   git commit -m "feat/fix: 명확한 변경 내역"
   git push origin main
   ```
   - 원격 저장소: `https://github.com/t-g-kim/toss-inapp.git`
   - 작업이 끝날 때마다 변경 사항을 누락 없이 `origin main`에 push합니다.

---

## 📁 아키텍처 및 폴더 구조 규칙

- **새로운 인앱 추가 시**: `apps/<앱이름>/` 폴더를 독립적으로 생성하고 구현합니다.
- **공통 컴포넌트 및 수익화**: `packages/shared/`에 위치하며, TDS 스타일과 Google AdMob, 토스페이 모달을 재사용합니다.
- **포털 런처 동기화**: 새로운 앱이 추가되면 `apps/portal/PortalHub.tsx` 및 `src/App.tsx`에 등록하여 테스트베드에서 즉시 실행 가능하도록 연동합니다.
- **표준 설정 파일**: 모든 앱은 루트에 `apps-in-toss.config.js`(`appName`, `webBundleDir: "dist"`, `brand`, `permissions: []`)를 유지합니다.

---

## 📝 토스 콘솔 등록 및 버전 문서화 규칙 (Store Metadata Rules)

1. **버전별 메타데이터 문서화 (`apps/<앱이름>/docs/store-info.v<version>.md`)**:
   - 모든 앱은 배포 및 심사용 메타데이터를 `docs/store-info.v<version>.md` 형식으로 버전별 관리해야 합니다.
   - 구성: 앱 만들기 기본 정보, 번들 정보, 앱 이름/부제/상세설명, 고객문의, 카테고리, 에셋 규격(600x600 로고, 636x1048 스크린샷 3장), 주요 기능, 변경 이력.
2. **주요 기능 글자 수 제한 엄격 준수 (Strict Limit)**:
   - **기능 이름은 띄어쓰기를 제외하고 10자를 넘어갈 수 없어요.** (`공백 제외 <= 10자`)
   - 메타데이터 문서에 공백 제외 글자 수 검증 표를 반드시 첨부하여 심사 반려를 원천 방지합니다.
   - 예시: `AI 로또 번호 조합` (공백 제외 8자 - 통과), `실시간 당첨 채점` (공백 제외 7자 - 통과)

