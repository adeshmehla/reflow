import { useEffect, useState } from "react";
import { api } from "../../api/client.js";
import { useAssistant } from "./useAssistant.js";

const fmtDue = (iso) =>
  new Date(iso).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const REMIND = [["", "No reminder"], ["0", "At the deadline"], ["15", "15 min before"], ["60", "1 hour before"], ["1440", "1 day before"]];
const BOX_LABEL = ["New", "Learning", "Familiar", "Solid", "Strong", "Mastered"];

function TaskRow({ t, late, toggle, remove }) {
  return (
    <li className={`as-task ${t.status === "done" ? "done" : ""}`}>
      <button className="as-check" onClick={() => toggle(t)} aria-label={t.status === "done" ? `Reopen ${t.title}` : `Complete ${t.title}`} aria-pressed={t.status === "done"} />
      <div>
        <span className="as-title">{t.title}{t.priority === "high" && <em> high priority</em>}</span>
        {t.due && <span className={`as-when ${late ? "late" : ""}`}>{fmtDue(t.due)}{t.remindAt && t.status === "open" ? ` · reminder ${fmtDue(t.remindAt)}` : ""}</span>}
      </div>
      <button className="as-x" onClick={() => remove(t)} aria-label={`Delete ${t.title}`}>Delete</button>
    </li>
  );
}

function Group({ label, list, late, toggle, remove }) {
  return list.length > 0 && (
    <section>
      <h3>{label}</h3>
      <ul className="as-list">{list.map((t) => <TaskRow key={t.id} t={t} late={late} toggle={toggle} remove={remove} />)}</ul>
    </section>
  );
}

function Settings({ status, onSave }) {
  const s = status?.settings;
  const [v, setV] = useState(null);
  useEffect(() => { if (s) setV({ briefingTime: s.briefingTime, studyNudgeTime: s.studyNudgeTime, studyGoalMin: s.studyGoalMin }); }, [s]);
  if (!v) return null;
  return (
    <details className="as-settings">
      <summary>Reminder times and study goal</summary>
      <div className="as-form">
        <label>Morning briefing<input type="time" value={v.briefingTime} onChange={(e) => setV({ ...v, briefingTime: e.target.value })} /></label>
        <label>Study check-in<input type="time" value={v.studyNudgeTime} onChange={(e) => setV({ ...v, studyNudgeTime: e.target.value })} /></label>
        <label>Daily goal (min)<input type="number" min="5" max="600" value={v.studyGoalMin} onChange={(e) => setV({ ...v, studyGoalMin: e.target.value })} /></label>
        <button className="as-btn solid" onClick={() => onSave(v)}>Save</button>
      </div>
      <p className="as-hint">Time zone: {status.tz}. Briefings and check-ins are sent through Telegram and shown here.</p>
    </details>
  );
}

