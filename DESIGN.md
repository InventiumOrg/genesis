---
name: Inventium
description: Process-control instrumentation for stock and revenue — every quantity drawn as its actual trace against the envelope it was meant to stay inside.
colors:
  slate-teal-shell: "#0e2a33"
  slate-teal-mid: "#0f6c78"
  slate-teal-pale: "#cfe2e7"
  probe-amber: "#c86a12"
  probe-amber-deep: "#ab580e"
  envelope-teal: "#0f7f8c"
  envelope-teal-deep: "#0b555e"
  breach-red: "#c8321f"
  breach-red-deep: "#aa2a1a"
  band-edge: "#a8750c"
  technical-white: "#f4f6f7"
  panel-white: "#ffffff"
  hairline: "#cbd6da"
  hairline-faint: "#e9edef"
  ink: "#101a1e"
  ink-muted: "#5e7480"
  out-of-play: "#8a979c"
  night-ground: "#081012"
  night-ink: "#0b1518"
typography:
  display:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontFeature: "tnum 1"
  headline:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.025em"
    fontFeature: "tnum 1"
  title:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Chivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0em"
  label:
    fontFamily: "Chivo Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "9px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.17em"
  measure:
    fontFamily: "Chivo Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "18px"
    letterSpacing: "0em"
    fontFeature: "tnum 1"
rounded:
  hair: "1px"
  edge: "2px"
spacing:
  hair: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  "2xl": "24px"
components:
  button-primary:
    backgroundColor: "{colors.slate-teal-shell}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.hair}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "#0d3741"
    textColor: "{colors.panel-white}"
  button-outline:
    backgroundColor: "{colors.panel-white}"
    textColor: "#27353b"
    rounded: "{rounded.hair}"
    padding: "0 16px"
    height: "40px"
  button-outline-hover:
    backgroundColor: "{colors.hairline-faint}"
  action-chip:
    backgroundColor: "{colors.panel-white}"
    textColor: "#44555e"
    rounded: "{rounded.hair}"
    padding: "0 8px"
    height: "28px"
  state-word-breach:
    backgroundColor: "#fbeae8"
    textColor: "#882215"
    rounded: "{rounded.hair}"
    padding: "2px 8px"
    typography: "{typography.label}"
  state-word-in-band:
    backgroundColor: "#e4f5f7"
    textColor: "{colors.envelope-teal-deep}"
    rounded: "{rounded.hair}"
    padding: "2px 8px"
    typography: "{typography.label}"
  state-word-out-of-play:
    backgroundColor: "transparent"
    textColor: "{colors.out-of-play}"
    rounded: "{rounded.hair}"
    padding: "2px 8px"
    typography: "{typography.label}"
  input-text:
    backgroundColor: "transparent"
    textColor: "#27353b"
    rounded: "{rounded.edge}"
    padding: "10px 16px"
    height: "44px"
    typography: "{typography.body}"
  panel:
    backgroundColor: "{colors.panel-white}"
    rounded: "{rounded.hair}"
    padding: "20px"
  nav-item-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.slate-teal-pale}"
    rounded: "{rounded.hair}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.technical-white}"
    textColor: "{colors.slate-teal-shell}"
    rounded: "{rounded.hair}"
    padding: "8px 12px"
  table-header-cell:
    textColor: "#5e7480"
    typography: "{typography.label}"
    padding: "10px 12px"
---

# Design System: Inventium

## Overview

**Creative North Star: "The Roast Curve"**

Inventium is drawn as process-control instrumentation. A roaster does not read a
number card; they read the actual probe trace against the envelope the batch was
meant to stay inside, and they can see in one mark whether the process is in
control. Every quantity that moves in this product is drawn the same way: the
actual reading in probe amber, the target or reference band in envelope teal,
the moment the reading left the band in breach red. The interface refuses the
category's arrangement of same-size KPI cards over a generic line chart, where
the figure and its limit never appear in the same mark.

