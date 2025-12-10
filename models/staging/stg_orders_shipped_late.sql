SELECT
  Id              AS order_id,
  RequiredDate    AS required_date,
  ShippedDate     AS shipped_date,
  julianday(ShippedDate) - julianday(RequiredDate) AS days_late
FROM "Order"
WHERE ShippedDate > RequiredDate;
