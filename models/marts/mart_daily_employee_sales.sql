WITH base AS (
  SELECT
    date(ceo.order_date) AS day,
    ceo.employee_id,
    ceo.first_name || ' ' || ceo.last_name AS employee_name,
    COUNT(DISTINCT ceo.order_id) AS orders_count,
    SUM(od.UnitPrice * od.Quantity * (1 - COALESCE(od.Discount, 0))) AS total_sales,
    SUM(od.Quantity) AS total_quantity
  FROM curated_employee_order ceo
  JOIN "OrderDetail" od
    ON od.OrderId = ceo.order_id
  GROUP BY day, ceo.employee_id, employee_name
)
SELECT
  day,
  employee_id,
  employee_name,
  orders_count,
  total_quantity,
  total_sales
FROM base
ORDER BY day DESC, total_sales DESC;