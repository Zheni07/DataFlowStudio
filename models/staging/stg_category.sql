-- Auto-generated dbt staging model for table: Category
SELECT
  CAST("Id" AS NUMERIC) AS "id",
  "CategoryName" AS "category_name",
  "Description" AS "description"
FROM "Category"
GROUP BY 1, 2, 3;