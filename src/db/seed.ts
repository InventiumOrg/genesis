/**
 * Seed one believable multi-outlet coffee business.
 *
 * Everything here is authored sample data for development, not customer data
 * and not a claim about anything. It exists so every screen has something true
 * to render and so the envelope trace has real history behind it: sales are
 * recorded through the same domain function the app uses, which means each one
 * draws its recipe's ingredients down through the ledger exactly as a real
 * sale would.
 *
 *   npm run db:seed            # add the sample business
 *   npm run db:seed -- --reset # clear every table first
 */

import './load-env';

import { sql } from 'drizzle-orm';

import { db, pool } from './index';
import {
  inventoryItems,
  inventoryTransactions,
  orders,
  parLevels,
  pointsOfSale,
  recipeIngredients,
  recipes,
  sales,
  stockMovements,
  storageRooms,
  warehouses,
} from './schema';

/** A small deterministic generator, so a reseed produces the same business. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
const rand = rng(20261113);
const pick = <T,>(xs: T[]): T => xs[Math.floor(rand() * xs.length)];
const between = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

async function reset() {
  await db.execute(sql`truncate table
    ${stockMovements}, ${inventoryTransactions}, ${sales}, ${orders},
    ${recipeIngredients}, ${recipes}, ${parLevels}, ${inventoryItems},
    ${storageRooms}, ${pointsOfSale}, ${warehouses}
    restart identity cascade`);
  console.log('cleared every table');
}

async function main() {
  if (process.argv.includes('--reset')) await reset();

  const existing = await db.select({ n: sql<number>`count(*)::int` }).from(warehouses);
  if (Number(existing[0].n) > 0) {
    console.log('database already has data; pass --reset to start over');
    await pool.end();
    return;
  }

  const wh = await db
    .insert(warehouses)
    .values([
      { name: 'Kho Thảo Điền', address: '12 Đường số 10', ward: 'Thảo Điền', district: 'Thủ Đức', city: 'Hồ Chí Minh', country: 'Việt Nam' },
      { name: 'Kho Bình Thạnh', address: '48 Điện Biên Phủ', ward: 'Phường 25', district: 'Bình Thạnh', city: 'Hồ Chí Minh', country: 'Việt Nam' },
      { name: 'Kho Thủ Đức', address: '7 Võ Văn Ngân', ward: 'Linh Chiểu', district: 'Thủ Đức', city: 'Hồ Chí Minh', country: 'Việt Nam' },
    ])
    .returning();

  await db.insert(storageRooms).values([
    { warehouseId: wh[0].id, name: 'Kho khô' },
    { warehouseId: wh[0].id, name: 'Kho lạnh' },
    { warehouseId: wh[1].id, name: 'Kho khô' },
  ]);

  const pos = await db
    .insert(pointsOfSale)
    .values([
      { name: 'Quán 3', location: 'Thảo Điền', status: 'active', warehouseId: wh[0].id },
      { name: 'Quán 3 — quầy ngoài', location: 'Thảo Điền', status: 'active', warehouseId: wh[0].id },
      { name: 'Quán 1', location: 'Bình Thạnh', status: 'active', warehouseId: wh[1].id },
      { name: 'Quán 4', location: 'Thủ Đức', status: 'inactive', warehouseId: wh[2].id },
    ])
    .returning();

  const ITEMS: {
    name: string; unit: string; measure: string; category: string;
    location: string; opening: number; par?: [number, number];
  }[] = [
    { name: 'Robusta, honey-processed', unit: 'kg', measure: 'weight', category: 'Coffee', location: 'Kho Thảo Điền', opening: 8.6, par: [6, 9] },
    { name: 'Arabica, washed', unit: 'kg', measure: 'weight', category: 'Coffee', location: 'Kho Thảo Điền', opening: 5.2, par: [4, 7] },
    { name: 'Condensed milk, 380 g tin', unit: 'tin', measure: 'count', category: 'Dairy', location: 'Kho Thảo Điền', opening: 64, par: [24, 80] },
    { name: 'Fresh milk, 1 L', unit: 'L', measure: 'volume', category: 'Dairy', location: 'Kho Thảo Điền', opening: 38, par: [20, 60] },
    { name: 'Ice', unit: 'kg', measure: 'weight', category: 'Consumable', location: 'Kho Thảo Điền', opening: 120 },
    { name: 'Water, filtered', unit: 'L', measure: 'volume', category: 'Consumable', location: 'Kho Thảo Điền', opening: 240, par: [100, 300] },
    { name: 'Cup 16 oz + lid', unit: 'ea', measure: 'count', category: 'Packaging', location: 'Kho Thảo Điền', opening: 1520, par: [500, 2000] },
    { name: 'Lime, loose', unit: 'kg', measure: 'weight', category: 'Produce', location: 'Kho Bình Thạnh', opening: 7.4, par: [4, 9] },
    { name: 'Cane sugar', unit: 'kg', measure: 'weight', category: 'Dry goods', location: 'Kho Bình Thạnh', opening: 22, par: [10, 30] },
    { name: 'Tea leaves, green', unit: 'kg', measure: 'weight', category: 'Tea', location: 'Kho Bình Thạnh', opening: 3.8, par: [2, 5] },
  ];

  const openedAt = new Date();
  openedAt.setDate(openedAt.getDate() - 14);

  const items = await db
    .insert(inventoryItems)
    .values(ITEMS.map((i) => ({
      name: i.name, unit: i.unit, measure: i.measure,
      category: i.category, location: i.location,
    })))
    .returning();

  const byName = new Map(items.map((i) => [i.name, i]));

  await db.insert(stockMovements).values(
    ITEMS.map((i) => ({
      inventoryItemId: byName.get(i.name)!.id,
      delta: i.opening,
      reason: 'opening',
      note: 'Opening count at the start of the period',
      occurredAt: openedAt,
    })),
  );

  const pars = ITEMS.filter((i) => i.par);
  if (pars.length) {
    await db.insert(parLevels).values(
      pars.map((i) => ({
        inventoryItemId: byName.get(i.name)!.id,
        minQty: i.par![0],
        maxQty: i.par![1],
      })),
    );
  }

  // Costs are in whole US cents, which is how money is stored. These were
  // authored in đồng and converted at ₫25725.52 to $1 — the same rate the
  // 0001 migration used — so a freshly seeded database and a migrated one
  // hold the same figures.
  const RECIPES: { name: string; cost: number; lines: [string, number, string][] }[] = [
    { name: 'Cà phê sữa đá', cost: 45, lines: [['Robusta, honey-processed', 0.018, 'kg'], ['Condensed milk, 380 g tin', 0.08, 'tin'], ['Ice', 0.12, 'kg'], ['Water, filtered', 0.04, 'L'], ['Cup 16 oz + lid', 1, 'ea']] },
    { name: 'Bạc xỉu', cost: 51, lines: [['Robusta, honey-processed', 0.016, 'kg'], ['Fresh milk, 1 L', 0.12, 'L'], ['Condensed milk, 380 g tin', 0.05, 'tin'], ['Ice', 0.12, 'kg'], ['Cup 16 oz + lid', 1, 'ea']] },
    { name: 'Cà phê đen', cost: 33, lines: [['Robusta, honey-processed', 0.018, 'kg'], ['Water, filtered', 0.06, 'L'], ['Cup 16 oz + lid', 1, 'ea']] },
    { name: 'Trà chanh đá', cost: 30, lines: [['Tea leaves, green', 0.006, 'kg'], ['Lime, loose', 0.03, 'kg'], ['Cane sugar', 0.02, 'kg'], ['Ice', 0.15, 'kg'], ['Cup 16 oz + lid', 1, 'ea']] },
    { name: 'Cà phê trứng', cost: 65, lines: [['Arabica, washed', 0.02, 'kg'], ['Condensed milk, 380 g tin', 0.06, 'tin'], ['Cup 16 oz + lid', 1, 'ea']] },
  ];

  const createdRecipes = await db
    .insert(recipes)
    .values(RECIPES.map((r) => ({ name: r.name, cost: r.cost })))
    .returning();

  await db.insert(recipeIngredients).values(
    RECIPES.flatMap((r, idx) =>
      r.lines.map(([name, quantity, unit]) => ({
        recipeId: createdRecipes[idx].id,
        inventoryItemId: byName.get(name)?.id ?? null,
        name,
        unit,
        measure: byName.get(name)?.measure ?? '',
        quantity,
      })),
    ),
  );

  // Shelf price per cup, in whole US cents, converted from đồng at the same
  // rate as the costs above.
  const PRICES: Record<string, number> = {
    'Cà phê sữa đá': 136,
    'Bạc xỉu': 148,
    'Cà phê đen': 117,
    'Trà chanh đá': 124,
    'Cà phê trứng': 175,
  };

  // Fourteen days of trading, recorded through the domain layer so every sale
  // draws its ingredients down exactly as it would in the running app.
  const { createSale } = await import('@/server/sales');
  const activePos = pos.filter((p) => p.status === 'active');
  let saleCount = 0;

  for (let day = 13; day >= 0; day -= 1) {
    const perDay = between(8, 16);
    for (let n = 0; n < perDay; n += 1) {
      const recipe = pick(createdRecipes);
      const at = new Date();
      at.setDate(at.getDate() - day);
      at.setHours(between(7, 21), between(0, 59), between(0, 59), 0);

      await createSale({
        posId: pick(activePos).id,
        recipeId: recipe.id,
        price: PRICES[recipe.name] ?? 117,
        quantity: between(1, 4),
      });
      saleCount += 1;
    }
  }

  // A few restocks, so the traces rise as well as fall.
  const restocked = ['Robusta, honey-processed', 'Condensed milk, 380 g tin', 'Lime, loose'];
  for (const name of restocked) {
    const item = byName.get(name)!;
    const at = new Date();
    at.setDate(at.getDate() - 6);
    await db.insert(stockMovements).values({
      inventoryItemId: item.id,
      delta: name.includes('Robusta') ? 5 : name.includes('Condensed') ? 24 : 4,
      reason: 'import',
      note: 'Delivery from supplier',
      occurredAt: at,
    });
  }

  // One logged waste, because stock leaves for reasons other than a sale.
  const robusta = byName.get('Robusta, honey-processed')!;
  const wasteAt = new Date();
  wasteAt.setDate(wasteAt.getDate() - 2);
  await db.insert(stockMovements).values({
    inventoryItemId: robusta.id,
    delta: -0.044,
    reason: 'waste',
    note: 'Dropped dose at the counter',
    occurredAt: wasteAt,
  });

  await db.insert(orders).values(
    Array.from({ length: 6 }, () => {
      const recipe = pick(createdRecipes);
      return {
        posId: pick(activePos).id,
        recipeId: recipe.id,
        price: PRICES[recipe.name] ?? 117,
      };
    }),
  );

  const [{ onHand }] = await db
    .select({ onHand: sql<number>`round(coalesce(sum(${stockMovements.delta}), 0)::numeric, 3)` })
    .from(stockMovements)
    .where(sql`${stockMovements.inventoryItemId} = ${robusta.id}`);

  console.log(
    [
      `seeded ${wh.length} warehouses, ${pos.length} points of sale,`,
      `${items.length} stock items, ${createdRecipes.length} recipes,`,
      `${saleCount} sales.`,
      `Robusta on hand is now ${onHand} kg, every gram of it from the ledger.`,
    ].join(' '),
  );

  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  await pool.end().catch(() => {});
  process.exit(1);
});
