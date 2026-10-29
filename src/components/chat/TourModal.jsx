import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button.jsx";
import { Sparkles, Database, Zap, Check, ArrowRight, X } from "lucide-react";

export function TourModal() {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("reflow_tour_seen");
      if (!seen) setIsOpen(true);
    } catch { }
  }, []);

  const closeTour = () => {
    setIsOpen(false);
    try {
      localStorage.setItem("reflow_tour_seen", "true");
    } catch { }
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Reflow",
      subtitle: "Your specialized frontend engineering copilot",
      desc: "Reflow is engineered for frontend developers. It knows modern React, TypeScript, Core Web Vitals, CSS architecture, browser rendering, and accessibility with grounding from 30 curated notes.",
      icon: Sparkles,
    },
    {
      title: "Intelligent Routing & Token Savers",
      subtitle: "Save up to 70% tokens on every turn",
      desc: "Our lightweight router automatically classifies your question. Off-topic questions are refused in <400ms without touching the main model, while an in-memory cache returns repeated questions in 0 tokens and <5ms.",
      icon: Zap,
    },
    {
      title: "Verified Developer Profile Mode",
      subtitle: "Recruiter-ready technical profile",
      desc: "Switch to Developer Profile mode to ask about Adesh Mehla's verified skills, work at WebToday, commercial projects, and engineering experience with strict anti-hallucination guardrails.",
      icon: Database,
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in" onClick={closeTour} />
      <div className="relative w-full max-w-md rounded-[var(--radius-xl)] bg-[var(--bg-surface)] border border-[var(--border-medium)] p-7 shadow-2xl z-10 space-y-6 animate-in zoom-in-95 duration-200">
        <button
          onClick={closeTour}
          className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label="Skip tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Visual */}
        <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-primary)]">
          <Icon className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{current.title}</h3>
          <p className="text-xs font-medium text-[var(--text-secondary)]">{current.subtitle}</p>
          <p className="text-xs text-[var(--text-muted)] pt-2 leading-relaxed">{current.desc}</p>
        </div>

        {/* Dots & Nav */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === step ? "w-6 bg-[var(--text-primary)]" : "w-1.5 bg-[var(--border-strong)]"
                  }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={closeTour}
              className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
            >
              Skip
            </button>
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={closeTour} icon={Check}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
