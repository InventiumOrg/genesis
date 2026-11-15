-- Money becomes whole US cents.
--
-- `recipes.cost`, `sales.price` and `orders.price` held đồng: the seed authored
-- a cup at 11600 and sold it at 30000. Read as cents those become $116.00 and
-- $300.00, so the rows cannot simply be reinterpreted — they have to be
-- converted, once, here.
--
-- The rate is fixed in this file on purpose. A migration must produce the same
-- result whenever it runs, so it cannot read today's rate: a row converted at
-- one rate on staging and another in production would make the two databases
-- disagree about a sale that already happened. ₫25725.52 to $1 is the rate on
-- 2026-11-15, the day this conversion was written, and it stays that forever.
--
-- Rounding is to the nearest cent, so a ₫30000 sale lands on $1.17 rather than
-- $1.16. Amounts already at 0 stay 0.

UPDATE "recipes"
SET "cost" = ROUND("cost" / 25725.52 * 100)
WHERE "cost" <> 0;
--> statement-breakpoint
UPDATE "sales"
SET "price" = ROUND("price" / 25725.52 * 100)
WHERE "price" <> 0;
--> statement-breakpoint
UPDATE "orders"
SET "price" = ROUND("price" / 25725.52 * 100)
WHERE "price" <> 0;
--> statement-breakpoint
COMMENT ON COLUMN "recipes"."cost" IS 'Cost in whole US cents. $1.14 is 114.';
--> statement-breakpoint
COMMENT ON COLUMN "sales"."price" IS 'Unit price in whole US cents. $1.14 is 114.';
--> statement-breakpoint
COMMENT ON COLUMN "orders"."price" IS 'Price in whole US cents. $1.14 is 114.';
