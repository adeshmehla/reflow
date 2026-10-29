import React, { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

export function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "Enter", desc: "Send message" },
    { key: "Shift + Enter", desc: "Insert newline in composer" },
    { key: "Ctrl / ⌘ + K", desc: "Open Command Palette & Chat Search" },
    { key: "Escape", desc: "Stop streaming generation or close modal" },
    { key: "?", desc: "Open keyboard shortcuts reference" },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-medium)] p-6 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-base text-[var(--text-primary)]">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs py-1.5">
              <span className="text-[var(--text-secondary)]">{s.desc}</span>
              <kbd className="px-2 py-1 font-mono text-xs font-semibold rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-xs text-[var(--text-muted)]">
          Press <kbd className="font-mono">ESC</kbd> to return to your chat.
        </div>
      </div>
    </div>
  );
}
