-- Auto-generated dbt staging model for table: stg_stg_stg_shipper
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "company_name" AS "company_name",
  "phone" AS "phone"
FROM "stg_stg_stg_shipper"
GROUP BY 1, 2, 3;