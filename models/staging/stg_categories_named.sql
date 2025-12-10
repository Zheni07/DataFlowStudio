SELECT
  Id              AS category_id,
  CategoryName    AS category_name
FROM Category
WHERE CategoryName IS NOT NULL;
