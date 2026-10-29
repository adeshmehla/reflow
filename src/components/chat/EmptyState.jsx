import React from "react";
import { Logo } from "../ui/Logo.jsx";
import { Sparkles, Layers, ShieldCheck, Zap, ArrowUpRight, Cpu, UserCheck } from "lucide-react";

export function EmptyState({ onSelectQuestion, onSelectProfile, noServer }) {
  const cards = [
    {
      title: "Explain the critical rendering path",
      desc: "How browsers construct DOM, CSSOM, and render tree pixels",
      prompt: "Explain the Critical Rendering Path and how HTML parsing gets blocked by script tags.",
      icon: Layers,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "useMemo vs useCallback",
      desc: "When to use each, memoization pitfalls, and React render cycles",
      prompt: "Explain useMemo vs useCallback with practical examples of when to use which and common pitfalls.",
      icon: Cpu,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    },
    {
      title: "How do I improve Core Web Vitals?",
      desc: "Target thresholds and strategies for LCP, INP, and CLS",
      prompt: "What are Core Web Vitals (LCP, INP, CLS) and what are their good threshold targets and fixes?",
      icon: Zap,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Tell me about Adesh",
      desc: "Skills, WebToday experience, and engineering background",
      prompt: "Who is Adesh Mehla, what are his core technical skills, and what did he build at WebToday?",
      icon: UserCheck,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      isProfile: true,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* Brand & Friendly Header */}
      <div className="mb-3">
        <Logo size="lg" showTagline={false} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-2">
        What do you want to build or learn today?
      </h1>

      <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
        Your frontend engineering copilot with BM25 knowledge retrieval, sub-400ms intent routing, and verified developer profile mode.
      </p>

      {/* 2x2 Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full mb-8 text-left">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.title}
              disabled={noServer}
              onClick={() => {
                if (c.isProfile && onSelectProfile) {
                  onSelectProfile(c.prompt);
                } else {
                  onSelectQuestion(c.prompt);
                }
              }}
              className="group p-4 rounded-[var(--radius-lg)] bg-[var(--bg-card)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className={`p-2 rounded-[var(--radius-md)] border ${c.color} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trust Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)] w-full">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Grounded in 30 curated notes with sources</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Off-topic questions blocked instantly</span>
        </div>
      </div>
    </div>
  );
}
