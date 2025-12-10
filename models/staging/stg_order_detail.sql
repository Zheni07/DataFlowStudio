-- Auto-generated dbt staging model for table: OrderDetail
SELECT
  "Id" AS "id",
  CAST("OrderId" AS NUMERIC) AS "order_id",
  CAST("ProductId" AS NUMERIC) AS "product_id",
  CAST("UnitPrice" AS NUMERIC) AS "unit_price",
  CAST("Quantity" AS NUMERIC) AS "quantity",
  CAST("Discount" AS NUMERIC) AS "discount"
FROM "OrderDetail"
GROUP BY 1, 2, 3, 4, 5, 6;