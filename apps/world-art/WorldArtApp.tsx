import React, { useState, useEffect, useMemo } from "react";
import {
  TossButton,
  AdBanner,
  RewardedAdModal,
  TossPayModal,
} from "../../packages/shared";

const TDSColors = {
  bgSecondary: "#F2F4F6",
  textPrimary: "#191F28",
  textSecondary: "#6B7684",
  border: "#E5E8EB",
};
import {
  MUSEUMS,
  MASTERPIECES,
  ART_TASTE_QUIZ,
  MuseumInfo,
  MasterpieceItem,
  SecretHotspot,
  RegionKey,
} from "./catalog";
import {
  SPECIAL_EXHIBITIONS,
  ARTIST_RIVALRIES,
  CLOSEUP_DETECTIVE_CHALLENGES,
} from "./specialContent";
import { WorldMapViewer } from "./WorldMapViewer";
import { ArtworkVisualizer } from "./ArtworkVisualizer";

type TabType = "map" | "special" | "archive" | "quiz" | "passport";

const STORAGE_KEYS = {
  VISITED_MUSEUMS: "world_art_visited_museums_v1",
  BOOKMARKS: "world_art_bookmarks_v1",
  UNLOCKED_STORIES: "world_art_unlocked_vip_v1",
  VIP_PASS: "world_art_vip_pass_v1",
  COLLECTOR_NAME: "world_art_collector_name_v1",
};

/**
 * 미술관 오디오 도슨트 배경 클래식 화음(Web Audio API) 재생 헬퍼
 */
function playMuseumAmbientChord() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [261.63, 329.63, 392.0, 523.25]; // C4 Major 따뜻하고 우아한 갤러리 아르페지오
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + idx * 0.14 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.14 + 1.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 1.65);
    });
  } catch {
    // 오디오 컨텍스트 제한 시 무시
  }
}

export interface WorldArtAppProps {
  onBack?: () => void;
}

