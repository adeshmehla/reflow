import React, { useState } from "react";

export function Tooltip({ children, content, position = "top", className = "" }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-[var(--radius-sm)] shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${positions[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}
