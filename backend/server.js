const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');

const app = express();
const PORT = 4000;
// This backend serves data only from the Northwind sample database.
const DB_PATH = path.join(__dirname, '../northwind_small.sqlite');
const FULL_CHART_ROWS = process.env.FULL_CHART_ROWS ? Number(process.env.FULL_CHART_ROWS) : 10000;
const METADATA_DIR = path.join(__dirname, '../models/staging/metadata');
const CURATED_DIR = path.join(__dirname, '../models/curated');
const CURATED_META_DIR = path.join(CURATED_DIR, 'metadata');
const MARTS_DIR = path.join(__dirname, '../models/marts');
const MARTS_META_DIR = path.join(MARTS_DIR, 'metadata');
const PERF_DIR = path.join(__dirname, '../models/curated/metadata/performance');
fs.mkdirSync(METADATA_DIR, { recursive: true });
fs.mkdirSync(CURATED_META_DIR, { recursive: true });
fs.mkdirSync(MARTS_META_DIR, { recursive: true });
fs.mkdirSync(PERF_DIR, { recursive: true });

// Persistent database connection for better performance
const db = new sqlite3.Database(DB_PATH);
// Enable WAL mode for better concurrent access
db.run('PRAGMA journal_mode = WAL');
// Enable query optimization
db.run('PRAGMA synchronous = NORMAL');
db.run('PRAGMA cache_size = 10000');

app.use(cors());
app.use(express.json());
app.use('/performance-reports', express.static(PERF_DIR));

// Close database on shutdown
process.on('SIGINT', () => {
  db.close(() => {
    process.exit(0);
  });
});

// In-memory caching for frequently accessed data
const dataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(type, name) {
  return `${type}:${name}`;
}

function getCachedData(type, name) {
  const key = getCacheKey(type, name);
  const cached = dataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  dataCache.delete(key);
  return null;
}

