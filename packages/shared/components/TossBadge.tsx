import React from "react";

interface TossBadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "red" | "orange" | "purple" | "gray";
  size?: "sm" | "md";
  className?: string;
}

export const TossBadge: React.FC<TossBadgeProps> = ({
  children,
  variant = "blue",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    blue: "bg-toss-blueLight text-toss-blue border-blue-200/50",
    green: "bg-toss-greenLight text-toss-green border-green-200/50",
    red: "bg-toss-redLight text-toss-red border-red-200/50",
    orange: "bg-toss-orangeLight text-toss-orange border-orange-200/50",
    purple: "bg-toss-purpleLight text-toss-purple border-purple-200/50",
    gray: "bg-gray-100 text-toss-subtext border-gray-200/60",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] font-semibold rounded-md border",
    md: "px-2.5 py-1 text-xs font-semibold rounded-lg border",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 shrink-0 whitespace-nowrap select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
