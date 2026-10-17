# Rang Strategies website — initial homepage review

Responsive, dependency-free homepage using the supplied Rang Strategies identity. This directory is independent of the read-only synced `sources/` directory. No source career documents are served or included in the website.

## Preview

Run `npm start` in this directory, then open http://127.0.0.1:4173. Requires Node.js 18 or later. Run `npm run check` for JavaScript syntax checks. The static files can later be integrated into the chosen application framework or hosted as a static site; `server.mjs` is for local review only.

If local server permissions are unavailable, run `npm run preview:file` and open `review/homepage.html` directly in a browser. This creates a self-contained copy with the exact homepage styles, assets, configuration, and interactions embedded. It is generated review output and is ignored by Git. Rebuild it after source changes.

Repository: https://github.com/rang-strat/website. The local Git remote is connected. The initial homepage upload was approved on October 16, 2026.

## Questionnaire integration

The provided project contains no application repository, questionnaire route, or `results.js`. This implementation creates none of those files and does not change questionnaire behavior. The homepage currently opens an explicit integration-pending dialog. It does not simulate results, collect responses, or present an invented assessment.

When the questionnaire source becomes available, preserve its route and `results.js`, and set `assessmentUrl` in `config.js` to its confirmed route or URL. The homepage will use that link directly and hide the integration-pending label. If the route is local, use its actual application server; this minimal preview server does not provide SPA fallbacks or questionnaire hosting. Confirm the questionnaire's wording against the introductory topic labels before launch.

## Contact

Contact actions open an email draft addressed to the business email supplied in the brag sheet. They do not send email or save lead data. The LinkedIn link is from the same document. No analytics, external fonts, cookies, or third-party requests are added.

## Design

- Deep olive `#334B2A`, sage `#8FA77A`, warm cream `#F5F0E6`, charcoal `#232A25`.
- Supplied full-color and cream knockout horizontal logos, with original proportions and a minimum display width of 220px. The supplied monogram replaces the full wordmark on screens 400px wide and below.
- Editorial serif headings, system sans-serif text, and an original SVG data-foundation illustration.
- Responsive navigation, reduced-motion support, skip link, visible keyboard focus, semantic headings, and native modal dialog.
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

The user approved the initial homepage and authorized uploading it to GitHub on October 16, 2026. Deployment is a separate step and still requires approval. Questionnaire integration remains pending its existing source.

## Review verification

JavaScript syntax checks pass for the application, configuration, local server, and preview builder. Static checks confirm unique IDs, valid internal anchor targets, existing asset paths, byte-identical copies of supplied brand assets, and a self-contained generated preview. No browser layout or interaction checks have completed: the current environment blocks local server listening and browser navigation to local files. Desktop/mobile visual inspection, keyboard navigation, and modal/menu interaction verification remain pending in an allowed HTTP preview or the user's browser.

New files: `index.html`, `styles.css`, `app.js`, `config.js`, `server.mjs`, `build-preview.mjs`, `package.json`, `.gitignore`, this `README.md`, and four files under `assets/`. Generated local review output lives in `review/` and is ignored. Synced source documents and any external questionnaire repository are unchanged.
