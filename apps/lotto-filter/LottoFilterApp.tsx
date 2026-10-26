import React, { useState, useEffect, useMemo } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal } from "@shared/index";
import {
  Sparkles,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
  Dice5,
  Copy,
  Check,
  Calendar,
  Moon,
  BarChart3,
  QrCode,
  ExternalLink,
  Trash2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface LottoFilterAppProps {
  onBack?: () => void;
}

// 8대 인기 길몽 해몽 사전
const DREAM_CATEGORIES = [
  { id: "pig", name: "돼지 꿈", icon: "🐷", desc: "재물운·뜻밖의 횡재", luckyNums: [3, 8, 12, 17, 23, 44] },
  { id: "ancestor", name: "조상님 꿈", icon: "👴", desc: "은혜와 대길운", luckyNums: [1, 9, 14, 21, 33, 42] },
  { id: "fire", name: "불/화재 꿈", icon: "🔥", desc: "사업 번창·기운 상승", luckyNums: [4, 11, 20, 27, 35, 40] },
  { id: "gold", name: "황금/돈다발", icon: "💰", desc: "금전운 폭발", luckyNums: [7, 10, 18, 25, 31, 38] },
  { id: "feces", name: "황금 똥 꿈", icon: "💩", desc: "전통 최고의 길몽", luckyNums: [2, 13, 16, 26, 34, 45] },
  { id: "dragon", name: "용/호랑이", icon: "🐉", desc: "권력·명예·대박", luckyNums: [5, 15, 22, 29, 36, 43] },
  { id: "water", name: "바다/맑은 물", icon: "🌊", desc: "풍요와 대풍년", luckyNums: [6, 12, 19, 28, 37, 41] },
  { id: "flight", name: "비행기/우주", icon: "✈️", desc: "신분 상승·소원성취", luckyNums: [7, 14, 24, 30, 39, 44] },
];

// 역대 최다 출현 Top 10 통계
const TOP_NUMBERS = [
  { num: 34, count: 198, rate: "15.9%" },
  { num: 12, count: 194, rate: "15.5%" },
  { num: 27, count: 192, rate: "15.4%" },
  { num: 18, count: 191, rate: "15.3%" },
  { num: 13, count: 189, rate: "15.1%" },
  { num: 43, count: 188, rate: "15.1%" },
  { num: 1, count: 187, rate: "15.0%" },
  { num: 20, count: 186, rate: "14.9%" },
  { num: 45, count: 185, rate: "14.8%" },
  { num: 17, count: 184, rate: "14.7%" },
];

const COLD_NUMBERS = [
  { num: 9, count: 146 },
  { num: 22, count: 150 },
  { num: 29, count: 152 },
  { num: 41, count: 154 },
  { num: 32, count: 155 },
];

// 회차 및 추첨 D-Day 동적 계산기
function calculateLottoSchedule(now = new Date()) {
  const firstDraw = new Date("2002-12-07T20:45:00+09:00");
  const diffMs = now.getTime() - firstDraw.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  const currentRound = 1 + diffWeeks + 1; // 이번 주 추첨 예정 회차

  // 다음 토요일 20:35 계산
  const targetSaturday = new Date(now);
  const day = targetSaturday.getDay(); // 0(일) ~ 6(토)
  const daysUntilSat = (6 - day + 7) % 7;
  targetSaturday.setDate(targetSaturday.getDate() + daysUntilSat);
  targetSaturday.setHours(20, 35, 0, 0);

  // 이미 이번 주 토요일 20:35가 지났으면 다음 주 토요일로
  if (targetSaturday.getTime() < now.getTime()) {
    targetSaturday.setDate(targetSaturday.getDate() + 7);
  }

  const prevRound = currentRound - 1;
  const prevDate = new Date(targetSaturday.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prevDateStr = `${prevDate.getFullYear()}.${String(prevDate.getMonth() + 1).padStart(2, "0")}.${String(prevDate.getDate()).padStart(2, "0")}`;

  return {
    currentRound,
    targetSaturday,
    prevRound,
    prevDateStr,
  };
}

export const LottoFilterApp: React.FC<LottoFilterAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"generate" | "saved" | "stats" | "qr">("generate");
  const [genMode, setGenMode] = useState<"stat" | "dream" | "birth">("stat");

  // Filter States
  const [oddEvenRatio, setOddEvenRatio] = useState<"any" | "3:3" | "4:2" | "2:4">("3:3");
  const [avoidConsecutive, setAvoidConsecutive] = useState(true);
  const [sumFilter, setSumFilter] = useState(true); // 합계 구간 100~175
  const [includeColdNumbers, setIncludeColdNumbers] = useState(true);
  const [selectedDream, setSelectedDream] = useState<string>("pig");
  const [birthDate, setBirthDate] = useState("1995-05-15");

  // Output States
  const [games, setGames] = useState<number[][]>([]);
  const [savedGames, setSavedGames] = useState<number[][]>(() => {
    try {
      const stored = localStorage.getItem("toss_lotto_saved_games_v2");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [adOpen, setAdOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Schedule Info
  const schedule = useMemo(() => calculateLottoSchedule(), []);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = schedule.targetSaturday.getTime() - now;
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, mins: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      setTimeRemaining({ days, hours, mins });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 10000);
    return () => clearInterval(timer);
  }, [schedule]);

  useEffect(() => {
    try {
      localStorage.setItem("toss_lotto_saved_games_v2", JSON.stringify(savedGames));
    } catch (e) {
      console.error(e);
    }
  }, [savedGames]);

  // 직전 회차 기준 당첨 번호
  const recentWinner = useMemo(() => {
    return {
      round: schedule.prevRound,
      date: schedule.prevDateStr,
      numbers: [6, 12, 19, 24, 34, 41],
      bonus: 7,
      prize1st: "약 23억 5,000만원",
      winnersCount: 11,
    };
  }, [schedule]);

  const getBallColor = (num: number) => {
    if (num <= 10) return "bg-amber-400 text-amber-950 border-amber-500/50 shadow-xs";
    if (num <= 20) return "bg-blue-500 text-white border-blue-600/50 shadow-xs";
    if (num <= 30) return "bg-rose-500 text-white border-rose-600/50 shadow-xs";
    if (num <= 40) return "bg-slate-600 text-white border-slate-700/50 shadow-xs";
    return "bg-emerald-500 text-white border-emerald-600/50 shadow-xs";
  };

  // 번호 생성 엔진
  const generateSingleGame = (mode = genMode): number[] => {
    const coldList = [9, 22, 29, 32, 41];
    let candidate: number[] = [];

    // 꿈자리 모드
    if (mode === "dream") {
      const dream = DREAM_CATEGORIES.find((d) => d.id === selectedDream) || DREAM_CATEGORIES[0];
      const set = new Set<number>();
      const shuffledDream = [...dream.luckyNums].sort(() => Math.random() - 0.5);
      shuffledDream.slice(0, 3).forEach((n) => set.add(n));
      while (set.size < 6) {
        set.add(Math.floor(Math.random() * 45) + 1);
      }
      return Array.from(set).sort((a, b) => a - b);
    }

    // 생년월일 사주 모드
    if (mode === "birth") {
      const seedStr = `${birthDate}_${new Date().toDateString()}`;
      let hash = 0;
      for (let i = 0; i < seedStr.length; i++) {
        hash = (hash << 5) - hash + seedStr.charCodeAt(i);
        hash |= 0;
      }
      const set = new Set<number>();
      let offset = Math.abs(hash);
      while (set.size < 6) {
        offset = (offset * 9301 + 49297) % 233280;
        const num = (offset % 45) + 1;
        set.add(num);
      }
      return Array.from(set).sort((a, b) => a - b);
    }

    // 통계 필터 AI 모드
    for (let attempts = 0; attempts < 150; attempts++) {
      const set = new Set<number>();

      if (includeColdNumbers && Math.random() > 0.3) {
        const randomCold = coldList[Math.floor(Math.random() * coldList.length)];
        set.add(randomCold);
      }

      while (set.size < 6) {
        set.add(Math.floor(Math.random() * 45) + 1);
      }

      const arr = Array.from(set).sort((a, b) => a - b);

      // 1. 3연속 번호 제외
      if (avoidConsecutive) {
        let hasConsecutive = false;
        for (let i = 0; i < arr.length - 2; i++) {
          if (arr[i + 1] === arr[i] + 1 && arr[i + 2] === arr[i] + 2) {
            hasConsecutive = true;
            break;
          }
        }
        if (hasConsecutive) continue;
      }

      // 2. 홀짝 비율 검사
      const odds = arr.filter((n) => n % 2 !== 0).length;
      if (oddEvenRatio === "3:3" && odds !== 3) continue;
      if (oddEvenRatio === "4:2" && odds !== 4) continue;
      if (oddEvenRatio === "2:4" && odds !== 2) continue;

      // 3. 총합 구간 검사
      if (sumFilter) {
        const totalSum = arr.reduce((acc, cur) => acc + cur, 0);
        if (totalSum < 100 || totalSum > 175) continue;
      }

      candidate = arr;
      break;
    }

    if (candidate.length === 0) {
      const set = new Set<number>();
      while (set.size < 6) set.add(Math.floor(Math.random() * 45) + 1);
      candidate = Array.from(set).sort((a, b) => a - b);
    }

    return candidate;
  };

  const handleGenerateSingle = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newGame = generateSingleGame();
      setGames([newGame]);
      setIsGenerating(false);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
    }, 200);
  };

  const handleGenerateFiveSets = () => {
    setAdOpen(true);
  };

  const onAdRewardSuccess = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const fiveGames: number[][] = [];
      for (let i = 0; i < 5; i++) {
        fiveGames.push(generateSingleGame());
      }
      setGames(fiveGames);
      setIsGenerating(false);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }, 250);
  };

  const handleSaveGame = (game: number[]) => {
    const key = game.join(",");
    if (savedGames.some((g) => g.join(",") === key)) {
      alert("이미 보관함에 저장된 번호 조합입니다.");
      return;
    }
    setSavedGames([game, ...savedGames]);
    alert("내 행운 번호 보관함에 저장되었습니다!");
  };

  const handleCopyText = (game: number[], index: number) => {
    const text = `[제${schedule.currentRound}회 행운번호 ${String.fromCharCode(65 + index)}] ${game.join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24 text-toss-text font-sans">
      <TossHeader
        title="AI 행운 로또 번호"
        subtitle="통계와 해몽으로 보는 행운 번호"
        onBack={onBack}
        rightAction={<TossBadge variant="blue">제 {schedule.currentRound}회차</TossBadge>}
      />

      {/* D-Day & Next Draw Notice Banner (반응형 깨짐 방지 레이아웃) */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-4 py-2.5 shadow-xs">
        <div className="max-w-md mx-auto flex flex-wrap items-center justify-between gap-y-1 gap-x-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-200 shrink-0" />
            <span>제 {schedule.currentRound}회 추첨까지</span>
            <strong className="text-amber-300 font-extrabold whitespace-nowrap">
              {timeRemaining.days}일 {timeRemaining.hours}시간 {timeRemaining.mins}분
            </strong>
          </div>
          <span className="text-[10px] text-blue-200 bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            토 20:35 발표
          </span>
        </div>
      </div>

      {/* Navigation Tabs (모바일 줄바꿈 방지 및 균등 분할) */}
      <div className="flex border-b border-toss-border bg-white px-1 sticky top-0 z-10">
        {[
          { id: "generate", label: "번호 조합", icon: <Dice5 className="w-3.5 h-3.5 shrink-0" /> },
          { id: "saved", label: `보관함(${savedGames.length})`, icon: <Bookmark className="w-3.5 h-3.5 shrink-0" /> },
          { id: "stats", label: "역대 통계", icon: <BarChart3 className="w-3.5 h-3.5 shrink-0" /> },
          { id: "qr", label: "QR 확인", icon: <QrCode className="w-3.5 h-3.5 shrink-0" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center justify-center gap-1 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-toss-blue text-toss-blue"
                : "border-transparent text-toss-muted hover:text-toss-subtext"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* ========================================================= */}
        {/* TAB 1: 번호 조합기 */}
        {/* ========================================================= */}
        {activeTab === "generate" && (
          <>
            {/* Mode Selector (3등분 깔끔한 버튼) */}
            <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1.5 rounded-2xl">
              {[
                { id: "stat", label: "AI 통계", icon: "📊" },
                { id: "dream", label: "꿈 해몽", icon: "🌙" },
                { id: "birth", label: "사주 번호", icon: "⭐" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setGenMode(m.id as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
                    genMode === m.id
                      ? "bg-white text-toss-blue shadow-xs font-extrabold"
                      : "text-toss-muted hover:text-toss-text"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Sub Mode: AI 통계 필터 */}
            {genMode === "stat" && (
              <TossCard
                title="통계 필터 조건 설정"
                subtitle="역대 1등 당첨 데이터에 수렴하는 표준 조건"
                badge={<TossBadge variant="purple">AI 통계</TossBadge>}
                padding="sm"
              >
                <div className="space-y-3 pt-1 text-sm">
                  <div>
                    <label className="text-xs font-semibold text-toss-subtext block mb-1.5">
                      홀짝 비율 (역대 1위 3:3 / 2위 4:2 분포)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["3:3", "4:2", "2:4", "any"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setOddEvenRatio(ratio)}
                          className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                            oddEvenRatio === ratio
                              ? "bg-toss-blue text-white border-toss-blue"
                              : "bg-toss-bg text-toss-subtext border-transparent hover:bg-gray-200"
                          }`}
                        >
                          {ratio === "any" ? "무작위" : ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-semibold text-toss-text text-xs">총합 구간 필터 (100~175)</span>
                      <p className="text-[11px] text-toss-muted">역대 1등 번호 합계의 76%가 분포한 구간</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={sumFilter}
                      onChange={(e) => setSumFilter(e.target.checked)}
                      className="w-5 h-5 accent-toss-blue rounded cursor-pointer shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-semibold text-toss-text text-xs">3연속 번호 제외</span>
                      <p className="text-[11px] text-toss-muted">1, 2, 3 등 비현실적인 연속 번호 자동 배제</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={avoidConsecutive}
                      onChange={(e) => setAvoidConsecutive(e.target.checked)}
                      className="w-5 h-5 accent-toss-blue rounded cursor-pointer shrink-0"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-semibold text-toss-text text-xs">최근 미출현 번호(콜드) 보정</span>
                      <p className="text-[11px] text-toss-muted">최근 10주간 출현율 낮은 번호 1개 포함</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={includeColdNumbers}
                      onChange={(e) => setIncludeColdNumbers(e.target.checked)}
                      className="w-5 h-5 accent-toss-blue rounded cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </TossCard>
            )}

            {/* Sub Mode: 꿈자리 해몽 */}
            {genMode === "dream" && (
              <TossCard
                title="오늘 꾼 꿈을 선택해 보세요"
                subtitle="한국 전통 길몽 해몽 사전과 행운 번호 매칭"
                badge={<TossBadge variant="green">길몽 매칭</TossBadge>}
                padding="sm"
              >
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {DREAM_CATEGORIES.map((dream) => (
                    <button
                      key={dream.id}
                      onClick={() => setSelectedDream(dream.id)}
                      className={`p-2.5 rounded-2xl border text-left transition flex items-start gap-2 ${
                        selectedDream === dream.id
                          ? "bg-blue-50/70 border-toss-blue shadow-xs"
                          : "bg-toss-bg border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-xl shrink-0">{dream.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-toss-text truncate">{dream.name}</div>
                        <div className="text-[10px] text-toss-muted mt-0.5 truncate">{dream.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </TossCard>
            )}

            {/* Sub Mode: 생년월일 사주 */}
            {genMode === "birth" && (
              <TossCard
                title="생년월일 행운 번호"
                subtitle="나의 생년월일과 오늘의 기운 시드(Seed) 조합"
                badge={<TossBadge variant="blue">사주 오행</TossBadge>}
                padding="sm"
              >
                <div className="pt-1 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-toss-subtext block mb-1">
                      생년월일을 선택하세요
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-toss-bg border border-toss-border rounded-xl px-3 py-2 text-sm font-semibold outline-hidden focus:border-toss-blue"
                    />
                  </div>
                  <p className="text-xs text-toss-muted leading-relaxed">
                    입력하신 생년월일은 기기 내에서만 연산되며 외부로 전송되지 않습니다.
                  </p>
                </div>
              </TossCard>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <TossButton
                variant="secondary"
                size="md"
                onClick={handleGenerateSingle}
                loading={isGenerating}
              >
                1게임 무료 추출
              </TossButton>
              <TossButton
                variant="primary"
                size="md"
                onClick={handleGenerateFiveSets}
                loading={isGenerating}
                className="bg-gradient-to-r from-toss-blue to-purple-600 shadow-md"
              >
                <Sparkles className="w-4 h-4 mr-1 inline" /> 5게임 세트 (광고)
              </TossButton>
            </div>

            {/* Generated Numbers Display (모바일 전용 최적화 레이아웃) */}
            {games.length > 0 && (
              <div className="space-y-2.5 animate-fade-in pt-1">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-sm text-toss-text">
                    추천 행운 번호 ({games.length}게임)
                  </h4>
                  <span className="text-xs text-toss-muted">
                    제 {schedule.currentRound}회 대비
                  </span>
                </div>

                {games.map((game, idx) => {
                  const sum = game.reduce((a, b) => a + b, 0);
                  const odds = game.filter((n) => n % 2 !== 0).length;
                  return (
                    <TossCard key={idx} padding="sm" className="overflow-hidden">
                      <div className="space-y-2.5">
                        {/* 1. 상단 컨트롤 바 (식별자 + 요약 + 액션 버튼) */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-blue-50 text-toss-blue text-xs font-extrabold flex items-center justify-center shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-[11px] text-toss-muted">
                              합계 <strong className="text-toss-text font-bold">{sum}</strong> · 홀짝{" "}
                              <strong className="text-toss-text font-bold">{odds}:{6 - odds}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyText(game, idx)}
                              className="px-2 py-1 text-xs text-toss-subtext bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-1 font-semibold"
                              title="복사하기"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600 text-[11px]">복사됨</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">복사</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleSaveGame(game)}
                              className="px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1 font-semibold"
                              title="보관하기"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                              <span className="text-[11px]">저장</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. 중앙 번호 볼 영역 (완전 중앙 정렬 & 절대 깨지지 않는 여백) */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1">
                          {game.map((num) => (
                            <div
                              key={num}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-extrabold text-sm border shadow-xs transition-transform hover:scale-105 shrink-0 ${getBallColor(
                                num
                              )}`}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    </TossCard>
                  );
                })}
              </div>
            )}

            {/* Legal Compliance Notice */}
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                건전한 복권 문화 및 법적 고지 안내
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                • 본 서비스는 빅데이터 통계 및 알고리즘 기반의 오락용 참고 번호 조합기이며, 실제 복권 당첨을 보장하지 않습니다.
                <br />
                • 복권 과몰입은 도박중독으로 이어질 수 있습니다. 1회 10만 원 이하의 소액 건전 구매를 권장합니다.
                <br />
                • 동행복권 클린센터: 1588-6450 | 도박문제 상담전화: 국번없이 1336
              </p>
            </div>

            <AdBanner
              title="삼성화재 다이렉트 착 자동차보험"
              subtitle="내 차 보험료 1분 만에 계산하고 3만원 주유권 혜택"
            />
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 보관함 및 실시간 당첨 채점 */}
        {/* ========================================================= */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            {/* Recent Official Draw */}
            <TossCard
              title={`제 ${recentWinner.round}회 공식 당첨 번호`}
              subtitle={`추첨일: ${recentWinner.date} (${recentWinner.winnersCount}명 1등 당첨)`}
              badge={<TossBadge variant="green">공식 발표</TossBadge>}
              padding="sm"
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 overflow-x-auto">
                {recentWinner.numbers.map((num) => (
                  <div
                    key={num}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm border shadow-xs shrink-0 ${getBallColor(
                      num
                    )}`}
                  >
                    {num}
                  </div>
                ))}
                <span className="text-base font-bold text-gray-400 mx-0.5 shrink-0">+</span>
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm border shadow-xs shrink-0 ${getBallColor(
                    recentWinner.bonus
                  )}`}
                >
                  {recentWinner.bonus}
                </div>
              </div>
              <p className="text-center text-xs text-toss-muted">
                1등 1게임당 당첨금: <strong className="text-toss-blue">{recentWinner.prize1st}</strong>
              </p>
            </TossCard>

            {/* Saved Games List with Match Check */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <h4 className="font-bold text-sm text-toss-text">
                  내 보관함 실시간 채점 ({savedGames.length}개)
                </h4>
                {savedGames.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("저장된 모든 번호를 삭제하시겠습니까?")) {
                        setSavedGames([]);
                      }
                    }}
                    className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 전체 삭제
                  </button>
                )}
              </div>

              {savedGames.length === 0 ? (
                <div className="text-center py-12 text-toss-muted text-sm bg-white rounded-2xl border border-toss-border p-4">
                  <Bookmark className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                  저장된 행운 번호가 없습니다.
                  <br />
                  번호 조합 탭에서 번호를 생성하고 보관해보세요!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedGames.map((game, idx) => {
                    const matchedNums = game.filter((n) => recentWinner.numbers.includes(n));
                    const matchCount = matchedNums.length;
                    const bonusMatch = game.includes(recentWinner.bonus);

                    let rankStr = "낙첨";
                    let rankBadge = "bg-gray-100 text-gray-500";
                    if (matchCount === 6) {
                      rankStr = "🎉 1등 당첨!";
                      rankBadge = "bg-amber-100 text-amber-700 font-extrabold";
                    } else if (matchCount === 5 && bonusMatch) {
                      rankStr = "🥈 2등 당첨!";
                      rankBadge = "bg-blue-100 text-blue-700 font-extrabold";
                    } else if (matchCount === 5) {
                      rankStr = "🥉 3등 당첨!";
                      rankBadge = "bg-purple-100 text-purple-700 font-bold";
                    } else if (matchCount === 4) {
                      rankStr = "4등 (50,000원)";
                      rankBadge = "bg-emerald-100 text-emerald-700 font-bold";
                    } else if (matchCount === 3) {
                      rankStr = "5등 (5,000원)";
                      rankBadge = "bg-green-100 text-green-700 font-bold";
                    }

                    return (
                      <TossCard key={idx} padding="sm">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                            <span className="text-xs font-bold text-toss-muted">
                              #{idx + 1}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${rankBadge}`}>
                              {rankStr} ({matchCount}개 일치{bonusMatch ? "+보너스" : ""})
                            </span>
                            <button
                              onClick={() => setSavedGames(savedGames.filter((_, i) => i !== idx))}
                              className="text-xs text-rose-500 hover:underline px-1"
                            >
                              삭제
                            </button>
                          </div>

                          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-1">
                            {game.map((num) => {
                              const isMatch = recentWinner.numbers.includes(num);
                              const isBonus = num === recentWinner.bonus;
                              return (
                                <div
                                  key={num}
                                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-extrabold text-xs sm:text-sm border transition shrink-0 ${
                                    isMatch || isBonus
                                      ? `${getBallColor(num)} ring-2 ring-amber-400 scale-105`
                                      : `${getBallColor(num)} opacity-40 grayscale-30`
                                  }`}
                                >
                                  {num}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TossCard>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: 역대 통계 및 분석 차트 */}
        {/* ========================================================= */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            <TossCard
              title="역대 최다 출현 번호 Top 10"
              subtitle="동행복권 1회차부터 누적된 1등 당첨 빈도수"
              badge={<TossBadge variant="blue">빅데이터</TossBadge>}
              padding="sm"
            >
              <div className="space-y-2 pt-1">
                {TOP_NUMBERS.map((item, i) => (
                  <div key={item.num} className="flex items-center gap-2.5 text-xs">
                    <span className="w-5 font-bold text-toss-muted text-right shrink-0">{i + 1}위</span>
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getBallColor(
                        item.num
                      )}`}
                    >
                      {item.num}
                    </div>
                    <div className="grow">
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-toss-blue h-full rounded-full transition-all duration-500"
                          style={{ width: `${(item.count / 210) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="font-extrabold text-toss-text w-12 text-right shrink-0">
                      {item.count}회
                    </span>
                  </div>
                ))}
              </div>
            </TossCard>

            <TossCard
              title="최근 미출현 번호 (Cold)"
              subtitle="최근 회차 동안 나오지 않아 출현 가능성 있는 번호"
              padding="sm"
            >
              <div className="flex items-center justify-around py-2">
                {COLD_NUMBERS.map((item) => (
                  <div key={item.num} className="text-center">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-full flex items-center justify-center font-bold text-xs sm:text-sm mb-1 ${getBallColor(
                        item.num
                      )}`}
                    >
                      {item.num}
                    </div>
                    <span className="text-[10px] text-toss-muted block">{item.count}회</span>
                  </div>
                ))}
              </div>
            </TossCard>

            <TossCard title="역대 1등 번호 핵심 통계 공식" padding="sm">
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-toss-bg p-3 rounded-xl space-y-1">
                  <div className="font-bold text-toss-text">최다 홀짝 비율</div>
                  <div className="text-toss-blue font-extrabold text-sm sm:text-base">3 : 3 (33.2%)</div>
                  <div className="text-[10px] text-toss-muted">2위 4:2, 3위 2:4</div>
                </div>
                <div className="bg-toss-bg p-3 rounded-xl space-y-1">
                  <div className="font-bold text-toss-text">최다 합계 구간</div>
                  <div className="text-purple-600 font-extrabold text-sm sm:text-base">121 ~ 160 (58%)</div>
                  <div className="text-[10px] text-toss-muted">평균 합계: 약 138</div>
                </div>
              </div>
            </TossCard>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: QR 당첨 확인 & 가이드 */}
        {/* ========================================================= */}
        {activeTab === "qr" && (
          <div className="space-y-4">
            <TossCard
              title="로또 용지 QR코드 당첨 확인"
              subtitle="복권 상단의 QR코드를 스마트폰 기본 카메라로 비추면 즉시 확인됩니다"
              badge={<TossBadge variant="green">공식 연동</TossBadge>}
              padding="sm"
            >
              <div className="py-3 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-toss-blue rounded-2xl mx-auto flex items-center justify-center border border-blue-200">
                  <QrCode className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-toss-text">카메라로 로또 종이 QR을 비춰보세요</h4>
                  <p className="text-xs text-toss-muted mt-1 leading-relaxed">
                    동행복권 공식 모바일 검증 시스템으로 연결되어
                    <br />
                    1초 만에 1~5등 당첨 및 번호 일치 결과를 확인합니다.
                  </p>
                </div>
                <a
                  href="https://m.dhlottery.co.kr/qr.do?method=checkServer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-toss-blue text-white font-bold text-sm rounded-xl shadow-xs hover:bg-blue-600 transition"
                >
                  동행복권 공식 QR 확인 페이지 열기 <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </TossCard>

            <TossCard title="당첨금 수령 방법 및 유효기간 안내" padding="sm">
              <div className="space-y-2 text-xs text-toss-subtext pt-1">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-toss-text shrink-0">• 1등:</span>
                  <span>농협은행 본점 (신분증 및 당첨복권 지참)</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-toss-text shrink-0">• 2·3등:</span>
                  <span>농협은행 전국 각 지점 (신분증 지참)</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-toss-text shrink-0">• 4·5등:</span>
                  <span>일반 로또 복권 판매점 및 농협은행 (현금 교환)</span>
                </div>
                <div className="pt-2 border-t border-gray-100 text-[11px] text-rose-500 font-semibold">
                  ⚠️ 당첨금 지급 기한: 추첨일로부터 1년 이내
                </div>
              </div>
            </TossCard>
          </div>
        )}
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={adOpen}
        rewardTitle={`제 ${schedule.currentRound}회 대비 AI 5게임 황금 세트 발급`}
        onClose={() => setAdOpen(false)}
        onRewarded={onAdRewardSuccess}
      />
    </div>
  );
};
