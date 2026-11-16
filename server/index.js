// Minimal chat proxy: keeps ANTHROPIC_API_KEY on the server. Run with `npm run server`.
import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";
const app = express();
app.use(express.json({ limit: "1mb" }));
let client;
app.post("/api/chat", async (req, res) => {
  try {
    const { system, messages } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "messages required" });
    client ||= new Anthropic(); // reads ANTHROPIC_API_KEY
    const out = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 1200, system: String(system || "").slice(0, 20000),
      messages: messages.slice(-12).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 20000) })),
    });
    res.json({ text: out.content.filter((b) => b.type === "text").map((b) => b.text).join("") });
  } catch (e) { res.status(500).json({ error: e.message || "Chat request failed" }); }
});
const port = process.env.PORT || 8787;
app.listen(port, () => console.log("Chat proxy listening on :" + port));
