import { CopyButton, Markdown } from "../../components/Markdown.jsx";
import { CHAT_MODES, MODEL_LABELS } from "./constants.js";
import { useChat } from "./useChat.js";

/* ── Token Ledger sub-component ─────────────────────────────────────────────── */
function TokenLedger({ ledger, ms, cacheHit }) {
  if (!ledger) return null;
  const rows = [
    { label: "Route", value: ledger.route || "—" },
    { label: "Router", value: ledger.routerTokens ? `${ledger.routerTokens} tok · ${ledger.routerMs} ms · ${ledger.routerModel || MODEL_LABELS[ledger.routerModel] || ledger.routerModel}` : "skipped" },
    { label: "Retrieved", value: ledger.retrievedChunks ? `${ledger.retrievedChunks} chunks` : "none" },
    { label: "History", value: `${ledger.historyMessages} msgs${ledger.summarised ? " (summarised)" : ""}` },
    { label: "Prompt tokens", value: ledger.promptTokens || 0 },
    { label: "Completion tokens", value: ledger.completionTokens || 0 },
    { label: "Total tokens", value: ledger.totalTokens || 0 },
    { label: "Model", value: ledger.mainModel || "—" },
    { label: "Latency", value: `${ledger.latencyMs} ms` },
    { label: "Cache", value: (cacheHit || ledger.cacheHit) ? "✓ HIT" : "MISS" },
    { label: "vs. Naive baseline", value: ledger.naiveBaseline?.estimatedPromptTokens ? `~${ledger.naiveBaseline.estimatedPromptTokens} prompt tok (no savings)` : "—" },
  ];
  return (
    <details className="ia-ledger">
      <summary>Token Ledger · {ledger.totalTokens} tok · {ms ? `${(ms / 1000).toFixed(1)} s` : `${ledger.latencyMs} ms`}</summary>
      <table>
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label}>
              <td className="ia-ledger-k">{label}</td>
              <td className="ia-ledger-v">{String(value)}</td>
            </tr>
          ))}
          {ledger.systemPromptVersion && (
            <tr>
              <td className="ia-ledger-k">System prompt</td>
              <td className="ia-ledger-v">{ledger.systemPromptVersion}</td>
            </tr>
          )}
        </tbody>
      </table>
    </details>
  );
}

/* ── Sources sub-component ───────────────────────────────────────────────────── */
function Sources({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="ia-sources">
      <span className="ia-sources-label">Sources:</span>
      {sources.map((s) => (
        <span key={s} className="ia-source-tag">{s.replace(/^\d+-/, "").replace(/.md$/, "").replace(/-/g, " ")}</span>
      ))}
    </div>
  );
}

