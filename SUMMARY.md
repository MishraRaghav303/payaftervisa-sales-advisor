# PayAfterVisa AI Advisor — Quick Summary

1. **Working URL:** https://payaftervisa-sales-advisor.vercel.app

2. **Git repo:** https://github.com/MishraRaghav303/payaftervisa-sales-advisor

3. **How it works:** Customer chats on the website → Claude AI (Anthropic)
   answers using only PayAfterVisa's real pricing/service data → a second
   cheaper AI extracts customer details in the background → everything
   saves to a database → team views it all in a password-protected admin
   page.

4. **Tech used:** Next.js (website + backend in one), Postgres database,
   Claude AI (Anthropic), hosted on Vercel — all standard, modern, low-cost
   tools.

5. **Why Claude AI:** Same reasoning as any company using AI chatbots today
   — reliable, handles conversation + data extraction well, and cheap
   compared to building/training our own model (which isn't realistic on
   any small budget).

6. **Cost:** About **$0.03 per conversation** → roughly **$2-4 per 100
   conversations**, **$20-40 per 1,000**. Pay-as-you-go, no fixed monthly
   fee.

7. **What's missing right now:** Only covers UK/Canada/UAE tourist visas
   (no study/work visa data was given to build with) — easy to add once
   real data is provided.

8. **Before going live for real customers:** Add spam/abuse protection,
   proper multi-user admin logins, and a way to notify a human instantly
   when a customer needs one (currently they just show up in the admin
   panel).

**Bottom line:** It works, it's live, it's cheap to run, and it does
everything asked — natural conversation, real data extraction, a real
lead-creation action, and full cost tracking.
