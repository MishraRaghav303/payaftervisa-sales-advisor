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
  }, [chatMessages]);

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
      <header className="border-b border-neutral-200 px-4 py-3">
        <h1 className="text-lg font-semibold">PayAfterVisa Advisor</h1>
        <p className="text-sm text-neutral-500">Chat about your travel or study plans</p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chatMessages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "customer" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                m.role === "customer"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-900 shadow-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-2 text-sm text-neutral-400 shadow-sm">
              Typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t border-neutral-200 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <input
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-neutral-500"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
