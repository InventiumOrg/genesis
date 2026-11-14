import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "h-9 px-3.5 text-[13px]",
    md: "h-10 px-4 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-900 text-white hover:bg-brand-800 active:bg-brand-950 disabled:bg-gray-300 dark:bg-brand-500 dark:hover:bg-brand-400 dark:disabled:bg-gray-700",
    outline:
      "bg-white text-gray-800 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 active:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-white/[0.04] dark:hover:text-white",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-semibold whitespace-nowrap transition-colors duration-150 ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
