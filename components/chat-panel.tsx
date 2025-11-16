"use client";

import { useState, type FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

interface ChatPanelProps {
  context: string;
}

export function ChatPanel({ context }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }

    const prompt = input.trim();
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setInput("");
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context }),
      });

      if (!response.ok) {
        throw new Error("Unable to fetch response");
      }

      const data = (await response.json()) as { reply: string; citations?: string[] };
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply, citations: data.citations ?? [] },
      ]);
    } catch (err) {
      console.error(err);
      setError("Chat endpoint is unavailable. Try again shortly.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/40">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Annotation copilot</p>
        <h3 className="text-lg font-semibold text-white">Ask the lab console</h3>
        <p className="text-sm text-slate-400">
          The assistant is pre-loaded with this page&rsquo;s metadata so you can sketch follow-up assays quickly.
        </p>
      </div>
      <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl bg-slate-900/60 p-3 text-sm font-mono text-slate-100">
        {messages.length === 0 ? (
          <p className="text-slate-500">No conversation yet. Ask how this profile compares to other isolates.</p>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className="space-y-1">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                {message.role === "user" ? "Scientist" : "Console"}
              </p>
              <p className={message.role === "assistant" ? "text-slate-100" : "text-sky-300"}>{message.content}</p>
              {message.role === "assistant" && message.citations && message.citations.length > 0 && (
                <ul className="list-disc space-y-1 pl-4 text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">
                  {message.citations.map((citation) => (
                    <li key={citation}>{citation}</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend} className="space-y-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about pathways, literature, or genes..."
          className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
          rows={3}
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center justify-center rounded-full bg-sky-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? "Analyzing..." : "Send"}
        </button>
      </form>
    </section>
  );
}
