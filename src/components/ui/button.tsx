// src/components/ui/button.tsx
// Reusable Button Component

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

  const variantStyles = {
    default:
      "bg-[var(--primary)] text-white shadow-md shadow-blue-200 hover:-translate-y-0.5 hover:bg-[var(--primary-deep)] focus-visible:ring-[var(--primary)]",
    outline:
      "border border-[var(--line)] bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-[var(--primary)]",
    ghost:
      "text-slate-700 hover:bg-slate-100 focus-visible:ring-[var(--primary)]",
    destructive:
      "bg-[var(--danger)] text-white shadow-sm hover:-translate-y-0.5 hover:brightness-95 focus-visible:ring-[var(--danger)]",
  };

  const sizeStyles = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm sm:text-base",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}
