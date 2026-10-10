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
  Grid,
  Image as ImageIcon,
  ArrowLeftRight,
  Sparkles,
  Sliders,
  Download,
  Share2,
  Trash2,
  Crown,
  CheckCircle2,
  Upload,
} from "lucide-react";
import confetti from "canvas-confetti";

interface FeedPreviewAppProps {
  onBack?: () => void;
}

interface GridItem {
  id: number;
  url: string;
  tag: string;
}

const PRESET_FEEDS: Record<string, { name: string; desc: string; items: GridItem[] }> = {
  cafe: {
    name: "☕ 감성 카페 & 베이지",
    desc: "따스한 햇살과 원목, 라떼 톤의 아늑한 무드",
    items: [
      { id: 1, url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80", tag: "Coffee" },
      { id: 2, url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80", tag: "Book" },
      { id: 3, url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80", tag: "Cup" },
      { id: 4, url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80", tag: "Space" },
      { id: 5, url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80", tag: "Dessert" },
      { id: 6, url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80", tag: "Beans" },
      { id: 7, url: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=400&q=80", tag: "Interior" },
      { id: 8, url: "https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80", tag: "Matcha" },
      { id: 9, url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&q=80", tag: "Pour" },
    ],
  },
  minimal: {
    name: "🖤 미니멀 & 흑백 시크",
    desc: "깔끔하고 세련된 모노톤 무채색 피드",
    items: [
      { id: 1, url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80", tag: "Chair" },
      { id: 2, url: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80", tag: "Workspace" },
      { id: 3, url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=80", tag: "Architecture" },
      { id: 4, url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80", tag: "Building" },
      { id: 5, url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80", tag: "City" },
      { id: 6, url: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&q=80", tag: "Note" },
      { id: 7, url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80", tag: "Desk" },
      { id: 8, url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80", tag: "Camera" },
      { id: 9, url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=80", tag: "Travel" },
    ],
  },
  sunset: {
    name: "🌅 감성 노을 & 시티팝",
    desc: "골든아워의 로맨틱한 보랏빛과 오렌지빛",
    items: [
      { id: 1, url: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=400&q=80", tag: "Sunset" },
      { id: 2, url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80", tag: "Beach" },
      { id: 3, url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80", tag: "Trees" },
      { id: 4, url: "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=400&q=80", tag: "Glow" },
      { id: 5, url: "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=400&q=80", tag: "Sunrise" },
      { id: 6, url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&q=80", tag: "Road" },
      { id: 7, url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80", tag: "Valley" },
      { id: 8, url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80", tag: "Meadow" },
      { id: 9, url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80", tag: "Lake" },
    ],
  },
};

export const FeedPreviewApp: React.FC<FeedPreviewAppProps> = ({ onBack }) => {
  const [grid, setGrid] = useState<GridItem[]>(PRESET_FEEDS.cafe.items);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [currentFilter, setCurrentFilter] = useState<"none" | "warm" | "film" | "bw">("none");
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [vipUnlocked, setVipUnlocked] = useState(false);
  const [profileName, setProfileName] = useState("my.daily_vibe");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSlotTarget, setUploadSlotTarget] = useState<number | null>(null);

  // Swap two slots
  const handleSlotClick = (index: number) => {
    if (selectedSlot === null) {
      setSelectedSlot(index);
    } else if (selectedSlot === index) {
      setSelectedSlot(null);
    } else {
      // Swap positions
      const newGrid = [...grid];
      const temp = newGrid[selectedSlot];
      newGrid[selectedSlot] = newGrid[index];
      newGrid[index] = temp;
      setGrid(newGrid);
      setSelectedSlot(null);
    }
  };

  const handleUploadClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadSlotTarget(index);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadSlotTarget !== null) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newGrid = [...grid];
          newGrid[uploadSlotTarget] = {
            id: Date.now(),
            url: event.target.result as string,
            tag: "My Photo",
          };
          setGrid(newGrid);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (key: string) => {
    if (PRESET_FEEDS[key]) {
      setGrid(PRESET_FEEDS[key].items);
      setSelectedSlot(null);
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
    alert("✨ 9칸 피드 조화 리포트와 고화질 캡처본이 앨범에 저장되었습니다!");
  };

  const getFilterStyle = () => {
    switch (currentFilter) {
      case "warm":
        return "sepia(25%) saturate(120%) contrast(95%)";
      case "film":
        return "contrast(110%) brightness(95%) saturate(85%)";
      case "bw":
        return "grayscale(100%) contrast(120%)";
      default:
        return "none";
    }
  };

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      {/* Hidden file input for uploading custom photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <TossHeader
        title="인스타 피드 미리보기"
        subtitle="올리기 전에 9칸 바둑판 배열 완벽 조율"
        onBack={onBack}
        rightAction={<TossBadge variant="purple">인스타 필수</TossBadge>}
      />

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Instagram Profile Header Simulation */}
        <TossCard>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <img
                  src={grid[0]?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="font-bold text-sm text-toss-text bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-toss-blue w-32"
                />
                <TossBadge variant="blue">미리보기</TossBadge>
              </div>
              <p className="text-[11px] text-toss-muted mt-0.5">
                게시물 <strong className="text-toss-text">9</strong> · 팔로워 <strong className="text-toss-text">1.2k</strong> · 피드 감성도 <strong className="text-rose-500">96점</strong>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-toss-subtext mt-2 bg-toss-bg p-2 rounded-lg">
            💡 사진을 터치한 뒤 다른 사진을 터치하면 <strong>위치가 1초 만에 맞바뀝니다.</strong>
          </p>
        </TossCard>

        {/* 3x3 Instagram Feed Grid */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-toss-border">
          <div
            className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden bg-gray-100"
            style={{ filter: getFilterStyle(), transition: "filter 0.3s ease" }}
          >
            {grid.map((item, index) => {
              const isSelected = selectedSlot === index;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSlotClick(index)}
                  className={`relative aspect-square cursor-pointer overflow-hidden group select-none transition-all ${
                    isSelected
                      ? "ring-4 ring-rose-500 scale-95 z-10 shadow-lg"
                      : "hover:opacity-90"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={`Feed ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </div>
                  {/* Upload button on slot */}
                  <button
                    onClick={(e) => handleUploadClick(index, e)}
                    title="내 사진으로 교체"
                    className="absolute bottom-1 right-1 bg-white/90 hover:bg-white text-gray-800 p-1 rounded-full shadow transition"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                  {isSelected && (
                    <div className="absolute inset-0 bg-rose-500/20 flex items-center justify-center pointer-events-none">
                      <ArrowLeftRight className="w-6 h-6 text-white drop-shadow-md animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2.5 px-1 text-xs text-toss-muted">
            <span className="flex items-center gap-1">
              <ArrowLeftRight className="w-3.5 h-3.5 text-toss-blue" />
              {selectedSlot !== null
                ? `#${selectedSlot + 1}번 선택됨 → 바꿀 칸을 터치하세요`
                : "사진을 눌러 순서를 교체해보세요"}
            </span>
            <span className="font-semibold text-rose-500">인스타 정방형(1:1)</span>
          </div>
        </div>

        {/* Filter Tone Presets */}
        <TossCard title="🎨 피드 무드 & 필터 프리셋" subtitle="전체 사진의 톤앤매너 일치율 조율">
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {[
              { id: "none", label: "원본", desc: "자연스러움" },
              { id: "warm", label: "웜톤 노을", desc: "라떼 감성" },
              { id: "film", label: "필름 감성", desc: "빈티지 톤" },
              { id: "bw", label: "흑백 시크", desc: "모던 무채색" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCurrentFilter(f.id as any)}
                className={`p-2.5 rounded-xl border text-xs transition ${
                  currentFilter === f.id
                    ? "border-toss-blue bg-blue-50/50 text-toss-blue font-bold shadow-sm"
                    : "border-toss-border bg-white text-toss-subtext hover:bg-gray-50"
                }`}
              >
                <span className="block font-semibold">{f.label}</span>
                <span className="text-[10px] text-toss-muted block mt-0.5">{f.desc}</span>
              </button>
            ))}
          </div>

          {/* Preset Feeds */}
          <div className="mt-3 pt-3 border-t border-toss-border">
            <span className="text-xs font-bold text-toss-text block mb-2">
              추천 무드 테마 바로 채우기
            </span>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PRESET_FEEDS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleApplyPreset(key)}
                  className="p-2 rounded-xl bg-toss-bg hover:bg-gray-200/70 text-left text-xs transition"
                >
                  <span className="font-bold text-toss-text block text-[11px] truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-toss-muted block truncate mt-0.5">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </TossCard>

        {/* AI Vibe Check Report */}
        <TossCard
          title="✨ AI 피드 톤앤매너 진단 리포트"
          subtitle="9장의 사진 채도·명도 균형도 종합 평가"
          badge={<TossBadge variant="green">조화도 96%</TossBadge>}
        >
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>팔로우를 부르는 시각적 안정감 달성!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                • 1열과 3열의 명도 대비가 균형을 이루어 스크롤 시 피로감이 적어요.<br />
                • 메인 색상(따스한 브라운 & 아이보리)이 70% 이상 일관성을 유지하고 있어요.<br />
                • 첫 번째와 다섯 번째 사진에 시선이 자연스럽게 집중되는 황금 구도입니다.
              </p>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-toss-bg rounded-xl">
              <span className="text-toss-muted font-medium">추천 업로드 순서</span>
              <span className="font-bold text-toss-text">#9부터 역순으로 업로드 추천</span>
            </div>
          </div>
        </TossCard>

        {/* Export & Actions */}
        <div className="space-y-2 pt-2">
          <TossButton variant="primary" size="lg" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5 inline" /> 피드 완성본 저장 및 조율 완료
          </TossButton>

          <TossButton
            variant="secondary"
            size="md"
            onClick={() => setPayModalOpen(true)}
          >
            <Crown className="w-4 h-4 mr-1 inline text-amber-500" />
            {vipUnlocked
              ? "VIP 프로필 하이라이트 50종 팩 보유 중"
              : "인스타 하이라이트 아이콘 50종 팩 (990원)"}
          </TossButton>
        </div>

        <AdBanner />
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal
        isOpen={adModalOpen}
        onClose={() => setAdModalOpen(false)}
        onReward={handleAdReward}
        rewardTitle="9칸 피드 고화질 이미지 & 리포트 저장"
        adDurationSeconds={5}
      />

      {/* TossPay Modal */}
      <TossPayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setPayModalOpen(false);
          setVipUnlocked(true);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
          alert("🎉 VIP 인스타 프로필 하이라이트 50종 팩이 영구 해금되었습니다!");
        }}
        productName="인스타 하이라이트 아이콘 50종 + VIP 무드 프리셋"
        price={990}
      />
    </div>
  );
};
