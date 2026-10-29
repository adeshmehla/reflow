import React, { useState } from "react";
import { Markdown, CopyButton } from "../Markdown.jsx";
import { Badge } from "../ui/Badge.jsx";
import { InsightsCard } from "./InsightsCard.jsx";
import { ProfileNotFoundCard } from "./ProfileCard.jsx";
import { OffTopicRefusalCard } from "./FriendlyStates.jsx";
import { TypingDots } from "../ui/Skeleton.jsx";
import { RotateCw, ThumbsUp, ThumbsDown, FileText, Check, User } from "lucide-react";
import { useToast } from "../ui/Toast.jsx";

export function MessageItem({
  message,
  isLast,
  isLastAssistant,
  busy,
  onRegenerate,
  onCitationClick,
  onSelectPrompt,
}) {
  const toast = useToast();
  const [feedback, setFeedback] = useState(null); // "up" | "down" | null
  const isUser = message.role === "user";

  const handleFeedback = (type) => {
    setFeedback(type);
    toast.success(type === "up" ? "Thanks for the positive feedback!" : "Feedback noted.");
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-5 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap select-text">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant Message
  const ledger = message.ledger;
  const route = ledger?.route || "learn";
  const content = message.content || "";
  const isGenerating = busy && isLast && !content;
  const isProfileNotFound = content.includes("That information is not in the profile.");
  const isOffTopicRefusal = route === "off_topic" || content.includes("frontend engineering specialist. I can only help with HTML");

  const routeBadges = {
    learn: { label: "Learn", variant: "learn" },
    developer: { label: "Profile", variant: "profile" },
    off_topic: { label: "Off-Topic", variant: "off_topic" },
  };

  return (
    <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-150 group">
      {/* Reflow Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-medium)] flex items-center justify-center text-[var(--text-primary)] mt-0.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
          <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.4" />
          <path d="M12 2v4" />
          <path d="M18 12h4" />
          <path d="M12 18v4" />
          <path d="M2 12h4" />
        </svg>
      </div>

      {/* Main Body */}
      <div className="flex-1 min-w-0 max-w-[720px] text-sm">
        {/* Top Meta: Sender & Mode Badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-xs text-[var(--text-primary)]">Reflow</span>
          {routeBadges[route] && (
            <Badge variant={routeBadges[route].variant} size="sm">
              {routeBadges[route].label}
            </Badge>
          )}
        </div>

        {/* Message Content */}
        <div className="leading-relaxed text-[var(--text-secondary)]">
          {isGenerating ? (
            <TypingDots />
          ) : isProfileNotFound ? (
            <ProfileNotFoundCard onSelectPrompt={onSelectPrompt} />
          ) : isOffTopicRefusal ? (
            <OffTopicRefusalCard onSelectPrompt={onSelectPrompt} />
          ) : (
            <Markdown text={content} />
          )}
        </div>

        {/* Grounded Citation Chips */}
        {message.sources && message.sources.length > 0 && !isGenerating && (
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-[var(--text-muted)] flex items-center gap-1 mr-1">
              <FileText className="w-3 h-3 text-[var(--text-muted)]" />
              Sources:
            </span>
            {message.sources.map((src) => {
              const label = src.replace(/^\d+-/, "").replace(/\.md$/, "").replace(/-/g, " ");
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => onCitationClick && onCitationClick(src)}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 cursor-pointer shadow-xs capitalize"
                  title={`View grounded note: ${src}`}
                >
                  <FileText className="w-3 h-3 shrink-0 text-[var(--text-muted)]" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Star Feature: Token Savings Insights Card */}
        {ledger && !isGenerating && (
          <InsightsCard
            ledger={ledger}
            ms={message.ms}
            cacheHit={ledger.cacheHit}
            onCitationClick={onCitationClick}
          />
        )}

        {/* Hover Action Bar (Copy, Regenerate, Thumbs) */}
        {!isGenerating && content && (
          <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs">
            <CopyButton text={content} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />

            {isLastAssistant && !busy && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                title="Regenerate this response"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleFeedback("up")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                feedback === "up"
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => handleFeedback("down")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                feedback === "down"
                  ? "text-rose-400 bg-rose-500/10"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
              title="Poor response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
