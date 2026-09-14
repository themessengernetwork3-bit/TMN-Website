"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-brand-green to-brand-green-light text-white shadow-md shadow-brand-green/25 hover:shadow-lg hover:shadow-brand-green/30 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:hover:shadow-brand-green/25",
  secondary:
    "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
  ghost: "text-brand-green hover:bg-brand-green/10",
  danger: "text-red-600 hover:bg-red-50",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    />
  );
}
