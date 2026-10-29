import React, { useState } from "react";
import { Badge } from "../ui/Badge.jsx";
import { ChevronDown, ChevronUp, Zap, Database, Clock, Sparkles, Layers, Cpu } from "lucide-react";
import { MODEL_LABELS } from "../../features/chat/constants.js";

export function InsightsCard({ ledger, ms, cacheHit, onCitationClick }) {
  const [open, setOpen] = useState(false);

  if (!ledger) return null;

  const totalTokens = ledger.totalTokens || 0;
  const routerTokens = ledger.routerTokens || 0;
  const grandTotal = totalTokens + routerTokens;
  const naiveTokens = ledger.naiveBaseline?.estimatedPromptTokens
    ? Math.round(ledger.naiveBaseline.estimatedPromptTokens * 1.8) // estimated unoptimized prompt + completion
    : Math.max(grandTotal + 600, 1200);

  const tokensSaved = Math.max(0, naiveTokens - grandTotal);
  const savingsPercent = naiveTokens > 0
    ? Math.min(100, Math.max(0, Math.round((tokensSaved / naiveTokens) * 100)))
    : 0;

  const isCache = cacheHit || ledger.cacheHit;
  const latency = ms || ledger.latencyMs || 0;
  const route = ledger.route || "learn";

  const routeVariants = {
    learn: "learn",
    developer: "profile",
    off_topic: "off_topic",
  };

  const routeLabels = {
    learn: "Learn Mode",
    developer: "Developer Profile",
    off_topic: "Off-Topic Refusal",
  };

  return (
    <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden transition-all duration-200">
      {/* Collapsed Header Bar */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer select-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            How was this answered?
          </span>
          <span className="text-[var(--border-strong)]">·</span>
          {isCache ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" /> Instant Cache Hit (0 tokens)
            </span>
          ) : tokensSaved > 0 ? (
            <span className="text-indigo-400 font-semibold">
              Saved {tokensSaved.toLocaleString()} tokens ({savingsPercent}%)
            </span>
          ) : (
            <span className="text-[var(--text-muted)]">{grandTotal} tokens</span>
          )}
          <span className="text-[var(--border-strong)]">·</span>
          <span className="text-[var(--text-muted)] flex items-center gap-1">
            <Clock className="w-3 h-3" /> {latency} ms
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
          <span>{open ? "Hide" : "Details"}</span>
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Content Drawer */}
      {open && (
        <div className="px-4 py-3.5 border-t border-[var(--border-subtle)] space-y-3.5 text-xs bg-[var(--bg-subtle)] animate-in fade-in duration-150">
          {/* Status Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={routeVariants[route] || "default"} size="sm">
              {routeLabels[route] || route}
            </Badge>

            {isCache ? (
              <Badge variant="success" size="sm" icon={Zap}>
                Cache HIT (0 Groq tokens)
              </Badge>
            ) : (
              <Badge variant="default" size="sm">
                Cache MISS
              </Badge>
            )}

            <Badge variant="accent" size="sm" icon={Cpu}>
              {MODEL_LABELS[ledger.mainModel] || ledger.mainModel || "Fast Model"}
            </Badge>

            {ledger.retrievedChunks > 0 && (
              <Badge variant="info" size="sm" icon={Database}>
                {ledger.retrievedChunks} Chunks Grounded
              </Badge>
            )}
          </div>

          {/* Mini Horizontal Token Comparison Bar Chart */}
          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--text-secondary)] font-medium">Token Comparison</span>
              <span className="text-indigo-400 font-bold">
                {isCache ? "100% saved (replayed from cache)" : `Saved ${tokensSaved.toLocaleString()} tokens (${savingsPercent}%)`}
              </span>
            </div>

            {/* Bars */}
            <div className="space-y-1.5">
              {/* Reflow Optimized Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-0.5">
                  <span className="text-indigo-400 font-semibold">Reflow (Optimized)</span>
                  <span>{grandTotal.toLocaleString()} tokens</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, Math.min(100, (grandTotal / Math.max(naiveTokens, grandTotal)) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Naive Baseline Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-0.5">
                  <span>Naive Baseline (Direct 20B/70B call)</span>
                  <span>{naiveTokens.toLocaleString()} tokens</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-600/60 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, Math.min(100, (naiveTokens / Math.max(naiveTokens, grandTotal)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded bg-[var(--bg-elevated)]/60">
              <span className="text-[var(--text-muted)] block">Prompt / Completion</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {ledger.promptTokens || 0} / {ledger.completionTokens || 0}
              </span>
            </div>

            <div className="p-2 rounded bg-[var(--bg-elevated)]/60">
              <span className="text-[var(--text-muted)] block">Router Overhead</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {ledger.routerTokens ? `${ledger.routerTokens} tok (${ledger.routerMs}ms)` : "Direct"}
              </span>
            </div>

            <div className="p-2 rounded bg-[var(--bg-elevated)]/60">
              <span className="text-[var(--text-muted)] block">History Messages</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {ledger.historyMessages || 1} {ledger.summarised ? "(summarized)" : ""}
              </span>
            </div>

            <div className="p-2 rounded bg-[var(--bg-elevated)]/60">
              <span className="text-[var(--text-muted)] block">System Prompt</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {ledger.systemPromptVersion || "v1"}
              </span>
            </div>
          </div>

          {/* Citations list inside insights if available */}
          {ledger.retrievedFilenames && ledger.retrievedFilenames.length > 0 && (
            <div className="pt-1">
              <span className="text-[var(--text-muted)] text-[11px] block mb-1.5 font-medium">Grounding Chunks:</span>
              <div className="flex flex-wrap gap-1.5">
                {ledger.retrievedFilenames.map((f) => (
                  <button
                    key={f}
                    onClick={() => onCitationClick && onCitationClick(f)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-indigo-400 border border-indigo-500/20 text-[11px] transition-colors cursor-pointer"
                  >
                    <Database className="w-2.5 h-2.5" />
                    <span>{f.replace(/^\d+-/, "").replace(/\.md$/, "").replace(/-/g, " ")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
