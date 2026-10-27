import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../api/client.js";

/**
 * useAssistant — all state & side-effects for the Assistant feature.
 */
export function useAssistant() {
  const [tab, setTab] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [study, setStudy] = useState({ topics: [], goalMin: 30, todayMinutes: 0, streak: 0, dueIds: [] });
  const [status, setStatus] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [error, setError] = useState("");
  const [cmd, setCmd] = useState("");
  const [cmdBusy, setCmdBusy] = useState(false);
  const [reply, setReply] = useState(null);
  const [form, setForm] = useState({ title: "", due: "", priority: "normal", remind: "15" });
  const [topicForm, setTopicForm] = useState({ name: "", goal: "" });
  const [quiz, setQuiz] = useState(null);
  const histRef = useRef([]);
  const sinceRef = useRef(Date.now());

  const refresh = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([api("/api/tasks"), api("/api/study")]);
      setTasks(t);
      setStudy(s);
      setError((e) => (e.startsWith("Can't reach") ? "" : e));
    } catch (e) {
      setError(e.message.includes("Failed to fetch") ? "Can't reach the server. Is `npm run server` running?" : e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    api("/api/status").then(setStatus).catch(() => {});
    const a = setInterval(refresh, 30000);
    const b = setInterval(async () => {
      try {
        const list = await api(`/api/notifications?since=${sinceRef.current}`);
        if (!list.length) return;
        sinceRef.current = Math.max(...list.map((n) => n.at));
        setToasts((p) => [...p, ...list].slice(-4));
        if ("Notification" in window && Notification.permission === "granted") {
          list.forEach((n) => new Notification("Assistant", { body: n.text.slice(0, 200) }));
        }
        refresh();
      } catch { /* offline: try again next tick */ }
    }, 20000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [refresh]);

  const act = async (fn) => {
    setError("");
    try { await fn(); await refresh(); } catch (e) { setError(e.message); }
  };

  /* ---------- tasks ---------- */
  const addTask = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Give the task a title.");
    const due = form.due ? new Date(form.due) : null;
    const remindAt = due && form.remind !== "" ? new Date(due.getTime() - Number(form.remind) * 60000).toISOString() : null;
    act(async () => {
      await api("/api/tasks", { body: { title: form.title, due: due?.toISOString() || null, remindAt, priority: form.priority } });
      setForm({ title: "", due: "", priority: "normal", remind: "15" });
    });
  };
  const toggle = (t) => act(() => api(`/api/tasks/${t.id}`, { method: "PATCH", body: { status: t.status === "done" ? "open" : "done" } }));
  const remove = (t) => act(() => api(`/api/tasks/${t.id}`, { method: "DELETE" }));

  /* ---------- command bar ---------- */
  const send = async (e) => {
    e.preventDefault();
    const text = cmd.trim();
    if (!text || cmdBusy) return;
    setCmdBusy(true); setError(""); setCmd("");
    try {
      const r = await api("/api/assistant", { body: { message: text, history: histRef.current } });
      histRef.current = [...histRef.current, { role: "user", content: text }, { role: "assistant", content: r.reply }].slice(-8);
      setReply(r);
      await refresh();
    } catch (err) { setCmd(text); setError(err.message); }
    setCmdBusy(false);
  };

  /* ---------- study / quiz ---------- */
  const startQuiz = async (topic) => {
    setTab("study");
    setQuiz({ topic: topic.name, topicId: topic.id, loading: true });
    try {
      const q = await api("/api/study/quiz", { body: { topicId: topic.id, count: 5 } });
      setQuiz({ topic: q.topic, topicId: topic.id, questions: q.questions, i: 0, picked: null, correct: 0, weak: [], result: null });
    } catch (err) { setQuiz(null); setError(err.message); }
  };
  const pick = (idx) => {
    if (quiz.picked !== null) return;
    const q = quiz.questions[quiz.i];
    const right = idx === q.answer;
    setQuiz({ ...quiz, picked: idx, correct: quiz.correct + (right ? 1 : 0), weak: right ? quiz.weak : [...quiz.weak, q.concept || q.q.slice(0, 60)] });
  };
  const next = async () => {
    if (quiz.i + 1 < quiz.questions.length) return setQuiz({ ...quiz, i: quiz.i + 1, picked: null });
    try {
      const r = await api("/api/study/result", { body: { topicId: quiz.topicId, correct: quiz.correct, total: quiz.questions.length, weak: quiz.weak } });
      setQuiz({ ...quiz, result: r });
      refresh();
    } catch (err) { setError(err.message); }
  };

  /* ---------- derived ---------- */
  const open = tasks.filter((t) => t.status === "open").sort((a, b) => (a.due || "9").localeCompare(b.due || "9"));
  const done = tasks.filter((t) => t.status === "done").slice(0, 8);
  const now = Date.now();
  const midnight = new Date(); midnight.setHours(24, 0, 0, 0);
  const overdue = open.filter((t) => t.due && new Date(t.due) < now);
  const today = open.filter((t) => t.due && new Date(t.due) >= now && new Date(t.due) < midnight);
  const later = open.filter((t) => t.due && new Date(t.due) >= midnight);
  const undated = open.filter((t) => !t.due);
  const dueTopics = study.topics.filter((t) => study.dueIds.includes(t.id));
  const pct = Math.min(100, Math.round((study.todayMinutes / study.goalMin) * 100));

  return {
    // state
    tab, setTab, tasks, study, status, toasts, setToasts,
    error, cmd, setCmd, cmdBusy, reply, setReply,
    form, setForm, topicForm, setTopicForm, quiz, setQuiz,
    // derived
    open, done, overdue, today, later, undated, dueTopics, pct,
    // actions
    addTask, toggle, remove, send, startQuiz, pick, next, act, refresh,
  };
}
