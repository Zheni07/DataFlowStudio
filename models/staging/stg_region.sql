-- Auto-generated dbt staging model for table: Region
SELECT
  CAST("Id" AS NUMERIC) AS "id",
  "RegionDescription" AS "region_description"
FROM "Region"
GROUP BY 1, 2;