The surface is instrument-flat. A slate-teal rail holds the left edge as one
unbroken field; the work area is technical white, never cream. Hairlines
divide, nothing is rounded past 2px, and there is no gradient, no glass, no
glow. Depth exists only as a faint offset shadow on genuinely floating things
(dropdowns, tooltips, datepickers); the panels themselves sit on the ground and
are bounded by a single hairline. Density is high and deliberately so: the
reader is checking many lines at once, at a desk, on a counter tablet under
bright overhead light, and on a warehouse floor with glare. Light is the
primary theme for that reason, chosen from the use scene rather than from
category habit; dark is fully designed and grounded on near-black `#081012`.

Type does two jobs and never confuses them. Chivo carries the interface and the
monumental tabular figures; Chivo Mono carries measurement only — SKUs, units,
axis labels, counts, timestamps, state words. Mono is never decoration. The
honesty of the figures is part of the visual system, not a copy concern: where a
value does not exist in the backend, the surface says so in the same small
tracked caps it uses for every other label rather than drawing a plausible band
or a currency figure nobody earned.

**Key Characteristics:**
- One encoding for every changing quantity: amber actual, teal band, red crossing.
- Instrument-flat surfaces, device-pixel hairlines, nothing rounded past 2px.
- Chivo for interface and monumental figures, Chivo Mono for measurement only.
- Technical-white ground under a flat slate-teal rail; light theme primary.
- Honest absence: no par, no price, no count unless the service answered.

## Colors

A process-control palette: one shell colour, one colour for the reading, one for
the target, one for the breach, and a cool technical slate for everything that
is neither.

### Primary
- **Slate Teal Shell** (`#0e2a33`): The nav rail as one flat unbroken field in
  both themes, the filled primary button, and the darkest ink in headings. It is
  structure, never data. A full ramp exists (`brand-25` … `brand-950`) for rail
  states and link text.

### Secondary
- **Probe Amber** (`#c86a12`): Always the actual reading. Every trace polyline,
  every level fill, the active rail icon, the selection highlight and the caret.
  Amber appearing anywhere means "this is a measured value", so it is never used
  to decorate a heading or a border.
- **Envelope Teal** (`#0f7f8c`): Always the target band or the bound. Drawn as a
  13% fill with hairline bounds (dashed when the band is derived from the series
  itself rather than from a set par), as the focus-visible outline, and as the
  in-band state word.

### Tertiary
- **Breach Red** (`#c8321f`): Always a threshold crossing. The trace turns red
  past the bound, the breach dot and its timed label, out-of-stock figures,
  out-of-state counts, and destructive actions. Nothing is breach red for
  emphasis.
- **Band Edge** (`#a8750c`): At the bound but not yet past it — the warning
  state word. Used sparingly; it is the only amber-adjacent colour that is not a
  reading.

### Neutral
- **Technical White** (`#f4f6f7`): The work-area ground under every page. Never
  cream, never tinted warm.
- **Panel White** (`#ffffff`): Panels, tables, and the header bar, raised off the
  ground by hairline and value, not by shadow.
- **Hairline** (`#cbd6da`): The default border on every element, plus the
  dividing rules between panels and the axis baseline. `#e9edef` is the lighter
  rule used inside dense tables.
- **Ink** (`#101a1e`) and **Muted Ink** (`#5e7480`): Primary text and secondary
  or label text.
- **Out of Play** (`#8a979c`): Desaturated grey for a record that is switched off
  — the POS "inactive" state word, drawn on a transparent field with no fill.
- **Night Ground** (`#081012`): The dark theme ground; panels sit on it as white
  at 3% rather than as a lighter grey.

### Named Rules
**The Three Signals Rule.** Amber is the reading, teal is the target, red is the
crossing. A colour never changes job between surfaces, and no fourth signal
colour is introduced for emphasis.

**The Off, Not Alarmed Rule.** A record that is out of play desaturates to
`#8a979c` on a transparent field. It never takes a coloured badge. Out of stock
is a breach and stays breach red — never desaturated.

