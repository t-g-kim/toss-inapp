/**
 * 월드아트맵 (world-art) 스페셜 확장 콘텐츠
 * 1) 스페셜 테마 기획전 (도난·미스터리전 / 밤의 명화전 / 최고가 랭킹전 / 제국의 보물전)
 * 2) 세기의 거장 & 라이벌 열전 (다빈치 vs 미켈란젤로 등 5대 빅매치)
 * 3) 명화 옥션 감정사 (하이&로우 경매 게임) & 클로즈업 1% 디테일 탐정 퀴즈
 */

export interface SpecialExhibition {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  themeColor: string;
  bgGradient: string;
  curatorIntro: string;
  artworkIds: string[];
  /** 각 작품별 기획전 전용 특별 해설 스토리 */
  episodeNotes: Record<string, { headline: string; story: string }>;
}

export interface ArtistRivalry {
  id: string;
  eraBadge: string;
  title: string;
  matchupSummary: string;
  leftArtist: {
    name: string;
    lifespan: string;
    countryFlag: string;
    nickname: string;
    signatureStyle: string;
    representativeArtworkIds: string[];
  };
  rightArtist: {
    name: string;
    lifespan: string;
    countryFlag: string;
    nickname: string;
    signatureStyle: string;
    representativeArtworkIds: string[];
  };
  clashTimeline: Array<{
    year: string;
    eventTitle: string;
    detail: string;
  }>;
  curatorVerdict: string;
}

export interface CloseupQuizItem {
  id: string;
  artworkId: string;
  zoomX: number; // 0~100 (%)
  zoomY: number; // 0~100 (%)
  zoomScale: number;
  clueTitle: string;
  clueHint: string;
  options: string[]; // artworkIds (4지선다)
}

