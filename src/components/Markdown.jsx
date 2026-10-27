import { memo, useState } from "react";

/* ---------- clipboard helper ---------- */
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
}

export function CopyButton({ text, label = "Copy", className = "ia-link small" }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={className}
      onClick={async () => {
        if (await copyText(text)) { setDone(true); setTimeout(() => setDone(false), 1500); }
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

/* ---------- inline markdown: code, bold, links ---------- */
function Inline({ text }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return parts.map((p, i) => {
    if (p.length > 1 && p.startsWith("`") && p.endsWith("`")) return <code key={i}>{p.slice(1, -1)}</code>;
    if (p.length > 3 && p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (m) return <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>;
    return p;
  });
}

/* ---------- block-level markdown renderer ---------- */
const LI = /^\s*([-*]|\d+\.)\s+/;
const isRow = (l) => /^\s*\|.*\|\s*$/.test(l);

function Blocks({ text }) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^#{1,4}\s+(.*)/))) {
      out.push(<h4 key={i}><Inline text={m[1]} /></h4>);
      i++;
      continue;
    }
    if (isRow(l) && lines[i + 1] && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (s) => s.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const start = i;
      const head = cells(l);
      i += 2;
      const rows = [];
      while (i < lines.length && isRow(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        <div className="md-table" key={start}>
          <table>
            <thead><tr>{head.map((h, j) => <th key={j}><Inline text={h} /></th>)}</tr></thead>
            <tbody>{rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k}><Inline text={c} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      continue;
    }
    if (LI.test(l)) {
      const start = i;
      const Tag = /^\s*\d+\./.test(l) ? "ol" : "ul";
      const items = [];
      while (i < lines.length && LI.test(lines[i])) items.push(lines[i++].replace(LI, ""));
      out.push(<Tag key={start}>{items.map((it, j) => <li key={j}><Inline text={it} /></li>)}</Tag>);
      continue;
    }
    const start = i;
    const buf = [l];
    i++;
    while (i < lines.length && lines[i].trim() && !/^#{1,4}\s/.test(lines[i]) && !LI.test(lines[i]) && !isRow(lines[i])) buf.push(lines[i++]);
    out.push(<p key={start}><Inline text={buf.join(" ")} /></p>);
  }
  return out;
}

/* ---------- full markdown component (handles fenced code blocks) ---------- */
export const Markdown = memo(function Markdown({ text }) {
  const segs = [];
  const re = /```([\w+-]*)[^\n]*\n?([\s\S]*?)(```|$)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ code: false, v: text.slice(last, m.index) });
    segs.push({ code: true, lang: m[1], v: m[2].replace(/\n$/, "") });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ code: false, v: text.slice(last) });
  return (
    <div className="md">
      {segs.map((s, i) =>
        s.code ? (
          <figure className="md-code" key={i}>
            <figcaption>
              <span>{s.lang || "code"}</span>
              <CopyButton text={s.v} className="md-copy" />
            </figcaption>
            <pre><code>{s.v}</code></pre>
          </figure>
        ) : (
          <Blocks key={i} text={s.v} />
        )
      )}
    </div>
  );
});
