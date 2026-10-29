import React from "react";
import { Badge } from "../ui/Badge.jsx";
import { Mail, Sparkles, Briefcase } from "lucide-react";

function GithubIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m1.4 9.74v-8.37H5.06v8.37z" />
    </svg>
  );
}

export function ProfileCard({ onSelectPrompt }) {
  const skills = ["React.js", "JavaScript (ES6+)", "Wix Velo", "REST APIs", "LLM / RAG Systems", "TypeScript (6/10)"];
  const chips = [
    { label: "Skills", prompt: "What are Adesh's strongest technical skills?" },
    { label: "Projects", prompt: "What notable projects has Adesh worked on?" },
    { label: "Experience", prompt: "Explain Adesh's work experience at WebToday and Optminds." },
    { label: "Education", prompt: "What is Adesh's educational background?" },
    { label: "Contact", prompt: "How can I contact Adesh regarding frontend engineering opportunities?" },
  ];

  return (
    <div className="mb-6 rounded-[var(--radius-lg)] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/10 via-[var(--bg-card)] to-[var(--bg-card)] p-5 shadow-lg backdrop-blur-sm animate-in fade-in duration-250">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3.5">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-lg text-white shadow-md">
              AM
            </div>
            <span
              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-surface)]"
              title="Verified Profile Mode"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Adesh Mehla</h2>
              <Badge variant="profile" size="sm">
                Candidate Profile Active
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Frontend Developer (Developer & Technical Advisory)
            </p>
          </div>
        </div>

        {/* Contact & Social Links */}
        <div className="flex items-center gap-2">
          <a
            href="mailto:bemehla@gmail.com"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Email</span>
          </a>

          <a
            href="https://github.com/adeshmehla"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>

          <a
            href="https://linkedin.com/in/adeshmehla"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors"
          >
            <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>

      {/* Skills Pill Tags */}
      <div className="pt-3 pb-3">
        <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1.5">
          Verified Core Competencies:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 text-xs rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Recruiter Quick Suggestion Chips */}
      <div className="pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1 mb-2">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Click a topic to ask Reflow:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {chips.map(({ label, prompt }) => (
            <button
              key={label}
              onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
              className="text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-emerald-500/20 hover:text-emerald-300 border border-emerald-500/20 text-[var(--text-secondary)] transition-all cursor-pointer text-left"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileNotFoundCard({ onSelectPrompt }) {
  const suggestions = [
    "What are Adesh's technical skills and experience?",
    "Explain the Plumbline delivery fee calculator project.",
    "What did Adesh build at WebToday?",
    "How does his personal Reflow LLM project work?",
  ];

  return (
    <div className="p-4 rounded-[var(--radius-md)] border border-amber-500/30 bg-amber-500/10 text-[var(--text-primary)] space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
          !
        </span>
        <span className="font-semibold text-sm text-amber-300">
          That information is not in the profile.
        </span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
        Reflow enforces strict anti-hallucination guardrails and will never guess unverified personal details, private salary expectations, or unrecorded background data.
      </p>
      <div>
        <span className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5 uppercase tracking-wider">
          Verified topics you can ask:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSelectPrompt && onSelectPrompt(s)}
              className="text-xs px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-indigo-400 border border-[var(--border-subtle)] transition-colors cursor-pointer text-left"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
