-- Auto-generated dbt staging model for table: stg_category
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "category_name" AS "category_name",
  "description" AS "description"
FROM "stg_category"
GROUP BY 1, 2, 3;