export const SPECIAL_EXHIBITIONS: SpecialExhibition[] = [
  {
    id: "heist_mystery",
    badge: "🕵️‍♂️ 미스터리 특별전",
    title: "세기의 도난 사건 & X선 스캔의 비밀",
    subtitle: "사라졌던 명화들과 물감 아래 숨겨진 화가들의 극비 암호",
    themeColor: "#F59E0B",
    bgGradient: "linear-gradient(135deg, #1E1B4B 0%, #31102F 100%)",
    curatorIntro:
      "미술관의 평화로운 액자 뒤에는 영화보다 더 극적인 도난 사건과 첨단 X선·적외선 스캐너가 밝혀낸 화가들의 숨겨진 밑그림이 존재합니다. 세계를 뒤흔든 7대 미스터리 걸작을 만나보세요.",
    artworkIds: [
      "mona_lisa",
      "the_scream",
      "creation_of_adam",
      "night_watch",
      "milkmaid",
      "arnolfini",
      "school_of_athens",
    ],
    episodeNotes: {
      mona_lisa: {
        headline: "🚨 1911년 백주대낮 루브르 증발 사건 (28개월간의 실종)",
        story:
          "루브르 유리 기술자였던 빈첸초 페루자가 월요일 휴관일에 벽장 속에 숨어 있다가 모나리자를 작업복 속에 숨겨 걸어 나갔습니다. 당시 피카소까지 용의자로 체포되었으며, 빈 벽면을 보러 온 인파 덕분에 모나리자는 세계 최고의 슈퍼스타가 되었습니다.",
      },
      the_scream: {
        headline: "🪜 1994년 동계올림픽 개막식 날, 단 50초 만의 사다리 도난",
        story:
          "노르웨이 릴레함메르 동계올림픽에 모든 경찰력이 집중된 날, 도둑 2명이 사다리를 타고 창문을 깨고 들어와 단 50초 만에 '절규'를 훔치며 '보안이 허술해 고맙다'는 쪽지까지 남겼습니다. 이후 영국 스코틀랜드 야드의 함정 수사로 무사히 회수되었습니다.",
      },
      creation_of_adam: {
        headline: "🧠 500년 만에 밝혀진 붉은 망토 속 '인간 두뇌 해부도'",
        story:
          "해부학을 위해 직접 시신을 해부하곤 했던 미켈란젤로는 하느님과 천사들을 감싼 붉은 망토의 윤곽을 인간 뇌의 정밀 단면도(전두엽·뇌간·시신경)와 완벽히 일치하게 그려 '신이 인간에게 부여한 진짜 선물은 지성'이라는 메시지를 숨겼습니다.",
      },
      night_watch: {
        headline: "🔦 사실은 밤이 아니라 '대낮'이었다! 그을음이 만든 300년의 오해",
        story:
          "원래 렘브란트는 대낮의 그늘진 마당에서 출동하는 대원들을 그렸으나, 수백 년간 덧바른 어두운 유약과 석탄 난로 그을음 때문에 밤 풍경처럼 변색되어 '야경'이라는 별명을 얻었습니다.",
      },
      milkmaid: {
        headline: "🔬 X선이 찾아낸 여인의 등 뒤 '사라진 세계지도'",
        story:
          "암스테르담 국립미술관의 X선 투시 결과, 원래 하얀 벽면에는 거대한 세계지도가, 바닥에는 빨래 바구니가 그려져 있었습니다. 페르메이르는 오직 흐르는 우유 한 줄기에 시선을 모으기 위해 이를 과감히 백색 회벽으로 덮어버렸습니다.",
      },
      arnolfini: {
        headline: "🪞 볼록 거울 속 지름 5cm 공간에 숨겨진 두 명의 목격자",
        story:
          "방 안쪽 벽의 작은 볼록 거울을 확대하면 부부의 뒷모습뿐 아니라 문가에 서 있는 화가 얀 반 에이크 자신까지 그려져 있어, 이 그림 자체가 결혼 증명서 역할을 했음을 증명합니다.",
      },
      school_of_athens: {
        headline: "🕯️ 밤중에 몰래 훔쳐본 시스티나 성당, 그리고 추가된 미켈란젤로",
        story:
          "원래 밑그림에 없던 계단 중앙의 고독한 철학자(헤라클레이토스)는 라파엘로가 미켈란젤로의 천장화를 몰래 보고 감명을 받아 마지막에 석고를 덧발라 미켈란젤로의 얼굴로 그려 넣은 오마주입니다.",
      },
    },
  },
  {
    id: "night_gallery",
    badge: "🌙 야간 개장 특별전",
    title: "잠들지 않는 밤의 명화전 : Nocturne",
    subtitle: "검은 물감 없이 밤하늘의 별빛과 황금 스포트라이트를 피워낸 걸작들",
    themeColor: "#38BDF8",
    bgGradient: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)",
    curatorIntro:
      "'밤은 낮보다 훨씬 더 다채로운 색으로 살아 숨 쉰다.' — 빈센트 반 고흐. 어둠 속에서 오히려 가장 찬란하게 빛나는 별빛, 가스등, 그리고 내면의 위로를 담은 밤의 명화 6점을 모았습니다.",
    artworkIds: [
      "starry_night",
      "starry_night_rhone",
      "pearl_earring",
      "night_watch",
      "prodigal_son",
      "inwang_jesaekdo",
    ],
    episodeNotes: {
      starry_night: {
        headline: "🌌 새벽 4시 요양원 철창 너머로 타오른 금성(샛별)과 은하수",
        story:
          "고흐가 생레미 요양원에서 가장 어두운 고통의 시간을 보내면서도 가장 눈부신 코발트블루와 크롬 옐로로 완성한 인류 최고의 밤하늘입니다.",
      },
      starry_night_rhone: {
        headline: "🕯️ 밀짚모자에 촛불을 꽂고 아를 강변에서 그린 북두칠성",
        story:
          "검은색을 단 한 방울도 쓰지 않고 프러시안 블루와 에메랄드그린, 레몬 옐로만으로 강물 위에 부서지는 가스등 반영을 포착했습니다.",
      },
      pearl_earring: {
        headline: "✨ 칠흑 같은 검은 배경 속에서 단 두 번의 붓터치로 빚어낸 진주",
        story:
          "어두운 배경 덕분에 소녀의 촉촉한 입술과 진주 귀걸이의 반사광이 마치 어둠 속의 등불처럼 영롱하게 떠오릅니다.",
      },
      night_watch: {
        headline: "🎭 바로크 명암법(키아로스쿠로)이 연출한 황금빛 스포트라이트",
        story:
          "어두운 배경 속에서 붉은 깃발과 황금빛 옷을 입은 소녀에게만 연극 조명 같은 빛을 비추어 극적인 긴장감을 자아냅니다.",
      },
      prodigal_son: {
        headline: "🙏 어둠 속에서 아들의 등을 감싸 안는 아버지의 따스한 불빛",
        story:
          "모든 재산과 가족을 잃은 노년의 렘브란트가 칠흑 같은 어둠 속에서 오직 용서와 자비의 빛만을 남겨 완성한 영혼의 유작입니다.",
      },
      inwang_jesaekdo: {
        headline: "🌧️ 장맛비가 갠 직후 먹구름 사이로 드러난 검은 바위산의 위용",
        story:
          "76세의 겸재 정선이 비에 젖어 검게 빛나는 인왕산 암벽과 하얀 안개의 강렬한 흑백 대비로 조선 진경산수화의 정점을 찍었습니다.",
      },
    },
  },
  {
    id: "billion_club",
    badge: "💎 하이엔드 밸류 전",
    title: "천문학적 몸값! 세계 최고가 명화 TOP 8",
    subtitle: "국보급 보험 추정가 1조 원 클럽부터 실제 경매 신기록까지",
    themeColor: "#FACC15",
    bgGradient: "linear-gradient(135deg, #422006 0%, #78350F 100%)",
    curatorIntro:
      "대부분의 국보급 명화는 법적으로 매매가 금지된 '비매품(Priceless)'이지만, 국제 전시 보험 가액과 현대 미술 경매 낙찰가를 기준으로 환산한 인류 최고 가치의 예술품들을 공개합니다.",
    artworkIds: [
      "mona_lisa",
      "creation_of_adam",
      "school_of_athens",
      "night_watch",
      "las_meninas",
      "mask_tutankhamun",
      "the_kiss",
      "mont_sainte_victoire",
    ],
    episodeNotes: {
      mona_lisa: {
        headline: "👑 추정 가치 1위 · 약 1조 3,000억 원+ (프랑스 국유재산 제1호)",
        story:
          "1962년 미국 순회전 당시 책정된 보험가액 1억 달러를 현재 물가로 환산하면 약 1조 3천억 원이 넘으며, 실제로는 프랑스가 절대 팔지 않는 인류 최고가의 초상화입니다.",
      },
      creation_of_adam: {
        headline: "👑 추정 가치 2위 · 약 1조 2,000억 원+ (바티칸 시스티나 성당)",
        story:
          "매년 680만 명의 관람객을 바티칸으로 불러 모으는 인류 예술사의 성소로, 프레스코 천장화 전체의 문화적 가치는 환산 불능 수준입니다.",
      },
      school_of_athens: {
        headline: "👑 추정 가치 3위 · 약 1조 1,000억 원+ (바티칸 라파엘로의 방)",
        story:
          "르네상스 3대 거장의 초상이 한 화면에 공존하는 서양 지성사의 상징으로 바티칸 박물관의 핵심 자산입니다.",
      },
      night_watch: {
        headline: "👑 추정 가치 4위 · 약 1조 원 (네덜란드 국보 1호)",
        story:
          "암스테르담 국립미술관 건립 자체가 이 그림 한 점을 모시기 위해 설계되었을 만큼 네덜란드 국가 정체성의 상징입니다.",
      },
      las_meninas: {
        headline: "👑 추정 가치 5위 · 약 9,800억 원 (스페인 프라도 미술관 1호)",
        story:
          "스페인 합스부르크 왕가의 최고 유산으로 스페인 법에 의해 국외 반출조차 엄격히 금지된 절대 국보입니다.",
      },
      mask_tutankhamun: {
        headline: "👑 추정 가치 6위 · 약 9,500억 원 (순금 11kg + 3,300년 파라오 유물)",
        story:
          "고대 이집트 제18왕조의 온전한 왕실 보물로, 대이집트박물관(GEM) 개관의 핵심 주인공입니다.",
      },
      the_kiss: {
        headline: "👑 추정 가치 7위 · 약 8,200억 원 (오스트리아 벨베데레 국보)",
        story:
          "클림트의 다른 초상화들이 경매에서 1,500억~2,000억 원대에 거래되는 것을 감안할 때 대표작 '키스'는 8천억 원 이상으로 평가됩니다.",
      },
      mont_sainte_victoire: {
        headline: "🔨 실제 경매 낙찰가 · 약 1,900억 원 (2022년 크리스티 폴 앨런 경매)",
        story:
          "비매품 국보들과 달리 2022년 뉴욕 크리스티 경매에 실제로 출품되어 무려 1억 3,779만 달러(약 1,900억 원)에 낙찰되며 세잔 역대 최고가 기록을 세웠습니다!",
      },
    },
  },
  {
    id: "royal_secret",
    badge: "👑 제국의 컬렉션전",
    title: "황제와 왕실의 비밀 보물창고",
    subtitle: "조선 어좌의 일월오봉도부터 자금성·나폴레옹·합스부르크의 보물까지",
    themeColor: "#EC4899",
    bgGradient: "linear-gradient(135deg, #4C0519 0%, #831843 100%)",
    curatorIntro:
      "동서양의 군주와 황제들은 자신의 권위를 증명하기 위해 당대 최고의 예술가들을 궁정으로 불러들였습니다. 왕의 자리 뒤에 걸렸던 병풍부터 나폴레옹이 탐냈던 대작까지 제국의 명화들을 만나보세요.",
    artworkIds: [
      "irworobongdo",
      "qingming_scroll",
      "jadeite_cabbage",
      "wedding_at_cana",
      "las_meninas",
      "belle_ferronniere",
    ],
    episodeNotes: {
      irworobongdo: {
        headline: "🇰🇷 조선의 왕이 앉아야만 비로소 완성되는 어좌의 병풍",
        story:
          "해와 달, 다섯 봉우리가 그려진 병풍 앞에 국왕이 자리함으로써 우주와 통치자가 하나가 된다는 조선 왕실의 철학이 담겨 있습니다.",
      },
      qingming_scroll: {
        headline: "🇨🇳 북송 휘종 황제부터 마지막 황제 푸이까지 탐닉한 금단의 두루마리",
        story:
          "자금성 보물 중에서도 황제들이 가장 아꼈던 그림으로, 푸이가 만주국으로 도피할 때 여행 가방 속에 숨겨 갔던 작품입니다.",
      },
      jadeite_cabbage: {
        headline: "🇹🇼 청나라 광서제의 후궁 진비의 혼수품이었던 천연 비취 조각",
        story:
          "절반은 흰색, 절반은 에메랄드빛인 원석의 결을 그대로 살려 청렴함과 다산을 기원한 황실 보석 공예의 극치입니다.",
      },
      wedding_at_cana: {
        headline: "🇫🇷 나폴레옹이 베네치아에서 반으로 잘라 파리로 실어 온 10m 대작",
        story:
          "루브르 박물관 모나리자 바로 맞은편 벽면을 지배하는 초대형 연회화로, 나폴레옹 전쟁 약탈 미술품 역사의 가장 극적인 상징입니다.",
      },
      las_meninas: {
        headline: "🇪🇸 스페인 국왕 펠리페 4세의 시선으로 바라본 마드리드 왕궁 작업실",
        story:
          "그림을 보는 관람객 자신이 곧 스페인 국왕 부부가 되는 천재적 구도로 왕실 화가 벨라스케스에게 기사 작위를 안겨주었습니다.",
      },
      belle_ferronniere: {
        headline: "🇦🇪 밀라노 공작 루도비코 스포르차의 궁정을 빛낸 다빈치의 초상화",
        story:
          "프랑스 국왕 프랑수아 1세가 구입해 왕실 컬렉션으로 삼았으며, 현재는 루브르 아부다비를 대표하는 최고 걸작으로 전시 중입니다.",
      },
    },
  },
];

