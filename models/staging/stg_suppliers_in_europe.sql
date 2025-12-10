SELECT
  Id              AS supplier_id,
  CompanyName     AS company_name,
  Country         AS country,
  Phone           AS phone
FROM Supplier
WHERE Country IN ('UK', 'Germany', 'France', 'Italy');
