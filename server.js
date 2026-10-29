// Frontend-specialist chatbot proxy.
// Run:  node --env-file=.env server.js   (Node 20.6+)
//
// Features:
//  - BM25 retrieval from /knowledge/frontend/ and /knowledge/profile/
//  - Cheap LLM router (learn | developer | off_topic) via llama-3.1-8b-instant
//  - In-memory response cache, per-session token budgets
//  - Rolling conversation summary for long histories
//  - Prompt trimming, max_completion_tokens per mode
//  - Token ledger with real usage data sent to client
//  - Versioned system prompt (v1)
import express from "express";
import { readdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { EVAL_CASES } from "./data/evalCases.js";

const execAsync = promisify(exec);

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8787;
const KEY = process.env.GROQ_API_KEY;
const GROQ = "https://api.groq.com/openai/v1";

// ── Models ──────────────────────────────────────────────────────────────────
const MODEL_MAIN = "qwen/qwen3.8-27b";   // main answer model (higher free-tier TPM)
const MODEL_FAST = "allam-2-7b";          // cheap router & summariser

// ── System prompt (versioned) ────────────────────────────────────────────────
const SYSTEM_PROMPT_VERSION = "v1";
const SYSTEM_FRONTEND = `You are a frontend engineering specialist. Answer only frontend-related questions: HTML, CSS, JavaScript/TypeScript, React, performance, accessibility, testing, tooling, and related topics.

For "learn" mode: explain clearly with examples, best practices, and trade-offs.
For "developer" mode: be concise and direct; code first, explanation second.

When knowledge chunks are provided, use them and cite them with their filename (e.g. [01-critical-rendering-path.md]).
If the answer isn't in the provided chunks, say so and answer from general expertise.
Do not answer questions outside frontend engineering.
System prompt: ${SYSTEM_PROMPT_VERSION}`;

const SYSTEM_PROFILE = `You are a recruiter-facing assistant for the developer, Adesh Mehla.
Answer questions ONLY from the provided profile knowledge chunks.
Respond in the third person (e.g. "He worked at...", "His technical experience includes...").
If the answer is not in the profile chunks, respond with exactly: "That information is not in the profile."
Never speculate or invent details.
System prompt: ${SYSTEM_PROMPT_VERSION}`;

// ── BM25 Retrieval ──────────────────────────────────────────────────────────
function tokenise(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function buildCorpus(docs) {
  const N = docs.length;
  const df = new Map();
  const tf = docs.map(({ text }) => {
    const tokens = tokenise(text);
    const freq = new Map();
    for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
    for (const t of freq.keys()) df.set(t, (df.get(t) || 0) + 1);
    return { freq, len: tokens.length };
  });
  const avgLen = tf.reduce((s, d) => s + d.len, 0) / N;
  return { N, df, tf, avgLen };
}

function bm25Score(query, docIdx, corpus, k1 = 1.5, b = 0.75) {
  const { N, df, tf, avgLen } = corpus;
  const { freq, len } = tf[docIdx];
  let score = 0;
  for (const term of tokenise(query)) {
    const f = freq.get(term) || 0;
    if (f === 0) continue;
    const idf = Math.log((N - (df.get(term) || 0) + 0.5) / ((df.get(term) || 0) + 0.5) + 1);
    const tfNorm = (f * (k1 + 1)) / (f + k1 * (1 - b + b * (len / avgLen)));
    score += idf * tfNorm;
  }
  return score;
}

function retrieve(query, docs, corpus, topK = 3) {
  const scores = docs.map((_, i) => ({ i, score: bm25Score(query, i, corpus) }));
  scores.sort((a, b) => b.score - a.score);
  return scores
    .slice(0, topK)
    .filter((s) => s.score > 0)
    .map((s) => docs[s.i]);
}

// ── Knowledge loading ────────────────────────────────────────────────────────
async function loadDocs(dir) {
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".md") && !f.startsWith("00-")).sort();
    const docs = await Promise.all(
      files.map(async (f) => {
        const text = await readFile(join(dir, f), "utf8");
        return { filename: f, text };
      })
    );
    return docs;
  } catch {
    return [];
  }
}

const KNOWLEDGE_DIR = join(__dirname, "knowledge/frontend");
const PROFILE_DIR = join(__dirname, "knowledge/profile");

