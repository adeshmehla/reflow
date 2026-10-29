import React, { memo, useState } from "react";
import { Copy, Check, Terminal, Info } from "lucide-react";

/* ---------- Clipboard Helper ---------- */
async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({ text, label = "Copy", className = "" }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer select-none ${className}`}
      onClick={async () => {
        if (await copyText(text)) {
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        }
      }}
      title="Copy to clipboard"
    >
      {done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{done ? "Copied" : label}</span>
    </button>
  );
}

/* ---------- Inline Markdown: code, bold, links ---------- */
function Inline({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return parts.map((p, i) => {
    if (p.length > 1 && p.startsWith("`") && p.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 text-xs font-mono rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium"
        >
          {p.slice(1, -1)}
        </code>
      );
    }
    if (p.length > 3 && p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--text-primary)]">
          {p.slice(2, -2)}
        </strong>
      );
    }
    const m = p.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (m) {
      return (
        <a
          key={i}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--text-primary)] underline underline-offset-2 decoration-[var(--border-strong)] hover:opacity-80 transition-opacity"
        >
          {m[1]}
        </a>
      );
    }
    return p;
  });
}

/* ---------- Block-Level Markdown Renderer ---------- */
const LI = /^\s*([-*]|\d+\.)\s+/;
const isRow = (l) => /^\s*\|.*\|\s*$/.test(l);

function Blocks({ text }) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) {
      i++;
      continue;
    }

    // Callout / Blockquote
    if (l.startsWith("> ")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2).trim());
        i++;
      }
      out.push(
        <div
          key={`quote-${i}`}
          className="my-3 p-3.5 rounded-[var(--radius-md)] border-l-2 border-[var(--border-strong)] bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] flex items-start gap-2.5"
        >
          <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-medium text-[var(--text-primary)] block text-xs">Note</span>
            <Inline text={quoteLines.join(" ")} />
          </div>
        </div>
      );
      continue;
    }

    // Headings
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) {
      const level = m[1].length;
      const headingText = m[2];
      const tags = {
        1: "text-lg font-bold text-[var(--text-primary)] mt-4 mb-2 pb-1 border-b border-[var(--border-subtle)]",
        2: "text-base font-bold text-[var(--text-primary)] mt-3.5 mb-1.5",
        3: "text-sm font-semibold text-[var(--text-primary)] mt-3 mb-1",
        4: "text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mt-2.5 mb-1",
      };
      out.push(
        <div key={i} className={tags[level] || tags[3]}>
          <Inline text={headingText} />
        </div>
      );
      i++;
      continue;
    }

    // Table
    if (isRow(l) && lines[i + 1] && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (s) =>
        s
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
      const start = i;
      const head = cells(l);
      i += 2;
      const rows = [];
      while (i < lines.length && isRow(lines[i])) {
        rows.push(cells(lines[i++]));
      }
      out.push(
        <div className="my-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-x-auto bg-[var(--bg-card)]" key={start}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)]">
                {head.map((h, j) => (
                  <th key={j} className="px-3.5 py-2 font-semibold text-[var(--text-primary)]">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rows.map((r, j) => (
                <tr key={j} className="hover:bg-[var(--bg-hover)] transition-colors">
                  {r.map((c, k) => (
                    <td key={k} className="px-3.5 py-2 text-[var(--text-secondary)]">
                      <Inline text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Lists (ordered or unordered)
    if (LI.test(l)) {
      const start = i;
      const isOrdered = /^\s*\d+\./.test(l);
      const items = [];
      while (i < lines.length && LI.test(lines[i])) {
        items.push(lines[i++].replace(LI, ""));
      }
      out.push(
        isOrdered ? (
          <ol key={start} className="my-2.5 pl-5 list-decimal space-y-1 text-sm text-[var(--text-secondary)]">
            {items.map((it, j) => (
              <li key={j} className="pl-1">
                <Inline text={it} />
              </li>
            ))}
          </ol>
        ) : (
          <ul key={start} className="my-2.5 pl-5 list-disc space-y-1 text-sm text-[var(--text-secondary)]">
            {items.map((it, j) => (
              <li key={j} className="pl-1">
                <Inline text={it} />
              </li>
            ))}
          </ul>
        )
      );
      continue;
    }

    // Paragraph
    const start = i;
    const buf = [l];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !lines[i].startsWith("> ") &&
      !LI.test(lines[i]) &&
      !isRow(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    out.push(
      <p key={start} className="my-2 text-sm text-[var(--text-secondary)] leading-relaxed">
        <Inline text={buf.join(" ")} />
      </p>
    );
  }
  return out;
}

/* ---------- Full Markdown Component (Fenced Code Blocks) ---------- */
export const Markdown = memo(function Markdown({ text }) {
  if (!text) return null;

  const segs = [];
  const re = /```([\w+-]*)[^\n]*\n?([\s\S]*?)(```|$)/g;
  let last = 0;
  let m;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      segs.push({ code: false, v: text.slice(last, m.index) });
    }
    segs.push({ code: true, lang: m[1] || "code", v: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    segs.push({ code: false, v: text.slice(last) });
  }

  return (
    <div className="space-y-1 text-[var(--text-primary)]">
      {segs.map((s, i) =>
        s.code ? (
          <div
            key={i}
            className="my-3.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[#0D1117] overflow-hidden shadow-md font-mono text-xs"
          >
            {/* Code Block Header */}
            <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-300">
                  {s.lang}
                </span>
              </div>
              <CopyButton text={s.v} />
            </div>

            {/* Code Content */}
            <pre className="p-4 overflow-x-auto leading-relaxed text-slate-200">
              <code>{s.v}</code>
            </pre>
          </div>
        ) : (
          <Blocks key={i} text={s.v} />
        )
      )}
    </div>
  );
});
