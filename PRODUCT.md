# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: the **business owner of several outlets**, watching stock levels and revenue
across multiple warehouses and points of sale. The dashboard and reporting surfaces are
built for this reader.

Secondary: **floor staff at a POS**, who ring up sales. Their work generates the sales
records that drive stock depletion, but the analysis surfaces are not aimed at them.

## Product Purpose

Inventium keeps physical stock and money in agreement for a multi-outlet food-and-beverage
business. A sale rung up at a point of sale draws the sold recipe's ingredients down from
stock automatically, and the owner sees the revenue that sale returned. Success is the
owner trusting the stock and revenue numbers without re-counting by hand.

## Positioning

**Sales adjust stock automatically, and report back the owner's revenue.** Selling a
recipe at a POS depletes that recipe's ingredients from inventory without a manual
adjustment, and the same event feeds the owner's revenue view. A plain inventory tracker
does not know what a sale consumed; a plain POS does not know what is left in the
warehouse. Inventium joins the two through the recipe.

## Operating Context

- **Warehouses** hold stock and carry full street addresses down to ward, district, city,
  and country; a warehouse can be broken into storage rooms.
- **Points of sale** are named, located terminals, each tied to a warehouse, with an
  active/inactive status.
- **Recipes** list ingredients (name, unit, measure, quantity) and carry a cost. They are
  the unit a customer buys and the bridge between a sale and the stock it consumes.
- **Sales** are recorded per POS and per recipe, with price, quantity, and timestamp.
- **Orders** and inventory **import/export** cover restocking and bulk data movement.
- Users sign in through Clerk; every route other than the landing, sign-in, sign-up, and
  SSO callback requires an authenticated session.

## Capabilities and Constraints

Shipped surfaces: dashboard, inventory (list, add, edit, import, export), recipes (list,
detail, add, edit), warehouse (list, detail, edit, storage rooms), POS (list, detail,
edit), orders (list, add, edit), sales (list, detail, add, edit), sale overview and sale
list, plus sign-in / sign-up / SSO callback and a 404.

- **Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Clerk for auth,
  ApexCharts for charts, FullCalendar, react-dnd, react-dropzone. Built as
  `output: 'standalone'` and shipped in a Docker image; dev server runs on port 8080.
- **Backend:** a separate REST service at `NEXT_PUBLIC_BACKEND_API_URI` (`/v1`). Every
  domain has paired `*-server.ts` / `*-client.ts` modules in `src/lib`, and the mappers
  tolerate both PascalCase and camelCase keys from the backend — the API's casing is not
  something the frontend can assume.
- **Observability:** OpenTelemetry traces and logs over OTLP HTTP are wired into the Node
  server; `OTEL_SDK_DISABLED` turns it off when no collector is running.
- **Known constraint:** the build intentionally ignores TypeScript and ESLint errors
  (`next.config.ts`). Type errors do not fail CI, so they do not surface at build time.
- **Open / undecided product facts:** the sidebar links `/dashboard/inventory` and
  `/dashboard/revenue`, neither of which exists yet — the split of the dashboard into
  sales, inventory, and revenue views is intended but unbuilt. Roles and permissions are
  not modeled: every authenticated user sees every surface, so the owner/staff distinction
  above is an audience fact, not an implemented access rule.

## Brand Commitments

The name is **Inventium**. Nothing about the current visual identity is binding: the app
sits on the TailAdmin Next.js template, and the indigo `#465fff` brand ramp, the Outfit
typeface, and the card styling are **scaffolding, replaceable** by the owner's decision.
No logo, voice guide, or identity constraint has been established.

The template's demo routes — UI Elements (alerts, avatars, badge, buttons, images,
videos), Charts (line, bar), Calendar, Basic Tables, Form Elements, Blank — are leftovers,
not product surfaces, and are slated for removal. The same goes for the `test/*`,
`api-debug`, and `auth-header-test` routes.

## Evidence on Hand

- Real domain data comes from the backend service; there is no committed fixture set.
- The dashboard widgets are still TailAdmin placeholders with **hardcoded numbers**
  (`EcommerceMetrics`: "Customers 3,782", "Orders 5,359"; `MonthlyTarget`,
  `MonthlySalesChart`, `StatisticsChart`, `RecentOrders`, `DemographicCard` with its world
  map). These are template demo values, not product data, and must not be read as metrics
  or quoted as fact.
- No customers, testimonials, case studies, press, pricing, or benchmarks exist. Future
  work must not invent them.
- `README.md` is a stale Vite template README and does not describe this project.
- Page metadata on `src/app/(admin)/page.tsx` still advertises "TailAdmin — Next.js
  Dashboard Template"; it is template residue, not a product claim.

## Product Principles

1. **The numbers must be earned.** Stock and revenue figures come from recorded sales and
   recipe consumption, never from a placeholder or an estimate dressed as a fact.
2. **The recipe is the hinge.** Anything that changes stock or revenue should be traceable
   to a recipe and the sale that consumed it.
3. **Built for the owner's glance, used by staff under pressure.** Reporting surfaces
   answer "what is left and what came in" quickly; POS and entry surfaces stay fast and
   forgiving at a counter.
4. **Multi-outlet by default.** Every stock, sale, and revenue question has a "which
   warehouse / which POS" answer; no surface may assume a single location.
5. **The backend's shape is not trustworthy.** Keep the tolerant mapping layer and handle
   missing or differently-cased fields rather than rendering `undefined` to the user.
