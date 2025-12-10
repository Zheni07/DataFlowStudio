const http = require('http');

const sql = `SELECT
    e.employee_id,
    e.last_name,
    e.first_name,
    e.job_title,
    e.city,
    e.country
FROM stg_employee e
ORDER BY e.last_name, e.first_name;`;

const payload = JSON.stringify({
  name: 'curated_product_inventory',
  sql: sql,
  documentation: [
    { name: 'employee_id', type: 'number', description: 'Employee ID' },
    { name: 'last_name', type: 'string', description: 'Last Name' },
    { name: 'first_name', type: 'string', description: 'First Name' },
    { name: 'job_title', type: 'string', description: 'Job Title' },
    { name: 'city', type: 'string', description: 'City' },
    { name: 'country', type: 'string', description: 'Country' }
  ],
  tableDescription: 'Employee directory'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/curated-models',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(payload);
req.end();
