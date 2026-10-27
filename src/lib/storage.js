/** uid, load/save localStorage helpers shared by all features. */

export const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

export const load = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; }
};

export const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ }
};
