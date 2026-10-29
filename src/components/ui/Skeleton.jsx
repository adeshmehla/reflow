import React from "react";

export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] ${className}`}
      {...props}
    />
  );
}

export function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1" role="status" aria-label="Reflow is thinking">
      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" />
    </div>
  );
}
