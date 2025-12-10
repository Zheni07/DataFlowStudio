-- Auto-generated dbt staging model for table: stg_order
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "customer_id" AS "customer_id",
  CAST("employee_id" AS NUMERIC) AS "employee_id",
  CAST("order_date" AS NUMERIC) AS "order_date",
  CAST("required_date" AS NUMERIC) AS "required_date",
  CAST("shipped_date" AS NUMERIC) AS "shipped_date",
  CAST("ship_via" AS NUMERIC) AS "ship_via",
  CAST("freight" AS NUMERIC) AS "freight",
  "ship_name" AS "ship_name",
  "ship_address" AS "ship_address",
  "ship_city" AS "ship_city",
  "ship_region" AS "ship_region",
  "ship_postal_code" AS "ship_postal_code",
  "ship_country" AS "ship_country"
FROM "stg_order"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14;