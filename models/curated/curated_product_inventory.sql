SELECT
    e.employee_id,
    e.last_name,
    e.first_name,
    e.job_title,
    e.city,
    e.country
FROM stg_employee e
ORDER BY e.last_name, e.first_name;