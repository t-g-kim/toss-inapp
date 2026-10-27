import React from "react";
import { X, ExternalLink, ShoppingBag, Truck, Tag, Home, Sparkles } from "lucide-react";
import { getPurchaseLinks, DeskPartOption } from "./catalog";

interface PurchaseModalProps {
  isOpen: boolean;
  part?: DeskPartOption;
  categoryLabel?: string;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  part,
  categoryLabel,
  onClose,
}) => {
  if (!isOpen || !part) return null;

  const links = getPurchaseLinks(part.name, part.buyUrl, part.danawaUrl, part.searchQuery);

  const platforms = [
    {
      id: "coupang",
      name: "쿠팡 (Coupang)",
      tag: "로켓배송 최저가",
      tagColor: "bg-rose-100 text-rose-700 font-bold",
      desc: "내일 바로 도착하는 로켓와우 배송 & 안심 무료 반품",
      url: links.coupang,
      icon: Truck,
      highlight: true,
    },
    {
      id: "ohou",
      name: "오늘의집 (Ohou)",
      tag: "데스크테리어 1위",
      tagColor: "bg-sky-100 text-sky-700 font-bold",
      desc: "인테리어 사진 후기 & 스타일링 팁 및 첫구매 할인",
      url: links.ohou,
      icon: Home,
    },
    {
      id: "danawa",
      name: "다나와 (Danawa)",
      tag: "최저가 비교",
      tagColor: "bg-blue-100 text-blue-700 font-bold",
      desc: "쇼핑몰별 카드/현금 최저가 비교 & 실시간 가격 추이",
      url: links.danawa,
      icon: Tag,
    },
    {
      id: "naver",
      name: "네이버 쇼핑 (Naver)",
      tag: "네이버페이",
      tagColor: "bg-emerald-100 text-emerald-700 font-bold",
      desc: "수백 개 쇼핑몰 최저가 비교 & 네이버페이 포인트 적립",
      url: links.naver,
      icon: ShoppingBag,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full shadow-2xl flex flex-col border border-gray-100 overflow-hidden max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-gray-100 flex items-start justify-between bg-gradient-to-b from-blue-50/40 to-white">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="px-2 py-0.5 bg-blue-100 text-toss-blue text-[11px] font-bold rounded-full">
                {categoryLabel || "데스크 상품"}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">실시간 최저가 구매</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
              {part.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-extrabold text-toss-blue">
                {part.price.toLocaleString()}원
              </span>
              <span className="text-[11px] text-gray-400">기준 시세 · 검색어: {links.searchQuery}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{part.specs}</p>
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
          <p className="text-xs text-gray-500 mb-1">
            원하시는 쇼핑 플랫폼을 누르면 최저가 검색 및 구매 페이지로 즉시 연결됩니다:
          </p>

          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full p-3.5 rounded-2xl border transition text-left flex items-center justify-between group active:scale-[0.99] shadow-2xs no-underline ${
                  p.highlight
                    ? "border-rose-300 bg-rose-50/60 hover:bg-rose-100/70 hover:border-rose-500 ring-1 ring-rose-200/60"
                    : "border-gray-200/80 hover:border-toss-blue bg-white hover:bg-blue-50/30"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
                      p.highlight
                        ? "bg-rose-500 text-white shadow-2xs"
                        : "bg-gray-100 group-hover:bg-blue-100/60 text-gray-700 group-hover:text-toss-blue"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-extrabold transition ${
                          p.highlight
                            ? "text-rose-700 group-hover:text-rose-800"
                            : "text-gray-900 group-hover:text-toss-blue"
                        }`}
                      >
                        {p.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${p.tagColor}`}>
                        {p.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">{p.desc}</p>
                  </div>
                </div>

                <div
                  className={`shrink-0 pl-2 transition flex items-center gap-1 text-xs font-bold ${
                    p.highlight
                      ? "text-rose-600 group-hover:text-rose-700"
                      : "text-gray-400 group-hover:text-toss-blue"
                  }`}
                >
                  {p.highlight && <span className="text-[11px]">바로가기</span>}
                  <ExternalLink className="w-4 h-4" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Footer legal info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            * 각 플랫폼의 최신 가격 및 배송 재고는 실시간 판매처 사정에 따라 변동될 수 있습니다.
          </p>
          <p className="text-[9px] text-gray-400 mt-1">
            * 이 링크는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
          </p>
          <button
            onClick={onClose}
            className="mt-2.5 w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl transition"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
