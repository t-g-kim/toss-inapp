import React from "react";
import { X, ExternalLink, ShoppingBag, ShieldCheck, Zap, Truck, Tag } from "lucide-react";
import { getPurchaseLinks } from "./catalog";

interface PurchaseModalProps {
  isOpen: boolean;
  partName: string;
  price?: number;
  categoryLabel?: string;
  buyUrl?: string;
  danawaUrl?: string;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  partName,
  price,
  categoryLabel,
  buyUrl,
  danawaUrl,
  onClose,
}) => {
  if (!isOpen) return null;

  const links = getPurchaseLinks(partName, buyUrl, danawaUrl);

  const platforms = [
    {
      id: "danawa",
      name: "다나와 (Danawa)",
      tag: "PC 부품 1위",
      tagColor: "bg-blue-100 text-blue-700",
      desc: "카드/현금 최저가 비교 & 실시간 가격 추이 그래프",
      url: links.danawa,
      icon: Tag,
    },
    {
      id: "naver",
      name: "네이버 쇼핑 (Naver)",
      tag: "최저가 비교",
      tagColor: "bg-emerald-100 text-emerald-700",
      desc: "수백 개 쇼핑몰 최저가 비교 & 네이버페이 적립",
      url: links.naver,
      icon: ShoppingBag,
    },
    {
      id: "coupang",
      name: "쿠팡 (Coupang)",
      tag: "로켓배송",
      tagColor: "bg-rose-100 text-rose-700",
      desc: "내일 바로 도착하는 로켓와우 배송 & 안심 반품",
      url: links.coupang,
      icon: Truck,
    },
    {
      id: "compuzone",
      name: "컴퓨존 (Compuzone)",
      tag: "100% 정품",
      tagColor: "bg-purple-100 text-purple-700",
      desc: "국내 최대 조립PC 전문몰 & 공식 유통사 정품 보증",
      url: links.compuzone,
      icon: ShieldCheck,
    },
  ];

  const handleOpenLink = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl flex flex-col border border-gray-100 overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-gray-100 flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 bg-blue-50 text-toss-blue text-[10px] font-bold rounded-full whitespace-nowrap">
                {categoryLabel || "부품 구매"}
              </span>
              <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">실시간 최저가 검색</span>
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-tight whitespace-nowrap truncate">{partName}</h3>
            {price !== undefined && (
              <p className="text-xs text-blue-600 font-bold mt-0.5 whitespace-nowrap">
                기준 시세 약 {price.toLocaleString()}원
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform List */}
        <div className="p-4 space-y-2.5 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-1 whitespace-nowrap truncate">
            원하시는 쇼핑 플랫폼을 선택하시면 최저가 검색 페이지로 바로 연결됩니다.
          </p>

          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => handleOpenLink(p.url)}
                className="w-full p-3.5 rounded-2xl border border-gray-200/80 hover:border-toss-blue bg-white hover:bg-blue-50/30 transition text-left flex items-center justify-between group active:scale-[0.99] shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-blue-100/60 text-gray-700 group-hover:text-toss-blue flex items-center justify-center shrink-0 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-gray-900 group-hover:text-toss-blue transition whitespace-nowrap">
                        {p.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 whitespace-nowrap ${p.tagColor}`}>
                        {p.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5 whitespace-nowrap">{p.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-2 text-gray-400 group-hover:text-toss-blue transition">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-500 leading-relaxed whitespace-nowrap truncate">
            * 각 플랫폼의 최신 가격 및 재고 상황은 실시간 판매처 사정에 따라 변동될 수 있습니다.
          </p>
          <p className="text-[9px] text-gray-400 mt-1 whitespace-nowrap truncate">
            * 이 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
          <button
            onClick={onClose}
            className="mt-2.5 w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition whitespace-nowrap"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
