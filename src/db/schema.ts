/**
 * Inventium MVP schema.
 *
 * One rule governs this file: **stock on hand is never stored.** It is the sum
 * of an append-only `stock_movements` ledger, one row per event that moved a
 * quantity — an opening count, a sale drawing a recipe's ingredients down, a
 * transfer, logged waste, a restock. Every figure the product shows can
 * therefore be traced to the row that produced it, which is the one claim the
 * product makes, and the envelope trace becomes a real query over history
 * rather than a chart drawn from a mutable number.
 *
 * `par_levels` exists here although the old backend never had it: the
 * dashboard and the landing page both encode a reading against its par, and
 * without it the interface can only say "no par set".
 */

import { relations, sql } from 'drizzle-orm';
import {
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull().default(''),
  ward: text('ward').notNull().default(''),
  district: text('district').notNull().default(''),
  city: text('city').notNull().default(''),
  country: text('country').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const storageRooms = pgTable(
  'storage_rooms',
  {
    id: serial('id').primaryKey(),
    warehouseId: integer('warehouse_id')
      .notNull()
      .references(() => warehouses.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('storage_rooms_warehouse_idx').on(t.warehouseId)],
);

export const pointsOfSale = pgTable(
  'points_of_sale',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    location: text('location').notNull().default(''),
    /** 'active' | 'inactive' — an inactive POS is out of play, never an alarm. */
    status: text('status').notNull().default('active'),
    warehouseId: integer('warehouse_id').references(() => warehouses.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('pos_warehouse_idx').on(t.warehouseId)],
);

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    unit: text('unit').notNull().default(''),
    measure: text('measure').notNull().default(''),
    category: text('category').notNull().default(''),
    /** Where the stock sits; the UI reads this as the warehouse name. */
    location: text('location').notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('inventory_items_name_idx').on(t.name)],
);

/**
 * The ledger. Nothing else writes stock. `delta` is signed: positive for a
 * count, a restock or an import, negative for a sale drawdown, waste or an
 * export. `refType`/`refId` point back at the sale, order or transaction that
 * caused the movement, so a figure on screen leads to its cause in one hop.
 */
export const stockMovements = pgTable(
  'stock_movements',
  {
    id: serial('id').primaryKey(),
    inventoryItemId: integer('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    delta: doublePrecision('delta').notNull(),
    /** 'opening' | 'sale' | 'order' | 'transfer' | 'waste' | 'import' | 'export' | 'adjustment' */
    reason: text('reason').notNull(),
    refType: text('ref_type'),
    refId: integer('ref_id'),
    note: text('note'),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('stock_movements_item_time_idx').on(t.inventoryItemId, t.occurredAt),
    index('stock_movements_ref_idx').on(t.refType, t.refId),
  ],
);

/** The envelope every reading is drawn against. Absent means "no par set". */
export const parLevels = pgTable('par_levels', {
  inventoryItemId: integer('inventory_item_id')
    .primaryKey()
    .references(() => inventoryItems.id, { onDelete: 'cascade' }),
  minQty: doublePrecision('min_qty').notNull(),
  maxQty: doublePrecision('max_qty').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  /**
   * Cost in whole US cents, so $1.14 is 114. Cents and not dollars because the
   * column is an integer: dollars would round every recipe to the nearest
   * dollar. See `src/lib/currency.ts` — đồng is a conversion for display and is
   * never stored.
   */
  cost: integer('cost').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * The hinge between a sale and the stock it consumes. `inventoryItemId` is
 * nullable because a recipe may name an ingredient the stockroom does not
 * carry yet; such a line is recorded and simply draws nothing.
 */
export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: serial('id').primaryKey(),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    inventoryItemId: integer('inventory_item_id').references(() => inventoryItems.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    unit: text('unit').notNull().default(''),
    measure: text('measure').notNull().default(''),
    quantity: doublePrecision('quantity').notNull().default(0),
  },
  (t) => [index('recipe_ingredients_recipe_idx').on(t.recipeId)],
);

export const sales = pgTable(
  'sales',
  {
    id: serial('id').primaryKey(),
    posId: integer('pos_id')
      .notNull()
      .references(() => pointsOfSale.id, { onDelete: 'restrict' }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'restrict' }),
    /**
     * The price of ONE unit, in whole US cents. Revenue for the row is
     * `price * quantity`; summing this column alone under-reports a sale of
     * four cups by three quarters.
     */
    price: integer('price').notNull().default(0),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('sales_created_idx').on(t.createdAt), index('sales_pos_idx').on(t.posId)],
);

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    posId: integer('pos_id')
      .notNull()
      .references(() => pointsOfSale.id, { onDelete: 'restrict' }),
    recipeId: integer('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'restrict' }),
    /** Price in whole US cents, so $1.14 is 114. */
    price: integer('price').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('orders_created_idx').on(t.createdAt)],
);

/** Bulk stock movement in and out of a warehouse, as the import/export screens record it. */
export const inventoryTransactions = pgTable(
  'inventory_transactions',
  {
    id: serial('id').primaryKey(),
    /** 'IMPORT' | 'EXPORT' */
    type: text('type').notNull(),
    inventoryItemId: integer('inventory_item_id')
      .notNull()
      .references(() => inventoryItems.id, { onDelete: 'cascade' }),
    source: text('source').notNull().default(''),
    destination: text('destination').notNull().default(''),
    quantity: doublePrecision('quantity').notNull(),
    status: text('status').notNull().default('COMPLETED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('inventory_transactions_item_idx').on(t.inventoryItemId, t.createdAt),
    index('inventory_transactions_type_idx').on(t.type),
  ],
);

export const warehouseRelations = relations(warehouses, ({ many }) => ({
  storageRooms: many(storageRooms),
  pointsOfSale: many(pointsOfSale),
}));

export const inventoryItemRelations = relations(inventoryItems, ({ many, one }) => ({
  movements: many(stockMovements),
  par: one(parLevels, {
    fields: [inventoryItems.id],
    references: [parLevels.inventoryItemId],
  }),
}));

export const recipeRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

/** On-hand for one item: the ledger summed. Never read a stored quantity. */
export const onHandSql = sql<number>`coalesce(sum(${stockMovements.delta}), 0)`;
