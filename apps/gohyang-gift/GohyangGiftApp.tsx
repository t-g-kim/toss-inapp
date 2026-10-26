import React, { useState, useMemo, useEffect } from "react";
import { TossCard, TossButton, TossBadge, AdBanner } from "@shared/index";
import {
  REGIONS,
  CATEGORIES,
  GIFT_ITEMS,
  GiftItem,
  RegionCode,
  CategoryCode,
  calculate2026TaxBenefit,
} from "./data";
import {
  Gift,
  Calculator,
  Heart,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Share2,
  ArrowRight,
  TrendingUp,
  MapPin,
  Star,
  Award,
  ShieldCheck,
  Check,
  SlidersHorizontal,
  X,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

interface GohyangGiftAppProps {
  onBack?: () => void;
}

type TabType = "explore" | "calculator" | "wishlist";

export const GohyangGiftApp: React.FC<GohyangGiftAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>("explore");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>("all");
  const [selectedCategory, setSelectedCategory] = useState<CategoryCode>("all");
  const [only100kFit, setOnly100kFit] = useState(false);
  const [sortBy, setSortBy] = useState<"popular" | "pointLow" | "pointHigh" | "rating">("popular");
  const [myResidence, setMyResidence] = useState<RegionCode | "none">("none");

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("gohyang_wishlist");
      return saved ? JSON.parse(saved) : ["meat-hoengseong-1", "seafood-jeju-galchi", "voucher-local-pay-1"];
    } catch {
      return ["meat-hoengseong-1", "seafood-jeju-galchi"];
    }
  });

  // Selected item for modal
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  // Calculator State
  const [donationInput, setDonationInput] = useState<number>(100000);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Save wishlist
  useEffect(() => {
    try {
      localStorage.setItem("gohyang_wishlist", JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlistIds((prev) => {
      const exists = prev.includes(id);
      if (!exists) {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.8 },
          colors: ["#10B981", "#059669", "#34D399"],
        });
        return [...prev, id];
      } else {
        return prev.filter((item) => item !== id);
      }
    });
  };

  // Filtered gift list
  const filteredGifts = useMemo(() => {
    return GIFT_ITEMS.filter((item) => {
      // 거주지 제외 (주민등록 거주지 지자체에는 기부 불가)
      if (myResidence !== "none" && item.region === myResidence) {
        return false;
      }
      // 지역 필터
      if (selectedRegion !== "all" && item.region !== selectedRegion) {
        return false;
      }
      // 카테고리 필터
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // 10만원 맞춤 (3만 포인트 이하)
      if (only100kFit && item.point > 30000) {
        return false;
      }
      // 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inRegion = item.regionName.toLowerCase().includes(q);
        const inLocality = item.localityName.toLowerCase().includes(q);
        const inTag = item.tag.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        if (!inTitle && !inRegion && !inLocality && !inTag && !inDesc) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return a.popularRank - b.popularRank;
      if (sortBy === "pointLow") return a.point - b.point;
      if (sortBy === "pointHigh") return b.point - a.point;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [selectedRegion, selectedCategory, only100kFit, searchQuery, sortBy, myResidence]);

  // Wishlist items
  const wishlistItems = useMemo(() => {
    return GIFT_ITEMS.filter((item) => wishlistIds.includes(item.id));
  }, [wishlistIds]);

  const wishlistTotalPoints = useMemo(() => {
    return wishlistItems.reduce((acc, cur) => acc + cur.point, 0);
  }, [wishlistItems]);

  // Tax calculation
  const taxBenefit = useMemo(() => {
    return calculate2026TaxBenefit(donationInput);
  }, [donationInput]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: "고향사랑기부제 답례품 & 2026 세액공제 계산기",
          text: "10만원 기부하면 10만원 전액 환급 + 3만원 지역 특산품까지 무료 득템! 전국 대표 답례품을 모아보세요.",
          url,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 select-none">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-transform"
                aria-label="뒤로가기"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🎁</span>
              <h1 className="font-bold text-base text-slate-900 tracking-tight">고향사랑 답례품</h1>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">
                2026 세법
              </span>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="공유하기"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Segmented Control */}
        <div className="max-w-md mx-auto px-4 pb-2 pt-1">
          <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("explore")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "explore"
                  ? "bg-white text-emerald-700 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              답례품 탐색
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "calculator"
                  ? "bg-white text-emerald-700 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              환급 계산기
            </button>
            <button
              onClick={() => setActiveTab("wishlist")}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === "wishlist"
                  ? "bg-white text-emerald-700 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${wishlistIds.length > 0 ? "fill-red-500 text-red-500" : ""}`}
              />
              보관함 ({wishlistIds.length})
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-3">
        {/* ======================= TAB 1: EXPLORE ======================= */}
        {activeTab === "explore" && (
          <div className="space-y-4">
            {/* Banner: 100k = Free 30k gift notice */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>직장인 필수 연말정산 치트키</span>
                </div>
                <h2 className="text-lg font-bold leading-tight">
                  10만원 기부하면 100% 환급,
                  <br />
                  <span className="text-yellow-300">3만원 답례품</span>은 전액 무료!
                </h2>
                <p className="text-xs text-emerald-100 mt-1.5">
                  2026년부터 10만~20만원 구간 공제율도 44%로 대폭 상향되었어요.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setOnly100kFit(true);
                      window.scrollTo({ top: 320, behavior: "smooth" });
                    }}
                    className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 backdrop-blur-sm"
                  >
                    10만원 맞춤 답례품 모아보기
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-20 pointer-events-none">
                🎁
              </div>
            </div>

            {/* My Residence Filter Alert */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium">내 주민등록 주소지: </span>
                    <span className="font-bold text-slate-800">
                      {myResidence === "none"
                        ? "선택 안 함 (전국 표시)"
                        : REGIONS.find((r) => r.code === myResidence)?.name}
                    </span>
                  </div>
                </div>
                <select
                  value={myResidence}
                  onChange={(e) => setMyResidence(e.target.value as RegionCode | "none")}
                  className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="none">전체 보기</option>
                  {REGIONS.filter((r) => r.code !== "all").map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {myResidence !== "none" && (
                <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 mt-2 flex items-start gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    고향사랑기부제 법률상 현재 거주하시는 지자체에는 기부할 수 없어, 목록에서
                    자동으로 제외되었습니다.
                  </span>
                </p>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="답례품, 지자체, 한우, 상품권 등 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Region Scroll Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">지역별 선택</span>
                {selectedRegion !== "all" && (
                  <button
                    onClick={() => setSelectedRegion("all")}
                    className="text-[11px] text-emerald-600 font-semibold"
                  >
                    초기화
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {REGIONS.map((r) => {
                  const isSelected = selectedRegion === r.code;
                  return (
                    <button
                      key={r.code}
                      onClick={() => setSelectedRegion(r.code)}
                      className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{r.badgeEmoji}</span>
                      <span>{r.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Scroll Bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((c) => {
                const isSelected = selectedCategory === c.code;
                return (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCategory(c.code)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{c.emoji}</span>
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub Filters & Sort */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={only100kFit}
                  onChange={(e) => setOnly100kFit(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                <span className="font-medium text-slate-700">10만원 기부 맞춤 (3만P 이하)</span>
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-0 text-slate-600 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="popular">인기순</option>
                <option value="rating">별점 높은순</option>
                <option value="pointLow">포인트 낮은순</option>
                <option value="pointHigh">포인트 높은순</option>
              </select>
            </div>

            {/* Gift Items Count */}
            <div className="text-[11px] text-slate-500 font-medium">
              총 <span className="font-bold text-slate-800">{filteredGifts.length}</span>개의 답례품
            </div>

            {/* Gift Grid */}
            {filteredGifts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-sm font-bold text-slate-800 mb-1">일치하는 답례품이 없어요</div>
                <div className="text-xs text-slate-500 mb-4">
                  검색어나 필터 조건을 변경하여 다시 확인해보세요.
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRegion("all");
                    setSelectedCategory("all");
                    setOnly100kFit(false);
                  }}
                  className="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-lg text-slate-700"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredGifts.map((item) => {
                  const isWishlisted = wishlistIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedGift(item)}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-500 transition-all cursor-pointer flex flex-col active:scale-[0.98]"
                    >
                      {/* Image / Emoji Area */}
                      <div className="h-28 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                        <span className="text-5xl">{item.imageEmoji}</span>

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {item.isBestSeller && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                              BEST
                            </span>
                          )}
                          {item.is100kFit && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                              10만맞춤
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => toggleWishlist(item.id, e)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 backdrop-blur-xs transition-colors"
                          title="찜하기"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isWishlisted ? "fill-red-500 text-red-500" : "text-slate-500"
                            }`}
                          />
                        </button>

                        {/* Location Tag */}
                        <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {item.regionName}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-[11px] text-emerald-700 font-semibold mb-0.5 truncate">
                            {item.tag}
                          </div>
                          <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                            {item.title}
                          </h3>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <div className="flex items-baseline justify-between">
                            <span className="text-[10px] text-slate-500">필요 포인트</span>
                            <span className="font-extrabold text-sm text-emerald-700">
                              {item.point.toLocaleString()} P
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                            <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {item.rating}
                            </span>
                            <span>후기 {item.reviewCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ad Banner */}
            <div className="pt-2">
              <AdBanner placement="gohyang_list_bottom" />
            </div>
          </div>
        )}

        {/* ======================= TAB 2: CALCULATOR ======================= */}
        {activeTab === "calculator" && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">💰</span>
                <h2 className="font-bold text-sm text-slate-900">
                  2026년 개정세법 환급 시뮬레이터
                </h2>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                기부금액을 설정하면 <strong>연말정산 세액공제액</strong>과 받을 수 있는{" "}
                <strong>30% 답례품 포인트</strong>를 실시간으로 계산해 드려요.
              </p>

              {/* 2026 Key Law Changes Card */}
              <div className="mt-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  2026년 신설 혜택 체크포인트
                </div>
                <div className="text-slate-700 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>10만원 이하:</strong> 100% 전액 세액공제 (실부담 0원)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>10만~20만원 구간:</strong> 공제율 <strong>44%</strong>로 대폭 상향 신설!
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      <strong>30% 답례품:</strong> 모든 기부금의 30% 특산품 포인트 무조건 지급
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Donation Input Area */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">희망 기부금액</label>
                <div className="text-lg font-black text-emerald-700">
                  {donationInput.toLocaleString()}원
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min={10000}
                max={1000000}
                step={10000}
                value={donationInput}
                onChange={(e) => setDonationInput(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: "10만원 (추천)", value: 100000, tag: "100%환급" },
                  { label: "20만원 (신설)", value: 200000, tag: "44%상향" },
                  { label: "50만원", value: 500000 },
                  { label: "100만원", value: 1000000 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setDonationInput(preset.value)}
                    className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all flex flex-col items-center ${
                      donationInput === preset.value
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{preset.value / 10000}만원</span>
                    {preset.tag && (
                      <span
                        className={`text-[9px] ${
                          donationInput === preset.value ? "text-emerald-100" : "text-emerald-700"
                        }`}
                      >
                        {preset.tag}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Benefit Result Summary Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-700">
                <span>총 기부 금액</span>
                <span className="font-bold text-white text-sm">
                  {taxBenefit.donationAmount.toLocaleString()}원
                </span>
              </div>

              <div className="py-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    연말정산 세액공제 환급액
                  </span>
                  <span className="font-extrabold text-emerald-400 text-sm">
                    +{taxBenefit.taxCredit.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    지급되는 답례품 포인트 (30%)
                  </span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    +{taxBenefit.giftPoint.toLocaleString()} P
                  </span>
                </div>
              </div>

              {/* Total Benefit Box */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 font-semibold">총 혜택 합계</span>
                  <span className="text-lg font-black text-yellow-300">
                    {taxBenefit.totalBenefit.toLocaleString()}원 상당
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                  <span>내 실제 부담 지출액</span>
                  <span className="font-bold text-white">
                    {taxBenefit.realCost === 0
                      ? "0원 (실부담 없음!)"
                      : `${taxBenefit.realCost.toLocaleString()}원`}
                  </span>
                </div>
              </div>

              {/* Sweet Spot Explanation */}
              <div className="mt-3 text-center text-xs text-emerald-300 font-medium bg-emerald-950/40 rounded-lg p-2.5 border border-emerald-800/40">
                {donationInput <= 100000 ? (
                  <span>
                    🎉 <strong>실부담 0원 구간!</strong> 낸 돈 100%를 연말정산으로 돌려받고{" "}
                    <strong>{taxBenefit.giftPoint.toLocaleString()}원</strong> 상당 특산품을 공짜로
                    받는 셈이에요.
                  </span>
                ) : donationInput <= 200000 ? (
                  <span>
                    🚀 <strong>2026 신설 꿀구간!</strong> 10만 초과분도 44% 공제 + 30% 답례품으로{" "}
                    <strong>74% 환급 효율</strong>을 누릴 수 있어요!
                  </span>
                ) : (
                  <span>
                    💡 20만원 초과분은 16.5% 공제 + 30% 답례품으로 약 46.5%의 환급 혜택이 적용됩니다.
                  </span>
                )}
              </div>
            </div>

            {/* Affordable Gifts for this Point */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>
                    이 포인트({taxBenefit.giftPoint.toLocaleString()} P)로 받을 수 있는 대표 답례품
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("explore");
                    window.scrollTo({ top: 300, behavior: "smooth" });
                  }}
                  className="text-[11px] font-semibold text-emerald-600 flex items-center"
                >
                  더보기 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {GIFT_ITEMS.filter((item) => item.point <= taxBenefit.giftPoint)
                  .slice(0, 3)
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedGift(item)}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.imageEmoji}</span>
                        <div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {item.regionName}
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                            {item.title}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-700">
                          {item.point.toLocaleString()} P
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">선택 가능</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 3: WISHLIST ======================= */}
        {activeTab === "wishlist" && (
          <div className="space-y-4">
            {/* Wishlist Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  <h2 className="font-bold text-sm text-slate-900">내가 찜한 답례품 보관함</h2>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {wishlistItems.length}개 선택
                </span>
              </div>

              {wishlistItems.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 mt-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">총 필요 포인트</span>
                    <span className="font-black text-emerald-800 text-sm">
                      {wishlistTotalPoints.toLocaleString()} P
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>필요 기부 금액 (30% 기준)</span>
                    <span className="font-bold text-slate-900">
                      약 {Math.ceil(wishlistTotalPoints / 0.3 / 10000) * 10000}원 기부 시 획득 가능
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Items List */}
            {wishlistItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <div className="text-4xl mb-2">🤍</div>
                <div className="text-sm font-bold text-slate-800 mb-1">
                  아직 찜한 답례품이 없어요
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  마음에 드는 지역 특산품을 하트(찜)해두고 필요한 기부액을 비교해보세요.
                </div>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold px-4 py-2 rounded-xl text-white shadow-xs"
                >
                  답례품 둘러보기
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {wishlistItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGift(item)}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        {item.imageEmoji}
                      </div>
                      <div>
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          {item.regionName}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="text-[11px] font-extrabold text-emerald-700 mt-0.5">
                          {item.point.toLocaleString()} P
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                      title="찜 해제"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Donation Action Button */}
                <div className="pt-2">
                  <a
                    href="https://www.ilovegohyang.go.kr"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md"
                  >
                    <span>고향사랑e음 공식 웹사이트에서 기부하기</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    행정안전부 공식 고향사랑e음 시스템으로 연결됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================= GIFT DETAIL MODAL ======================= */}
      {selectedGift && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedGift(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedGift(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Emoji & Header */}
            <div className="text-center pt-2 pb-4 border-b border-slate-100">
              <div className="text-6xl mb-2">{selectedGift.imageEmoji}</div>
              <div className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                {selectedGift.regionName} ({selectedGift.localityName})
              </div>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug px-4">
                {selectedGift.title}
              </h3>
              <div className="flex items-center justify-center gap-3 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {selectedGift.rating}
                </span>
                <span>•</span>
                <span>리뷰 {selectedGift.reviewCount.toLocaleString()}건</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{selectedGift.provider}</span>
              </div>
            </div>

            {/* Price & Minimum Donation Info */}
            <div className="py-4 space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">필요 답례품 포인트</div>
                  <div className="text-xl font-black text-emerald-700">
                    {selectedGift.point.toLocaleString()} P
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-medium">필요 기부 금액 (30%)</div>
                  <div className="text-xs font-bold text-slate-800">
                    {selectedGift.minDonation.toLocaleString()}원 이상
                  </div>
                </div>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">답례품 주요 특징</h4>
                <div className="space-y-1.5">
                  {selectedGift.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-700 flex items-center gap-2 bg-slate-50 p-2 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">상세 안내</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedGift.description}
                </p>
              </div>

              {/* Step-by-Step Guide */}
              <div className="bg-emerald-50/70 border border-emerald-200/50 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  기부하고 답례품 받는 3단계
                </div>
                <ol className="text-[11px] text-slate-700 space-y-1 list-decimal list-inside pl-0.5">
                  <li>고향사랑e음(공식) 접속 후 본인 인증</li>
                  <li>
                    <strong>{selectedGift.localityName}</strong> 선택하여 원하는 금액 기부 (세액공제
                    자동신청)
                  </li>
                  <li>기부 직후 지급된 30% 포인트로 본 답례품 즉시 배송 신청</li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={(e) => toggleWishlist(selectedGift.id, e)}
                className={`py-3 px-3.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  wishlistIds.includes(selectedGift.id)
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlistIds.includes(selectedGift.id) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>{wishlistIds.includes(selectedGift.id) ? "찜 완료" : "찜하기"}</span>
              </button>
              <a
                href="https://www.ilovegohyang.go.kr"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md"
              >
                <span>고향사랑e음에서 신청하기</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Copied Notice Toast */}
      {copiedNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>링크가 클립보드에 복사되었어요!</span>
        </div>
      )}
    </div>
  );
};
