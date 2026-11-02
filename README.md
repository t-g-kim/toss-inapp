# 토스 인앱 스튜디오 (Apps in Toss Studio)

토스(Toss) 3,000만 유저를 타깃으로 하는 **웹뷰 기반 인앱 미니앱 16종 모음 및 통합 개발 런처**입니다.  
**Google AdMob 인앱 광고(보상형/전면/배너)**와 **토스페이(원클릭 소액결제)**를 통한 실질적인 수익화 루프가 완성되어 있습니다.

---

## 📱 프로젝트 구조 및 앱 목록

```
toss-inapp/
├── packages/
│   └── shared/                 # 공통 TDS(토스 디자인 시스템) 컴포넌트 & 수익화 SDK
│       ├── components/         # TossHeader, TossButton, TossCard, TossBadge
│       ├── monetization/       # AdBanner, RewardedAdModal, TossPayModal
│       ├── utils/              # tossBridge (환경 감지 및 라우팅 유틸)
│       └── index.ts
│
├── apps/
│   ├── portal/                 # 🚀 [통합 런처] 16개 인앱 원클릭 실행 & 둘러보기 허브
│   ├── face-fit/               # 👓 [앱 1] 페이스핏 (얼굴형 헤어 & 안경 가상 피팅)
│   ├── gohyang-gift/           # 🎁 [앱 2] 고향사랑 답례품 큐레이션 & 세액공제 계산기
│   ├── lotto-filter/           # 🎰 [앱 3] AI 행운 로또 번호 조합 & 당첨 채점기
│   ├── salary-hero/            # 💼 [앱 4] 2026 연봉 실수령액 & 인상 비교 계산기
│   ├── my-fortune-tarot/       # 🔮 [앱 5] 오늘의 행운 부적 & AI 사주 타로
│   ├── subsidy-calc/           # 💸 [앱 6] 맞춤 정부지원금 모의 계산기
│   ├── make-my-pc/             # 🖥️ [앱 7] 가상 PC 조립 견적 & 3D 시뮬레이터
│   ├── make-my-desk/           # 🪑 [앱 8] 데스크테리어 3D 배치 & 모니터암 호환 진단
│   ├── room-fit/               # 🛏️ [앱 9] 원룸 가구 배치 3D & 방문 간섭 진단
│   ├── cy-mini/                # 🧡 [앱 10] 미니룸 (Y2K 도트 미니홈피 & 방명록/주크박스)
│   ├── insta-clean/            # ✍️ [앱 11] 인스타 줄바꿈 변환 & 감성 폰트
│   ├── feed-preview/           # 🎞️ [앱 12] 인스타 9칸 피드 미리보기
│   ├── insta-time/             # ⏰ [앱 13] 인스타 골든타임 & 해시태그 추천
│   ├── story-music/            # 🎵 [앱 14] 인스타 스토리 감성 음악 카드 제작
│   ├── money-match/            # ❤️ [앱 15] 친구·연인 금전 궁합 측정기
│   └── spending-receipt/       # 🧾 [앱 16] 무지출 챌린지 & 팩폭 소비 영수증
│
├── src/                        # 메인 진입점 (모바일 디바이스 프레임 시뮬레이터 탑재)
└── dist/                       # 프로덕션 번들 (초경량 단일 빌드)
```

---

## 🚀 빠른 실행 방법

```bash
# 1. 의존성 설치 (npm 또는 bun)
npm install

# 2. 통합 포털 허브 실행 (전체 앱 테스트베드)
npm run dev

# 3. 특정 개별 앱만 독립적으로 실행 (예: 로또 앱)
npm run dev --workspace=@toss-app/lotto-filter
# 또는 해당 앱 폴더로 이동 후 실행
cd apps/lotto-filter && npm run dev

# 4. 루트 빌드 및 전체 앱 일괄 빌드
npm run build
npm run build:all
```

브라우저에서 `http://localhost:3000` 접속 시:
- **토스 모바일 프레임(아이폰 목업)** 환경에서 16개 인앱을 즉시 전환하며 테스트할 수 있습니다.
- 상단 **"전체 화면"** 토글을 누르면 실제 모바일 화면 100% 뷰로 전환됩니다.

---

## ⚙️ 토스 개발자센터(Apps in Toss) 배포 가이드

1. **[앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)** 로그인 후 콘솔 접속
2. **새 앱 등록**: 각 앱 폴더의 `docs/store-info.v*.md` 및 `assets/` 규격 에셋(`600x600` 로고, `636x1048` 스크린샷 3장) 등록
3. **번들 업로드**: 각 앱 폴더의 `.ait` 번들 파일 업로드 또는 웹뷰 URL(`?app=<appId>`) 연결
4. **AdMob & 토스페이 연동**:
   - AdMob 앱 ID 발급 후 `packages/shared/monetization`의 모달 호출부를 실기기 SDK 브릿지로 스위칭
   - 토스페이먼츠 가맹점 심사 후 결제 위젯 Key 주입