export default function Assistant({ floating = false }) {
  const {
    tab, setTab, study, status, toasts, setToasts,
    error, cmd, setCmd, cmdBusy, reply, setReply,
    form, setForm, topicForm, setTopicForm, quiz, setQuiz,
    overdue, today, later, undated, done, dueTopics, pct,
    addTask, toggle, remove, send, startQuiz, pick, next, act,
  } = useAssistant();

  return (
    <div className={floating ? "as floating" : "as"}>
      <style>{css}</style>

      <header className="as-top">
        <span className="as-mark" aria-hidden="true" /><strong>Assistant</strong>
        <nav aria-label="Sections">
          {["today", "tasks", "study"].map((k) => (
            <button key={k} aria-current={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              {k === "today" ? "Today" : k === "tasks" ? "Tasks" : "Study"}
            </button>
          ))}
        </nav>
        {"Notification" in window && Notification.permission === "default" && (
          <button className="as-link" onClick={() => Notification.requestPermission().then(() => setToasts((p) => [...p]))}>Enable desktop alerts</button>
        )}
      </header>

      {toasts.length > 0 && (
        <div className="as-toasts" aria-live="polite">
          {toasts.map((n) => (
            <div key={n.id} className="as-toast"><p>{n.text}</p><button onClick={() => setToasts((p) => p.filter((x) => x.id !== n.id))} aria-label="Dismiss">Dismiss</button></div>
          ))}
        </div>
      )}

      <main className="as-main">
        {error && <div className="as-error" role="alert">{error}</div>}

        {tab === "today" && (
          <>
            <h1>{new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</h1>
            <div className="as-cols">
              <section>
                <h3>Needs attention</h3>
                {overdue.length + today.length === 0
                  ? <p className="as-empty">Nothing due today. Add something below, or tell the assistant.</p>
                  : <ul className="as-list">{overdue.map((t) => <TaskRow key={t.id} t={t} late toggle={toggle} remove={remove} />)}{today.map((t) => <TaskRow key={t.id} t={t} toggle={toggle} remove={remove} />)}</ul>
                }
              </section>
              <section>
                <h3>Study</h3>
                <div className="as-bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label="Study goal today"><i style={{ width: pct + "%" }} /></div>
                <p className="as-sub">{study.todayMinutes} of {study.goalMin} min today · {study.streak}-day streak</p>
                {dueTopics.length > 0
                  ? <ul className="as-list">{dueTopics.map((t) => <li key={t.id} className="as-row"><span>{t.name}</span><button className="as-btn" onClick={() => startQuiz(t)}>Quiz me</button></li>)}</ul>
                  : <p className="as-empty">{study.topics.length ? "No reviews due. Nice." : "Add a topic in the Study tab to start spaced reviews."}</p>
                }
              </section>
            </div>
            <Settings status={status} onSave={(s) => act(async () => {
              await api("/api/settings", { method: "PUT", body: s });
            })} />
          </>
        )}

        {tab === "tasks" && (
          <>
            <h1>Tasks</h1>
            <form className="as-form" onSubmit={addTask}>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What needs doing?" aria-label="Task title" />
              <input type="datetime-local" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} aria-label="Deadline" />
              <select value={form.remind} onChange={(e) => setForm({ ...form, remind: e.target.value })} aria-label="Reminder" disabled={!form.due}>{REMIND.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} aria-label="Priority"><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select>
              <button className="as-btn solid">Add</button>
            </form>
            <Group label="Overdue" list={overdue} late toggle={toggle} remove={remove} />
            <Group label="Today" list={today} toggle={toggle} remove={remove} />
            <Group label="Upcoming" list={later} toggle={toggle} remove={remove} />
            <Group label="No date" list={undated} toggle={toggle} remove={remove} />
            {overdue.length + today.length + later.length + undated.length === 0 && <p className="as-empty">All clear.</p>}
            <Group label="Recently done" list={done} toggle={toggle} remove={remove} />
          </>
        )}

        {tab === "study" && !quiz && (
          <>
            <h1>Study</h1>
            <div className="as-bar" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" aria-label="Study goal today"><i style={{ width: pct + "%" }} /></div>
            <p className="as-sub">{study.todayMinutes} of {study.goalMin} min today · {study.streak}-day streak</p>
            <div className="as-quick">
              <span>Log time:</span>
              {[10, 25, 45].map((m) => <button key={m} className="as-btn" onClick={() => act(() => api("/api/study/sessions", { body: { minutes: m } }))}>{m} min</button>)}
            </div>
            <h3>Topics</h3>
            <ul className="as-list">
              {study.topics.map((t) => (
                <li key={t.id} className="as-topic">
                  <div>
                    <span className="as-title">{t.name}</span>
                    <span className="as-when">{BOX_LABEL[t.box]}{t.lastScore !== null ? ` · last score ${t.lastScore}%` : ""} · {study.dueIds.includes(t.id) ? "review due now" : `next review ${t.nextReview}`}</span>
                    {t.weak.length > 0 && <span className="as-when">To revisit: {t.weak.join(", ")}</span>}
                  </div>
                  <button className="as-btn" onClick={() => startQuiz(t)}>Quiz me</button>
                  <button className="as-x" onClick={() => act(() => api(`/api/study/topics/${t.id}`, { method: "DELETE" }))} aria-label={`Delete ${t.name}`}>Delete</button>
                </li>
              ))}
            </ul>
            {study.topics.length === 0 && <p className="as-empty">No topics yet. Add what you're learning and the coach will schedule reviews.</p>}
            <form className="as-form" onSubmit={(e) => { e.preventDefault(); act(async () => { await api("/api/study/topics", { body: topicForm }); setTopicForm({ name: "", goal: "" }); }); }}>
              <input value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} placeholder="Topic, e.g. Organic chemistry: alkenes" aria-label="Topic name" />
              <input value={topicForm.goal} onChange={(e) => setTopicForm({ ...topicForm, goal: e.target.value })} placeholder="Goal (optional), e.g. exam on 12 Nov" aria-label="Goal" />
              <button className="as-btn solid" disabled={!topicForm.name.trim()}>Add topic</button>
            </form>
          </>
        )}

        {tab === "study" && quiz && (
          <section>
            <h1>{quiz.topic}</h1>
            {quiz.loading && <p className="as-sub" role="status">Writing your quiz…</p>}
            {quiz.questions && !quiz.result && (() => {
              const q = quiz.questions[quiz.i];
              return (
                <>
                  <p className="as-sub">Question {quiz.i + 1} of {quiz.questions.length}</p>
                  <p className="as-q">{q.q}</p>
                  <div className="as-opts">
                    {q.options.map((o, idx) => (
                      <button key={idx} onClick={() => pick(idx)} disabled={quiz.picked !== null}
                        className={quiz.picked === null ? "" : idx === q.answer ? "right" : idx === quiz.picked ? "wrong" : "dim"}>{o}</button>
                    ))}
                  </div>
                  {quiz.picked !== null && (
                    <>
                      <p className="as-expl">{quiz.picked === q.answer ? "Correct. " : "Not quite. "}{q.explanation}</p>
                      <button className="as-btn solid" onClick={next}>{quiz.i + 1 < quiz.questions.length ? "Next question" : "Finish"}</button>
                    </>
                  )}
                </>
              );
            })()}
            {quiz.result && (
              <>
                <p className="as-q">You got {quiz.correct} of {quiz.questions.length}.</p>
                <p className="as-sub">Next review: {quiz.result.nextReview}.{quiz.weak.length ? ` Next quiz will focus on: ${quiz.weak.join(", ")}.` : ""}</p>
              </>
            )}
            {!quiz.loading && <button className="as-link" onClick={() => setQuiz(null)}>{quiz.result ? "Back to topics" : "Leave quiz"}</button>}
          </section>
        )}
      </main>

      <form className="as-cmd" onSubmit={send}>
        {reply && (
          <div className="as-reply" role="status">
            <p>{reply.reply}</p>
            {reply.actions?.length > 0 && <ul>{reply.actions.map((a, i) => <li key={i}>{a}</li>)}</ul>}
            <button type="button" onClick={() => setReply(null)} aria-label="Dismiss reply">Dismiss</button>
          </div>
        )}
        <div className="as-cmdrow">
          <input value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder='Try "remind me to call the bank tomorrow at 4pm" or "I studied chemistry for 40 minutes"' aria-label="Tell the assistant what to do" />
          <button disabled={cmdBusy || !cmd.trim()}>{cmdBusy ? "Working" : "Send"}</button>
        </div>
        <p className="as-hint">
          {status?.telegram ? "Telegram is connected: you'll get reminders there, and can message your bot the same way." :
            status?.telegramNeedsChatId ? "Telegram bot found. Message it once to get your chat id, then add it to .env." :
            "Reminders show here while this tab is open. Connect Telegram to get them anywhere."}
        </p>
      </form>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&display=swap');
.as{--paper:#e9eeea;--panel:#f6f8f5;--ink:#15211d;--muted:#5d6c66;--line:#c4cfc8;--blue:#2438d9;--blue-ink:#fff;--ok:#1d7a4d;--err-bg:#fbe3df;--err:#8d2417;
  min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;background:var(--paper);color:var(--ink);font-family:'Bricolage Grotesque',system-ui,sans-serif}
.as *{box-sizing:border-box}
@media (prefers-color-scheme:dark){.as{--paper:#0f1815;--panel:#16221e;--ink:#e4ece7;--muted:#8da198;--line:#2b3b35;--blue:#7f8cff;--blue-ink:#0b1020;--ok:#5fd39a;--err-bg:#3a1c18;--err:#ffb8ad}}
.as button,.as select,.as input{font-family:inherit}.as button{cursor:pointer}.as button:disabled{cursor:not-allowed;opacity:.5}
.as :focus-visible{outline:2px solid var(--blue);outline-offset:2px}
.as-top{display:flex;align-items:center;gap:14px;padding:14px clamp(16px,4vw,40px);border-bottom:1px solid var(--line);flex-wrap:wrap}
.as-mark{width:18px;height:18px;background:var(--blue);border-radius:50% 50% 50% 0}
.as-top nav{display:flex;border:1.5px solid var(--ink);border-radius:4px;overflow:hidden;margin-left:8px}
.as-top nav button{background:none;border:0;color:var(--ink);padding:7px 16px;font-weight:600;font-size:.9rem;border-right:1px solid var(--line)}
.as-top nav button:last-child{border-right:0}.as-top nav button.on{background:var(--ink);color:var(--paper)}
.as-link{margin-left:auto;background:none;border:0;border-bottom:1px solid var(--line);color:var(--muted);font-size:.85rem;padding:3px 0}.as-link:hover{color:var(--ink);border-color:var(--ink)}
.as-main{flex:1;width:100%;max-width:820px;margin:0 auto;padding:28px clamp(16px,4vw,40px) 40px}
.as h1{margin:0 0 22px;font-size:clamp(1.9rem,5vw,2.8rem);font-weight:800;letter-spacing:-.04em;line-height:1}
.as h3{margin:26px 0 10px;font-size:.88rem;font-weight:600;color:var(--muted)}
.as-cols{display:grid;grid-template-columns:1.2fr 1fr;gap:0 40px}
.as-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.as-list>li{border-bottom:1px solid var(--line)}
.as-task,.as-topic,.as-row{display:flex;align-items:center;gap:12px;padding:12px 2px}
.as-task>div,.as-topic>div{flex:1;display:grid;gap:2px;min-width:0}
.as-row span{flex:1}
.as-title{font-weight:600;overflow-wrap:anywhere}.as-title em{font-style:normal;color:var(--blue);font-size:.78rem;font-weight:600;margin-left:8px}
.as-when{font-size:.82rem;color:var(--muted)}.as-when.late{color:var(--err);font-weight:600}
.as-task.done .as-title{text-decoration:line-through;color:var(--muted)}
.as-check{width:22px;height:22px;border:2px solid var(--ink);background:transparent;border-radius:4px;flex-shrink:0;position:relative}
.as-check:hover{border-color:var(--blue)}.as-check[aria-pressed=true]{background:var(--ink)}
.as-check[aria-pressed=true]::after{content:"";position:absolute;left:6px;top:2px;width:6px;height:11px;border:solid var(--paper);border-width:0 2px 2px 0;transform:rotate(45deg)}
.as-x{background:none;border:0;color:var(--muted);font-size:.78rem;padding:4px}.as-x:hover{color:var(--err);text-decoration:underline}
.as-empty,.as-sub,.as-hint{color:var(--muted);font-size:.92rem;margin:8px 0}
.as-btn{border:1.5px solid var(--ink);background:none;color:var(--ink);border-radius:4px;padding:7px 14px;font-weight:600;font-size:.88rem}
.as-btn:hover:not(:disabled){background:var(--panel)}.as-btn.solid{background:var(--blue);border-color:var(--blue);color:var(--blue-ink)}.as-btn.solid:hover:not(:disabled){filter:brightness(1.1);background:var(--blue)}
.as-form{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 8px;align-items:end}
.as-form input,.as-form select{border:1.5px solid var(--ink);background:var(--panel);color:var(--ink);border-radius:4px;padding:9px 10px;font-size:.92rem;min-width:0}
.as-form>input:first-child{flex:2 1 220px}.as-form>input:nth-child(2){flex:1 1 180px}
.as-form label{display:grid;gap:4px;font-size:.8rem;color:var(--muted)}
.as-bar{height:10px;background:var(--panel);border:1.5px solid var(--ink);border-radius:2px;overflow:hidden}.as-bar i{display:block;height:100%;background:var(--blue);transition:width .4s}
.as-quick{display:flex;align-items:center;gap:8px;margin:14px 0;font-size:.9rem;color:var(--muted);flex-wrap:wrap}
.as-q{font-size:1.35rem;font-weight:600;letter-spacing:-.02em;line-height:1.3;margin:14px 0}
.as-opts{display:grid;gap:8px;margin-bottom:14px}
.as-opts button{text-align:left;padding:12px 14px;border:1.5px solid var(--ink);background:var(--panel);color:var(--ink);border-radius:4px;font-size:1rem}
.as-opts button:hover:not(:disabled){border-color:var(--blue);box-shadow:3px 3px 0 var(--blue)}
.as-opts .right{background:var(--ok);border-color:var(--ok);color:#fff;opacity:1}.as-opts .wrong{background:var(--err-bg);border-color:var(--err);color:var(--err);opacity:1}.as-opts .dim{opacity:.55}
.as-expl{margin:0 0 14px;font-size:.95rem;line-height:1.5}
.as-error{margin-bottom:18px;padding:10px 14px;border-left:4px solid var(--err);background:var(--err-bg);color:var(--err);font-size:.92rem}
.as-settings{margin-top:36px;border-top:1px solid var(--line);padding-top:14px}.as-settings summary{cursor:pointer;font-weight:600;font-size:.9rem;margin-bottom:12px}
.as-toasts{position:fixed;top:14px;right:14px;z-index:20;display:grid;gap:8px;max-width:min(360px,calc(100vw - 28px))}
.as-toast{background:var(--ink);color:var(--paper);padding:12px 14px;border-radius:4px;box-shadow:4px 4px 0 var(--blue)}.as-toast p{margin:0 0 6px;white-space:pre-wrap;font-size:.92rem}
.as-toast button,.as-reply button{background:none;border:0;color:inherit;opacity:.75;font-size:.78rem;padding:0;text-decoration:underline}
.as-cmd{position:sticky;bottom:0;background:linear-gradient(to top,var(--paper) 80%,transparent);padding:10px clamp(16px,4vw,40px) 16px;width:100%;max-width:820px;margin:0 auto}
.as-reply{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--blue);padding:12px 14px;margin-bottom:10px;border-radius:4px}
.as-reply p{margin:0 0 6px;white-space:pre-wrap;line-height:1.5}.as-reply ul{margin:0 0 8px;padding-left:18px;color:var(--ok);font-size:.88rem}
.as-cmdrow{display:flex;background:var(--panel);border:1.5px solid var(--ink);border-radius:6px}.as-cmdrow:focus-within{border-color:var(--blue);box-shadow:4px 4px 0 var(--blue)}
.as-cmdrow input{flex:1;border:0;background:transparent;color:var(--ink);padding:14px 16px;font-size:1rem;outline:none;min-width:0}
.as-cmdrow button{border:0;background:var(--blue);color:var(--blue-ink);font-weight:800;padding:0 22px;border-radius:0 4px 4px 0}
@media (max-width:720px){.as-cols{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.as *{transition:none!important}}
`;
