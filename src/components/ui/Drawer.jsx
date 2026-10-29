import React, { useEffect } from "react";
import { X } from "lucide-react";

export function Drawer({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  position = "right", // right | left
  width = "max-w-md",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && onClose) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 ${position === "right" ? "right-0" : "left-0"} flex w-full ${width} bg-[var(--bg-surface)] border-${position === "right" ? "l" : "r"} border-[var(--border-medium)] shadow-2xl transition-transform duration-250 ease-out z-10 flex-col animate-in ${position === "right" ? "slide-in-from-right" : "slide-in-from-left"}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
            {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