export const WorldArtApp: React.FC<WorldArtAppProps> = ({ onBack }) => {
  // 탭 및 선택 상태
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [activeRegion, setActiveRegion] = useState<RegionKey>("all");
  const [selectedMuseumId, setSelectedMuseumId] = useState<string>("louvre");
  const [selectedArtwork, setSelectedArtwork] = useState<MasterpieceItem | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<SecretHotspot | null>(null);

  // 아카이브 검색 및 정렬 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortMode, setSortMode] = useState<"value" | "museum" | "bookmarks">("value");

  // 영구 저장 컬렉션 상태
  const [visitedMuseums, setVisitedMuseums] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.VISITED_MUSEUMS);
      return raw ? JSON.parse(raw) : ["louvre", "seoul_kansong"];
    } catch {
      return ["louvre", "seoul_kansong"];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return raw ? JSON.parse(raw) : ["starry_night", "inwang_jesaekdo"];
    } catch {
      return ["starry_night", "inwang_jesaekdo"];
    }
  });

  const [unlockedStoryIds, setUnlockedStoryIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_STORIES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [hasVipPass, setHasVipPass] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.VIP_PASS) === "true";
    } catch {
      return false;
    }
  });

  const [collectorName, setCollectorName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.COLLECTOR_NAME) || "토스 아트 컬렉터";
    } catch {
      return "토스 아트 컬렉터";
    }
  });

  // 오디오 도슨트 상태
  const [isDocentPlaying, setIsDocentPlaying] = useState<boolean>(false);

  // 취향 진단 & 미니게임 상태
  const [quizSubMode, setQuizSubMode] = useState<"auction" | "closeup" | "taste">("auction");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResultArt, setQuizResultArt] = useState<MasterpieceItem | null>(null);
  const [selectedFortuneCategory, setSelectedFortuneCategory] = useState<string>("전체");

  // 특별 기획전 & 라이벌 열전 탭 상태
  const [specialSubMode, setSpecialSubMode] = useState<"exhibition" | "rivalry">("exhibition");
  const [activeExhibitionId, setActiveExhibitionId] = useState<string>(SPECIAL_EXHIBITIONS[0].id);
  const [activeRivalryId, setActiveRivalryId] = useState<string>(ARTIST_RIVALRIES[0].id);

  // 하이&로우 명화 옥션 감정사 상태
  const [auctionPair, setAuctionPair] = useState<[MasterpieceItem, MasterpieceItem]>(() => [
    MASTERPIECES[0],
    MASTERPIECES[1],
  ]);
  const [auctionStreak, setAuctionStreak] = useState<number>(0);
  const [auctionBestStreak, setAuctionBestStreak] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("world_art_auction_best_v1") || "0");
    } catch {
      return 0;
    }
  });
  const [auctionPickedId, setAuctionPickedId] = useState<string | null>(null);

  // 1% 클로즈업 명화 탐정 퀴즈 상태
  const [closeupIndex, setCloseupIndex] = useState<number>(0);
  const [closeupPickedId, setCloseupPickedId] = useState<string | null>(null);
  const [closeupSolvedCount, setCloseupSolvedCount] = useState<number>(0);

  // 티켓 포토카드 캔버스 미리보기 데이터 URL
  const [ticketArtworkId, setTicketArtworkId] = useState<string>("starry_night");
  const [ticketDataUrl, setTicketDataUrl] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 수익화 모달 상태
  const [pendingStoryArtId, setPendingStoryArtId] = useState<string | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState<boolean>(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);

  // 로컬 스토리지 동기화
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VISITED_MUSEUMS, JSON.stringify(visitedMuseums));
    } catch {}
  }, [visitedMuseums]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_STORIES, JSON.stringify(unlockedStoryIds));
    } catch {}
  }, [unlockedStoryIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIP_PASS, String(hasVipPass));
    } catch {}
  }, [hasVipPass]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLLECTOR_NAME, collectorName);
    } catch {}
  }, [collectorName]);

  // 브라우저 뒤로가기(popstate) 연동으로 모달/탭 이탈 방지
  useEffect(() => {
    const onPopState = () => {
      if (selectedArtwork) {
        stopDocentSpeech();
        setSelectedArtwork(null);
        setActiveHotspot(null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selectedArtwork]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2600);
  };

  // 오늘의 날짜 기반 행운의 명화 선정
  const todaysLuckyArtwork = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 1000 + (today.getMonth() + 1) * 50 + today.getDate();
    return MASTERPIECES[seed % MASTERPIECES.length];
  }, []);

  const selectedMuseum: MuseumInfo = useMemo(
    () => MUSEUMS.find((m) => m.id === selectedMuseumId) || MUSEUMS[0],
    [selectedMuseumId]
  );

  const museumArtworks = useMemo(
    () => MASTERPIECES.filter((art) => art.museumId === selectedMuseumId),
    [selectedMuseumId]
  );

  const filteredArchiveArtworks = useMemo(() => {
    let list = [...MASTERPIECES];
    if (activeRegion !== "all") {
      const regionMuseumIds = MUSEUMS.filter((m) => m.region === activeRegion).map((m) => m.id);
      list = list.filter((art) => regionMuseumIds.includes(art.museumId));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.artist.toLowerCase().includes(q) ||
          art.movement.toLowerCase().includes(q) ||
          art.originalTitle.toLowerCase().includes(q)
      );
    }
    if (sortMode === "bookmarks") {
      list = list.filter((art) => bookmarkedIds.includes(art.id));
    } else if (sortMode === "value") {
      list.sort((a, b) => b.estimatedValueBillionKrw - a.estimatedValueBillionKrw);
    }
    return list;
  }, [activeRegion, searchQuery, sortMode, bookmarkedIds]);

  // 작품 상세 모달 열기 (처음 열 때는 그림 위 번호 없이 깨끗하게 시작)
  const openArtworkModal = (artwork: MasterpieceItem) => {
    window.history.pushState({ modal: "artwork", id: artwork.id }, "");
    stopDocentSpeech();
    setSelectedArtwork(artwork);
    setActiveHotspot(null);
    if (!visitedMuseums.includes(artwork.museumId)) {
      setVisitedMuseums((prev) => [...prev, artwork.museumId]);
      const museum = MUSEUMS.find((m) => m.id === artwork.museumId);
      if (museum) {
        showToast(`🛂 [${museum.stampTitle}] 여권 입국 스탬프가 찍혔어요!`);
      }
    }
  };

  const closeArtworkModal = () => {
    stopDocentSpeech();
    setSelectedArtwork(null);
    setActiveHotspot(null);
  };

  const toggleBookmark = (artId: string) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(artId);
      showToast(exists ? "컬렉션 북마크에서 해제했어요." : "⭐ 나만의 명화 컬렉션에 저장했어요!");
      return exists ? prev.filter((id) => id !== artId) : [...prev, artId];
    });
  };

  const stampMuseumVisit = (museum: MuseumInfo) => {
    if (!visitedMuseums.includes(museum.id)) {
      setVisitedMuseums((prev) => [...prev, museum.id]);
      playMuseumAmbientChord();
      showToast(`🛂 ${museum.flag} ${museum.name} 입국 스탬프 획득 완료!`);
    } else {
      showToast(`이미 스탬프를 획득한 미술관입니다 (${museum.stampCode})`);
    }
  };

  // 오디오 도슨트 음성 안내 시작/정지
  const toggleDocentSpeech = (artwork: MasterpieceItem) => {
    if (isDocentPlaying) {
      stopDocentSpeech();
      return;
    }
    playMuseumAmbientChord();
    setIsDocentPlaying(true);

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          `${artwork.title}. 화가 ${artwork.artist}. ${artwork.docentScript}`
        );
        utter.lang = "ko-KR";
        utter.rate = 0.98;
        utter.onend = () => setIsDocentPlaying(false);
        utter.onerror = () => setIsDocentPlaying(false);
        window.speechSynthesis.speak(utter);
      } catch {
        setTimeout(() => setIsDocentPlaying(false), 6000);
      }
    } else {
      setTimeout(() => setIsDocentPlaying(false), 6000);
    }
  };

  const stopDocentSpeech = () => {
    setIsDocentPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  };

  // 취향 진단 퀴즈 결과 계산
  const handleSelectQuizOption = (qIndex: number, optionIndex: number) => {
    const next = { ...quizAnswers, [`q${qIndex + 1}`]: optionIndex };
    setQuizAnswers(next);

    if (Object.keys(next).length === ART_TASTE_QUIZ.length) {
      const scoreMap: Record<string, number> = {};
      ART_TASTE_QUIZ.forEach((q, idx) => {
        const chosenIdx = next[`q${idx + 1}`];
        const opt = q.options[chosenIdx];
        if (opt) {
          Object.entries(opt.scores).forEach(([artId, weight]) => {
            scoreMap[artId] = (scoreMap[artId] || 0) + weight;
          });
        }
      });

      let bestArt = MASTERPIECES[0];
      let bestScore = -1;
      MASTERPIECES.forEach((art) => {
        const sc = scoreMap[art.id] || 0;
        if (sc > bestScore) {
          bestScore = sc;
          bestArt = art;
        }
      });
      playMuseumAmbientChord();
      setQuizResultArt(bestArt);
      setTicketArtworkId(bestArt.id);
    }
  };

  // 하이&로우 옥션 감정사: 서로 다른 추정가치를 가진 두 명화 뽑기
  const rollNextAuctionPair = () => {
    const aIdx = Math.floor(Math.random() * MASTERPIECES.length);
    const first = MASTERPIECES[aIdx];
    const candidates = MASTERPIECES.filter(
      (item) => item.id !== first.id && item.estimatedValueBillionKrw !== first.estimatedValueBillionKrw
    );
    const second = candidates[Math.floor(Math.random() * candidates.length)] || MASTERPIECES[(aIdx + 1) % MASTERPIECES.length];
    setAuctionPair([first, second]);
    setAuctionPickedId(null);
  };

  const handlePickAuctionWinner = (pickedId: string) => {
    if (auctionPickedId) return;
    setAuctionPickedId(pickedId);
    const [left, right] = auctionPair;
    const winnerId =
      left.estimatedValueBillionKrw >= right.estimatedValueBillionKrw ? left.id : right.id;
    if (pickedId === winnerId) {
      playMuseumAmbientChord();
      const nextStreak = auctionStreak + 1;
      setAuctionStreak(nextStreak);
      if (nextStreak > auctionBestStreak) {
        setAuctionBestStreak(nextStreak);
        try {
          localStorage.setItem("world_art_auction_best_v1", String(nextStreak));
        } catch {}
      }
      showToast(`🔨 정답! 수석 옥션 감정사 ${nextStreak}연승 달성!`);
    } else {
      setAuctionStreak(0);
      showToast("아쉬워요! 두 작품의 실제 감정가와 비하인드를 확인해보세요.");
    }
  };

  // HTML5 Canvas 기반 나만의 미술관 티켓 & 포토카드 PNG 생성 (실제 명화 원화 이미지 포함)
  const generateMuseumTicketPng = (artwork: MasterpieceItem) => {
    const museum = MUSEUMS.find((m) => m.id === artwork.museumId) || MUSEUMS[0];

    const renderTicketWithImage = (loadedImg: HTMLImageElement | null) => {
      const canvas = document.createElement("canvas");
      canvas.width = 720;
      canvas.height = 1040;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. 배경 그라데이션
      const bgGrad = ctx.createLinearGradient(0, 0, 720, 1040);
      bgGrad.addColorStop(0, "#0F172A");
      bgGrad.addColorStop(0.55, "#1E293B");
      bgGrad.addColorStop(1, "#090D16");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 720, 1040);

      // 2. 티켓 메인 카드 프레임
      ctx.fillStyle = "#FFFDF9";
      ctx.beginPath();
      ctx.roundRect(44, 52, 632, 936, 28);
      ctx.fill();

      // 상단 미술관 헤더 바
      const headerGrad = ctx.createLinearGradient(44, 52, 676, 170);
      headerGrad.addColorStop(0, museum.badgeColor);
      headerGrad.addColorStop(1, "#1E293B");
      ctx.fillStyle = headerGrad;
      ctx.beginPath();
      ctx.roundRect(44, 52, 632, 128, [28, 28, 0, 0]);
      ctx.fill();

      ctx.fillStyle = "#FACC15";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`WORLD ART VIP ADMISSION TICKET  |  ${museum.stampCode}`, 80, 102);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`${museum.flag} ${museum.name} (${museum.city})`, 80, 146);

      // 3. 명화 액자 프레임 & 실제 원화 이미지 렌더링
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(80, 204, 560, 356, 20);
      ctx.clip();

      const artGrad = ctx.createLinearGradient(80, 204, 640, 560);
      artGrad.addColorStop(0, "#0B0F19");
      artGrad.addColorStop(1, "#1E293B");
      ctx.fillStyle = artGrad;
      ctx.fillRect(80, 204, 560, 356);

      if (loadedImg && loadedImg.width > 0 && loadedImg.height > 0) {
        // 배경 은은한 꽉 찬 이미지
        ctx.globalAlpha = 0.28;
        ctx.drawImage(loadedImg, 80, 204, 560, 356);
        ctx.globalAlpha = 1.0;

        // 중앙 원본 비율 유지 이미지
        const boxW = 540;
        const boxH = 336;
        const scale = Math.min(boxW / loadedImg.width, boxH / loadedImg.height);
        const drawW = loadedImg.width * scale;
        const drawH = loadedImg.height * scale;
        const drawX = 80 + (560 - drawW) / 2;
        const drawY = 204 + (356 - drawH) / 2;
        ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);
      } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(`“${artwork.title}”`, 110, 370);
      }
      ctx.restore();

      // 액자 골드 보더
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(80, 204, 560, 356, 20);
      ctx.stroke();

      // 4. 작품 도슨트 요약 & 행운 메시지
      ctx.fillStyle = "#191F28";
      ctx.font = "bold 25px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`${artwork.title} · ${artwork.artist}`, 80, 606);

      ctx.fillStyle = "#4E5968";
      ctx.font = "600 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`사조: ${artwork.movement} (${artwork.year})  |  가치: ${artwork.estimatedValueText.slice(0, 22)}`, 80, 642);

      // 행운 부적 박스
      ctx.fillStyle = "#F2F4F6";
      ctx.beginPath();
      ctx.roundRect(80, 670, 560, 98, 16);
      ctx.fill();

      ctx.fillStyle = "#1B64DA";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`✨ [${artwork.fortuneTag.category}] 큐레이터 행운 메시지`, 104, 706);

      ctx.fillStyle = "#333D4B";
      ctx.font = "500 16.5px -apple-system, BlinkMacSystemFont, sans-serif";
      const blessingShort =
        artwork.fortuneTag.blessing.length > 38
          ? artwork.fortuneTag.blessing.slice(0, 38) + "..."
          : artwork.fortuneTag.blessing;
      ctx.fillText(blessingShort, 104, 742);

      // 5. 티켓 절취선
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(64, 805);
      ctx.lineTo(656, 805);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6. 하단 관람객 이름 & 입국 스탬프 도장
      const dateStr = new Date().toISOString().slice(0, 10);
      ctx.fillStyle = "#6B7684";
      ctx.font = "600 17px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`COLLECTOR: ${collectorName || "토스 아트 컬렉터"}`, 80, 858);
      ctx.fillText(`ISSUED DATE: ${dateStr}   |   PASSPORT STAMPED`, 80, 892);
      ctx.fillStyle = "#191F28";
      ctx.font = "bold 20px monospace";
      ctx.fillText("|||| |||| || ||||| |||| ||| |||| |||||", 80, 940);

      // 원형 스탬프 인장
      ctx.save();
      ctx.translate(555, 890);
      ctx.rotate(-0.18);
      ctx.strokeStyle = "#E11D48";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 58, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#E11D48";
      ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WORLD ART", 0, -14);
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(museum.stampCode, 0, 10);
      ctx.font = "600 13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("VERIFIED", 0, 32);
      ctx.restore();

      const url = canvas.toDataURL("image/png");
      setTicketDataUrl(url);

      const link = document.createElement("a");
      link.href = url;
      link.download = `world-art-ticket-${artwork.id}.png`;
      link.click();
      showToast("🎟️ 실제 명화가 담긴 미술관 VIP 티켓이 저장되었어요!");
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => renderTicketWithImage(img);
    img.onerror = () => renderTicketWithImage(null);
    img.src = artwork.imageUrl;
  };

  // 컬렉터 등급 산정 (21개 미술관 기준)
  const collectorRank = useMemo(() => {
    const count = visitedMuseums.length;
    if (count >= 15) return { title: "🏆 월드 마스터 컬렉터", desc: "6대주 주요 미술관을 제패한 전설적인 도슨트" };
    if (count >= 10) return { title: "👑 루브르 명예 큐레이터", desc: "대륙을 넘나들며 명화의 비밀을 꿰뚫는 안목" };
    if (count >= 5) return { title: "🎨 글로벌 그랜드 투어러", desc: "세계 미술관 순례의 즐거움에 눈뜬 여행자" };
    return { title: "🌱 방구석 아트 탐험가", desc: "지도를 넓혀 미술관 핀을 터치해 스탬프를 모아보세요!" };
  }, [visitedMuseums.length]);

  // 지도에서 미술관 선택 시 가로 퀵 선택 바의 해당 버튼이 보이도록 자동 스크롤
  useEffect(() => {
    const el = document.getElementById(`museum-pill-${selectedMuseumId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedMuseumId]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: TDSColors.bgSecondary,
        color: TDSColors.textPrimary,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif",
        paddingBottom: "96px",
      }}
    >
      {/* 상단 토스트 알림 */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(25, 31, 40, 0.94)",
            color: "#FFFFFF",
            padding: "11px 18px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: 700,
            zIndex: 2000,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            whiteSpace: "nowrap",
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* 앱 인라인 헤더 (토스 네이티브 상단바와 중복되지 않는 타이틀 영역) */}
      <div
        style={{
          background: "#FFFFFF",
          padding: "18px 20px 14px",
          borderBottom: `1px solid ${TDSColors.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    border: "1px solid #E5E8EB",
                    background: "#F9FAFB",
                    borderRadius: "8px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  ← 포털
                </button>
              )}
              <span
                style={{
                  background: "#191F28",
                  color: "#FACC15",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                WORLD ART MAP
              </span>
              <span style={{ fontSize: "12px", color: TDSColors.textSecondary, fontWeight: 600 }}>
                6대주 27대 미술관 · 38대 불멸의 명화
              </span>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 0", letterSpacing: "-0.4px" }}>
              월드아트맵 : 세계 미술관 투어
            </h1>
          </div>

          {/* 여권 스탬프 현황 뱃지 */}
          <button
            type="button"
            onClick={() => setActiveTab("passport")}
            style={{
              background: "#F2F4F6",
              border: "none",
              borderRadius: "14px",
              padding: "8px 12px",
              cursor: "pointer",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "11px", color: "#6B7684", fontWeight: 700 }}>🛂 내 아트여권</div>
            <div style={{ fontSize: "14px", color: "#3182F6", fontWeight: 800 }}>
              {visitedMuseums.length} / {MUSEUMS.length} 스탬프
            </div>
          </button>
        </div>

        {/* 상단 네비게이션 5탭 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "4px",
            marginTop: "14px",
            background: "#F2F4F6",
            padding: "4px",
            borderRadius: "14px",
          }}
        >
          {(
            [
              { id: "map", label: "🗺️ 세계지도" },
              { id: "special", label: "🏛️ 기획·라이벌" },
              { id: "archive", label: "🖼️ 명화도감" },
              { id: "quiz", label: "🔨 옥션·진단" },
              { id: "passport", label: "🛂 아트여권" },
            ] as Array<{ id: TabType; label: string }>
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "9px 2px",
                  fontSize: "12px",
                  fontWeight: active ? 800 : 600,
                  background: active ? "#FFFFFF" : "transparent",
                  color: active ? "#191F28" : "#6B7684",
                  boxShadow: active ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 메인 콘텐츠 컨테이너 */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>
        {/* ================= 1. 세계지도 탭 ================= */}
        {activeTab === "map" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* 오늘의 행운 명화 큐레이션 배너 */}
            <div
              onClick={() => openArtworkModal(todaysLuckyArtwork)}
              style={{
                background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
                borderRadius: "20px",
                padding: "16px",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.16)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span
                    style={{
                      background: "#F59E0B",
                      color: "#191F28",
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: "999px",
                    }}
                  >
                    오늘의 행운 명화
                  </span>
                  <span style={{ fontSize: "12px", color: "#FDE68A", fontWeight: 700 }}>
                    #{todaysLuckyArtwork.fortuneTag.category}
                  </span>
                </div>
                <div style={{ fontSize: "16px", fontWeight: 800, marginBottom: "3px" }}>
                  {todaysLuckyArtwork.title} · {todaysLuckyArtwork.artist}
                </div>
                <div style={{ fontSize: "12px", color: "#CBD5E1", lineHeight: 1.4 }}>
                  {todaysLuckyArtwork.fortuneTag.blessing}
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.12)",
                  padding: "9px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#FACC15",
                  flexShrink: 0,
                }}
              >
                감상하기 →
              </div>
            </div>

            {/* 인터랙티브 세계지도 카드 */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "22px",
                padding: "16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 800, margin: 0 }}>
                    🌍 6대주 27대 미술관 인터랙티브 월드맵
                  </h2>
                  <p style={{ fontSize: "12px", color: TDSColors.textSecondary, margin: "3px 0 0" }}>
                    대륙을 확대하거나 핀을 눌러 각 미술관의 대표 걸작을 만나보세요
                  </p>
                </div>
              </div>

              <WorldMapViewer
                museums={MUSEUMS}
                masterpieces={MASTERPIECES}
                selectedMuseumId={selectedMuseumId}
                visitedMuseumIds={visitedMuseums}
                activeRegion={activeRegion}
                onSelectMuseum={(id) => setSelectedMuseumId(id)}
                onChangeRegion={(reg) => setActiveRegion(reg)}
              />

              {/* 가로 스크롤 미술관 퀵 선택 바 */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  marginTop: "12px",
                  paddingBottom: "4px",
                }}
              >
                {MUSEUMS.filter((m) => activeRegion === "all" || m.region === activeRegion).map((m) => {
                  const isSel = m.id === selectedMuseumId;
                  const visited = visitedMuseums.includes(m.id);
                  return (
                    <button
                      id={`museum-pill-${m.id}`}
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMuseumId(m.id)}
                      style={{
                        flexShrink: 0,
                        border: isSel ? `2px solid ${m.badgeColor}` : "1px solid #E5E8EB",
                        background: isSel ? "#F8FAFC" : "#FFFFFF",
                        borderRadius: "14px",
                        padding: "8px 12px",
                        cursor: "pointer",
                        textAlign: "left",
                        minWidth: "125px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "15px" }}>{m.flag}</span>
                        {visited && (
                          <span
                            style={{
                              fontSize: "10px",
                              background: "#DCFCE7",
                              color: "#15803D",
                              padding: "1px 6px",
                              borderRadius: "999px",
                              fontWeight: 800,
                            }}
                          >
                            스탬프 ✓
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 800,
                          color: "#191F28",
                          marginTop: "4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6B7684" }}>
                        {m.city} · {m.country}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 지도 바로 아래: 선택된 미술관 즉시 프리뷰 & 이전/다음 미술관 투어 버튼 */}
              <div
                style={{
                  marginTop: "12px",
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "16px",
                  padding: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                    <span style={{ fontSize: "18px" }}>{selectedMuseum.flag}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#191F28",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {selectedMuseum.name}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#3182F6",
                        background: "#EFF6FF",
                        padding: "2px 7px",
                        borderRadius: "999px",
                        flexShrink: 0,
                      }}
                    >
                      대표작 {museumArtworks.length}점
                    </span>
                  </div>

                  {/* 이전/다음 미술관 빠른 투어 버튼 */}
                  <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        const pool = MUSEUMS.filter((m) => activeRegion === "all" || m.region === activeRegion);
                        const idx = pool.findIndex((m) => m.id === selectedMuseumId);
                        const prev = pool[(idx - 1 + pool.length) % pool.length] || MUSEUMS[0];
                        setSelectedMuseumId(prev.id);
                      }}
                      style={{
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        borderRadius: "8px",
                        padding: "4px 9px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      ◀ 이전 미술관
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const pool = MUSEUMS.filter((m) => activeRegion === "all" || m.region === activeRegion);
                        const idx = pool.findIndex((m) => m.id === selectedMuseumId);
                        const next = pool[(idx + 1) % pool.length] || MUSEUMS[0];
                        setSelectedMuseumId(next.id);
                      }}
                      style={{
                        border: "1px solid #CBD5E1",
                        background: "#FFFFFF",
                        borderRadius: "8px",
                        padding: "4px 9px",
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      다음 미술관 ▶
                    </button>
                  </div>
                </div>

                {/* 소장 명화 썸네일 바로가기 스트립 (스크롤 내리지 않고 즉시 감상 가능) */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
                  {museumArtworks.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => openArtworkModal(art)}
                      style={{
                        flex: "1 1 0",
                        minWidth: "210px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "12px",
                        padding: "8px 10px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "8px",
                          objectFit: "cover",
                          background: "#0F172A",
                          flexShrink: 0,
                          border: "1.5px solid #D97706",
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#191F28",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {art.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6B7684", fontWeight: 600 }}>
                          {art.artist} · {art.year}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#D97706",
                          background: "#FEF3C7",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      >
                        크게 보기
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 선택된 미술관 상세 브리핑 & 소장 명화 리스트 */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "22px",
                padding: "18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "22px" }}>{selectedMuseum.flag}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        background: selectedMuseum.badgeColor,
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      {selectedMuseum.stampCode}
                    </span>
                    <span style={{ fontSize: "12px", color: "#6B7684", fontWeight: 600 }}>
                      설립 {selectedMuseum.foundedYear} · 연간 {selectedMuseum.annualVisitors} 방문
                    </span>
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "6px 0 2px" }}>
                    {selectedMuseum.name}{" "}
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B7684" }}>
                      ({selectedMuseum.englishName})
                    </span>
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => stampMuseumVisit(selectedMuseum)}
                  style={{
                    flexShrink: 0,
                    border: "none",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    background: visitedMuseums.includes(selectedMuseum.id) ? "#DCFCE7" : "#3182F6",
                    color: visitedMuseums.includes(selectedMuseum.id) ? "#15803D" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  {visitedMuseums.includes(selectedMuseum.id) ? "🛂 입국 스탬프 완료" : "🛂 입국 스탬프 찍기"}
                </button>
              </div>

              <p style={{ fontSize: "13px", color: "#333D4B", lineHeight: 1.55, margin: "10px 0" }}>
                {selectedMuseum.desc}
              </p>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  fontSize: "12px",
                  color: "#1E293B",
                  marginBottom: "16px",
                }}
              >
                💡 <strong>수석 큐레이터 직관 꿀팁:</strong> {selectedMuseum.highlightTip}
              </div>

              <div style={{ fontSize: "15px", fontWeight: 800, marginBottom: "12px" }}>
                🖼️ 이 미술관의 대표 불멸의 걸작 ({museumArtworks.length}점)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {museumArtworks.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => openArtworkModal(art)}
                    style={{
                      border: "1px solid #E5E8EB",
                      borderRadius: "18px",
                      padding: "14px",
                      cursor: "pointer",
                      background: "#FFFFFF",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <ArtworkVisualizer artwork={art} interactive={false} showHotspots={true} height={210} framed={true} />

                    <div style={{ marginTop: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#B45309",
                            background: "#FEF3C7",
                            padding: "3px 8px",
                            borderRadius: "6px",
                          }}
                        >
                          💰 {art.estimatedValueText}
                        </span>
                        <span style={{ fontSize: "12px", color: "#3182F6", fontWeight: 700, flexShrink: 0 }}>
                          🔍 상세 감상 · 비밀 포인트 →
                        </span>
                      </div>

                      <h4 style={{ fontSize: "18px", fontWeight: 800, margin: "8px 0 3px" }}>
                        {art.title}{" "}
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#6B7684" }}>
                          ({art.originalTitle})
                        </span>
                      </h4>
                      <div style={{ fontSize: "13px", color: "#4E5968", fontWeight: 600 }}>
                        {art.artist} · {art.year} · {art.medium}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. 스페셜 테마 기획전 & 거장 라이벌 열전 탭 ================= */}
        {activeTab === "special" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* 서브모드 스위처: 스페셜 테마 기획전 vs 세기의 거장 라이벌 열전 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                background: "#FFFFFF",
                padding: "6px",
                borderRadius: "16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              }}
            >
              <button
                type="button"
                onClick={() => setSpecialSubMode("exhibition")}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  padding: "11px 8px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: specialSubMode === "exhibition" ? "#191F28" : "transparent",
                  color: specialSubMode === "exhibition" ? "#FACC15" : "#6B7684",
                }}
              >
                🕯️ 스페셜 테마 기획전 (4관)
              </button>
              <button
                type="button"
                onClick={() => setSpecialSubMode("rivalry")}
                style={{
                  border: "none",
                  borderRadius: "12px",
                  padding: "11px 8px",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                  background: specialSubMode === "rivalry" ? "#191F28" : "transparent",
                  color: specialSubMode === "rivalry" ? "#FACC15" : "#6B7684",
                }}
              >
                ⚔️ 세기의 거장 라이벌전 (5전)
              </button>
            </div>

            {specialSubMode === "exhibition" ? (
              (() => {
                const activeEx =
                  SPECIAL_EXHIBITIONS.find((ex) => ex.id === activeExhibitionId) || SPECIAL_EXHIBITIONS[0];
                const exArtworks = activeEx.artworkIds
                  .map((id) => MASTERPIECES.find((a) => a.id === id))
                  .filter((a): a is MasterpieceItem => Boolean(a));

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* 4대 기획전 선택 탭 */}
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                      {SPECIAL_EXHIBITIONS.map((ex) => {
                        const isSel = ex.id === activeEx.id;
                        return (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => setActiveExhibitionId(ex.id)}
                            style={{
                              flexShrink: 0,
                              border: isSel ? `2px solid ${ex.themeColor}` : "1px solid #E5E8EB",
                              background: isSel ? "#0F172A" : "#FFFFFF",
                              color: isSel ? "#FFFFFF" : "#333D4B",
                              borderRadius: "14px",
                              padding: "9px 13px",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                color: isSel ? ex.themeColor : "#6B7684",
                              }}
                            >
                              {ex.badge}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 800, marginTop: "2px", whiteSpace: "nowrap" }}>
                              {ex.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 선택된 기획전 히어로 배너 */}
                    <div
                      style={{
                        background: activeEx.bgGradient,
                        borderRadius: "22px",
                        padding: "20px",
                        color: "#FFFFFF",
                        boxShadow: "0 10px 26px rgba(15, 23, 42, 0.22)",
                      }}
                    >
                      <span
                        style={{
                          background: activeEx.themeColor,
                          color: "#0F172A",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "999px",
                        }}
                      >
                        {activeEx.badge} · 출품작 {exArtworks.length}점
                      </span>
                      <h2 style={{ fontSize: "21px", fontWeight: 800, margin: "10px 0 4px" }}>{activeEx.title}</h2>
                      <div style={{ fontSize: "13px", color: "#FDE68A", fontWeight: 700, marginBottom: "10px" }}>
                        {activeEx.subtitle}
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#E2E8F0",
                          lineHeight: 1.55,
                          margin: 0,
                          background: "rgba(255,255,255,0.08)",
                          padding: "12px",
                          borderRadius: "12px",
                        }}
                      >
                        🎙️ <strong>수석 큐레이터 서문:</strong> {activeEx.curatorIntro}
                      </p>
                    </div>

                    {/* 기획전 출품 명화 & 비하인드 에피소드 카드 */}
                    {exArtworks.map((art, idx) => {
                      const museum = MUSEUMS.find((m) => m.id === art.museumId);
                      const ep = activeEx.episodeNotes[art.id];
                      return (
                        <div
                          key={art.id}
                          onClick={() => openArtworkModal(art)}
                          style={{
                            background: "#FFFFFF",
                            borderRadius: "20px",
                            padding: "16px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                            cursor: "pointer",
                            border: "1px solid #E5E8EB",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "10px",
                            }}
                          >
                            <span
                              style={{
                                background: "#0F172A",
                                color: "#FACC15",
                                fontSize: "11px",
                                fontWeight: 800,
                                padding: "3px 9px",
                                borderRadius: "999px",
                              }}
                            >
                              EXHIBIT #{idx + 1}
                            </span>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#4E5968" }}>
                              {museum?.flag} {museum?.name}
                            </span>
                          </div>

                          <ArtworkVisualizer artwork={art} interactive={false} height={215} framed={true} />

                          <div style={{ marginTop: "12px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 4px" }}>
                              {art.title} · <span style={{ fontSize: "14px", color: "#6B7684" }}>{art.artist}</span>
                            </h3>

                            {ep && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  background: "#FFFBEB",
                                  border: "1px solid #FDE68A",
                                  borderRadius: "14px",
                                  padding: "12px",
                                }}
                              >
                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E", marginBottom: "4px" }}>
                                  {ep.headline}
                                </div>
                                <div style={{ fontSize: "12.5px", color: "#78350F", lineHeight: 1.55 }}>
                                  {ep.story}
                                </div>
                              </div>
                            )}

                            <div
                              style={{
                                marginTop: "10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: "12px",
                                fontWeight: 800,
                                color: "#3182F6",
                              }}
                            >
                              <span>💰 {art.estimatedValueText}</span>
                              <span>🔍 초고화질 확대 & 비밀 포인트 보기 →</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              (() => {
                const activeRiv =
                  ARTIST_RIVALRIES.find((r) => r.id === activeRivalryId) || ARTIST_RIVALRIES[0];
                const leftArts = activeRiv.leftArtist.representativeArtworkIds
                  .map((id) => MASTERPIECES.find((a) => a.id === id))
                  .filter((a): a is MasterpieceItem => Boolean(a));
                const rightArts = activeRiv.rightArtist.representativeArtworkIds
                  .map((id) => MASTERPIECES.find((a) => a.id === id))
                  .filter((a): a is MasterpieceItem => Boolean(a));

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {/* 5대 라이벌 매치 선택 바 */}
                    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                      {ARTIST_RIVALRIES.map((riv) => {
                        const isSel = riv.id === activeRiv.id;
                        return (
                          <button
                            key={riv.id}
                            type="button"
                            onClick={() => setActiveRivalryId(riv.id)}
                            style={{
                              flexShrink: 0,
                              border: isSel ? "2px solid #F59E0B" : "1px solid #E5E8EB",
                              background: isSel ? "#1E293B" : "#FFFFFF",
                              color: isSel ? "#FFFFFF" : "#333D4B",
                              borderRadius: "14px",
                              padding: "9px 13px",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "10px",
                                fontWeight: 800,
                                color: isSel ? "#FACC15" : "#6B7684",
                              }}
                            >
                              {riv.eraBadge}
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 800, marginTop: "2px", whiteSpace: "nowrap" }}>
                              {riv.title}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* 라이벌 매치 메인 카드 */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                        borderRadius: "22px",
                        padding: "18px",
                        color: "#FFFFFF",
                      }}
                    >
                      <span
                        style={{
                          background: "#F59E0B",
                          color: "#0F172A",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "999px",
                        }}
                      >
                        {activeRiv.eraBadge}
                      </span>
                      <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "10px 0 6px" }}>{activeRiv.title}</h2>
                      <p style={{ fontSize: "13px", color: "#CBD5E1", lineHeight: 1.5, margin: "0 0 14px" }}>
                        {activeRiv.matchupSummary}
                      </p>

                      {/* 좌우 거장 스펙 비교 */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        {[activeRiv.leftArtist, activeRiv.rightArtist].map((artist, sideIdx) => (
                          <div
                            key={artist.name}
                            style={{
                              background:
                                sideIdx === 0 ? "rgba(59, 130, 246, 0.16)" : "rgba(245, 158, 11, 0.16)",
                              border:
                                sideIdx === 0
                                  ? "1px solid rgba(96, 165, 250, 0.45)"
                                  : "1px solid rgba(251, 191, 36, 0.45)",
                              borderRadius: "16px",
                              padding: "12px",
                            }}
                          >
                            <div style={{ fontSize: "11px", color: "#FDE68A", fontWeight: 800 }}>
                              {artist.countryFlag} {artist.lifespan}
                            </div>
                            <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "3px" }}>{artist.name}</div>
                            <div style={{ fontSize: "11px", color: "#93C5FD", fontWeight: 700, marginTop: "2px" }}>
                              “{artist.nickname}”
                            </div>
                            <div
                              style={{
                                fontSize: "11.5px",
                                color: "#E2E8F0",
                                marginTop: "8px",
                                lineHeight: 1.45,
                              }}
                            >
                              {artist.signatureStyle}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 세기의 대결 타임라인 */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        borderRadius: "20px",
                        padding: "18px",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                      }}
                    >
                      <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 12px" }}>
                        ⚡ 세기의 라이벌 결정적 순간 타임라인
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {activeRiv.clashTimeline.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "#F8FAFC",
                              borderLeft: "4px solid #3182F6",
                              borderRadius: "0 12px 12px 0",
                              padding: "11px 14px",
                            }}
                          >
                            <div style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB" }}>{item.year}</div>
                            <div style={{ fontSize: "14px", fontWeight: 800, color: "#191F28", margin: "2px 0 4px" }}>
                              {item.eventTitle}
                            </div>
                            <div style={{ fontSize: "12.5px", color: "#4E5968", lineHeight: 1.5 }}>{item.detail}</div>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: "14px",
                          background: "#FFFBEB",
                          border: "1px solid #FDE68A",
                          borderRadius: "14px",
                          padding: "12px",
                          fontSize: "12.5px",
                          color: "#78350F",
                          lineHeight: 1.5,
                        }}
                      >
                        🏛️ <strong>수석 큐레이터 평결:</strong> {activeRiv.curatorVerdict}
                      </div>
                    </div>

                    {/* 두 거장의 대표 걸작 나란히 감상하기 */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        borderRadius: "20px",
                        padding: "18px",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                      }}
                    >
                      <h3 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 12px" }}>
                        🖼️ 두 거장의 대표 걸작 바로 비교 감상
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[...leftArts, ...rightArts].map((art) => (
                          <div
                            key={art.id}
                            onClick={() => openArtworkModal(art)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px",
                              borderRadius: "14px",
                              border: "1px solid #E5E8EB",
                              cursor: "pointer",
                            }}
                          >
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "10px",
                                objectFit: "cover",
                                border: "2px solid #D97706",
                                flexShrink: 0,
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#2563EB" }}>
                                {art.artist} · {art.year}
                              </div>
                              <div style={{ fontSize: "15px", fontWeight: 800, color: "#191F28", marginTop: "2px" }}>
                                {art.title}
                              </div>
                              <div style={{ fontSize: "12px", color: "#B45309", fontWeight: 700, marginTop: "2px" }}>
                                💰 {art.estimatedValueText}
                              </div>
                            </div>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 800,
                                color: "#3182F6",
                                background: "#EFF6FF",
                                padding: "6px 10px",
                                borderRadius: "10px",
                                flexShrink: 0,
                              }}
                            >
                              감상 →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ================= 3. 명화도감 탭 ================= */}
        {activeTab === "archive" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: 800, margin: "0 0 10px" }}>
                🖼️ 전세계 38대 명화 마스터 아카이브
              </h2>

              {/* 검색창 */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="작품명, 화가(고흐, 다빈치, 신윤복), 미술 사조 검색..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 14px",
                  borderRadius: "12px",
                  border: "1px solid #D1D6DB",
                  fontSize: "14px",
                  marginBottom: "10px",
                }}
              />

              {/* 정렬 & 북마크 필터 */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(
                  [
                    { id: "value", label: "💎 추정가치 높은순" },
                    { id: "museum", label: "🏛️ 미술관별 모아보기" },
                    { id: "bookmarks", label: `⭐ 내 컬렉션 (${bookmarkedIds.length})` },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSortMode(item.id)}
                    style={{
                      border: "none",
                      borderRadius: "999px",
                      padding: "7px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: sortMode === item.id ? "#191F28" : "#F2F4F6",
                      color: sortMode === item.id ? "#FFFFFF" : "#4E5968",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredArchiveArtworks.length === 0 ? (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "#6B7684",
                }}
              >
                조건에 맞는 명화가 없습니다. 검색어나 필터를 초기화해보세요.
              </div>
            ) : (
              filteredArchiveArtworks.map((art) => {
                const museum = MUSEUMS.find((m) => m.id === art.museumId);
                const isBookmarked = bookmarkedIds.includes(art.id);
                return (
                  <div
                    key={art.id}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "20px",
                      padding: "16px",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#4E5968" }}>
                        {museum?.flag} {museum?.name} ({museum?.city})
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(art.id)}
                        style={{
                          border: "1px solid #E5E8EB",
                          background: isBookmarked ? "#FEF9C3" : "#FFFFFF",
                          borderRadius: "999px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {isBookmarked ? "⭐ 컬렉션 저장됨" : "☆ 컬렉션 담기"}
                      </button>
                    </div>

                    <div onClick={() => openArtworkModal(art)} style={{ cursor: "pointer" }}>
                      <ArtworkVisualizer artwork={art} interactive={false} showHotspots={true} height={220} />

                      <div style={{ marginTop: "12px" }}>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 800,
                              background: "#FEF3C7",
                              color: "#B45309",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            💰 {art.estimatedValueText}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              background: "#E8F3FF",
                              color: "#1B64DA",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            ✨ {art.fortuneTag.category}
                          </span>
                        </div>

                        <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "4px 0" }}>
                          {art.title} · <span style={{ fontSize: "14px", color: "#4E5968" }}>{art.artist}</span>
                        </h3>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#4E5968",
                            lineHeight: 1.5,
                            margin: "6px 0 10px",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {art.docentScript}
                        </p>

                        <div
                          style={{
                            background: "#F9FAFB",
                            borderRadius: "10px",
                            padding: "9px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#3182F6",
                          }}
                        >
                          <span>🔍 초고화질 돋보기 & 숨은 포인트 {art.secretPoints.length}곳 해설 보기</span>
                          <span>열기 →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= 4. 옥션 감정사 · 클로즈업 탐정 · 취향진단 탭 ================= */}
        {activeTab === "quiz" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* 상단 3종 미니게임 & 취향진단 모드 스위처 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "6px",
                background: "#FFFFFF",
                padding: "6px",
                borderRadius: "16px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              }}
            >
              {(
                [
                  { id: "auction", label: "🔨 옥션 감정사" },
                  { id: "closeup", label: "🕵️ 1% 클로즈업" },
                  { id: "taste", label: "✨ 소울 취향진단" },
                ] as const
              ).map((mode) => {
                const isAct = quizSubMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setQuizSubMode(mode.id)}
                    style={{
                      border: "none",
                      borderRadius: "12px",
                      padding: "10px 4px",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      background: isAct ? "#191F28" : "transparent",
                      color: isAct ? "#FACC15" : "#6B7684",
                    }}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>

            {/* 1) 하이&로우 명화 옥션 감정사 게임 */}
            {quizSubMode === "auction" && (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "22px",
                  padding: "20px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      background: "#FEF3C7",
                      color: "#B45309",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    CHRISTIE'S & SOTHEBY'S AUCTION CHALLENGE
                  </span>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#2563EB" }}>
                    🔥 현재 {auctionStreak}연승 · 최고 {auctionBestStreak}연승
                  </div>
                </div>

                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "8px 0 4px" }}>
                  🔨 두 명화 중 어느 작품의 몸값이 더 높을까요?
                </h2>
                <p style={{ fontSize: "13px", color: "#6B7684", margin: "0 0 16px" }}>
                  국제 전시 보험 가액 및 경매 낙찰가를 기준으로 더 높은 가치를 지닌 명화를 선택해보세요!
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {auctionPair.map((art) => {
                    const isPicked = auctionPickedId === art.id;
                    const winnerId =
                      auctionPair[0].estimatedValueBillionKrw >= auctionPair[1].estimatedValueBillionKrw
                        ? auctionPair[0].id
                        : auctionPair[1].id;
                    const isWinner = art.id === winnerId;
                    const museum = MUSEUMS.find((m) => m.id === art.museumId);

                    return (
                      <div
                        key={art.id}
                        onClick={() => handlePickAuctionWinner(art.id)}
                        style={{
                          border: auctionPickedId
                            ? isWinner
                              ? "2.5px solid #16A34A"
                              : isPicked
                              ? "2.5px solid #DC2626"
                              : "1px solid #E5E8EB"
                            : "2px solid #E2E8F0",
                          background: auctionPickedId
                            ? isWinner
                              ? "#F0FDF4"
                              : isPicked
                              ? "#FEF2F2"
                              : "#F8FAFC"
                            : "#FFFFFF",
                          borderRadius: "18px",
                          padding: "12px",
                          cursor: auctionPickedId ? "default" : "pointer",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "11px", color: "#6B7684", fontWeight: 700, marginBottom: "6px" }}>
                            {museum?.flag} {museum?.city}
                          </div>
                          <img
                            src={art.imageUrl}
                            alt={art.title}
                            style={{
                              width: "100%",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "12px",
                              border: "2px solid #D97706",
                              background: "#0F172A",
                            }}
                          />
                          <div style={{ fontSize: "15px", fontWeight: 800, color: "#191F28", marginTop: "8px" }}>
                            {art.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "#4E5968", fontWeight: 600 }}>
                            {art.artist} ({art.year})
                          </div>
                        </div>

                        {auctionPickedId ? (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "8px",
                              borderRadius: "10px",
                              background: isWinner ? "#DCFCE7" : "#FEE2E2",
                              color: isWinner ? "#15803D" : "#B91C1C",
                              fontSize: "12px",
                              fontWeight: 800,
                              textAlign: "center",
                            }}
                          >
                            {isWinner ? "👑 더 높은 가치!" : "감정가 열세"}
                            <div style={{ fontSize: "13px", marginTop: "2px" }}>
                              약 {art.estimatedValueBillionKrw.toLocaleString()}억 원
                            </div>
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "9px",
                              borderRadius: "10px",
                              background: "#191F28",
                              color: "#FACC15",
                              fontSize: "12px",
                              fontWeight: 800,
                              textAlign: "center",
                            }}
                          >
                            🔨 이 작품에 낙찰 베팅
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {auctionPickedId && (
                  <div
                    style={{
                      marginTop: "16px",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "16px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#1E293B", marginBottom: "8px" }}>
                      📊 수석 옥션 딜러의 감정 리포트
                    </div>
                    {auctionPair.map((art) => (
                      <div key={art.id} style={{ fontSize: "12px", color: "#334155", marginBottom: "8px", lineHeight: 1.5 }}>
                        • <strong>{art.title}</strong> ({art.estimatedValueText}): {art.valuationBasis}{" "}
                        <button
                          type="button"
                          onClick={() => openArtworkModal(art)}
                          style={{
                            border: "none",
                            background: "#EFF6FF",
                            color: "#2563EB",
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            marginLeft: "4px",
                          }}
                        >
                          작품 상세 →
                        </button>
                      </div>
                    ))}
                    <TossButton onClick={rollNextAuctionPair}>🔨 다음 명화 경매 대결 시작하기 →</TossButton>
                  </div>
                )}
              </div>
            )}

            {/* 2) 1% 클로즈업 명화 탐정 퀴즈 */}
            {quizSubMode === "closeup" &&
              (() => {
                const challenge =
                  CLOSEUP_DETECTIVE_CHALLENGES[closeupIndex % CLOSEUP_DETECTIVE_CHALLENGES.length];
                const targetArt =
                  MASTERPIECES.find((a) => a.id === challenge.artworkId) || MASTERPIECES[0];

                return (
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: "22px",
                      padding: "20px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span
                        style={{
                          background: "#EDE9FE",
                          color: "#6D28D9",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px",
                        }}
                      >
                        1% DETAIL DETECTIVE ({closeupIndex + 1} / {CLOSEUP_DETECTIVE_CHALLENGES.length})
                      </span>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#6D28D9" }}>
                        🕵️ 검거 성공 {closeupSolvedCount}건
                      </span>
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "8px 0 4px" }}>
                      🔍 확대된 그림의 일부분만 보고 명화를 맞혀보세요!
                    </h2>
                    <p style={{ fontSize: "13px", color: "#6B7684", margin: "0 0 14px" }}>
                      {challenge.clueTitle}
                    </p>

                    {/* 3.4배 초근접 줌인 뷰포트 */}
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        borderRadius: "18px",
                        overflow: "hidden",
                        position: "relative",
                        border: "3px solid #D97706",
                        background: "#0F172A",
                        marginBottom: "12px",
                      }}
                    >
                      <img
                        src={targetArt.imageUrl}
                        alt="클로즈업 단서"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transform: closeupPickedId
                            ? "scale(1)"
                            : `scale(${challenge.zoomScale})`,
                          transformOrigin: `${challenge.zoomX}% ${challenge.zoomY}%`,
                          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          left: "10px",
                          right: "10px",
                          background: "rgba(15, 23, 42, 0.86)",
                          color: "#FDE68A",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        💡 힌트: {challenge.clueHint}
                      </div>
                    </div>

                    {/* 4지선다 보기 */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {challenge.options.map((optId) => {
                        const optArt = MASTERPIECES.find((a) => a.id === optId);
                        if (!optArt) return null;
                        const isCorrect = optId === challenge.artworkId;
                        const isChosen = closeupPickedId === optId;

                        return (
                          <button
                            key={optId}
                            type="button"
                            onClick={() => {
                              if (closeupPickedId) return;
                              setCloseupPickedId(optId);
                              if (isCorrect) {
                                playMuseumAmbientChord();
                                setCloseupSolvedCount((c) => c + 1);
                                showToast("🕵️ 정답! 명화 속 1% 디테일을 정확히 꿰뚫어 보셨어요!");
                              } else {
                                showToast(`아쉬워요! 정답은 '${targetArt.title}'입니다.`);
                              }
                            }}
                            style={{
                              padding: "11px 12px",
                              borderRadius: "12px",
                              textAlign: "left",
                              cursor: closeupPickedId ? "default" : "pointer",
                              border: closeupPickedId
                                ? isCorrect
                                  ? "2px solid #16A34A"
                                  : isChosen
                                  ? "2px solid #DC2626"
                                  : "1px solid #E5E8EB"
                                : "1px solid #CBD5E1",
                              background: closeupPickedId
                                ? isCorrect
                                  ? "#DCFCE7"
                                  : isChosen
                                  ? "#FEE2E2"
                                  : "#F8FAFC"
                                : "#FFFFFF",
                            }}
                          >
                            <div style={{ fontSize: "13px", fontWeight: 800, color: "#191F28" }}>
                              {optArt.title}
                            </div>
                            <div style={{ fontSize: "11px", color: "#6B7684", marginTop: "2px" }}>
                              {optArt.artist}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {closeupPickedId && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                        <TossButton onClick={() => openArtworkModal(targetArt)}>
                          🔍 {targetArt.title} 전체 해설 보기
                        </TossButton>
                        <TossButton
                          variant="secondary"
                          onClick={() => {
                            setCloseupPickedId(null);
                            setCloseupIndex((i) => (i + 1) % CLOSEUP_DETECTIVE_CHALLENGES.length);
                          }}
                        >
                          다음 문제 →
                        </TossButton>
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* 3) 내 심리 & 취향 맞춤 소울 명화 테스트 */}
            {quizSubMode === "taste" && (
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "22px",
                padding: "20px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <span
                style={{
                  background: "#E8F3FF",
                  color: "#1B64DA",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                ART PSYCHOLOGY MATCH
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "8px 0 4px" }}>
                ✨ 내 심리 & 취향 맞춤 소울 명화 테스트
              </h2>
              <p style={{ fontSize: "13px", color: "#6B7684", margin: "0 0 18px" }}>
                3가지 질문에 답하면 지금 내 마음의 에너지와 가장 깊이 공명하는 세계 명화를 매칭해 드립니다.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {ART_TASTE_QUIZ.map((q, qIdx) => {
                  const chosen = quizAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      style={{
                        background: "#F9FAFB",
                        borderRadius: "16px",
                        padding: "14px",
                        border: "1px solid #E5E8EB",
                      }}
                    >
                      <div style={{ fontSize: "14px", fontWeight: 800, marginBottom: "10px", color: "#191F28" }}>
                        {q.question}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {q.options.map((opt, oIdx) => {
                          const isSelected = chosen === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectQuizOption(qIdx, oIdx)}
                              style={{
                                textAlign: "left",
                                padding: "11px 13px",
                                borderRadius: "12px",
                                border: isSelected ? "2px solid #3182F6" : "1px solid #E5E8EB",
                                background: isSelected ? "#E8F3FF" : "#FFFFFF",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color: isSelected ? "#1B64DA" : "#191F28",
                                }}
                              >
                                {opt.label}
                              </div>
                              <div style={{ fontSize: "11px", color: "#6B7684", marginTop: "2px" }}>{opt.sub}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 진단 결과 표시 */}
              {quizResultArt && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "18px",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                    color: "#FFFFFF",
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#FACC15", fontWeight: 800 }}>
                    🎉 당신의 영혼과 공명하는 운명의 명화
                  </div>
                  <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "6px 0 12px" }}>
                    {quizResultArt.title} ({quizResultArt.artist})
                  </h3>

                  <ArtworkVisualizer artwork={quizResultArt} interactive={false} height={220} />

                  <div
                    style={{
                      marginTop: "14px",
                      background: "rgba(255,255,255,0.09)",
                      borderRadius: "14px",
                      padding: "12px",
                      fontSize: "13px",
                      lineHeight: 1.55,
                    }}
                  >
                    <div style={{ color: "#FDE68A", fontWeight: 800, marginBottom: "4px" }}>
                      ✨ [{quizResultArt.fortuneTag.category}] 행운의 메시지
                    </div>
                    {quizResultArt.fortuneTag.blessing}
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                    <TossButton onClick={() => openArtworkModal(quizResultArt)}>
                      🔍 숨은 비밀 해설 보기
                    </TossButton>
                    <TossButton
                      variant="secondary"
                      onClick={() => generateMuseumTicketPng(quizResultArt)}
                    >
                      🎟️ 기념 티켓 발급
                    </TossButton>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* 행운 기운별 부적 명화 도감 */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "22px",
                padding: "18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 10px" }}>
                🍀 행운 테마별 명화 큐레이션
              </h3>
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "10px" }}>
                {["전체", "재물·성공운", "사랑·매력운", "영감·창의운", "치유·평온운", "명예·돌파운"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedFortuneCategory(cat)}
                    style={{
                      flexShrink: 0,
                      border: "none",
                      borderRadius: "999px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: selectedFortuneCategory === cat ? "#3182F6" : "#F2F4F6",
                      color: selectedFortuneCategory === cat ? "#FFFFFF" : "#4E5968",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {MASTERPIECES.filter(
                  (a) => selectedFortuneCategory === "전체" || a.fortuneTag.category === selectedFortuneCategory
                ).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => openArtworkModal(art)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px",
                      borderRadius: "14px",
                      border: "1px solid #E5E8EB",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#1B64DA",
                          background: "#E8F3FF",
                          padding: "2px 7px",
                          borderRadius: "6px",
                        }}
                      >
                        {art.fortuneTag.category}
                      </span>
                      <div style={{ fontSize: "15px", fontWeight: 800, marginTop: "4px" }}>
                        {art.title} · {art.artist}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6B7684", marginTop: "2px" }}>
                        {art.fortuneTag.blessing}
                      </div>
                    </div>
                    <span style={{ fontSize: "18px", color: "#8B95A1" }}>›</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. 아트여권 & 티켓 발급 탭 ================= */}
        {activeTab === "passport" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* 여권 커버 & 컬렉터 등급 */}
            <div
              style={{
                background: "linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)",
                borderRadius: "24px",
                padding: "22px",
                color: "#FFFFFF",
                border: "2px solid rgba(212, 175, 55, 0.45)",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.25)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#FACC15", letterSpacing: "1.2px" }}>
                  REPUBLIC OF ART · OFFICIAL PASSPORT
                </span>
                <span
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  스탬프 {visitedMuseums.length} / {MUSEUMS.length}
                </span>
              </div>

              <h2 style={{ fontSize: "22px", fontWeight: 800, margin: "10px 0 4px" }}>{collectorRank.title}</h2>
              <p style={{ fontSize: "13px", color: "#CBD5E1", margin: "0 0 14px" }}>{collectorRank.desc}</p>

              {/* 관람객 이름 커스텀 입력 */}
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#FDE68A", fontWeight: 700, flexShrink: 0 }}>
                  여권 성명:
                </span>
                <input
                  type="text"
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  maxLength={18}
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.4)",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 800,
                    width: "100%",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* 10대 미술관 입국 스탬프 북 */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "22px",
                padding: "18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 3px" }}>
                    🛂 세계 27대 미술관 스탬프 도장 깨기
                  </h3>
                  <p style={{ fontSize: "12px", color: "#6B7684", margin: 0 }}>
                    미술관의 명화를 감상하거나 아래 카드를 터치해 입국 스탬프를 완성하세요!
                  </p>
                </div>

                {visitedMuseums.length < MUSEUMS.length && (
                  <button
                    type="button"
                    onClick={() => {
                      const unvisited = MUSEUMS.filter((m) => !visitedMuseums.includes(m.id));
                      const pick = unvisited[Math.floor(Math.random() * unvisited.length)];
                      if (pick) {
                        setSelectedMuseumId(pick.id);
                        setActiveRegion("all");
                        setActiveTab("map");
                        showToast(`✈️ 미방문 '${pick.name}'(${pick.city})으로 이동했어요!`);
                      }
                    }}
                    style={{
                      flexShrink: 0,
                      border: "none",
                      background: "#3182F6",
                      color: "#FFFFFF",
                      borderRadius: "10px",
                      padding: "7px 11px",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✈️ 안 가본 미술관 출발
                  </button>
                )}
              </div>

              {/* 스탬프 달성률 프로그레스 바 */}
              <div
                style={{
                  background: "#F1F5F9",
                  height: "10px",
                  borderRadius: "999px",
                  overflow: "hidden",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    width: `${Math.round((visitedMuseums.length / MUSEUMS.length) * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #3182F6 0%, #F59E0B 100%)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "10px",
                }}
              >
                {MUSEUMS.map((museum) => {
                  const stamped = visitedMuseums.includes(museum.id);
                  return (
                    <div
                      key={museum.id}
                      onClick={() => stampMuseumVisit(museum)}
                      style={{
                        border: stamped ? `2px solid ${museum.badgeColor}` : "1px dashed #CBD5E1",
                        background: stamped ? "#FFFDF9" : "#F8FAFC",
                        borderRadius: "16px",
                        padding: "12px",
                        cursor: "pointer",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "18px" }}>{museum.flag}</span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            padding: "2px 6px",
                            borderRadius: "999px",
                            background: stamped ? museum.badgeColor : "#E2E8F0",
                            color: stamped ? "#FFFFFF" : "#64748B",
                          }}
                        >
                          {museum.stampCode}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, marginTop: "6px", color: "#191F28" }}>
                        {museum.name}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6B7684", marginTop: "2px" }}>
                        {stamped ? `✓ ${museum.stampTitle} 획득` : "터치하여 방문 스탬프 찍기"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 나만의 미술관 입장권 & 명화 포토카드 발급기 */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "22px",
                padding: "18px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 6px" }}>
                🎟️ 나만의 미술관 티켓 & 명화 포토카드 발급
              </h3>
              <p style={{ fontSize: "12px", color: "#6B7684", margin: "0 0 12px" }}>
                원하는 명화를 선택하면 내 이름과 공식 스탬프가 새겨진 고화질 티켓 이미지를 저장할 수 있습니다.
              </p>

              <select
                value={ticketArtworkId}
                onChange={(e) => setTicketArtworkId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  borderRadius: "12px",
                  border: "1px solid #D1D6DB",
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                {MASTERPIECES.map((art) => (
                  <option key={art.id} value={art.id}>
                    {art.title} — {art.artist} ({art.estimatedValueText})
                  </option>
                ))}
              </select>

              <TossButton
                onClick={() => {
                  const target = MASTERPIECES.find((a) => a.id === ticketArtworkId) || MASTERPIECES[0];
                  generateMuseumTicketPng(target);
                }}
              >
                📸 미술관 VIP 티켓 포토카드 이미지 저장 (PNG)
              </TossButton>

              {ticketDataUrl && (
                <div style={{ marginTop: "14px", textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#4E5968", fontWeight: 700, marginBottom: "8px" }}>
                    👇 발급된 티켓 미리보기 (길게 눌러 저장 가능)
                  </div>
                  <img
                    src={ticketDataUrl}
                    alt="발급된 미술관 티켓"
                    style={{
                      width: "100%",
                      maxWidth: "340px",
                      borderRadius: "16px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.16)",
                    }}
                  />
                </div>
              )}
            </div>

            {/* VIP 도슨트 올패스 (토스페이 연동) */}
            <div
              style={{
                background: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                borderRadius: "20px",
                padding: "18px",
                border: "1px solid #F59E0B",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#B45309" }}>
                👑 WORLD ART VIP CURATOR PASS
              </div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#191F28", marginTop: "4px" }}>
                38대 전 작품 VIP 비하인드 스토리 무제한 열람 패스
              </div>
              <p style={{ fontSize: "12px", color: "#78350F", margin: "6px 0 12px", lineHeight: 1.45 }}>
                도난 사건의 전말, X선 스캔으로 밝혀진 덧칠의 비밀, 천문학적 경매 비화를 광고 없이 평생 소장하세요.
              </p>
              {hasVipPass ? (
                <div
                  style={{
                    background: "#15803D",
                    color: "#FFFFFF",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    textAlign: "center",
                  }}
                >
                  ✓ VIP 도슨트 올패스가 활성화되어 있습니다
                </div>
              ) : (
                <TossButton onClick={() => setIsPayModalOpen(true)}>
                  💳 토스페이로 VIP 올패스 평생 소장 (1,900원)
                </TossButton>
              )}
            </div>
          </div>
        )}

        {/* 하단 배너 광고 영역 */}
        <div style={{ marginTop: "20px" }}>
          <AdBanner placement="inline" />
        </div>
      </div>

      {/* ================= 명화 초고화질 돋보기 & 오디오 도슨트 모달 ================= */}
      {selectedArtwork && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(9, 13, 22, 0.78)",
            backdropFilter: "blur(6px)",
            zIndex: 1200,
            overflowY: "auto",
            padding: "20px 14px 40px",
          }}
        >
          <div
            style={{
              maxWidth: "560px",
              margin: "0 auto",
              background: "#FFFFFF",
              borderRadius: "24px",
              padding: "18px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
            }}
          >
            {/* 모달 상단: 이전/다음 명화 빠른 넘기기 네비게이션 바 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "6px 10px",
                marginBottom: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const idx = MASTERPIECES.findIndex((a) => a.id === selectedArtwork.id);
                  const prev = MASTERPIECES[(idx - 1 + MASTERPIECES.length) % MASTERPIECES.length];
                  if (prev) openArtworkModal(prev);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  padding: "4px 6px",
                }}
              >
                ◀ 이전 명화
              </button>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748B" }}>
                세계 38대 걸작 컬렉션 ({MASTERPIECES.findIndex((a) => a.id === selectedArtwork.id) + 1} / {MASTERPIECES.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  const idx = MASTERPIECES.findIndex((a) => a.id === selectedArtwork.id);
                  const next = MASTERPIECES[(idx + 1) % MASTERPIECES.length];
                  if (next) openArtworkModal(next);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#334155",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  padding: "4px 6px",
                }}
              >
                다음 명화 ▶
              </button>
            </div>

            {/* 모달 상단 헤더 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
                gap: "8px",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#3182F6" }}>
                  {MUSEUMS.find((m) => m.id === selectedArtwork.museumId)?.flag}{" "}
                  {MUSEUMS.find((m) => m.id === selectedArtwork.museumId)?.name} 소장
                </div>
                <h2 style={{ fontSize: "21px", fontWeight: 800, margin: "3px 0 2px" }}>
                  {selectedArtwork.title}
                </h2>
                <div style={{ fontSize: "13px", color: "#6B7684", fontWeight: 600 }}>
                  {selectedArtwork.artist} ({selectedArtwork.artistLifespan}) · {selectedArtwork.year}
                </div>
              </div>

              <button
                type="button"
                onClick={closeArtworkModal}
                style={{
                  border: "none",
                  background: "#F2F4F6",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  fontSize: "18px",
                  fontWeight: 800,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>

            {/* 인터랙티브 돋보기 & 비밀 포인트 아트워크 */}
            <ArtworkVisualizer
              artwork={selectedArtwork}
              interactive={true}
              activeHotspotId={activeHotspot?.id || null}
              onSelectHotspot={(spot) => setActiveHotspot(spot)}
              showHotspots={true}
              height={310}
              framed={true}
            />

            {/* 그림 속 숨은 비밀 포인트 ① ② ③ 탭 & 해설 */}
            <div
              style={{
                marginTop: "14px",
                background: "#FFFBEB",
                border: "1px solid #FDE68A",
                borderRadius: "16px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#92400E" }}>
                  🔍 그림 속 숨은 비밀 포인트 (버튼을 누르면 그림 위에 번호 표시)
                </div>
                {activeHotspot && (
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(null)}
                    style={{
                      border: "1px solid #D97706",
                      background: "#FFFFFF",
                      color: "#B45309",
                      borderRadius: "8px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✕ 번호 숨기기
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: activeHotspot ? "10px" : "0px" }}>
                {selectedArtwork.secretPoints.map((pt, idx) => {
                  const isAct = activeHotspot?.id === pt.id;
                  return (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setActiveHotspot((prev) => (prev?.id === pt.id ? null : pt))}
                      style={{
                        border: isAct ? "1.5px solid #D97706" : "1px solid #FDE68A",
                        background: isAct ? "#F59E0B" : "#FFFFFF",
                        color: isAct ? "#FFFFFF" : "#78350F",
                        borderRadius: "10px",
                        padding: "7px 11px",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          background: isAct ? "#FFFFFF" : "#F59E0B",
                          color: isAct ? "#D97706" : "#FFFFFF",
                          fontSize: "11px",
                          fontWeight: 900,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span>{pt.label}</span>
                    </button>
                  );
                })}
              </div>

              {activeHotspot ? (
                <div
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "11px 13px",
                    fontSize: "13px",
                    color: "#191F28",
                    lineHeight: 1.55,
                  }}
                >
                  <strong style={{ color: "#D97706" }}>
                    [{selectedArtwork.secretPoints.findIndex((s) => s.id === activeHotspot.id) + 1}. {activeHotspot.label}]
                  </strong>{" "}
                  {activeHotspot.detail}
                </div>
              ) : (
                <div style={{ fontSize: "12px", color: "#B45309", marginTop: "8px" }}>
                  👆 위 1·2·3번 버튼 중 궁금한 포인트를 누르면 그림 속 해당 위치에 번호 핀이 나타나며 확대됩니다.
                </div>
              )}
            </div>

            {/* 추정 가치 & 스펙 카드 */}
            <div
              style={{
                marginTop: "12px",
                background: "#F8FAFC",
                borderRadius: "16px",
                padding: "14px",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "4px",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#475569" }}>💎 명화 추정 가치 환산</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#B45309" }}>
                  {selectedArtwork.estimatedValueText}
                </span>
              </div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "5px", lineHeight: 1.45 }}>
                • 산정 근거: {selectedArtwork.valuationBasis}
              </div>
              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                • 기법 및 크기: {selectedArtwork.medium} ({selectedArtwork.dimensions})
              </div>
            </div>

            {/* 1분 핵심 오디오/텍스트 도슨트 */}
            <div
              style={{
                marginTop: "12px",
                background: "#F2F4F6",
                borderRadius: "16px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#191F28" }}>
                  🎧 1분 수석 큐레이터 도슨트
                </span>
                <button
                  type="button"
                  onClick={() => toggleDocentSpeech(selectedArtwork)}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 800,
                    background: isDocentPlaying ? "#EF4444" : "#3182F6",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  {isDocentPlaying ? "⏹ 오디오 정지" : "🔊 오디오 도슨트 듣기"}
                </button>
              </div>
              <p style={{ fontSize: "13px", color: "#333D4B", lineHeight: 1.6, margin: 0 }}>
                {selectedArtwork.docentScript}
              </p>
            </div>

            {/* VIP 시크릿 비하인드 스토리 (보상형 광고 or VIP 패스) */}
            <div
              style={{
                marginTop: "12px",
                background: "#1E293B",
                color: "#FFFFFF",
                borderRadius: "16px",
                padding: "15px",
              }}
            >
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#FACC15", marginBottom: "6px" }}>
                🕵️ 시크릿 비하인드 스토리 (도난·X선 감정·경매 비화)
              </div>

              {hasVipPass || unlockedStoryIds.includes(selectedArtwork.id) ? (
                <p style={{ fontSize: "13px", color: "#E2E8F0", lineHeight: 1.6, margin: 0 }}>
                  {selectedArtwork.vipBehindStory}
                </p>
              ) : (
                <div>
                  <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 10px" }}>
                    일반 관람객에게는 공개되지 않는 미술관 수장고의 비밀 실화입니다.
                  </p>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "8px 10px",
                      fontSize: "11px",
                      color: "#FDE68A",
                      marginBottom: "10px",
                    }}
                  >
                    [광고 안내] 5초 광고 시청 후 이 작품의 시크릿 비하인드 스토리를 무료로 열람할 수 있습니다.
                  </div>
                  <TossButton
                    onClick={() => {
                      setPendingStoryArtId(selectedArtwork.id);
                      setIsAdModalOpen(true);
                    }}
                  >
                    🎬 5초 광고 보고 시크릿 스토리 무료 열람
                  </TossButton>
                </div>
              )}
            </div>

            {/* 하단 액션 버튼 (티켓 발급 & 컬렉션 저장) */}
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <TossButton onClick={() => generateMuseumTicketPng(selectedArtwork)}>
                🎟️ 기념 티켓 이미지 저장
              </TossButton>
              <TossButton
                variant="secondary"
                onClick={() => toggleBookmark(selectedArtwork.id)}
              >
                {bookmarkedIds.includes(selectedArtwork.id) ? "⭐ 북마크됨" : "☆ 북마크"}
              </TossButton>
            </div>
          </div>
        </div>
      )}

      {/* 보상형 광고 모달 */}
      <RewardedAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        rewardTitle="시크릿 비하인드 도슨트 잠금 해제"
        onRewarded={() => {
          if (pendingStoryArtId && !unlockedStoryIds.includes(pendingStoryArtId)) {
            setUnlockedStoryIds((prev) => [...prev, pendingStoryArtId]);
          }
          setIsAdModalOpen(false);
          showToast("🔓 시크릿 비하인드 스토리가 잠금 해제되었어요!");
        }}
      />

      {/* 토스페이 결제 모달 */}
      <TossPayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        productName="월드아트맵 VIP 도슨트 올패스"
        amount={1900}
        onSuccess={() => {
          setHasVipPass(true);
          setIsPayModalOpen(false);
          showToast("👑 VIP 도슨트 올패스가 활성화되었습니다!");
        }}
      />
    </div>
  );
};

export default WorldArtApp;
