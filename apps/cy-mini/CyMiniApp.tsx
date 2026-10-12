/**
 * 싸이감성 미니홈피 - 메인 인앱 컴포넌트
 * - 토스 디자인 시스템(TDS) & 2000년대 싸이월드 Y2K 레트로 감성 결합
 * - 4개 탭: [미니룸/홈] / [방명록] / [미니룸 꾸미기] / [BGM 주크박스]
 * - 오리알 충전 보상형 광고 & 990원 프리미엄 스킨 소장 결제 연동
 */

import React, { useState, useEffect } from "react";
import {
  CY_BGMS,
  MINIROOM_THEMES,
  MINIMI_CHARS,
  MINIROOM_PROPS,
  MOOD_PRESETS,
  RETRO_CY_QUOTES,
  DEFAULT_ILCHON_COMMENTS,
  DEFAULT_GUESTBOOK_ENTRIES,
  BpmTrack,
  MiniroomTheme,
  MinimiChar,
  IlchonComment,
  GuestbookEntry,
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
  MessageCircle,
  MessageSquare,
  Share2,
  ChevronLeft,
  Flame,
  Award,
  RefreshCw,
  Plus,
  Send,
  Lock,
  Unlock,
  CornerDownRight,
  CheckCircle2,
} from "lucide-react";

interface CyMiniAppProps {
  onBack?: () => void;
}