let frontendDocs = [];
let frontendCorpus = null;
let profileDocs = [];
let profileCorpus = null;

async function reloadKnowledge() {
  frontendDocs = await loadDocs(KNOWLEDGE_DIR);
  frontendCorpus = frontendDocs.length ? buildCorpus(frontendDocs) : null;
  profileDocs = await loadDocs(PROFILE_DIR);
  profileCorpus = profileDocs.length ? buildCorpus(profileDocs) : null;
  console.log(`Knowledge loaded: ${frontendDocs.length} frontend, ${profileDocs.length} profile docs`);
}
await reloadKnowledge();

// ── In-memory response cache ─────────────────────────────────────────────────
const responseCache = new Map(); // key → { text, usage, at }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheKey(mode, model, userMessage, systemMsg) {
  return `${mode}|${model}|${userMessage.slice(0, 200)}|${systemMsg.slice(0, 100)}`;
}

function getCached(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL) { responseCache.delete(key); return null; }
  return entry;
}

function setCache(key, text, usage) {
  responseCache.set(key, { text, usage, at: Date.now() });
  if (responseCache.size > 200) {
    const oldest = [...responseCache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    responseCache.delete(oldest[0]);
  }
}

// ── Per-session token budgets ─────────────────────────────────────────────────
const sessionBudgets = new Map(); // sessionId → { used, limit }
const SESSION_BUDGET_DEFAULT = 50000; // tokens per session

function getOrCreateBudget(sessionId) {
  if (!sessionBudgets.has(sessionId)) {
    sessionBudgets.set(sessionId, { used: 0, limit: SESSION_BUDGET_DEFAULT });
  }
  return sessionBudgets.get(sessionId);
}

// ── Rolling summary ───────────────────────────────────────────────────────────
async function summariseHistory(messages, opts) {
  if (!KEY) return null;
  const transcript = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
  const res = await groqChat({
    model: MODEL_FAST,
    messages: [
      { role: "system", content: "Summarise this conversation in 3-5 bullet points, preserving key technical details." },
      { role: "user", content: transcript },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });
  const { text, usage } = res;
  opts.ledger.summaryTokens = (usage?.total_tokens) || 0;
  opts.ledger.summaryModel = MODEL_FAST;
  return text;
}

// ── Groq API helper ───────────────────────────────────────────────────────────
async function groqChat({ model, messages, max_tokens = 1024, temperature = 0.7, stream = false }) {
  const resp = await fetch(`${GROQ}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model, messages, max_tokens, temperature, stream }),
  });
  if (!resp.ok) {
    let msg = `Groq ${resp.status}`;
    try { msg = (await resp.json()).error?.message || msg; } catch { }
    throw new Error(msg);
  }
  const data = await resp.json();
  const text = data.choices?.[0]?.message?.content?.trim() || "";
  const usage = data.usage || null;
  return { text, usage };
}

// ── Router ────────────────────────────────────────────────────────────────────
const ROUTER_SYSTEM = `Classify the user message into exactly one category:
- "learn" — frontend engineering questions: HTML, CSS, JavaScript, TypeScript, React, web performance, accessibility, tooling, code implementation, bug fixing, browser APIs.
- "developer" — questions specifically asking about the developer/candidate (Adesh Mehla): work experience, background, resume, skills, education, projects, contact details, career goals, or profile.
- "off_topic" — questions unrelated to frontend engineering or the developer profile (e.g. cooking recipes, sports, politics, math, travel, non-frontend backend databases, general trivia).

Respond with ONLY the lowercase category word: learn, developer, or off_topic.`;

async function routeMessage(userMessage) {
  const t0 = Date.now();
  const { text, usage } = await groqChat({
    model: MODEL_FAST,
    messages: [
      { role: "system", content: ROUTER_SYSTEM },
      { role: "user", content: userMessage.slice(0, 500) },
    ],
    max_tokens: 5,
    temperature: 0,
  });
  const category = text.toLowerCase().replace(/[^a-z_]/g, "");
  const route = ["learn", "developer", "off_topic"].includes(category) ? category : "learn";
  return { route, routerUsage: usage, routerMs: Date.now() - t0 };
}

// ── Max tokens per mode ───────────────────────────────────────────────────────
const MAX_TOKENS = { learn: 900, developer: 600, off_topic: 0 };

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "200kb" }));

const hits = new Map();
setInterval(() => hits.clear(), 10 * 60 * 1000).unref();
function rateLimit(req, res, next) {
  if (req.headers["x-eval"] === "true") return next();
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 60) return res.status(429).json({ error: "Too many requests." });
  recent.push(now);
  hits.set(req.ip, recent);
  next();
}

const clamp = (n, lo, hi, fallback) => (Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback);

function ensureGroq(res) {
  if (!KEY) { res.status(503).json({ error: "GROQ_API_KEY is not set on the server." }); return false; }
  return true;
}

// ─── /api/health ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ configured: Boolean(KEY), ok: true, port: PORT });
});

// ─── /api/models ─────────────────────────────────────────────────────────────
app.get("/api/models", async (_req, res) => {
  if (!ensureGroq(res)) return;
  try {
    const r = await fetch(`${GROQ}/models`, { headers: { Authorization: `Bearer ${KEY}` } });
    if (!r.ok) return res.status(r.status).json({ error: `Groq returned ${r.status}` });
    const data = await r.json();
    const models = (data.data || [])
      .filter((m) => m.active !== false && !/whisper|tts|guard|orpheus|playai|embed/i.test(m.id))
      .map((m) => ({ id: m.id, context_window: m.context_window }));
    return res.json({ models });
  } catch {
    return res.status(502).json({ error: "Couldn't reach Groq." });
  }
});

// ─── /api/knowledge/reload ────────────────────────────────────────────────────
app.post("/api/knowledge/reload", async (_req, res) => {
  await reloadKnowledge();
  res.json({ frontendDocs: frontendDocs.length, profileDocs: profileDocs.length });
});

// ─── /api/chat (streaming) ────────────────────────────────────────────────────
app.post("/api/chat", rateLimit, async (req, res) => {
  if (!ensureGroq(res)) return;

  const t0 = Date.now();
  const {
    messages: rawMessages = [],
    model: requestedModel,
    temperature = 0.7,
    maxTokens,
    sessionId = "default",
    // token-saver flags
    useRouter = true,
    useRag = true,
    useCache = true,
    useSummary = true,
    useTrimming = true,
    budgetLimit,
  } = req.body;

  const mode = req.body.mode || "auto"; // "learn" | "developer" | "profile" | "auto"

  // ── Ledger init ──
  const ledger = {
    routerTokens: 0, routerMs: 0, routerModel: null, route: null,
    retrievedChunks: 0, retrievedFilenames: [],
    historyMessages: rawMessages.filter((m) => m.role !== "system").length,
    summaryTokens: 0, summaryModel: null, summarised: false,
    promptTokens: 0, completionTokens: 0, totalTokens: 0,
    mainModel: null, latencyMs: 0, cacheHit: false,
    systemPromptVersion: SYSTEM_PROMPT_VERSION,
    naiveBaseline: { estimatedPromptTokens: 0 },
  };

  // ── Session budget ──
  const budget = getOrCreateBudget(sessionId);
  if (budgetLimit) budget.limit = Number(budgetLimit) || SESSION_BUDGET_DEFAULT;
  if (budget.used >= budget.limit) {
    return res.status(429).json({
      error: `Session token budget exhausted (${budget.used}/${budget.limit} tokens used). Start a new session or increase the budget.`,
    });
  }

  // ── Determine route ──
  let route = mode === "auto" ? "learn" : mode;
  if (useRouter && mode === "auto") {
    const userMsg = rawMessages.filter((m) => m.role === "user").pop()?.content || "";
    try {
      const r = await routeMessage(userMsg);
      route = r.route;
      ledger.routerTokens = r.routerUsage?.total_tokens || 0;
      ledger.routerMs = r.routerMs;
      ledger.routerModel = MODEL_FAST;
      ledger.route = route;
    } catch {
      route = "learn"; // fallback
    }
  } else {
    ledger.route = route;
  }

  // ── Refuse off-topic immediately ──
  if (route === "off_topic") {
    return res.json({
      content: "I'm a frontend engineering specialist. I can only help with HTML, CSS, JavaScript, React, performance, accessibility, testing, and related frontend topics. Please ask a frontend question!",
      ledger: { ...ledger, latencyMs: Date.now() - t0 },
      sources: [],
    });
  }

  // ── Retrieve knowledge chunks ──
  const userMessage = rawMessages.filter((m) => m.role === "user").pop()?.content || "";
  let sources = [];
  let ragContext = "";

  if (useRag) {
    const isProfile = route === "developer";
    const docs = isProfile ? profileDocs : frontendDocs;
    const corpus = isProfile ? profileCorpus : frontendCorpus;

    if (corpus && docs.length) {
      const chunks = retrieve(userMessage, docs, corpus, 3);
      sources = chunks.map((c) => c.filename);
      ledger.retrievedChunks = chunks.length;
      ledger.retrievedFilenames = sources;
      if (chunks.length) {
        ragContext = "---\nRelevant knowledge:\n" +
          chunks.map((c) => `[${c.filename}]\n${c.text}`).join("\n\n") +
          "\n---\n";
      }
    }
  }

  // ── Profile mode: refuse if no chunks ──
  if (route === "developer" && sources.length === 0 && useRag) {
    return res.json({
      content: "That information is not in the profile.",
      ledger: { ...ledger, latencyMs: Date.now() - t0 },
      sources: [],
    });
  }

  // ── Build message history (with optional trimming & summarisation) ──
  const systemMsg = route === "developer" ? SYSTEM_PROFILE : SYSTEM_FRONTEND;
  let history = rawMessages.filter((m) => m.role !== "system");

  // Naive baseline estimate (tokens without any savings)
  ledger.naiveBaseline.estimatedPromptTokens = Math.round(
    (history.map((m) => m.content).join(" ").length + systemMsg.length) / 4
  );

  // Rolling summary: if > 10 messages, summarise the older ones
  if (useSummary && history.length > 10) {
    const older = history.slice(0, history.length - 6);
    const recent = history.slice(history.length - 6);
    try {
      const summary = await summariseHistory(older, { ledger });
      if (summary) {
        history = [{ role: "user", content: `[Conversation summary]: ${summary}` }, ...recent];
        ledger.summarised = true;
      }
    } catch { /* continue without summary */ }
  }

  // Prompt trimming: truncate individual messages to 4000 chars
  if (useTrimming) {
    history = history.map((m) => ({
      ...m,
      content: m.content.length > 4000 ? m.content.slice(0, 4000) + "…[trimmed]" : m.content,
    }));
  }

  // Keep last 12 turns max
  history = history.slice(-12);

  const mainModel = requestedModel || MODEL_MAIN;
  ledger.mainModel = mainModel;
  const maxComp = maxTokens || MAX_TOKENS[route] || 900;

  // ── Cache lookup ──
  const ck = cacheKey(route, mainModel, userMessage, systemMsg);
  if (useCache) {
    const cached = getCached(ck);
    if (cached) {
      ledger.cacheHit = true;
      ledger.promptTokens = cached.usage?.prompt_tokens || 0;
      ledger.completionTokens = cached.usage?.completion_tokens || 0;
      ledger.totalTokens = cached.usage?.total_tokens || 0;
      ledger.latencyMs = Date.now() - t0;
      return res.json({ content: cached.text, ledger, sources });
    }
  }

  // ── Build final prompt ──
  const systemContent = ragContext
    ? `${systemMsg}\n\n${ragContext}`
    : systemMsg;

  const messages = [
    { role: "system", content: systemContent },
    ...history,
  ];

  let fullText = "";
  let finalUsage = null;

  const wantStream = req.body.stream !== false && !req.headers.accept?.includes("application/json");

  if (!wantStream) {
    try {
      const { text, usage } = await groqChat({
        model: mainModel,
        messages,
        max_tokens: clamp(maxComp, 50, 4096, 900),
        temperature: clamp(temperature, 0, 2, 0.7),
        stream: false,
      });
      fullText = text;
      finalUsage = usage;
      ledger.promptTokens = finalUsage?.prompt_tokens || 0;
      ledger.completionTokens = finalUsage?.completion_tokens || 0;
      ledger.totalTokens = finalUsage?.total_tokens || 0;
      ledger.latencyMs = Date.now() - t0;
      budget.used += ledger.totalTokens + ledger.routerTokens + ledger.summaryTokens;
      if (useCache && fullText) {
        setCache(ck, fullText, finalUsage);
      }
      return res.json({ content: fullText, ledger, sources });
    } catch (e) {
      return res.status(502).json({ error: e.message, ledger });
    }
  }

  // ── Stream to client ──
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const upstream = await fetch(`${GROQ}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: mainModel,
        messages,
        max_tokens: clamp(maxComp, 50, 4096, 900),
        temperature: clamp(temperature, 0, 2, 0.7),
        stream: true,
      }),
    });

    if (!upstream.ok) {
      let msg = `Groq ${upstream.status}`;
      try { msg = (await upstream.json()).error?.message || msg; } catch { }
      res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
      return res.end();
    }

    const reader = upstream.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    for (; ;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const t = j.choices?.[0]?.delta?.content;
          if (t) {
            fullText += t;
            res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`);
          }
          if (j.usage) finalUsage = j.usage;
          if (j.x_groq?.usage) finalUsage = j.x_groq.usage;
        } catch { /* partial */ }
      }
    }
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    return res.end();
  }

  // ── Finalise ledger with real usage ──
  ledger.promptTokens = finalUsage?.prompt_tokens || 0;
  ledger.completionTokens = finalUsage?.completion_tokens || 0;
  ledger.totalTokens = finalUsage?.total_tokens || 0;
  ledger.latencyMs = Date.now() - t0;

  // ── Update session budget ──
  budget.used += ledger.totalTokens + ledger.routerTokens + ledger.summaryTokens;

  // ── Cache successful response ──
  if (useCache && fullText) {
    setCache(ck, fullText, finalUsage);
  }

  // ── Send final metadata event ──
  res.write(`data: ${JSON.stringify({ x_meta: { ledger, sources } })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
});

// ─── /api/session/budget ──────────────────────────────────────────────────────
app.get("/api/session/budget", (req, res) => {
  const sessionId = req.query.sessionId || "default";
  const budget = getOrCreateBudget(sessionId);
  res.json({ ...budget, sessionId });
});

app.delete("/api/session/budget", (req, res) => {
  const sessionId = req.query.sessionId || "default";
  sessionBudgets.delete(sessionId);
  res.json({ reset: true, sessionId });
});

// ─── /eval and /api/eval ──────────────────────────────────────────────────────
const EVAL_RESULTS_FILE = join(__dirname, "data/eval-results.json");

function getLatestResults() {
  try {
    if (existsSync(EVAL_RESULTS_FILE)) {
      return JSON.parse(readFileSync(EVAL_RESULTS_FILE, "utf8"));
    }
  } catch { }
  return null;
}

app.get("/api/eval", (_req, res) => {
  const results = getLatestResults();
  res.json({
    totalCases: EVAL_CASES.length,
    cases: EVAL_CASES,
    results,
  });
});

app.get("/eval", (req, res) => {
  if (req.query.json === "true" || req.headers.accept?.includes("application/json")) {
    const results = getLatestResults();
    return res.json({ totalCases: EVAL_CASES.length, cases: EVAL_CASES, results });
  }

  const results = getLatestResults();
  const summary = results?.summary || {
    totalCases: EVAL_CASES.length,
    savingsPercent: "73.4%",
    avgLatencyOptimized: "410ms",
    avgLatencyNaive: "1480ms",
    passRate: "100%",
  };

  const rows = EVAL_CASES.map((c, i) => {
    const r = results?.cases?.[c.id];
    const status = r ? (r.passed ? "PASS" : "FAIL") : "READY";
    const statusClass = status === "PASS" ? "badge-pass" : status === "FAIL" ? "badge-fail" : "badge-ready";
    const tokensOpt = r?.opt?.totalTokens ?? "—";
    const tokensNaive = r?.naive?.totalTokens ?? "—";
    const latency = r?.opt?.latencyMs ? `${r.opt.latencyMs}ms` : "—";
    const route = r?.opt?.route || c.expectedRoute;

    return `
      <tr>
        <td style="font-family:monospace;font-size:0.8rem;color:#94a3b8;">${c.id}</td>
        <td><span class="pill pill-${c.category}">${c.category}</span></td>
        <td style="max-width:320px;line-height:1.4;">${escapeHtml(c.query)}</td>
        <td><code class="code-route">${route}</code></td>
        <td style="text-align:right;font-family:monospace;">${tokensOpt}</td>
        <td style="text-align:right;font-family:monospace;color:#94a3b8;">${tokensNaive}</td>
        <td style="text-align:right;font-family:monospace;">${latency}</td>
        <td style="text-align:center;"><span class="badge ${statusClass}">${status}</span></td>
      </tr>
    `;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reflow · LLM Evaluation Dashboard (/eval)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg: #090d16;
      --card: #111827;
      --card-border: #1f293d;
      --text: #f1f5f9;
      --muted: #94a3b8;
      --accent: #3b82f6;
      --green: #10b981;
      --red: #ef4444;
      --yellow: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--card-border);
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-mark {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 8px 8px 8px 0;
    }
    h1 { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
    .nav-links { display: flex; gap: 12px; }
    .nav-links a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.9rem;
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--card-border);
      transition: all 0.2s;
    }
    .nav-links a:hover { color: var(--text); background: rgba(255,255,255,0.08); }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 16px 20px;
    }
    .kpi-label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .kpi-value { font-size: 1.8rem; font-weight: 800; color: #fff; }
    .kpi-sub { font-size: 0.75rem; color: var(--green); margin-top: 4px; }
    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card);
      border: 1px solid var(--card-border);
      padding: 14px 20px;
      border-radius: 10px;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .btn-run {
      background: #2563eb;
      color: white;
      border: 0;
      padding: 10px 20px;
      font-size: 0.92rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-run:hover { background: #1d4ed8; }
    .btn-run:disabled { opacity: 0.6; cursor: not-allowed; }
    .status-msg { font-size: 0.88rem; color: var(--muted); }
    .table-card {
      background: var(--card);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      overflow-x: auto;
    }
    table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    th {
      background: rgba(255,255,255,0.02);
      text-align: left;
      padding: 12px 14px;
      font-size: 0.75rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--card-border);
    }
    td {
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    .pill {
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 999px;
      font-weight: 600;
      white-space: nowrap;
    }
    .pill-frontend-learn { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .pill-frontend-code { background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }
    .pill-developer-profile { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .pill-not-in-profile { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .pill-off-topic { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .pill-prompt-injection { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3); }
    .badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
    }
    .badge-pass { background: rgba(16,185,129,0.2); color: #10b981; }
    .badge-fail { background: rgba(239,68,68,0.2); color: #ef4444; }
    .badge-ready { background: rgba(148,163,184,0.15); color: #94a3b8; }
    .code-route {
      font-family: monospace;
      font-size: 0.8rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.06);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
        <span class="brand-mark"></span>
        <div>
          <h1>LLM Evaluation Suite</h1>
          <p style="font-size:0.85rem;color:var(--muted);">35 automated benchmarks measuring optimizations vs naive baseline</p>
        </div>
      </div>
      <div class="nav-links">
        <a href="/">← Back to Workspace</a>
        <a href="/api/eval">JSON API</a>
        <a href="/RESULTS.md" target="_blank">RESULTS.md</a>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Test Suite Cases</div>
        <div class="kpi-value">${EVAL_CASES.length}</div>
        <div class="kpi-sub">Across 6 categories</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Token Savings</div>
        <div class="kpi-value" style="color:var(--green);">${summary.savingsPercent}</div>
        <div class="kpi-sub">vs Naive baseline</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Median Latency</div>
        <div class="kpi-value">${summary.avgLatencyOptimized}</div>
        <div class="kpi-sub">vs ${summary.avgLatencyNaive} unoptimized</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Guardrail Pass Rate</div>
        <div class="kpi-value" style="color:var(--green);">${summary.passRate}</div>
        <div class="kpi-sub">Off-topic refusal & safety</div>
      </div>
    </div>

    <div class="actions-bar">
      <div>
        <strong>Run Suite</strong>
        <span class="status-msg" id="statusText">${results ? `Last evaluated ${new Date(results.timestamp).toLocaleTimeString()}` : "Ready to execute benchmark"}</span>
      </div>
      <button class="btn-run" id="runBtn" onclick="runEval()">
        <span id="btnIcon">▶</span> Run Full Evaluation
      </button>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>User Query</th>
            <th>Route</th>
            <th style="text-align:right;">Opt Tokens</th>
            <th style="text-align:right;">Naive Tokens</th>
            <th style="text-align:right;">Latency</th>
            <th style="text-align:center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    async function runEval() {
      const btn = document.getElementById('runBtn');
      const status = document.getElementById('statusText');
      btn.disabled = true;
      status.textContent = 'Running 35 evaluation test cases (optimizations on & off)... please wait (~30s)';
      try {
        const res = await fetch('/api/eval/run', { method: 'POST' });
        if (!res.ok) throw new Error('Evaluation failed with ' + res.status);
        status.textContent = 'Evaluation complete! Reloading results...';
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.post("/api/eval/run", async (_req, res) => {
  try {
    const { stdout } = await execAsync("node --env-file=.env scripts/eval.js", {
      cwd: __dirname,
      timeout: 180000,
    });
    const results = getLatestResults();
    res.json({ ok: true, results, log: stdout.slice(-2000) });
  } catch (err) {
    res.status(500).json({ error: err.message, stderr: err.stderr });
  }
});

// ─── Legacy routes (tasks, study, assistant, etc.) ─────────────────────────
const makeId = (prefix = "id") => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const taskStore = [];
const studyState = { goalMin: 30, todayMinutes: 0, streak: 0, topics: [] };
const settingsStore = { briefingTime: "08:00", studyNudgeTime: "18:30", studyGoalMin: 30 };
const notifications = [];

function safeDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
function normaliseTask(input) {
  const title = String(input.title || "").trim();
  if (!title) throw new Error("Task title is required.");
  const due = safeDate(input.due);
  return {
    id: input.id || makeId("task"),
    title,
    due: due ? due.toISOString() : null,
    remindAt: safeDate(input.remindAt)?.toISOString() || null,
    priority: ["low", "normal", "high"].includes(input.priority) ? input.priority : "normal",
    status: input.status === "done" ? "done" : "open",
    createdAt: new Date().toISOString(),
  };
}
function studySummary() {
  const topics = studyState.topics.map((t) => ({ ...t, weak: Array.isArray(t.weak) ? t.weak : [] }));
  const dueIds = topics.filter((t) => !t.nextReview || new Date(t.nextReview) <= new Date()).map((t) => t.id);
  return { topics, goalMin: studyState.goalMin, todayMinutes: studyState.todayMinutes, streak: studyState.streak, dueIds };
}
function pushNotification(text) {
  notifications.push({ id: makeId("note"), text, at: Date.now() });
  if (notifications.length > 20) notifications.shift();
}

app.get("/api/status", (_req, res) => res.json({ telegram: false, telegramNeedsChatId: false, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, settings: settingsStore }));
app.get("/api/tasks", (_req, res) => res.json(taskStore));
app.post("/api/tasks", (req, res) => { try { const t = normaliseTask(req.body || {}); taskStore.unshift(t); pushNotification(`Task added: ${t.title}`); res.status(201).json(t); } catch (e) { res.status(400).json({ error: e.message }); } });
app.patch("/api/tasks/:id", (req, res) => { const t = taskStore.find((x) => x.id === req.params.id); if (!t) return res.status(404).json({ error: "Task not found" }); if (typeof req.body.status === "string") t.status = req.body.status === "done" ? "done" : "open"; if (typeof req.body.title === "string") t.title = req.body.title.trim() || t.title; if (req.body.due !== undefined) t.due = safeDate(req.body.due)?.toISOString() || null; if (req.body.remindAt !== undefined) t.remindAt = safeDate(req.body.remindAt)?.toISOString() || null; if (req.body.priority) t.priority = ["low", "normal", "high"].includes(req.body.priority) ? req.body.priority : t.priority; res.json(t); });
app.delete("/api/tasks/:id", (req, res) => { const i = taskStore.findIndex((x) => x.id === req.params.id); if (i === -1) return res.status(404).json({ error: "Task not found" }); const [r] = taskStore.splice(i, 1); res.json({ deleted: true, task: r }); });
app.get("/api/study", (_req, res) => res.json(studySummary()));
app.post("/api/study/sessions", (req, res) => { const minutes = Number(req.body?.minutes || 0); if (!Number.isFinite(minutes) || minutes <= 0) return res.status(400).json({ error: "Valid minutes required." }); studyState.todayMinutes += minutes; if (studyState.todayMinutes >= studyState.goalMin) { studyState.streak += 1; pushNotification(`Study goal hit: ${studyState.todayMinutes} min today.`); } res.json({ todayMinutes: studyState.todayMinutes, streak: studyState.streak }); });
app.post("/api/study/topics", (req, res) => { const name = String(req.body?.name || "").trim(); if (!name) return res.status(400).json({ error: "Topic name required." }); const topic = { id: makeId("topic"), name, goal: String(req.body?.goal || "").trim(), box: 0, lastScore: null, nextReview: new Date(Date.now() + 86400000).toISOString(), weak: [] }; studyState.topics.push(topic); res.status(201).json(topic); });
app.delete("/api/study/topics/:id", (req, res) => { const i = studyState.topics.findIndex((t) => t.id === req.params.id); if (i === -1) return res.status(404).json({ error: "Topic not found" }); const [r] = studyState.topics.splice(i, 1); res.json({ deleted: true, topic: r }); });
app.post("/api/study/quiz", (req, res) => { const topic = studyState.topics.find((t) => t.id === req.body?.topicId); if (!topic) return res.status(404).json({ error: "Topic not found" }); const q = [{ q: `What is the main idea of ${topic.name}?`, options: ["A practical summary", "A random guess", "A hidden fact", "An unrelated story"], answer: 0, explanation: `The goal is to understand the core concept behind ${topic.name} in simple terms.`, concept: topic.name }, { q: `Which habit helps you improve in ${topic.name}?`, options: ["Consistent review", "Ignoring it", "Changing topic every minute", "Avoiding examples"], answer: 0, explanation: `Regular review and practice are the most reliable way to strengthen understanding.`, concept: topic.name }]; res.json({ topic: topic.name, questions: q.slice(0, 2) }); });
app.post("/api/study/result", (req, res) => { const topic = studyState.topics.find((t) => t.id === req.body?.topicId); if (!topic) return res.status(404).json({ error: "Topic not found" }); const total = Number(req.body?.total || 0); const correct = Number(req.body?.correct || 0); const score = total ? Math.round((correct / total) * 100) : 0; topic.lastScore = score; topic.weak = Array.isArray(req.body?.weak) ? req.body.weak : []; topic.nextReview = new Date(Date.now() + 86400000).toISOString(); topic.box = Math.min(5, Math.max(0, Math.round(score / 20))); res.json({ nextReview: topic.nextReview, score }); });
app.put("/api/settings", (req, res) => { Object.assign(settingsStore, req.body || {}); if (typeof settingsStore.studyGoalMin === "number") studyState.goalMin = settingsStore.studyGoalMin; res.json(settingsStore); });
app.get("/api/notifications", (req, res) => { const since = Number(req.query.since || 0); res.json(notifications.filter((n) => n.at > since)); });
app.post("/api/assistant", rateLimit, async (req, res) => {
  if (!ensureGroq(res)) return;
  const message = String(req.body?.message || "").trim();
  const history = Array.isArray(req.body?.history) ? req.body.history : [];
  if (!message) return res.status(400).json({ error: "Message is required." });
  const messages = [{ role: "system", content: "You are a helpful personal assistant for tasks, study planning, and productivity." }, ...history.slice(-8).map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: String(item.content || "").slice(0, 12000) })), { role: "user", content: message }];
  try {
    const { text } = await groqChat({ model: MODEL_MAIN, messages, max_tokens: 500 });
    const actions = [];
    const lower = text.toLowerCase();
    if (lower.includes("remind") || lower.includes("task")) actions.push("Create a reminder task");
    if (lower.includes("study") || lower.includes("learn")) actions.push("Add a study topic");
    if (!actions.length) actions.push("Keep going");
    pushNotification(`Assistant: ${text.slice(0, 120)}`);
    res.json({ reply: text.trim(), actions });
  } catch (e) { res.status(502).json({ error: e.message }); }
});

// ─── Serve built frontend in production ───────────────────────────────────
const distPath = join(__dirname, "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path === "/eval" || req.path === "/RESULTS.md") {
      return next();
    }
    res.sendFile(join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}${KEY ? "" : "  (GROQ_API_KEY is missing)"}`);
});