SELECT
  Id AS employee_id,
  LastName AS last_name,
  FirstName AS first_name,
  Title AS job_title,
  City,
  Country
FROM Employee
WHERE Photo IS  NULL