/* ── Optimisation toggles ────────────────────────────────────────────────────── */
function OptimisationPanel({ settings, setSetting }) {
  const toggles = [
    { key: "useRouter", label: "Router", desc: "Classify & refuse off-topic cheaply" },
    { key: "useRag", label: "RAG", desc: "Retrieve relevant knowledge chunks" },
    { key: "useCache", label: "Cache", desc: "Return cached response for repeated queries" },
    { key: "useSummary", label: "Summary", desc: "Summarise old turns to save tokens" },
    { key: "useTrimming", label: "Trim", desc: "Truncate long messages" },
  ];
  return (
    <div className="ia-opt-grid">
      {toggles.map(({ key, label, desc }) => (
        <label key={key} className="ia-opt-toggle" title={desc}>
          <input
            type="checkbox"
            checked={!!settings[key]}
            onChange={(e) => setSetting(key, e.target.checked)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

/* ── Main Chat component ─────────────────────────────────────────────────────── */
export default function Chat() {
  const {
    convos, active, messages, settings, models, server,
    draft, setDraft, busy, error, query, setQuery,
    sideOpen, setSideOpen, panel, setPanel, editing, setEditing,
    renaming, setRenaming, away, chatMode, setChatMode,
    scrollRef, fieldRef, searchRef,
    model, shown, starters, lastIsUser, lastAssistantId, noServer,
    send, stop, regenerate, retry, submitEdit, newChat, openChat, removeChat, wipe, onScroll,
    setSetting,
  } = useChat();

  return (
    <div className="ia">
      <style>{css}</style>

      {/* ── Sidebar ── */}
      <aside className={`ia-side ${sideOpen ? "open" : ""}`} aria-label="Conversations">
        <div className="ia-brand"><span className="ia-mark" aria-hidden="true" />Frontend AI</div>
        <button className="ia-new" onClick={newChat}>New chat</button>
        <input
          ref={searchRef}
          className="ia-search"
          type="search"
          placeholder="Search chats  (Ctrl/Cmd + K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search conversations"
        />
        <ul className="ia-list">
          {shown.map((c) => (
            <li key={c.id} className={c.id === active?.id ? "on" : ""}>
              {renaming === c.id ? (
                <input
                  className="ia-rename"
                  autoFocus
                  defaultValue={c.title}
                  aria-label="Chat name"
                  onBlur={() => setRenaming(null)}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") setRenaming(null); }}
                />
              ) : (
                <>
                  <button className="ia-conv" onClick={() => openChat(c.id)} aria-current={c.id === active?.id}>{c.title}</button>
                  <span className="ia-acts">
                    <button onClick={() => setRenaming(c.id)} aria-label={`Rename ${c.title}`}>Rename</button>
                    <button onClick={() => removeChat(c)} aria-label={`Delete ${c.title}`}>Delete</button>
                  </span>
                </>
              )}
            </li>
          ))}
          {convos.length > 0 && shown.length === 0 && <li className="ia-none">No chats match "{query}".</li>}
          {convos.length === 0 && <li className="ia-none">Your chats will appear here.</li>}
        </ul>
        <div className="ia-side-foot">
          <p>Chats are saved only in this browser.</p>
          {convos.length > 0 && <button className="ia-link" onClick={wipe}>Delete all data</button>}
        </div>
      </aside>
      {sideOpen && <button className="ia-scrim" aria-label="Close menu" onClick={() => setSideOpen(false)} />}

      {/* ── Stage ── */}
      <section className="ia-stage">
        <header className="ia-top">
          <button className="ia-menu" onClick={() => setSideOpen(true)} aria-label="Open conversations">Chats</button>
          <h2>{active?.title || "Frontend AI"}</h2>

          {/* Mode selector */}
          <div className="ia-mode-seg" role="group" aria-label="Chat mode">
            {CHAT_MODES.map((m) => (
              <button key={m.value} className={chatMode === m.value ? "on" : ""} onClick={() => setChatMode(m.value)}>
                {m.label}
              </button>
            ))}
          </div>

          <button className="ia-link" aria-expanded={panel} onClick={() => setPanel((v) => !v)}>
            {panel ? "Hide settings" : "Settings"}
          </button>
        </header>

        <div className="ia-scroll" ref={scrollRef} onScroll={onScroll}>
          <div className="ia-col">
            {noServer && (
              <div className="ia-setup" role="status">
                {server === "nokey"
                  ? <><strong>Add your Groq key to start.</strong> Create a <code>.env</code> file with <code>GROQ_API_KEY=your_key</code> and run <code>npm run server</code>.</>
                  : <><strong>The server isn't running.</strong> Run <code>npm run server</code>, then reload.</>}
              </div>
            )}

            {messages.length === 0 ? (
              <section className="ia-empty">
                <h1>Frontend Engineering<br />Specialist</h1>
                <p>Ask about HTML, CSS, JS, React, performance, a11y, testing. Switch to <strong>Profile</strong> mode for developer info.</p>
                <ul>
                  {starters.map((s) => (
                    <li key={s}><button onClick={() => send(s)} disabled={noServer}>{s}</button></li>
                  ))}
                </ul>
              </section>
            ) : (
              <ol className="ia-thread">
                {messages.map((m) => (
                  <li key={m.id} className={`ia-msg ${m.role}`}>
                    <div className="ia-who">{m.role === "user" ? "You" : "AI"}</div>
                    <div className="ia-body">
                      {m.role === "user" ? (
                        editing?.id === m.id ? (
                          <div className="ia-edit">
                            <textarea
                              autoFocus
                              value={editing.text}
                              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                              aria-label="Edit message"
                              rows={3}
                            />
                            <div>
                              <button className="ia-chip on" onClick={submitEdit}>Save and resubmit</button>
                              <button className="ia-chip" onClick={() => setEditing(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="ia-ask">{m.content}</p>
                            {!busy && <button className="ia-link small ia-hover" onClick={() => setEditing({ id: m.id, text: m.content })}>Edit</button>}
                          </>
                        )
                      ) : m.content ? (
                        <>
                          <Markdown text={m.content} />
                          <Sources sources={m.sources} />
                          <TokenLedger ledger={m.ledger} ms={m.ms} cacheHit={m.ledger?.cacheHit} />
                          {!(busy && m.id === messages[messages.length - 1].id) && (
                            <div className="ia-meta">
                              <span className="ia-meta-acts">
                                {m.id === lastAssistantId && !busy && <button className="ia-link small" onClick={regenerate}>Regenerate</button>}
                                <CopyButton text={m.content} />
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="ia-wave" role="status" aria-label="Generating"><i /><i /><i /><i /></span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {away && messages.length > 0 && (
          <button className="ia-jump" onClick={() => { scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }}>
            Jump to latest
          </button>
        )}

        <footer className="ia-dock">
          <div className="ia-col">
            {error && (
              <div className="ia-error" role="alert">
                <span>{error}</span>
                {lastIsUser && !busy && <button className="ia-link small" onClick={retry}>Retry</button>}
              </div>
            )}

            {panel && (
              <div className="ia-panel">
                <label className="ia-field">
                  <span>Model</span>
                  <select value={model} onChange={(e) => setSetting("model", e.target.value)}>
                    {models.map((o) => <option key={o.value} value={o.value}>{MODEL_LABELS[o.value] || o.value}</option>)}
                  </select>
                </label>
                <label className="ia-field">
                  <span>Creativity: {settings.temperature.toFixed(1)}</span>
                  <input type="range" min="0" max="1.5" step="0.1" value={settings.temperature} onChange={(e) => setSetting("temperature", Number(e.target.value))} />
                </label>
                <label className="ia-field">
                  <span>Max completion tokens</span>
                  <select value={settings.maxTokens} onChange={(e) => setSetting("maxTokens", Number(e.target.value))}>
                    {[300, 600, 900, 1800].map((n) => <option key={n} value={n}>{n} tokens</option>)}
                  </select>
                </label>
                <div className="ia-field wide">
                  <span>Token savers</span>
                  <OptimisationPanel settings={settings} setSetting={setSetting} />
                </div>
                <p className="ia-note">Token savers reduce cost and latency. Disable individually to compare.</p>
              </div>
            )}

            <div className="ia-composer">
              <textarea
                ref={fieldRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
                placeholder={chatMode === "developer" ? "Ask about the developer's skills, projects, or experience…" : "Ask a frontend engineering question…"}
                rows={1}
                aria-label="Your message"
              />
              {busy ? (
                <button className="ia-send stop" onClick={stop}>Stop</button>
              ) : (
                <button className="ia-send" onClick={() => send()} disabled={!draft.trim() || noServer}>Send</button>
              )}
            </div>
            <p className="ia-hint">Enter to send · Shift+Enter for newline · Esc to stop</p>
          </div>
        </footer>
      </section>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap');

.ia {
  --paper:#e9eeea; --panel:#f6f8f5; --ink:#15211d; --muted:#5d6c66; --line:#c4cfc8;
  --blue:#2438d9; --blue-ink:#fff; --mark:#f3d34a; --err-bg:#fbe3df; --err:#8d2417;
  --code:#15211d; --code-ink:#e4ece7; --green:#1d7a4d; --ledger-bg:#f0f4f1;
  --sans:'Bricolage Grotesque',system-ui,sans-serif;
  --serif:'Newsreader',Georgia,serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  height:100vh; height:100dvh; display:grid; grid-template-columns:272px 1fr;
  background:var(--paper); color:var(--ink); font-family:var(--sans); overflow:hidden;
}
.ia *,.ia *::before,.ia *::after{box-sizing:border-box}
@media (prefers-color-scheme:dark){
  .ia{--paper:#0f1815;--panel:#16221e;--ink:#e4ece7;--muted:#8da198;--line:#2b3b35;
      --blue:#7f8cff;--blue-ink:#0b1020;--err-bg:#3a1c18;--err:#ffb8ad;
      --code:#0a100e;--green:#5fd39a;--ledger-bg:#111f1a}
}
.ia button,.ia select{font-family:inherit;cursor:pointer}
.ia button:disabled{cursor:not-allowed}
.ia :focus-visible{outline:2px solid var(--blue);outline-offset:2px}
.ia ::selection{background:var(--mark);color:#15211d}

/* sidebar */
.ia-side{display:flex;flex-direction:column;gap:12px;padding:18px 14px;background:var(--panel);border-right:1px solid var(--line);min-height:0}
.ia-brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:1.1rem;letter-spacing:-.02em;padding:0 6px}
.ia-mark{width:18px;height:18px;background:var(--blue);border-radius:50% 50% 50% 0;flex-shrink:0}
.ia-new{border:1.5px solid var(--ink);background:var(--ink);color:var(--paper);border-radius:4px;padding:10px;font-weight:700;font-size:.95rem}
.ia-new:hover{background:var(--blue);border-color:var(--blue);color:var(--blue-ink)}
.ia-search,.ia-rename{width:100%;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:4px;padding:9px 10px;font:inherit;font-size:.88rem}
.ia-list{list-style:none;margin:0;padding:0;overflow:auto;flex:1;min-height:0}
.ia-list li{position:relative;border-radius:4px}
.ia-list li.on{background:var(--paper);box-shadow:inset 3px 0 0 var(--blue)}
.ia-conv{display:block;width:100%;text-align:left;background:none;border:0;color:var(--ink);padding:10px 12px;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ia-list li:not(.on):hover{background:var(--paper)}
.ia-acts{display:none;position:absolute;right:4px;top:50%;transform:translateY(-50%);background:var(--paper);padding-left:6px;gap:2px}
.ia-list li:hover .ia-acts,.ia-list li:focus-within .ia-acts{display:flex}
.ia-acts button{background:none;border:0;color:var(--muted);font-size:.75rem;padding:4px 5px}
.ia-acts button:hover{color:var(--ink);text-decoration:underline}
.ia-none{color:var(--muted);font-size:.85rem;padding:10px 12px}
.ia-side-foot{border-top:1px solid var(--line);padding-top:12px;font-size:.76rem;color:var(--muted);display:grid;gap:8px}
.ia-side-foot p{margin:0}
.ia-scrim{display:none}

/* stage */
.ia-stage{display:grid;grid-template-rows:auto 1fr auto;min-width:0;min-height:0;position:relative}
.ia-top{display:flex;align-items:center;gap:10px;padding:12px clamp(16px,4vw,40px);border-bottom:1px solid var(--line);flex-wrap:wrap}
.ia-top h2{margin:0;font-size:1rem;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ia-menu{display:none;background:none;border:1.5px solid var(--ink);color:var(--ink);border-radius:4px;padding:6px 10px;font-weight:600;font-size:.85rem}
.ia-link{background:none;border:0;padding:3px 0;color:var(--muted);font-size:.88rem;border-bottom:1px solid var(--line)}
.ia-link:hover{color:var(--ink);border-color:var(--ink)}
.ia-link.small{font-size:.8rem}
.ia-scroll{overflow:auto;min-height:0}
.ia-col{width:100%;max-width:740px;margin:0 auto;padding:0 clamp(16px,4vw,40px)}
.ia-scroll .ia-col{padding-top:28px;padding-bottom:32px}
.ia-setup{margin-bottom:24px;padding:12px 14px;border-left:4px solid var(--blue);background:var(--panel);font-size:.92rem;line-height:1.5}
.ia-setup code,.md code{font-family:var(--mono);font-size:.88em;background:var(--paper);padding:1px 5px;border-radius:3px}

/* mode seg */
.ia-mode-seg{display:inline-flex;border:1.5px solid var(--ink);border-radius:4px;overflow:hidden}
.ia-mode-seg button{background:none;border:0;color:var(--ink);padding:5px 12px;font:.7rem/1 var(--sans);font-weight:700;letter-spacing:.04em;text-transform:uppercase;border-right:1px solid var(--line)}
.ia-mode-seg button:last-child{border-right:0}
.ia-mode-seg button.on{background:var(--ink);color:var(--paper)}

/* empty state */
.ia-empty{padding-top:clamp(24px,9vh,90px)}
.ia-empty h1{margin:0;font-weight:800;letter-spacing:-.045em;line-height:.98;font-size:clamp(2rem,5vw,3.4rem);max-width:14ch;animation:ia-rise .7s cubic-bezier(.2,.7,.2,1) both}
.ia-empty p{margin:20px 0 28px;color:var(--muted);font-size:1.05rem}
.ia-empty ul{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.ia-empty li{border-bottom:1px solid var(--line)}
.ia-empty li button{width:100%;text-align:left;background:none;border:0;padding:16px 4px;font-size:1.05rem;color:var(--ink);display:flex;justify-content:space-between;gap:16px;transition:padding .18s,background .18s}
.ia-empty li button::after{content:"+";color:var(--blue);font-weight:600}
.ia-empty li button:hover:not(:disabled){background:var(--panel);padding-left:14px}
.ia-empty li button:disabled{opacity:.5}

/* thread */
.ia-thread{list-style:none;margin:0;padding:0;display:grid;gap:28px}
.ia-msg{display:grid;grid-template-columns:48px 1fr;gap:6px}
.ia-who{font-weight:600;font-size:.85rem;color:var(--muted);padding-top:5px}
.ia-msg.assistant .ia-who{color:var(--blue)}
.ia-body{min-width:0}
.ia-msg.assistant .ia-body{border-left:3px solid var(--blue);padding-left:18px}
.ia-ask{margin:0;font-weight:600;font-size:1.2rem;letter-spacing:-.015em;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere}
.ia-hover{margin-top:6px;opacity:0}
.ia-msg:hover .ia-hover,.ia-hover:focus-visible{opacity:1}
.ia-edit textarea{width:100%;font:inherit;font-size:1.05rem;padding:10px;border:1.5px solid var(--blue);background:var(--panel);color:var(--ink);border-radius:4px;resize:vertical}
.ia-edit div{display:flex;gap:8px;margin-top:8px}
.ia-chip{border:1.5px solid var(--ink);background:none;color:var(--ink);border-radius:4px;padding:6px 12px;font-size:.85rem;font-weight:600}
.ia-chip.on{background:var(--ink);color:var(--paper)}
.ia-meta{display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:6px}
.ia-meta-acts{display:flex;gap:14px}

/* sources */
.ia-sources{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:10px;font-size:.78rem}
.ia-sources-label{color:var(--muted);font-weight:600}
.ia-source-tag{background:var(--paper);border:1px solid var(--line);border-radius:3px;padding:2px 7px;color:var(--muted);text-transform:capitalize}

/* token ledger */
.ia-ledger{margin-top:10px;border:1px solid var(--line);border-radius:4px;overflow:hidden;font-size:.78rem}
.ia-ledger summary{padding:6px 10px;cursor:pointer;font-weight:600;color:var(--muted);background:var(--ledger-bg);list-style:none;user-select:none}
.ia-ledger summary::marker,.ia-ledger summary::-webkit-details-marker{display:none}
.ia-ledger[open] summary{border-bottom:1px solid var(--line)}
.ia-ledger table{width:100%;border-collapse:collapse}
.ia-ledger-k{padding:4px 10px;color:var(--muted);white-space:nowrap;width:40%}
.ia-ledger-v{padding:4px 10px;font-family:var(--mono);color:var(--ink)}
.ia-ledger tr:nth-child(even){background:var(--ledger-bg)}

/* markdown */
.md{font-family:var(--serif);font-size:1.14rem;line-height:1.7;overflow-wrap:anywhere}
.md>*:first-child{margin-top:0}
.md p{margin:0 0 .9em}
.md h4{font-family:var(--sans);font-size:1.05rem;font-weight:800;letter-spacing:-.01em;margin:1.3em 0 .4em}
.md ul,.md ol{margin:0 0 .9em;padding-left:1.4em}
.md li{margin:.2em 0}
.md a{color:var(--blue)}
.md code{font-family:var(--mono)}
.md-code{margin:0 0 1em;background:var(--code);color:var(--code-ink);border-radius:6px;overflow:hidden}
.md-code figcaption{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;font:600 .75rem var(--mono);color:#8da198;border-bottom:1px solid rgba(255,255,255,.1)}
.md-copy{background:none;border:0;color:#c9d6cf;font:600 .75rem var(--mono)}
.md-copy:hover{color:#fff}
.md-code pre{margin:0;padding:14px;overflow:auto;font:.88rem/1.55 var(--mono)}
.md-code code{background:none;padding:0;font-size:inherit}
.md-table{overflow:auto;margin:0 0 1em}
.md table{border-collapse:collapse;font:.95rem var(--sans);min-width:60%}
.md th,.md td{border:1px solid var(--line);padding:7px 12px;text-align:left}
.md th{background:var(--panel);font-weight:600}

.ia-wave{display:inline-flex;align-items:flex-end;gap:4px;height:22px;padding-top:4px}
.ia-wave i{width:4px;height:100%;background:var(--blue);border-radius:2px;transform-origin:bottom;animation:ia-wave 1s ease-in-out infinite}
.ia-wave i:nth-child(2){animation-delay:.12s}.ia-wave i:nth-child(3){animation-delay:.24s}.ia-wave i:nth-child(4){animation-delay:.36s}

.ia-jump{position:absolute;left:50%;bottom:150px;transform:translateX(-50%);border:1.5px solid var(--ink);background:var(--panel);color:var(--ink);border-radius:999px;padding:7px 16px;font-size:.85rem;font-weight:600;box-shadow:3px 3px 0 var(--ink)}

/* dock */
.ia-dock{padding:10px 0 18px;background:linear-gradient(to top,var(--paper) 82%,transparent)}
.ia-panel{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px;margin-bottom:12px;padding:16px;background:var(--panel);border:1px solid var(--line);border-radius:6px}
.ia-field{display:grid;gap:6px;font-size:.82rem;color:var(--muted);align-content:start}
.ia-field.wide{grid-column:1/-1}
.ia-field.wide,.ia-note{grid-column:1/-1}
.ia-field select{border:1.5px solid var(--ink);background:var(--paper);color:var(--ink);border-radius:4px;padding:8px 10px;font:inherit;font-size:.9rem}
.ia-field input[type=range]{accent-color:var(--blue);width:100%}
.ia-note{margin:0;font-size:.78rem;color:var(--muted)}

/* optimisation toggles */
.ia-opt-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.ia-opt-toggle{display:flex;align-items:center;gap:5px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--ink);border:1.5px solid var(--line);border-radius:4px;padding:5px 10px;transition:border-color .15s}
.ia-opt-toggle:hover{border-color:var(--ink)}
.ia-opt-toggle input{accent-color:var(--blue)}

.ia-composer{display:flex;align-items:flex-end;background:var(--panel);border:1.5px solid var(--ink);border-radius:6px}
.ia-composer:focus-within{border-color:var(--blue);box-shadow:4px 4px 0 var(--blue)}
.ia-composer textarea{flex:1;resize:none;border:0;background:transparent;color:var(--ink);font:400 1.05rem/1.5 var(--sans);padding:14px 16px;max-height:200px;outline:none}
.ia-composer textarea::placeholder{color:var(--muted)}
.ia-send{align-self:stretch;border:0;background:var(--blue);color:var(--blue-ink);font-weight:800;font-size:.98rem;padding:0 24px;border-radius:0 4px 4px 0}
.ia-send:hover:not(:disabled){filter:brightness(1.1)}
.ia-send:disabled{opacity:.45}
.ia-send.stop{background:var(--ink);color:var(--paper)}
.ia-hint{margin:8px 2px 0;font-size:.78rem;color:var(--muted)}
.ia-error{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px;padding:10px 14px;border-left:4px solid var(--err);background:var(--err-bg);color:var(--err);font-size:.92rem;overflow-wrap:anywhere}
.ia-error .ia-link{color:var(--err);border-color:var(--err);flex-shrink:0}

@keyframes ia-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes ia-wave{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}

@media (max-width:820px){
  .ia{grid-template-columns:1fr}
  .ia-side{position:fixed;inset:0 auto 0 0;width:min(320px,86vw);z-index:30;transform:translateX(-100%);transition:transform .22s ease}
  .ia-side.open{transform:none}
  .ia-scrim{display:block;position:fixed;inset:0;z-index:20;background:rgba(10,16,14,.5);border:0}
  .ia-menu{display:block}
  .ia-msg{grid-template-columns:1fr}
  .ia-who{padding-top:0}
  .ia-panel{grid-template-columns:1fr}
  .ia-hover{opacity:1}
  .ia-acts{display:flex;position:static;transform:none;background:none}
  .ia-list li{display:flex;align-items:center}
  .ia-send{padding:0 16px}
}
@media (prefers-reduced-motion:reduce){
  .ia *,.ia *::before,.ia *::after{animation:none!important;transition:none!important}
}
`;
