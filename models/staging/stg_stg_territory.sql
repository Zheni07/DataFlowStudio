-- Auto-generated dbt staging model for table: stg_territory
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "territory_description" AS "territory_description",
  CAST("region_id" AS NUMERIC) AS "region_id"
FROM "stg_territory"
GROUP BY 1, 2, 3;