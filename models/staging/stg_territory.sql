-- Auto-generated dbt staging model for table: Territory
SELECT
  CAST("Id" AS NUMERIC) AS "id",
  "TerritoryDescription" AS "territory_description",
  CAST("RegionId" AS NUMERIC) AS "region_id"
FROM "Territory"
GROUP BY 1, 2, 3;