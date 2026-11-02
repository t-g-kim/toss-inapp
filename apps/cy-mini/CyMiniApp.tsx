/**
 * 싸이감성 미니홈피 - 메인 인앱 컴포넌트 (v1.1 인터랙티브 에디션)
 * - 토스 디자인 시스템(TDS) & 2000년대 싸이월드 Y2K 레트로 감성 결합
 * - 5개 탭: [미니룸] / [방명록] / [룸꾸미기] / [다이어리] / [BGM]
 * - 드래그 자유 배치, 오리알 상점 해금, Y2K 싸이체 변환기, 백문백답, 캔버스 포토카드 저장 연동
 */

import React, { useState, useEffect, useRef } from "react";
import {
  CY_BGMS,
  MINIROOM_THEMES,
  MINIMI_CHARS,
  MINIROOM_PROPS,
  ROOM_PRESETS,
  MOOD_PRESETS,
  RETRO_CY_QUOTES,
  DEFAULT_ILCHON_COMMENTS,
  DEFAULT_GUESTBOOK_ENTRIES,
  DEFAULT_DIARY_ENTRIES,
  DEFAULT_QNA_ITEMS,
  DEFAULT_PROP_POSITIONS,
  FRIEND_MINIROOMS,
  convertToCyStyle,
  FriendMiniroom,
  BpmTrack,
  MiniroomTheme,
  MinimiChar,
  IlchonComment,
  GuestbookEntry,
  DiaryEntry,
  QnaItem,
  PropPosition,
  RoomPreset,
} from "./data";
import { MiniroomViewer } from "./MiniroomViewer";
import { retroAudioSynth } from "./audioSynth";
import {
  TossButton,
  TossCard,
  TossBadge,
  RewardedAdModal,
  TossPayModal,
} from "@shared/index";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Heart,
  Music,
  Home,
  Palette,
  BookOpen,
  MessageSquare,
  Share2,
  ChevronLeft,
  Award,
  Send,
  Lock,
  CornerDownRight,
  Waves,
  Shuffle,
  X,
  ArrowRight,
  Edit3,
  Download,
  Camera,
  Wand2,
  RotateCcw,
} from "lucide-react";

interface CyMiniAppProps {
  onBack?: () => void;
}

type TabType = "home" | "guestbook" | "room" | "diary" | "jukebox";

const STORAGE_KEY = "cy_mini_user_state_v2";

