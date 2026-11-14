---
version: 1
slug: "src-app"
primary_target: "src/app"
related_targets: ["src/components","src/layout","src/app/globals.css"]
---

# Surface brief — Inventium application (all surfaces)

## Scope

Every real surface of the app plus the shared shell: dashboard, inventory (list, add,
edit, import, export), recipes, warehouse and storage rooms, points of sale, orders,
sales, sale overview and list, auth screens, 404. The TailAdmin demo routes
(UI Elements, Charts, Calendar, Basic Tables, Form Elements, Blank, test/*) are not
product surfaces: they must keep working and inherit the new primitives, and they get no
design attention.

Visitor mode: **Operate**.

## Audience, job, constraints

Primary reader is the owner of several outlets, checking stock and revenue. Staff ring up
sales at a POS. The same screens are used at a desk, on a phone away from the shop, on a
counter tablet under bright overhead light, and on a warehouse floor with glare — so the
light theme is primary and contrast is a hard requirement, not a preference.

Hard constraint from the user: **every route and behavior survives untouched.** This is a
visual replacement, not a functional change. The theme toggle is existing behavior and
keeps working; both themes are designed.

## Direction contract

**THESIS:** Every quantity that moves is drawn as its actual trace against the envelope it
was supposed to stay inside, so stock reads as a process under control or out of it — never
as a snapshot. It refuses the category's arrangement of same-size KPI cards over a generic
line chart, where the number and its limit never appear in the same mark.

**OWN-WORLD:** Roast and fermentation process control. Slate-teal `#0E2A33` owns the nav
rail as one flat field; the work area is technical white `#F4F6F7`, never cream. Probe
amber `#C86A12` draws every actual trace, envelope teal `#0F7F8C` draws every target band
at 13% fill with hairline bounds, breach red `#C8321F` marks every threshold crossing and
every below-par figure. Device-pixel hairlines `#CBD6DA` divide; nothing is rounded past
2px; no gradient, no glass, no glow. Chivo carries UI and monumental tabular figures,
Chivo Mono carries units, SKUs, lot codes, axis labels and state words — measurement only,
never decoration. Out-of-play rows desaturate to `#8A979C` instead of taking a badge.

**STORY:** The owner lands and sees, in one mark, how much stock is on hand and whether it
has been staying inside its par envelope; the breach is already labeled with what failed
and when. They scan the table, where each ingredient repeats that same trace at row scale,
and act on the rows outside the band. Staff and stock keepers read the same encoding on a
tablet or a phone without relearning it.

**FIRST VIEWPORT:** Slate-teal rail left (232px, grouped Reading / Stock / Service, counts
right-aligned in mono, active item inverted to white with an amber inset edge). Work area:
breadcrumb, then the page heading. Below it one full-width trace region that owns its band
— 14 days of stock on hand in amber against the teal par envelope, the monumental figure
set inside it top-left, the breach dotted and timed in place — with a right-hand column of
three smaller readouts (revenue today, drawn by sales today, outside envelope). Then the
stock table: SKU in mono, ingredient, warehouse, right-aligned on-hand and drawn-today in
tabular figures, a 128px envelope trace per row, and a mono state word. Primary action
(Add item) sits top-right of the heading row as a filled slate-teal rect.

**FORM:** Process-control trace-against-envelope, candidate 6 of 7 on the re-rolled
grounded list, assigned by the roll. seed:d6a742ed5387a72c

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature move

The par envelope trace. One encoding everywhere a quantity changes over time: actual in
amber, target band in teal, crossing marked and timed. Full width on the dashboard,
128px per row in tables, inline on a recipe's cost. Length is time, height is quantity,
fill is state; nothing in the mark is decorative.

## Unresolved

Par values do not exist in the backend yet. Where an ingredient has no par, the row still
reads: the trace draws without an envelope and the state word says "no par set". Setting
par is not in scope for this pass.
