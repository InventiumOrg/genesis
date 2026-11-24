-- Coordinates, so a pin can sit on the door rather than the district.
--
-- Nullable on purpose, and left null everywhere by this migration. A warehouse
-- that has not been surveyed has no coordinates, and inventing a pair from its
-- street address would put a figure on the map that nobody recorded. Until
-- someone fills these in, the map falls back to the ward or district centre and
-- says on the pin that it has done so.
--
-- `double precision` rather than `numeric`: these are measurements read off a
-- map, not money, and six decimal places of latitude is already about 10 cm.
--
-- To undo: ALTER TABLE ... DROP COLUMN latitude, DROP COLUMN longitude.

ALTER TABLE "warehouses" ADD COLUMN "latitude" double precision;
--> statement-breakpoint
ALTER TABLE "warehouses" ADD COLUMN "longitude" double precision;
--> statement-breakpoint
ALTER TABLE "points_of_sale" ADD COLUMN "latitude" double precision;
--> statement-breakpoint
ALTER TABLE "points_of_sale" ADD COLUMN "longitude" double precision;
--> statement-breakpoint
COMMENT ON COLUMN "warehouses"."latitude" IS 'Decimal degrees, WGS 84. Null when nobody has recorded it.';
--> statement-breakpoint
COMMENT ON COLUMN "warehouses"."longitude" IS 'Decimal degrees, WGS 84. Null when nobody has recorded it.';
--> statement-breakpoint
COMMENT ON COLUMN "points_of_sale"."latitude" IS 'Decimal degrees, WGS 84. Null when nobody has recorded it.';
--> statement-breakpoint
COMMENT ON COLUMN "points_of_sale"."longitude" IS 'Decimal degrees, WGS 84. Null when nobody has recorded it.';
