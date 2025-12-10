SELECT
  Id              AS product_id,
  ProductName     AS product_name,
  UnitPrice       AS unit_price,
  UnitsInStock    AS stock
FROM Product
WHERE UnitsInStock > 0 AND Discontinued = 0;
