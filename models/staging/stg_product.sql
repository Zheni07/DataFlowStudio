-- Auto-generated dbt staging model for table: Product
SELECT
  CAST("Id" AS NUMERIC) AS "id",
  "ProductName" AS "product_name",
  CAST("SupplierId" AS NUMERIC) AS "supplier_id",
  CAST("CategoryId" AS NUMERIC) AS "category_id",
  "QuantityPerUnit" AS "quantity_per_unit",
  CAST("UnitPrice" AS NUMERIC) AS "unit_price",
  CAST("UnitsInStock" AS NUMERIC) AS "units_in_stock",
  CAST("UnitsOnOrder" AS NUMERIC) AS "units_on_order",
  CAST("ReorderLevel" AS NUMERIC) AS "reorder_level",
  CAST("Discontinued" AS NUMERIC) AS "discontinued"
FROM "Product"
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10;