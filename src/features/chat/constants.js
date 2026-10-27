/* ---------- model registry ---------- */
export const MODEL_LABELS = {
  "llama-3.3-70b-versatile": "Llama 3.3 70B",
  "meta-llama/llama-4-scout-17b-16e-instruct": "Llama 4 Scout",
  "openai/gpt-oss-20b": "Fast GPT OSS",
};

export const FALLBACK_MODELS = Object.entries(MODEL_LABELS).map(([value, label]) => ({ value, label }));

export const STYLES = [
  { label: "Balanced", value: "balanced", text: "" },
  { label: "Creative", value: "creative", text: "" },
  { label: "Technical", value: "technical", text: "" },
  { label: "Concise", value: "concise", text: "" },
];

export const STARTERS = [
  "Explain the critical rendering path",
  "What's the difference between useMemo and useCallback?",
  "How do I improve my LCP score?",
  "What are CSS custom properties good for?",
];

export const DEFAULTS = {
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 900,
  instructions: "",
  // optimisation toggles
  useRouter: true,
  useRag: true,
  useCache: true,
  useSummary: true,
  useTrimming: true,
};

export const STORAGE_KEYS = {
  convos: "ia.convos.v3",
  active: "ia.active.v3",
  settings: "ia.settings.v3",
};

// Chat modes
export const CHAT_MODES = [
  { value: "auto", label: "Auto" },
  { value: "learn", label: "Learn" },
  { value: "developer", label: "Profile" },
];
