-- Auto-generated dbt staging model for table: stg_stg_order_detail
SELECT
  "id" AS "id",
  CAST("order_id" AS NUMERIC) AS "order_id",
  CAST("product_id" AS NUMERIC) AS "product_id",
  CAST("unit_price" AS NUMERIC) AS "unit_price",
  CAST("quantity" AS NUMERIC) AS "quantity",
  CAST("discount" AS NUMERIC) AS "discount"
FROM "stg_stg_order_detail"
GROUP BY 1, 2, 3, 4, 5, 6;