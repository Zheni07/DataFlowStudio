const http = require('http');

// Simple test to verify charts file exists and is readable
const fs = require('fs');
const path = require('path');

const chartsPath = path.join(__dirname, '../models/curated/metadata/curated_employee_order_charts.html');

console.log('Checking if charts file exists...');
console.log('Path:', chartsPath);

if (fs.existsSync(chartsPath)) {
  const stats = fs.statSync(chartsPath);
  const content = fs.readFileSync(chartsPath, 'utf8');
  console.log('✅ Charts file found!');
  console.log('Size:', stats.size, 'bytes');
  console.log('First 300 characters:');
  console.log(content.substring(0, 300));
} else {
  console.log('❌ Charts file not found');
}
