import React, { useState, useEffect } from "react";
import {
  FaceShapeInfo,
  HairOption,
  HairColorOption,
  GlassesOption,
  GlassesColorOption,
  StylingCompatibility,
} from "./catalog";
import {
  createShareText,
  renderShareCardCanvas,
} from "./engine";
import confetti from "canvas-confetti";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  faceShape: FaceShapeInfo;
  hair: HairOption;
  hairColor: HairColorOption;
  glasses: GlassesOption;
  glassesColor: GlassesColorOption;
  compatibility: StylingCompatibility;
  userPhotoUrl: string | null;
  svgElement: SVGSVGElement | null;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  faceShape,
  hair,
  hairColor,
  glasses,
  glassesColor,
  compatibility,
  userPhotoUrl,
  svgElement,
}) => {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCardImage(null);
      setCopied(false);
      setDownloaded(false);
      return;
    }

    // 축하 컨페티 효과
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    // 캔버스 이미지 생성
    setIsGenerating(true);

    let avatarSvgString: string | undefined = undefined;
    if (svgElement && !userPhotoUrl) {
      const cloned = svgElement.cloneNode(true) as SVGSVGElement;
      // 핸들 및 점선 제거 (완성된 깨끗한 아바타만 포토카드에 포함)
      cloned.querySelector("#sculptHandles")?.remove();
      cloned.querySelector("#glassesTransformBox")?.remove();
      cloned.querySelector("#hairTransformBox")?.remove();

      const serializer = new XMLSerializer();
      avatarSvgString = serializer.serializeToString(cloned);
    }

    renderShareCardCanvas({
      faceName: faceShape.name,
      hairName: hair.name,
      hairColorName: hairColor.name,
      glassesName: glasses.name,
      glassesColorName: glassesColor.name,
      score: compatibility.score,
      badge: compatibility.badge,
      userPhotoUrl: userPhotoUrl,
      avatarSvgString: avatarSvgString,
    })
      .then((dataUrl) => {
        setCardImage(dataUrl);
      })
      .catch((err) => {
        console.error("포토카드 생성 오류:", err);
      })
      .finally(() => {
        setIsGenerating(false);
      });
  }, [isOpen, faceShape, hair, hairColor, glasses, glassesColor, compatibility, userPhotoUrl, svgElement]);

  if (!isOpen) return null;

  const shareText = createShareText(
    faceShape.name,
    hair.name,
    hairColor.name,
    glasses.name,
    glassesColor.name,
    compatibility
  );

  // 친구에게 공유하기 (Web Share API 또는 클립보드)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[토스 페이스핏] ${faceShape.name} 맞춤 스타일링`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // user cancelled or failed, fall through to copy
      }
    }

    handleCopyText();
  };

  // 포토카드 이미지 파일 다운로드
  const handleDownload = () => {
    if (!cardImage) return;
    const a = document.createElement("a");
    a.href = cardImage;
    a.download = `facefit-${faceShape.id}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  // 투표 텍스트 복사
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 모달 상단 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-[#3182F6]" />
            </div>
            <div>
              <h3 className="font-bold text-[#191F28] text-base">친구에게 스타일 투표받기</h3>
              <p className="text-xs text-slate-500">인스타 스토리 & 카톡 공유 포토카드</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 포토카드 미리보기 */}
          <div className="relative w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50 aspect-[2/3] flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <div className="w-8 h-8 border-3 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-600 font-medium">고해상도 포토카드 렌더링 중...</span>
              </div>
            ) : cardImage ? (
              <img
                src={cardImage}
                alt="페이스핏 투표 카드"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-xs text-slate-400">이미지를 불러올 수 없습니다.</div>
            )}
          </div>

          {/* 투표 질문 가이드 박스 */}
          <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <MessageCircle className="w-4 h-4 text-[#3182F6]" />
              <span>친구에게 물어볼 투표 질문</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              "내 얼굴형에 맞춘 <strong>{hair.name}</strong> + <strong>{glasses.name}</strong> 어때? 찰떡 vs 딴거해 투표해줘!"
            </p>
          </div>

          {/* 공유 액션 버튼 그룹 */}
          <div className="space-y-2 pt-1">
            {/* 1. 토스/카톡 친구에게 공유 */}
            <button
              onClick={handleShare}
              className="w-full py-3.5 bg-[#3182F6] active:bg-[#1b64da] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>친구에게 바로 공유하고 투표받기</span>
            </button>

            {/* 2. 포토카드 이미지 저장 & 텍스트 복사 2분할 */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                disabled={!cardImage}
                className="py-3 px-3 bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-slate-600" />}
                <span>{downloaded ? "저장 완료!" : "포토카드 저장"}</span>
              </button>

              <button
                onClick={handleCopyText}
                className="py-3 px-3 bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? "문구 복사 완료!" : "투표 문구 복사"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 모달 푸터 알림 */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            인스타그램 스토리 공유 시 더 많은 친구들의 투표를 받을 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
};
