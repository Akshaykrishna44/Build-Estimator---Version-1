// Transport: inside Claude's artifact viewer use the sample capability; otherwise call the proxy in server/.
export async function ask({ system, messages, signal }) {
  let sample = null;
  try { sample = await window.claude?.use?.("sample"); } catch { /* not in Claude */ }
  if (sample) {
    const m = messages.map((x, i) => (i === messages.length - 1 ? { ...x, content: system + "\n\n" + x.content } : x));
    return (await sample(m, { cache: false, signal })).text;
  }
  const res = await fetch(import.meta.env.VITE_CHAT_URL || "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system, messages }), signal });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Chat service unavailable (" + res.status + ")");
  return (await res.json()).text;
}
