-- Auto-generated dbt staging model for table: stg_customer
SELECT
  "id" AS "id",
  "company_name" AS "company_name",
  "contact_name" AS "contact_name",
  "contact_title" AS "contact_title",
  "address" AS "address",
  "city" AS "city",
  "region" AS "region",
  "postal_code" AS "postal_code",
  "country" AS "country",
  "phone" AS "phone",
  "fax" AS "fax"
FROM "stg_customer"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11;