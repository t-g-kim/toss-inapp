/**
 * 싸이감성 미니홈피 - 메인 인앱 컴포넌트
 * - 토스 디자인 시스템(TDS) & 2000년대 싸이월드 Y2K 레트로 감성 결합
 * - 4개 탭: [홈/일촌평] / [미니룸 꾸미기] / [BGM 주크박스] / [감성 다이어리]
 * - 도토리 충전 보상형 광고 & 990원 프리미엄 스킨 소장 결제 연동
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
  BpmTrack,
  MiniroomTheme,
  MinimiChar,
  IlchonComment,
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
  Share2,
  ChevronLeft,
  Flame,
  Award,
  RefreshCw,
  Plus,
  Send,
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

  // 2. 미니룸 커스텀 상태
  const [selectedTheme, setSelectedTheme] = useState<MiniroomTheme>(MINIROOM_THEMES[0]);
  const [selectedMinimi, setSelectedMinimi] = useState<MinimiChar>(MINIMI_CHARS[0]);
  const [selectedBgm, setSelectedBgm] = useState<BpmTrack>(CY_BGMS[0]);
  const [placedProps, setPlacedProps] = useState<string[]>(["crt_pc", "turntable", "retro_bed", "teddy_bear"]);

  // 3. 탭 메뉴 (home | room | jukebox | diary)
  const [activeTab, setActiveTab] = useState<"home" | "room" | "jukebox" | "diary">("home");

  // 4. 일촌평 리스트 & 입력
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
        setActiveTab(e.state.tab);
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const switchTab = (tab: "home" | "room" | "jukebox" | "diary") => {
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
        />

        {/* 4대 레트로 탭 메뉴 (홈 / 미니룸 / BGM / 다이어리) */}
        <div className="grid grid-cols-4 gap-1 bg-[#e2e8f0] p-1 rounded-2xl border border-[#cbd5e1]">
          {[
            { id: "home", label: "홈/일촌", icon: Home },
            { id: "room", label: "룸꾸미기", icon: Palette },
            { id: "jukebox", label: "BGM", icon: Music },
            { id: "diary", label: "다이어리", icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id as any)}
                className={`py-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-0.5 cursor-pointer ${
                  isActive
                    ? "bg-[#FF7710] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- 탭 1: 홈 / 일촌평 관리 --- */}
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

            {/* 일촌평 섹션 */}
            <TossCard
              title={`💌 일촌평 (${ilchonComments.length})`}
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

        {/* 보상형 광고: 도토리 10개 무료 충전 (골드 스킨) */}
        <TossCard
          title="🌰 도토리 10개 무료 충전소"
          subtitle="광고를 시청하면 한정판 황금 미니미와 스킨이 잠금 해제됩니다"
          badge={
            <TossBadge variant="purple">
              {unlockedGoldSkin ? "충전 완료" : "무료 충전"}
            </TossBadge>
          }
        >
          {unlockedGoldSkin ? (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 animate-fade-in">
              🎉 도토리 10개가 충전되어 <b>황금 미니미 & 프리미엄 BGM</b>이 활성화되었습니다!
            </div>
          ) : (
            <div className="pt-2 text-center space-y-2">
              <div className="bg-purple-50/80 border border-purple-200/90 rounded-xl p-2.5 text-[11px] text-purple-950 flex items-center gap-2 text-left">
                <span className="px-1.5 py-0.5 bg-purple-600 text-white rounded text-[9px] font-black shrink-0">
                  사전 고지
                </span>
                <span className="leading-tight">
                  5초 분량의 광고를 시청하면 도토리 10개가 즉시 무료로 지급됩니다.
                </span>
              </div>
              <TossButton
                variant="secondary"
                size="md"
                onClick={() => setIsAdOpen(true)}
              >
                <Sparkles className="w-4 h-4 mr-1 text-purple-600 inline" />
                <span>[광고] 5초 시청 후 무료 충전</span>
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
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }}
        rewardTitle="도토리 10개 무료 충전"
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
