-- Auto-generated dbt staging model for table: stg_product
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "product_name" AS "product_name",
  CAST("supplier_id" AS NUMERIC) AS "supplier_id",
  CAST("category_id" AS NUMERIC) AS "category_id",
  "quantity_per_unit" AS "quantity_per_unit",
  CAST("unit_price" AS NUMERIC) AS "unit_price",
  CAST("units_in_stock" AS NUMERIC) AS "units_in_stock",
  CAST("units_on_order" AS NUMERIC) AS "units_on_order",
  CAST("reorder_level" AS NUMERIC) AS "reorder_level",
  CAST("discontinued" AS NUMERIC) AS "discontinued"
FROM "stg_product"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10;