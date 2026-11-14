---
version: 1
slug: "docs-index-html"
primary_target: "docs/index.html"
related_targets: []
---

# Surface brief — Inventium public landing page (`docs/index.html`)

## Scope

The public marketing page hosted from this repository on GitHub Pages:
`docs/index.html`, one self-contained file with no build step. It is a sibling
of the Inventium app, not part of it — the app lives in the separate
`frontend-service` repository and is untouched by this surface.

Visitor mode: **Persuade**.

## Audience, job, constraints

Three visitors, all three asked for by the user: an owner of several F&B
outlets arriving cold, who must come to believe that a sale moves stock on its
own; a team member who already has an account and only wants the door; and
someone who wants access for their team.

Hard constraints:

- **Static only.** GitHub Pages serves files; there is no server, no Clerk, no
  backend call. Every figure on the page is authored sample data, labeled as
  such on the page itself.
- **No invented claims.** No customers, testimonials, pricing, benchmarks or
  press exist for this product, so none appear. The NB-00 sheet states this on
  the page rather than hiding it.
- **The app is not deployed.** Both calls to action are placeholders
  (`href="#app"`, each carrying `data-cta="sign-up"` or `data-cta="sign-in"`),
  with the replacement instructions in a comment at the top of the file. Until
  they are pointed at a live host the page is complete but not publishable.
- Light is primary, dark is designed and driven by `prefers-color-scheme`
  (there is no theme toggle on a static page, so the OS preference is the only
  honest signal).

## Visual authority

This surface inherits Inventium's committed visual world, "The Roast Curve",
documented in the `frontend-service` repository's `DESIGN.md`. That file is the
authority; nothing here replaces it. The page carries the system's tokens as
CSS custom properties on `:root` with the same names and values, and its row
trace is computed with the same math as the app's `EnvelopeTrace` component, so
the signature mark is identical on both surfaces.

## Direction contract

**THESIS:** The page is a completed process-control record, and every figure on
it is traceable to the numbered row that produced it. It refuses the landing
page that claims an outcome in a headline over three feature cards: here the
claim is the evidence, a filled-in log whose rows a visitor can follow from the
sale, through the recipe, to what was left and what was posted.

**OWN-WORLD:** The committed Roast Curve system, unchanged. Technical white
`#F4F6F7` ground, sheets in panel white bounded by one `#CBD6DA` hairline, a
flat slate-teal `#0E2A33` header field and inverted slate-teal totals bars as
the only heavy masses. Each sheet carries its form designation in Chivo Mono
tracked caps on its own top strip, divided by a hairline, never stacked as an
eyebrow over a heading. Probe amber `#C86A12` draws every reading and nothing
else, envelope teal `#0F7F8C` every par band at 13% fill, breach red `#C8321F`
every crossing and every below-par figure, band edge `#A8750C` the at-bound
state word. Chivo carries headings and monumental tabular figures, Chivo Mono
every quantity, time, SKU, unit and state word. Nothing rounded past 2px, no
gradient, no glass, no shadow on anything in the page flow.

**STORY:** The visitor lands on a filled-in shift record and reads down it: a
counted opening figure, then sales that each drew their own ingredients, a
transfer, a logged waste, and the row where robusta crossed par at 15:52. Then
the recipe sheet shows why those grams left, the outlet roll-up shows the same
encoding across two outlets and one not trading, and a sheet of what this
record does not claim proves the numbers are earned. They sign off at the
bottom by creating an account, or take Sign in from the header.

**FIRST VIEWPORT:** Flat slate-teal header bar (wordmark left, mono nav, Sign
in and a filled Create account plate right). Below it on technical white, sheet
one: a hairline-bounded form strip reading FORM SM-04 · STOCK MOVEMENT RECORD
left and SAMPLE OUTLET · NOT LIVE DATA right; then the header block, a 44px
Chivo headline over one paragraph of body on the left and the primary action
plate with the Sign in line beneath it on the right; then a five-cell field
strip (outlet, date, shift, tracked ingredient, par/out) over a dark rule; then
the numbered event rows, each one event in full with its drawn quantity, on
hand after, revenue posted, a 128px row trace and a state word, the last row
crossing par in breach red; closed by an inverted slate-teal totals bar.

**FORM:** The Batch Record — a completed process-control log sheet; candidate 5
of 7 on the grounded list, dealt by the roll and locked by the user over the
dealt lead. seed:26bb145461d71bd4

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature move

The sheet's rows post once, in order, as a record being printed: each row's
trace draws left to right on a staggered delay. The animation uses
`animation-fill-mode: backwards`, never `both`, so the dash pattern exists only
while the line is drawing and every reading is painted at rest whether the
animation ran, was skipped or never started. `prefers-reduced-motion: reduce`
places everything at rest.

## Unresolved

- Both calls to action are placeholders until the app has a public URL.
- The "request access for my team" door still has no destination and is not
  built.
- Par values do not exist in the backend, so the sample data states a par only
  where the page names one and says "no par set" elsewhere.
