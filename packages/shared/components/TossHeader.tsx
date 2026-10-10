import React from "react";
import { ChevronLeft } from "lucide-react";

interface TossHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export const TossHeader: React.FC<TossHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  transparent = false,
}) => {
  return (
    <header
      className={`sticky top-0 z-40 flex items-center justify-between px-4 h-14 ${
        transparent ? "bg-transparent" : "bg-white/90 backdrop-blur-md border-b border-toss-border/60"
      }`}
    >
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-toss-text hover:bg-toss-bg rounded-full active:scale-95 transition"
            aria-label="뒤로가기"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          <h1 className="text-[17px] font-bold text-toss-text leading-tight">{title}</h1>
          {subtitle && <p className="text-[11px] text-toss-muted">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div className="flex items-center">{rightAction}</div>}
    </header>
  );
};
