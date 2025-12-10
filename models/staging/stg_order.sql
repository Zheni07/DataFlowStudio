SELECT
    Id AS id,
    CustomerId AS customer_id,
    EmployeeId AS employee_id,
    OrderDate AS order_date,
    RequiredDate AS required_date,
    ShippedDate AS shipped_date,
    ShipVia AS ship_via,
    Freight AS freight,
    ShipName AS ship_name,
    ShipAddress AS ship_address,
    ShipCity AS ship_city,
    ShipRegion AS ship_region,
    ShipPostalCode AS ship_postal_code,
    ShipCountry AS ship_country
FROM
    "Order"
WHERE
    OrderDate >= '2012-01-01'