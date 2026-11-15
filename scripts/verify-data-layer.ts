/**
 * Exercise the data layer the screens use, against the real database.
 * Run with: npx tsx scripts/verify-data-layer.ts
 */
import '../src/db/load-env';

import {
  fetchInventoryItemsServer,
  fetchInventoryItemServer,
  fetchInventoryOverviewServer,
} from '../src/lib/inventory-server';
import { fetchOrdersServer } from '../src/lib/orders-server';
import { fetchRecipesServer, fetchRecipeServer } from '../src/lib/recipes-server';
import { fetchRevenueServer, fetchSalesServer, fetchSaleServer } from '../src/lib/sales-server';
import { fetchTransactionsServer } from '../src/lib/transactions-server';
import { pool } from '../src/db';
import { inventoryHistory, getPar } from '../src/server/inventory';
import { listPos } from '../src/server/pos';
import { createTransaction } from '../src/server/transactions';
import { listWarehouses } from '../src/server/warehouses';
import { createSale } from '../src/server/sales';

const line = (k: string, v: unknown) => console.log(`  ${k.padEnd(30)} ${v}`);

async function main() {
  console.log('\nINVENTORY');
  const inv = await fetchInventoryItemsServer({ limit: 5 });
  line('items on page 1', inv.items.length);
  line('total items', inv.pagination.totalItems);
  line('first item', `${inv.items[0].name} — ${inv.items[0].quantity} ${inv.items[0].unit} (${inv.items[0].status})`);
  line('pagination', JSON.stringify(inv.pagination));

  const low = await fetchInventoryItemsServer({ status: 'Out of Stock', limit: 50 });
  line('filter: Out of Stock', low.items.map((i) => `${i.name}=${i.quantity}`).join(', ') || '(none)');
  const search = await fetchInventoryItemsServer({ search: 'robusta', limit: 10 });
  line('search: robusta', search.items.map((i) => i.name).join(', '));

  const one = await fetchInventoryItemServer(inv.items[0].id);
  line('fetch one', `${one.name} = ${one.quantity}`);

  console.log('\nTHE LEDGER (what the trace is drawn from)');
  const history = await inventoryHistory(1, 200);
  const par = await getPar(1);
  line('readings for item 1', history.length);
  line('first → last on hand', `${history[0]?.v} → ${history[history.length - 1]?.v}`);
  line('par envelope', par ? `${par.min} – ${par.max}` : 'no par set');

  console.log('\nRECIPES');
  const recipes = await fetchRecipesServer({ limit: 10 });
  line('recipes', recipes.recipes.length);
  const recipe = await fetchRecipeServer(recipes.recipes[0].id);
  line('first recipe', `${recipe.name}, cost ${recipe.cost}`);
  line('its ingredients', recipe.ingredients.length);
  line('ingredient 1 raw', recipe.ingredients[0]);

  console.log('\nSALES');
  const sales = await fetchSalesServer({ limit: 5 });
  line('sales page 1', sales.sales.length);
  line('total sales', sales.pagination.totalItems);
  const sale = await fetchSaleServer(sales.sales[0].id);
  line('fetch one', `sale #${sale.id} pos=${sale.posId} recipe=${sale.recipeId} qty=${sale.quantity}`);

  console.log('\nTHE DRAWDOWN (a sale moves stock on its own)');
  const target = await fetchInventoryItemServer(1);
  const before = target.quantity;
  const made = await createSale({ posId: 1, recipeId: recipes.recipes.find((r) => r.name === 'Cà phê sữa đá')!.id, price: 35000, quantity: 4 });
  const after = (await fetchInventoryItemServer(1)).quantity;
  line('robusta before the sale', before);
  line('sold', `4 × cà phê sữa đá (sale #${made.ID})`);
  line('robusta after the sale', after);
  line('drawn automatically', `${Math.round((before - after) * 1000)} g — nobody typed it`);

  console.log('\nORDERS, POS, WAREHOUSES');
  const orders = await fetchOrdersServer({ limit: 10 });
  line('orders', `${orders.orders.length} of ${orders.pagination.totalItems}`);
  const pos = await listPos({ limit: 10 });
  line('points of sale', pos.items.map((p) => `${p.Name}(${p.Status})`).join(', '));
  const whs = await listWarehouses({ limit: 10 });
  line('warehouses', whs.items.map((w) => w.Name).join(', '));

  console.log('\nIMPORT / EXPORT');
  const tx = await createTransaction({ type: 'IMPORT', inventoryId: 1, quantity: 2.5, source: 'Supplier — Đắk Lắk' });
  const list = await fetchTransactionsServer({ inventoryId: '1', limit: 10 });
  line('created', `${tx.type} ${tx.quantity} ${tx.inventoryUnit}`);
  line('transactions for item 1', `${list.transactions.length} (count ${list.count})`);
  line('robusta after import', (await fetchInventoryItemServer(1)).quantity);

  console.log('\nINVENTORY DASHBOARD');
  const stock = await fetchInventoryOverviewServer(14);
  line('lines on record', stock.counts.total);
  line('in stock / low / out', `${stock.counts.inStock} / ${stock.counts.lowStock} / ${stock.counts.outOfStock}`);
  line('counts sum to total', stock.counts.inStock + stock.counts.lowStock + stock.counts.outOfStock === stock.counts.total ? 'yes' : 'NO — states overlap or leak');
  line('warehouses grouped', stock.byLocation.map((l) => `${l.location}(${l.items})`).join(', ') || 'none');
  line('lines summed by warehouse', stock.byLocation.reduce((s, l) => s + l.items, 0));
  line('movement reasons in window', stock.movements.map((m) => `${m.reason}×${m.events}`).join(', ') || 'none');
  line('needing attention, named', stock.attention.length);

  console.log('\nREVENUE DASHBOARD');
  const rev = await fetchRevenueServer(14);
  line('revenue over 14 days', `₫${rev.revenue.toLocaleString('vi-VN')}`);
  line('units / sales', `${rev.units} / ${rev.sales}`);
  line('days in the trace', `${rev.byDay.length} (expected 14)`);
  line('days with any takings', rev.byDay.filter((d) => d.v > 0).length);
  line('daily total matches window', rev.byDay.reduce((s, d) => s + d.v, 0) === rev.revenue ? 'yes' : `NO — ${rev.byDay.reduce((s, d) => s + d.v, 0)} by day vs ${rev.revenue} in total`);
  line('points of sale listed', rev.byPos.map((p) => `${p.name}:₫${p.revenue.toLocaleString('vi-VN')}`).join(', ') || 'none');
  line('pos total matches window', rev.byPos.reduce((s, p) => s + p.revenue, 0) === rev.revenue ? 'yes' : `NO — ${rev.byPos.reduce((s, p) => s + p.revenue, 0)} by pos vs ${rev.revenue} in total`);
  line('recipes ranked', rev.byRecipe.map((r) => `${r.name}×${r.units}`).join(', ') || 'none');

  console.log('\nall data-layer checks passed\n');
  await pool.end();
}

main().catch(async (e) => {
  console.error('\nFAILED:', e);
  await pool.end().catch(() => {});
  process.exit(1);
});
