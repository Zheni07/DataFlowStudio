-- Auto-generated dbt staging model for table: stg_stg_region
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "region_description" AS "region_description"
FROM "stg_stg_region"
GROUP BY 1, 2;