export const CyMiniApp: React.FC<CyMiniAppProps> = ({ onBack }) => {
  // 1. 미니홈피 기본 상태
  const [homeTitle, setHomeTitle] = useState("★..oOl쁜ol의 작은공간..★");
  const [nickname, setNickname] = useState("반짝이는별");
  const [moodText, setMoodText] = useState("ㄴr는 ㄱr끔 눈물을 흘린ㄷr...💧");
  const [todayCount, setTodayCount] = useState(482);
  const [totalCount, setTotalCount] = useState(13850);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 오리알 개수 (기본 42개)
  const [eggCount, setEggCount] = useState<number>(42);

  // 2. 미니룸 커스텀 & 배치 좌표 상태
  const [selectedTheme, setSelectedTheme] = useState<MiniroomTheme>(MINIROOM_THEMES[0]);
  const [selectedMinimi, setSelectedMinimi] = useState<MinimiChar>(MINIMI_CHARS[0]);
  const [selectedBgm, setSelectedBgm] = useState<BpmTrack>(CY_BGMS[0]);
  const [placedProps, setPlacedProps] = useState<string[]>([
    "crt_pc",
    "turntable",
    "retro_bed",
    "teddy_bear",
  ]);
  const [propPositions, setPropPositions] = useState<Record<string, PropPosition>>(
    DEFAULT_PROP_POSITIONS
  );
  const [minimiPosition, setMinimiPosition] = useState<PropPosition>({
    x: 50,
    y: 82,
    flip: false,
  });

  // 오리알로 해금한 테마/미니미/소품 ID 목록
  const [unlockedItemIds, setUnlockedItemIds] = useState<string[]>([]);

  // 3. 탭 메뉴 (home | guestbook | room | diary | jukebox)
  const [activeTab, setActiveTab] = useState<TabType>("home");

  // 4. 방명록 상태
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(
    DEFAULT_GUESTBOOK_ENTRIES
  );
  const [gbAuthor, setGbAuthor] = useState("");
  const [gbRelation, setGbRelation] = useState("영혼의 단짝");
  const [gbContent, setGbContent] = useState("");
  const [gbAvatar, setGbAvatar] = useState<GuestbookEntry["avatarType"]>("boy");
  const [gbSticker, setGbSticker] = useState<"scrap" | "pado" | "bgm" | "love" | "hi">("scrap");
  const [gbSendEgg, setGbSendEgg] = useState(true);
  const [gbIsSecret, setGbIsSecret] = useState(false);
  const [unlockedSecretIds, setUnlockedSecretIds] = useState<string[]>([]);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState("");

  // 일촌평 리스트 & 입력
  const [ilchonComments, setIlchonComments] = useState<IlchonComment[]>(
    DEFAULT_ILCHON_COMMENTS
  );
  const [inputAuthor, setInputAuthor] = useState("");
  const [inputContent, setInputContent] = useState("");

  // 5. 다이어리 & 백문백답 상태
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(DEFAULT_DIARY_ENTRIES);
  const [newDiaryText, setNewDiaryText] = useState(RETRO_CY_QUOTES[0]);
  const [newDiaryWeather, setNewDiaryWeather] = useState<DiaryEntry["weather"]>("🌙 새벽");
  const [newDiaryMood, setNewDiaryMood] = useState("💧 센치함");
  const [qnaItems, setQnaItems] = useState<QnaItem[]>(DEFAULT_QNA_ITEMS);
  const [editingQnaId, setEditingQnaId] = useState<string | null>(null);
  const [editingQnaText, setEditingQnaText] = useState("");

  // 6. 나만의 BGM 직접 입력 상태
  const [customBgmTitle, setCustomBgmTitle] = useState("");
  const [customBgmArtist, setCustomBgmArtist] = useState("");

  // 7. 수익화 & 포토카드 모달 상태
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [unlockedGoldSkin, setUnlockedGoldSkin] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [unlockedVipFont, setUnlockedVipFont] = useState(false);
  const [showPhotoCardModal, setShowPhotoCardModal] = useState(false);
  const photoCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 8. 일촌 파도타기(Surfing) 탐험 상태
  const [visitingFriend, setVisitingFriend] = useState<FriendMiniroom | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const visitParam = new URLSearchParams(window.location.search).get("visit");
        if (visitParam) {
          const found = FRIEND_MINIROOMS.find((f) => f.id === visitParam);
          if (found) return found;
        }
      } catch {}
    }
    return null;
  });
  const [showPadoModal, setShowPadoModal] = useState(false);
  const [friendsList, setFriendsList] = useState<FriendMiniroom[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cy_mini_friends_v1");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return FRIEND_MINIROOMS;
  });

  // 초기 로컬스토리지 복원
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.homeTitle) setHomeTitle(saved.homeTitle);
      if (saved.nickname) setNickname(saved.nickname);
      if (saved.moodText) setMoodText(saved.moodText);
      if (typeof saved.eggCount === "number") setEggCount(saved.eggCount);
      if (saved.themeId) {
        const t = MINIROOM_THEMES.find((x) => x.id === saved.themeId);
        if (t) setSelectedTheme(t);
      }
      if (saved.minimiId) {
        const m = MINIMI_CHARS.find((x) => x.id === saved.minimiId);
        if (m) setSelectedMinimi(m);
      }
      if (saved.selectedBgm) setSelectedBgm(saved.selectedBgm);
      if (Array.isArray(saved.placedProps)) setPlacedProps(saved.placedProps);
      if (saved.propPositions) {
        setPropPositions({ ...DEFAULT_PROP_POSITIONS, ...saved.propPositions });
      }
      if (saved.minimiPosition) setMinimiPosition(saved.minimiPosition);
      if (Array.isArray(saved.unlockedItemIds)) setUnlockedItemIds(saved.unlockedItemIds);
      if (Array.isArray(saved.guestbookEntries)) setGuestbookEntries(saved.guestbookEntries);
      if (Array.isArray(saved.ilchonComments)) setIlchonComments(saved.ilchonComments);
      if (Array.isArray(saved.diaryEntries)) setDiaryEntries(saved.diaryEntries);
      if (Array.isArray(saved.qnaItems)) setQnaItems(saved.qnaItems);
      if (saved.unlockedGoldSkin) setUnlockedGoldSkin(true);
      if (saved.unlockedVipFont) setUnlockedVipFont(true);
    } catch {}
  }, []);

  // 상태 변경 시 로컬스토리지 자동 저장
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          homeTitle,
          nickname,
          moodText,
          eggCount,
          themeId: selectedTheme.id,
          minimiId: selectedMinimi.id,
          selectedBgm,
          placedProps,
          propPositions,
          minimiPosition,
          unlockedItemIds,
          guestbookEntries,
          ilchonComments,
          diaryEntries,
          qnaItems,
          unlockedGoldSkin,
          unlockedVipFont,
        })
      );
    } catch {}
  }, [
    homeTitle,
    nickname,
    moodText,
    eggCount,
    selectedTheme,
    selectedMinimi,
    selectedBgm,
    placedProps,
    propPositions,
    minimiPosition,
    unlockedItemIds,
    guestbookEntries,
    ilchonComments,
    diaryEntries,
    qnaItems,
    unlockedGoldSkin,
    unlockedVipFont,
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cy_mini_friends_v1", JSON.stringify(friendsList));
      } catch {}
    }
  }, [friendsList]);

  // 토스 네이티브 내비게이션 바 뒤로가기 버튼과 브라우저 히스토리 스택 동기화
  useEffect(() => {
    try {
      window.history.replaceState({ tab: "home" }, "");
    } catch {}

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.tab === "string") {
        setActiveTab(e.state.tab as TabType);
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const switchTab = (tab: TabType) => {
    if (tab !== activeTab) {
      try {
        window.history.pushState({ tab }, "");
      } catch {}
      setActiveTab(tab);
      retroAudioSynth.playSfx("pop");
    }
  };

  // 아이템 해금 여부 확인
  const isItemUnlocked = (id: string, cost?: number) => {
    if (!cost || cost <= 0) return true;
    if (unlockedVipFont) return true;
    if (id === "gold_duck" && unlockedGoldSkin) return true;
    return unlockedItemIds.includes(id);
  };

  // 오리알로 테마/미니미/소품 해금
  const handleUnlockWithEggs = (id: string, name: string, cost: number, onSuccessSelect: () => void) => {
    if (eggCount < cost) {
      alert(`오리알이 부족해요! (필요: 🥚 ${cost}개 / 보유: 🥚 ${eggCount}개)\n하단 오리알 무료 충전소에서 10개를 즉시 충전할 수 있어요!`);
      return;
    }
    setEggCount((prev) => prev - cost);
    setUnlockedItemIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    retroAudioSynth.playSfx("coin");
    confetti({ particleCount: 55, spread: 60, origin: { y: 0.6 } });
    onSuccessSelect();
  };

  // 원클릭 인테리어 프리셋 적용
  const handleApplyPreset = (preset: RoomPreset) => {
    const t = MINIROOM_THEMES.find((x) => x.id === preset.themeId);
    const m = MINIMI_CHARS.find((x) => x.id === preset.minimiId);
    const b = CY_BGMS.find((x) => x.id === preset.bgmId);
    if (t) setSelectedTheme(t);
    if (m) setSelectedMinimi(m);
    if (b) setSelectedBgm(b);
    setPlacedProps(preset.placedProps);
    setPropPositions(DEFAULT_PROP_POSITIONS);
    setMinimiPosition({ x: 50, y: 82, flip: false });
    retroAudioSynth.playSfx("coin");
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // 일촌 파도타기 이동
  const handleSurfingTo = (friend: FriendMiniroom) => {
    setVisitingFriend(friend);
    setActiveTab("home");
    setShowPadoModal(false);
    retroAudioSynth.playSfx("pop");
  };

  // 랜덤 일촌 파도타기
  const handleRandomPado = () => {
    const candidates = friendsList.filter((f) => !visitingFriend || f.id !== visitingFriend.id);
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || friendsList[0];
    handleSurfingTo(chosen);
  };

  // 다음 일촌으로 파도타기
  const handleNextPado = () => {
    if (!visitingFriend) {
      handleRandomPado();
      return;
    }
    const idx = friendsList.findIndex((f) => f.id === visitingFriend.id);
    const nextIdx = (idx + 1) % friendsList.length;
    handleSurfingTo(friendsList[nextIdx]);
  };

  // 내 미니룸으로 복귀
  const handleBackToMyHome = () => {
    setVisitingFriend(null);
    setActiveTab("home");
    retroAudioSynth.playSfx("pop");
  };

  // 소품 배치/해제 (잠금 소품은 오리알 해금)
  const handleToggleProp = (propId: string) => {
    const meta = MINIROOM_PROPS.find((p) => p.id === propId);
    if (!meta) return;

    if (!isItemUnlocked(meta.id, meta.eggCost)) {
      handleUnlockWithEggs(meta.id, meta.name, meta.eggCost || 2, () => {
        setPlacedProps((prev) => (prev.includes(propId) ? prev : [...prev, propId]));
      });
      return;
    }

    retroAudioSynth.playSfx("pop");
    setPlacedProps((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  // 소품 위치 업데이트
  const handleUpdatePropPosition = (propId: string, pos: PropPosition) => {
    setPropPositions((prev) => ({
      ...prev,
      [propId]: pos,
    }));
  };

  const handleResetPositions = () => {
    setPropPositions(DEFAULT_PROP_POSITIONS);
    setMinimiPosition({ x: 50, y: 82, flip: false });
  };

  // 방명록 등록
  const handleAddGuestbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbContent.trim()) {
      alert("방명록 내용을 입력해주세요!");
      return;
    }

    if (visitingFriend && gbSendEgg && eggCount < 1) {
      alert("보유한 오리알이 부족해요! 하단 오리알 무료 충전소에서 충전 후 선물해주세요 🥚");
      return;
    }

    const targetList = visitingFriend ? visitingFriend.guestbook : guestbookEntries;
    const nextNo = (targetList[0]?.no || 0) + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newEntry: GuestbookEntry = {
      id: `gb_${Date.now()}`,
      no: nextNo,
      author: gbAuthor.trim() || nickname || "파도타기 손님",
      ilchonRelation: gbRelation,
      avatarType: gbAvatar,
      content: gbContent.trim(),
      createdAt: formattedDate,
      isSecret: gbIsSecret,
      duckEggGift: gbSendEgg ? 1 : 0,
      sticker: gbSticker,
    };

    if (visitingFriend) {
      const updatedFriend: FriendMiniroom = {
        ...visitingFriend,
        todayCount: visitingFriend.todayCount + 1,
        guestbook: [newEntry, ...visitingFriend.guestbook],
      };
      setVisitingFriend(updatedFriend);
      setFriendsList((prev) =>
        prev.map((f) => (f.id === visitingFriend.id ? updatedFriend : f))
      );
      if (gbSendEgg) {
        setEggCount((prev) => Math.max(0, prev - 1));
      }
      setGbContent("");
      retroAudioSynth.playSfx("coin");
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } else {
      setGuestbookEntries((prev) => [newEntry, ...prev]);
      if (gbSendEgg) {
        setEggCount((prev) => prev + 1);
      }
      setTodayCount((prev) => prev + 1);
      setTotalCount((prev) => prev + 1);
      setGbContent("");
      retroAudioSynth.playSfx("coin");
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  // 방명록 주인장 답글 등록
  const handleAddReply = (entryId: string) => {
    if (!replyInputText.trim()) return;

    if (visitingFriend) {
      const updatedList = visitingFriend.guestbook.map((item) =>
        item.id === entryId
          ? {
              ...item,
              reply: {
                author: visitingFriend.ownerName,
                content: replyInputText.trim(),
                createdAt: "방금 전",
              },
            }
          : item
      );
      const updatedFriend: FriendMiniroom = {
        ...visitingFriend,
        guestbook: updatedList,
      };
      setVisitingFriend(updatedFriend);
      setFriendsList((prev) =>
        prev.map((f) => (f.id === visitingFriend.id ? updatedFriend : f))
      );
    } else {
      setGuestbookEntries((prev) =>
        prev.map((item) =>
          item.id === entryId
            ? {
                ...item,
                reply: {
                  author: nickname || "주인장",
                  content: replyInputText.trim(),
                  createdAt: "방금 전",
                },
              }
            : item
        )
      );
    }
    setReplyTargetId(null);
    setReplyInputText("");
    retroAudioSynth.playSfx("pop");
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
  };

  // 비밀글 열람 토글
  const handleToggleUnlockSecret = (id: string) => {
    retroAudioSynth.playSfx("pop");
    setUnlockedSecretIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 다이어리 새 일기 등록
  const handleAddDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryText.trim()) return;
    const now = new Date();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dateStr = `2005.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${days[now.getDay()]}`;

    const entry: DiaryEntry = {
      id: `diary_${Date.now()}`,
      date: dateStr,
      weather: newDiaryWeather,
      mood: newDiaryMood,
      content: newDiaryText.trim(),
      likes: 1,
    };
    setDiaryEntries((prev) => [entry, ...prev]);
    retroAudioSynth.playSfx("coin");
    confetti({ particleCount: 45, spread: 55, origin: { y: 0.6 } });
  };

  // 백문백답 저장
  const handleSaveQna = (id: string) => {
    if (!editingQnaText.trim()) return;
    setQnaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, a: editingQnaText.trim() } : item))
    );
    setEditingQnaId(null);
    setEditingQnaText("");
    retroAudioSynth.playSfx("pop");
  };

  // 나만의 BGM 직접 입력 등록
  const handleApplyCustomBgm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBgmTitle.trim()) return;

    const newTrack: BpmTrack = {
      id: `custom_${Date.now()}`,
      title: customBgmTitle.trim(),
      artist: customBgmArtist.trim() || "내 추천곡",
      year: "2026",
    };
    setSelectedBgm(newTrack);
    retroAudioSynth.play("bgm_1");
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setCustomBgmTitle("");
    setCustomBgmArtist("");
  };

  // 일촌평 등록
  const handleAddIlchonComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const newComment: IlchonComment = {
      id: `c_${Date.now()}`,
      ilchonName: "새로운 일촌",
      author: inputAuthor.trim() || "익명 일촌",
      content: inputContent.trim(),
      time: "방금 전",
    };

    setIlchonComments((prev) => [newComment, ...prev]);
    setInputContent("");
    setInputAuthor("");
    retroAudioSynth.playSfx("pop");
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  // 캔버스 미니룸 포토카드 렌더링
  useEffect(() => {
    if (!showPhotoCardModal || !photoCanvasRef.current) return;
    const canvas = photoCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 720;
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    // 1. 카드 외곽 배경 (싸이월드 도트 프레임)
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    // 내부 흰색 보드
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(28, 28, W - 56, H - 56);

    // 2. 상단 TODAY / TOTAL & BGM 바
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(48, 48, W - 96, 54);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, W - 96, 54);

    ctx.font = "bold 20px monospace, sans-serif";
    ctx.fillStyle = "#ea580c";
    ctx.fillText(`TODAY ${todayCount}`, 68, 82);
    ctx.fillStyle = "#64748b";
    ctx.fillText(`|  TOTAL ${totalCount.toLocaleString()}`, 200, 82);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "right";
    ctx.fillText(`♬ ${selectedBgm.title.slice(0, 18)}`, W - 68, 82);
    ctx.textAlign = "left";

    // 3. 대문 타이틀
    ctx.font = "900 28px sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(homeTitle, 52, 148);

    // 4. 미니룸 캔버스 박스
    const roomX = 48;
    const roomY = 172;
    const roomW = W - 96;
    const roomH = 440;

    // 벽지
    ctx.fillStyle = selectedTheme.wallColor;
    ctx.fillRect(roomX, roomY, roomW, roomH * 0.54);

    // 바닥
    ctx.fillStyle = selectedTheme.floorColor;
    ctx.fillRect(roomX, roomY + roomH * 0.54, roomW, roomH * 0.46);

    // 몰딩 선
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(roomX, roomY + roomH * 0.54 - 4, roomW, 6);

    // 미니룸 테두리
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 3;
    ctx.strokeRect(roomX, roomY, roomW, roomH);

    // 배치된 소품 아이콘 & 이름 렌더링
    placedProps.forEach((pid) => {
      const meta = MINIROOM_PROPS.find((p) => p.id === pid);
      const pos = propPositions[pid] || DEFAULT_PROP_POSITIONS[pid] || { x: 50, y: 70 };
      if (!meta) return;
      const px = roomX + (pos.x / 100) * roomW;
      const py = roomY + (pos.y / 100) * roomH;
      ctx.font = "44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(meta.icon, px, py);
    });

    // 중앙 미니미 & 말풍선
    const mx = roomX + (minimiPosition.x / 100) * roomW;
    const my = roomY + (minimiPosition.y / 100) * roomH;

    // 말풍선 박스
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    const bubbleW = Math.min(460, Math.max(240, moodText.length * 22 + 40));
    const bubbleX = Math.max(roomX + 16, Math.min(roomX + roomW - bubbleW - 16, mx - bubbleW / 2));
    const bubbleY = my - 130;
    ctx.fillRect(bubbleX, bubbleY, bubbleW, 44);
    ctx.strokeRect(bubbleX, bubbleY, bubbleW, 44);

    ctx.font = "bold 19px sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";
    ctx.fillText(moodText.slice(0, 22), bubbleX + bubbleW / 2, bubbleY + 29);

    // 미니미 캐릭터 심볼
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(mx, my - 46, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(mx - 18, my - 22, 36, 28);
    ctx.strokeRect(mx - 18, my - 22, 36, 28);

    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(selectedMinimi.name, mx, my + 26);

    // 5. 하단 프로필 & 일촌 초대장 문구
    ctx.textAlign = "left";
    ctx.fillStyle = "#fff7ed";
    ctx.fillRect(48, 636, W - 96, 150);
    ctx.strokeStyle = "#fdba74";
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 636, W - 96, 150);

    ctx.font = "900 22px sans-serif";
    ctx.fillStyle = "#9a3412";
    ctx.fillText(`🏡 주인장: ${nickname} (🥚 오리알 ${eggCount}개)`, 72, 676);

    ctx.font = "bold 18px sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`🎨 테마: ${selectedTheme.name} · 아바타: ${selectedMinimi.name}`, 72, 714);
    ctx.fillText(`💌 "일촌 맺고 내 미니룸에 파도타러 놀러오세요! 퍼가요~♡"`, 72, 752);

    // 하단 푸터
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "center";
    ctx.fillText("토스 미니앱 [미니룸] · Y2K Retro Miniroom Studio", W / 2, 835);
    ctx.textAlign = "left";
  }, [
    showPhotoCardModal,
    homeTitle,
    nickname,
    moodText,
    todayCount,
    totalCount,
    eggCount,
    selectedTheme,
    selectedMinimi,
    selectedBgm,
    placedProps,
    propPositions,
    minimiPosition,
  ]);

  const handleDownloadPhotoCard = () => {
    if (!photoCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `miniroom-${nickname || "card"}.png`;
    link.href = photoCanvasRef.current.toDataURL("image/png");
    link.click();
    retroAudioSynth.playSfx("coin");
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  // 초대장 텍스트 복사
  const handleCopyInviteText = () => {
    const text = [
      `★..${homeTitle}..★`,
      `일촌 맺고 파도타기 하실 분~? 🌊`,
      `- 주인장: ${nickname} (🥚 오리알 ${eggCount}개)`,
      `- 오늘의 기분: ${moodText}`,
      `- 대표 BGM: ♬ ${selectedBgm.title} - ${selectedBgm.artist}`,
      `- TODAY: ${todayCount} | TOTAL: ${totalCount}`,
      `👉 토스 [미니룸]에서 내 방 구경오세요!`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    retroAudioSynth.playSfx("coin");
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    alert("🎉 미니룸 초대장이 클립보드에 복사되었습니다!");
  };

  return (
    <div
      className={`min-h-screen pb-24 font-sans select-none antialiased transition-colors duration-300 ${
        visitingFriend ? visitingFriend.skin.bgClass : "bg-[#f8fafc]"
      } ${visitingFriend ? visitingFriend.skin.containerClass : "text-gray-900"}`}
    >
      {/* 메인 컨텐츠 영역 */}
      <main className="max-w-lg mx-auto p-3.5 space-y-3.5">
        {/* 상단 헤더: 방문 모드 vs 내 홈피 모드 */}
        {visitingFriend ? (
          <div
            className={`p-3 rounded-2xl border ${visitingFriend.skin.headerBg} flex items-center justify-between shadow-2xs animate-fade-in`}
          >
            <button
              type="button"
              onClick={handleBackToMyHome}
              className="px-2.5 py-1.5 bg-white text-gray-800 text-xs font-black rounded-xl shadow-2xs border border-gray-200 transition cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>내 홈피로</span>
            </button>

            <div className="text-center min-w-0 px-2 flex-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base">{visitingFriend.avatarEmoji}</span>
                <span className="text-sm font-black truncate">{visitingFriend.ownerName}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${visitingFriend.skin.badgeBg} ${visitingFriend.skin.badgeText}`}
                >
                  {visitingFriend.ilchonTitle}
                </span>
              </div>
              <p className="text-[10px] opacity-75 truncate mt-0.5">
                "{visitingFriend.intro}"
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextPado}
              className={`px-3 py-1.5 ${visitingFriend.skin.accentBg} ${visitingFriend.skin.accentText} text-xs font-black rounded-xl shadow-2xs transition cursor-pointer flex items-center gap-1 active:scale-95`}
              title="다음 친구 방으로 파도타기"
            >
              <span>다음 🌊</span>
            </button>
          </div>
        ) : (
          /* 내 홈피일 때 인라인 레트로 타이틀 바 */
          <div className="pt-2 pb-1 px-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-1 -ml-1 text-gray-500 hover:text-gray-900 rounded-full transition cursor-pointer"
                  aria-label="뒤로가기"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black text-gray-900 tracking-tight whitespace-nowrap">
                    미니룸
                  </h1>
                  <span className="px-1.5 py-0.5 bg-orange-600 text-white rounded-md text-[10px] font-black">
                    MINIROOM
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {nickname}님의 도트 미니홈피 & 레트로 BGM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPhotoCardModal(true)}
                className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-black text-xs rounded-xl shadow-2xs transition cursor-pointer active:scale-95 flex items-center gap-1"
                title="미니룸 포토카드 저장"
              >
                <Camera className="w-3.5 h-3.5 text-orange-600" />
                <span>포토카드</span>
              </button>
              <button
                onClick={() => setShowPadoModal(true)}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <Waves className="w-3.5 h-3.5" />
                <span>파도타기</span>
              </button>
            </div>
          </div>
        )}

        {/* 미니룸 상시 렌더링 뷰어 (드래그 배치 & 터치 반응 지원) */}
        <MiniroomViewer
          theme={
            visitingFriend
              ? MINIROOM_THEMES.find((t) => t.id === visitingFriend.themeId) || selectedTheme
              : selectedTheme
          }
          minimi={
            visitingFriend
              ? MINIMI_CHARS.find((m) => m.id === visitingFriend.minimiId) || selectedMinimi
              : selectedMinimi
          }
          bgm={
            visitingFriend
              ? CY_BGMS.find((b) => b.id === visitingFriend.bgmId) || selectedBgm
              : selectedBgm
          }
          moodText={visitingFriend ? visitingFriend.moodText : moodText}
          placedProps={visitingFriend ? visitingFriend.placedProps : placedProps}
          propPositions={visitingFriend ? DEFAULT_PROP_POSITIONS : propPositions}
          minimiPosition={visitingFriend ? { x: 50, y: 82, flip: false } : minimiPosition}
          onUpdatePropPosition={visitingFriend ? undefined : handleUpdatePropPosition}
          onUpdateMinimiPosition={visitingFriend ? undefined : setMinimiPosition}
          onResetPositions={visitingFriend ? undefined : handleResetPositions}
          todayCount={visitingFriend ? visitingFriend.todayCount : todayCount}
          totalCount={visitingFriend ? visitingFriend.totalCount : totalCount}
          homeTitle={visitingFriend ? visitingFriend.homeTitle : homeTitle}
          eggCount={eggCount}
          roomFrameBg={visitingFriend?.skin.roomFrameBg}
          wallTag={visitingFriend?.skin.roomWallTag}
          editable={!visitingFriend}
          vipFont={unlockedVipFont}
        />

        {/* 탭 메뉴: 방문객 모드(2개 탭) vs 내 홈피 모드(5개 탭) */}
        {visitingFriend ? (
          <div className="grid grid-cols-2 gap-1 bg-black/5 p-1 rounded-2xl border border-black/10">
            {[
              { id: "home", label: "미니룸 & 소개", icon: Home },
              {
                id: "guestbook",
                label: "방명록 남기기",
                icon: MessageSquare,
                badge: visitingFriend.guestbook.length,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id as TabType)}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? `${visitingFriend.skin.accentBg} ${visitingFriend.skin.accentText} shadow-xs`
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black leading-none ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {[
              { id: "home", label: "미니룸", icon: Home },
              {
                id: "guestbook",
                label: "방명록",
                icon: MessageSquare,
                badge: guestbookEntries.length,
              },
              { id: "room", label: "룸꾸미기", icon: Palette },
              { id: "diary", label: "다이어리", icon: BookOpen },
              { id: "jukebox", label: "BGM", icon: Music },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id as TabType)}
                  className={`py-2 rounded-xl text-[11px] font-bold transition flex flex-col items-center gap-0.5 cursor-pointer relative ${
                    isActive
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black leading-none shadow-2xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* --- 탭 1: 홈 / 미니룸 기본 --- */}
        {activeTab === "home" && (
          <div className="space-y-3.5 animate-fade-in">
            {visitingFriend ? (
              /* 방문 중인 일촌 홈피 정보 & 액션 카드 */
              <>
                <TossCard
                  title={`🏡 ${visitingFriend.ownerName} 님의 미니홈피`}
                  subtitle={`일촌 호칭: ${visitingFriend.ilchonTitle} · "${visitingFriend.intro}"`}
                  badge={<TossBadge variant="blue">방문 중</TossBadge>}
                >
                  <div className="space-y-3 pt-1">
                    <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-950 flex items-center gap-1">
                          <span>💬 오늘의 한마디</span>
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold">
                          Today {visitingFriend.todayCount} / Total {visitingFriend.totalCount}
                        </span>
                      </div>
                      <p className="text-gray-800 font-medium">"{visitingFriend.moodText}"</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => switchTab("guestbook")}
                        className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>방명록 쓰기</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextPado}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95"
                      >
                        <Waves className="w-4 h-4" />
                        <span>다음 파도타기</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBackToMyHome}
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-black shadow-xs transition cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95"
                      >
                        <Home className="w-4 h-4" />
                        <span>내 홈피 복귀</span>
                      </button>
                    </div>
                  </div>
                </TossCard>

                {/* 친구의 최근 방명록 */}
                <TossCard
                  title={`📜 ${visitingFriend.ownerName} 님의 최근 방명록 (${visitingFriend.guestbook.length})`}
                  subtitle="친구에게 전하고 싶은 말을 남겨보세요!"
                  badge={
                    <TossBadge variant="orange">
                      새 글 {visitingFriend.guestbook.length}개
                    </TossBadge>
                  }
                >
                  <div className="space-y-2 pt-1">
                    {visitingFriend.guestbook.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-gray-900">{entry.author}</span>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
                              {entry.ilchonRelation}
                            </span>
                            {entry.duckEggGift ? (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <span>🥚</span>
                                <span>오리알</span>
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-gray-400">{entry.createdAt.slice(5)}</span>
                        </div>
                        <p className="text-gray-700 leading-snug line-clamp-1">
                          {entry.isSecret ? "🔒 비밀글입니다." : entry.content}
                        </p>
                      </div>
                    ))}

                    <div className="pt-1">
                      <TossButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => switchTab("guestbook")}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1 inline" />
                        <span>{visitingFriend.ownerName} 님 방명록에 새 글 남기기 ✏️</span>
                      </TossButton>
                    </div>
                  </div>
                </TossCard>

                {/* 다른 일촌으로 즉시 이동 카드 */}
                <TossCard
                  title="🌊 다른 일촌으로 파도타기"
                  subtitle="다른 친구들의 미니홈피로 바로 건너가보세요!"
                >
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {friendsList
                      .filter((f) => f.id !== visitingFriend.id)
                      .map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => handleSurfingTo(f)}
                          className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-xl text-center transition cursor-pointer flex flex-col items-center gap-0.5 active:scale-95"
                        >
                          <span className="text-base">{f.avatarEmoji}</span>
                          <span className="text-xs font-black text-gray-800">{f.ownerName}</span>
                          <span className="text-[10px] text-orange-600 font-bold">{f.ilchonTitle}</span>
                        </button>
                      ))}
                  </div>
                </TossCard>
              </>
            ) : (
              /* 내 홈피일 때 */
              <>
                {/* 1. Today Is... 기분 & 대문/프로필 커스텀 카드 */}
                <TossCard
                  title="💬 Today is... 기분 & 대문 꾸미기"
                  subtitle="미니미 말풍선과 미니홈피 대문 제목을 Y2K 감성으로 바꿔보세요"
                  badge={
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile((p) => !p)}
                      className="px-2 py-0.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                      <span>{isEditingProfile ? "접기" : "대문·닉네임 변경"}</span>
                    </button>
                  }
                >
                  <div className="space-y-3 pt-1">
                    {/* 대문 제목 & 닉네임 편집 폼 (열렸을 때) */}
                    {isEditingProfile && (
                      <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2.5 animate-fade-in">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="text-[10px] font-bold text-orange-900 block mb-1">
                              미니홈피 대문 제목
                            </label>
                            <input
                              type="text"
                              value={homeTitle}
                              onChange={(e) => setHomeTitle(e.target.value)}
                              maxLength={26}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-orange-300 rounded-xl focus:outline-hidden focus:border-orange-600"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-orange-900 block mb-1">
                              내 닉네임
                            </label>
                            <input
                              type="text"
                              value={nickname}
                              onChange={(e) => setNickname(e.target.value)}
                              maxLength={10}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-orange-300 rounded-xl focus:outline-hidden focus:border-orange-600"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {[
                            "★..oOl쁜ol의 작은공간..★",
                            "†..눈물의 왕국..†",
                            "🌸 봄날의 비밀일기 🌸",
                            "🎧 음악이 흐르는 다락방",
                          ].map((titlePreset) => (
                            <button
                              key={titlePreset}
                              type="button"
                              onClick={() => setHomeTitle(titlePreset)}
                              className="px-2 py-0.5 bg-white hover:bg-orange-100 border border-orange-200 rounded-lg text-[10px] font-bold text-orange-900 cursor-pointer"
                            >
                              {titlePreset}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 말풍선 직접 입력 + Y2K 싸이체 원클릭 변환 */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={moodText}
                        onChange={(e) => setMoodText(e.target.value)}
                        maxLength={32}
                        placeholder="미니미 말풍선 한마디 입력..."
                        className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#FF7710] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMoodText((prev) => convertToCyStyle(prev));
                          retroAudioSynth.playSfx("coin");
                          confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
                        }}
                        className="px-2.5 py-2 bg-slate-800 hover:bg-slate-900 text-amber-300 rounded-xl text-[11px] font-black shrink-0 cursor-pointer flex items-center gap-1 active:scale-95"
                        title="2005년 싸이월드 감성체로 자동 변환"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>싸이체 변환</span>
                      </button>
                    </div>

                    {/* 기분 프리셋 6종 */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {MOOD_PRESETS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setMoodText(m.status);
                            retroAudioSynth.playSfx("pop");
                            confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
                          }}
                          className={`p-2 rounded-xl text-left border transition cursor-pointer flex items-center gap-2 ${
                            moodText === m.status
                              ? "bg-orange-50 border-orange-400 text-orange-950 shadow-2xs"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-base">{m.emoji}</span>
                          <span className="text-xs font-extrabold">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TossCard>

                {/* 2. 일촌 파도타기 탐험 카드 */}
                <TossCard
                  title="🌊 일촌 파도타기 탐험 (4명의 단짝 일촌)"
                  subtitle="추억의 일촌들 미니홈피로 파도타기를 떠나 방명록과 오리알을 남겨보세요!"
                  badge={
                    <button
                      onClick={handleRandomPado}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black transition cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <Shuffle className="w-2.5 h-2.5" />
                      <span>랜덤 파도타기</span>
                    </button>
                  }
                >
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {friendsList.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 bg-gradient-to-br from-slate-50 to-orange-50/30 border border-slate-200/90 rounded-xl flex flex-col justify-between gap-2 hover:border-orange-300 transition"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-base">{f.avatarEmoji}</span>
                            <div className="min-w-0">
                              <h4 className="font-black text-xs text-gray-900 truncate">
                                {f.ownerName}
                              </h4>
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1 py-0.2 rounded">
                                {f.ilchonTitle}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1">"{f.intro}"</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSurfingTo(f)}
                          className="w-full py-1 bg-white hover:bg-orange-500 hover:text-white text-orange-700 border border-orange-200 rounded-lg text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 shadow-2xs active:scale-95"
                        >
                          <span>놀러가기 🌊</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </TossCard>

                {/* 3. 방명록 최근 소식 하이라이트 카드 */}
                <TossCard
                  title={`📜 최근 방명록 (${guestbookEntries.length})`}
                  subtitle="일촌들이 남긴 따뜻한 글과 오리알 선물이에요"
                  badge={
                    <TossBadge variant="orange">
                      새 글 {guestbookEntries.length}개
                    </TossBadge>
                  }
                >
                  <div className="space-y-2 pt-1">
                    {guestbookEntries.slice(0, 2).map((entry) => (
                      <div
                        key={entry.id}
                        className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-gray-900">{entry.author}</span>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
                              {entry.ilchonRelation}
                            </span>
                            {entry.duckEggGift ? (
                              <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <span>🥚</span>
                                <span>오리알</span>
                              </span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-gray-400">{entry.createdAt.slice(5)}</span>
                        </div>
                        <p className="text-gray-700 leading-snug line-clamp-1">
                          {entry.isSecret ? "🔒 비밀글입니다." : entry.content}
                        </p>
                      </div>
                    ))}

                    <div className="pt-1">
                      <TossButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => switchTab("guestbook")}
                      >
                        <BookOpen className="w-3.5 h-3.5 mr-1 inline" />
                        <span>방명록 전체보기 & 새 글 쓰기 ({guestbookEntries.length})</span>
                      </TossButton>
                    </div>
                  </div>
                </TossCard>

                {/* 4. 한 줄 일촌평 섹션 */}
                <TossCard
                  title={`💌 What Friends Say (${ilchonComments.length})`}
                  subtitle="한 줄로 마음을 전하던 그 시절 일촌평"
                >
                  <form onSubmit={handleAddIlchonComment} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="닉네임"
                      value={inputAuthor}
                      onChange={(e) => setInputAuthor(e.target.value)}
                      className="w-24 px-2.5 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden focus:border-[#FF7710]"
                    />
                    <input
                      type="text"
                      placeholder="일촌평을 남겨주세요 (ex: 퍼가요~♡)"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden focus:border-[#FF7710]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#FF7710] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      등록
                    </button>
                  </form>

                  <div className="space-y-2">
                    {ilchonComments.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 bg-gray-50 border border-gray-200/80 rounded-xl text-xs flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded">
                              {c.ilchonName}
                            </span>
                            <span className="font-bold text-gray-900">{c.author}</span>
                          </div>
                          <p className="text-gray-700 leading-snug">{c.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">{c.time}</span>
                      </div>
                    ))}
                  </div>
                </TossCard>
              </>
            )}
          </div>
        )}

        {/* --- 탭 2: 방명록 --- */}
        {activeTab === "guestbook" && (
          <div className="space-y-3.5 animate-fade-in">
            {visitingFriend ? (
              <div
                className={`p-3.5 rounded-2xl border ${visitingFriend.skin.headerBg} flex items-center justify-between shadow-2xs`}
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-black">
                      📜 {visitingFriend.ownerName} 님의 방명록
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${visitingFriend.skin.badgeBg} ${visitingFriend.skin.badgeText}`}
                    >
                      총 {visitingFriend.guestbook.length}개
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 font-medium">
                    {visitingFriend.ownerName} 님에게 따뜻한 한마디와 오리알을 남겨주세요
                  </p>
                </div>
                <div className="px-2.5 py-1 bg-black/10 rounded-xl text-xs font-black flex items-center gap-1">
                  <span>🥚 내 오리알</span>
                  <span className="font-extrabold">{eggCount}개</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-gray-900 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-black">📜 추억의 감성 방명록</span>
                    <span className="px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold">
                      총 {guestbookEntries.length}개
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    친구들이 남긴 방명록과 오리알 선물 목록이에요
                  </p>
                </div>
                <div className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-black flex items-center gap-1">
                  <span>🥚 내 오리알</span>
                  <span className="text-amber-700 font-extrabold">{eggCount}개</span>
                </div>
              </div>
            )}

            {/* 방명록 작성 폼 카드 */}
            <TossCard
              title={
                visitingFriend
                  ? `✏️ ${visitingFriend.ownerName} 님에게 방명록 쓰기`
                  : "✏️ 방명록 남기기"
              }
              subtitle={
                visitingFriend
                  ? `${visitingFriend.ilchonTitle} ${visitingFriend.ownerName} 님의 미니홈피에 글을 남겨보세요`
                  : "미니홈피 주인장에게 따뜻한 한마디와 오리알을 선물하세요"
              }
            >
              <form onSubmit={handleAddGuestbook} className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      방문자 닉네임
                    </label>
                    <input
                      type="text"
                      placeholder="내 닉네임 (ex: 짱구)"
                      value={gbAuthor}
                      onChange={(e) => setGbAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden focus:border-[#FF7710]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      일촌 관계 호칭
                    </label>
                    <select
                      value={gbRelation}
                      onChange={(e) => setGbRelation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden focus:border-[#FF7710]"
                    >
                      <option value="영혼의 단짝">영혼의 단짝</option>
                      <option value="기억속 첫사랑">기억속 첫사랑</option>
                      <option value="동네 친구">동네 친구</option>
                      <option value="파도타기 손님">파도타기 손님</option>
                      <option value="비밀 친구">비밀 친구</option>
                    </select>
                  </div>
                </div>

                {/* 방문자 아바타 선택 */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    내 미니미 아바타
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: "boy", icon: "👦", label: "소년" },
                      { id: "girl", icon: "👧", label: "소녀" },
                      { id: "rocker", icon: "🎸", label: "락커" },
                      { id: "cat", icon: "🐱", label: "집순이" },
                      { id: "hiphop", icon: "🧢", label: "힙합" },
                    ].map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setGbAvatar(av.id as GuestbookEntry["avatarType"])}
                        className={`p-1.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                          gbAvatar === av.id
                            ? "bg-orange-50 border-orange-500 shadow-2xs font-black text-orange-900"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-base">{av.icon}</span>
                        <span className="text-[10px]">{av.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 감성 스탬프 도장 선택 */}
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    감성 스탬프 도장
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {[
                      { id: "scrap", label: "퍼가요~♡", color: "text-pink-600 bg-pink-50 border-pink-200" },
                      { id: "pado", label: "파도타기 🌊", color: "text-blue-600 bg-blue-50 border-blue-200" },
                      { id: "bgm", label: "BGM 짱 🎵", color: "text-amber-600 bg-amber-50 border-amber-200" },
                      { id: "love", label: "들렀다감 ♥", color: "text-rose-600 bg-rose-50 border-rose-200" },
                      { id: "hi", label: "오리알 쐈다 🥚", color: "text-orange-600 bg-orange-50 border-orange-200" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setGbSticker(st.id as any)}
                        className={`px-1 py-1.5 rounded-lg border text-[10px] font-bold transition truncate text-center cursor-pointer ${
                          gbSticker === st.id
                            ? `${st.color} border-current ring-1 ring-orange-400 font-black`
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 빠른 추천 문구 버튼 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-gray-700">추억의 추천 문구 탭하기</span>
                    <button
                      type="button"
                      onClick={() => setGbContent((p) => convertToCyStyle(p))}
                      className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                    >
                      ✨ 싸이체 자동변환
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "퍼가요~♡",
                      "BGM 선곡 대박! 누구 노래야?",
                      "오리알 1개 투척하고 감 🥚",
                      "파도타고 놀러왔어 🌊 맞파 가자!",
                      "들렀다 갑니다 총총.. ^^",
                      "미니룸 너무 예쁘다 잘 꾸몄네!",
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setGbContent(preset)}
                        className="px-2 py-1 bg-amber-50 hover:bg-orange-100/70 border border-amber-200/90 rounded-lg text-[10px] font-bold text-amber-900 transition cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 방명록 본문 */}
                <div>
                  <textarea
                    rows={3}
                    placeholder="방명록을 남겨주세요... (비공개 스크랩 금지! 싸이감성 문구 환영)"
                    value={gbContent}
                    onChange={(e) => setGbContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:outline-hidden focus:border-[#FF7710] resize-none"
                  />
                </div>

                {/* 옵션 체크박스들 */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={gbSendEgg}
                      onChange={(e) => setGbSendEgg(e.target.checked)}
                      className="w-4 h-4 accent-[#FF7710] rounded"
                    />
                    <span>
                      {visitingFriend
                        ? `🥚 오리알 1개 선물하기 (보유: ${eggCount}개)`
                        : "🥚 오리알 1개 선물 동봉하기"}
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-bold text-gray-600">
                    <input
                      type="checkbox"
                      checked={gbIsSecret}
                      onChange={(e) => setGbIsSecret(e.target.checked)}
                      className="w-4 h-4 accent-[#FF7710] rounded"
                    />
                    <span>🔒 비밀글 (주인장만 보기)</span>
                  </label>
                </div>

                <TossButton variant="primary" size="md" className="w-full">
                  <Send className="w-4 h-4 mr-1.5 inline" />
                  <span>
                    {visitingFriend
                      ? `${visitingFriend.ownerName} 님에게 방명록 남기기`
                      : "방명록 등록하기"}
                  </span>
                </TossButton>
              </form>
            </TossCard>

            {/* 방명록 피드 리스트 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-gray-800">
                  {visitingFriend ? `${visitingFriend.ownerName} 님의 방명록 목록` : "방명록 목록"} (
                  {(visitingFriend ? visitingFriend.guestbook : guestbookEntries).length})
                </h3>
                <span className="text-[11px] text-gray-400">최신순 정렬</span>
              </div>

              {(visitingFriend ? visitingFriend.guestbook : guestbookEntries).map((entry) => {
                const isUnlocked = !entry.isSecret || unlockedSecretIds.includes(entry.id);
                const avatarIcon =
                  entry.avatarType === "girl"
                    ? "👧"
                    : entry.avatarType === "rocker"
                    ? "🎸"
                    : entry.avatarType === "cat"
                    ? "🐱"
                    : entry.avatarType === "hiphop"
                    ? "🧢"
                    : "👦";

                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border-2 border-[#cbd5e1] shadow-2xs overflow-hidden transition"
                  >
                    <div className="bg-[#f1f5f9] px-3.5 py-2 border-b border-[#cbd5e1] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-extrabold text-gray-400 shrink-0">
                          No. {entry.no}
                        </span>
                        <span className="text-base shrink-0">{avatarIcon}</span>
                        <div className="min-w-0 flex items-center gap-1.5">
                          <span className="font-black text-gray-900 truncate">
                            {entry.author}
                          </span>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded-md shrink-0">
                            {entry.ilchonRelation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                        {entry.isSecret ? (
                          <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 font-bold rounded flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>비밀글</span>
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                            공개
                          </span>
                        )}
                        <span className="text-gray-400">{entry.createdAt}</span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {entry.duckEggGift ? (
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-[10px] font-black text-amber-900 flex items-center gap-1 shadow-2xs">
                            <span className="animate-bounce">🥚</span>
                            <span>오리알 1개 선물 도착!</span>
                          </span>
                        ) : null}

                        {entry.sticker === "scrap" && (
                          <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded-md text-[10px] font-black">
                            퍼가요~♡
                          </span>
                        )}
                        {entry.sticker === "pado" && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-black">
                            파도타기 🌊
                          </span>
                        )}
                        {entry.sticker === "bgm" && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px] font-black">
                            BGM 짱 🎵
                          </span>
                        )}
                        {entry.sticker === "love" && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-[10px] font-black">
                            들렀다감 ♥
                          </span>
                        )}
                        {entry.sticker === "hi" && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-md text-[10px] font-black">
                            오리알 쐈다 🥚
                          </span>
                        )}
                      </div>

                      {entry.isSecret && !isUnlocked ? (
                        <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center space-y-1.5">
                          <p className="text-xs text-gray-500 font-medium">
                            🔒 <b>비밀글입니다.</b> 작성자와 미니홈피 주인장만 볼 수 있어요.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleToggleUnlockSecret(entry.id)}
                            className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-[11px] font-bold rounded-lg transition cursor-pointer"
                          >
                            비밀글 열람하기 🔑
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                          {entry.content}
                        </p>
                      )}

                      {entry.reply ? (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-extrabold text-orange-900 flex items-center gap-1">
                              <CornerDownRight className="w-3 h-3 text-orange-600" />
                              <span>ㄴ 💬 {entry.reply.author}</span>
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {entry.reply.createdAt}
                            </span>
                          </div>
                          <p className="text-gray-700 pl-4">{entry.reply.content}</p>
                        </div>
                      ) : (
                        <div className="pt-1">
                          {replyTargetId === entry.id ? (
                            <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                              <div className="flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3 text-gray-400 shrink-0" />
                                <input
                                  type="text"
                                  placeholder="주인장 답글을 입력하세요 (ex: 들러줘서 고마워!)"
                                  value={replyInputText}
                                  onChange={(e) => setReplyInputText(e.target.value)}
                                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-hidden focus:border-[#FF7710]"
                                />
                              </div>
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyTargetId(null);
                                    setReplyInputText("");
                                  }}
                                  className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-200 rounded-lg transition"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddReply(entry.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-[#FF7710] text-white rounded-lg hover:bg-[#ea580c] transition"
                                >
                                  답글 등록
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyTargetId(entry.id);
                                setReplyInputText("");
                              }}
                              className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>답글 달기</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- 탭 3: 미니룸 꾸미기 & 오리알 상점 --- */}
        {activeTab === "room" && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 1. 원클릭 인테리어 방 프리셋 4종 */}
            <TossCard
              title="✨ 원클릭 인테리어 프리셋"
              subtitle="고민 없이 1초 만에 완성하는 감성 미니룸 세트"
              badge={<TossBadge variant="orange">추천 코디</TossBadge>}
            >
              <div className="grid grid-cols-2 gap-2 pt-1">
                {ROOM_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-2.5 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-orange-50/40 hover:border-orange-400 text-left transition cursor-pointer flex flex-col justify-between gap-1.5 active:scale-95"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-black text-gray-900 truncate">
                          {preset.name}
                        </span>
                        <span className="px-1.5 py-0.2 bg-orange-100 text-orange-700 rounded text-[9px] font-black shrink-0">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">
                        {preset.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold text-orange-600">
                      세트 바로 적용 →
                    </span>
                  </button>
                ))}
              </div>
            </TossCard>

            {/* 2. 벽지/바닥 테마 선택 (6종) */}
            <TossCard
              title="🎨 미니룸 테마 벽지 (6종)"
              subtitle="벚꽃 낙하·빗소리 무드 등 스페셜 벽지를 오리알로 해금해보세요"
              badge={
                <span className="text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  🥚 보유: {eggCount}개
                </span>
              }
            >
              <div className="grid grid-cols-2 gap-2 pt-1">
                {MINIROOM_THEMES.map((t) => {
                  const unlocked = isItemUnlocked(t.id, t.eggCost);
                  const isSelected = selectedTheme.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (!unlocked) {
                          handleUnlockWithEggs(t.id, t.name, t.eggCost || 3, () =>
                            setSelectedTheme(t)
                          );
                        } else {
                          setSelectedTheme(t);
                          retroAudioSynth.playSfx("pop");
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-[#FF7710] bg-orange-50 shadow-xs"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <span className="text-xs font-extrabold text-gray-900 block truncate">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {unlocked ? t.tag : `🔒 오리알 ${t.eggCost}개 해금`}
                        </span>
                      </div>
                      <div
                        className="w-6 h-6 rounded-full border border-gray-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: t.wallColor }}
                      />
                    </button>
                  );
                })}
              </div>
            </TossCard>

            {/* 3. 미니미 아바타 선택 (7종) */}
            <TossCard
              title="👤 미니미 아바타 고르기 (7종)"
              subtitle="나를 표현하는 도트 캐릭터를 설정하세요"
            >
              <div className="space-y-2 pt-1">
                {MINIMI_CHARS.map((char) => {
                  const unlocked = isItemUnlocked(char.id, char.eggCost);
                  const isSelected = selectedMinimi.id === char.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        if (!unlocked) {
                          handleUnlockWithEggs(char.id, char.name, char.eggCost || 3, () =>
                            setSelectedMinimi(char)
                          );
                        } else {
                          setSelectedMinimi(char);
                          retroAudioSynth.playSfx("pop");
                        }
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isSelected
                          ? "border-[#FF7710] bg-orange-50/60 shadow-xs"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-900">{char.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{char.desc}</p>
                      </div>
                      {isSelected ? (
                        <TossBadge variant="orange" size="sm">
                          장착중
                        </TossBadge>
                      ) : unlocked ? (
                        <span className="text-[11px] font-bold text-gray-400">선택</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-black">
                          🔒 🥚 {char.eggCost}개
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </TossCard>

            {/* 4. 도트 가구 & 소품 12종 배치 */}
            <TossCard
              title={`🛋️ 미니룸 가구 & 소품 배치 (${placedProps.length}/12)`}
              subtitle="소품을 배치한 뒤 위 미니룸의 [배치 이동] 버튼으로 자유롭게 드래그하세요"
              badge={
                <button
                  type="button"
                  onClick={() => {
                    handleResetPositions();
                    retroAudioSynth.playSfx("pop");
                  }}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>위치 정렬</span>
                </button>
              }
            >
              <div className="grid grid-cols-2 gap-2 pt-1">
                {MINIROOM_PROPS.map((prop) => {
                  const unlocked = isItemUnlocked(prop.id, prop.eggCost);
                  const isPlaced = placedProps.includes(prop.id);
                  return (
                    <button
                      key={prop.id}
                      onClick={() => handleToggleProp(prop.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isPlaced
                          ? "border-emerald-500 bg-emerald-50/50 shadow-2xs"
                          : unlocked
                          ? "border-gray-200 bg-white hover:bg-gray-50 opacity-75"
                          : "border-amber-200 bg-amber-50/30 hover:bg-amber-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{prop.icon}</span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-900 block truncate">
                            {prop.name}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold">
                            {isPlaced
                              ? "✅ 배치중"
                              : unlocked
                              ? "보관함 (터치해 배치)"
                              : `🔒 오리알 ${prop.eggCost}개 해금`}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TossCard>
          </div>
        )}

        {/* --- 탭 4: 감성 다이어리 & 백문백답 --- */}
        {activeTab === "diary" && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 1. 다이어리 작성 & Y2K 싸이체 변환 */}
            <TossCard
              title="📖 그 시절 감성 다이어리"
              subtitle="비공개 스크랩 금지! 새벽 감성 일기를 기록하고 싸이체로 변환해보세요"
              badge={<TossBadge variant="purple">일기 {diaryEntries.length}편</TossBadge>}
            >
              <form onSubmit={handleAddDiaryEntry} className="space-y-2.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newDiaryWeather}
                    onChange={(e) => setNewDiaryWeather(e.target.value as DiaryEntry["weather"])}
                    className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="🌙 새벽">🌙 새벽</option>
                    <option value="☀️ 맑음">☀️ 맑음</option>
                    <option value="🌧️ 비">🌧️ 비</option>
                    <option value="☃️ 눈">☃️ 눈</option>
                  </select>
                  <select
                    value={newDiaryMood}
                    onChange={(e) => setNewDiaryMood(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="💧 센치함">💧 센치함</option>
                    <option value="☀️ 행복">☀️ 행복</option>
                    <option value="💓 설렘">💓 설렘</option>
                    <option value="🔥 열공">🔥 열공</option>
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={newDiaryText}
                  onChange={(e) => setNewDiaryText(e.target.value)}
                  placeholder="오늘의 감성 일기를 적어보세요..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-xl focus:outline-hidden resize-none leading-relaxed"
                />

                {/* 명문장 추천 & 싸이체 변환 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {RETRO_CY_QUOTES.slice(0, 3).map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewDiaryText(q)}
                        className="px-2 py-1 bg-gray-100 hover:bg-orange-50 text-[10px] font-bold text-gray-700 rounded-lg border border-gray-200 cursor-pointer"
                      >
                        명대사 {idx + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewDiaryText((prev) => convertToCyStyle(prev));
                      retroAudioSynth.playSfx("coin");
                    }}
                    className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[10px] font-black shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>싸이체 변환</span>
                  </button>
                </div>

                <TossButton variant="primary" size="sm" className="w-full">
                  <span>다이어리에 일기 남기기 ✍️</span>
                </TossButton>
              </form>

              {/* 저장된 일기장 피드 */}
              <div className="space-y-2.5 pt-3 mt-3 border-t border-gray-100">
                {diaryEntries.map((d) => (
                  <div
                    key={d.id}
                    className="p-3.5 bg-[#1e293b] text-white rounded-2xl shadow-inner space-y-2 border border-slate-700"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-700 pb-1.5">
                      <span className="font-mono font-bold text-orange-300">{d.date}</span>
                      <span>
                        {d.weather} · {d.mood}
                      </span>
                    </div>
                    <p
                      className={`text-xs leading-relaxed text-slate-100 whitespace-pre-line py-1 ${
                        unlockedVipFont ? "font-mono tracking-wide" : "italic"
                      }`}
                    >
                      "{d.content}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>- {nickname}의 비밀 일기장 -</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDiaryEntries((prev) =>
                            prev.map((item) =>
                              item.id === d.id ? { ...item, likes: item.likes + 1 } : item
                            )
                          );
                          retroAudioSynth.playSfx("pop");
                        }}
                        className="px-2 py-0.5 bg-white/10 hover:bg-rose-500/30 text-rose-300 rounded-full font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Heart className="w-3 h-3 fill-current" />
                        <span>공감 {d.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </TossCard>

            {/* 2. 추억의 백문백답 (미니 5문항) */}
            <TossCard
              title="📝 2005 추억의 백문백답"
              subtitle="질문을 눌러 나만의 답변으로 수정해 보세요"
              badge={<TossBadge variant="orange">인기 코너</TossBadge>}
            >
              <div className="space-y-2 pt-1">
                {qnaItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-orange-950">{item.q}</span>
                      {editingQnaId !== item.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQnaId(item.id);
                            setEditingQnaText(item.a);
                          }}
                          className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                        >
                          답변 수정 ✏️
                        </button>
                      )}
                    </div>

                    {editingQnaId === item.id ? (
                      <div className="flex gap-1.5 pt-1">
                        <input
                          type="text"
                          value={editingQnaText}
                          onChange={(e) => setEditingQnaText(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-orange-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveQna(item.id)}
                          className="px-2.5 py-1 bg-orange-600 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          저장
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-700 font-medium pl-2 border-l-2 border-orange-300">
                        👉 {item.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TossCard>
          </div>
        )}

        {/* --- 탭 5: BGM 주크박스 --- */}
        {activeTab === "jukebox" && (
          <div className="space-y-3.5 animate-fade-in">
            <TossCard
              title="🎵 내 BGM 직접 입력하기"
              subtitle="좋아하는 노래 제목과 아티스트를 직접 적어 대표곡으로 등록해 보세요"
            >
              <form onSubmit={handleApplyCustomBgm} className="space-y-2.5 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">
                    곡 제목 (필수)
                  </label>
                  <input
                    type="text"
                    value={customBgmTitle}
                    onChange={(e) => setCustomBgmTitle(e.target.value)}
                    placeholder="예: 프리스타일 - Y / 뉴진스 - Ditto"
                    maxLength={30}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF7710] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">
                    가수 / 아티스트 (선택)
                  </label>
                  <input
                    type="text"
                    value={customBgmArtist}
                    onChange={(e) => setCustomBgmArtist(e.target.value)}
                    placeholder="예: 내 애창곡 / 감성 플레이리스트"
                    maxLength={20}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF7710] focus:bg-white transition"
                  />
                </div>
                <div className="pt-1">
                  <TossButton variant="primary" size="md" type="submit" disabled={!customBgmTitle.trim()}>
                    <span>♬ 이 곡으로 대표 BGM 등록하기</span>
                  </TossButton>
                </div>
              </form>
            </TossCard>

            <TossCard
              title="📻 감성 Lo-Fi & 8-bit BGM (8선)"
              subtitle="클릭 시 브라우저 내장 신디사이저로 레트로 멜로디가 실제 연주됩니다"
              badge={<TossBadge variant="green">저작권 0% 안심 음원</TossBadge>}
            >
              <div className="space-y-2 pt-1">
                {CY_BGMS.map((track) => {
                  const isCurrent = selectedBgm.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        setSelectedBgm(track);
                        retroAudioSynth.play(track.id);
                        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                      }}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                        isCurrent
                          ? "border-[#FF7710] bg-orange-50 shadow-xs"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-900 truncate">
                            {track.title}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            ({track.year})
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{track.artist}</p>
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center gap-1">
                          <span className="flex items-end gap-0.5 h-3 shrink-0">
                            <span className="w-0.5 bg-orange-500 h-2 animate-bounce" />
                            <span className="w-0.5 bg-orange-500 h-3 animate-pulse" />
                            <span className="w-0.5 bg-orange-500 h-1.5 animate-bounce" />
                          </span>
                          <TossBadge variant="orange" size="sm">
                            재생중
                          </TossBadge>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-orange-600 hover:underline">
                          듣기 & 설정
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </TossCard>
          </div>
        )}

        {/* 오너 전용 기능: 보상형 광고 & 토스페이 결제 & 포토카드 공유 (내 홈피에서만 노출) */}
        {!visitingFriend && (
          <>
            {/* 보상형 광고: 오리알 10개 무료 충전 */}
            <TossCard
              title="🥚 오리알 10개 무료 충전소"
              subtitle="광고를 시청하면 전설의 황금 오리왕 미니미와 오리알 10개가 즉시 지급됩니다"
              badge={
                <TossBadge variant="purple">
                  {unlockedGoldSkin ? "보너스 충전" : "무료 충전"}
                </TossBadge>
              }
            >
              <div className="pt-1 text-center space-y-2">
                <div className="bg-purple-50/80 border border-purple-200/90 rounded-xl p-2.5 text-[11px] text-purple-950 flex items-center gap-2 text-left">
                  <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[9px] font-black shrink-0">
                    사전 고지
                  </span>
                  <span className="leading-tight">
                    5초 분량의 광고를 시청하면 오리알 10개와 황금 오리왕 아바타가 즉시 무료로 지급됩니다.
                  </span>
                </div>
                <TossButton
                  variant="secondary"
                  size="md"
                  onClick={() => setIsAdOpen(true)}
                >
                  <Sparkles className="w-4 h-4 mr-1 text-purple-600 inline" />
                  <span>[광고] 5초 시청 후 오리알 10개 받기</span>
                </TossButton>
              </div>
            </TossCard>

            {/* 토스페이 소액 결제 (990원): Y2K 감성 폰트 & 가구 풀세트 */}
            <TossCard
              title="✨ Y2K 레트로 폰트 & 프리미엄 도트 가구 풀세트"
              subtitle="그 시절 픽셀 폰트와 12종 전체 가구·테마·아바타 영구 잠금 해제"
              badge={
                <TossBadge variant="orange">
                  {unlockedVipFont ? "소장 완료" : "990원"}
                </TossBadge>
              }
            >
              {unlockedVipFont ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 animate-fade-in">
                  🎉 <b>Y2K 감성 폰트팩 & 12종 전체 도트 가구·테마 풀패키지</b>가 영구 소장되었습니다!
                </div>
              ) : (
                <div className="pt-2 text-center">
                  <TossButton
                    variant="secondary"
                    size="md"
                    onClick={() => setIsPaymentOpen(true)}
                  >
                    <Award className="w-4 h-4 mr-1 text-amber-500 inline" />
                    <span>풀세트 영구 소장하기 (990원)</span>
                  </TossButton>
                </div>
              )}
            </TossCard>

            {/* 포토카드 이미지 저장 & 초대장 공유 버튼 */}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <TossButton
                variant="secondary"
                size="lg"
                onClick={() => setShowPhotoCardModal(true)}
              >
                <Camera className="w-4 h-4 mr-1.5 inline text-orange-600" />
                <span>포토카드 이미지 저장</span>
              </TossButton>
              <TossButton variant="primary" size="lg" onClick={handleCopyInviteText}>
                <Share2 className="w-4 h-4 mr-1.5 inline" />
                <span>초대장 텍스트 복사</span>
              </TossButton>
            </div>
          </>
        )}
      </main>

      {/* 📸 내 미니룸 포토카드 저장 모달 */}
      {showPhotoCardModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowPhotoCardModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-black">📸 내 미니룸 포토카드</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoCardModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 bg-slate-50">
              <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-sm bg-white">
                <canvas
                  ref={photoCanvasRef}
                  className="w-full h-auto block"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPhotoCard}
                  className="py-3 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-2xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>이미지 저장 (PNG)</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyInviteText}
                  className="py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-2xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>초대 문구 복사</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 일촌 파도타기 (Surfing) 탐험 바텀시트 모달 */}
      {showPadoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
          onClick={() => setShowPadoModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Waves className="w-5 h-5 text-sky-300" />
                  <h3 className="text-base font-black">🌊 일촌 파도타기 탐험</h3>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  친구들의 개성 넘치는 미니홈피로 파도를 타고 떠나보세요!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPadoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRandomPado}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Shuffle className="w-4 h-4 text-amber-300" />
                  <span>🎲 랜덤 파도타기</span>
                </button>

                {visitingFriend ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleBackToMyHome();
                      setShowPadoModal(false);
                    }}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Home className="w-4 h-4 text-orange-500" />
                    <span>🏠 내 홈피로 복귀</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const first = friendsList[0];
                      if (first) handleSurfingTo(first);
                    }}
                    className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>첫 번째 친구 방문</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-gray-700 px-1">
                  <span>추억의 단짝 일촌들 ({friendsList.length}명)</span>
                  <span className="text-[10px] text-gray-400">클릭 시 즉시 방문</span>
                </div>

                <div className="space-y-2">
                  {friendsList.map((f) => {
                    const isCurrent = visitingFriend?.id === f.id;
                    const friendTheme = MINIROOM_THEMES.find((t) => t.id === f.themeId);

                    return (
                      <div
                        key={f.id}
                        onClick={() => handleSurfingTo(f)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? "bg-blue-50/80 border-blue-400 shadow-xs"
                            : "bg-white hover:bg-orange-50/40 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-2xl shrink-0 p-1.5 bg-gray-100 rounded-2xl">
                            {f.avatarEmoji}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-gray-900 truncate">
                                {f.ownerName}
                              </span>
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.2 rounded-md">
                                {f.ilchonTitle}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                                  방문 중 📍
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 truncate mt-0.5 font-medium">
                              "{f.intro}"
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                              <span>🎨 {friendTheme?.name || "기본 룸"}</span>
                              <span>·</span>
                              <span>📜 방명록 {f.guestbook.length}개</span>
                              <span>·</span>
                              <span>Today {f.todayCount}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSurfingTo(f);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shrink-0 active:scale-95 ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : "bg-orange-500 hover:bg-orange-600 text-white shadow-2xs"
                          }`}
                        >
                          {isCurrent ? "구경 중" : "방문 🌊"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-1.5">
                <span className="text-base shrink-0">💡</span>
                <span>
                  일촌 미니홈피에 방문하여 <b>[방명록]</b> 탭에서 글을 남기거나 보유한 <b>오리알(🥚)</b>을 선물해보세요! 친구의 방명록에 따뜻한 추억이 기록됩니다.
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPadoModal(false)}
                className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 보상형 광고 모달 */}
      <RewardedAdModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onRewarded={() => {
          setUnlockedGoldSkin(true);
          setEggCount((prev) => prev + 10);
          retroAudioSynth.playSfx("coin");
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }}
        rewardTitle="오리알 10개 무료 충전"
        adDurationSeconds={5}
      />

      {/* 토스페이 결제 모달 */}
      <TossPayModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => {
          setIsPaymentOpen(false);
          setUnlockedVipFont(true);
          retroAudioSynth.playSfx("coin");
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
          alert("🎉 Y2K 레트로 폰트 & 12종 도트 가구 풀세트가 영구 소장되었습니다!");
        }}
        productTitle="Y2K 레트로 폰트 & 프리미엄 도트 가구 풀세트"
        price={990}
      />
    </div>
  );
};
