# Inventium — MVP monolith

Stock and revenue in agreement for a multi-outlet food-and-beverage business.
A sale rung up at a point of sale draws its recipe's ingredients down from
stock on its own, and reports the revenue it returned.

This repository is **one Next.js application**: the screens, the data layer and
the HTTP API live together and talk to one Postgres database. It replaces the
earlier split of a `frontend-service` talking to separate REST services over a
Kubernetes cluster, so the product can be deployed and judged as a whole before
being split up again.

## Running it

```bash
npm install
cp .env.example .env.local        # then fill in DATABASE_URL and the Clerk keys
createdb inventium                # any Postgres 14+ will do
npm run db:migrate                # create the tables
npm run db:seed                   # one sample business, 14 days of trading
npm run dev                       # http://localhost:8080
```

`npm run db:seed -- --reset` clears every table and seeds again.

## How it is put together

```
src/db/          schema, migrations, seed — Drizzle over node-postgres
src/server/      the backend: one module per domain, no HTTP in sight
src/app/api/v1/  route handlers, a thin shell over src/server
src/lib/         the screens' data layer; *-server.ts call src/server directly
src/app/         the surfaces themselves
```

**Stock on hand is never stored.** It is the sum of an append-only
`stock_movements` ledger — one row per event that moved a quantity: an opening
count, a sale drawing a recipe down, a transfer, logged waste, an import. Every
figure the product shows can be traced to the row that produced it, which is
the only claim the product makes, and the envelope trace is a real query over
history rather than a chart drawn from a mutable number.

Recording a sale writes the sale and its drawdowns in one transaction. Nobody
types the grams: the recipe says what a cup consumes and the ledger carries the
result.

### The seam back to microservices

`src/lib/*-server.ts` is the only place the screens reach for data. Today those
functions call `src/server/*` in the same process; before, they called REST
services over HTTP. When a domain is ready to become its own service again,
only those bodies change — the screens do not.

## Deploying to Vercel

1. Import the repository. The app is at the repository root, so no Root
   Directory setting is needed.
2. Add a Postgres database — Vercel's first-party Postgres is Neon, and the
   integration sets `DATABASE_URL` for you. **Use the pooled connection string**
   (Neon's `-pooler` host): every serverless instance opens its own connections.
3. Set the other variables from `.env.example`: the Clerk keys,
   `NEXT_PUBLIC_BACKEND_API_URI=/api/v1`, and `OTEL_SDK_DISABLED=true` unless a
   collector is running.
4. Run the migrations against the production database once:
   `DATABASE_URL=<pooled url> npm run db:migrate`.

Type errors fail the build on purpose: the data layer lives here now, so a
broken query is a defect rather than something to discover in production.

## Known limits

- **Serverless shape.** Function request bodies cap around 4.5 MB and run for
  seconds, not minutes. Bulk inventory import needs chunking or blob upload
  before it can take a large file.
- **Stock thresholds are unit-blind.** "In stock" above 50 and "out of stock"
  at or below 10 come from the original service and apply equally to 1,480 cups
  and 9 kg of limes. The rule is preserved as it was; it wants revisiting.
- **Par levels** exist in the schema and are seeded, but no screen edits them
  yet.
- **Template residue.** The UI-element, chart, calendar and `test/*` routes come
  from the TailAdmin template and are not product surfaces.

## The infrastructure in this repository

`docean/`, `kind/`, `manifests/` and `sketcher/` hold the Pulumi, Ansible and
Jenkins work for running Inventium on Kubernetes. None of it is needed to run
or deploy the MVP; it is the starting point for the split back into services.
