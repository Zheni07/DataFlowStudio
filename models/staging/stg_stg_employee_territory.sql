-- Auto-generated dbt staging model for table: stg_employee_territory
SELECT
  "id" AS "id",
  CAST("employee_id" AS NUMERIC) AS "employee_id",
  CAST("territory_id" AS NUMERIC) AS "territory_id"
FROM "stg_employee_territory"
GROUP BY 1, 2, 3;