function setCachedData(type, name, data) {
  const key = getCacheKey(type, name);
  dataCache.set(key, { data, timestamp: Date.now() });
  // Clean up cache if it grows too large
  if (dataCache.size > 100) {
    const oldestKey = Array.from(dataCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    dataCache.delete(oldestKey);
  }
}

function invalidateCache(type, name) {
  const key = getCacheKey(type, name);
  dataCache.delete(key);
}

// In-memory performance job store for streaming
const perfJobs = new Map();

function ensureLimit(sql, limit) {
  if (!sql) return '';
  let trimmed = sql.trim();
  if (!/limit\s+\d+/i.test(trimmed)) {
    trimmed = trimmed.replace(/;*\s*$/, '') + ` LIMIT ${limit}`;
  }
  return trimmed;
}

function broadcastSample(job, payload) {
  job.esClients.forEach(res => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
}

function closeClients(job) {
  job.esClients.forEach(res => res.end());
  job.esClients.clear();
}

function savePerfArtifacts(job, finalSample) {
  try {
    const outJsonPath = path.join(PERF_DIR, `${job.runId}.json`);
    // Attach paths later as well to ensure metadata includes report link
    const baseMeta = { ...job.meta };

    // Build a simple HTML report with Chart.js
    const labels = job.samples.map((_, i) => i + 1);
    const elapsedSeries = job.samples.map(s => s.elapsedMs);
    const cpuUserSeries = job.samples.map(s => s.cpuUserMs);
    const cpuSysSeries = job.samples.map(s => s.cpuSystemMs);
    const rssSeries = job.samples.map(s => s.rssMb);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Report - ${job.runId}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; padding: 32px; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.35); margin-bottom: 20px; }
    h1 { margin: 0 0 10px 0; color: #cbd5e1; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
    .label { color: #94a3b8; font-size: 13px; }
    .value { color: #e2e8f0; font-size: 20px; font-weight: 700; }
    canvas { background: #0b1224; border-radius: 10px; padding: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Performance Run - ${job.meta.curatedName || 'manual'}</h1>
    <div class="label">${new Date().toLocaleString()}</div>
    <div class="grid" style="margin-top:12px;">
      <div><div class="label">Mode</div><div class="value">${job.meta.mode}</div></div>
      <div><div class="label">Elapsed (ms)</div><div class="value">${finalSample.elapsedMs.toFixed(2)}</div></div>
      <div><div class="label">CPU User (ms)</div><div class="value">${finalSample.cpuUserMs.toFixed(2)}</div></div>
      <div><div class="label">CPU System (ms)</div><div class="value">${finalSample.cpuSystemMs.toFixed(2)}</div></div>
      <div><div class="label">Rows Processed</div><div class="value">${finalSample.rowsProcessed}</div></div>
      <div><div class="label">Row Limit</div><div class="value">${job.meta.rowLimit}</div></div>
    </div>
  </div>
  <div class="card">
    <h2 style="margin-top:0;color:#cbd5e1;">Time / CPU Over Time</h2>
    <canvas id="chart-time" height="220"></canvas>
    <canvas id="chart-cpu" height="220" style="margin-top:16px;"></canvas>
    <canvas id="chart-rss" height="180" style="margin-top:16px;"></canvas>
  </div>
  <script>
    const labels = ${JSON.stringify(labels)};
    const elapsed = ${JSON.stringify(elapsedSeries)};
    const cpuUser = ${JSON.stringify(cpuUserSeries)};
    const cpuSys = ${JSON.stringify(cpuSysSeries)};
    const rss = ${JSON.stringify(rssSeries)};
    const palette = ['#60a5fa','#a78bfa','#34d399'];
    new Chart(document.getElementById('chart-time'), {
      type: 'line',
      data: { labels, datasets: [{ label: 'Elapsed ms', data: elapsed, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.15)', fill: true, tension: 0.15, pointRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins:{ legend:{display:true}}, scales:{ x:{ticks:{color:'#94a3b8'}}, y:{ticks:{color:'#94a3b8'}}}}
    });
    new Chart(document.getElementById('chart-cpu'), {
      type: 'line',
      data: { labels, datasets: [
        { label: 'CPU User ms', data: cpuUser, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.15)', fill: true, tension: 0.15, pointRadius: 0 },
        { label: 'CPU Sys ms', data: cpuSys, borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.15)', fill: true, tension: 0.15, pointRadius: 0 }
      ]},
      options: { responsive: true, maintainAspectRatio: false, plugins:{ legend:{display:true}}, scales:{ x:{ticks:{color:'#94a3b8'}}, y:{ticks:{color:'#94a3b8'}}}}
    });
    new Chart(document.getElementById('chart-rss'), {
      type: 'bar',
      data: { labels, datasets: [{ label: 'RSS MB', data: rss, backgroundColor: '#fbbf24' }]},
      options: { responsive: true, maintainAspectRatio: false, plugins:{ legend:{display:true}}, scales:{ x:{ticks:{color:'#94a3b8'}}, y:{ticks:{color:'#94a3b8'}}}}
    });
  </script>
</body>
</html>`;

    const outHtmlPath = path.join(PERF_DIR, `${job.runId}.html`);
    fs.writeFileSync(outHtmlPath, html);
    const enrichedMeta = { ...baseMeta, reportPath: path.basename(outHtmlPath), jsonPath: path.basename(outJsonPath) };
    fs.writeFileSync(outJsonPath, JSON.stringify({ ...enrichedMeta, final: finalSample, samples: job.samples }, null, 2));
    return { jsonPath: outJsonPath, htmlPath: outHtmlPath, meta: enrichedMeta };
  } catch (err) {
    console.error('Failed to save perf artifacts:', err.message);
    return {};
  }
}

async function runPerfJob({ runId, mode, sql, curatedName, rowLimit = FULL_CHART_ROWS }) {
  const job = {
    runId,
    mode,
    meta: {
      runId,
      mode,
      curatedName: curatedName || null,
      rowLimit,
      sql,
      startedAt: new Date().toISOString()
    },
    status: 'running',
    samples: [],
    esClients: new Set(),
    cancelRequested: false
  };

  perfJobs.set(runId, job);

  const startCpu = process.cpuUsage();
  const startTime = process.hrtime.bigint();
  let rowsProcessed = 0;

  const pushSample = (status = 'running') => {
    const elapsedNs = process.hrtime.bigint() - startTime;
    const elapsedMs = Number(elapsedNs) / 1e6;
    const cpu = process.cpuUsage(startCpu);
    const cpuUserMs = cpu.user / 1000;
    const cpuSystemMs = cpu.system / 1000;
    const rssMb = Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100;
    const sample = { elapsedMs, cpuUserMs, cpuSystemMs, rssMb, rowsProcessed, status, ts: Date.now() };
    job.samples.push(sample);
    broadcastSample(job, sample);
    return sample;
  };

  const sampler = setInterval(() => {
    if (job.status !== 'running') return;
    pushSample('running');
  }, 400);

  try {
    const finalSql = ensureLimit(sql, rowLimit);
    await new Promise((resolve, reject) => {
      db.all(finalSql, (err, rows) => {
        if (err) return reject(err);
        rowsProcessed = rows.length;
        resolve();
      });
    });
    if (job.cancelRequested) throw new Error('Cancelled');
    job.status = 'done';
    const finalSample = pushSample('done');
    job.meta.finishedAt = new Date().toISOString();
    job.meta.rowsProcessed = rowsProcessed;
    const artifacts = savePerfArtifacts(job, finalSample);
    if (artifacts.meta) {
      job.meta = { ...job.meta, ...artifacts.meta };
    } else {
      job.meta.reportPath = artifacts.htmlPath ? path.basename(artifacts.htmlPath) : null;
      job.meta.jsonPath = artifacts.jsonPath ? path.basename(artifacts.jsonPath) : null;
    }
    broadcastSample(job, { ...finalSample, status: 'done', reportPath: job.meta.reportPath });
    closeClients(job);
  } catch (err) {
    job.status = job.cancelRequested ? 'cancelled' : 'error';
    const finalSample = pushSample(job.status);
    job.meta.error = err.message;
    broadcastSample(job, { ...finalSample, status: job.status, error: err.message });
    closeClients(job);
  } finally {
    clearInterval(sampler);
  }
  return job;
}

function toSnakeCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/__+/g, '_')
    .toLowerCase();
}

function detectType(values) {
  // Try to detect if all values are numbers or dates
  if (values.every(v => v === null || v === '' || !isNaN(Number(v)))) return 'number';
  if (values.every(v => v === null || v === '' || !isNaN(Date.parse(v)))) return 'date';
  return 'string';
}

// List all tables in the SQLite database
app.get('/tables', (req, res) => {
  db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows.map(row => row.name));
  });
});

// Get all data from a specific table with pagination and caching
app.get('/table/:name', (req, res) => {
  const tableName = req.params.name;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(500, parseInt(req.query.limit) || 100); // Max 500 per page
  const offset = (page - 1) * limit;

  // Check cache for full table info
  const cacheKey = `table:${tableName}:count`;
  let countResult = getCachedData('table', `${tableName}:count`);
  
  Promise.all([
    new Promise((resolve, reject) => {
      if (countResult !== null) {
        resolve(countResult);
      } else {
        db.get(`SELECT COUNT(*) as count FROM "${tableName}"`, (err, row) => {
          if (err) reject(err);
          else {
            setCachedData('table', `${tableName}:count`, row.count);
            resolve(row.count);
          }
        });
      }
    }),
    new Promise((resolve, reject) => {
      db.all(`SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    })
  ]).then(([total, rows]) => {
    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + limit < total
      }
    });
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });
});

// Save generated staging model SQL
app.post('/generate-staging-model', (req, res) => {
  const { table, sql } = req.body;
  if (!table || !sql) return res.status(400).json({ error: 'Missing table or sql' });
  const filePath = path.join(__dirname, '../models/staging', `stg_${table}.sql`);
  fs.writeFile(filePath, sql, err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, file: filePath });
  });
});

