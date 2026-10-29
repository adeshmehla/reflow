import React from "react";

export function Badge({
  children,
  variant = "default", // default | learn | profile | off_topic | success | warning | danger | info | accent
  size = "md", // sm | md
  icon: Icon,
  className = "",
}) {
  const base = "inline-flex items-center font-medium uppercase tracking-wider rounded-full transition-colors whitespace-nowrap";

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
  };

  const variants = {
    default: "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]",
    learn: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
    profile: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    off_topic: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    accent: "bg-[var(--accent-subtle)] text-indigo-400 border border-[var(--accent-border)]",
    info: "bg-sky-500/10 text-sky-400 border border-sky-500/30",
  };

  return (
    <span className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