**The No Glow Rule.** No gradient, no glass, no coloured halo, no glow. A tint is
a flat fill at a stated opacity (13% for a band, 3–6% for a dark-theme surface)
or it is not drawn.

## Typography

**Display Font:** Chivo (with `ui-sans-serif`, `system-ui`, sans-serif)
**Body Font:** Chivo
**Label/Mono Font:** Chivo Mono (with `ui-monospace`, `SFMono-Regular`, monospace)

**Character:** One grotesque family in two cuts. Chivo's sans is square-shouldered
and industrial, which lets figures run very large without looking promotional;
Chivo Mono is its instrument voice, used at small sizes with heavy tracking so a
unit, a SKU or a state word reads as a reading off a device rather than as prose.

### Hierarchy
- **Display** (800, 64px, 1.0, -0.035em, tabular): The monumental figure set
  inside or beside its trace. Reserved for a single number that the whole region
  is about. A 54px and 44px step exist above and below it for narrower columns.
- **Headline** (800, 34px, 1.04, -0.025em, tabular): Readout figures in a
  readout band — counts, totals, outside-state figures.
- **Title** (700, 26px, 1.1, -0.02em): The page heading under the breadcrumb, and
  nothing else at page level.
- **Body** (400, 14px/20px): Running text, table cells, descriptions under a
  heading, capped at `max-w-prose` so it never runs the width of a wide panel.
  A 12px/17px step carries fine print.
- **Label** (mono, 9px, 0.17em, uppercase): The only label voice — breadcrumbs,
  panel titles, table column heads (at 0.15em), readout labels, form labels (at
  10px / 0.14em). Small, tracked, never bold.
- **Measure** (mono, 11–14px, tabular): Quantities, SKUs padded to four digits,
  units, dates, axis ticks, rail counts, state words.

### Named Rules
**The Measurement-Only Rule.** Chivo Mono is for things a device could have
measured: figures, units, codes, axis labels, state words, timestamps. It is
never used for a sentence, a heading, or decoration.

**The Figures Line Up Rule.** Every numeric column is tabular (`tnum`) and
right-aligned, with its unit set smaller and in muted ink beside it. Tables carry
`font-variant-numeric: tabular-nums` at the element level so this holds even
where a cell forgets.

## Layout

A fixed rail plus a single-column work area. The rail is 272px expanded and 84px
collapsed, a flat slate-teal field with grouped sections (Reading / Stock /
Service) whose group names are small tracked caps and whose counts are
right-aligned mono. Below 1024px it leaves the flow entirely and returns as an
overlay with a backdrop. The work area is capped at the 2xl breakpoint
(1536px) and padded 16px on small screens, 24px from 768px up.

Each page opens with the same masthead: breadcrumb in tracked caps, page heading,
one line of what the screen is for, and the primary action top-right — all sitting
above a single hairline rule. Content below it stacks in 24px gaps. Wide regions
split as `1fr` plus a fixed reading column (260px for dashboard readouts, 340px
for a side panel) at xl and collapse to one column below it.

Breakpoints in use: 375, 425, 640, 768, 1024, 1280, 1536, 2000.

### Named Rules
**The Priority Step-Aside Rule.** Dense tables do not scroll sideways to stay
whole; columns leave by priority as width is lost. The inventory row sheds
Updated below 1280, Category and Location below 1024, and ID and the secondary
actions below 640 — at 390px it keeps name, quantity, state (moved under the
name), level and one action. The actions cell is sticky-right from 640 up.

**The Band Owns Its Region Rule.** The signature trace gets a full region
bounded by one hairline, with its figure set inside it. No card inside a card, no
frame inside a frame.

## Elevation & Depth

This system is flat. Panels are defined by a 1px hairline and a value step from
the technical-white ground to panel white (in dark, by white at 3% over the night
ground), never by a shadow. Shadows exist only for genuinely floating UI —
dropdown menus, tooltips, the datepicker — and are always an offset plus a soft
blur in the shell's own slate-teal tint, never a neutral black and never a halo.
Depth within a page comes from hairlines, grouping and the weight of the figures.

