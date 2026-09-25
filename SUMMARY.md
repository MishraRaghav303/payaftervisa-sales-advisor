# PayAfterVisa AI Advisor — Summary

Hi, here's where things stand with the AI sales advisor prototype.

**It's live and working:** https://payaftervisa-sales-advisor.vercel.app
**Code is here:** https://github.com/MishraRaghav303/payaftervisa-sales-advisor

**What it actually does:** A visitor lands on the site, clicks the chat
icon, and just talks — no forms. It naturally asks about their trip,
figures out what they need, and answers questions using PayAfterVisa's
real pricing and service info. If it doesn't know something, it says so
honestly instead of making it up. Once someone's ready to move forward, it
actually creates a lead in our system — not just a chat message saying it
did.

Every conversation is saved, so a customer can leave and come back later
and pick up right where they left off. And our team can see everything —
the conversation, what the AI figured out about the customer, and whether
it's a hot lead — on an internal page only we can log into.

**What it's built on:** Next.js for the website and backend, a Postgres
database to store everything, and Anthropic's Claude AI for the actual
conversation. All hosted on Vercel. Nothing exotic — standard, reliable
tools that keep this cheap to run.

**Why Claude and not our own AI model:** Training our own model from
scratch isn't realistic for a team this size — it'd cost a fortune and
take months, and honestly wouldn't perform as well as just using an
existing model properly. Claude already knows how to hold a natural
conversation; what makes it "know" PayAfterVisa is the business info we
feed it, not something we'd need to train in.

**What it costs to run:** About 3 cents per conversation. So roughly
$2-4 for every 100 conversations, or $20-40 for every 1,000. It's
pay-as-you-go, no fixed monthly bill.

**What's not in there yet:** The AI currently only knows about UK, Canada,
and UAE tourist visas, because that's the only data I was given to test
with. If we ever offer study or work visas, adding that is straightforward
— it just needs the real information.

**Before this could go live for actual customers**, I'd want to add a few
things: protection against spam/bot abuse, proper individual logins for
the team instead of one shared password, and a way to instantly notify a
person when a customer needs human attention, instead of them having to
check the dashboard.

**Bottom line:** it works, it's live right now, it's cheap to run, and it
does everything that was asked for.
