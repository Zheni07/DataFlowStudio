WITH base AS (
  SELECT
    date(COALESCE(order_date, last_order_date)) AS day,
    customer_id,
    product_id,
    SUM(COALESCE(total_amount, 0)) AS total_amount,
    SUM(COALESCE(quantity, 0)) AS total_quantity
  FROM curated_total_sales_by_customer
  GROUP BY day, customer_id, product_id
)
SELECT
  day,
  customer_id,
  product_id,
  total_amount,
  total_quantity
FROM base
ORDER BY day DESC, total_amount DESC;