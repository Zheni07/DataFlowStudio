-- Auto-generated dbt staging model for table: Customer
SELECT
  "Id" AS "id",
  "CompanyName" AS "company_name",
  "ContactName" AS "contact_name",
  "ContactTitle" AS "contact_title",
  "Address" AS "address",
  "City" AS "city",
  "Region" AS "region",
  "PostalCode" AS "postal_code",
  "Country" AS "country",
  "Phone" AS "phone",
  "Fax" AS "fax"
FROM "Customer"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11;