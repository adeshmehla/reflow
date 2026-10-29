import React from "react";
import { Compass, Sparkles, RefreshCw, AlertTriangle, Server, ShieldAlert } from "lucide-react";

export function OffTopicRefusalCard({ onSelectPrompt }) {
  const suggestions = [
    "Explain how React reconciliation diffing works with virtual DOM keys.",
    "What is the difference between microtasks and macrotasks in the event loop?",
    "How can I improve Core Web Vitals (LCP, INP, and CLS)?",
  ];

  return (
    <div className="p-4 rounded-[var(--radius-md)] border border-rose-500/20 bg-rose-500/10 text-[var(--text-primary)] space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <Compass className="w-3.5 h-3.5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-rose-300">Frontend Domain Specialist</h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Reflow is scoped specifically to frontend engineering and the developer profile. Unrelated questions are filtered to preserve token budgets.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-rose-500/15">
        <span className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5 uppercase tracking-wider">
          Try asking a frontend engineering question instead:
        </span>
        <div className="flex flex-col gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSelectPrompt && onSelectPrompt(s)}
              className="text-xs px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-indigo-400 border border-[var(--border-subtle)] transition-colors cursor-pointer text-left flex items-center gap-2"
            >
              <Sparkles className="w-3 h-3 shrink-0 text-indigo-400" />
              <span>{s}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ColdStartNotice({ onRetry }) {
  return (
    <div className="p-4 rounded-[var(--radius-md)] border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-[var(--bg-elevated)] to-violet-500/10 text-[var(--text-primary)] flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 animate-spin">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            Waking up the cloud server...
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            Free-tier instances spin down on inactivity. This takes ~20–30s on first load.
          </div>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] text-indigo-400 border border-indigo-500/30 transition-colors cursor-pointer shrink-0 font-medium"
        >
          Check Again
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({ error, onRetry, isRetrying }) {
  const isRateLimit = error?.toLowerCase().includes("rate limit") || error?.includes("429");

  return (
    <div className="mb-3 p-3.5 rounded-[var(--radius-md)] border border-rose-500/30 bg-rose-500/10 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
        <div>
          <span className="font-semibold block text-rose-300">
            {isRateLimit ? "Groq API Rate Limit Reached" : "Request Error"}
          </span>
          <span className="text-rose-200/80">
            {isRateLimit
              ? "Free-tier token quota exceeded for this minute. Auto-retrying with exponential backoff..."
              : error}
          </span>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold border border-rose-500/40 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
          <span>{isRateLimit ? "Retry Now" : "Retry"}</span>
        </button>
      )}
    </div>
  );
}
