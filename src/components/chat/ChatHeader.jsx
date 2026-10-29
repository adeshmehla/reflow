import React, { useState } from "react";
import { ModeSelector } from "./ModeSelector.jsx";
import { Tooltip } from "../ui/Tooltip.jsx";
import { Menu, Settings, Sparkles, Edit3, Check, Zap } from "lucide-react";

export function ChatHeader({
  title,
  onRename,
  chatMode,
  onModeChange,
  onOpenSettings,
  onOpenSidebar,
  sessionTokens = 0,
  maxBudget = 50000,
  savingsPercent = 64,
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title || "New Chat");

  const handleSave = () => {
    if (draftTitle.trim() && onRename) onRename(draftTitle.trim());
    setEditing(false);
  };

  const budgetRatio = Math.min(1, sessionTokens / maxBudget);
  const budgetColor =
    budgetRatio > 0.85
      ? "bg-rose-500"
      : budgetRatio > 0.65
      ? "bg-amber-500"
      : "bg-[var(--text-primary)]";

  return (
    <header className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] z-20 gap-3">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="p-1.5 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] lg:hidden cursor-pointer"
          aria-label="Toggle conversation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Chat Title (Click to rename) */}
        {editing ? (
          <div className="flex items-center gap-1.5 max-w-xs">
            <input
              autoFocus
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") setEditing(false);
              }}
              onBlur={handleSave}
              className="text-sm font-medium px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:outline-none"
            />
            <button onClick={handleSave} className="p-1 text-[var(--text-primary)] hover:opacity-80 cursor-pointer">
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => {
              setDraftTitle(title || "Reflow Copilot");
              setEditing(true);
            }}
            className="group flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)] cursor-pointer truncate"
            title="Click to rename"
          >
            <span className="truncate">{title || "Reflow Copilot"}</span>
            <Edit3 className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        )}
      </div>

      {/* Center: Mode Segmented Control */}
      <div className="hidden sm:flex justify-center">
        <ModeSelector mode={chatMode} onChange={onModeChange} />
      </div>

      {/* Right: Session Savings Badge, Budget Bar, Settings Gear */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Session Savings Badge */}
        <Tooltip
          content="Reflow saves tokens via our fast classifier router, local BM25 RAG, in-memory caching, and context trimming."
          position="bottom"
        >
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-secondary)] cursor-help select-none">
            <Sparkles className="w-3 h-3 text-[var(--text-muted)]" />
            <span>Session savings: {savingsPercent}%</span>
          </div>
        </Tooltip>

        {/* Session Token Budget Indicator */}
        <Tooltip
          content={`Session token spend: ${sessionTokens.toLocaleString()} / ${maxBudget.toLocaleString()} tokens`}
          position="bottom"
        >
          <div className="hidden xl:flex flex-col gap-1 w-24 cursor-help">
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
              <span>Budget</span>
              <span>{Math.round(budgetRatio * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className={`h-full ${budgetColor} transition-all duration-300`}
                style={{ width: `${Math.min(100, budgetRatio * 100)}%` }}
              />
            </div>
          </div>
        </Tooltip>

        {/* Settings Button */}
        <Tooltip content="Settings & Token Savers" position="bottom">
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-all cursor-pointer"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