### Shadow Vocabulary
- **Resting hairline lift** (`box-shadow: 0px 1px 1px 0px rgba(14,42,51,0.06)`):
  Inputs at rest; just enough to seat the field.
- **Attached panel** (`box-shadow: 0px 1px 2px 0px rgba(14,42,51,0.08), 0px 2px 4px -2px rgba(14,42,51,0.05)`):
  Popovers attached to a trigger.
- **Floating surface** (`box-shadow: 0px 4px 8px -2px rgba(14,42,51,0.1), 0px 12px 20px -8px rgba(14,42,51,0.08)`):
  Modals and the datepicker.
- **Focus ring** (`box-shadow: 0px 0px 0px 3px rgba(15,127,140,0.32)`): the
  envelope-teal ring on composed controls; the base focus treatment is a 2px
  solid `#0f7f8c` outline at 2px offset.

### Named Rules
**The Flat Ground Rule.** If an element is in the page flow, it gets a hairline
and no shadow. A shadow is a statement that the element is floating above the
page, and nothing in the flow is.

## Shapes

Rectangles. The radius scale tops out at 2px across every step, so `rounded-xl`
and `rounded-sm` resolve to the same near-sharp corner; circles (avatars, the
breach dot) stay circles. Borders are a single device-pixel hairline in
`#cbd6da`, applied globally as the default border colour. The recurring
silhouette is a bounded rectangle divided by hairlines: a panel with a
tracked-caps header rule, then content; a table with a dark rule under its header
row and a faint rule between each line. Traces are drawn with non-scaling 1px
strokes so a bound stays a hairline at any width; bands are flat fills.

### Named Rules
**The 2px Ceiling Rule.** Nothing is rounded past 2px. No pills, no capsules, no
fully-rounded chips anywhere a state or a figure is shown.

## Components

### Buttons
- **Shape:** Near-sharp rectangle (1px radius), 40px tall at default, 36px small.
- **Primary:** Filled slate-teal shell (`#0e2a33`) with white semibold label,
  16px horizontal padding. In dark it lifts to `brand-500` so it stays separable
  from the rail.
- **Hover / Focus:** Background steps one stop lighter (`#0d3741`) over 150ms;
  focus shows the 2px envelope-teal outline at 2px offset. Active steps to
  `brand-950`. Disabled drops to a grey fill at 50% opacity.
- **Outline:** Panel white with a 1px inset grey-300 ring and ink-800 label;
  hover fills to `#e9edef`.
- **Row action:** A 28px-tall bordered chip at 12px, used in table action cells.
  The destructive one carries breach-red text and fills `error-50` on hover.

### State Words (the badge)
- **Style:** A tracked uppercase mono word on a flat tinted field, 2px padding,
  1px radius. Never a pill, never an icon-plus-dot.
- **State:** In band on `success-50` with `success-700` text; at the bound on
  `warning-50`; breached on `error-50` with `error-700`; out of play as
  `#8a979c` on a transparent field. Dark theme uses the same hues at 15% fill
  with the 200–300 step for text.

### Cards / Containers
- **Corner Style:** Effectively square (1–2px).
- **Background:** Panel white on the technical-white ground; white at 3% on the
  night ground.
- **Shadow Strategy:** None. See Elevation & Depth.
- **Border:** One hairline all round; an internal hairline under the header strip.
- **Internal Padding:** 16px on small, 20px from 640 up. Header strips are 20px
  horizontal by 14px vertical.

### Inputs / Fields
- **Style:** 44px tall, 2px radius, transparent fill with a 1px grey-300 border,
  16px horizontal padding, the resting hairline lift. Placeholder text in muted
  mono at 12px with wide tracking so an empty field reads as a slot.
- **Focus:** Border shifts to envelope teal; the default outline is suppressed in
  favour of the border shift on composed inputs, and the caret is probe amber.
