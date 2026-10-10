import React, { useState, useEffect } from "react";
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
  Clock,
  Flame,
  Calendar,
  Hash,
  Copy,
  Check,
  Bell,
  Sparkles,
  TrendingUp,
  Music2,
  Crown,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";

interface InstaTimeAppProps {
  onBack?: () => void;
}

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

const CATEGORIES = [
  { id: "cafe", name: "☕ 카페·맛집", tag: "카페", bestHours: "11:45 ~ 13:00 / 18:30 ~ 20:00" },
  { id: "travel", name: "✈️ 여행·풍경", tag: "여행", bestHours: "19:00 ~ 21:30 (금/토 최고)" },
  { id: "fashion", name: "👗 패션·OOTD", tag: "패션", bestHours: "12:00 ~ 13:30 / 20:30 ~ 22:30" },
  { id: "reels", name: "🎬 릴스·숏폼", tag: "릴스", bestHours: "20:00 ~ 23:30 (밤 알고리즘)" },
  { id: "daily", name: "💼 일상·직장", tag: "일상", bestHours: "07:45 ~ 08:45 / 18:00 ~ 19:30" },
];

const HASHTAG_PRESETS: Record<string, string[]> = {
  cafe: [
    "#감성카페", "#카페투어", "#신상카페", "#디저트맛집", "#카페스타그램",
    "#라떼아트", "#분위기맛집", "#카페인테리어", "#동네카페", "#주말나들이",
    "#크루아상맛집", "#데이트코스", "#감성사진", "#핸드드립", "#카페추천"
  ],
  travel: [
    "#여행에미치다", "#국내여행지추천", "#주말여행", "#감성숙소", "#풍경사진",
    "#힐링여행", "#드라이브코스", "#바다스타그램", "#여행기록", "#노을명소",
    "#오션뷰카페", "#국내여행", "#가족여행", "#인생샷명소", "#풍경스타그램"
  ],
  fashion: [
    "#오늘의코디", "#데일리룩", "#오오티디", "#출근룩", "#봄코디",
    "#스트릿패션", "#미니멀룩", "#캐주얼코디", "#패션스타그램", "#데이트룩",
    "#쇼핑하울", "#모던룩", "#가방스타그램", "#스니커즈", "#스타일링"
  ],
  reels: [
    "#릴스추천", "#릴스바이럴", "#알고리즘타기", "#꿀팁공유", "#일상릴스",
    "#웃긴영상", "#감성릴스", "#인스타릴스", "#챌린지", "#오늘의쇼츠",
    "#틱톡감성", "#트렌드음원", "#킬링타임", "#공감영상", "#릴스중독"
  ],
  daily: [
    "#직장인스타그램", "#퇴근길", "#월요팅", "#칼퇴기원", "#소소한일상",
    "#오늘하루", "#점심메뉴추천", "#하루기록", "#갓생살기", "#직장인일상",
    "#재택근무", "#동기사랑", "#야근스타그램", "#금요일밤", "#주말순삭"
  ],
};

