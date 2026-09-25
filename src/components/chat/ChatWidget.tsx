"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useChatWidget } from "./ChatWidgetContext";

type ChatMessage = {
  role: "customer" | "advisor";
  content: string;
};

function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function getSessionToken(): string {
  const key = "pav_session_token";
  let token = window.localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(key, token);
  }
  return token;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const { isOpen, toggle, close, pendingMessage, clearPendingMessage } = useChatWidget();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);
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
        setLoadedHistory(true);
      });
  }, []);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loading, isOpen]);

  useEffect(() => {
    if (isOpen && loadedHistory && sessionToken && pendingMessage) {
      clearPendingMessage();
      sendMessage(pendingMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, loadedHistory, sessionToken, pendingMessage]);

  function startNewChat() {
    const token = crypto.randomUUID();
    window.localStorage.setItem("pav_session_token", token);
    setSessionToken(token);
    setInput("");
    setChatMessages([
      {
        role: "advisor",
        content:
          "Hi! I'm here to help with your travel or study abroad plans. What are you thinking about - where would you like to go, and what's the occasion?",
      },
    ]);
  }

  async function sendMessage(override?: string) {
    const userMessage = (override ?? input).trim();
    if (!userMessage || !sessionToken || loading) return;
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

  // Internal tooling, not the customer-facing widget.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        className={`fixed left-1/2 top-1/2 z-40 flex w-[min(560px,calc(100vw-2.5rem))] -translate-x-1/2 flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl transition-all duration-200 ease-out ${
          isOpen
            ? "-translate-y-1/2 scale-100 opacity-100"
            : "pointer-events-none -translate-y-[45%] scale-95 opacity-0"
        }`}
        style={{ height: "min(720px, calc(100vh - 5rem))" }}
      >
        <header className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
          >
            PV
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              PayAfterVisa Advisor
            </h2>
            <p className="text-xs text-neutral-500">Usually replies in seconds</p>
          </div>
          <button
            onClick={startNewChat}
            aria-label="Start new chat"
            title="Start new chat"
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12a8 8 0 1 0 2.34-5.66M4 4v5h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={close}
            aria-label="Close chat"
            className="rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6L18 18M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {!loadedHistory && (
            <div className="text-xs text-neutral-400">Loading conversation…</div>
          )}
          {chatMessages.map((m, i) => (
            <div
              key={i}
              className={`flex animate-message-in ${
                m.role === "customer" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed shadow-sm ${
                  m.role === "customer"
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                }`}
                style={
                  m.role === "customer"
                    ? { background: "linear-gradient(135deg, var(--brand), var(--brand-dark))" }
                    : undefined
                }
              >
                {renderWithBold(m.content)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex animate-message-in justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 shadow-sm">
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400" style={{ animationDelay: "0s" }} />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot h-1.5 w-1.5 rounded-full bg-neutral-400" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex gap-2 border-t border-[var(--border)] p-3"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <textarea
            rows={1}
            className="max-h-24 flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-[13.5px] text-[var(--foreground)] outline-none transition-shadow focus:border-[var(--brand)] focus:shadow-[0_0_0_3px_rgba(42,61,143,0.15)]"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading}
          />
          <button
            type="submit"
            className="rounded-full px-4 py-2 text-[13.5px] font-medium text-white shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--accent)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            disabled={loading || !input.trim()}
          >
            Send
          </button>
        </form>
      </div>

      <button
        onClick={toggle}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-transform duration-200 hover:scale-105 active:scale-95 sm:right-6"
        style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.6A7.96 7.96 0 0 1 4 12Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}
