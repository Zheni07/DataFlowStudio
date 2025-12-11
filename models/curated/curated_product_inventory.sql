SELECT
    p.id AS product_id,
    p.product_name,
    p.unit_price,
    p.units_in_stock,
    p.units_on_order,
    p.reorder_level,
    p.discontinued,
    c.category_id,
    c.category_name
FROM stg_product p
LEFT JOIN stg_category c
  ON p.category_id = c.id
WHERE p.discontinued = 0
ORDER BY p.units_in_stock DESC;