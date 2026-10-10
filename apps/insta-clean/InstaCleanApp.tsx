import React, { useState } from "react";
import { TossHeader, TossCard, TossButton, TossBadge, AdBanner, RewardedAdModal, TossPayModal } from "@shared/index";
import { Copy, Check, Sparkles, Music, Heart, Star, Type, AlignLeft, RefreshCw, Lock } from "lucide-react";
import confetti from "canvas-confetti";

interface InstaCleanAppProps {
  onBack?: () => void;
}

// Unicode font converter mappings
const FONT_MAPS: Record<string, { name: string; isVip?: boolean; convert: (text: string) => string }> = {
  script: {
    name: "감성 필기체 (Script)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy = "𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  boldScript: {
    name: "굵은 필기체 (Bold Script)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy = "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔩";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  fraktur: {
    name: "앤틱 고딕 (Fraktur)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy = "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  doubleStruck: {
    name: "더블 스트럭 (Blackboard)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const fancy = "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  circled: {
    name: "동그라미 영문 (Circled)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙ𝓀ⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  smallCaps: {
    name: "작은 대문자 (Small Caps)",
    convert: (str) => {
      const normal = "abcdefghijklmnopqrstuvwxyz";
      const fancy = "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ";
      return str.split("").map((c) => {
        const i = normal.indexOf(c.toLowerCase());
        return i !== -1 ? fancy[i] : c;
      }).join("");
    },
  },
  sansBold: {
    name: "산세리프 볼드 (Sans Bold)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy = "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  italic: {
    name: "이탤릭체 (Italic)",
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy = "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  bubbleBlack: {
    name: "블랙 버블 (Black Circled)",
    isVip: true,
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const fancy = "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩";
      return str.toUpperCase().split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
  monospace: {
    name: "타자기체 (Monospace)",
    isVip: true,
    convert: (str) => {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const fancy = "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿";
      return str.split("").map((c) => {
        const i = normal.indexOf(c);
        return i !== -1 ? fancy.slice(i * 2, i * 2 + 2) : c;
      }).join("");
    },
  },
};

const SYMBOLS_DATA = [
  {
    category: "음악 플레이어 (Music Player)",
    items: [
      "▶ ︎━━━━━━━ 02:40",
      "⏮ ︎ ⏸ ︎ ⏭ ︎",
      "ᴠᴏʟᴜᴍᴇ : ▮▮▮▮▮▯▯▯",
      "01:23 ───ㅇ───── 03:45",
      "↺ ︎  ◁ ︎  ❚❚  ▷ ︎  ↻ ︎",
    ],
  },
  {
    category: "하트 & 리본 (Cute Hearts)",
    items: [
      "˚₊·—̳͟͞͞♡",
      "˗ˋˏ ♡ ˎˊ˗",
      "୨୧",
      "( ˘ ³˘)♥",
      "ᰔᩚ",
      "ෆ",
      "♡̷̷̷",
      "˚ ༘♡ ⋆｡˚",
    ],
  },
  {
    category: "별 & 달 & 밤하늘 (Aesthetic Sky)",
    items: [
      "⋆⁺₊⋆ ☾ ⋆⁺₊⋆",
      "✩°｡⋆⸜ 🎧",
      "‧₊˚✧",
      "⋆.˚ ༘*",
      "☾⋆⁺₊⋆",
      "✧･ﾟ: *✧･ﾟ:*",
    ],
  },
  {
    category: "감성 구분선 (Dividers)",
    items: [
      "┈┈┈┈┈┈┈┈┈┈┈",
      "· · ─ ·𖥸· ─ · ·",
      "─────── ౨ৎ ───────",
      "˚₊· ͟͟͞͞➳❥",
      "────────────",
    ],
  },
];

export const InstaCleanApp: React.FC<InstaCleanAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"lineBreak" | "fonts" | "symbols">("lineBreak");
  
  // Line break states
  const [inputText, setInputText] = useState<string>(
    "오늘의 기록 ☕️\n\n바쁘고 정신없는 하루였지만\n좋아하는 커피 한 잔으로 충전 완료.\n\n내일도 파이팅! 🌿\n\n#일상 #카페투어 #오운완"
  );
  const [copiedLine, setCopiedLine] = useState(false);

  // Font states
  const [fontInput, setFontInput] = useState<string>("Aesthetic Mood");
  const [copiedFontKey, setCopiedFontKey] = useState<string | null>(null);

  // VIP / Monetization
  const [unlockedVip, setUnlockedVip] = useState(false);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);

  // Clean Line Break converter (Using Braille Pattern Blank U+2800)
  const formatInstaText = (text: string): string => {
    return text
      .split("\n")
      .map((line) => (line.trim() === "" ? "⠀" : line))
      .join("\n");
  };

  const handleCopyLineBreak = () => {
    const formatted = formatInstaText(inputText);
    navigator.clipboard.writeText(formatted);
    setCopiedLine(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLine(false), 2000);
  };

  const handleCopyFont = (key: string, converted: string) => {
    if (FONT_MAPS[key].isVip && !unlockedVip) {
      setAdModalOpen(true);
      return;
    }
    navigator.clipboard.writeText(converted);
    setCopiedFontKey(key);
    setTimeout(() => setCopiedFontKey(null), 1500);
  };

  const handleInsertSymbol = (sym: string) => {
    setInputText((prev) => prev + " " + sym);
    navigator.clipboard.writeText(sym);
    alert(`"${sym}" 특수문자가 복사되었고 본문에도 추가되었습니다!`);
  };

  const lineCount = inputText.split("\n").length;
  const charCountWithSpace = inputText.length;
  const charCountNoSpace = inputText.replace(/\s/g, "").length;

  return (
    <div className="min-h-screen bg-toss-bg pb-24">
      <TossHeader
        title="인스타 줄바꿈 감성 폰트"
        subtitle="줄바꿈 깨짐 방지 & 감성 영문 폰트"
        onBack={onBack}
        rightAction={<TossBadge variant="blue">클립보드 연동</TossBadge>}
      />

      {/* Segmented Control Tab */}
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex bg-gray-200/80 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab("lineBreak")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "lineBreak"
                ? "bg-white text-toss-text shadow-xs"
                : "text-toss-subtext hover:text-toss-text"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" /> 줄바꿈 변환
          </button>
          <button
            onClick={() => setActiveTab("fonts")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "fonts"
                ? "bg-white text-toss-text shadow-xs"
                : "text-toss-subtext hover:text-toss-text"
            }`}
          >
            <Type className="w-3.5 h-3.5" /> 감성 폰트
          </button>
          <button
            onClick={() => setActiveTab("symbols")}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === "symbols"
                ? "bg-white text-toss-text shadow-xs"
                : "text-toss-subtext hover:text-toss-text"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 특수문자
          </button>
        </div>

        {/* TAB 1: LINE BREAK */}
        {activeTab === "lineBreak" && (
          <div className="space-y-4">
            <TossCard
              title="인스타 캡션 작성"
              subtitle="엔터(줄바꿈)가 그대로 유지되어 인스타에 복사됩니다"
              badge={<TossBadge variant="green">공백 유지</TossBadge>}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="인스타에 올릴 글을 편하게 작성하세요. 빈 줄도 지워지지 않고 완벽히 보존됩니다."
                className="w-full h-44 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs leading-relaxed text-toss-text focus:outline-none focus:border-toss-blue transition resize-none"
              />

              {/* Stats Bar */}
              <div className="flex justify-between items-center text-[11px] text-toss-muted pt-2 border-t border-gray-100">
                <span>줄 수: <strong className="text-toss-text">{lineCount}줄</strong></span>
                <span>공백 포함: <strong className="text-toss-text">{charCountWithSpace}자</strong></span>
                <span>공백 제외: <strong className="text-toss-text">{charCountNoSpace}자</strong></span>
              </div>

              <div className="pt-3">
                <TossButton variant="primary" size="lg" onClick={handleCopyLineBreak}>
                  {copiedLine ? (
                    <span className="flex items-center justify-center gap-1">
                      <Check className="w-4 h-4 text-white" /> 인스타 복사 완료!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1">
                      <Copy className="w-4 h-4 text-white" /> 줄바꿈 적용 후 복사하기
                    </span>
                  )}
                </TossButton>
              </div>
            </TossCard>

            {/* Quick Caption Presets */}
            <TossCard title="✨ 1초 감성 캡션 템플릿">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  {
                    title: "☕️ 카페 감성",
                    text: "주말의 따뜻한 여유 ☕️\n\n햇살 가득한 공간에서\n좋아하는 책과 함께.\n\n#카페투어 #주말일상",
                  },
                  {
                    title: "✈️ 여행 일기",
                    text: "다시 오고 싶은 이곳 ✈️\n\n눈길 닿는 모든 풍경이 그림 같았던 날.\n잊지 못할 추억 하나 추가.\n\n#여행에미치다 #휴가",
                  },
                  {
                    title: "🌿 데일리 OOTD",
                    text: "오늘의 착장 🌿\n\n편안하면서도 깔끔하게.\n어디로든 떠나고 싶은 날씨.\n\n#OOTD #데일리룩",
                  },
                  {
                    title: "💪 오운완 챌린지",
                    text: "오늘도 해냈다 💪\n\n귀찮음을 이겨내고 운동 완료.\n내일의 나를 위해 땀 흘리기.\n\n#오운완 #헬스타그램",
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(preset.text);
                      confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
                    }}
                    className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition"
                  >
                    <span className="font-bold text-toss-text block mb-1">{preset.title}</span>
                    <span className="text-[11px] text-toss-muted line-clamp-2 leading-relaxed">
                      {preset.text}
                    </span>
                  </button>
                ))}
              </div>
            </TossCard>
          </div>
        )}

        {/* TAB 2: FANCY FONTS */}
        {activeTab === "fonts" && (
          <div className="space-y-4">
            <TossCard
              title="영문 텍스트 입력"
              subtitle="영어를 입력하면 20가지 감성 폰트로 실시간 변환됩니다"
            >
              <input
                type="text"
                value={fontInput}
                onChange={(e) => setFontInput(e.target.value)}
                placeholder="영문을 입력하세요 (예: Daily Life, Seoul)"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-toss-text focus:outline-none focus:border-toss-blue transition font-semibold"
              />
            </TossCard>

            <div className="space-y-2">
              {Object.entries(FONT_MAPS).map(([key, item]) => {
                const converted = item.convert(fontInput || "Aesthetic");
                const isCopied = copiedFontKey === key;
                const isLocked = item.isVip && !unlockedVip;

                return (
                  <div
                    key={key}
                    className="p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-toss-muted font-bold block mb-1 flex items-center gap-1">
                        {item.name}
                        {item.isVip && <TossBadge variant="purple">VIP</TossBadge>}
                      </span>
                      <p className="text-base font-medium text-toss-text truncate tracking-wide">
                        {converted}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyFont(key, converted)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isCopied
                          ? "bg-emerald-600 text-white"
                          : isLocked
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-toss-bg text-toss-subtext hover:bg-gray-200"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> 복사됨
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5" /> 해제
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> 복사
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {!unlockedVip && (
              <TossCard
                title="👑 VIP 감성 폰트 & 프리셋 잠금 해제"
                subtitle="모노스페이스, 블랙버블 등 모든 폰트 무제한 해제"
                badge={<TossBadge variant="purple">전체 해제</TossBadge>}
              >
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <TossButton variant="secondary" size="sm" onClick={() => setAdModalOpen(true)}>
                    광고 보고 무료 해제
                  </TossButton>
                  <TossButton variant="primary" size="sm" onClick={() => setPayModalOpen(true)}>
                    토스페이 990원 결제
                  </TossButton>
                </div>
              </TossCard>
            )}
          </div>
        )}

        {/* TAB 3: AESTHETIC SYMBOLS */}
        {activeTab === "symbols" && (
          <div className="space-y-4">
            {SYMBOLS_DATA.map((group, idx) => (
              <TossCard key={idx} title={group.category}>
                <div className="flex flex-wrap gap-2 pt-1">
                  {group.items.map((sym, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleInsertSymbol(sym)}
                      className="px-3 py-2 bg-gray-50 hover:bg-blue-50 hover:border-toss-blue border border-gray-200 rounded-xl text-xs text-toss-text font-medium transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{sym}</span>
                    </button>
                  ))}
                </div>
              </TossCard>
            ))}
          </div>
        )}

        <div className="pt-4">
          <AdBanner
            title="인스타 사진 촬영 감성 조명 기획전"
            subtitle="자연광 느낌 무드등 & 삼각대 최대 45% 할인"
          />
        </div>
      </div>

      <RewardedAdModal
        isOpen={adModalOpen}
        rewardTitle="VIP 감성 폰트 10종 & 피드 캡션 템플릿 잠금 해제"
        onClose={() => setAdModalOpen(false)}
        onRewarded={() => {
          setUnlockedVip(true);
          confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        }}
      />

      <TossPayModal
        isOpen={payModalOpen}
        productTitle="인스타 크리에이터 감성 폰트 & 특수문자 VIP 패스"
        price={990}
        onClose={() => setPayModalOpen(false)}
        onSuccess={() => {
          setUnlockedVip(true);
        }}
      />
    </div>
  );
};
