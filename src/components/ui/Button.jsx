import React from "react";

export function Button({
  children,
  variant = "primary", // primary | secondary | ghost | outline | danger
  size = "md", // sm | md | lg | icon
  disabled = false,
  loading = false,
  className = "",
  onClick,
  type = "button",
  title,
  icon: Icon,
  ...props
}) {
  const base = "inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] gap-1.5",
    md: "text-sm px-3.5 py-2 rounded-[var(--radius-md)] gap-2",
    lg: "text-base px-5 py-2.5 rounded-[var(--radius-lg)] gap-2.5",
    icon: "p-2 rounded-[var(--radius-md)] aspect-square",
    "icon-sm": "p-1.5 rounded-[var(--radius-sm)] aspect-square",
  };

  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:brightness-110 shadow-[var(--shadow-glow)] border border-indigo-400/30",
    secondary: "bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)]",
    ghost: "bg-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    outline: "bg-transparent border border-[var(--border-medium)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)]",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
    accent: "bg-[var(--accent-subtle)] hover:bg-[var(--accent-glow)] text-indigo-400 border border-[var(--accent-border)]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      title={title}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
