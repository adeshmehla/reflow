import React, { useEffect, useState } from "react";
import { Search, Plus, Sparkles, BookOpen, User, Sun, Moon, BarChart3, HelpCircle, X, ArrowRight } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";

export function CommandPalette({
  isOpen,
  onClose,
  onNewChat,
  onSelectChat,
  onSwitchMode,
  convos,
  onOpenShortcuts,
}) {
  const [query, setQuery] = useState("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: "new_chat",
      label: "Start New Chat",
      category: "Navigation",
      icon: Plus,
      run: () => { onNewChat(); onClose(); },
    },
    {
      id: "mode_auto",
      label: "Switch to Auto Mode",
      category: "Modes",
      icon: Sparkles,
      run: () => { onSwitchMode("auto"); onClose(); },
    },
    {
      id: "mode_learn",
      label: "Switch to Learn Mode (Frontend)",
      category: "Modes",
      icon: BookOpen,
      run: () => { onSwitchMode("learn"); onClose(); },
    },
    {
      id: "mode_profile",
      label: "Switch to Developer Profile Mode",
      category: "Modes",
      icon: User,
      run: () => { onSwitchMode("developer"); onClose(); },
    },
    {
      id: "toggle_theme",
      label: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      category: "Appearance",
      icon: theme === "dark" ? Sun : Moon,
      run: () => { toggleTheme(); onClose(); },
    },
    {
      id: "open_eval",
      label: "Open /eval Benchmark Dashboard",
      category: "Tools",
      icon: BarChart3,
      run: () => { window.open("/eval", "_blank"); onClose(); },
    },
    {
      id: "open_shortcuts",
      label: "Keyboard Shortcuts Reference",
      category: "Help",
      icon: HelpCircle,
      run: () => { if (onOpenShortcuts) onOpenShortcuts(); onClose(); },
    },
  ];

  const matchedActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const matchedChats = convos
    .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Modal */}
      <div
        className="relative w-full max-w-lg rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-medium)] shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search chats..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {matchedActions.length > 0 && (
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Actions
            </div>
          )}
          {matchedActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.run}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)]">{item.category}</span>
              </button>
            );
          })}

          {matchedChats.length > 0 && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-t border-[var(--border-subtle)] mt-2">
                Recent Chats
              </div>
              {matchedChats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { onSelectChat(c.id); onClose(); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
                >
                  <span className="truncate pr-4">{c.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                </button>
              ))}
            </>
          )}

          {matchedActions.length === 0 && matchedChats.length === 0 && (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching commands or conversations for "{query}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>Navigation: <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd></span>
          <span>Select: <kbd className="font-mono">ENTER</kbd></span>
          <span>Dismiss: <kbd className="font-mono">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
}
