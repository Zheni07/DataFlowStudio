const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./northwind_small.sqlite');

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
  if (err) {
    console.error('ERROR:', err.message);
  } else {
    console.log('Available tables:');
    rows.forEach(r => console.log('  ' + r.name));
  }
  db.close();
});
