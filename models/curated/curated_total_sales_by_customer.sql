SELECT
  o.customer_id,
  COUNT(DISTINCT od.order_id) AS orders_count,
  SUM(od.unit_price * od.quantity * (1 - COALESCE(od.discount, 0))) AS total_sales
FROM stg_order o
JOIN stg_order_detail od
  ON o.id = od.order_id
GROUP BY o.customer_id
ORDER BY total_sales DESC;