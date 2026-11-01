-- Custom SQL migration (drizzle-kit generate --custom), D8 approved 2026-10-31.
-- S04, approved 2026-10-25: integer identity -> unpadded uppercase base36.
-- Drizzle Kit 0.31.11 does not manage functions, so this migration runs before
-- the generated baseline, whose inventory_items."inventoryId" column uses it.
CREATE FUNCTION public.inventory_id_base36(value integer) RETURNS text
LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE
AS $function$
DECLARE
  remaining integer := value;
  encoded text := '';
BEGIN
  IF remaining <= 0 THEN
    RAISE EXCEPTION 'Inventory identity must be positive' USING ERRCODE = '22023';
  END IF;
  LOOP
    encoded := pg_catalog.substr('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', (remaining % 36) + 1, 1) || encoded;
    remaining := remaining / 36;
    EXIT WHEN remaining = 0;
  END LOOP;
  RETURN encoded;
END;
$function$;
