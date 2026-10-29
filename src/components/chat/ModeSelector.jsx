import React from "react";
import { Sparkles, BookOpen, UserCheck } from "lucide-react";
import { Tooltip } from "../ui/Tooltip.jsx";

export function ModeSelector({ mode = "auto", onChange, className = "" }) {
  const modes = [
    {
      id: "auto",
      label: "Auto",
      icon: Sparkles,
      desc: "Reflow picks the best mode for you automatically",
      badgeColor: "text-[var(--text-primary)]",
    },
    {
      id: "learn",
      label: "Learn",
      icon: BookOpen,
      desc: "Frontend engineering concepts, code help & debugging",
      badgeColor: "text-[var(--text-primary)]",
    },
    {
      id: "developer",
      label: "Profile",
      icon: UserCheck,
      desc: "Ask about the developer (Adesh Mehla)",
      badgeColor: "text-emerald-400",
    },
  ];

  return (
    <div
      role="group"
      aria-label="Select chat mode"
      className={`inline-flex items-center p-1 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] ${className}`}
    >
      {modes.map((m) => {
        const Icon = m.icon;
        const active = mode === m.id;

        return (
          <Tooltip key={m.id} content={m.desc} position="bottom">
            <button
              type="button"
              onClick={() => onChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-all duration-150 cursor-pointer select-none whitespace-nowrap shrink-0 ${
                active
                  ? "bg-[var(--bg-base)] text-[var(--text-primary)] shadow-xs border border-[var(--border-subtle)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{m.label}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