app.post('/generate-user-model', (req, res) => {
  const { name, sql } = req.body;
  if (!name || !sql) return res.status(400).json({ error: 'Missing name or sql' });
  const filePath = path.join(__dirname, '../models/marts', `${name}.sql`);
  fs.mkdir(path.join(__dirname, '../models/marts'), { recursive: true }, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    fs.writeFile(filePath, sql, err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, file: filePath });
    });
  });
});

// Preview custom staging SQL (returns up to 100 rows)
app.post('/preview-staging-sql', (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'Missing SQL' });
  let previewSQL = sql.trim();
  // Add LIMIT 100 if not present
  if (!/limit\s+\d+/i.test(previewSQL)) {
    previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
  }
  db.all(previewSQL, (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ rows });
  });
});

// Auto-documentation preview endpoint
app.post('/api/preview', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'Missing SQL' });
  let previewSQL = sql.trim();
  if (!/limit\s+\d+/i.test(previewSQL)) {
    previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
  }
  try {
    const preview = await new Promise((resolve, reject) => {
      db.all(previewSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    let columns = [];
    if (preview.length > 0) {
      const keys = Object.keys(preview[0]);
      columns = keys.map(col => {
        const values = preview.map(row => row[col]);
        const nonNullValues = values.filter(v => v !== null && v !== '');
        const type = detectType(nonNullValues);
        const nullable = values.some(v => v === null || v === '');
        const unique = new Set(nonNullValues).size === nonNullValues.length && nonNullValues.length === preview.length;
        return {
          name: col,
          type,
          nullable,
          unique,
        };
      });
    }
    res.json({ columns, preview });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// List all saved stagings
app.get('/stagings', (req, res) => {
  fs.readdir(METADATA_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
    res.json({ stagings: names });
  });
});

// Get a specific staging (SQL, doc, preview) - with caching
app.get('/staging/:name', (req, res) => {
  const stagingName = req.params.name;
  
  // Check cache first
  const cached = getCachedData('staging', stagingName);
  if (cached) {
    return res.json(cached);
  }

  const metaPath = path.join(METADATA_DIR, `${stagingName}.json`);
  fs.readFile(metaPath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Staging not found' });
    const staging = JSON.parse(data);
    // Cache for 5 minutes
    setCachedData('staging', stagingName, staging);
    res.json(staging);
  });
});

// Delete a saved staging (metadata, SQL file, and drop table)
app.delete('/staging/:name', (req, res) => {
  const name = req.params.name;
  const metaPath = path.join(METADATA_DIR, `${name}.json`);
  const sqlPath = path.join(__dirname, '../models/staging', `${name}.sql`);
  let errors = [];
  // Delete metadata JSON
  try { fs.unlinkSync(metaPath); } catch (e) { errors.push(e.message); }
  // Delete SQL file
  try { fs.unlinkSync(sqlPath); } catch (e) { errors.push(e.message); }
  // Drop table from SQLite database
  const db = new sqlite3.Database(DB_PATH);
  db.run(`DROP TABLE IF EXISTS "${name}"`, (err) => {
    db.close();
    if (err) errors.push(err.message);
    if (errors.length > 0) {
      return res.status(500).json({ error: 'Failed to delete some files or table', details: errors });
    }
    res.json({ success: true });
  });
});

// Utility to generate dbt-compatible YAML schema
function generateDbtYaml({ name, description, columns }) {
  return [
    'version: 2',
    '',
    'models:',
    `  - name: ${name}`,
    `    description: "${description || ''}"`,
    '    columns:',
    ...columns.map(col => {
      const tests = [];
      if (!col.nullable) tests.push('not_null');
      if (col.unique) tests.push('unique');
      return [
        `      - name: ${col.name}`,
        `        description: "${col.description || ''}"`,
        `        data_type: ${col.type}`,
        ...(tests.length ? ['        tests:'].concat(tests.map(t => `          - ${t}`)) : [])
      ].join('\n');
    })
  ].join('\n');
}

// Save custom staging SQL as dbt model and with metadata
app.post('/save-staging-sql', (req, res) => {
  const { name, sql, dialect = 'sqlite', createTable, documentation, tableDescription, yaml } = req.body;
  if (!name || !sql) return res.status(400).json({ error: 'Missing name or SQL' });
  const filePath = path.join(__dirname, '../models/staging', `${name}.sql`);
  fs.writeFile(filePath, sql, async err => {
    if (err) return res.status(500).json({ error: err.message });
    let preview = [];
    let doc = documentation || [];
    let tableCreated = false;
    let tableError = null;
    let yamlSchema = yaml;
    // Preview and doc generation if not provided
    let previewSQL = sql.trim();
    if (!/limit\s+\d+/i.test(previewSQL)) {
      previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
    }
    const db = new sqlite3.Database(DB_PATH);
    try {
      preview = await new Promise((resolve, reject) => {
        db.all(previewSQL, (err, rows) => err ? reject(err) : resolve(rows));
      });
      // Normalize documentation structure: ensure 'name' field exists (support both 'column' and 'name')
      if (doc && doc.length > 0) {
        doc = doc.map(col => {
          const normalized = {
            ...col,
            name: col.name || col.column || col.source || col.original || '',
            // Preserve all custom fields
            description: col.description || '',
            type: col.type || typeof preview[0]?.[col.name || col.column] || 'string',
            nullable: col.nullable !== undefined ? col.nullable : (preview.length > 0 ? preview.some(row => row[col.name || col.column] === null || row[col.name || col.column] === '') : false),
            unique: col.unique !== undefined ? col.unique : (preview.length > 0 ? new Set(preview.map(row => row[col.name || col.column])).size === preview.length : false),
            testNull: col.testNull || false,
            testUnique: col.testUnique || false
          };
          // Remove old field names to avoid confusion
          delete normalized.column;
          return normalized;
        });
      } else if (preview.length > 0) {
        // Generate new documentation if none provided
        const keys = Object.keys(preview[0]);
        doc = keys.map(col => ({
          name: col,
          type: typeof preview[0][col],
          description: '',
          nullable: preview.some(row => row[col] === null || row[col] === ''),
          unique: new Set(preview.map(row => row[col])).size === preview.length,
          testNull: false,
          testUnique: false
        }));
      }
    } catch (e) {
      preview = [];
      // Normalize documentation even if preview fails
      if (doc && doc.length > 0) {
        doc = doc.map(col => ({
          ...col,
          name: col.name || col.column || col.source || col.original || '',
          description: col.description || '',
          type: col.type || 'string',
          nullable: col.nullable !== undefined ? col.nullable : false,
          unique: col.unique !== undefined ? col.unique : false,
          testNull: col.testNull || false,
          testUnique: col.testUnique || false
        })).map(col => {
          delete col.column;
          return col;
        });
      } else {
        doc = [];
      }
    }
    // Optionally create table
    if (createTable) {
      try {
        await new Promise((resolve, reject) => {
          db.run(`DROP TABLE IF EXISTS "${name}"`, err => err ? reject(err) : resolve());
        });
        const selectSQL = sql.trim().replace(/;\s*$/, '');
        await new Promise((resolve, reject) => {
          db.run(`CREATE TABLE "${name}" AS ${selectSQL}`, err => err ? reject(err) : resolve());
        });
        tableCreated = true;
      } catch (e) {
        tableError = e.message;
      }
    }
    db.close();
    // Generate YAML if not provided
    if (!yamlSchema) {
      yamlSchema = generateDbtYaml({ name, description: tableDescription, columns: doc });
    }
    // Save metadata
    const meta = {
      name,
      sql,
      dialect,
      tableDescription: tableDescription || '',
      documentation: doc,
      yaml: yamlSchema,
      preview,
      timestamp: new Date().toISOString()
    };
    fs.writeFile(path.join(METADATA_DIR, `${name}.json`), JSON.stringify(meta, null, 2), err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, file: filePath, tableCreated, tableError, meta });
    });
  });
});

