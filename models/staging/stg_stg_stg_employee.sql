-- Auto-generated dbt staging model for table: stg_stg_employee
SELECT
  CAST("id" AS NUMERIC) AS "id",
  "last_name" AS "last_name",
  "first_name" AS "first_name",
  "title" AS "title",
  "title_of_courtesy" AS "title_of_courtesy",
  CAST("birth_date" AS NUMERIC) AS "birth_date",
  CAST("hire_date" AS NUMERIC) AS "hire_date",
  "address" AS "address",
  "city" AS "city",
  "region" AS "region",
  "postal_code" AS "postal_code",
  "country" AS "country",
  "home_phone" AS "home_phone",
  CAST("extension" AS NUMERIC) AS "extension",
  "notes" AS "notes",
  CAST("reports_to" AS NUMERIC) AS "reports_to",
  "photo_path" AS "photo_path"
FROM "stg_stg_employee"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17;