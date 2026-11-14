---
version: 1
slug: "src-app-pricing"
primary_target: "src/app/pricing/page.tsx"
related_targets:
  - "src/components/landing/PricingSchedule.tsx"
  - "src/components/landing/PlanRates.tsx"
  - "src/components/landing/pricing-data.ts"
  - "src/components/landing/sheet.tsx"
  - "src/components/landing/PublicChrome.tsx"
---

# Surface brief — Inventium rate schedule (`/pricing`)

## Scope

The public pricing page of the Inventium app, served from the monolith at
`/pricing` and public in `src/middleware.ts`. It is the second sheet set of the
same public record as the landing (`/`), and the two now share their chrome
(`PublicChrome.tsx`) and their stationery (`sheet.tsx`).

Visitor mode: **Persuade**.

Unlike the landing, an authenticated visitor is *not* redirected: someone
already using the app is exactly who reads a pricing page next, so the session
is resolved only to swap the chrome's two doors for one into the dashboard.
That makes the route server-rendered on demand rather than static — the same
trade the landing already makes.

## Audience, job, constraints

The owner of several F&B outlets deciding whether this is worth paying for, and
an existing Free user working out when they will outgrow it.

Hard constraints:

- **Nothing here is priced.** PRODUCT.md records that no customers, pricing or
  benchmarks exist. Every amount, limit and feature line in `pricing-data.ts`
  is an authored sample, the file says so at the top, and the page says so on
  NB-01, in the RS-01 form strip and in the footer. The landing's own NB-00
  sheet was amended in the same change so the two surfaces do not contradict
  each other.
- **No billing exists.** No payment is taken anywhere in the product; the
  Enterprise door opens `/sign-up?plan=enterprise` because there is no estimate
  inbox, and NB-01 states that rather than implying a sales process.
- **Roles and permissions are not modelled**, so no plan sells them — the row
  reads "Not modelled yet" on all three plans instead of appearing as an
  Enterprise feature.
- Light is primary; dark is class-driven by the app's ThemeProvider and fully
  designed. There is no theme toggle on a public page.

## Visual authority

The committed Roast Curve world in this repository's `DESIGN.md`, unchanged.
No new colour, radius, shadow or face. One type step that the landing did not
already use was considered (20px for the plan name) and rejected in favour of
the documented 26px title step.

## Direction contract

**THESIS:** A plan is a par band. This product draws every quantity against the
bound it has to stay inside, so its commercial terms are drawn the same way —
four stated limits per plan, and a capacity envelope on RS-03 showing what
outgrowing one looks like months before an invoice would say it. It refuses the
three-card pricing page where the middle card is scaled up and badged.

**OWN-WORLD:** The committed system. Three plans are three columns of one
sheet, divided by the same hairline as every other field strip; the default
plan is the heavy mass, inverted to the slate-teal shell exactly as the totals
bars are (and lifted to white at 7% in dark, where a darker mass would
disappear). Nothing is scaled, badged or raised on a shadow.

**STORY:** The visitor reads the charges (RS-01), then the line-by-line
inclusions (RS-02), then watches a sample outlet group grow out of Business on
the capacity envelope (RS-03), then the questions (RS-04), then what the
schedule does not claim (NB-01), and signs off on Free (SO-02).

**FIRST VIEWPORT:** The shared slate-teal header; then sheet RS-01, whose form
strip reads FORM RS-01 · SCHEDULE OF CHARGES left and SAMPLE AMOUNTS · NOTHING
IS BILLED YET right; a 44px headline over one paragraph with the monthly/yearly
control top-right; then the three plan columns, Business inverted, each with
its amount, its one line of who it is for, its action, and its four governing
limits as a field strip at the foot of the column; then the rate field strip
(currency, charged per, effective, trial, card required).

**FORM:** The Batch Record, inherited from the landing — this is another sheet
of the same record set, not a new form.

**FINISH:** verified at 390 / 768 / 1440 in both themes, no overflow, no
console errors, production build green with typechecking enforced.

## Signature move

The capacity envelope on RS-03 prints once: the amber reading draws left to
right, then the breach segment follows it. `animation-fill-mode` is
`backwards`, never `both`, so the trace is painted at rest whether the
animation ran, was skipped or never started, and `prefers-reduced-motion:
reduce` places it at rest. It is the page's one authored moment.

## Honest absence

Enterprise carries no amount. Its figure slot holds an em-dash and the words
"Priced per estimate" in the same tracked caps the product uses for a missing
par level — the sheet does not derive a price to fill the column. That is the
same rule as the landing's "an em-dash, never a figure derived to fill the
column", applied to the one place on a pricing page where inventing a number is
most tempting.

## Found while building this surface

The committed type system was not actually in force anywhere in the app.
`globals.css` composed `--font-sans` / `--font-mono` inside `@theme`, which
Tailwind v4 does not emit as runtime custom properties, and the next/font
variables sat on `<body>` while `:root` read them — so every surface rendered
in the platform sans and DESIGN.md's Chivo / Chivo Mono split never reached a
page. Fixed by declaring both variables on `:root` and moving the face
variables to `<html>`; verified through CDP `CSS.getPlatformFontsForNode`, not
by eye. This changes the appearance of every screen in the app, including the
already-approved landing record.

## Unresolved

- Every amount, limit and feature line is a placeholder awaiting the real
  commercial terms. Replace them in `src/components/landing/pricing-data.ts`
  and amend NB-01 in the same change.
- There is no estimate inbox and no billing system, so the Enterprise door
  lands on sign-up carrying `?plan=enterprise`. Nothing reads that parameter
  yet.
- Chivo Mono stays on the `latin` subset: next/font 15.2.3 cannot parse
  Google's CSS for that family's `vietnamese` subset and fails the build, so ₫
  inside a mono table cell still falls back to another face. The display
  figures are Chivo sans and render it correctly.
- "Events recorded per month" is used as the capacity unit on RS-03. The
  product does not meter anything today, so that unit is part of the sample.