// Endpoint to drop all staged tables (names starting with 'stg_')
app.post('/drop-staged-tables', (req, res) => {
  const db = new sqlite3.Database(DB_PATH);
  db.all(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'stg_%'`, (err, rows) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: err.message });
    }
    const tables = rows.map(r => r.name);
    let dropped = 0;
    let errors = [];
    if (tables.length === 0) {
      db.close();
      return res.json({ success: true, dropped: 0 });
    }
    tables.forEach(table => {
      db.run(`DROP TABLE IF EXISTS "${table}"`, err => {
        if (err) errors.push({ table, error: err.message });
        dropped++;
        if (dropped === tables.length) {
          db.close();
          if (errors.length > 0) {
            res.status(500).json({ error: 'Some tables could not be dropped', details: errors });
          } else {
            res.json({ success: true, dropped });
          }
        }
      });
    });
  });
});

// Download entire staged table as CSV
app.get('/download-staged/:name', (req, res) => {
  const tableName = req.params.name;
  // Only allow staged tables
  if (!tableName.startsWith('stg_')) {
    return res.status(400).json({ error: 'Not a staged table' });
  }
  const db = new sqlite3.Database(DB_PATH);
  db.all(`SELECT * FROM "${tableName}"`, (err, rows) => {
    db.close();
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`);
      res.setHeader('Content-Type', 'text/csv');
      return res.send('');
    }
    const keys = Object.keys(rows[0]);
    const csvRows = [keys.join(',')];
    for (const row of rows) {
      csvRows.push(keys.map(k => {
        const val = row[k];
        if (val == null) return '';
        // Escape quotes
        return '"' + String(val).replace(/"/g, '""') + '"';
      }).join(','));
    }
    const csv = csvRows.join('\n');
    res.setHeader('Content-Disposition', `attachment; filename="${tableName}.csv"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  });
});

// List all curated models
app.get('/curated-models', (req, res) => {
  fs.readdir(CURATED_META_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
    res.json({ models: names });
  });
});

// Get a specific curated model (SQL, doc, preview) - with caching
app.get('/curated-model/:name', (req, res) => {
  const modelName = req.params.name;
  
  // Check cache first
  const cached = getCachedData('curated-model', modelName);
  if (cached) {
    return res.json(cached);
  }

  const metaPath = path.join(CURATED_META_DIR, `${modelName}.json`);
  fs.readFile(metaPath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Curated model not found' });
    const model = JSON.parse(data);
    // Cache for 5 minutes
    setCachedData('curated-model', modelName, model);
    res.json(model);
  });
});

// Save or update a curated model
app.post('/curated-models', async (req, res) => {
  const { name, sql, documentation, tableDescription, createTable = true } = req.body;
  if (!name || !sql) return res.status(400).json({ error: 'Missing name or SQL' });
  const filePath = path.join(CURATED_DIR, `${name}.sql`);
  fs.writeFileSync(filePath, sql);
  // Preview and doc generation if not provided
  let preview = [];
  let doc = documentation || [];
  let previewSQL = sql.trim();
  if (!/limit\s+\d+/i.test(previewSQL)) {
    previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
  }
  const db = new sqlite3.Database(DB_PATH);
  let tableCreated = false;
  let tableError = null;
  try {
    preview = await new Promise((resolve, reject) => {
      db.all(previewSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    // Normalize documentation structure: ensure 'name' field exists and preserve all fields
    if (doc && doc.length > 0) {
      doc = doc.map(col => {
        const normalized = {
          ...col,
          name: col.name || col.column || col.source || col.original || '',
          // Preserve all custom fields
          description: col.description || '',
          type: col.type || typeof preview[0]?.[col.name || col.column] || 'string',
          nullable: col.nullable !== undefined ? col.nullable : (preview.length > 0 ? preview.some(row => row[col.name || col.column] === null || row[col.name || col.column] === '') : false),
          unique: col.unique !== undefined ? col.unique : (preview.length > 0 ? new Set(preview.map(row => row[col.name || col.column])).size === preview.length : false),
          testNull: col.testNull || false,
          testUnique: col.testUnique || false
        };
        // Remove old field names to avoid confusion
        delete normalized.column;
        return normalized;
      });
    } else if (preview.length > 0) {
      // Generate new documentation if none provided
      const keys = Object.keys(preview[0]);
      doc = keys.map(col => {
        const values = preview.map(row => row[col]);
        const nonNullValues = values.filter(v => v !== null && v !== '');
        return {
          name: col,
          type: typeof preview[0][col],
          description: '',
          nullable: values.some(v => v === null || v === ''),
          unique: new Set(nonNullValues).size === nonNullValues.length && nonNullValues.length === preview.length,
          testNull: false,
          testUnique: false
        };
      });
    }
  } catch (e) {
    preview = [];
    // Normalize documentation even if preview fails
    if (doc && doc.length > 0) {
      doc = doc.map(col => ({
        ...col,
        name: col.name || col.column || col.source || col.original || '',
        description: col.description || '',
        type: col.type || 'string',
        nullable: col.nullable !== undefined ? col.nullable : false,
        unique: col.unique !== undefined ? col.unique : false,
        testNull: col.testNull || false,
        testUnique: col.testUnique || false
      })).map(col => {
        delete col.column;
        return col;
      });
    } else {
      doc = [];
    }
  }
  // Materialize curated table so marts layer can query it
  if (createTable) {
    try {
      await new Promise((resolve, reject) => {
        db.run(`DROP TABLE IF EXISTS "${name}"`, err => err ? reject(err) : resolve());
      });
      const selectSQL = sql.trim().replace(/;\s*$/, '');
      await new Promise((resolve, reject) => {
        db.run(`CREATE TABLE "${name}" AS ${selectSQL}`, err => err ? reject(err) : resolve());
      });
      tableCreated = true;
    } catch (e) {
      tableError = e.message;
    }
  }
  db.close();

  // Chart generation removed

  // Save metadata
  const meta = {
    name,
    sql,
    tableDescription: tableDescription || '',
    documentation: doc,
    preview,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(CURATED_META_DIR, `${name}.json`), JSON.stringify(meta, null, 2));
  // Invalidate cache for this model
  invalidateCache('curated-model', name);
  invalidateCache('table', `${name}:count`);
  res.json({ success: true, file: filePath, meta, tableCreated, tableError });
});

// Preview custom curated SQL (returns up to 100 rows and docs)
app.post('/api/curated-preview', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'Missing SQL' });
  let previewSQL = sql.trim();
  if (!/limit\s+\d+/i.test(previewSQL)) {
    previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
  }
  const db = new sqlite3.Database(DB_PATH);
  try {
    const preview = await new Promise((resolve, reject) => {
      db.all(previewSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    let columns = [];
    if (preview.length > 0) {
      const keys = Object.keys(preview[0]);
      columns = keys.map(col => {
        const values = preview.map(row => row[col]);
        const nonNullValues = values.filter(v => v !== null && v !== '');
        const type = detectType(nonNullValues);
        const nullable = values.some(v => v === null || v === '');
        const unique = new Set(nonNullValues).size === nonNullValues.length && nonNullValues.length === preview.length;
        return {
          name: col,
          type,
          nullable,
          unique,
        };
      });
    }
    db.close();
    res.json({ columns, preview });
  } catch (e) {
    db.close();
    res.status(400).json({ error: e.message });
  }
});



// Serve curated model metadata with charts path
app.get('/curated-model/:name', (req, res) => {
  const metaPath = path.join(CURATED_META_DIR, `${req.params.name}.json`);
  fs.readFile(metaPath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Curated model not found' });
    res.json(JSON.parse(data));
  });
});



// Fetch curated model data rows (for table view)
app.get('/curated-model/:name/data', async (req, res) => {
  const name = req.params.name;
  const metaPath = path.join(CURATED_META_DIR, `${name}.json`);
  const rawLimit = req.query.limit;
  const limit = rawLimit === 'all' ? null : Number(rawLimit || 1000);

  try {
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const sql = metaData.sql;
    if (!sql) {
      return res.status(400).json({ error: 'No SQL query found for this model' });
    }

    const db = new sqlite3.Database(DB_PATH);
    let finalSQL = sql.trim();
    if (limit && !/limit\s+\d+/i.test(finalSQL)) {
      finalSQL = finalSQL.replace(/;*\s*$/, '') + ` LIMIT ${limit}`;
    }
    const rows = await new Promise((resolve, reject) => {
      db.all(finalSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    db.close();
    res.json({ rows, limit });
  } catch (err) {
    console.error(`Error fetching curated model data: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Export curated model query results as CSV or JSON
app.get('/curated-model/:name/export', async (req, res) => {
  const name = req.params.name;
  const format = req.query.format || 'csv'; // csv or json
  const metaPath = path.join(CURATED_META_DIR, `${name}.json`);
  
  try {
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const sql = metaData.sql;
    
    if (!sql) {
      return res.status(400).json({ error: 'No SQL query found for this model' });
    }
    
    // Execute the full query (no limit for export)
    const db = new sqlite3.Database(DB_PATH);
    const rows = await new Promise((resolve, reject) => {
      db.all(sql.trim(), (err, rows) => err ? reject(err) : resolve(rows));
    });
    db.close();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No data found for this query' });
    }
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.json"`);
      res.json(rows);
    } else {
      // CSV format
      const keys = Object.keys(rows[0]);
      const csvRows = [keys.join(',')];
      
      for (const row of rows) {
        csvRows.push(keys.map(k => {
          const val = row[k];
          if (val == null) return '';
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const str = String(val);
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return '"' + str.replace(/"/g, '""') + '"';
          }
          return str;
        }).join(','));
      }
      
      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
      res.send(csv);
    }
  } catch (err) {
    console.error(`Error exporting curated model: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

function inlineCuratedIntoMartSql(sql) {
  if (!sql) return '';
  let finalSql = sql;
  let curatedFiles = [];
  try {
    curatedFiles = fs.readdirSync(CURATED_META_DIR).filter(f => f.endsWith('.json'));
  } catch (e) {
    return finalSql;
  }

  const curatedMap = new Map();
  curatedFiles.forEach(file => {
    const name = file.replace(/\.json$/, '');
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(CURATED_META_DIR, file), 'utf8'));
      if (meta.sql) curatedMap.set(name, meta.sql.trim().replace(/;+\s*$/, ''));
    } catch (e) {
      /* ignore */
    }
  });

  // Recursively inline curated references to reach staging/raw
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 5) {
    changed = false;
    iterations += 1;
    curatedMap.forEach((curSql, name) => {
      const fromRe = new RegExp(`\\bFROM\\s+("${name}"|${name})(?:\\s+AS)?(?:\\s+(\\w+))?`, 'gi');
      const joinRe = new RegExp(`\\bJOIN\\s+("${name}"|${name})(?:\\s+AS)?(?:\\s+(\\w+))?`, 'gi');

      const replacer = (alias) => {
        const effectiveAlias = alias || name;
        return `(${curSql}) AS ${effectiveAlias}`;
      };

      const newFinal = finalSql
        .replace(fromRe, (match, _tbl, alias) => `FROM ${replacer(alias)}`)
        .replace(joinRe, (match, _tbl, alias) => `JOIN ${replacer(alias)}`);

      if (newFinal !== finalSql) {
        changed = true;
        finalSql = newFinal;
      }
    });
  }

  return finalSql;
}

// Execute a SQL query with limit enforcement and measure elapsed time
async function runTimedQuery(sql, limit = FULL_CHART_ROWS) {
  if (!sql) throw new Error('Missing SQL');
  const finalSQL = ensureLimit(sql, limit);
  const start = process.hrtime.bigint();
  const rows = await new Promise((resolve, reject) => {
    db.all(finalSQL, (err, rows) => err ? reject(err) : resolve(rows));
  });
  const elapsedMs = Number(process.hrtime.bigint() - start) / 1e6;
  return { rows, elapsedMs };
}

// --- Marts layer endpoints ---
// List all marts models
app.get('/marts', (req, res) => {
  fs.readdir(MARTS_META_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const names = files.filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
    res.json({ models: names });
  });
});

// Get a specific mart model (SQL, doc, preview)
app.get('/mart/:name', (req, res) => {
  const metaPath = path.join(MARTS_META_DIR, `${req.params.name}.json`);
  fs.readFile(metaPath, 'utf8', (err, data) => {
    if (err) return res.status(404).json({ error: 'Mart model not found' });
    res.json(JSON.parse(data));
  });
});

// Get mart SQL plus source-based SQL (curated inlined to their definitions)
app.get('/mart/:name/source-sql', (req, res) => {
  const metaPath = path.join(MARTS_META_DIR, `${req.params.name}.json`);
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const martSql = meta.sql || '';
    const sourceSql = inlineCuratedIntoMartSql(martSql);
    res.json({ martSql, sourceSql });
  } catch (err) {
    res.status(404).json({ error: 'Mart model not found' });
  }
});

// Compare a user-provided source SQL against a mart by executing both and timing
app.post('/mart/:name/compare', async (req, res) => {
  const { sourceSql, rowLimit = 1000, runs = 5 } = req.body || {};
  const metaPath = path.join(MARTS_META_DIR, `${req.params.name}.json`);
  try {
    if (!sourceSql) return res.status(400).json({ error: 'Missing sourceSql' });

    // Basic validation: source SQL should not reference curated or mart tables
    const srcLower = String(sourceSql).toLowerCase();
    const badNames = [];
    try {
      const curatedFiles = fs.readdirSync(CURATED_META_DIR).filter(f => f.endsWith('.json'));
      curatedFiles.forEach(f => {
        const n = f.replace(/\.json$/, '').toLowerCase();
        if (srcLower.includes(n)) badNames.push(n);
      });
      const martFiles = fs.readdirSync(MARTS_META_DIR).filter(f => f.endsWith('.json'));
      martFiles.forEach(f => {
        const n = f.replace(/\.json$/, '').toLowerCase();
        if (srcLower.includes(n)) badNames.push(n);
      });
    } catch (e) {
      // ignore validation errors, fall back to allowing query
    }
    if (badNames.length > 0) {
      return res.status(400).json({
        error: 'Source SQL must not reference curated or mart tables',
        tables: Array.from(new Set(badNames))
      });
    }

    const runsClamped = Math.min(10, Math.max(1, Number(runs) || 5));

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const martSql = meta.sql || '';
    if (!martSql) return res.status(400).json({ error: 'Mart SQL missing' });

    const martTimes = [];
    const rawTimes = [];
    let martRowsSample = [];
    let rawRowsSample = [];

    // Warm-up: run each query once to populate caches / JIT and then ignore
    try {
      await runTimedQuery(sourceSql, rowLimit);
    } catch (e) { /* ignore warm-up errors */ }
    try {
      await runTimedQuery(martSql, rowLimit);
    } catch (e) { /* ignore warm-up errors */ }

    for (let i = 0; i < runsClamped; i++) {
      const rawRes = await runTimedQuery(sourceSql, rowLimit);
      const martRes = await runTimedQuery(martSql, rowLimit);
      rawTimes.push(rawRes.elapsedMs);
      martTimes.push(martRes.elapsedMs);
      if (i === 0) {
        rawRowsSample = rawRes.rows;
        martRowsSample = martRes.rows;
      }
    }

    const stats = (arr) => {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const avg = arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
      return { min, max, avg };
    };

    const rawStats = stats(rawTimes);
    const martStats = stats(martTimes);

    function median(arr) {
      if (!arr || arr.length === 0) return null;
      const s = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 === 0 ? (s[mid - 1] + s[mid]) / 2 : s[mid];
    }

    function winsCount(rawArr, martArr) {
      let rawWins = 0, martWins = 0;
      for (let i = 0; i < Math.min(rawArr.length, martArr.length); i++) {
        if (rawArr[i] < martArr[i]) rawWins++;
        else if (martArr[i] < rawArr[i]) martWins++;
      }
      return { rawWins, martWins };
    }

    const raw_median_ms = median(rawTimes);
    const mart_median_ms = median(martTimes);
    const wins = winsCount(rawTimes, martTimes);

    const sameShape =
      Array.isArray(rawRowsSample) &&
      Array.isArray(martRowsSample) &&
      rawRowsSample.length === martRowsSample.length &&
      (rawRowsSample[0]
        ? Object.keys(rawRowsSample[0]).join(',') ===
          (martRowsSample[0] ? Object.keys(martRowsSample[0]).join(',') : '')
        : true);

    const marts_avg_time_ms = martStats.avg;
    const raw_avg_time_ms = rawStats.avg;
    const marts_median_time_ms = mart_median_ms;
    const raw_median_time_ms = raw_median_ms;
    const comparison_ratio = marts_median_time_ms > 0 ? raw_median_time_ms / marts_median_time_ms : null;

    res.json({
      mart: req.params.name,
      rowLimit,
      runs: runsClamped,
      marts_avg_time_ms,
      raw_avg_time_ms,
      marts_median_time_ms,
      raw_median_time_ms,
      comparison_ratio,
      mart_stats: {
        avg_ms: martStats.avg,
        min_ms: martStats.min,
        max_ms: martStats.max,
        runs: martTimes,
      },
      raw_stats: {
        avg_ms: rawStats.avg,
        min_ms: rawStats.min,
        max_ms: rawStats.max,
        runs: rawTimes,
      },
      median_stats: {
        mart_median_ms: marts_median_time_ms,
        raw_median_ms: raw_median_time_ms,
      },
      wins: wins,
      row_counts: {
        raw: rawRowsSample.length,
        mart: martRowsSample.length,
      },
      shape_equal: sameShape,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Save or update a mart model
app.post('/marts', async (req, res) => {
  const { name, sql, documentation, tableDescription } = req.body;
  if (!name || !sql) return res.status(400).json({ error: 'Missing name or SQL' });
  const filePath = path.join(MARTS_DIR, `${name}.sql`);
  fs.writeFileSync(filePath, sql);
  // Preview and doc generation if not provided
  let preview = [];
  let doc = documentation || [];
  let previewSQL = sql.trim();
  if (!/limit\s+\d+/i.test(previewSQL)) {
    previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
  }
  const db = new sqlite3.Database(DB_PATH);
  try {
    preview = await new Promise((resolve, reject) => {
      db.all(previewSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    // Normalize documentation structure: ensure 'name' field exists and preserve all fields
    if (doc && doc.length > 0) {
      doc = doc.map(col => {
        const normalized = {
          ...col,
          name: col.name || col.column || col.source || col.original || '',
          // Preserve all custom fields
          description: col.description || '',
          type: col.type || typeof preview[0]?.[col.name || col.column] || 'string',
          nullable: col.nullable !== undefined ? col.nullable : (preview.length > 0 ? preview.some(row => row[col.name || col.column] === null || row[col.name || col.column] === '') : false),
          unique: col.unique !== undefined ? col.unique : (preview.length > 0 ? new Set(preview.map(row => row[col.name || col.column])).size === preview.length : false),
          testNull: col.testNull || false,
          testUnique: col.testUnique || false
        };
        // Remove old field names to avoid confusion
        delete normalized.column;
        return normalized;
      });
    } else if (preview.length > 0) {
      // Generate new documentation if none provided
      const keys = Object.keys(preview[0]);
      doc = keys.map(col => {
        const values = preview.map(row => row[col]);
        const nonNullValues = values.filter(v => v !== null && v !== '');
        return {
          name: col,
          type: typeof preview[0][col],
          description: '',
          nullable: values.some(v => v === null || v === ''),
          unique: new Set(nonNullValues).size === nonNullValues.length && nonNullValues.length === preview.length,
          testNull: false,
          testUnique: false
        };
      });
    }
  } catch (e) {
    preview = [];
    // Normalize documentation even if preview fails
    if (doc && doc.length > 0) {
      doc = doc.map(col => ({
        ...col,
        name: col.name || col.column || col.source || col.original || '',
        description: col.description || '',
        type: col.type || 'string',
        nullable: col.nullable !== undefined ? col.nullable : false,
        unique: col.unique !== undefined ? col.unique : false,
        testNull: col.testNull || false,
        testUnique: col.testUnique || false
      })).map(col => {
        delete col.column;
        return col;
      });
    } else {
      doc = [];
    }
  }
  db.close();

  // Save metadata
  const meta = {
    name,
    sql,
    tableDescription: tableDescription || '',
    documentation: doc,
    preview,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(path.join(MARTS_META_DIR, `${name}.json`), JSON.stringify(meta, null, 2));
  res.json({ success: true, file: filePath, meta });
});

// Preview custom mart SQL (returns up to 100 rows and docs)
app.post('/api/mart-preview', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'Missing SQL' });
  let previewSQL = sql.trim();
  if (!/limit\s+\d+/i.test(previewSQL)) {
    previewSQL = previewSQL.replace(/;*\s*$/, '') + ' LIMIT 100';
  }
  try {
    const preview = await new Promise((resolve, reject) => {
      db.all(previewSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    let columns = [];
    if (preview.length > 0) {
      const keys = Object.keys(preview[0]);
      columns = keys.map(col => {
        const values = preview.map(row => row[col]);
        const nonNullValues = values.filter(v => v !== null && v !== '');
        const type = detectType(nonNullValues);
        const nullable = values.some(v => v === null || v === '');
        const unique = new Set(nonNullValues).size === nonNullValues.length && nonNullValues.length === preview.length;
        return {
          name: col,
          type,
          nullable,
          unique,
        };
      });
    }
    res.json({ columns, preview });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Fetch mart model data rows (for table view)
app.get('/mart/:name/data', async (req, res) => {
  const name = req.params.name;
  const metaPath = path.join(MARTS_META_DIR, `${name}.json`);
  const rawLimit = req.query.limit;
  const limit = rawLimit === 'all' ? null : Number(rawLimit || 1000);

  try {
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const sql = metaData.sql;
    if (!sql) {
      return res.status(400).json({ error: 'No SQL query found for this model' });
    }

    let finalSQL = sql.trim();
    if (limit && !/limit\s+\d+/i.test(finalSQL)) {
      finalSQL = finalSQL.replace(/;*\s*$/, '') + ` LIMIT ${limit}`;
    }
    const rows = await new Promise((resolve, reject) => {
      db.all(finalSQL, (err, rows) => err ? reject(err) : resolve(rows));
    });
    res.json({ rows, limit });
  } catch (err) {
    console.error(`Error fetching mart model data: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Export mart model query results as CSV or JSON
app.get('/mart/:name/export', async (req, res) => {
  const name = req.params.name;
  const format = req.query.format || 'csv'; // csv or json
  const metaPath = path.join(MARTS_META_DIR, `${name}.json`);
  
  try {
    const metaData = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const sql = metaData.sql;
    
    if (!sql) {
      return res.status(400).json({ error: 'No SQL query found for this model' });
    }
    
    // Execute the full query (no limit for export)
    const db = new sqlite3.Database(DB_PATH);
    const rows = await new Promise((resolve, reject) => {
      db.all(sql.trim(), (err, rows) => err ? reject(err) : resolve(rows));
    });
    db.close();
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.json"`);
      res.json(rows);
    } else {
      // CSV format
      if (rows.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
        return res.send('');
      }
      
      const headers = Object.keys(rows[0]);
      const csvRows = [headers.join(',')];
      for (const row of rows) {
        csvRows.push(headers.map(k => {
          const val = row[k];
          if (val == null) return '';
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const str = String(val);
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return '"' + str.replace(/"/g, '""') + '"';
          }
          return str;
        }).join(','));
      }
      
      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${name}.csv"`);
      res.send(csv);
    }
  } catch (err) {
    console.error(`Error exporting mart model: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Performance comparison endpoints ---
app.post('/api/execute/manual', async (req, res) => {
  try {
    const { sql, rowLimit = FULL_CHART_ROWS, runId = randomUUID() } = req.body || {};
    if (!sql) return res.status(400).json({ error: 'Missing sql' });
    runPerfJob({ runId, mode: 'manual', sql, rowLimit });
    res.json({ runId, streamUrl: `/api/perf/${runId}/stream` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/execute/dataflow', async (req, res) => {
  try {
    const { curatedName, rowLimit = FULL_CHART_ROWS, runId = randomUUID() } = req.body || {};
    if (!curatedName) return res.status(400).json({ error: 'Missing curatedName' });
    const sqlPath = path.join(CURATED_DIR, `${curatedName}.sql`);
    if (!fs.existsSync(sqlPath)) return res.status(404).json({ error: 'Curated SQL not found' });
    const sql = fs.readFileSync(sqlPath, 'utf8');
    runPerfJob({ runId, mode: 'dataflow', sql, curatedName, rowLimit });
    res.json({ runId, streamUrl: `/api/perf/${runId}/stream` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SSE stream for a run
app.get('/api/perf/:runId/stream', (req, res) => {
  const { runId } = req.params;
  const job = perfJobs.get(runId);
  if (!job) {
    return res.status(404).json({ error: 'Run not found' });
  }
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  res.write('\n');
  job.esClients.add(res);
  // Send existing samples immediately
  job.samples.forEach(sample => {
    res.write(`data: ${JSON.stringify(sample)}\n\n`);
  });
  req.on('close', () => {
    job.esClients.delete(res);
  });
});

// Cancel a run
app.post('/api/perf/:runId/cancel', (req, res) => {
  const { runId } = req.params;
  const job = perfJobs.get(runId);
  if (!job) return res.status(404).json({ error: 'Run not found' });
  job.cancelRequested = true;
  job.status = 'cancelled';
  res.json({ cancelled: true });
});

// Final perf JSON
app.get('/api/perf/:runId', (req, res) => {
  const { runId } = req.params;
  const inMem = perfJobs.get(runId);
  if (inMem && inMem.meta && inMem.samples.length > 0) {
    return res.json({ meta: inMem.meta, samples: inMem.samples, final: inMem.samples[inMem.samples.length - 1] });
  }
  const jsonPath = path.join(PERF_DIR, `${runId}.json`);
  if (!fs.existsSync(jsonPath)) return res.status(404).json({ error: 'Perf run not found' });
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  res.json(data);
});

// List perf runs
app.get('/api/perf/list', (req, res) => {
  const files = fs.readdirSync(PERF_DIR).filter(f => f.endsWith('.json'));
  const runs = files.map(f => {
    const data = JSON.parse(fs.readFileSync(path.join(PERF_DIR, f), 'utf8'));
    return {
      runId: data.runId || f.replace(/\.json$/, ''),
      mode: data.mode,
      curatedName: data.curatedName || null,
      rowLimit: data.rowLimit,
      startedAt: data.startedAt || data.meta?.startedAt,
      finishedAt: data.finishedAt || data.meta?.finishedAt,
      rowsProcessed: data.rowsProcessed || data.final?.rowsProcessed || 0
    };
  }).sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0));
  res.json({ runs });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 