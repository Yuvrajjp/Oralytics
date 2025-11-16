"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function ChatPanel({ context }: { context: any }) {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `Context loaded: ${context?.label || "Organism/Gene"}`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          context,
          messages: [...messages, userMessage]
        })
      });

      const data = await res.json();
      setMessages((prev) => [...prev, data]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error reaching model." }
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm p-4 md:p-6 flex flex-col">
      
      {/* HEADER */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Oralytics Lab Assistant
        </h3>
        <p className="text-sm text-neutral-600">
          Ask questions about this {context?.type || "record"}.
        </p>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] p-3 rounded-xl ${
              m.role === "user"
                ? "ml-auto bg-black text-white"
                : m.role === "system"
                ? "mx-auto text-xs text-neutral-500 italic"
                : "bg-neutral-100 text-neutral-800"
            }`}
          >
            {m.content}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-neutral-500 text-sm"
          >
            Thinking…
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT */}
      <div className="mt-4 flex gap-3">
        <input
          className="flex-1 border border-neutral-300 rounded-xl px-4 py-2"
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="px-6 py-2 bg-black text-white rounded-xl hover:bg-neutral-800 transition"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
