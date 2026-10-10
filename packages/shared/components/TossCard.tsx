import React from "react";

interface TossCardProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg" | "none";
}

export const TossCard: React.FC<TossCardProps> = ({
  title,
  subtitle,
  badge,
  rightAction,
  children,
  className = "",
  onClick,
  padding = "md",
}) => {
  const paddingMap = {
    none: "p-0",
    sm: "p-3.5",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-toss shadow-toss border border-toss-border/40 transition overflow-hidden ${
        onClick ? "cursor-pointer active-press hover:shadow-tossHover" : ""
      } ${paddingMap[padding]} ${className}`}
    >
      {(title || badge || rightAction) && (
        <div className="flex items-start justify-between gap-2 mb-3.5 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {title && <h3 className="text-[16px] font-bold text-toss-text leading-snug break-keep">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-toss-muted mt-0.5 leading-relaxed break-keep">{subtitle}</p>}
          </div>
          {rightAction && <div className="shrink-0">{rightAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
