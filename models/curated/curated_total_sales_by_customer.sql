SELECT
  o.CustomerId AS customer_id,
  COUNT(DISTINCT od.OrderId) AS orders_count,
  SUM(od.UnitPrice * od.Quantity * (1 - COALESCE(od.Discount, 0))) AS total_sales
FROM "Order" o
JOIN "OrderDetail" od
  ON o.Id = od.OrderId
GROUP BY o.CustomerId
ORDER BY total_sales DESC;