import { useState } from "react";
import Assistant from "./features/assistant/Assistant.jsx";
import Chat from "./features/chat/Chat.jsx";

export default function App() {
  const [view, setView] = useState("chat");

  return (
    <div className="app-shell">
      <style>{css}</style>

      <header className="app-topbar">
        <div className="app-brand">
          <span className="app-mark" aria-hidden="true" />
          <span>Workspace</span>
        </div>

        <nav className="app-nav" aria-label="Primary navigation">
          <button
            type="button"
            className={view === "chat" ? "on" : ""}
            onClick={() => setView("chat")}
          >
            Chatbot
          </button>
          <button
            type="button"
            className={view === "assistant" ? "on" : ""}
            onClick={() => setView("assistant")}
          >
            Assistant
          </button>
          <a
            href="http://localhost:8787/eval"
            target="_blank"
            rel="noreferrer"
            className="app-nav-eval"
            title="Open /eval benchmark dashboard"
          >
            /eval ↗
          </a>
        </nav>
      </header>

      <main className="app-body">
        {view === "chat" ? <Chat /> : <Assistant />}
      </main>
    </div>
  );
}

const css = `
.app-shell {
  --paper: #e9eeea;
  --panel: #f6f8f5;
  --ink: #15211d;
  --muted: #5d6c66;
  --line: #c4cfc8;
  --blue: #2438d9;
  --blue-ink: #ffffff;
  min-height: 100vh;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Bricolage Grotesque', system-ui, sans-serif;
}

.app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px clamp(16px, 4vw, 40px);
  border-bottom: 1px solid var(--line);
  background: rgba(246, 248, 245, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.app-mark {
  width: 18px;
  height: 18px;
  background: var(--blue);
  border-radius: 50% 50% 50% 0;
  display: inline-block;
}

.app-nav {
  display: inline-flex;
  border: 1.5px solid var(--ink);
  border-radius: 4px;
  overflow: hidden;
  background: var(--panel);
}

.app-nav button {
  background: transparent;
  border: 0;
  border-right: 1px solid var(--line);
  color: var(--ink);
  padding: 9px 18px;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
}

.app-nav button:last-child {
  border-right: 0;
}

.app-nav button.on {
  background: var(--ink);
  color: var(--paper);
}

.app-nav-eval {
  display: inline-flex;
  align-items: center;
  padding: 9px 16px;
  font-weight: 700;
  font-size: 0.92rem;
  color: #2563eb;
  text-decoration: none;
  background: rgba(37, 99, 235, 0.08);
  transition: all 0.2s;
}

.app-nav-eval:hover {
  background: #2563eb;
  color: #ffffff;
}

.app-body {
  width: 100%;
}
`;
