Charts Feature — User Guide

Overview
This feature automatically generates interactive charts when you save a curated model. The charts are saved as static HTML and can be opened in a new browser tab.

How to use
1. In the application UI, go to the Curated Models section.
2. Create a new model or edit an existing one. Enter a name and your SQL query.
3. Click Preview to confirm the query returns rows.
4. Click Save Curated Model. When preview data exists, charts are generated automatically.
5. Click the View Charts button to open the generated report in a new tab.

What the charts show
- Numeric columns produce distributions (histograms).
- Categorical columns produce breakdowns (pie charts).
- Date/time columns produce timeline charts when appropriate.
- Multi-column numeric comparisons may render as small comparison charts.

Common problems
- Error: "Charts not found" — The model was saved before charts were available, or preview returned zero rows. Regenerate charts by saving the model again.
- Empty preview — Preview uses up to 100 rows. Confirm your SQL returns data.
- CDN errors — Chart.js is loaded from the public CDN; check network connectivity if charts fail to render.

Advanced
- Regenerate all charts: run the backend utility `node regenerate-all-charts.js` from the `backend` folder.
- Manually regenerate a single model using the endpoint `POST /curated-model/{name}/regenerate-charts`.

Support
If you need help, open an issue with steps to reproduce and include the model name and SQL.