export const InstaTimeApp: React.FC<InstaTimeAppProps> = ({ onBack }) => {
  const currentDayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(currentDayIndex);
  const [selectedCategory, setSelectedCategory] = useState("cafe");
  const [copiedTags, setCopiedTags] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [unlockedBgm, setUnlockedBgm] = useState(false);
  const [vipCalendar, setVipCalendar] = useState(false);

  // Hourly traffic scores (0 ~ 23)
  const getTrafficData = () => {
    // Basic day profile
    const isWeekend = selectedDay === 0 || selectedDay === 6;
    if (selectedCategory === "reels") {
      return [10, 5, 2, 1, 1, 3, 10, 25, 40, 45, 55, 68, 75, 70, 60, 65, 70, 80, 88, 92, 98, 95, 80, 40];
    }
    if (isWeekend) {
      return [15, 8, 3, 1, 1, 2, 8, 20, 35, 60, 75, 85, 90, 88, 82, 80, 85, 88, 92, 95, 96, 90, 65, 30];
    }
    // Weekday standard
    return [8, 4, 1, 1, 1, 5, 25, 60, 82, 50, 55, 78, 88, 70, 50, 55, 65, 85, 92, 95, 94, 88, 60, 25];
  };

  const traffic = getTrafficData();
  const peakHour = traffic.indexOf(Math.max(...traffic));
  const currentHour = new Date().getHours();

  const handleCopyTags = () => {
    const tags = HASHTAG_PRESETS[selectedCategory] || [];
    navigator.clipboard.writeText(tags.join(" "));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  const handleBgmReward = () => {
    setAdModalOpen(false);
    setUnlockedBgm(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    alert("🎵 이번 주 인스타 100만 뷰 급상승 트렌드 BGM 5곡이 공개되었습니다!");
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="인스타 골든타임"
        subtitle="내 게시물 좋아요·도달 2배 높이는 업로드 피크 시간"
        onBack={onBack}
        rightAction={<TossBadge variant="orange">실시간 분석</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Day Selector */}
        <TossCard title="📅 업로드 요일 선택" subtitle="요일별 활성 사용자 활동 패턴을 분석합니다">
          <div className="grid grid-cols-7 gap-1.5 pt-1 text-center">
            {DAYS.map((day, idx) => {
              const isToday = idx === currentDayIndex;
              const isSelected = idx === selectedDay;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(idx)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-toss-bg text-toss-subtext hover:bg-gray-200"
                  }`}
                >
                  <span className="block">{day}</span>
                  {isToday && (
                    <span className="text-[9px] block mt-0.5 opacity-90">오늘</span>
                  )}
                </button>
              );
            })}
          </div>
        </TossCard>

        {/* Category Selector */}
        <TossCard title="🏷️ 콘텐츠 카테고리" subtitle="주제별 타겟 오디언스 접속 시간대 일치">
          <div className="grid grid-cols-2 gap-2 pt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedCategory === cat.id
                    ? "border-rose-500 bg-rose-50/50 text-rose-600 font-bold shadow-sm"
                    : "border-toss-border bg-white text-toss-subtext hover:bg-gray-50"
                }`}
              >
                <span className="text-xs block font-bold">{cat.name}</span>
                <span className="text-[10px] text-toss-muted block mt-1 truncate">
                  {cat.bestHours}
                </span>
              </button>
            ))}
          </div>
        </TossCard>

        {/* Golden Hour Hero Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 text-white shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-300" /> 오늘의 초특급 골든타임
            </span>
            <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full font-bold">
              도달 잠재력 98%
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-extrabold tracking-tight">
              {peakHour >= 12 ? `오후 ${peakHour === 12 ? 12 : peakHour - 12}시` : `오전 ${peakHour}시`}
              <span className="text-lg font-normal text-rose-100 ml-1.5">~ {peakHour >= 12 ? `오후 ${peakHour === 11 ? 12 : (peakHour - 11) % 12}시` : `오전 ${peakHour + 1}시`}</span>
            </div>
            <p className="text-xs text-rose-100 mt-1 leading-relaxed">
              지금 시간({currentHour}시) 대비{" "}
              {peakHour > currentHour
                ? `약 ${peakHour - currentHour}시간 후 접속자가 급증합니다.`
                : "골든타임 시간대에 맞춰 예약 업로드를 추천합니다."}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-rose-100">서브 추천 시간</span>
            <span className="font-bold text-white">점심 12:20 ~ 13:00 (도달률 88%)</span>
          </div>
        </div>

        {/* 24-Hour Timeline Traffic Chart */}
        <TossCard title="📊 24시간 실시간 인스타 도달 지수" subtitle="1시간 단위 트래픽 피크 그래프">
          <div className="pt-2">
            <div className="h-28 flex items-end justify-between gap-1 px-1">
              {traffic.map((score, h) => {
                const isPeak = h === peakHour;
                const isNow = h === currentHour;
                return (
                  <div key={h} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className={`w-full rounded-t-sm transition-all ${
                        isPeak
                          ? "bg-rose-500 shadow-md"
                          : isNow
                          ? "bg-toss-blue"
                          : "bg-gray-200 group-hover:bg-rose-300"
                      }`}
                      style={{ height: `${(score / 100) * 100}%` }}
                    />
                    {/* Tooltip on hover/touch */}
                    <div className="absolute -top-7 hidden group-hover:flex bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                      {h}시: {score}점
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-toss-muted mt-2 px-1 border-t border-toss-border pt-1">
              <span>00시</span>
              <span>06시</span>
              <span>12시</span>
              <span>18시</span>
              <span>23시</span>
            </div>
          </div>
        </TossCard>

        {/* Smart Hashtag Pack */}
        <TossCard
          title="🏷️ 알고리즘 탐색 노출 꿀 해시태그 15선"
          subtitle="대형 키워드 + 중소형 검색 유입 최적 조합"
          badge={
            <button
              onClick={handleCopyTags}
              className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"
            >
              {copiedTags ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedTags ? "복사됨!" : "전체 복사"}
            </button>
          }
        >
          <div className="pt-1 flex flex-wrap gap-1.5">
            {(HASHTAG_PRESETS[selectedCategory] || []).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-toss-bg text-toss-subtext text-xs rounded-lg font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-toss-muted mt-2">
            💡 본문 마지막 또는 첫 번째 댓글에 붙여넣으면 노출 지수가 극대화됩니다.
          </p>
        </TossCard>

        {/* Viral Reels BGM Section */}
        <TossCard
          title="🎵 이번 주 100만 뷰 급상승 트렌드 BGM"
          subtitle="인스타 릴스·스토리 도달 치트키 음원 5곡"
          badge={<TossBadge variant="purple">릴스 추천</TossBadge>}
        >
          {unlockedBgm ? (
            <div className="space-y-2 pt-1 text-xs">
              {[
                { title: "Espresso (Speed Up)", artist: "Sabrina Carpenter", views: "142만 릴스" },
                { title: "Magnetic (Acoustic Lofi)", artist: "ILLIT", views: "98만 릴스" },
                { title: "Birds of a Feather", artist: "Billie Eilish", views: "210만 릴스" },
                { title: "밤양갱 (Lo-fi Mood)", artist: "비비", views: "85만 릴스" },
                { title: "Good Luck, Babe!", artist: "Chappell Roan", views: "115만 릴스" },
              ].map((song, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-toss-bg rounded-xl">
                  <div className="flex items-center gap-2">
                    <Music2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-bold text-toss-text block">{song.title}</span>
                      <span className="text-[10px] text-toss-muted">{song.artist}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-purple-600 font-bold">{song.views}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-2 text-center">
              <p className="text-xs text-toss-muted mb-3">
                광고 1편 시청 시 이번 주 알고리즘 급상승 트렌드 음원 목록을 무료 해금합니다.
              </p>
              <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                <Music2 className="w-4 h-4 mr-1 inline" /> 무료 광고 보고 BGM 5곡 해금
              </TossButton>
            </div>
          )}
        </TossCard>

        {/* Monetization / VIP Calendar */}
        <div className="space-y-2 pt-2">
          <TossButton
            variant="primary"
            size="lg"
            onClick={handleCopyTags}
          >
            <Copy className="w-4 h-4 mr-1.5 inline" /> 해시태그 복사하고 인스타 올리러 가기
          </TossButton>

          <TossButton
            variant="secondary"
            size="md"
            onClick={() => setPayModalOpen(true)}
          >
            <Crown className="w-4 h-4 mr-1 inline text-amber-500" />
            {vipCalendar
              ? "VIP 월간 골든타임 캘린더 보유 중"
              : "365일 월간 골든타임 캘린더 & 시즌 키워드 500선 (990원)"}
          </TossButton>
        </div>

        <AdBanner />
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onReward={handleBgmReward}
        rewardTitle="이번 주 트렌드 BGM 5선 해금"
        adDurationSeconds={5}
      />

      {/* TossPay Modal */}
      <TossPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setPayModalOpen(false);
          setVipCalendar(true);
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
          alert("🎉 365일 월간 골든타임 캘린더 & 시즌 키워드 500선이 해금되었습니다!");
        }}
        productName="365일 월간 골든타임 캘린더 & 시즌 키워드 500선"
        price={990}
      />
    </div>
  );
};
