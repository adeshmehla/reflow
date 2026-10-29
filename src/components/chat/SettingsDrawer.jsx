import React, { useState } from "react";
import { Drawer } from "../ui/Drawer.jsx";
import { Switch } from "../ui/Switch.jsx";
import { Button } from "../ui/Button.jsx";
import { RotateCcw, Sliders, Cpu, Zap, Shield, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { DEFAULTS, MODEL_LABELS } from "../../features/chat/constants.js";

export function SettingsDrawer({ isOpen, onClose, settings, setSetting, models, onReset }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggles = [
    {
      key: "useRouter",
      label: "Cheap LLM Router",
      desc: "Fast intent classification via small model. Refuses off-topic questions in <400ms without calling main 20B/27B model.",
      icon: Zap,
    },
    {
      key: "useRag",
      label: "BM25 Knowledge Retrieval (RAG)",
      desc: "Scores 30 curated frontend notes and injects strictly the top 3 relevant chunks with source citations.",
      icon: Sparkles,
    },
    {
      key: "useCache",
      label: "In-Memory Response Cache",
      desc: "Replays repeated queries in 0 tokens and <5ms latency.",
      icon: Zap,
    },
    {
      key: "useSummary",
      label: "Rolling Turn Summaries",
      desc: "Condenses older conversation turns when history grows, saving context tokens.",
      icon: Sliders,
    },
    {
      key: "useTrimming",
      label: "Prompt Trimming",
      desc: "Truncates oversized user messages to protect against context blowouts.",
      icon: Shield,
    },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[var(--text-primary)]" />
          <span>Reflow Settings</span>
        </div>
      }
      subtitle="Configure model parameters and token-saving optimizations"
      width="max-w-lg"
    >
      <div className="space-y-6">
        {/* Token Optimizations Group */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Token Savers & Optimizations
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Active by default</span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] bg-[var(--bg-elevated)]/40 p-3">
            {toggles.map(({ key, label, desc }) => (
              <Switch
                key={key}
                label={label}
                description={desc}
                checked={!!settings[key]}
                onChange={(val) => setSetting(key, val)}
              />
            ))}
          </div>
        </div>

        {/* Model Selection Group */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Model & Generation Controls
          </h3>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
              <span>Primary Answer Model</span>
              <Cpu className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </label>
            <select
              value={settings.model}
              onChange={(e) => setSetting("model", e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-strong)] cursor-pointer"
            >
              {models.map((o) => (
                <option key={o.value} value={o.value}>
                  {MODEL_LABELS[o.value] || o.value}
                </option>
              ))}
            </select>
          </div>

          {/* Max Tokens */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
              <span>Max Output Tokens Per Turn</span>
              <span className="text-[var(--text-primary)] font-mono font-medium">{settings.maxTokens} tok</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[300, 600, 900, 1800].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSetting("maxTokens", n)}
                  className={`text-xs py-1.5 rounded-[var(--radius-sm)] font-medium border transition-colors cursor-pointer ${
                    settings.maxTokens === n
                      ? "bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent"
                      : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Developer Section */}
        <div className="border border-[var(--border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)]/60 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" />
              Advanced Architecture Parameters
            </span>
            {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="p-3.5 space-y-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] animate-in fade-in duration-150">
              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>Temperature (Sampling Creativity)</span>
                  <span className="font-mono text-[var(--text-primary)] font-medium">{settings.temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSetting("temperature", Number(e.target.value))}
                  className="w-full accent-[var(--text-primary)] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                  <span>0.0 (Deterministic / Code)</span>
                  <span>0.7 (Balanced)</span>
                  <span>1.5 (Creative)</span>
                </div>
              </div>

              {/* Session Token Budget */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-[var(--text-secondary)] block">
                  Session Token Budget Guard
                </span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Reflow tracks real cumulative session spend and warns near 50,000 tokens to protect your API limits.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reset to Defaults Footer */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all settings and token savers to system defaults?")) {
                Object.keys(DEFAULTS).forEach((k) => setSetting(k, DEFAULTS[k]));
                if (onReset) onReset();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to defaults</span>
          </button>

          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
