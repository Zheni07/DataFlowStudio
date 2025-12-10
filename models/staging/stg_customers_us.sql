SELECT
  Id              AS customer_id,
  CompanyName     AS company_name,
  ContactName     AS contact_name,
  Phone           AS phone,
  City            AS city
FROM Customer
WHERE Country = 'USA';
