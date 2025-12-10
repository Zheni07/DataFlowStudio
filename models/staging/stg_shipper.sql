-- Auto-generated dbt staging model for table: Shipper
SELECT
  CAST("Id" AS NUMERIC) AS "id",
  "CompanyName" AS "company_name",
  "Phone" AS "phone"
FROM "Shipper"
GROUP BY 1, 2, 3;