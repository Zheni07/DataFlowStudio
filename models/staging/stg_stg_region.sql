-- Auto-generated dbt staging model for table: stg_region
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "region_description" AS "region_description"
FROM "stg_region"
GROUP BY 1, 2;