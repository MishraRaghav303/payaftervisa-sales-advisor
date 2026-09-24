"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "customer" | "advisor";
  content: string;
};

function getSessionToken(): string {
  const key = "pav_session_token";
  let token = window.localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(key, token);
  }
  return token;
}

export default function ChatPage() {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getSessionToken();
    setSessionToken(token);

    fetch(`/api/conversation?sessionToken=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages?.length) {
          setChatMessages(
            data.messages
              .filter((m: { role: string }) => m.role === "customer" || m.role === "advisor")
              .map((m: { role: string; content: string }) => ({
                role: m.role,
                content: m.content,
              })),
          );
        } else {
          setChatMessages([
            {
              role: "advisor",
              content:
                "Hi! I'm here to help with your travel or study abroad plans. What are you thinking about - where would you like to go, and what's the occasion?",
            },
          ]);
        }
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading]);

  async function sendMessage() {
    if (!input.trim() || !sessionToken || loading) return;
    const userMessage = input.trim();
    setInput("");
    setChatMessages((prev) => [...prev, { role: "customer", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/conversation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken, message: userMessage }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "advisor", content: data.reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "advisor", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-[var(--border)]/80 bg-[var(--surface)]/70 px-5 py-4 backdrop-blur-sm">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
        >
          PV
        </div>
        <div>
          <h1 className="text-base font-semibold text-[var(--foreground)]">
            PayAfterVisa Advisor
          </h1>
          <p className="text-xs text-neutral-500">Ask about visas, timelines & costs</p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {chatMessages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-message-in ${
              m.role === "customer" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.role === "customer"
                  ? "rounded-br-sm text-white"
                  : "rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
              }`}
              style={
                m.role === "customer"
                  ? { background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }
                  : undefined
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex animate-message-in justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm">
              <span
                className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t border-[var(--border)] bg-[var(--surface)]/70 p-3.5 backdrop-blur-sm"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-shadow focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(42,61,143,0.15)]"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--accent)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