export const ARTIST_RIVALRIES: ArtistRivalry[] = [
  {
    id: "davinci_vs_michelangelo",
    eraBadge: "🏛️ 1504 피렌체 · 바티칸 세기의 라이벌",
    title: "레오나르도 다 빈치 vs 미켈란젤로 (feat. 라파엘로)",
    matchupSummary:
      "23살 차이의 두 천재가 피렌체 시청사(베키오 궁전)의 마주 보는 벽면에서 자존심을 걸고 맞붙었던 인류 미술사 최대의 라이벌전!",
    leftArtist: {
      name: "레오나르도 다 빈치",
      lifespan: "1452 ~ 1519",
      countryFlag: "🇮🇹",
      nickname: "만능의 르네상스인 · 스푸마토의 마술사",
      signatureStyle: "윤곽선을 안개처럼 피워내는 '스푸마토'와 과학적 공기원근법",
      representativeArtworkIds: ["mona_lisa", "belle_ferronniere"],
    },
    rightArtist: {
      name: "미켈란젤로 부오나로티",
      lifespan: "1475 ~ 1564",
      countryFlag: "🇮🇹",
      nickname: "신이 내린 손(Il Divino) · 천장화의 거인",
      signatureStyle: "조각 같은 근육의 역동성(테리빌리타)과 압도적 인체 해부학",
      representativeArtworkIds: ["creation_of_adam", "school_of_athens"],
    },
    clashTimeline: [
      {
        year: "1503년 피렌체",
        eventTitle: "거리에서 벌어진 공개 설전",
        detail:
          "우아한 비단옷을 즐겨 입던 51세의 다빈치와 돌가루 묻은 작업복 차림의 28세 미켈란젤로는 피렌체 산타 트리니타 광장에서 단테의 시 해석을 두고 날 선 신경전을 벌였습니다.",
      },
      {
        year: "1504년 베키오 궁전",
        eventTitle: "마주 보는 벽면의 세기의 대결 (앙기아리 전투 vs 카시나 전투)",
        detail:
          "피렌체 공화국이 시청사 대회의실 양쪽 벽을 두 거장에게 각각 맡기며 세기의 벽화 대결이 성사되었습니다. 당시 젊은 라파엘로가 두 사람의 스케치를 모두 배우러 달려왔습니다.",
      },
      {
        year: "1508~1512년 바티칸",
        eventTitle: "시스티나 성당과 아테네 학당의 탄생",
        detail:
          "미켈란젤로가 시스티나 성당 천장에 '아담의 창조'를 그리는 동안, 바로 옆방에서 라파엘로는 플라톤의 얼굴에 다빈치를, 헤라클레이토스의 얼굴에 미켈란젤로를 그려 넣은 '아테네 학당'을 완성하며 두 거장을 한 화폭에 화해시켰습니다.",
      },
    ],
    curatorVerdict:
      "다빈치가 '회화는 정신의 과학'이라며 신비로운 미소(모나리자)를 남겼다면, 미켈란젤로는 인간의 육체와 영혼이 뿜어내는 숭고한 에너지(아담의 창조)로 맞섰습니다.",
  },
  {
    id: "vangogh_vs_monet",
    eraBadge: "🌻 19세기 파리 · 아를 인상주의의 두 태양",
    title: "빈센트 반 고흐 vs 클로드 모네",
    matchupSummary:
      "찰나의 햇살과 물결을 포착한 인상주의의 창시자 모네와, 그 빛을 불타는 소용돌이 붓터치로 폭발시킨 후기 인상주의의 영혼 고흐!",
    leftArtist: {
      name: "빈센트 반 고흐",
      lifespan: "1853 ~ 1890",
      countryFlag: "🇳🇱",
      nickname: "태양과 별빛의 화가",
      signatureStyle: "물감을 튜브째 짜 올린 듯한 두꺼운 임파스토와 소용돌이 붓터치",
      representativeArtworkIds: ["starry_night", "sunflowers", "starry_night_rhone"],
    },
    rightArtist: {
      name: "클로드 모네",
      lifespan: "1840 ~ 1926",
      countryFlag: "🇫🇷",
      nickname: "빛은 곧 색채다 · 인상주의의 아버지",
      signatureStyle: "시시각각 변하는 대기와 수면의 반사광을 포착한 색채 분할",
      representativeArtworkIds: ["water_lilies", "woman_parasol", "la_japonaise"],
    },
    clashTimeline: [
      {
        year: "1886년 파리",
        eventTitle: "어두운 감자 먹는 사람들을 그리던 고흐, 모네의 빛을 만나다",
        detail:
          "네덜란드 시절 칙칙한 갈색 톤으로만 그림을 그리던 고흐는 파리에 도착해 모네의 밝은 야외 광선 회화를 보고 충격을 받아 팔레트를 코발트블루와 크롬 옐로로 완전히 바꿉니다.",
      },
      {
        year: "1888~1889년 아를 & 생레미",
        eventTitle: "고흐의 불꽃 같은 2년 — 해바라기와 별이 빛나는 밤",
        detail:
          "남프랑스 아를로 내려간 고흐는 폴 고갱과의 62일간의 격정적 동거 끝에 귀를 자르는 비극을 겪으면서도 '해바라기', '론강의 별이 빛나는 밤', '별이 빛나는 밤'을 연달아 탄생시킵니다.",
      },
      {
        year: "1890년대 지베르니",
        eventTitle: "모네의 찬사: '고흐의 그림은 우리 시대 최고의 빛이었다'",
        detail:
          "생전 단 한 점의 그림만 팔았던 고흐였지만, 당대 최고의 대가였던 모네는 고흐의 작품을 직접 수집하며 그의 강렬한 색채에 깊은 경의를 표했습니다.",
      },
    ],
    curatorVerdict:
      "모네가 자연의 빛이 눈에 맺히는 '평화로운 순간'을 그렸다면, 고흐는 그 빛이 자신의 심장을 통과하며 일으키는 '격렬한 감정의 파동'을 그렸습니다.",
  },
  {
    id: "rembrandt_vs_vermeer",
    eraBadge: "🕯️ 17세기 네덜란드 황금시대의 쌍벽",
    title: "렘브란트 판 레인 vs 요하네스 페르메이르",
    matchupSummary:
      "역동적인 군중과 어둠 속 황금 스포트라이트를 지배한 암스테르담의 제왕 렘브란트 vs 단 한 명의 여인과 창가의 고요한 빛을 그린 델프트의 스핑크스 페르메이르!",
    leftArtist: {
      name: "렘브란트 판 레인",
      lifespan: "1606 ~ 1669",
      countryFlag: "🇳🇱",
      nickname: "빛과 어둠의 마술사 · 영혼의 연출가",
      signatureStyle: "칠흑 같은 어둠 속에서 인물의 내면을 비추는 연극적 키아로스쿠로",
      representativeArtworkIds: ["night_watch", "prodigal_son"],
    },
    rightArtist: {
      name: "요하네스 페르메이르",
      lifespan: "1632 ~ 1675",
      countryFlag: "🇳🇱",
      nickname: "델프트의 스핑크스 · 진주와 청금석의 시인",
      signatureStyle: "카메라 옵스큐라를 활용한 정밀한 원근감과 빛의 알갱이(푸앵틸레)",
      representativeArtworkIds: ["pearl_earring", "milkmaid"],
    },
    clashTimeline: [
      {
        year: "1642년 암스테르담",
        eventTitle: "렘브란트, 4.3m 대작 '야경'으로 네덜란드를 평정하다",
        detail:
          "30대의 렘브란트는 수십 명의 인물이 살아 움직이는 대형 역사화와 집단 초상화로 유럽 최고의 명성과 부를 거머쥡니다.",
      },
      {
        year: "1658~1665년 델프트",
        eventTitle: "페르메이르, 1년에 단 2점만 그리는 극도의 완벽주의",
        detail:
          "다작을 했던 렘브란트와 달리 페르메이르는 금보다 비싼 천연 청금석(울트라마린) 안료를 아낌없이 사용하며 평생 단 35점 안팎의 고요한 실내화만을 남겼습니다.",
      },
      {
        year: "21세기 암스테르담",
        eventTitle: "네덜란드 미술관을 양분한 두 거장",
        detail:
          "오늘날 암스테르담 국립미술관(레이크스)의 명예의 전당에는 렘브란트의 '야경'과 페르메이르의 '우유를 따르는 여인'이 나란히 네덜란드 최고의 보물로 모셔져 있습니다.",
      },
    ],
    curatorVerdict:
      "웅장한 오케스트라 같은 감동을 원한다면 렘브란트를, 숨소리마저 멈추게 하는 맑은 피아노 독주곡 같은 정적을 원한다면 페르메이르를 감상해보세요.",
  },
  {
    id: "klimt_vs_munch",
    eraBadge: "✨ 1900년 세기말 유럽의 두 얼굴",
    title: "구스타프 클림트 vs 에드바르 뭉크",
    matchupSummary:
      "순금박으로 영원한 사랑의 황홀경을 감싸 안은 빈(Vienna)의 황제 클림트 vs 핏빛 노을 아래 현대인의 불안과 고독을 정면으로 마주한 오슬로의 뭉크!",
    leftArtist: {
      name: "구스타프 클림트",
      lifespan: "1862 ~ 1918",
      countryFlag: "🇦🇹",
      nickname: "황금빛 에로티시즘의 황제",
      signatureStyle: "실제 순금박·은박 모자이크와 관능적인 아르누보 장식미",
      representativeArtworkIds: ["the_kiss"],
    },
    rightArtist: {
      name: "에드바르 뭉크",
      lifespan: "1863 ~ 1944",
      countryFlag: "🇳🇴",
      nickname: "영혼의 절규를 그린 표현주의 선구자",
      signatureStyle: "소용돌이치는 붉은 곡선과 내면의 공포·고독을 시각화한 심리 회화",
      representativeArtworkIds: ["the_scream"],
    },
    clashTimeline: [
      {
        year: "1893년 베를린 & 오슬로",
        eventTitle: "뭉크의 '절규' 발표 — 유럽 미술계에 던진 충격파",
        detail:
          "기존의 아름다운 풍경화를 거부하고 인간 내면의 실존적 공포를 핏빛 하늘로 그려낸 뭉크의 전시는 스캔들을 일으키며 현대 표현주의의 문을 열었습니다.",
      },
      {
        year: "1897~1908년 빈(비엔나)",
        eventTitle: "클림트의 빈 분리파 창설과 황금 시대의 정점 '키스'",
        detail:
          "'시대에는 그 시대의 예술을, 예술에는 자유를!'이라 선언한 클림트는 뭉크의 작품을 빈 분리파 전시회에 초청하며 서로의 혁신을 지지했고, 1908년 순금빛 걸작 '키스'를 완성합니다.",
      },
    ],
    curatorVerdict:
      "불안한 세기말을 살아가며 클림트는 '사랑의 황금빛 포옹'에서 구원을 찾았고, 뭉크는 '고통을 숨기지 않는 정직한 절규'로 현대인의 마음을 대변했습니다.",
  },
  {
    id: "shin_vs_hokusai",
    eraBadge: "🌊 동아시아 회화의 황금 르네상스",
    title: "혜원 신윤복 · 겸재 정선 vs 가쓰시카 호쿠사이 · 장택단",
    matchupSummary:
      "한양의 은밀한 정취와 인왕산의 기개를 화폭에 담은 조선의 거장들과, 유럽 인상파를 뒤흔든 일본 우키요에의 파도 및 북송 대도시 파노라마의 만남!",
    leftArtist: {
      name: "혜원 신윤복 & 겸재 정선",
      lifespan: "조선 후기 (18~19세기)",
      countryFlag: "🇰🇷",
      nickname: "조선의 멋과 기개를 완성한 쌍벽",
      signatureStyle: "머리카락 한 올까지 살린 섬세한 풍속 인물화와 대담한 진경산수 수묵",
      representativeArtworkIds: ["miindo", "inwang_jesaekdo", "irworobongdo"],
    },
    rightArtist: {
      name: "가쓰시카 호쿠사이 & 장택단",
      lifespan: "북송 12세기 / 에도 19세기",
      countryFlag: "🇯🇵",
      nickname: "파도의 판화가 & 천하 번화가의 기록자",
      signatureStyle: "프러시안 블루의 역동적 파도 구도와 814명 군상의 초정밀 파노라마",
      representativeArtworkIds: ["great_wave", "qingming_scroll", "travelers_mountains"],
    },
    clashTimeline: [
      {
        year: "1100년대 북송 개봉",
        eventTitle: "장택단 '청명상하도'와 범관 '계산행려도' — 동양 산수·풍속화의 기준",
        detail:
          "대자연의 압도적 숭고함(계산행려도)과 번화한 인간 세상의 활기(청명상하도)가 동양 회화의 두 기둥을 세웠습니다.",
      },
      {
        year: "1751년 & 1800년대 조선 한양",
        eventTitle: "정선의 '인왕제색도'와 신윤복의 '미인도' 탄생",
        detail:
          "중국 산수를 모방하던 관습을 깨고 우리 땅 인왕산의 비 갠 뒤 실경을 그린 정선, 그리고 조선 여인의 당당한 아름다움과 색채를 꽃피운 신윤복이 우리 미술의 독자적 경지를 열었습니다.",
      },
      {
        year: "1831년 에도 & 파리",
        eventTitle: "호쿠사이의 '높은 파도', 고흐와 모네의 방에 걸리다",
        detail:
          "72세의 호쿠사이가 찍어낸 우키요에 목판화가 파리로 건너가 고흐('별이 빛나는 밤'의 소용돌이)와 모네, 드뷔시('바다' 교향곡)에게 결정적 영감을 주었습니다.",
      },
    ],
    curatorVerdict:
      "서양 미술이 원근법과 유화의 빛을 탐구할 때, 동아시아의 거장들은 붓선의 호흡과 여백의 미학으로 천 년을 뛰어넘는 생동감을 완성했습니다.",
  },
];

