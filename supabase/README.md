# Website lead capture

Project: `rang_strategies_website` (`eaaztjuoylttpnjrrkcn`). The project URL is public configuration; credentials never belong in this repository.

Migration `20261022033744_website_leads.sql` was applied to this project through the authenticated Supabase integration on 2026-10-22 UTC. Its version matches the remote migration history so subsequent deployments skip it. Lead capture, duplicate handling, and rate limiting were verified in a rolled-back transaction; no test leads were retained and no emails were sent. Row-level security and server-only privileges were verified. Live website-to-email delivery remains unverified.

## Deployment order

1. Review `migrations/20261022033744_website_leads.sql` in the pull request. It creates two new tables and a restricted function; it does not create user accounts or change assessment data.
2. In Supabase's GitHub integration, use working directory `.` and the website repository. Enable deployment to production only when ready to apply reviewed migrations after merging. Preview branches should use their own database and credentials. `config.toml` enables migrations without changing Auth settings or seeding data.
3. Confirm the migration has applied successfully before enabling the contact form deployment. Alternatively apply it using an authenticated Supabase CLI deployment (`supabase link --project-ref eaaztjuoylttpnjrrkcn`, then `supabase db push`). Do not run both manual SQL and migration deployment without reconciling migration history.
4. Verify these server-only Vercel environment variables are configured: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Use the verified Resend sender for `CONTACT_FROM_EMAIL`; the recipient is `henryz@rangstrategies.com`. Do not use the publishable Supabase key for this endpoint. Never prefix these secrets with a public/browser prefix.
5. Let Vercel deploy after review. `vercel.json` builds only public files into `dist/`; `api/contact.js` is a Node.js function that imports the server-only handler from `lib/`. Use Node.js 24. Do not set an external rewrite for `/api/contact`.
6. On an approved staging deployment, submit one clearly labeled test inquiry, confirm the row in Supabase and the email in Henry's inbox, and check that Reply addresses the test submitter. Also check phone/mobile layout, failure messages, and keyboard access before production launch. No live inquiry has been submitted by the coding checks.

## Reviewing and following up

Use Supabase's Table Editor to view `website_leads`, ordered by `created_at`. `status` supports `new`, `contacted`, `qualified`, and `closed`. Repeated inquiries are separate records; retries of the same submission UUID reuse the original record. An inquiry does not create a Supabase Auth account or grant access to a client organization.

Both tables have row-level security and no public or signed-in-user access. Only the server's service-role access can use `capture_website_lead` and read the records. Do not add anonymous SELECT policies or expose the server secret to make the form work.

The API validates input, limits bodies to 16 KiB, checks same-origin submissions, and uses a honeypot. A database-enforced limit allows five attempts per client address in a 15-minute window. Only an HMAC of the address is stored; expired rate-limit records are removed on subsequent submissions after one day. Vercel's trusted `x-vercel-forwarded-for` header provides the address. Limits are shared across function instances. This is basic abuse protection, not a guarantee against distributed bots; add a verified challenge service if spam becomes a problem.

## Email delivery and retries

The lead is committed before contacting Resend. A saved inquiry returns success even if delivery fails. `notification_status` records `pending`, `sent`, or `failed`; `notification_id` and `notified_at` record successful provider acceptance, not guaranteed inbox delivery. No sensitive request bodies or credentials are written to application logs. The visitor receives no automatic email.

Resend receives a plain-text notification with the submitted details and the submitter's address as `reply_to`. Its idempotency key uses the saved lead ID, so concurrent or immediate retries do not create separate provider sends. A completed notification is not sent again on a duplicate submission. Resend's idempotency retention is limited: inspect its delivery logs before any later manual resend.

There is no automatic email retry job in this first version. Review pending/failed rows in Supabase and follow up from the stored information if necessary. After fixing delivery configuration, an administrator can resend through the email provider and update the row. A durable scheduled retry worker can be added separately.

## Privacy and retention

Contact permission is required for the inquiry. Marketing opt-in is separate and unchecked; the stored flag does not automatically subscribe anyone to a mailing list. Do not collect patient records through this form. Restrict dashboard access to authorized operators, and review and delete leads when they are no longer needed. The rate-limit table's short cleanup period is independent of lead retention. Deletion requests can be handled in Supabase's Table Editor.

## Local development

Copy `.env.example` to `.env.local` and supply dedicated development credentials. `npm start` builds the public site and loads `.env.local` using Node.js 24. The server exposes `/api/contact` with the same handler as Vercel. Missing database settings cause a visible failure, never simulated lead capture. Local file previews intentionally do not submit the form. Use `http://127.0.0.1:4173` for the local server so the form's Origin matches it.

Official references: [Supabase GitHub integration](https://supabase.com/docs/guides/deployment/branching/github-integration), [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [Resend sending](https://resend.com/docs/api-reference/emails/send-email).
