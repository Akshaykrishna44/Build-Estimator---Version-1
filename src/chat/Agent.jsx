import { useEffect, useRef, useState } from "react";
import { ask } from "./api.js";
import { buildContext } from "./context.js";
import { parseActions, reduce, describe, SYSTEM } from "./actions.js";
const TOPICS = [["Estimate", ["Summarize this estimate", "Plan a 2-floor warehouse on 4,000 m²"]], ["Quantities and workers", ["Which trade needs the most workers?"]], ["Rates and reports", ["Which rates should I verify first?", "What should I check before exporting a report?"]]];
const OBS = "SYSTEM: the actions above were applied. Updated project data is attached. Continue only if more steps are needed; otherwise reply with a short final summary and no actions block.";
export default function Agent({ S, setS, E, setE }) {
  const [msgs, setMsgs] = useState([]), [text, setText] = useState(""), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [share, setShare] = useState(true);
  const live = useRef({ S, E }), hist = useRef([]), ctl = useRef(null), end = useRef(null);
  live.current = { S, E };
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, busy]);
  const run = async (q) => {
    q = (q ?? text).trim(); if (!q || busy) return;
    setText(""); setErr(""); setBusy(true); setMsgs((m) => [...m, { role: "user", content: q }]);
    ctl.current = new AbortController();
    let cur = live.current, msg = q;
    try {
      for (let round = 0; round < 4; round++) {
        const ctx = share ? `PROJECT DATA:\n${buildContext(cur.S, cur.E)}\n\n` : "";
        const raw = await ask({ system: SYSTEM, messages: [...hist.current.slice(-10), { role: "user", content: ctx + msg }], signal: ctl.current.signal });
        hist.current = [...hist.current, { role: "user", content: msg }, { role: "assistant", content: raw }].slice(-14);
        const { shown, actions } = parseActions(raw); let undo = null;
        if (actions.length) {
          let next = cur;
          for (const a of actions) { if (a.type === "navigate") location.hash = a.to; else next = reduce(next, a); }
          if (next !== cur) { undo = cur; setS(() => next.S); setE(() => next.E); cur = next; }
        }
        setMsgs((m) => [...m, { role: "assistant", content: shown || (actions.length ? "" : "Done."), log: actions, undo }]);
        if (!actions.length) break;
        msg = OBS;
      }
    } catch (e) { setErr(e.name === "AbortError" ? "Stopped." : e.message || "Something went wrong."); }
    setBusy(false);
  };
  const undo = (i) => { const u = msgs[i].undo; setS(() => u.S); setE(() => u.E); setMsgs((m) => m.map((x, j) => (j === i ? { ...x, undone: true } : x))); };
  return (
    <div className="agent">
      <div className="msgs">
        {!msgs.length && <div className="hint"><p className="mut sm">Ask about this project, or tell me what to do: I can set up estimates, add quantities, rates and projects, and open screens. Changes apply right away and you can undo them.</p>{TOPICS.map(([t, hs]) => <div className="topic" key={t}><b>{t}</b>{hs.map((h) => <button key={h} className="chip" onClick={() => run(h)}>{h}</button>)}</div>)}</div>}
        {msgs.map((m, i) => <div key={i} className={"msg " + m.role}>
          {m.content && <div className="bub">{m.content}</div>}
          {m.log?.length > 0 && <div className="act"><ul>{m.log.map((a, j) => <li key={j}>{describe(a)}</li>)}</ul>{m.undo && (m.undone ? <em>Undone</em> : <button className="btn s" onClick={() => undo(i)}>Undo</button>)}</div>}
        </div>)}
        {busy && <div className="msg assistant"><div className="bub mut">Working…</div></div>}
        {err && <p className="am sm">{err}</p>}<div ref={end} />
      </div>
      <div className="foot">
        <div className="row2"><label className="ck"><input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} />Include my project data</label><button className="lnk" onClick={() => { setMsgs([]); hist.current = []; setErr(""); }}>New chat</button></div>
        <div className="row"><textarea rows="2" value={text} placeholder="Enter your queries…" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); run(); } }} />
          {busy ? <button className="btn" onClick={() => ctl.current?.abort()}>Stop</button> : <button className="btn p" onClick={() => run()} disabled={!text.trim()}>Send</button>}</div>
        <p className="mut sm">Answers can be wrong. Verify rates and quantities with a qualified engineer.</p>
      </div>
    </div>);
}
