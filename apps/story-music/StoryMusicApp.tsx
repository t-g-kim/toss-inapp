import React, { useState, useRef } from "react";
import {
  TossHeader,
  TossCard,
  TossButton,
  TossBadge,
  AdBanner,
  RewardedAdModal,
  TossPayModal,
} from "@shared/index";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Download,
  Sparkles,
  Palette,
  Upload,
  Crown,
  Share2,
  Disc3,
  Heart,
} from "lucide-react";
import confetti from "canvas-confetti";

interface StoryMusicAppProps {
  onBack?: () => void;
}

const PRESET_SONGS = [
  {
    title: "Ditto",
    artist: "NewJeans",
    lyric: "Stay in the middle, Like you a little 🎧",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80",
    currentTime: "1:32",
    totalTime: "3:05",
    progress: 50,
  },
  {
    title: "Vancouver",
    artist: "BIG Naughty",
    lyric: "우리의 밤은 아직 끝나지 않았어 🌃",
    cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
    currentTime: "2:10",
    totalTime: "3:30",
    progress: 62,
  },
  {
    title: "밤양갱",
    artist: "비비 (BIBI)",
    lyric: "내가 늘 바란 건 달디단 밤양갱 하나였는데 🌰",
    cover: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80",
    currentTime: "0:48",
    totalTime: "2:26",
    progress: 33,
  },
];

type CardTheme = "glass" | "vinyl" | "dark" | "paper";

