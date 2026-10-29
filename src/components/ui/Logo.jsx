import React from "react";

export function Logo({ size = "md", showTagline = false, className = "" }) {
  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-base font-bold",
    md: "text-lg font-bold tracking-tight",
    lg: "text-2xl font-extrabold tracking-tight",
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Reflow Logo Mark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]} rounded-[var(--radius-md)] bg-[var(--text-primary)] text-[var(--bg-base)] p-1.5`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
          <path d="M12 2v4" />
          <path d="m16.2 7.8 2.9-2.9" />
          <path d="M18 12h4" />
          <path d="m16.2 16.2 2.9 2.9" />
          <path d="M12 18v4" />
          <path d="m4.9 19.1 2.9-2.9" />
          <path d="M2 12h4" />
          <path d="m4.9 4.9 2.9 2.9" />
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`text-[var(--text-primary)] ${textSizes[size]}`}>
          Reflow
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium text-[var(--text-muted)] -mt-0.5 tracking-normal">
            Your frontend engineering copilot
          </span>
        )}
      </div>
    </div>
  );
}
