SELECT
  Id              AS order_detail_id,
  OrderId         AS order_id,
  ProductId       AS product_id,
  Discount        AS discount
FROM OrderDetail
WHERE Discount >= 0.2;
