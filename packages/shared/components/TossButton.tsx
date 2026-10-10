import React from "react";

interface TossButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const TossButton: React.FC<TossButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = true,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition active-press select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-4 py-3 text-[15px] rounded-2xl",
    lg: "px-5 py-4 text-[17px] rounded-2xl font-bold",
  };

  const variantStyles = {
    primary: "bg-toss-blue text-white hover:bg-toss-blueDark shadow-sm shadow-toss-blue/20",
    secondary: "bg-toss-blueLight text-toss-blue hover:bg-blue-100",
    dark: "bg-toss-text text-white hover:bg-black",
    danger: "bg-toss-red text-white hover:bg-red-600",
    outline: "border border-toss-border bg-white text-toss-text hover:bg-toss-bg",
  };

  const disabledStyles = disabled || loading ? "opacity-45 cursor-not-allowed pointer-events-none" : "";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>처리 중...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};