- **Error / Success:** Border and text to `error-500` / `success-400`, with the
  hint line below in the matching 500 step.
- **Label:** Mono, 10px, 0.14em tracking, uppercase, muted ink, 6px above the
  field.

### Navigation
- **Style:** One flat slate-teal field, full height, 16px side padding. Group
  headings in tracked caps at `brand-400`. Items are 12px/8px rows at 14px
  medium with a 1px radius.
- **States:** Inactive is `brand-100` text with a `white/8` hover; active inverts
  to the work-area ground (`gray-50`) with `brand-900` text and a probe-amber
  icon. Sub-items hang off a `white/10` vertical rule with their own mono count.
- **Counts:** Right-aligned mono at 11px, tabular — and rendered only when the
  service actually answered.
- **Mobile:** Below 1024 the rail translates off-canvas and returns over a
  backdrop; the header carries the wordmark and the toggle.

### Tables
- **Header:** Mono 9px small caps at 0.15em on muted ink, over a dark rule
  (`gray-900`) that anchors the whole table.
- **Rows:** Divided by faint hairlines, hover tints to `gray-50`. Quantities
  right-aligned in tabular mono with the unit smaller beside them; breached
  quantities in breach red.
- **Empty state:** A full-span cell with a semibold line and one muted sentence
  saying what would fill it. No illustration.

### The Envelope Trace (signature)
The one mark of this interface, at three scales from one component. Length is
time, height is quantity, fill is state.

- **Full region** (760×150–168): the amber polyline over a 13%-opacity teal band
  with solid hairline bounds when a par exists, or dashed bounds when the band is
  derived from the series itself (and then labelled as such). A breach draws a
  full-height red rule, a 4px red dot at the crossing, and a timed mono label.
- **Row scale** (128×28): the same encoding compressed into a table cell, breach
  marker and label suppressed.
- **Level bar** (14px tall): point-in-time quantity against the real stock
  thresholds (in stock above 50, out at or below 10) on one fixed axis shared by
  every row, so two rows compare directly. Teal band above the in-stock bound,
  amber fill for the reading, breach red once it drops to the lower bound, a 3px
  amber tick at the right edge when the reading runs past the axis.
- Every instance carries an `aria-label` sentence stating the figure and its
  bounds: the mark is data, not decoration. A series with no readings draws a
  dashed empty frame reading "No readings yet", never a flat zero line.

## Do's and Don'ts

### Do:
- **Do** draw every changing quantity as the envelope trace: amber actual, teal
  band at 13% fill with hairline bounds, breach red at the crossing.
- **Do** keep Chivo Mono for measurement — figures, units, SKUs, axis labels,
  state words, counts — and set it small with heavy tracking.
- **Do** bound panels with a single `#cbd6da` hairline on the technical-white
  ground and leave them flat.
- **Do** right-align numeric columns as tabular figures with the unit smaller and
  muted beside them.
- **Do** label an absence in the same tracked caps as any other label: "No target
  set", "no par set", "stock service unreachable", an em-dash instead of a figure.
- **Do** let columns step aside by priority as width is lost, keeping name,
  quantity, state, level and one action at 390px.
- **Do** design both themes: dark grounds on `#081012` with panels as white at 3%.

### Don't:
- **Don't** round anything past 2px, and never ship a pill or capsule for a state.
- **Don't** use a gradient, a glass blur, a coloured glow, or a shadow on anything
  sitting in the page flow.
- **Don't** reassign the signal colours: amber is never decoration, teal is never
  a generic accent, red is never emphasis.
- **Don't** desaturate an out-of-stock line — out of stock is a breach and stays
  breach red. Desaturation means switched off.
- **Don't** draw a target band where no target exists, derive a money figure where
  the service returns no price, or show a count a service did not answer with.
- **Don't** put a same-size KPI card grid over a generic line chart; the figure
  and its limit belong in the same mark.
- **Don't** set body copy, headings or navigation labels in the mono face.
