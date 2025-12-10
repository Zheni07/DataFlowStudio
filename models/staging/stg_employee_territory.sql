-- Auto-generated dbt staging model for table: EmployeeTerritory
SELECT
  "Id" AS "id",
  CAST("EmployeeId" AS NUMERIC) AS "employee_id",
  CAST("TerritoryId" AS NUMERIC) AS "territory_id"
FROM "EmployeeTerritory"
GROUP BY 1, 2, 3;