export const CyMiniApp: React.FC<CyMiniAppProps> = ({ onBack }) => {
  // 1. 미니홈피 기본 상태
  const [homeTitle, setHomeTitle] = useState("★..oOl쁜ol의 작은공간..★");
  const [nickname, setNickname] = useState("반짝이는별");
  const [moodText, setMoodText] = useState("ㄴr는 ㄱr끔 눈물을 흘린ㄷr...💧");
  const [todayCount, setTodayCount] = useState(482);
  const [totalCount, setTotalCount] = useState(13850);

  // 오리알 개수 (기본 42개)
  const [eggCount, setEggCount] = useState<number>(42);

  // 2. 미니룸 커스텀 상태
  const [selectedTheme, setSelectedTheme] = useState<MiniroomTheme>(MINIROOM_THEMES[0]);
  const [selectedMinimi, setSelectedMinimi] = useState<MinimiChar>(MINIMI_CHARS[0]);
  const [selectedBgm, setSelectedBgm] = useState<BpmTrack>(CY_BGMS[0]);
  const [placedProps, setPlacedProps] = useState<string[]>(["crt_pc", "turntable", "retro_bed", "teddy_bear"]);

  // 3. 탭 메뉴 (home | guestbook | room | jukebox)
  const [activeTab, setActiveTab] = useState<"home" | "guestbook" | "room" | "jukebox">("home");

  // 4. 방명록 상태 (★ 키포인트 기능)
  const [guestbookEntries, setGuestbookEntries] = useState<GuestbookEntry[]>(DEFAULT_GUESTBOOK_ENTRIES);
  const [gbAuthor, setGbAuthor] = useState("");
  const [gbRelation, setGbRelation] = useState("영혼의 단짝");
  const [gbContent, setGbContent] = useState("");
  const [gbAvatar, setGbAvatar] = useState<"boy" | "girl" | "rocker" | "cat" | "hiphop">("boy");
  const [gbSticker, setGbSticker] = useState<"scrap" | "pado" | "bgm" | "love" | "hi">("scrap");
  const [gbSendEgg, setGbSendEgg] = useState(true);
  const [gbIsSecret, setGbIsSecret] = useState(false);
  const [unlockedSecretIds, setUnlockedSecretIds] = useState<string[]>([]);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyInputText, setReplyInputText] = useState("");

  // 일촌평 리스트 & 입력
  const [ilchonComments, setIlchonComments] = useState<IlchonComment[]>(DEFAULT_ILCHON_COMMENTS);
  const [inputAuthor, setInputAuthor] = useState("");
  const [inputContent, setInputContent] = useState("");

  // 5. 다이어리 감성 문구
  const [diaryText, setDiaryText] = useState(RETRO_CY_QUOTES[0]);

  // 6. 나만의 BGM 직접 입력 상태
  const [customBgmTitle, setCustomBgmTitle] = useState("");
  const [customBgmArtist, setCustomBgmArtist] = useState("");

  // 7. 수익화 모달 상태
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [unlockedGoldSkin, setUnlockedGoldSkin] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [unlockedVipFont, setUnlockedVipFont] = useState(false);

  // 토스 네이티브 내비게이션 바 뒤로가기 버튼과 브라우저 히스토리 스택 동기화
  useEffect(() => {
    try {
      window.history.replaceState({ tab: "home" }, "");
    } catch {}

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.tab === "string") {
        setActiveTab(e.state.tab as any);
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const switchTab = (tab: "home" | "guestbook" | "room" | "jukebox") => {
    if (tab !== activeTab) {
      try {
        window.history.pushState({ tab }, "");
      } catch {}
      setActiveTab(tab);
    }
  };

  // 파도타기 (TODAY 올리기)
  const handlePadoRide = () => {
    setTodayCount((prev) => prev + 1);
    setTotalCount((prev) => prev + 1);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    alert("🌊 파도타기 성공! 방문자 수가 +1 증가했습니다.");
  };

  // 소품 토글
  const handleToggleProp = (propId: string) => {
    setPlacedProps((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  // 방명록 등록 (★ 키포인트 기능)
  const handleAddGuestbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbContent.trim()) {
      alert("방명록 내용을 입력해주세요!");
      return;
    }

    const nextNo = (guestbookEntries[0]?.no || 0) + 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newEntry: GuestbookEntry = {
      id: `gb_${Date.now()}`,
      no: nextNo,
      author: gbAuthor.trim() || "익명 일촌",
      ilchonRelation: gbRelation,
      avatarType: gbAvatar,
      content: gbContent.trim(),
      createdAt: formattedDate,
      isSecret: gbIsSecret,
      duckEggGift: gbSendEgg ? 1 : 0,
      sticker: gbSticker,
    };

    setGuestbookEntries((prev) => [newEntry, ...prev]);
    if (gbSendEgg) {
      setEggCount((prev) => prev + 1);
    }
    setGbContent("");
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    alert("🎉 방명록이 등록되었습니다!");
  };

  // 방명록 주인장 답글 등록
  const handleAddReply = (entryId: string) => {
    if (!replyInputText.trim()) return;
    setGuestbookEntries((prev) =>
      prev.map((item) =>
        item.id === entryId
          ? {
              ...item,
              reply: {
                author: "주인장",
                content: replyInputText.trim(),
                createdAt: "방금 전",
              },
            }
          : item
      )
    );
    setReplyTargetId(null);
    setReplyInputText("");
    confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
  };

  // 비밀글 열람 토글
  const handleToggleUnlockSecret = (id: string) => {
    setUnlockedSecretIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
    alert(`🎵 "${newTrack.title}" 곡이 대표 BGM으로 등록되었습니다!`);
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
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  // 공유하기
  const handleShare = () => {
    const text = [
      `★..${homeTitle}..★`,
      `일촌 맺고 파도타기 하실 분~? 🌊`,
      `- 주인장: ${nickname}`,
      `- 오늘의 기분: ${moodText}`,
      `- 대표 BGM: ♬ ${selectedBgm.title} - ${selectedBgm.artist}`,
      `- TODAY: ${todayCount} | TOTAL: ${totalCount}`,
      `👉 토스에서 미니룸 구경오세요!`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    alert("🎉 미니룸 초대장이 클립보드에 복사되었습니다!");
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#191F28] pb-24 font-sans select-none antialiased">
      {/* 메인 컨텐츠 영역 */}
      <main className="max-w-lg mx-auto p-3.5 space-y-3.5">
        {/* 상단 인라인 레트로 타이틀 바 (토스 네이티브 내비게이션 바와 중복 방지: 상단 고정 헤더를 제거하고 인라인 배치) */}
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
                <span className="px-1.5 py-0.5 bg-[#FF7710] text-white rounded-md text-[10px] font-black">
                  MINIROOM
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                추억의 감성 도트 미니홈피 & 레트로 BGM
              </p>
            </div>
          </div>

          {/* 파도타기 버튼 */}
          <button
            onClick={handlePadoRide}
            className="px-3 py-1.5 bg-[#FF7710] hover:bg-[#ea580c] text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1"
          >
            <span>🌊 파도타기</span>
          </button>
        </div>

        {/* 미니룸 상시 렌더링 뷰어 */}
        <MiniroomViewer
          theme={selectedTheme}
          minimi={selectedMinimi}
          bgm={selectedBgm}
          moodText={moodText}
          placedProps={placedProps}
          todayCount={todayCount}
          totalCount={totalCount}
          homeTitle={homeTitle}
          eggCount={eggCount}
        />

        {/* 4대 레트로 탭 메뉴 (미니룸 / 방명록 / 룸꾸미기 / BGM) */}
        <div className="grid grid-cols-4 gap-1 bg-[#e2e8f0] p-1 rounded-2xl border border-[#cbd5e1]">
          {[
            { id: "home", label: "미니룸", icon: Home },
            { id: "guestbook", label: "방명록", icon: MessageSquare, badge: guestbookEntries.length },
            { id: "room", label: "룸꾸미기", icon: Palette },
            { id: "jukebox", label: "BGM", icon: Music },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id as any)}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer relative ${
                  isActive
                    ? "bg-[#FF7710] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 px-1 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black leading-none shadow-2xs">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- 탭 1: 홈 / 미니룸 기본 --- */}
        {activeTab === "home" && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 오늘의 상태 메시지 변경 카드 */}
            <TossCard
              title="💬 오늘의 기분 & 말풍선 바꾸기"
              subtitle="미니룸 속 미니미 머리 위에 띄울 한마디를 골라보세요"
            >
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {MOOD_PRESETS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMoodText(m.status);
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                    }}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                      moodText === m.status
                        ? "bg-orange-50 border-orange-400 text-orange-950 shadow-2xs"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-xs font-extrabold mt-1">{m.label}</span>
                  </button>
                ))}
              </div>
            </TossCard>

            {/* 방명록 최근 소식 하이라이트 카드 (★ 키포인트 기능 바로가기) */}
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

            {/* 한 줄 일촌평 섹션 */}
            <TossCard
              title={`💌 한 줄 일촌평 (${ilchonComments.length})`}
              subtitle="방명록 대신 한 줄로 마음을 전하던 그 시절 일촌평"
            >
              {/* 일촌평 입력 폼 */}
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

              {/* 일촌평 리스트 */}
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

            {/* 흑백 감성 다이어리 템플릿 카드 */}
            <TossCard
              title="📖 흑백 감성 다이어리"
              subtitle="추억의 Y2K 감성 명문장 템플릿"
            >
              <div className="p-4 bg-[#1e293b] text-white rounded-2xl shadow-inner font-serif space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-2">
                  <span>2005.10.12 WED</span>
                  <span>비공개 스크랩 금지</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100 italic py-2 whitespace-pre-line">
                  "{diaryText}"
                </p>
                <div className="text-right text-[11px] text-slate-400">
                  - {nickname}의 일기장에서 -
                </div>
              </div>

              <div className="pt-3 space-y-1.5">
                <h5 className="text-xs font-bold text-gray-700">명문장 랜덤 불러오기</h5>
                <div className="grid grid-cols-2 gap-1.5">
                  {RETRO_CY_QUOTES.slice(0, 4).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDiaryText(q)}
                      className="p-2 bg-gray-50 hover:bg-orange-50 text-[11px] text-gray-700 rounded-xl border border-gray-200 text-left line-clamp-1 transition cursor-pointer"
                    >
                      {q.slice(0, 18)}...
                    </button>
                  ))}
                </div>
              </div>
            </TossCard>
          </div>
        )}

        {/* --- 탭 2: 방명록 (★ 키포인트 전용 탭!) --- */}
        {activeTab === "guestbook" && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 상단 방명록 현황 헤더 바 */}
            <div className="p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm font-black">📜 추억의 감성 방명록</span>
                  <span className="px-1.5 py-0.2 bg-white/25 rounded-md text-[10px] font-bold">
                    총 {guestbookEntries.length}개
                  </span>
                </div>
                <p className="text-[11px] text-orange-100 font-medium">
                  친구들의 방명록과 오리알 선물 도착 목록이에요
                </p>
              </div>
              <div className="px-2.5 py-1 bg-white/20 backdrop-blur-xs rounded-xl text-xs font-black flex items-center gap-1">
                <span>🥚 내 오리알</span>
                <span className="text-yellow-200">{eggCount}개</span>
              </div>
            </div>

            {/* 방명록 작성 폼 카드 */}
            <TossCard
              title="✏️ 방명록 남기기"
              subtitle="미니홈피 주인장에게 따뜻한 한마디와 오리알을 선물하세요"
            >
              <form onSubmit={handleAddGuestbook} className="space-y-3 pt-1">
                {/* 닉네임 & 일촌 호칭 */}
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
                        onClick={() => setGbAvatar(av.id as any)}
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

                {/* 빠른 추천 문구 버튼 (원클릭 자동 채우기) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-gray-700">추억의 추천 문구 탭하기</span>
                    <span className="text-[10px] text-gray-400">클릭 시 자동 입력</span>
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
                    <span>🥚 오리알 1개 선물하기</span>
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

                {/* 등록 버튼 */}
                <TossButton variant="primary" size="md" className="w-full">
                  <Send className="w-4 h-4 mr-1.5 inline" />
                  <span>방명록 등록하기</span>
                </TossButton>
              </form>
            </TossCard>

            {/* 방명록 피드 리스트 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black text-gray-800">
                  방명록 목록 ({guestbookEntries.length})
                </h3>
                <span className="text-[11px] text-gray-400">최신순 정렬</span>
              </div>

              {guestbookEntries.map((entry) => {
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
                    {/* 카드 상단 레트로 헤더 바 */}
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

                    {/* 카드 본문 */}
                    <div className="p-3.5 space-y-2.5">
                      {/* 스티커 및 오리알 선물 뱃지 바 */}
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

                      {/* 메시지 내용 */}
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

                      {/* 주인장 답글 영역 */}
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

        {/* --- 탭 2: 미니룸 꾸미기 --- */}
        {activeTab === "room" && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 벽지/바닥 테마 선택 */}
            <TossCard
              title="🎨 미니룸 테마 벽지"
              subtitle="원하는 인테리어 무드를 선택해 보세요"
            >
              <div className="grid grid-cols-2 gap-2 pt-1">
                {MINIROOM_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      selectedTheme.id === t.id
                        ? "border-[#FF7710] bg-orange-50 shadow-xs"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-extrabold text-gray-900 block">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {t.tag}
                      </span>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300 shadow-2xs"
                      style={{ backgroundColor: t.wallColor }}
                    />
                  </button>
                ))}
              </div>
            </TossCard>

            {/* 미니미 아바타 선택 */}
            <TossCard
              title="👤 미니미 아바타 고르기"
              subtitle="나를 표현하는 도트 캐릭터를 설정하세요"
            >
              <div className="space-y-2 pt-1">
                {MINIMI_CHARS.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => setSelectedMinimi(char)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                      selectedMinimi.id === char.id
                        ? "border-[#FF7710] bg-orange-50/60 shadow-xs"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900">{char.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{char.desc}</p>
                    </div>
                    {selectedMinimi.id === char.id && (
                      <TossBadge variant="orange" size="sm">
                        선택됨
                      </TossBadge>
                    )}
                  </div>
                ))}
              </div>
            </TossCard>

            {/* 도트 가구 & 소품 배치 토글 */}
            <TossCard
              title="🛋️ 미니룸 가구 & 소품 배치"
              subtitle="클릭하여 방에 소품을 배치하거나 뺄 수 있습니다"
            >
              <div className="grid grid-cols-2 gap-2 pt-1">
                {MINIROOM_PROPS.map((prop) => {
                  const isPlaced = placedProps.includes(prop.id);
                  return (
                    <button
                      key={prop.id}
                      onClick={() => handleToggleProp(prop.id)}
                      className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isPlaced
                          ? "border-emerald-500 bg-emerald-50/50 shadow-2xs"
                          : "border-gray-200 bg-white hover:bg-gray-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{prop.icon}</span>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block truncate">
                            {prop.name}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {isPlaced ? "배치중" : "보관함"}
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

        {/* --- 탭 3: BGM 주크박스 --- */}
        {activeTab === "jukebox" && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 1. 나만의 BGM 직접 입력하기 (사용자 생성 BGM) */}
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

            {/* 2. 감성 레트로 Lo-Fi & 8-bit 오리지널 BGM (8선) */}
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

        {/* --- 탭 4: 감성 다이어리 --- */}
        {activeTab === "diary" && (
          <div className="space-y-3.5 animate-fade-in">
            <TossCard
              title="📖 흑백 감성 다이어리"
              subtitle="추억의 Y2K 감성 명문장 템플릿"
            >
              <div className="p-4 bg-[#1e293b] text-white rounded-2xl shadow-inner font-serif space-y-2 border border-slate-700">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700 pb-2">
                  <span>2005.10.12 WED</span>
                  <span>비공개 스크랩 금지</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-100 italic py-2 whitespace-pre-line">
                  "{diaryText}"
                </p>
                <div className="text-right text-[11px] text-slate-400">
                  - {nickname}의 일기장에서 -
                </div>
              </div>

              {/* 명어록 추천 버튼들 */}
              <div className="pt-3 space-y-1.5">
                <h5 className="text-xs font-bold text-gray-700">명문장 랜덤 불러오기</h5>
                <div className="grid grid-cols-2 gap-1.5">
                  {RETRO_CY_QUOTES.slice(0, 4).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setDiaryText(q)}
                      className="p-2 bg-gray-50 hover:bg-orange-50 text-[11px] text-gray-700 rounded-xl border border-gray-200 text-left line-clamp-1 transition cursor-pointer"
                    >
                      {q.slice(0, 18)}...
                    </button>
                  ))}
                </div>
              </div>
            </TossCard>
          </div>
        )}

        {/* 보상형 광고: 오리알 10개 무료 충전 (골드 스킨) */}
        <TossCard
          title="🥚 오리알 10개 무료 충전소"
          subtitle="광고를 시청하면 한정판 황금 미니미와 오리알 10개가 즉시 충전됩니다"
          badge={
            <TossBadge variant="purple">
              {unlockedGoldSkin ? "충전 완료" : "무료 충전"}
            </TossBadge>
          }
        >
          {unlockedGoldSkin ? (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 animate-fade-in">
              🎉 오리알 10개가 충전되어 <b>황금 미니미 & 프리미엄 BGM</b>이 활성화되었습니다!
            </div>
          ) : (
            <div className="pt-2 text-center space-y-2">
              <div className="bg-purple-50/80 border border-purple-200/90 rounded-xl p-2.5 text-[11px] text-purple-950 flex items-center gap-2 text-left">
                <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[9px] font-black shrink-0">
                  사전 고지
                </span>
                <span className="leading-tight">
                  5초 분량의 광고를 시청하면 오리알 10개가 즉시 무료로 지급됩니다.
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
          )}
        </TossCard>

        {/* 토스페이 소액 결제 (990원): Y2K 감성 폰트 & 가구 세트 */}
        <TossCard
          title="✨ Y2K 레트로 폰트 & 프리미엄 도트 가구 풀세트"
          subtitle="그 시절 픽셀 폰트와 레트로 가구 8종 영구 소장"
          badge={
            <TossBadge variant="orange">
              {unlockedVipFont ? "소장 완료" : "990원"}
            </TossBadge>
          }
        >
          {unlockedVipFont ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 animate-fade-in">
              🎉 <b>Y2K 감성 폰트팩 & 도트 가구 풀패키지</b>가 영구 소장되었습니다!
            </div>
          ) : (
            <div className="pt-2 text-center">
              <TossButton
                variant="secondary"
                size="md"
                onClick={() => setIsPaymentOpen(true)}
              >
                <Award className="w-4 h-4 mr-1 text-amber-500 inline" />
                <span>영구 소장하기 (990원)</span>
              </TossButton>
            </div>
          )}
        </TossCard>

        {/* 공유하기 버튼 */}
        <div className="pt-2">
          <TossButton variant="primary" size="lg" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1.5 inline" />
            <span>내 미니룸 초대장 복사 & 친구에게 공유</span>
          </TossButton>
        </div>
      </main>

      {/* 보상형 광고 모달 */}
      <RewardedAdModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onRewarded={() => {
          setUnlockedGoldSkin(true);
          setEggCount((prev) => prev + 10);
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
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
          alert("🎉 Y2K 레트로 폰트 & 가구 풀세트가 영구 소장되었습니다!");
        }}
        productName="Y2K 레트로 폰트 & 프리미엄 도트 가구 풀세트"
        price={990}
      />
    </div>
  );
};
