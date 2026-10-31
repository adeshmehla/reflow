import React, { useState } from "react";
import { CheckCircle2, AlertCircle, HelpCircle, Copy, Check, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "../ui/Badge.jsx";
import { useToast } from "../ui/Toast.jsx";

export function JobMatchCard({ data, onCitationClick }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [showAllReqs, setShowAllReqs] = useState(false);

  if (!data) return null;

  const {
    role = "Role Evaluation",
    fit = "Partial",
    score = 0,
    summary = "",
    requirements = [],
    strengths = [],
    gaps = [],
  } = data;

  const fitConfig = {
    Strong: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      label: "Strong Fit",
    },
    Good: {
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/30",
      label: "Good Fit",
    },
    Partial: {
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      label: "Partial Fit",
    },
    Weak: {
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      label: "Weak Fit",
    },
  };

  const currentFit = fitConfig[fit] || fitConfig.Partial;

  // Circular progress calculation (r = 28, circumference = 2 * PI * 28 ≈ 175.93)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const handleCopySummary = async () => {
    const md = `### Job Match Evaluation: ${role}
**Overall Fit:** ${fit} (${score}/100)

${summary}

#### Top Strengths:
${strengths.map((s) => `- ${s}`).join("\n")}

#### Gaps / Areas Not Documented:
${gaps.map((g) => `- ${g}`).join("\n")}

#### Requirements Breakdown:
${requirements
  .map(
    (r) =>
      `- [${(r.status || "not_found").toUpperCase()}] **${r.text}** (${r.priority} have): ${r.evidence} [${r.source}]`
  )
  .join("\n")}
`;
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      toast?.success?.("Match summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast?.error?.("Failed to copy summary.");
    }
  };

  const displayedRequirements = showAllReqs ? requirements : requirements.slice(0, 6);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 sm:p-5 my-2 shadow-sm text-left">
      {/* Top Header Card: Role, Circular Score & Fit Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Job Match Assessment
            </span>
            <span
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentFit.bg} ${currentFit.color} ${currentFit.border}`}
            >
              {currentFit.label}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {role}
          </h3>
        </div>

        {/* Circular Match Score Gauge */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 68 68">
              <circle
                cx="34"
                cy="34"
                r={radius}
                className="text-[var(--bg-elevated)]"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="34"
                cy="34"
                r={radius}
                className={`${currentFit.color} transition-all duration-700 ease-out`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-[var(--text-primary)] leading-none">
                {score}%
              </span>
              <span className="text-[9px] text-[var(--text-muted)] font-medium">Match</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
            title="Copy formatted markdown summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy summary"}</span>
          </button>
        </div>
      </div>

      {/* Summary Narrative */}
      {summary && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed py-3 border-b border-[var(--border-subtle)]">
          {summary}
        </p>
      )}

      {/* Requirements Table */}
      <div className="py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Requirements Breakdown ({requirements.length})
          </h4>
          <span className="text-[11px] text-[var(--text-muted)]">
            Grounding: Profile Evidence
          </span>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-subtle)]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                <th className="py-2 px-3 font-semibold w-1/3">Requirement</th>
                <th className="py-2 px-2.5 font-semibold w-24">Status</th>
                <th className="py-2 px-3 font-semibold">Profile Evidence & Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {displayedRequirements.map((r, i) => {
                const status = (r.status || "not_found").toLowerCase();
                const isMatch = status === "match";
                const isPartial = status === "partial";

                return (
                  <tr key={i} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-2.5 px-3 align-top font-medium text-[var(--text-primary)]">
                      <div className="flex items-start gap-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded shrink-0 mt-0.5 ${
                            r.priority === "nice"
                              ? "bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                              : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                          }`}
                        >
                          {r.priority === "nice" ? "Nice" : "Must"}
                        </span>
                        <span className="leading-snug">{r.text}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-2.5 align-top">
                      {isMatch ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                          Match
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          Partial
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] whitespace-nowrap">
                          <HelpCircle className="w-3 h-3 shrink-0" />
                          Not Found
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 align-top text-[var(--text-secondary)] leading-relaxed">
                      <div>{r.evidence || "Not documented in candidate profile."}</div>
                      {r.source && r.source !== "not_found" && (
                        <div className="mt-1 flex items-center gap-1 flex-wrap">
                          {r.source.split(",").map((src) => {
                            const trimmed = src.trim();
                            const label = trimmed.replace(/^\d+-/, "").replace(/\.md$/, "").replace(/-/g, " ");
                            return (
                              <button
                                key={trimmed}
                                type="button"
                                onClick={() => onCitationClick && onCitationClick(trimmed)}
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer capitalize"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {requirements.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllReqs(!showAllReqs)}
            className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-medium"
          >
            {showAllReqs ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show fewer requirements</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show all {requirements.length} requirements</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Strengths and Gaps 2-column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {/* Strengths */}
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Top Strengths</span>
          </div>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-none pl-0">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-snug">
                <span className="text-emerald-400 font-bold shrink-0">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Gaps / Not in Profile</span>
          </div>
          <ul className="text-xs text-[var(--text-secondary)] space-y-1.5 list-none pl-0">
            {gaps.map((g, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-snug">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
