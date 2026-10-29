import React, { useEffect, useState } from "react";
import { Drawer } from "../ui/Drawer.jsx";
import { Markdown } from "../Markdown.jsx";
import { FileText, Copy, Check, ExternalLink } from "lucide-react";

export function CitationsDrawer({ filename, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filename || !isOpen) return;

    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/knowledge/file?name=${encodeURIComponent(filename)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load knowledge note");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setContent(data.content || "");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filename, isOpen]);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = filename
    ? filename.replace(/^\d+-/, "").replace(/\.md$/, "").replace(/-/g, " ")
    : "Knowledge Note";

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 capitalize">
          <FileText className="w-4 h-4 text-[var(--text-primary)]" />
          <span>{displayName}</span>
        </div>
      }
      subtitle={`Source: knowledge/${filename?.startsWith("0") && filename?.includes("about") ? "profile" : "frontend"}/${filename}`}
      width="max-w-xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          <span>Grounding knowledge retrieved by BM25</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Note"}</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 py-6">
            <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse w-3/4" />
            <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse w-full" />
            <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse w-5/6" />
            <div className="h-32 bg-[var(--bg-elevated)] rounded-lg animate-pulse w-full mt-4" />
          </div>
        ) : error ? (
          <div className="p-4 rounded-[var(--radius-md)] bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-sm leading-relaxed">
            <Markdown text={content} />
          </div>
        )}
      </div>
    </Drawer>
  );
}
