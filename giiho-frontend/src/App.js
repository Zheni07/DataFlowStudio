import React, { useEffect, useState } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  const centerX = 210;
  const centerY = 210;
  const radius = 140;
  const nodeR = 38;
  const angles = [270, 342, 54, 126, 198];
  const labels = [
    { label: 'Transform', grad: 'transformGrad' },
    { label: 'Model', grad: 'modelGrad' },
    { label: 'Quality', grad: 'qualityGrad', sub: 'Check' },
    { label: 'Results', grad: 'resultsGrad' },
    { label: 'Raw', grad: 'rawGrad' },
  ];
  const nodes = angles.map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    return { x: centerX + radius * Math.cos(rad), y: centerY + radius * Math.sin(rad), angle: deg, ...labels[i] };
  });
  function arcPath(cx, cy, r, startDeg, endDeg) {
    const rad = a => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startDeg));
    const y1 = cy + r * Math.sin(rad(startDeg));
    const x2 = cx + r * Math.cos(rad(endDeg));
    const y2 = cy + r * Math.sin(rad(endDeg));
    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = 1;
    return `M${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  }

  return (
    <div className="modern-root">
      <header className="modern-header">
        <div className="logo-title">DataFlow Studio</div>
      </header>

      <section className="modern-hero">
        <div className="hero-left">
          <h1>Transform Your Data Visually</h1>
          <p className="hero-desc">A modern platform to manage, build, and launch your data pipelines with ease. Visualize dependencies, track execution, and document everything in one place.</p>
          <button className="modern-cta" onClick={() => navigate('/app')}>Get Started</button>
        </div>
        <div className="hero-right pipeline-center">
          <svg width="420" height="420" viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', maxWidth: '100%', transform: 'scale(1.2)' }}>
            <defs>
              <linearGradient id="rawGrad" x1="60" y1="210" x2="140" y2="290" gradientUnits="userSpaceOnUse">
                <stop stopColor="#60a5fa" />
                <stop offset="1" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="transformGrad" x1="210" y1="60" x2="290" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2563eb" />
                <stop offset="1" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="modelGrad" x1="340" y1="170" x2="420" y2="250" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#60a5fa" />
              </linearGradient>
              <linearGradient id="qualityGrad" x1="260" y1="340" x2="340" y2="420" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e42" />
                <stop offset="1" stopColor="#fbbf24" />
              </linearGradient>
              <linearGradient id="resultsGrad" x1="100" y1="340" x2="180" y2="420" gradientUnits="userSpaceOnUse">
                <stop stopColor="#22c55e" />
                <stop offset="1" stopColor="#4ade80" />
              </linearGradient>
            </defs>
            <ellipse cx="210" cy="210" rx="170" ry="170" fill="#60a5fa" fillOpacity="0.07" />
			{(() => {
			  const r = radius - 10;
			  const segments = [
				{ start: 0, end: 200, color: '#3b82f6', cls: 'ring-arc ring-arc--blue' },
				{ start: 200, end: 300, color: '#22c55e', cls: 'ring-arc ring-arc--green' },
				{ start: 300, end: 360, color: '#f59e0b', cls: 'ring-arc ring-arc--orange' },
			  ];
			  return segments.map((seg, i) => (
				<path key={i} className={seg.cls} d={arcPath(centerX, centerY, r, seg.start, seg.end)} stroke={seg.color} strokeWidth="6" fill="none" strokeLinecap="round" />
			  ));
			})()}
			{nodes.map((node, i) => (
			  <g key={i}>
				<circle className={`diagram-node${i === 0 ? ' active' : ''}`} cx={node.x} cy={node.y} r={nodeR} fill={`url(#${node.grad})`} stroke="#fff" strokeWidth={i === 0 ? 4 : 6} />
				<text className="diagram-label" x={node.x} y={node.y + 7} textAnchor="middle" fontSize="18" fill="#fff">{node.label}</text>
				{node.sub && (<text className="diagram-label" x={node.x} y={node.y + 25} textAnchor="middle" fontSize="13" fill="#fff">{node.sub}</text>)}
			  </g>
			))}
          </svg>
        </div>
      </section>

      <section id="how" className="features-section timeline-features">
        <h2 className="features-title">How It Works</h2>
        <div className="features-timeline">
          {[
            { title: 'Raw Data', desc: 'Import & Organize' },
            { title: 'Transform', desc: 'Visual Builder' },
            { title: 'Model', desc: 'ML Integration' },
            { title: 'Analytics', desc: 'Live Results' },
            { title: 'Security', desc: 'Safe & Reliable' },
            { title: 'Automation', desc: 'Scheduling' },
          ].map((item, i, arr) => (
            <div className="timeline-step" key={item.title}>
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-title">{item.title}</div>
                <div className="timeline-desc">{item.desc}</div>
              </div>
              {i !== arr.length - 1 && <div className="timeline-line" />}
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="modern-why no-icons-why">
        <h2>Why Choose Us?</h2>
        <p className="why-intro">Build, manage, and launch pipelines—fast.</p>
        <div className="why-list">
          {[
            { title: 'No-Code', desc: 'Drag & Drop' },
            { title: 'Clarity', desc: 'Visual Dependencies' },
            { title: 'Tracking', desc: 'Real-Time Status' },
            { title: 'Docs', desc: 'Centralized' },
            { title: 'Modern UX', desc: 'Intuitive' },
          ].map((r) => (
            <div className="why-list-item" key={r.title}>
              <span className="why-list-title">{r.title}</span>
              <span className="why-list-desc">{r.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="modern-footer">
        <div className="footer-content">
          <span>© {new Date().getFullYear()} DataFlow Studio</span>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
        </div>
      </footer>
    </div>
  );
}

function Staging() {
  const location = useLocation();
  const [stagingName, setStagingName] = React.useState("");
  const [sqlInput, setSqlInput] = React.useState("");
  const [previewRows, setPreviewRows] = React.useState([]);
  const [previewError, setPreviewError] = React.useState("");
  const [saveStatus, setSaveStatus] = React.useState("");
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [stagings, setStagings] = React.useState([]);
  const [selectedStaging, setSelectedStaging] = React.useState("");
  const [documentation, setDocumentation] = React.useState([]); // [{name, type, nullable, unique, description, testNull, testUnique, nullWarning, uniqueWarning}]
  const [tableDescription, setTableDescription] = React.useState("");
  const [dialect, setDialect] = React.useState("sqlite");

  // Load all saved stagings on mount or after save
  React.useEffect(() => {
    fetch("http://localhost:4000/stagings")
      .then(res => res.json())
      .then(data => setStagings(data.stagings || []))
      .catch(() => {
        // Silently fail - backend might not be running
        setStagings([]);
      });
  }, [saveStatus]);

  // Load a selected staging
  React.useEffect(() => {
    if (!selectedStaging) return;
    fetch(`http://localhost:4000/staging/${selectedStaging}`)
      .then(res => res.json())
      .then(data => {
        setStagingName(data.name);
        setSqlInput(data.sql);
        setPreviewRows(data.preview || []);
        setDocumentation((data.documentation || []).map(col => {
          // Normalize field names: support both 'column' (old format) and 'name' (new format)
          const normalizedCol = {
          ...col,
            name: col.name || col.column || col.source || col.original,
            // Preserve all existing fields
            type: col.type,
            description: col.description || '',
            nullable: col.nullable,
            unique: col.unique,
          testNull: !!col.testNull,
          testUnique: !!col.testUnique,
            // Reset runtime-only fields
          nullWarning: "",
          uniqueWarning: ""
          };
          return normalizedCol;
        }));
        setTableDescription(data.tableDescription || "");
        setDialect(data.dialect || "sqlite");
        setPreviewError("");
        setSaveStatus("");
      })
      .catch(err => {
        setPreviewError("Failed to load staging: " + err.message);
      });
  }, [selectedStaging]);

  // Auto-load staging if coming from sidebar
  React.useEffect(() => {
    if (location.state && location.state.loadStaging) {
      setSelectedStaging(location.state.loadStaging);
    }
    // eslint-disable-next-line
  }, [location.state]);

  // If navigated from the Staging button, always reset selectedStaging
  React.useEffect(() => {
    if (location.state && location.state.fromStagingButton) {
      setSelectedStaging("");
      setStagingName("");
      setSqlInput("");
      setPreviewRows([]);
      setDocumentation([]);
      setTableDescription("");
      setPreviewError("");
      setSaveStatus("");
      setDialect("sqlite");
    }
    // eslint-disable-next-line
  }, [location.state]);

  // In Staging component, after saving or selecting a staging, reload tables
  React.useEffect(() => {
    if (!selectedStaging && !saveStatus) return;
    // Fetch tables to ensure staged table appears in sidebar
    fetch("http://localhost:4000/tables")
      .then(res => res.json())
      .then(tableList => {
        if (typeof window !== 'undefined' && window.setTables) {
          window.setTables(tableList);
        }
      });
  }, [selectedStaging, saveStatus]);

  const handlePreview = async () => {
    setPreviewError("");
    setPreviewRows([]);
    setDocumentation([]);
    setIsPreviewing(true);
    try {
      const res = await fetch("http://localhost:4000/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlInput })
      });
      const data = await res.json();
      if (data.error) {
        setPreviewError(data.error);
      } else {
        setPreviewRows(data.preview);
        if (data.columns && data.columns.length > 0) {
          setDocumentation(data.columns.map(col => ({
            ...col,
            description: "",
            testNull: false,
            testUnique: false,
            nullWarning: "",
            uniqueWarning: ""
          })));
        } else {
          setDocumentation([]);
        }
      }
    } catch (err) {
      setPreviewError("Failed to preview: " + err.message);
    }
    setIsPreviewing(false);
  };

  const handleColumnDescriptionChange = (idx, value) => {
    setDocumentation(prev => prev.map((col, i) => i === idx ? { ...col, description: value } : col));
  };

  // Add a function to run column tests on previewRows
  const runColumnTests = (docs, previewRows) => {
    return docs.map((col, idx) => {
      let nullWarning = "";
      let uniqueWarning = "";
      if (col.testNull) {
        const hasNull = previewRows.some(row => row[col.name] === null || row[col.name] === undefined || row[col.name] === "");
        if (hasNull) nullWarning = `Warning: NULL values found in column ${col.name}.`;
      }
      if (col.testUnique) {
        const values = previewRows.map(row => row[col.name]);
        const unique = new Set(values.filter(v => v !== null && v !== undefined));
        if (unique.size < values.filter(v => v !== null && v !== undefined).length) {
          uniqueWarning = `Warning: Duplicate values found in column ${col.name}.`;
        }
      }
      return { ...col, nullWarning, uniqueWarning };
    });
  };

  // When previewRows or documentation changes, rerun tests
  React.useEffect(() => {
    if (previewRows.length > 0 && documentation.length > 0) {
      setDocumentation(prevDocs => runColumnTests(prevDocs, previewRows));
    }
    // eslint-disable-next-line
  }, [previewRows]);

  // Handler for test checkboxes
  const handleTestCheckboxChange = (idx, field) => {
    setDocumentation(prev => {
      return prev.map((col, i) => {
        if (i !== idx) return col;
        // Toggle the test field
        const updatedCol = { ...col, [field]: !col[field] };
        // Only run the test for this column
        const colName = updatedCol.name || updatedCol.source || updatedCol.original;
        let nullWarning = updatedCol.nullWarning;
        let uniqueWarning = updatedCol.uniqueWarning;
        if (field === 'testNull') {
          if (!updatedCol.testNull) {
            nullWarning = "";
          } else {
            const hasNull = previewRows.some(
              row => row[colName] === null || row[colName] === undefined || row[colName] === ""
            );
            nullWarning = hasNull ? `Warning: NULL values found in column ${colName}.` : "";
          }
        }
        if (field === 'testUnique') {
          if (!updatedCol.testUnique) {
            uniqueWarning = "";
          } else {
            const values = previewRows.map(row => row[colName]);
            const unique = new Set(values.filter(v => v !== null && v !== undefined && v !== ""));
            uniqueWarning = unique.size < values.filter(v => v !== null && v !== undefined && v !== "").length ? `Warning: Duplicate values found in column ${colName}.` : "";
          }
        }
        return { ...updatedCol, nullWarning, uniqueWarning };
      });
    });
  };

  const handleSave = async () => {
    setSaveStatus("");
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:4000/save-staging-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: stagingName,
          sql: sqlInput,
          dialect,
          createTable: true,
          documentation: documentation.map(col => ({
            ...col,
            nullWarning: undefined,
            uniqueWarning: undefined
          })),
          tableDescription,
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Staging saved successfully!");
        setSelectedStaging(stagingName); // reload this staging
        // Immediately refresh tables so Models updates
        fetch("http://localhost:4000/tables").then(res => res.json()).then(tableList => {
          if (typeof window !== 'undefined' && window.setTables) {
            window.setTables(tableList);
          }
        });
      } else {
        setSaveStatus(data.error || "Failed to save staging.");
      }
    } catch (err) {
      setSaveStatus("Failed to save staging: " + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', padding: 0 }}>
      <h1 style={{ padding: '40px 0 0 40px' }}>Manual Staging Definition</h1>
      <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        {/* Remove the Load Saved Staging dropdown and its label */}
        {/* <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style={{ fontWeight: 600 }}>Load Saved Staging:</label>
          <select
            value={selectedStaging}
            onChange={e => setSelectedStaging(e.target.value)}
            style={{ fontSize: 16, padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 220 }}
          >
            <option value="">-- Select --</option>
            {stagings.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div> */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          {/* Left: SQL Editor */}
          <div style={{ flex: 2, minWidth: 0, height: '100%' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600 }}>Staging Name</label><br />
              <input
                type="text"
                value={stagingName}
                onChange={e => setStagingName(e.target.value)}
                placeholder="e.g. stg_products_transformed"
                style={{ width: 400, fontSize: 16, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600 }}>SQL Query (SQLite dialect)</label><br />
              <textarea
                value={sqlInput}
                onChange={e => setSqlInput(e.target.value)}
                placeholder={"Write your SQL transformation here.\nExample: SELECT id, LOWER(name) AS name_cleaned FROM raw_customers WHERE name IS NOT NULL;"}
                style={{ width: '100%', minHeight: 120, fontSize: 15, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handlePreview}
                disabled={!sqlInput.trim() || isPreviewing}
                style={{ padding: '10px 24px', fontSize: 16, background: '#36f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, marginRight: 16 }}
              >
                {isPreviewing ? 'Previewing...' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={!stagingName.trim() || !sqlInput.trim() || isSaving}
                style={{ padding: '10px 24px', fontSize: 16, background: '#00b887', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, marginRight: 16 }}
              >
                {isSaving ? 'Saving...' : 'Save Staging'}
              </button>
              <button
                onClick={() => {
                  if (!selectedStaging || !selectedStaging.startsWith('stg_')) return;
                  const url = `http://localhost:4000/download-staged/${selectedStaging}`;
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `${selectedStaging}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                disabled={!selectedStaging || !selectedStaging.startsWith('stg_')}
                style={{ padding: '10px 24px', fontSize: 16, background: '#222b45', color: '#fff', border: 'none', borderRadius: 6, cursor: (!selectedStaging || !selectedStaging.startsWith('stg_')) ? 'not-allowed' : 'pointer', fontWeight: 600 }}
              >
                Download CSV
              </button>
              {saveStatus && <span style={{ marginLeft: 18, color: saveStatus.includes('success') ? '#00b887' : 'red', fontWeight: 600 }}>{saveStatus}</span>}
            </div>
            {previewError && <div style={{ color: 'red', marginBottom: 16 }}>{previewError}</div>}
            {previewRows.length > 0 && (
              <div style={{ marginTop: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 10 }}>
                <h3 style={{ marginTop: 0 }}>Preview Result (up to 100 rows)</h3>
                <div style={{ overflow: 'auto', maxHeight: 400 }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {Object.keys(previewRows[0]).map(key => (
                          <th key={key} style={{ background: '#f7fafc', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #e4e9f2', position: 'sticky', top: 0, fontWeight: 600 }}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#f7fafc' : '#fff', height: 28 }}>
                          {Object.values(row).map((val, i) => (
                            <td key={i} style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2', color: '#333', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          {/* Right: Documentation Panel (full height, vertical layout) */}
          <div style={{ flex: 1.5, minWidth: 420, background: '#f7fafc', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 0, marginLeft: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ marginTop: 0 }}>Documentation</h3>
              {/* Group Table Description and Columns Table in a flex column, so YAML is always at the bottom */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {/* Table Description at the top */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Table Description</label>
                  <textarea
                    value={tableDescription}
                    onChange={e => setTableDescription(e.target.value)}
                    placeholder="Short description of the table..."
                    style={{ width: '100%', minHeight: 96, fontSize: 15, padding: 10, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
                  />
                </div>
                {/* Columns Table (scrollable, fills available space) */}
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: 0, minHeight: 0 }}>
                  {documentation.length > 0 ? (
                    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Column Name</th>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Type</th>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Description</th>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Test</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentation.map((col, idx) => (
                          <tr key={col.name + idx}>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2' }}>{col.source || col.original || col.name}</td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2' }}>{col.type}</td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2' }}>
                              <textarea
                                value={col.description || ""}
                                onChange={e => handleColumnDescriptionChange(idx, e.target.value)}
                                placeholder="Description..."
                                style={{ width: '100%', fontSize: 14, padding: 6, borderRadius: 4, border: '1px solid #ccc', minHeight: 48, resize: 'vertical' }}
                              />
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2', minWidth: 120 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!col.testNull}
                                    onChange={() => handleTestCheckboxChange(idx, 'testNull')}
                                  />
                                  NULL
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!col.testUnique}
                                    onChange={() => handleTestCheckboxChange(idx, 'testUnique')}
                                  />
                                  Unique
                                </label>
                                {col.nullWarning && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{col.nullWarning}</div>}
                                {col.uniqueWarning && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{col.uniqueWarning}</div>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ color: '#8f9bb3', fontSize: 14 }}>No documentation generated yet. Click Preview to generate.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarNavWrapper(props) {
  const navigate = useNavigate();
  return <SidebarNav {...props} navigate={navigate} />;
}

function SidebarNav({ tables, selectedTable, setSelectedTable, sidebarStagings, curatedModels, setSelectedCurated, selectedCurated, navigate }) {
  // Single-select accordion state
  const [openSection, setOpenSection] = useState(null); // 'tables' | 'staging' | 'curated' | null
  const [showCuratedPanel, setShowCuratedPanel] = useState(false);

  // Effect: When switching to 'staging', clear selected table
  React.useEffect(() => {
    if (openSection === 'staging') {
      setSelectedTable('');
    }
  }, [openSection, setSelectedTable]);

  // Add a function to filter only original (non-staged) tables
  const sourceTables = tables.filter(
    t => !t.toLowerCase().startsWith('stg_') &&
         !t.toLowerCase().startsWith('staging') &&
         !t.toLowerCase().includes('stg') &&
         !t.toLowerCase().includes('staging') &&
         !t.toLowerCase().includes('hpjpp')
  );

  // Add a function to filter only staged tables (models)
  const modelTables = tables.filter(
    t => t.toLowerCase().startsWith('stg_')
  );

  // Add state for delete loading and error
  const [deletingStaging, setDeletingStaging] = React.useState("");
  const [deleteError, setDeleteError] = React.useState("");

  return (
    <aside style={{ width: 220, background: '#222b45', color: '#fff', padding: 0, boxShadow: '2px 0 8px #0001', height: '100vh', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 10, overflowY: 'auto' }}>
      <div style={{ padding: '24px 0 0 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#8f9bb3', fontWeight: 700, fontSize: 15, padding: '0 0 18px 26px', letterSpacing: 1 }}>Menu</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', width: '100%' }}>
          {/* Source Accordion Button */}
          <button
            onClick={() => setOpenSection(openSection === 'source' ? null : 'source')}
            style={{
              background: 'linear-gradient(90deg, #00b887 0%, #36f 100%)',
              borderRadius: 8,
              boxShadow: '0 1.5px 6px #0001',
              padding: '10px 0',
              margin: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              justifyContent: 'center',
              gap: 8,
              border: '1.5px solid #00b887',
              cursor: 'pointer',
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 1,
              textShadow: '0 1px 4px #0001',
              transition: 'box-shadow 0.2s, border 0.2s',
              minWidth: 0,
            }}
          >
            Source
            <span style={{ marginLeft: 8 }}>{openSection === 'source' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'source' && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0' }}>
              {sourceTables.map(table => (
                <li key={table}>
                  <button
                    style={{
                      width: '100%',
                      background: selectedTable === table ? '#00b887' : 'transparent',
                      color: selectedTable === table ? '#222b45' : '#fff',
                      border: 'none',
                      padding: '10px 12px',
                      marginBottom: 6,
                      borderRadius: 6,
                      cursor: openSection === 'source' ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      fontWeight: selectedTable === table ? 700 : 400,
                      transition: 'background 0.2s, color 0.2s',
                      opacity: openSection === 'source' ? 1 : 0.5,
                    }}
                    disabled={openSection !== 'source'}
                    onClick={() => {
                      if (openSection === 'source') {
                        setSelectedTable(table);
                        navigate('/app');
                      }
                    }}
                  >
                    {table}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Models Accordion Button (was Tables) */}
          <button
            onClick={() => setOpenSection(openSection === 'tables' ? null : 'tables')}
            style={{
              background: 'linear-gradient(90deg, #00d68f 0%, #36f 100%)',
              borderRadius: 8,
              boxShadow: '0 1.5px 6px #0001',
              padding: '10px 0',
              margin: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              justifyContent: 'center',
              gap: 8,
              border: '1.5px solid #00d68f',
              cursor: 'pointer',
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 1,
              textShadow: '0 1px 4px #0001',
              transition: 'box-shadow 0.2s, border 0.2s',
              minWidth: 0,
            }}
          >
            Models
            <span style={{ marginLeft: 8 }}>{openSection === 'tables' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'tables' && (
            <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0' }}>
              {modelTables.map(table => (
                <li key={table}>
                  <button
                    style={{
                      width: '100%',
                      background: selectedTable === table ? '#00d68f' : 'transparent',
                      color: selectedTable === table ? '#222b45' : '#fff',
                      border: 'none',
                      padding: '10px 12px',
                      marginBottom: 6,
                      borderRadius: 6,
                      cursor: openSection === 'tables' ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      fontWeight: selectedTable === table ? 700 : 400,
                      transition: 'background 0.2s, color 0.2s',
                      opacity: openSection === 'tables' ? 1 : 0.5,
                    }}
                    disabled={openSection !== 'tables'}
                    onClick={() => {
                      if (openSection === 'tables') {
                        setSelectedTable(table);
                        navigate('/app');
                      }
                    }}
                  >
                    {table}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* Staging Accordion Button */}
          <button
            onClick={() => setOpenSection(openSection === 'staging' ? null : 'staging')}
            style={{
              background: 'linear-gradient(90deg, #36f 0%, #00d68f 100%)',
              borderRadius: 8,
              boxShadow: '0 1.5px 6px #0001',
              padding: '10px 0',
              margin: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              justifyContent: 'center',
              gap: 8,
              border: '1.5px solid #36f',
              cursor: 'pointer',
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 1,
              textShadow: '0 1px 4px #0001',
              transition: 'box-shadow 0.2s, border 0.2s',
              minWidth: 0,
            }}
          >
            Staging
            <span style={{ marginLeft: 8 }}>{openSection === 'staging' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'staging' && (
            <div style={{ marginTop: -8, marginBottom: 12, paddingLeft: 8 }}>
              <div style={{ color: '#8f9bb3', fontSize: 13, marginBottom: 4, marginLeft: 2 }}>Saved Stagings</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sidebarStagings.length === 0 && (
                  <li style={{ color: '#8f9bb3', fontSize: 13, padding: '6px 10px' }}>No stagings saved.</li>
                )}
                {sidebarStagings.map(name => (
                  <li key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link
                      to={`/app/staging`}
                      state={{ loadStaging: name }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none',
                        background: '#232f45', borderRadius: 6, padding: '10px 0', fontSize: 14, fontWeight: 500,
                        transition: 'background 0.15s',
                        width: '100%',
                        margin: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="5" width="14" height="10" rx="2" fill="#36f" fillOpacity="0.12" stroke="#36f" strokeWidth="1.2"/>
                        <rect x="5.5" y="7.5" width="9" height="5" rx="1" fill="#00b887" fillOpacity="0.18" stroke="#00b887" strokeWidth="0.8"/>
                      </svg>
                      {name}
                    </Link>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setDeleteError("");
                        setDeletingStaging(name);
                        try {
                          const resp = await fetch(`http://localhost:4000/staging/${name}`, { method: 'DELETE' });
                          if (!resp.ok) {
                            const data = await resp.json();
                            setDeleteError(data.error || 'Failed to delete.');
                          } else {
                            // Refresh stagings and tables
                            fetch("http://localhost:4000/stagings").then(res => res.json()).then(data => window.setSidebarStagings && window.setSidebarStagings(data.stagings || []));
                            fetch("http://localhost:4000/tables").then(res => res.json()).then(tableList => window.setTables && window.setTables(tableList));
                          }
                        } catch (err) {
                          setDeleteError(err.message || 'Failed to delete.');
                        }
                        setDeletingStaging("");
                      }}
                      style={{ marginLeft: 4, background: 'transparent', border: 'none', color: '#f55', cursor: deletingStaging ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 16, opacity: deletingStaging === name ? 0.5 : 1 }}
                      title="Delete staging"
                      disabled={!!deletingStaging}
                    >
                      {deletingStaging === name ? '…' : '×'}
                    </button>
                  </li>
                ))}
                {deleteError && <div style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{deleteError}</div>}
                {/* New Staging Button */}
                <button
                  onClick={() => navigate('/app/staging', { state: { fromStagingButton: true } })}
                  style={{
                    marginTop: 10,
                    background: '#36f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 1px 4px #0002',
                    transition: 'background 0.2s',
                  }}
                >
                  + New Staging
                </button>
              </ul>
            </div>
          )}
          {/* Curated Accordion Button */}
          <button
            onClick={() => setOpenSection(openSection === 'curated' ? null : 'curated')}
            style={{
              background: 'linear-gradient(90deg, #36f 0%, #00b887 100%)',
              borderRadius: 8,
              boxShadow: '0 1.5px 6px #0001',
              padding: '10px 0',
              margin: 0,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              userSelect: 'none',
              justifyContent: 'center',
              gap: 8,
              border: '1.5px solid #36f',
              cursor: 'pointer',
              textDecoration: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: 1,
              textShadow: '0 1px 4px #0001',
              transition: 'box-shadow 0.2s, border 0.2s',
              minWidth: 0,
            }}
          >
            Curated
            <span style={{ marginLeft: 8 }}>{openSection === 'curated' ? '▲' : '▼'}</span>
          </button>
          {openSection === 'curated' && (
            <div style={{ marginTop: -8, marginBottom: 12, paddingLeft: 8 }}>
              <div style={{ color: '#8f9bb3', fontSize: 13, marginBottom: 4, marginLeft: 2 }}>Curated Models</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {curatedModels.length === 0 && (
                  <li style={{ color: '#8f9bb3', fontSize: 13, padding: '6px 10px' }}>No curated models.</li>
                )}
                {curatedModels.map(name => (
                  <li key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, color: '#fff', textDecoration: 'none',
                        background: selectedCurated === name ? '#232f45' : 'transparent', borderRadius: 6, padding: '10px 0', fontSize: 14, fontWeight: 500,
                        transition: 'background 0.15s', width: '100%', margin: 0, border: 'none', cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedCurated(name);
                        setSelectedTable('');
                        navigate('/app/curated');
                      }}
                    >
                      {name}
                    </button>
                  </li>
                ))}
                {/* New Curated Model Button */}
                <button
                  onClick={() => {
                    setSelectedCurated('');
                    setSelectedTable('');
                    navigate('/app/curated');
                  }}
                  style={{
                    marginTop: 10,
                    background: '#36f',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 1px 4px #0002',
                    transition: 'background 0.2s',
                  }}
                >
                  + New Curated Model
                </button>
                <button
                  onClick={() => setShowCuratedPanel(true)}
                  style={{
                    marginTop: 8,
                    background: 'linear-gradient(90deg, #36f 0%, #00b887 100%)',
                    color: '#fff',
                    border: '1px solid #36f',
                    borderRadius: 6,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 1px 4px #0003',
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                  title="Open curated tables panel"
                >
                  Curated Model
                </button>
                <button
                  onClick={() => navigate('/app/perf')}
                  style={{
                    marginTop: 8,
                    background: '#1e293b',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: 6,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    width: '100%',
                    boxShadow: '0 1px 4px #0003',
                    transition: 'background 0.2s, transform 0.1s',
                  }}
                  title="Open performance comparison panel"
                >
                  Performance Compare
                </button>
              </ul>
            </div>
          )}
        </div>
      </div>
      {showCuratedPanel && (
        <div style={{ position: 'fixed', top: 0, left: 220, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#f7fafc', borderRadius: 10, width: '520px', maxHeight: '80vh', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px', background: '#222b45', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, letterSpacing: 0.5 }}>Curated Tables</div>
              <button onClick={() => setShowCuratedPanel(false)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ padding: '14px 18px', overflowY: 'auto' }}>
              {curatedModels.length === 0 && <div style={{ color: '#8f9bb3', fontSize: 14 }}>No curated models available.</div>}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {curatedModels.map(name => (
                  <li key={name}>
                    <button
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: selectedCurated === name ? '#e0e7ff' : '#fff',
                        color: '#111827',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        transition: 'background 0.15s, border 0.15s',
                      }}
                      onClick={() => {
                        setSelectedCurated(name);
                        setSelectedTable('');
                        setShowCuratedPanel(false);
                        navigate('/app/curated', { state: { loadCuratedData: true, fullData: true } });
                      }}
                    >
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// CuratedModel component for curated layer
function CuratedModel({ curatedModels, setCuratedModels, selectedCurated, setSelectedCurated }) {
  const location = useLocation();
  const [modelName, setModelName] = React.useState("");
  const [sqlInput, setSqlInput] = React.useState("");
  const [previewRows, setPreviewRows] = React.useState([]);
  const [previewError, setPreviewError] = React.useState("");
  const [saveStatus, setSaveStatus] = React.useState("");
  const [isPreviewing, setIsPreviewing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [documentation, setDocumentation] = React.useState([]); // [{name, type, description, testNull, testUnique, nullWarning, uniqueWarning, acceptedValues}]
  const [tableDescription, setTableDescription] = React.useState("");
  const [dataRows, setDataRows] = React.useState([]);
  const [dataError, setDataError] = React.useState("");
  const [isLoadingData, setIsLoadingData] = React.useState(false);

  // Load a selected curated model
  React.useEffect(() => {
    if (!selectedCurated) {
      setModelName("");
      setSqlInput("");
      setPreviewRows([]);
      setDocumentation([]);
      setTableDescription("");
      setPreviewError("");
      setSaveStatus("");
      return;
    }
    fetch(`http://localhost:4000/curated-model/${selectedCurated}`)
      .then(res => res.json())
      .then(data => {
        setModelName(data.name);
        setSqlInput(data.sql);
        setPreviewRows(data.preview || []);
        setDocumentation((data.documentation || []).map(col => ({
          ...col,
          testNull: !!col.testNull,
          testUnique: !!col.testUnique,
          nullWarning: "",
          uniqueWarning: ""
        })));
        setTableDescription(data.tableDescription || "");
        setPreviewError("");
        setSaveStatus("");
      })
      .catch(err => {
        setPreviewError("Failed to load curated model: " + err.message);
      });
  }, [selectedCurated]);

  // Preview logic
  const handlePreview = async () => {
    setPreviewError("");
    setPreviewRows([]);
    setDocumentation([]);
    setIsPreviewing(true);
    try {
      const res = await fetch("http://localhost:4000/api/curated-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlInput })
      });
      const data = await res.json();
      if (data.error) {
        setPreviewError(data.error);
      } else {
        setPreviewRows(data.preview);
        if (data.columns && data.columns.length > 0) {
          setDocumentation(data.columns.map(col => ({
            ...col,
            description: "",
            testNull: false,
            testUnique: false,
            nullWarning: "",
            uniqueWarning: "",
            acceptedValues: ""
          })));
        } else {
          setDocumentation([]);
        }
      }
    } catch (err) {
      setPreviewError("Failed to preview: " + err.message);
    }
    setIsPreviewing(false);
  };

  // Documentation test logic (same as staging, but with acceptedValues)
  const handleTestCheckboxChange = (idx, field) => {
    setDocumentation(prev => {
      return prev.map((col, i) => {
        if (i !== idx) return col;
        const updatedCol = { ...col, [field]: !col[field] };
        const colName = updatedCol.name || updatedCol.source || updatedCol.original;
        let nullWarning = updatedCol.nullWarning;
        let uniqueWarning = updatedCol.uniqueWarning;
        if (field === 'testNull') {
          if (!updatedCol.testNull) {
            nullWarning = "";
          } else {
            const hasNull = previewRows.some(
              row => row[colName] === null || row[colName] === undefined || row[colName] === ""
            );
            nullWarning = hasNull ? `Warning: NULL values found in column ${colName}.` : "";
          }
        }
        if (field === 'testUnique') {
          if (!updatedCol.testUnique) {
            uniqueWarning = "";
          } else {
            const values = previewRows.map(row => row[colName]);
            const unique = new Set(values.filter(v => v !== null && v !== undefined && v !== ""));
            uniqueWarning = unique.size < values.filter(v => v !== null && v !== undefined && v !== "").length ? `Warning: Duplicate values found in column ${colName}.` : "";
          }
        }
        return { ...updatedCol, nullWarning, uniqueWarning };
      });
    });
  };

  // Accepted values test (optional, for future extension)
  // ...

  // When previewRows changes, rerun tests for all columns with checked tests
  React.useEffect(() => {
    if (previewRows.length > 0 && documentation.length > 0) {
      setDocumentation(prevDocs => prevDocs.map(col => {
        const colName = col.name || col.source || col.original;
        let nullWarning = col.nullWarning;
        let uniqueWarning = col.uniqueWarning;
        if (col.testNull) {
          const hasNull = previewRows.some(
            row => row[colName] === null || row[colName] === undefined || row[colName] === ""
          );
          nullWarning = hasNull ? `Warning: NULL values found in column ${colName}.` : "";
        } else {
          nullWarning = "";
        }
        if (col.testUnique) {
          const values = previewRows.map(row => row[colName]);
          const unique = new Set(values.filter(v => v !== null && v !== undefined && v !== ""));
          uniqueWarning = unique.size < values.filter(v => v !== null && v !== undefined && v !== "").length ? `Warning: Duplicate values found in column ${colName}.` : "";
        } else {
          uniqueWarning = "";
        }
        return { ...col, nullWarning, uniqueWarning };
      }));
    }
    // eslint-disable-next-line
  }, [previewRows]);

  // Save logic
  const handleSave = async () => {
    setSaveStatus("");
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:4000/curated-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: modelName,
          sql: sqlInput,
          documentation: documentation.map(col => ({
            ...col,
            nullWarning: undefined,
            uniqueWarning: undefined
          })),
          tableDescription,
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Curated model saved successfully!");
        setSelectedCurated(modelName);
        // Refresh curated models in sidebar
        fetch("http://localhost:4000/curated-models").then(res => res.json()).then(data => setCuratedModels(data.models || []));
      } else {
        setSaveStatus(data.error || "Failed to save curated model.");
      }
    } catch (err) {
      setSaveStatus("Failed to save curated model: " + err.message);
    }
    setIsSaving(false);
  };

  // Download export logic
  const handleDownload = async (format = 'csv') => {
    if (!selectedCurated) {
      setSaveStatus("Please select a curated model first.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/curated-model/${selectedCurated}/export?format=${format}`);
      if (!response.ok) {
        const errorData = await response.json();
        setSaveStatus(errorData.error || "Failed to download data.");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCurated}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSaveStatus("Data downloaded successfully!");
    } catch (err) {
      setSaveStatus("Failed to download data: " + err.message);
    }
  };

  // Load curated model full data (table view style)
  const handleLoadCuratedData = async (fullData = false) => {
    if (!selectedCurated) {
      setSaveStatus("Please select a curated model first.");
      return;
    }
    setIsLoadingData(true);
    setDataError("");
    try {
      const limitParam = fullData ? 'all' : '1000';
      const res = await fetch(`http://localhost:4000/curated-model/${selectedCurated}/data?limit=${limitParam}`);
      const data = await res.json();
      if (data.error) {
        setDataError(data.error);
        setDataRows([]);
      } else {
        setDataRows(data.rows || []);
      }
    } catch (err) {
      setDataError("Failed to load curated data: " + err.message);
      setDataRows([]);
    }
    setIsLoadingData(false);
  };

  // When navigated with loadCuratedData flag, auto-load data table
  React.useEffect(() => {
    if (location.state && location.state.loadCuratedData) {
      const wantFull = !!location.state.fullData;
      handleLoadCuratedData(wantFull);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, selectedCurated]);

  const showTableOnly = (location.state && location.state.loadCuratedData && dataRows.length > 0) || false;

  if (showTableOnly) {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f6fa', padding: 0 }}>
        <h1 style={{ padding: '40px 0 0 40px' }}>Curated Model Data</h1>
        <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
          {dataError && <div style={{ color: 'red', marginBottom: 16 }}>{dataError}</div>}
          {isLoadingData && <div style={{ marginBottom: 16, color: '#666' }}>Loading...</div>}
          {dataRows.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ color: '#00b887', fontWeight: 700 }}>Showing curated table ({dataRows.length} rows)</div>
                <button
                  onClick={() => handleLoadCuratedData(true)}
                  style={{ padding: '8px 14px', fontSize: 14, background: '#4b5563', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                  disabled={isLoadingData}
                  title="Reload full curated table"
                >
                  Reload full table
                </button>
              </div>
              <div style={{ overflow: 'auto', maxHeight: 650 }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {Object.keys(dataRows[0] || {}).map(key => (
                        <th key={key} style={{ background: '#f7fafc', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #e4e9f2', position: 'sticky', top: 0, fontWeight: 600 }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataRows.map((row, idx) => (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? '#f7fafc' : '#fff', height: 28 }}>
                        {Object.values(row).map((val, i) => (
                          <td key={i} style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2', color: '#333', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!dataRows.length && !isLoadingData && (
            <div style={{ color: '#8f9bb3', fontSize: 14 }}>No data available.</div>
          )}
        </div>
      </div>
    );
  }

  // UI
  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', padding: 0 }}>
      <h1 style={{ padding: '40px 0 0 40px' }}>Curated Model Definition</h1>
      <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
          {/* Left: SQL Editor and Preview */}
          <div style={{ flex: 2, minWidth: 0, height: '100%' }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600 }}>Curated Model Name</label><br />
              <input
                type="text"
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                placeholder="e.g. curated_sales_summary"
                style={{ width: 400, fontSize: 16, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontWeight: 600 }}>SQL Query (use staging tables)</label><br />
              <textarea
                value={sqlInput}
                onChange={e => setSqlInput(e.target.value)}
                placeholder={"Write your SQL for the curated model here.\nExample: SELECT customer_id, COUNT(order_id) AS order_count FROM stg_order WHERE status = 'completed' GROUP BY customer_id;"}
                style={{ width: '100%', minHeight: 120, fontSize: 15, padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <button
                onClick={handlePreview}
                disabled={!sqlInput.trim() || isPreviewing}
                style={{ padding: '10px 24px', fontSize: 16, background: '#36f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, marginRight: 16 }}
              >
                {isPreviewing ? 'Previewing...' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                disabled={!modelName.trim() || !sqlInput.trim() || isSaving}
                style={{ padding: '10px 24px', fontSize: 16, background: '#00b887', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, marginRight: 16 }}
              >
                {isSaving ? 'Saving...' : 'Save Curated Model'}
              </button>
              <button
                onClick={() => {
                  if (selectedCurated) {
                    window.open(`http://localhost:4000/curated-model/${selectedCurated}/charts`, '_blank');
                  }
                }}
                disabled={!selectedCurated}
                style={{ padding: '10px 24px', fontSize: 16, background: '#667eea', color: '#fff', border: 'none', borderRadius: 6, cursor: !selectedCurated ? 'not-allowed' : 'pointer', fontWeight: 600, marginRight: 16 }}
              >
                View Charts
              </button>
              <button
                onClick={() => handleDownload('csv')}
                disabled={!selectedCurated}
                style={{
                  padding: '10px 24px',
                  fontSize: 16,
                  background: selectedCurated ? 'linear-gradient(90deg, #4b5563 0%, #1f2937 100%)' : '#94a3b8',
                  color: '#e5e7eb',
                  border: '1px solid #1f2937',
                  borderRadius: 8,
                  cursor: !selectedCurated ? 'not-allowed' : 'pointer',
                  fontWeight: 650,
                  marginRight: 16,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  transition: 'transform 0.08s ease, box-shadow 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (selectedCurated) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.22)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.18)';
                }}
                title="Download all query results as CSV file"
              >
                📥 Download Data
              </button>
              {saveStatus && <span style={{ marginLeft: 18, color: saveStatus.includes('success') ? '#00b887' : 'red', fontWeight: 600 }}>{saveStatus}</span>}
            </div>
            {previewError && <div style={{ color: 'red', marginBottom: 16 }}>{previewError}</div>}
            {previewRows.length > 0 && (
              <div style={{ marginTop: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 10 }}>
                <h3 style={{ marginTop: 0 }}>Preview Result (up to 100 rows)</h3>
                <div style={{ overflow: 'auto', maxHeight: 400 }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {Object.keys(previewRows[0]).map(key => (
                          <th key={key} style={{ background: '#f7fafc', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #e4e9f2', position: 'sticky', top: 0, fontWeight: 600 }}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#f7fafc' : '#fff', height: 28 }}>
                          {Object.values(row).map((val, i) => (
                            <td key={i} style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2', color: '#333', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {dataError && <div style={{ color: 'red', marginTop: 16 }}>{dataError}</div>}
          </div>
          {/* Right: Documentation Panel */}
          <div style={{ flex: 1.5, minWidth: 420, background: '#f7fafc', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 0, marginLeft: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ marginTop: 0 }}>Documentation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                {/* Table Description at the top */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Table Description</label>
                  <textarea
                    value={tableDescription}
                    onChange={e => setTableDescription(e.target.value)}
                    placeholder="Short description of the table..."
                    style={{ width: '100%', minHeight: 96, fontSize: 15, padding: 10, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
                  />
                </div>
                {/* Columns Table (scrollable, fills available space) */}
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: 0, minHeight: 0 }}>
                  {documentation.length > 0 ? (
                    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13, marginBottom: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Column Name</th>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Type</th>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Description</th>
                          <th style={{ background: '#e4e9f2', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #c5cee0', fontWeight: 600 }}>Test</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentation.map((col, idx) => (
                          <tr key={col.name + idx}>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2' }}>{col.name || col.source || col.original}</td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2' }}>{col.type}</td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2' }}>
                              <textarea
                                value={col.description || ""}
                                onChange={e => setDocumentation(prev => prev.map((c, i) => i === idx ? { ...c, description: e.target.value } : c))}
                                placeholder="Description..."
                                style={{ width: '100%', fontSize: 14, padding: 6, borderRadius: 4, border: '1px solid #ccc', minHeight: 48, resize: 'vertical' }}
                              />
                            </td>
                            <td style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2', minWidth: 120 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!col.testNull}
                                    onChange={() => handleTestCheckboxChange(idx, 'testNull')}
                                  />
                                  NULL
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                                  <input
                                    type="checkbox"
                                    checked={!!col.testUnique}
                                    onChange={() => handleTestCheckboxChange(idx, 'testUnique')}
                                  />
                                  Unique
                                </label>
                                {col.nullWarning && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{col.nullWarning}</div>}
                                {col.uniqueWarning && <div style={{ color: 'red', fontSize: 12, marginTop: 2 }}>{col.uniqueWarning}</div>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ color: '#8f9bb3', fontSize: 14 }}>No documentation generated yet. Click Preview to generate.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight sparkline SVG for live metrics
function Sparkline({ samples, field, width = 360, height = 90, color = '#60a5fa' }) {
  if (!samples || samples.length === 0) {
    return <div style={{ color: '#8f9bb3', fontSize: 12 }}>No data yet</div>;
  }
  const values = samples.map(s => s[field] || 0);
  const max = Math.max(...values) || 1;
  const min = Math.min(...values);
  const norm = values.map((v, idx) => {
    const x = (idx / Math.max(values.length - 1, 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ background: '#0b1224', borderRadius: 8 }}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={norm}
      />
    </svg>
  );
}

function PerformanceCompare({ curatedModels }) {
  const [selectedCurated, setSelectedCurated] = React.useState('');
  const [sqlInput, setSqlInput] = React.useState('');
  const [rowLimit, setRowLimit] = React.useState(10000);
  const [manualSamples, setManualSamples] = React.useState([]);
  const [dataflowSamples, setDataflowSamples] = React.useState([]);
  const [manualFinal, setManualFinal] = React.useState(null);
  const [dataflowFinal, setDataflowFinal] = React.useState(null);
  const [status, setStatus] = React.useState({ manual: 'idle', dataflow: 'idle' });
  const [error, setError] = React.useState('');
  const [loadingSql, setLoadingSql] = React.useState(false);

  React.useEffect(() => {
    if (!selectedCurated) return;
    setLoadingSql(true);
    fetch(`http://localhost:4000/curated-model/${selectedCurated}`)
      .then(res => res.json())
      .then(data => setSqlInput(data.sql || ''))
      .catch(() => setSqlInput(''))
      .finally(() => setLoadingSql(false));
  }, [selectedCurated]);

  const startStream = (runId, mode) => {
    const es = new EventSource(`http://localhost:4000/api/perf/${runId}/stream`);
    es.onmessage = (e) => {
      try {
        const sample = JSON.parse(e.data);
        if (mode === 'manual') {
          setManualSamples(prev => [...prev.slice(-199), sample]);
          if (sample.status === 'done' || sample.status === 'error' || sample.status === 'cancelled') {
            setManualFinal(sample);
            setStatus(s => ({ ...s, manual: sample.status }));
            es.close();
          }
        } else {
          setDataflowSamples(prev => [...prev.slice(-199), sample]);
          if (sample.status === 'done' || sample.status === 'error' || sample.status === 'cancelled') {
            setDataflowFinal(sample);
            setStatus(s => ({ ...s, dataflow: sample.status }));
            es.close();
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    es.onerror = () => es.close();
  };

  const fetchFinal = async (runId, mode) => {
    try {
      const res = await fetch(`http://localhost:4000/api/perf/${runId}`);
      const data = await res.json();
      if (mode === 'manual') setManualFinal(data.final || data.meta || data);
      else setDataflowFinal(data.final || data.meta || data);
    } catch (err) {
      console.error(err);
    }
  };

  const runMode = async (mode) => {
    try {
      setError('');
      if (mode === 'manual' && !sqlInput.trim()) {
        setError('Please provide SQL for manual run.');
        return;
      }
      const body = mode === 'manual'
        ? { sql: sqlInput, rowLimit }
        : { curatedName: selectedCurated, rowLimit };
      setStatus(s => ({ ...s, [mode]: 'running' }));
      if (mode === 'manual') {
        setManualSamples([]);
        setManualFinal(null);
      } else {
        setDataflowSamples([]);
        setDataflowFinal(null);
      }
      const url = mode === 'manual' ? 'http://localhost:4000/api/execute/manual' : 'http://localhost:4000/api/execute/dataflow';
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start run');
      const runId = data.runId;
      startStream(runId, mode);
      fetchFinal(runId, mode);
    } catch (err) {
      setError(err.message);
      setStatus(s => ({ ...s, [mode]: 'idle' }));
    }
  };

  const runBoth = () => {
    runMode('manual');
    if (selectedCurated) runMode('dataflow');
  };

  const summaryCard = (title, final, samples, color) => (
    <div style={{ background: '#0b1224', border: '1px solid #1f2937', borderRadius: 10, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.25)', flex: 1, minWidth: 280 }}>
      <div style={{ color: '#cbd5e1', fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', gap: 16, color: '#e2e8f0', fontSize: 14 }}>
        <div><div style={{ color: '#94a3b8', fontSize: 12 }}>Elapsed</div><div style={{ fontWeight: 700 }}>{final?.elapsedMs ? final.elapsedMs.toFixed(2) : '—'} ms</div></div>
        <div><div style={{ color: '#94a3b8', fontSize: 12 }}>CPU (user/sys)</div><div style={{ fontWeight: 700 }}>{final?.cpuUserMs ? final.cpuUserMs.toFixed(1) : '—'} / {final?.cpuSystemMs ? final.cpuSystemMs.toFixed(1) : '—'} ms</div></div>
        <div><div style={{ color: '#94a3b8', fontSize: 12 }}>Rows</div><div style={{ fontWeight: 700 }}>{final?.rowsProcessed ?? '—'}</div></div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Sparkline samples={samples} field="elapsedMs" color={color} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: 32, background: 'linear-gradient(135deg, #111827 0%, #0b1224 100%)', minHeight: '100vh', color: '#e2e8f0' }}>
      <h1 style={{ marginTop: 0, marginBottom: 8 }}>Performance Compare</h1>
      <p style={{ color: '#94a3b8', marginTop: 0 }}>Run manual SQL vs curated DataFlow with live time & CPU metrics.</p>
      {error && <div style={{ color: '#f87171', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, alignItems: 'stretch' }}>
        <div style={{ background: '#0b1224', border: '1px solid #1f2937', borderRadius: 12, padding: 16, boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Curated Model</div>
              <select value={selectedCurated} onChange={e => setSelectedCurated(e.target.value)} style={{ padding: 8, minWidth: 220, borderRadius: 6, border: '1px solid #1f2937', background: '#111827', color: '#e2e8f0' }}>
                <option value="">-- Optional: select curated model --</option>
                {curatedModels.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Row limit</div>
              <input type="number" value={rowLimit} onChange={e => setRowLimit(Number(e.target.value))} style={{ width: 120, padding: 8, borderRadius: 6, border: '1px solid #1f2937', background: '#111827', color: '#e2e8f0' }} />
            </div>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 4 }}>SQL {selectedCurated ? '(locked to curated model)' : '(editable for manual run)'}</div>
          <textarea
            value={sqlInput}
            onChange={e => setSqlInput(e.target.value)}
            readOnly={!!selectedCurated}
            placeholder="Paste or type SQL..."
            style={{ width: '100%', minHeight: 160, borderRadius: 8, border: '1px solid #1f2937', background: '#0f172a', color: '#e2e8f0', padding: 12 }}
          />
          {loadingSql && <div style={{ color: '#94a3b8', marginTop: 6 }}>Loading curated SQL…</div>}
          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            <button onClick={() => runMode('manual')} disabled={status.manual === 'running'} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#0b1224', fontWeight: 700, cursor: 'pointer' }}>Run Manual</button>
            <button onClick={() => runMode('dataflow')} disabled={!selectedCurated || status.dataflow === 'running'} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: selectedCurated ? '#60a5fa' : '#334155', color: '#0b1224', fontWeight: 700, cursor: selectedCurated ? 'pointer' : 'not-allowed' }}>Run DataFlow</button>
            <button onClick={runBoth} disabled={!selectedCurated || status.manual === 'running' || status.dataflow === 'running'} style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid #1f2937', background: '#e2e8f0', color: '#0b1224', fontWeight: 700, cursor: selectedCurated ? 'pointer' : 'not-allowed' }}>Run Both</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#0b1224', border: '1px solid #1f2937', borderRadius: 12, padding: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}>
            <div style={{ color: '#cbd5e1', fontWeight: 700, marginBottom: 8 }}>Live Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div style={{ background: '#111827', padding: 10, borderRadius: 8, border: '1px solid #1f2937' }}>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>Manual elapsed</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{manualSamples.at(-1)?.elapsedMs?.toFixed(1) || '—'} ms</div>
              </div>
              <div style={{ background: '#111827', padding: 10, borderRadius: 8, border: '1px solid #1f2937' }}>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>Manual CPU</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{manualSamples.at(-1)?.cpuUserMs?.toFixed(1) || '—'} / {manualSamples.at(-1)?.cpuSystemMs?.toFixed(1) || '—'} ms</div>
              </div>
              <div style={{ background: '#111827', padding: 10, borderRadius: 8, border: '1px solid #1f2937' }}>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>DataFlow elapsed</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{dataflowSamples.at(-1)?.elapsedMs?.toFixed(1) || '—'} ms</div>
              </div>
              <div style={{ background: '#111827', padding: 10, borderRadius: 8, border: '1px solid #1f2937' }}>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>DataFlow CPU</div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{dataflowSamples.at(-1)?.cpuUserMs?.toFixed(1) || '—'} / {dataflowSamples.at(-1)?.cpuSystemMs?.toFixed(1) || '—'} ms</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {summaryCard('Manual run', manualFinal, manualSamples, '#22c55e')}
            {summaryCard('DataFlow run', dataflowFinal, dataflowSamples, '#60a5fa')}
          </div>
          <div style={{ background: '#0b1224', border: '1px solid #1f2937', borderRadius: 12, padding: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.35)' }}>
            <div style={{ color: '#cbd5e1', fontWeight: 700, marginBottom: 8 }}>Comparison</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, color: '#e2e8f0', fontSize: 14 }}>
              <div><div style={{ color: '#94a3b8', fontSize: 12 }}>Elapsed (ms)</div><div style={{ fontWeight: 800 }}>{manualFinal?.elapsedMs?.toFixed(1) || '—'} vs {dataflowFinal?.elapsedMs?.toFixed(1) || '—'}</div></div>
              <div><div style={{ color: '#94a3b8', fontSize: 12 }}>CPU user (ms)</div><div style={{ fontWeight: 800 }}>{manualFinal?.cpuUserMs?.toFixed(1) || '—'} vs {dataflowFinal?.cpuUserMs?.toFixed(1) || '—'}</div></div>
              <div><div style={{ color: '#94a3b8', fontSize: 12 }}>CPU system (ms)</div><div style={{ fontWeight: 800 }}>{manualFinal?.cpuSystemMs?.toFixed(1) || '—'} vs {dataflowFinal?.cpuSystemMs?.toFixed(1) || '—'}</div></div>
              <div><div style={{ color: '#94a3b8', fontSize: 12 }}>Rows processed</div><div style={{ fontWeight: 800 }}>{manualFinal?.rowsProcessed ?? '—'} vs {dataflowFinal?.rowsProcessed ?? '—'}</div></div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              {manualFinal?.reportPath && <a href={`http://localhost:4000/performance-reports/${manualFinal.reportPath}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>Manual report</a>}
              {dataflowFinal?.reportPath && <a href={`http://localhost:4000/performance-reports/${dataflowFinal.reportPath}`} target="_blank" rel="noreferrer" style={{ color: '#60a5fa' }}>DataFlow report</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarStagings, setSidebarStagings] = useState([]);
  const [curatedModels, setCuratedModels] = useState([]); // List of curated model names
  const [selectedCurated, setSelectedCurated] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/tables")
      .then(res => res.json())
      .then(tableList => {
        setTables(tableList);
        // Auto-select 'data(1)' if it exists
        if (tableList.includes('data(1)')) {
          setSelectedTable('data(1)');
        }
      })
      .catch(() => setError("Could not fetch tables from backend."));
    // Fetch stagings for sidebar
    fetch("http://localhost:4000/stagings")
      .then(res => res.json())
      .then(data => setSidebarStagings(data.stagings || []))
      .catch(() => {
        // Silently fail - backend might not be running yet
        setSidebarStagings([]);
      });
    // Fetch curated models for sidebar
    fetch("http://localhost:4000/curated-models")
      .then(res => res.json())
      .then(data => setCuratedModels(data.models || []))
      .catch(() => {
        // Silently fail - backend might not be running yet
        setCuratedModels([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
    setLoading(true);
    setError("");
    fetch(`http://localhost:4000/table/${selectedTable}`)
      .then(res => res.json())
      .then(data => {
        setTableData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not fetch table data.");
        setLoading(false);
      });
  }, [selectedTable]);

  // In App component, expose setTables globally for Staging to use
  useEffect(() => {
    window.setTables = setTables;
    return () => { delete window.setTables; };
  }, [setTables]);

  // In App component, expose setSidebarStagings globally for sidebar delete to use
  useEffect(() => {
    window.setSidebarStagings = setSidebarStagings;
    return () => { delete window.setSidebarStagings; };
  }, [setSidebarStagings]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={
          <>
            <SidebarNavWrapper
              tables={tables}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              sidebarStagings={sidebarStagings}
              curatedModels={curatedModels}
              setSelectedCurated={setSelectedCurated}
              selectedCurated={selectedCurated}
            />
            <main style={{ flex: 1, marginLeft: 220 }}>
              <Routes>
                <Route index element={
                  <div style={{ padding: 40 }}>
                    <header style={{ marginBottom: 32 }}>
                      <h1 style={{ fontSize: 32, color: '#222b45', margin: 0 }}>SQLite Database Viewer</h1>
                      <p style={{ color: '#8f9bb3', marginTop: 8 }}>Select a table from the sidebar to view its data.</p>
                    </header>
                    {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
                    {!selectedTable && (
                      <div style={{ color: '#8f9bb3', fontSize: 18, marginTop: 80, textAlign: 'center' }}>
                        <span>Click a table name on the left to view its data.</span>
                      </div>
                    )}
                    {selectedTable && (
                      <>
                        <div style={{ marginBottom: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 20, display: 'inline-block' }}>
                          <h2 style={{ margin: 0, color: '#00b887', fontSize: 22 }}>{selectedTable}</h2>
                          <span style={{ color: '#8f9bb3', fontSize: 14 }}>Rows: {tableData.length}</span>
                        </div>
                        {loading && <p>Loading table data...</p>}
                        {!loading && tableData.length === 0 && (
                          <p style={{ color: '#8f9bb3' }}>No data in this table.</p>
                        )}
                        {tableData.length > 0 && (
                          <div style={{ overflow: 'auto', maxHeight: 600, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 10 }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
                              <thead>
                                <tr>
                                  {Object.keys(tableData[0] || {}).map(key => (
                                    <th key={key} style={{ background: '#f7fafc', color: '#222b45', padding: '4px 6px', borderBottom: '2px solid #e4e9f2', position: 'sticky', top: 0, fontWeight: 600 }}>{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.map((row, idx) => (
                                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#f7fafc' : '#fff', height: 28 }}>
                                    {Object.values(row).map((val, i) => (
                                      <td key={i} style={{ padding: '4px 6px', borderBottom: '1px solid #e4e9f2', color: '#333', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                } />
                <Route path="staging" element={<Staging />} />
                <Route path="curated" element={<CuratedModel curatedModels={curatedModels} setCuratedModels={setCuratedModels} selectedCurated={selectedCurated} setSelectedCurated={setSelectedCurated} />} />
                <Route path="perf" element={<PerformanceCompare curatedModels={curatedModels} />} />
                {/* Optionally, add /curated/:name route for direct linking */}
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