export const CLOSEUP_DETECTIVE_CHALLENGES: CloseupQuizItem[] = [
  {
    id: "cq_1",
    artworkId: "arnolfini",
    zoomX: 50,
    zoomY: 28,
    zoomScale: 3.4,
    clueTitle: "🕵️ 단서 #1 : 벽면 한가운데 걸린 지름 5cm의 '볼록 거울'",
    clueHint: "거울 테두리에 예수의 수난 10장면이 세공되어 있고, 거울 속에 화가 자신을 포함한 증인 2명이 비치고 있어요!",
    options: ["arnolfini", "las_meninas", "mona_lisa", "milkmaid"],
  },
  {
    id: "cq_2",
    artworkId: "the_kiss",
    zoomX: 56,
    zoomY: 88,
    zoomScale: 3.2,
    clueTitle: "🕵️ 단서 #2 : 야생화 절벽 끝을 아슬아슬하게 움켜쥔 '맨발의 발가락'",
    clueHint: "실제 순금박 망토에 감싸인 연인이 꽃밭 낭떠러지 끝에서 입을 맞추고 있는 황금 시대의 대표작입니다.",
    options: ["the_kiss", "birth_of_venus", "miindo", "la_japonaise"],
  },
  {
    id: "cq_3",
    artworkId: "creation_of_adam",
    zoomX: 49,
    zoomY: 48,
    zoomScale: 3.5,
    clueTitle: "🕵️ 단서 #3 : 닿을 듯 말 듯 1cm 떨어진 '두 검지 손가락 끝'",
    clueHint: "바티칸 시스티나 성당 천장에 그려진 작품으로, 오른쪽 붉은 망토는 인간의 두뇌 단면도를 닮았습니다.",
    options: ["creation_of_adam", "school_of_athens", "prodigal_son", "liberty_leading"],
  },
  {
    id: "cq_4",
    artworkId: "great_wave",
    zoomX: 52,
    zoomY: 72,
    zoomScale: 3.3,
    clueTitle: "🕵️ 단서 #4 : 거대한 파도 골짜기 너머로 작게 보이는 '눈 덮인 후지산'",
    clueHint: "앞쪽의 집어삼킬 듯한 물보라가 사실은 뒤쪽의 후지산 눈보라와 똑같은 형태로 대칭을 이루는 판화입니다.",
    options: ["great_wave", "inwang_jesaekdo", "rain_steam_speed", "ulysses_sirens"],
  },
  {
    id: "cq_5",
    artworkId: "miindo",
    zoomX: 47,
    zoomY: 42,
    zoomScale: 3.4,
    clueTitle: "🕵️ 단서 #5 : 자주색 고름 끝에서 살며시 만지작거리는 '삼작노리개'",
    clueHint: "가채 머리와 쪽빛 치마, 버선코의 유려한 곡선으로 조선 여인의 아름다움을 담아낸 간송미술관 소장 보물입니다.",
    options: ["miindo", "pearl_earring", "belle_ferronniere", "shakuntala_varma"],
  },
  {
    id: "cq_6",
    artworkId: "jadeite_cabbage",
    zoomX: 60,
    zoomY: 22,
    zoomScale: 3.5,
    clueTitle: "🕵️ 단서 #6 : 에메랄드빛 잎사귀 끝에 숨어 있는 '초록 여치와 메뚜기'",
    clueHint: "타이베이 국립고궁박물원 최고의 인기 유물로, 절반은 흰색·절반은 녹색인 천연 비취 원석을 그대로 깎아 만들었습니다.",
    options: ["jadeite_cabbage", "qingming_scroll", "mask_tutankhamun", "irworobongdo"],
  },
];
