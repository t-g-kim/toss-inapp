import React, { useState } from "react";
import { ExternalLink, Info, X } from "lucide-react";

interface AdBannerProps {
  placement?: "bottom" | "inline";
  title?: string;
  subtitle?: string;
  actionText?: string;
  url?: string;
  onClick?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placement = "inline",
  title = "KB국민은행 매일 이자 받는 파킹통장",
  subtitle = "연 최고 3.5% 금리 혜택 지금 바로 확인하세요",
  actionText = "[광고] 바로가기",
  url,
  onClick,
}) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-blue-50/90 border border-blue-200/60 rounded-2xl p-3.5 transition shadow-sm ${
        placement === "bottom" ? "sticky bottom-4 mx-4 z-30" : "my-4"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <span className="bg-slate-800 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
            광고
          </span>
          <span className="text-gray-500 font-semibold">스폰서 외부 링크</span>
        </div>
        <button
          onClick={() => setClosed(true)}
          className="text-gray-400 hover:text-gray-600 p-0.5"
          aria-label="광고 닫기"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-gray-900 truncate">{title}</h4>
          <p className="text-xs text-gray-600 truncate mt-0.5">{subtitle}</p>
        </div>
        {url && !onClick ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition active:scale-95 shadow-sm whitespace-nowrap cursor-pointer no-underline"
          >
            <span>{actionText}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <button
            onClick={() => {
              if (onClick) {
                onClick();
              } else if (url) {
                if (typeof window !== "undefined") {
                  window.open(url, "_blank", "noopener,noreferrer");
                }
              } else {
                alert("[스폰서 광고] 외부 안내 페이지로 이동합니다.");
              }
            }}
            className="shrink-0 flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition active:scale-95 shadow-sm whitespace-nowrap cursor-pointer"
          >
            <span>{actionText}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
