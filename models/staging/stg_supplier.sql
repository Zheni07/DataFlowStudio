-- Auto-generated dbt staging model for table: Supplier
SELECT
  CAST("Id" AS NUMERIC) AS "id",
  "CompanyName" AS "company_name",
  "ContactName" AS "contact_name",
  "ContactTitle" AS "contact_title",
  "Address" AS "address",
  "City" AS "city",
  "Region" AS "region",
  "PostalCode" AS "postal_code",
  "Country" AS "country",
  "Phone" AS "phone",
  "Fax" AS "fax",
  "HomePage" AS "home_page"
FROM "Supplier"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12;