-- Auto-generated dbt staging model for table: stg_supplier
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "company_name" AS "company_name",
  "contact_name" AS "contact_name",
  "contact_title" AS "contact_title",
  "address" AS "address",
  "city" AS "city",
  "region" AS "region",
  "postal_code" AS "postal_code",
  "country" AS "country",
  "phone" AS "phone",
  "fax" AS "fax",
  "home_page" AS "home_page"
FROM "stg_supplier"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12;