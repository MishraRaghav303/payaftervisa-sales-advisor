"use client";

import Link from "next/link";
import { useChatWidget } from "@/components/chat/ChatWidgetContext";

const services = [
  {
    flag: "🇬🇧",
    country: "United Kingdom",
    name: "UK Tourist Visa",
    initial: "USD 200",
    remaining: "USD 2,000",
    note: "Due only after visa approval",
  },
  {
    flag: "🇨🇦",
    country: "Canada",
    name: "Canada Tourist Visa",
    initial: "USD 200",
    remaining: "USD 3,000",
    note: "Due only after visa approval",
  },
  {
    flag: "🇦🇪",
    country: "United Arab Emirates",
    name: "UAE Tourist Visa",
    initial: "USD 200",
    remaining: "USD 500",
    note: "Due only after approval",
  },
];

const steps = [
  {
    title: "Chat with an advisor",
    body: "Tell us about your trip - destination, timeline, and background. No forms, just a conversation.",
  },
  {
    title: "Get assessed",
    body: "We review your profile against what's typically needed and let you know where you stand.",
  },
  {
    title: "Start with USD 200",
    body: "A small initial payment activates your application and document-processing workflow.",
  },
  {
    title: "Pay the rest after approval",
    body: "The remaining service fee is only due once your visa is approved - never before.",
  },
];

export default function HomePage() {
  const { open } = useChatWidget();

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
          >
            PV
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">PayAfterVisa</span>
        </div>
        <button
          onClick={open}
          className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-sm transition-transform active:scale-95"
          style={{ background: "var(--brand)" }}
        >
          Chat with an advisor
        </button>
      </nav>

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-10 text-center sm:pt-16">
        <h1 className="text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-5xl">
          Get visa-ready without paying everything upfront.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] text-neutral-600 sm:text-base">
          PayAfterVisa helps you apply for tourist visas to the UK, Canada, and UAE with a small
          activation fee - the rest is only due once your visa is approved.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={open}
            className="rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--accent))" }}
          >
            Talk to our advisor
          </button>
          <a
            href="#services"
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-neutral-50"
          >
            See services & pricing
          </a>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]">
          Where would you like to go?
        </h2>
        <p className="mb-10 text-center text-sm text-neutral-500">
          Pricing for our tourist visa assistance services
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.name}
              className="flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 text-3xl">{s.flag}</div>
              <h3 className="text-base font-semibold text-[var(--foreground)]">{s.name}</h3>
              <p className="mb-4 text-xs text-neutral-500">{s.country}</p>
              <div className="mb-1">
                <span className="text-2xl font-bold text-[var(--brand)]">{s.initial}</span>
                <span className="ml-1.5 text-xs text-neutral-500">to start</span>
              </div>
              <p className="mb-5 text-xs text-neutral-500">
                + {s.remaining} · {s.note}
              </p>
              <button
                onClick={open}
                className="mt-auto rounded-full border border-[var(--border)] py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-neutral-50"
              >
                Ask about this
              </button>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-neutral-400">
          The initial payment activates your application - it does not guarantee visa approval.
          Final decisions are made solely by the relevant immigration authority.
        </p>
      </section>

      <section className="bg-[var(--background-alt)] py-14">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="mb-10 text-center text-2xl font-bold text-[var(--foreground)]">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl bg-[var(--surface)] p-5 shadow-sm">
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  {i + 1}
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-[var(--foreground)]">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-neutral-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-center text-xs text-neutral-400">
        <p>PayAfterVisa is an online platform providing visa-related application assistance.</p>
        <Link href="/admin" className="mt-2 inline-block text-neutral-300 hover:text-neutral-500">
          Team login
        </Link>
      </footer>
    </div>
  );
}
