import React from "react";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "royal";

type Size = "sm" | "md" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-900",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400",
  ghost:
    "text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-600",
  royal:
    "bg-[#d4af37] text-black hover:brightness-95 focus:ring-2 focus:ring-[#d4af37]",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
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
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${
        sizeStyles[size]
      } ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && leftIcon}
      {!loading && children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
