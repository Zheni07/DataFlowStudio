// Standalone script to regenerate charts for existing curated models
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { generateCharts, generateHTMLReport, saveCharts } = require('./chartGenerator');

const DB_PATH = path.join(__dirname, '../northwind_small.sqlite');
const FULL_CHART_ROWS = process.env.FULL_CHART_ROWS ? Number(process.env.FULL_CHART_ROWS) : 10000;

const CURATED_DIR = path.join(__dirname, '../models/curated');
const CURATED_META_DIR = path.join(CURATED_DIR, 'metadata');

// Make sure directory exists
if (!fs.existsSync(CURATED_META_DIR)) {
  fs.mkdirSync(CURATED_META_DIR, { recursive: true });
}

// Get all JSON metadata files
const files = fs.readdirSync(CURATED_META_DIR).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} curated models`);

(async () => {
  for (const file of files) {
    const modelName = file.replace(/\.json$/, '');
    const metaPath = path.join(CURATED_META_DIR, file);

    try {
      console.log(`\nProcessing: ${modelName}`);
      const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const doc = metaData.documentation || [];
      const sql = metaData.sql || '';

      if (!sql) {
        console.log(`  - Skipping ${modelName}: no SQL found in metadata`);
        continue;
      }

      // Fetch full rows up to cap for chart generation
      const db = new sqlite3.Database(DB_PATH);
      try {
        let fullSQL = sql.trim();
        if (!/limit\s+\d+/i.test(fullSQL)) {
          fullSQL = fullSQL.replace(/;*\s*$/, '') + ` LIMIT ${FULL_CHART_ROWS}`;
        }

        const rows = await new Promise((resolve, reject) => {
          db.all(fullSQL, (err, r) => err ? reject(err) : resolve(r));
        }).catch(err => {
          console.error(`  - Query error for ${modelName}: ${err.message}`);
          return [];
        });

        if (rows.length > 0 && doc.length > 0) {
          console.log(`  - Rows fetched: ${rows.length}`);
          console.log(`  - Columns: ${doc.length}`);

          const charts = generateCharts(modelName, rows, doc);
          if (charts && charts.length > 0) {
            console.log(`  - Generated ${charts.length} chart(s)`);

            const chartsHtml = generateHTMLReport(modelName, rows, doc, charts);
            if (chartsHtml) {
              const chartsPath = saveCharts(modelName, chartsHtml, CURATED_META_DIR);

              // Update metadata
              metaData.chartsPath = path.basename(chartsPath);
              fs.writeFileSync(metaPath, JSON.stringify(metaData, null, 2));

              console.log(`  ✅ Charts saved: ${metaData.chartsPath}`);
            }
          } else {
            console.log(`  - No charts generated for this data`);
          }
        } else {
          console.log(`  - Not enough data (rows: ${rows.length}, cols: ${doc.length})`);
        }
      } finally {
        try { db.close(); } catch (e) {}
      }
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }

  console.log('\n✅ Done!');
})();
