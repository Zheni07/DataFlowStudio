SELECT
  Id                  AS order_id,
  CustomerId          AS customer_id,
  OrderDate           AS order_date,
  ShipCountry         AS ship_country
FROM "Order"
WHERE date(OrderDate) >= '2012-01-01';