export const StoryMusicApp: React.FC<StoryMusicAppProps> = ({ onBack }) => {
  const [title, setTitle] = useState("Ditto");
  const [artist, setArtist] = useState("NewJeans");
  const [lyric, setLyric] = useState("Stay in the middle, Like you a little 🎧");
  const [coverUrl, setCoverUrl] = useState("https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80");
  const [currentTime, setCurrentTime] = useState("1:32");
  const [totalTime, setTotalTime] = useState("3:05");
  const [progress, setProgress] = useState(50);
  const [theme, setTheme] = useState<CardTheme>("glass");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(true);

  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [vipThemes, setVipThemes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (song: typeof PRESET_SONGS[0]) => {
    setTitle(song.title);
    setArtist(song.artist);
    setLyric(song.lyric);
    setCoverUrl(song.cover);
    setCurrentTime(song.currentTime);
    setTotalTime(song.totalTime);
    setProgress(song.progress);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    setAdModalOpen(true);
  };

  const handleAdReward = () => {
    setAdModalOpen(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert("✨ 인스타그램 스토리 규격(9:16) 고화질 음악 카드가 갤러리에 저장되었습니다!");
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <TossHeader
        title="감성 음악 카드"
        subtitle="인스타 스토리에 올리는 나만의 재생바 카드"
        onBack={onBack}
        rightAction={<TossBadge variant="purple">스토리 인기</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Instagram Story 9:16 Live Preview Container */}
        <div className="relative w-full aspect-[9/14] rounded-3xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between select-none transition-all duration-300 border border-gray-200"
          style={{
            background:
              theme === "glass"
                ? "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
                : theme === "vinyl"
                ? "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)"
                : theme === "dark"
                ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)"
                : "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          {/* Top subtle story badge */}
          <div className="flex items-center justify-between text-white/80 text-xs font-semibold drop-shadow">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Now Playing
            </span>
            <span className="bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px]">
              Instagram Story 9:16
            </span>
          </div>

          {/* Central Card Element */}
          <div
            className={`w-full rounded-2xl p-5 shadow-2xl backdrop-blur-xl border transition-all ${
              theme === "dark"
                ? "bg-black/60 border-white/10 text-white"
                : theme === "vinyl"
                ? "bg-slate-900/75 border-white/15 text-white"
                : theme === "paper"
                ? "bg-white/90 border-gray-200 text-gray-900 shadow-md"
                : "bg-white/40 border-white/40 text-gray-900 shadow-lg"
            }`}
          >
            {/* Album Cover */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md group">
              <img
                src={coverUrl}
                alt="Album Cover"
                className={`w-full h-full object-cover transition-transform duration-700 ${
                  theme === "vinyl" && isPlaying ? "animate-spin-slow rounded-full p-2" : ""
                }`}
                style={theme === "vinyl" ? { animationDuration: "12s" } : {}}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition gap-1.5"
              >
                <Upload className="w-4 h-4" /> 커버 사진 교체
              </button>
            </div>

            {/* Song Meta */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1 pr-2">
                <h4 className="font-extrabold text-base tracking-tight truncate drop-shadow-sm">
                  {title || "노래 제목"}
                </h4>
                <p className={`text-xs truncate mt-0.5 ${theme === "dark" || theme === "vinyl" ? "text-gray-300" : "text-gray-600"}`}>
                  {artist || "가수 이름"}
                </p>
              </div>
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-1.5 rounded-full transition ${
                  isLiked ? "text-rose-500 scale-110" : "text-gray-400"
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Emotional Lyric line */}
            {lyric && (
              <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                theme === "dark" || theme === "vinyl"
                  ? "bg-white/10 text-rose-200"
                  : "bg-black/5 text-purple-900"
              }`}>
                <p className="italic">“{lyric}”</p>
              </div>
            )}

            {/* Progress Slider */}
            <div className="mt-4">
              <div className="w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] mt-1.5 opacity-70">
                <span>{currentTime}</span>
                <span>{totalTime}</span>
              </div>
            </div>

            {/* Audio Controls Mockup */}
            <div className="flex items-center justify-between mt-3 pt-1">
              <Shuffle className="w-4 h-4 opacity-60" />
              <SkipBack className="w-5 h-5 opacity-80" />
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <SkipForward className="w-5 h-5 opacity-80" />
              <Repeat className="w-4 h-4 opacity-60" />
            </div>
          </div>

          {/* Bottom Story Watermark/Mood */}
          <div className="text-center text-white/70 text-[11px] font-medium drop-shadow">
            Tap to open in Stories ✨
          </div>
        </div>

        {/* Theme Picker */}
        <TossCard title="🎨 감성 카드 테마 선택" subtitle="스토리 무드에 어울리는 스타일 변경">
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { id: "glass", label: "글래스 핑크", bg: "bg-pink-100 text-pink-700" },
              { id: "vinyl", label: "LP 바이닐", bg: "bg-indigo-900 text-indigo-100" },
              { id: "dark", label: "딥 다크", bg: "bg-slate-900 text-slate-100" },
              { id: "paper", label: "모던 페이퍼", bg: "bg-gray-100 text-gray-800" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as CardTheme)}
                className={`p-2.5 rounded-xl border text-center transition ${
                  theme === t.id
                    ? "border-purple-600 ring-2 ring-purple-500/20 shadow-sm"
                    : "border-toss-border"
                } ${t.bg}`}
              >
                <span className="text-xs font-bold block">{t.label}</span>
              </button>
            ))}
          </div>
        </TossCard>

        {/* Content Customization Inputs */}
        <TossCard title="✍️ 노래 정보 & 감성 가사 편집" subtitle="원하는 노래와 문구로 즉시 커스텀">
          <div className="space-y-3 pt-1 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-toss-muted block mb-1">노래 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: Ditto"
                  className="w-full p-2.5 rounded-xl border border-toss-border bg-white text-xs font-semibold focus:outline-none focus:border-toss-blue"
                />
              </div>
              <div>
                <label className="text-toss-muted block mb-1">가수 이름</label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="예: NewJeans"
                  className="w-full p-2.5 rounded-xl border border-toss-border bg-white text-xs font-semibold focus:outline-none focus:border-toss-blue"
                />
              </div>
            </div>

            <div>
              <label className="text-toss-muted block mb-1">감성 가사 (한 줄 문구)</label>
              <input
                type="text"
                value={lyric}
                onChange={(e) => setLyric(e.target.value)}
                placeholder="스토리에 남길 감성 가사나 문구를 입력하세요"
                className="w-full p-2.5 rounded-xl border border-toss-border bg-white text-xs font-semibold focus:outline-none focus:border-toss-blue"
              />
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-toss-border">
              <span className="text-toss-muted block mb-1.5 font-medium">인기 곡 프리셋 불러오기</span>
              <div className="flex gap-2">
                {PRESET_SONGS.map((song) => (
                  <button
                    key={song.title}
                    onClick={() => handleApplyPreset(song)}
                    className="flex-1 p-2 rounded-xl bg-toss-bg hover:bg-gray-200 text-left text-xs transition"
                  >
                    <span className="font-bold text-toss-text block text-[11px] truncate">{song.title}</span>
                    <span className="text-[10px] text-toss-muted block truncate">{song.artist}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TossCard>

        {/* Export & Actions */}
        <div className="space-y-2 pt-2">
          <TossButton variant="primary" size="lg" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5 inline" /> 인스타 스토리 규격(9:16) 고화질 저장
          </TossButton>

          <TossButton
            variant="secondary"
            size="md"
            onClick={() => setPayModalOpen(true)}
          >
            <Crown className="w-4 h-4 mr-1 inline text-amber-500" />
            {vipThemes
              ? "VIP 홀로그램 LP & 감성 폰트 10종 보유 중"
              : "VIP 한정판 홀로그램 LP 테마 & 감성 폰트 10종 (990원)"}
          </TossButton>
        </div>

        <AdBanner />
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onReward={handleAdReward}
        rewardTitle="스토리 고화질 워터마크 제거 저장"
        adDurationSeconds={5}
      />

      {/* TossPay Modal */}
      <TossPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setPayModalOpen(false);
          setVipThemes(true);
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
          alert("🎉 VIP 홀로그램 LP 테마 & 감성 폰트 10종이 영구 해금되었습니다!");
        }}
        productName="VIP 홀로그램 LP 테마 & 감성 폰트 10종 팩"
        price={990}
      />
    </div>
  );
};
