/* ---------- model registry ---------- */
export const MODEL_LABELS = {
  "openai/gpt-oss-20b":  "GPT-OSS 20B (Fast)",
  "openai/gpt-oss-120b": "GPT-OSS 120B (Powerful)",
  "qwen/qwen3.8-27b":    "Qwen 3.8 27B (Balanced)",
  "allam-2-7b":          "ALLaM 2 7B (Cheap)",
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
  model: "qwen/qwen3.8-27b",
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
  { value: "job_match", label: "Job Match" },
];
