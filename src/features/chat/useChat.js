import { useCallback, useEffect, useRef, useState } from "react";
import { load, save, uid } from "../../lib/storage.js";
import {
  CHAT_MODES,
  DEFAULTS,
  FALLBACK_MODELS,
  STARTERS,
  STORAGE_KEYS,
} from "./constants.js";

/**
 * useChat — all state & logic for the Chat feature.
 * Handles the new /api/chat protocol: router, RAG, ledger, sources.
 */
export function useChat() {
  const [convos, setConvos] = useState(() =>
    load(STORAGE_KEYS.convos, []).map((c) => ({ ...c, messages: (c.messages || []).filter((m) => m.content) }))
  );
  const [activeId, setActiveId] = useState(() => load(STORAGE_KEYS.active, null));
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...load(STORAGE_KEYS.settings, {}) }));
  const [models, setModels] = useState(FALLBACK_MODELS);
  const [server, setServer] = useState("checking"); // checking | ok | nokey | offline
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sideOpen, setSideOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [editing, setEditing] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [away, setAway] = useState(false);
  const [chatMode, setChatMode] = useState("auto"); // "auto" | "learn" | "developer"
  const [sessionId] = useState(() => uid()); // stable per browser session

  const gen = useRef(null);
  const scrollRef = useRef(null);
  const stick = useRef(true);
  const fieldRef = useRef(null);
  const searchRef = useRef(null);

  const active = convos.find((c) => c.id === activeId) || null;
  const messages = active?.messages || [];
  const model = models.some((m) => m.value === settings.model) ? settings.model : models[0]?.value;

  /* ---------- persistence ---------- */
  useEffect(() => save(STORAGE_KEYS.convos, convos), [convos]);
  useEffect(() => save(STORAGE_KEYS.active, activeId), [activeId]);
  useEffect(() => save(STORAGE_KEYS.settings, settings), [settings]);

  /* ---------- server health ---------- */
  useEffect(() => {
    (async () => {
      try {
        const h = await (await fetch("/api/health")).json();
        if (!h.configured) return setServer("nokey");
        setServer("ok");
        const r = await fetch("/api/models");
        if (r.ok) {
          const { models: list } = await r.json();
          if (list?.length) setModels(list.map((x) => ({ value: x.id, label: x.id })));
        }
      } catch {
        setServer("offline");
      }
    })();
    return () => gen.current?.ctrl.abort();
  }, []);

  /* ---------- auto-scroll ---------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, activeId]);

  /* ---------- textarea auto-resize ---------- */
  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [draft]);

  /* ---------- keyboard shortcuts ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && gen.current) gen.current.ctrl.abort();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSideOpen(true);
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- helpers ---------- */
  const patch = (id, fn) =>
    setConvos((p) => p.map((c) => (c.id === id ? { ...fn(c), updatedAt: Date.now() } : c)));

  const stop = useCallback(() => gen.current?.ctrl.abort(), []);
  const setSetting = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  /* ---------- streaming chat with ledger ---------- */
  const run = async (cid, history) => {
    const g = { ctrl: new AbortController() };
    gen.current = g;
    const aid = uid();
    const started = performance.now();

    patch(cid, (c) => ({
      ...c,
      messages: [...history, { id: aid, role: "assistant", content: "", sources: [], ledger: null }],
    }));
    setBusy(true);
    setError("");
    stick.current = true;

    // Build API message list (strip internal fields like sources/ledger)
    const apiMessages = history.slice(-24).map(({ role, content }) => ({ role, content }));

    let res;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          sessionId,
          mode: chatMode,
          useRouter: settings.useRouter,
          useRag: settings.useRag,
          useCache: settings.useCache,
          useSummary: settings.useSummary,
          useTrimming: settings.useTrimming,
        }),
        signal: g.ctrl.signal,
      });
    } catch (e) {
      if (e.name !== "AbortError") setError("Can't reach the server.");
      setBusy(false);
      gen.current = null;
      return;
    }

    // Handle non-streaming JSON response (off-topic / profile-miss)
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/event-stream")) {
      try {
        const data = await res.json();
        if (data.content !== undefined) {
          patch(cid, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === aid
                ? { ...m, content: data.content, sources: data.sources || [], ledger: data.ledger, ms: Math.round(performance.now() - started) }
                : m
            ),
          }));
        } else if (data.error) {
          setError(data.error);
          patch(cid, (c) => ({ ...c, messages: c.messages.filter((m) => m.id !== aid) }));
        }
      } catch {}
      setBusy(false);
      gen.current = null;
      return;
    }

    if (!res.ok) {
      setError(`Server error ${res.status}`);
      patch(cid, (c) => ({ ...c, messages: c.messages.filter((m) => m.id !== aid) }));
      setBusy(false);
      gen.current = null;
      return;
    }

    // Stream SSE
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";

    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const j = JSON.parse(raw);
            if (j.error) { setError(j.error); break; }

            // Token chunk
            const t = j.choices?.[0]?.delta?.content;
            if (t) {
              if (gen.current !== g) break;
              patch(cid, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aid ? { ...m, content: m.content + t } : m
                ),
              }));
            }

            // Final metadata event
            if (j.x_meta) {
              const { ledger, sources } = j.x_meta;
              patch(cid, (c) => ({
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aid
                    ? { ...m, ledger, sources: sources || [], ms: Math.round(performance.now() - started) }
                    : m
                ),
              }));
            }
          } catch { /* partial line */ }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || "Stream error.");
    }

    if (gen.current === g) {
      patch(cid, (c) => ({
        ...c,
        messages: c.messages.filter((m) => m.id !== aid || m.content),
      }));
      gen.current = null;
      setBusy(false);
    }
  };

  /* ---------- actions ---------- */
  const send = (text) => {
    const t = (text ?? draft).trim();
    if (!t || busy) return;
    let c = active;
    if (!c) {
      c = { id: uid(), title: t.slice(0, 48), messages: [], updatedAt: Date.now() };
      setConvos((p) => [c, ...p]);
      setActiveId(c.id);
    }
    const msgs = [...c.messages, { id: uid(), role: "user", content: t }];
    if (!c.messages.length) patch(c.id, (x) => ({ ...x, title: t.slice(0, 48) }));
    setDraft("");
    queueMicrotask(() => run(c.id, msgs));
  };

  const regenerate = () => {
    if (busy || !active) return;
    const lastUser = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUser >= 0) run(active.id, messages.slice(0, lastUser + 1));
  };

  const retry = () => active && !busy && run(active.id, messages);

  const submitEdit = () => {
    if (!editing || !editing.text.trim() || busy) return;
    const idx = messages.findIndex((m) => m.id === editing.id);
    const msgs = [...messages.slice(0, idx), { ...messages[idx], content: editing.text.trim() }];
    setEditing(null);
    run(active.id, msgs);
  };

  const newChat = () => {
    stop(); setActiveId(null); setDraft(""); setError(""); setSideOpen(false);
    fieldRef.current?.focus();
  };
  const openChat = (id) => { stop(); setActiveId(id); setError(""); setSideOpen(false); stick.current = true; };
  const removeChat = (c) => {
    if (!window.confirm(`Delete "${c.title}"? This can't be undone.`)) return;
    if (c.id === activeId) { stop(); setActiveId(null); }
    setConvos((p) => p.filter((x) => x.id !== c.id));
  };
  const wipe = () => {
    if (!window.confirm("Delete all conversations and settings stored in this browser?")) return;
    stop(); setConvos([]); setActiveId(null); setSettings(DEFAULTS);
  };

  const onScroll = (e) => {
    const el = e.currentTarget;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stick.current = near;
    setAway(!near);
  };

  /* ---------- derived ---------- */
  const q = query.trim().toLowerCase();
  const shown = [...convos]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q)));

  const recent = [...new Set(
    convos.flatMap((c) => c.messages.filter((m) => m.role === "user").map((m) => m.content)).reverse()
  )].filter((t) => t.length < 90).slice(0, 2);
  const starters = [...recent, ...STARTERS].slice(0, 4);
  const lastIsUser = messages.length > 0 && messages[messages.length - 1].role === "user";
  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;
  const noServer = server === "offline" || server === "nokey";

  return {
    convos, activeId, active, messages, settings, models, server,
    draft, setDraft, busy, error, query, setQuery,
    sideOpen, setSideOpen, panel, setPanel, editing, setEditing,
    renaming, setRenaming, away,
    chatMode, setChatMode,
    scrollRef, fieldRef, searchRef,
    model, shown, starters, lastIsUser, lastAssistantId, noServer,
    sessionId,
    send, stop, regenerate, retry, submitEdit, newChat, openChat, removeChat, wipe, onScroll,
    setSetting,
  };
}
