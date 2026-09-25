# PayAfterVisa Sales Advisor

A working prototype of an AI-powered sales and customer advisory chatbot for
PayAfterVisa, built to test whether this capability can be developed
in-house instead of buying an off-the-shelf chatbot product.

**Live app:** https://payaftervisa-sales-advisor.vercel.app
**Admin panel:** https://payaftervisa-sales-advisor.vercel.app/admin

---

## What this actually does, in plain terms

A visitor lands on the homepage and clicks the chat icon (bottom-right).
They have a normal conversation about their travel plans - where they want
to go, why, roughly when, their budget, and so on. They never fill out a
form; the AI just picks this information out of the conversation naturally,
the same way a human sales rep would.

While that's happening, three things happen behind the scenes:

1. **The AI only talks about real PayAfterVisa services.** It has been given
   the actual product/pricing information (UK, Canada, and UAE tourist
   visas) and is instructed to never make up an answer it doesn't have. If
   you ask it something outside that - like study visas, which aren't in
   the current data - it says so honestly instead of guessing.

2. **Every message is saved to a database**, tied to an anonymous token
   stored in your browser. Close the tab, come back later on the same
   browser, and the conversation picks up exactly where it left off.

3. **A second, cheaper AI model reads the conversation** and turns it into
   structured data - name, destination, budget, timeline, a lead quality
   score, and a recommended next action - so a human sales agent can see at
   a glance what's going on without reading the whole transcript.

If the visitor confirms they want to proceed, the AI actually creates a
lead record in the database by calling a real backend function - it's not
just saying "done" in the chat, something real happens.

Everything - every conversation, every AI call and what it cost - can be
seen by the internal team on the `/admin` page (login required).

---

## How the pieces fit together

```
Visitor's browser
   │
   ├─ Homepage (marketing content about PayAfterVisa)
   │
   └─ Floating chat widget
          │
          ▼
   Next.js app (single deployment, hosted on Vercel)
          │
          ├──► Claude Sonnet 5 — has the actual conversation, decides what
          │      to ask next, calls the "create lead" tool when appropriate
          │
          ├──► Claude Haiku 4.5 — reads the transcript in the background
          │      and extracts the structured profile + lead score
          │      (cheaper model, doesn't talk to the customer directly)
          │
          └──► Postgres database (Neon) — stores conversations, customer
                 profiles, lead records, the knowledge base, and a log of
                 what every AI call cost

   /admin (password-protected) reads straight from that same database
```

## Project structure

```
src/
  app/
    page.tsx                  Marketing homepage
    admin/                    Internal dashboard (login required)
    api/conversation/         Chat backend (the main endpoint)
    api/admin/                Admin data endpoints
  components/chat/            The floating chat widget
  lib/
    ai/                       Conversation engine, extraction, cost tracking
    db/                       Database schema (Drizzle ORM)
    knowledge/                The PayAfterVisa knowledge base content
    leads/                    The real "create lead" backend action
```

## Running it locally

You'll need a `.env.local` file with `ANTHROPIC_API_KEY`, `DATABASE_URL`,
`ADMIN_USERNAME`, and `ADMIN_PASSWORD`. Then:

```bash
npm install
npm run dev
```

## Full write-up

See [DELIVERABLES.md](./DELIVERABLES.md) for the architecture diagram, tech
stack rationale, database structure, knowledge base/RAG explanation, cost
estimates, current limitations, and what to change before a real production
launch.
