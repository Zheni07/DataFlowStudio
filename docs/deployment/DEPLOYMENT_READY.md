Data Charts — Deployment Guide

Status: Ready for deployment

Purpose
This document lists the minimal steps to deploy the data charts feature, verify it is running, and perform a basic smoke test.

Prerequisites
- Node.js installed on the server.
- The repository with the `backend` and `giiho-frontend` folders checked out.
- No additional npm packages are required; Chart.js is referenced from a CDN.

Deployment steps
1. Backend
   - Change to the `backend` directory.
   - Start the backend service: `node server.js` (or use your system service manager to run it in the background).
2. Frontend
   - Change to `giiho-frontend` and start the frontend with `npm start` (or your chosen build/deploy process).
3. Verify
   - Visit the frontend at its local address (commonly `http://localhost:3000`).
   - Create or select a curated model and save it. Confirm the server response includes a `chartsPath` value.
   - Open `http://localhost:4000/curated-model/{model_name}/charts` to see the generated HTML report.

Smoke test checklist
- Backend responds at `/tables` and `/curated-model/{name}`.
- Saving a curated model returns `chartsGenerated: true` when preview has rows.
- Generated `models/curated/metadata/{name}_charts.html` exists and is readable.

Troubleshooting
- If charts are not generated check server logs for messages related to chart generation.
- If `chartsGenerated` is false, ensure the preview returned rows (preview limit is 100 rows).
- If the generated HTML loads slowly, confirm Chart.js CDN is reachable.

Notes
- No database or schema changes are required.
- Charts are static HTML; they can be served by any static file server once generated.
