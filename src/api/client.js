/**
 * Lightweight fetch wrapper.
 * - GET when no body is supplied, POST otherwise.
 * - Throws an Error whose `.message` is the server's `error` field (or a
 *   human-readable fallback) so callers never have to inspect raw responses.
 */
export async function api(path, { body, method } = {}) {
  const res = await fetch(path, {
    method: method || (body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

/**
 * Streaming chat helper — talks to /api/chat and calls `onToken` for every
 * incremental text chunk.  Returns the final usage object (or null).
 */
function friendlyError(status, msg) {
  if (status === 429) return "Rate limit reached. Wait a moment, then retry.";
  if (status === 401) return "The server's Groq key was rejected. Check GROQ_API_KEY.";
  if (status === 503) return msg || "The server has no Groq key configured.";
  return msg || `Request failed (${status}).`;
}

export async function streamChat({ messages, model, temperature, maxTokens, signal, onToken }) {
  let res;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model, temperature, maxTokens }),
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") throw e;
    throw new Error("Can't reach the server. Is it running, and are you online?");
  }
  if (!res.ok) {
    let msg;
    try { msg = (await res.json()).error; } catch { /* non-JSON body */ }
    throw new Error(friendlyError(res.status, msg));
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let usage = null;
  for (;;) {
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
        if (t) onToken(t);
        usage = j.x_groq?.usage || j.usage || usage;
      } catch { /* partial or keep-alive line */ }
    }
  }
  return usage;
}
