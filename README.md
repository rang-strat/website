# Rang Strategies website

## Site structure

The homepage contains four sections: hero, services overview, selected career results, and a brief contact invitation. The founder introduction is entirely on `about.html`. Supporting content is preserved on `services.html`, `approach.html`, `experience.html`, `assessment.html`, and `contact.html`. Navigation, service links, result links, and the contact invitation lead to those pages.

Run `npm run preview:file` to generate the linked, self-contained review pages, starting at `review/homepage.html`. The homepage links directly to the externally hosted 7-question AI readiness assessment. No assessment scoring logic or `results.js` is changed or replaced.

Responsive website using the supplied Rang Strategies identity, with a server-side contact endpoint and no third-party runtime dependencies. This directory is independent of the read-only synced `sources/` directory. No source career documents are served or included in the website.

## Preview

Run `npm start` in this directory, then open http://127.0.0.1:4173. Requires Node.js 24. The command builds public files into `dist/` and loads `.env.local` for the contact endpoint. Run `npm run check` for JavaScript syntax checks. `server.mjs` is the local development server; Vercel runs `api/contact.js` for form submissions in deployed environments.

If local server permissions are unavailable, run `npm run preview:file` and open `review/homepage.html` directly in a browser. This creates a self-contained copy with the exact homepage styles, assets, configuration, and interactions embedded. It is generated review output and is ignored by Git. Rebuild it after source changes.

Repository: https://github.com/rang-strat/website. The local Git remote is connected. The initial homepage upload was approved on October 16, 2026.

## AI Readiness Assessment

The assessment is hosted at https://questionnaire.rangstrategies.com. The homepage navigation, hero call to action, and footer link directly to that URL. The existing `assessment.html` overview remains available from other pages and now has an active assessment link instead of an integration-pending dialog.

`assessmentUrl` in `config.js` configures links marked with `data-assessment-link`. Those anchors also contain the destination in their HTML so they work without JavaScript. Visible copy refers to the tool as an AI Readiness Assessment or a 7-question AI readiness assessment. The website does not change the external assessment, its data storage, user accounts, or results.

## Contact

The contact page collects name, email, company, optional phone/job title/service interest, a message, required inquiry contact permission, and separate optional marketing permission. Visitors do not need an account. The server validates submissions, applies a shared rate limit, saves the inquiry to Supabase, then sends a Resend notification to `henryz@rangstrategies.com` with the visitor's reply-to address. Delivery failures do not discard saved leads. Email links remain available as an alternative. See [deployment and operations](supabase/README.md) for migration setup, environment variables, access rules, notification failure handling, and retention. There is no automatic notification retry job in this version.

Only public website files are copied into `dist/`. The Supabase secret and Resend key are read exclusively by server-side code. No analytics, external fonts, browser tracking cookies, or automatic visitor emails are added. The public contact API is the browser's only submission destination.

## Design

- Deep olive `#334B2A`, sage `#8FA77A`, warm cream `#F5F0E6`, charcoal `#232A25`.
- Supplied full-color and cream knockout horizontal logos, with original proportions and a minimum display width of 220px. The supplied monogram replaces the full wordmark on screens 400px wide and below.
- Editorial serif headings, system sans-serif text, and an original SVG data-foundation illustration.
- Responsive navigation, reduced-motion support, skip link, visible keyboard focus, and semantic headings.
- The founder monogram is an intentional typographic treatment; no photograph was supplied or fabricated.

## Content provenance

All numbers describe Henry's prior employment experience, not Rang Strategies client engagements.

| Homepage claim | Supplied source | Context |
| --- | --- | --- |
| 65% fewer operational defects in the first 60 days | HenryZeringue_Resume.pdf, Raremed section | Pharmacy services leadership role. The brag sheet has a separate, less specific 80% process-defect statement; the homepage uses the detailed resume figure. |
| Onboarding reduced from three months to three weeks; 80% fewer hours | HenryZeringue_Resume.pdf, Raremed section | Operational onboarding improvement. |
| $20M additional revenue capture; 30% increase at lower overall cost | HenryZeringue_Resume.pdf, Highmark chart-chase project; HenryZ_Brag_Sheet.pdf impact summary | Risk revenue program optimization. |
| PhD, Biomedical Engineering, UW–Madison; postdoctoral neurobiology research, MIT | HenryZeringue_Resume.pdf, Education section | Academic credentials, not institutional endorsements. |
| Health insurance, health systems, post-acute care, pharmacy services, AI product experience | Resume and brag sheet, professional experience | Biography summarizes prior professional work. |
| Business email, Pittsburgh location, LinkedIn | HenryZ_Brag_Sheet.pdf, heading | Business contact details only; personal resume email and phone are not published. |

The source documents are retained in the parent project's read-only `sources/` directory and are deliberately excluded from public assets. No testimonials, client logos, or fabricated client relationships are included. Service descriptions and the approach are proposed Rang Strategies offerings, not claims of completed consultancy engagements.

## Publication status

The shorter homepage and linked pages were merged through pull request #1. The contact lead-capture migration and the reviewed assessment-link/button updates are prepared together for a new pull request. Applying the migration and merging or deploying to production remain separate review steps.

## Review verification

Validation includes JavaScript syntax checks, public-site and self-contained preview builds, internal link/accessibility-label checks, and isolated request-handler tests with fake upstream responses. These tests do not submit real leads, send real email, or apply the database migration. Live end-to-end validation must confirm the migration, environment scopes, and delivery in an approved staging environment before production launch.

The site contains seven HTML pages, shared `styles.css` and `app.js`, `config.js`, local preview tooling, this `README.md`, and four supplied brand assets. Generated local review output lives in `review/` and is ignored. Synced source documents and any external assessment repository are unchanged.
