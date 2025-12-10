# UCHIMI: Пълно обяснение на проекта

## Вводна част — какво е Uchimi?

**Uchimi** е платформа за управление на данни с три основни слоя:
1. **Raw данни** — база данни (SQLite) с оригинални таблици (Employee, Order, Product, etc.)
2. **Staging слой** — преобработени и преименувани таблици (stg_employee, stg_order, etc.)
3. **Curated слой** — финални, комбинирани модели с бизнес логика (curated_employee_order, curated_product_inventory)

Вие лично работиш с curated моделите и диаграмите, но основната идея е да трансформираш суровите данни в разбираеми, визуализирани отчети.

---

## Ч.1: БАЗА ДАННИ И ДАННИ

### Каква е базата?
- **Файл:** `northwind_small.sqlite` (в корена на проекта)
- **Формат:** SQLite — лека, вградена база за разработка
- **Таблици:** Employee, Order, Product, Customer, Region, Shipper, OrderDetail, Category, Territory, etc.
- **Данни:** Типичната Northwind demo база (компания, която продава хранителни продукти)

### Как функционира слоистата архитектура?

```
Raw Database (Employee, Order, Product, ...)
       ↓ (SQL преобработка)
Staging Layer (stg_employee, stg_order, stg_product, ...)
       ↓ (JOIN, SELECT, бизнес логика)
Curated Layer (curated_employee_order, curated_product_inventory, ...)
       ↓ (Backend изпълнение)
Frontend визуализация / Диаграми
```

### Staging слой — какво прави?
Примерен файл: `models/staging/stg_employee.sql`
```sql
SELECT
  Id AS employee_id,
  LastName AS last_name,
  FirstName AS first_name,
  Title AS job_title,
  City,
  Country
FROM Employee
WHERE Photo IS NULL
```

**Какво се случва:**
- Взема данни от таблица `Employee` в базата.
- Преименува колоните на по-четливи имена (Id → employee_id).
- Добавя филтри (WHERE Photo IS NULL).
- Резултатът е логична таблица `stg_employee` (съхранена като SQL, НЕ физическа таблица).

**Защо?** За да отделим трансформациите от суровите данни и да улеснявам повторното използване.

### Curated слой — комбинирането

Примерен файл: `models/curated/curated_employee_order.sql`
```sql
SELECT
    o.id AS order_id,
    o.customer_id,
    o.order_date,
    o.freight,
    e.employee_id,
    e.last_name,
    e.first_name,
    e.job_title
FROM stg_employee e
JOIN stg_order o
  ON e.employee_id = o.employee_id;
```

**Какво се случва:**
- Комбинира два staging слоя (stg_employee + stg_order) чрез JOIN.
- Избира конкретни колони за анализ.
- Резултатът е "curated_employee_order" — данни за служители и техните поръчки.

**Ключова идея:** curated моделите са готови за анализ, визуализация, и отчетност.

---

## Ч.2: BACKEND (Node.js + Express)

### Архитектура

Файл: `backend/server.js` е центъра. То е Express сървър, който:
1. Стартира на порт 4000.
2. Има REST API endpoints.
3. Конектира се към SQLite базата.
4. Изпълнява SQL от staging/curated моделите.
5. Генерира диаграми и отчети.

### Ключовите endpoints (API)

#### 1. `GET /tables`
**Какво прави:** връща списък на всички таблици в базата.

```
GET http://localhost:4000/tables
Response: ["Employee", "Order", "Product", "Customer", ...]
```

**Използват се за:** фронтенд да знае какво има в базата.

#### 2. `GET /table/:name`
**Какво прави:** взима ВСЕ редове от определена таблица.

```
GET http://localhost:4000/table/Employee
Response: [
  { Id: 1, LastName: "Davolio", FirstName: "Nancy", ... },
  { Id: 2, LastName: "Fuller", FirstName: "Andrew", ... },
  ...
]
```

**Забележка:** за големи таблици това е опасно (памет). Обикновено се използва за preview.

#### 3. `POST /preview-staging-sql`
**Какво прави:** преглед на SQL резултат (максимално 100 редове).

```
POST /preview-staging-sql
Body: { "sql": "SELECT * FROM stg_employee LIMIT 10" }
Response: { "rows": [...] }
```

**Използват се за:** бързо преглед без да вземем全部 данни.

#### 4. `POST /curated-models` ⭐ КЛЮЧОВО
**Какво прави:** запазва НОВИ curated модел и генерира диаграми.

```
POST /curated-models
Body: {
  "name": "curated_employee_order",
  "sql": "SELECT ... FROM stg_employee JOIN stg_order ...",
  "documentation": [
    { "name": "order_id", "type": "number" },
    { "name": "last_name", "type": "string" },
    ...
  ]
}
Response: {
  "success": true,
  "chartsGenerated": true,
  "chartsPath": "curated_employee_order_charts.html",
  "preview": [rows]
}
```

**Процесът вътре:**
1. Backend приема JSON с SQL и метаданни (документация на колоните).
2. Изпълнява SQL срещу SQLite — взема до `FULL_CHART_ROWS` редове (default 10000).
3. Вика `chartGenerator.js` с редовете и метаданните.
4. Chart generator анализира данните и решава какви диаграми да направи.
5. Генерира HTML страна с Chart.js кода.
6. Записва HTML файла на диск: `models/curated/metadata/curated_employee_order_charts.html`.
7. Обновява JSON метаданни със `chartsPath`.
8. Връща успех.

#### 5. `GET /curated-model/:name`
**Какво прира:** връща метаданни на curated модел.

```
GET /curated-model/curated_employee_order
Response: { "name": "...", "sql": "...", "documentation": [...], "chartsPath": "..." }
```

#### 6. `GET /curated-model/:name/charts`
**Какво прави:** отваря генерирания HTML отчет в браузър.

```
GET /curated-model/curated_employee_order/charts
Response: (статичен HTML файл)
```

#### 7. `POST /curated-model/:name/regenerate-charts`
**Какво прави:** преработва диаграмите за вече съществуващ curated модел.

```
POST /curated-model/curated_employee_order/regenerate-charts
Body: {}
Response: { success: true, chartsPath: "..." }
```

**Процесът:** същия като POST /curated-models, но само пункт 2–7 (не създава нов модел).

### Как работи SQL изпълнението в backend?

```javascript
const db = new sqlite3.Database(DB_PATH);
db.all(sql, (err, rows) => {
  if (err) return res.status(500).json({ error: err.message });
  res.json({ rows });
});
db.close();
```

**Стъпки:**
1. Отвори conexion към базата.
2. Изпълни SQL (`db.all` връща всички редове).
3. Ако има грешка, верни я. Иначе верни редовете.
4. Затвори conexion.

### Конфигурация — `FULL_CHART_ROWS`

```javascript
const FULL_CHART_ROWS = process.env.FULL_CHART_ROWS ? Number(process.env.FULL_CHART_ROWS) : 10000;
```

Това променливо управлява колко редове да се вземат за диаграмите:
- Default: 10000 редове.
- Може да се настрои чрез env var: `FULL_CHART_ROWS=5000 node server.js`.

**Защо капачка?**
- Памет: 100,000+ редове = много памет при обработка.
- Производителност: диаграмите с милиони точки са бавни в браузър.
- Баланс: 10,000 е достатъчно да представи данните, но не е прекомерно.

---

## Ч.3: CHART GENERATOR (Диаграмите)

Файл: `backend/chartGenerator.js`

### Три основни функции

#### 1. `generateCharts(name, rows, documentation)`
**Вход:**
- `name`: име на модела (str)
- `rows`: масив от редове от SQL (array)
- `documentation`: метаданни на колоните (array), всяка със `{ name, type }`

**Алгоритъм:**
- За всяка колона определи типа: number, string, или date.
- Numeric колони → histogram/distribution.
- String колони → pie chart (категорийност).
- Date колони → timeline (линейна).
- Множество numeric → correlation radar.

**Изход:** массив от дескриптори (объекти с `type`, `title`, `data`, etc.)

Пример:
```javascript
[
  {
    type: 'distribution',
    title: 'freight Distribution',
    column: 'freight',
    stats: { min: 10, max:500, avg: 250, count: 830 }
  },
  {
    type: 'category',
    title: 'job_title Distribution',
    data: { "Sales Manager": 45, "Sales Representative": 785, ... }
  }
]
```

#### 2. `generateHTMLReport(name, rows, documentation, charts)`
**Вход:** име, редове, метаданни, диаграмни дескриптори.

**Какво прави:**
1. За всяка диаграма, изчисли данните (bins за histogram, counts за категории, и т.н.).
2. Съставя HTML страна с:
   - Header с име на модела.
   - Статистики (Total Rows, Columns).
   - Canvas елементи (за всяка диаграма).
   - Вграден JavaScript, който инициализира Chart.js с данните.

**Изход:** един дълг HTML string.

Структура на HTML:
```html
<!DOCTYPE html>
<html>
  <head>
    <title>curated_employee_order - Data Charts</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- CSS и стилове -->
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>curated_employee_order</h1>
        <p>Generated on 2025-12-08</p>
      </div>
      <div class="content">
        <div class="stats">
          <div class="stat-card">
            <label>Total Rows</label>
            <value>830</value>
          </div>
          <div class="stat-card">
            <label>Columns</label>
            <value>19</value>
          </div>
        </div>
        <div class="charts">
          <div class="chart-container">
            <canvas id="chart-0"></canvas>
          </div>
          <!-- още canvas елементи -->
        </div>
      </div>
    </div>
    <script>
      // Chart.js инициализация:
      new Chart(document.getElementById('chart-0'), {
        type: 'bar',
        data: {
          labels: ['10-50', '50-100', '100-150', ...],
          datasets: [{
            label: 'freight',
            data: [45, 120, 200, ...],
            backgroundColor: 'rgba(75, 192, 192, 0.7)'
          }]
        },
        options: { ... }
      });
    </script>
  </body>
</html>
```

#### 3. `saveCharts(name, chartsHtml, chartsDir)`
**Вход:** име, HTML string, директория.

**Какво прави:**
1. Проверки дали директорията съществува (ако не, я създава).
2. Записва HTML на диск: `chartsDir/curated_employee_order_charts.html`.
3. Връща пътя на файла.

```javascript
function saveCharts(name, chartsHtml, chartsDir) {
  if (!fs.existsSync(chartsDir)) {
    fs.mkdirSync(chartsDir, { recursive: true });
  }
  const chartsPath = path.join(chartsDir, `${name}_charts.html`);
  fs.writeFileSync(chartsPath, chartsHtml);
  return chartsPath;
}
```

---

## Ч.4: FRONTEND (React)

Файл: `giiho-frontend/src/App.js`

### Структура

Frontend е React SPA (single-page app) с няколко страни:
1. **Landing page** — въвеждане, дизайн с "data pipeline" визуализация.
2. **Main app** — таблица с curated модели и бутон "View Charts".
3. **Outros** — справка, нагласки.

### Ключови компоненти

#### Landing Page (`LandingPage` компонент)
- Показва красива дизайна с 5 кръглни възли: Raw, Transform, Model, Quality Check, Results.
- При клик "Get Started" преминава в главното приложение.

#### Main App (`function App`)
- Списък на всички curated модели (взема се от backend).
- За всеки модел: име, SQL preview, бутони (View Charts, Edit, Delete).
- Клик на "View Charts" отваря `http://localhost:4000/curated-model/{name}/charts` в нов таб.

#### Как се комуникира с backend?

Пример — взимане на curated модели:
```javascript
const [models, setModels] = useState([]);

useEffect(() => {
  fetch('http://localhost:4000/curated-models')
    .then(res => res.json())
    .then(data => setModels(data))
    .catch(err => console.error(err));
}, []);
```

Процес:
1. React се зарежда.
2. `useEffect` се изпълнява един път.
3. Прави `fetch` към backend `/curated-models`.
4. Backend връща масив от модели.
5. React актуализира state (`setModels`) и преред компонентата.

### Поток при клик "View Charts"
```javascript
const openCharts = (modelName) => {
  window.open(`http://localhost:4000/curated-model/${modelName}/charts`, '_blank');
};
```

1. При клик, JavaScript отваря нов таб.
2. URL е към backend endpoint `/curated-model/{name}/charts`.
3. Backend връща статичния HTML файл.
4. Браузърът го показва със всички Chart.js диаграми.

---

## Ч.5: ПЪЛНА DATA FLOW (от база до браузър)

### Сценарий: Създаване и преглед на curated модел

```
ЭТАП 1: Подготовка
├─ Разработчик създава models/curated/curated_employee_order.sql
└─ Разработчик създава models/curated/metadata/curated_employee_order.json

ЭТАП 2: Предаване към backend
├─ Frontend/скрипт: POST /curated-models
├─ Body: { name, sql, documentation }

ЭТАП 3: SQL Изпълнение (backend)
├─ server.js: открива conexion към northwind_small.sqlite
├─ Изпълнява SQL: SELECT ... FROM stg_employee JOIN stg_order ...
├─ SQLite връща РЕДОВЕ (830 редове за этот примера)
└─ Backend събира редовете в массив

ЭТАП 4: Генериране на диаграми (backend)
├─ chartGenerator.js::generateCharts()
│  ├─ Анализира типове колони
│  ├─ Открива 19 колони (numbers, strings, dates)
│  └─ Връща 3 диаграмни дескриптора
├─ chartGenerator.js::generateHTMLReport()
│  ├─ За distribution диаграма: binning на "freight"
│  ├─ За category диаграма: count на "job_title"
│  ├─ Съставя HTML със Chart.js инициализация
│  └─ Връща 50KB HTML string
└─ chartGenerator.js::saveCharts()
   ├─ Проверява models/curated/metadata/
   ├─ Записва curated_employee_order_charts.html (50KB файл)
   └─ Връща пътя

ЭТАП 5: Обновление на метаданни (backend)
├─ server.js обновява curated_employee_order.json
├─ Добавя поле: "chartsPath": "curated_employee_order_charts.html"
└─ Response към frontend: { success: true, chartsPath: "..." }

ЭТАП 6: Фронтенд получава отговор
├─ React вижда chartsGenerated: true
├─ Показва успешно съобщение
└─ Обновява UI списък на моделите

ЭТАП 7: Потребител преглежда диаграми
├─ Потребител кликва "View Charts" в frontend
├─ Frontend отваря нов таб с URL:
│  └─ http://localhost:4000/curated-model/curated_employee_order/charts
├─ Backend връща estatичния HTML файл
├─ Браузърът го показва
└─ Chart.js инициализира в браузър и рисува диаграмите

ФИНАЛ: Визуализация
└─ Пользователь вижда:
   ├─ Header с име на модела
   ├─ Статистики (830 редове, 19 колони)
   ├─ 3 интерактивни диаграми с Chart.js
   └─ Может да хвърли мишата над диаграмите за детайли
```

---

## Ч.6: ВАЖНИ ФАЙЛОВИ ПЪТЕКИ И ЛОГИКА

### Папкова структура (кратко)

```
Uchimi/
├── backend/
│   ├── server.js           ← главния Express сървър
│   ├── chartGenerator.js   ← генериране на HTML и диаграми
│   ├── regenerate-all-charts.js  ← пакетна регенериране
│   ├── save-curated-model.js     ←助手 скрипт за тестване
│   └── package.json
├── giiho-frontend/
│   ├── src/
│   │   ├── App.js          ← главния React компонент
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── models/
│   ├── staging/
│   │   ├── stg_employee.sql
│   │   ├── stg_order.sql
│   │   ├── stg_order_detail.sql
│   │   ├── stg_product.sql
│   │   └── ... (много други)
│   └── curated/
│       ├── curated_employee_order.sql
│       ├── curated_product_inventory.sql
│       └── metadata/
│           ├── curated_employee_order.json
│           ├── curated_employee_order_charts.html  ← генериран!
│           ├── curated_product_inventory.json
│           └── curated_product_inventory_charts.html  ← генериран!
├── northwind_small.sqlite  ← базата
└── docs/
    ├── overview/FINAL_REPORT.md
    ├── deployment/DEPLOYMENT_READY.md
    └── user/README_CHARTS.md
```

### Редовни операции

#### При добавяне на НОВ curated модел:
1. Разработчик създава `models/curated/my_model.sql`.
2. Разработчик създава `models/curated/metadata/my_model.json`.
3. Разработчик пуска: `node backend/save-curated-model.js`.
4. Backend генерира диаграмите и записва `my_model_charts.html`.

#### При редакция на СЪЩЕСТВУВАЩ модел:
1. Редактирай `curated_*.sql` или `metadata/*.json`.
2. Пуски регенериране:
   ```powershell
   cd backend
   node regenerate-all-charts.js
   ```
3. Скриптът преглежда всички JSON файлове в `metadata/`, пуска техния SQL и ако има редове, генерира диаграмите наново.

---

## Ч.7: КЛЮЧОВИ РЕШЕНИЯ И ЗАЩО

### 1. Защо SQLite?
- Лека база за разработка и demo.
- Не е нужен отделен database server.
- Лесна за deployment (един файл).
- За продукция: замени с PostgreSQL/MySQL чрез нов client.

### 2. Защо статични HTML отчети?
- Генерира се веднъж, сервира се много пъти.
- Никъ динамична логика в браузър.
- Лесно кеширане и sharing.
- Альтернатива: динамично генериране всеки път (бавно).

### 3. Защо Chart.js (CDN)?
- Нема нужда да инсталираш пакет.
- CDN значи быстро зареди.
- Лесно да добавиш нови типове диаграми.

### 4. Защо staging слой?
- Разделяй трансформациите от суровите данни.
- Повторна употреба на преобработените таблици.
- Лесно управление на версиите.

### 5. Защо curated слой?
- Финални, готови-за-анализ данни.
- Бизнес логика в един регистър (SQL).
- Лесна документация и тестване.

---

## Ч.8: ОТ ПРАКТИЧЕСКА ГЛЕДНА ТОЧКА

### Как да пускаш локално

**Терминал 1 — Backend:**
```powershell
cd C:\Users\HP\Desktop\Uchimi\backend
node server.js
# Вижаш: "Server running on http://localhost:4000"
```

**Терминал 2 — Frontend:**
```powershell
cd C:\Users\HP\Desktop\Uchimi\giiho-frontend
npm install  # ако не е инсталирано
npm start
# Вижаш: браузър отваря http://localhost:3000
```

**Проверка:**
- Отвори http://localhost:3000 в браузър.
- Кликни "Get Started".
- Видя таблица на curated модели.
- Кликни "View Charts" за един модел.

### Какво кажи при презентация

**Вводна реч (30 секунди):**
"Uchimi е система за управление на данни с три слоя. Сирови данни влизат през staging, където ги трансформираме, след това комбинираме в curated модели. Всеки curated модел има SQL дефиниция и автоматично генериране на диаграми. Диаграмите са статични HTML отчети, направени от React frontend, който се комуникира със Express backend."

**Архитектурно (1 минута):**
"Базата е SQLite файл. Backend е Node + Express на порт 4000. Той има API endpoints за преглед на таблици, preview на SQL, и създаване на curated модели. Когато запазиш curated модел, backend изпълнява SQL, взема полните редове, анализира типовете колони, генерира подходящи диаграми и записва HTML файл. Frontend е React приложение, което показва списък на моделите и бутон за преглед на диаграмите."

**Live demo (2 минути):**
1. Покажи `models/curated/curated_employee_order.sql` — обясни как се комбинира employee и order.
2. Покажи `models/curated/metadata/curated_employee_order.json` — обясни типовете колони.
3. Пусни `node regenerate-all-charts.js` — покажи конзолата генерирайки диаграмите (830 редове, 3 диаграми, файл записан).
4. Отвори браузъра → localhost:3000 → View Charts → покажи диаграмите.

---

## Ч.9: ТИПИЧНИ ВЪПРОСИ ПРИ ЗАЩИТА

### Q1: "Кой извършва SQL?"
**A:** Backend Node.js server открива conexion към SQLite файла и изпълнява SQL. Всички трансформации на данни се случват на сървър.

### Q2: "Какво, ако модела е много голям?"
**A:** Имаме капачка `FULL_CHART_ROWS` (default 10,000). Ако таблицата е по-голяма, графиката се создава от първите 10K редове. За по-голями таблици се препоръчва агрегация в SQL (GROUP BY).

### Q3: "Как се пази данни?"
**A:** Метаданни в JSON файлове, диаграмни HTML в `metadata/` папка. За продукция, използвай база за метаданни.

### Q4: "Може ли да редактирам диаграмите?"
**A:** Диаграмите се генерират автоматично от типовете колони. За персонализирани диаграми, трябва да модифицираш `chartGenerator.js` и да добавиш нови типове.

### Q5: "Как да добавя нов modell?"
**A:** 
1. Създай `.sql` файл в `models/curated/`.
2. Създай `.json` метаданни в `models/curated/metadata/`.
3. Пусни `node regenerate-all-charts.js` или POST към `/curated-models`.

### Q6: "Има ли версионане?"
**A:** Git repo отслежда SQL файлове. Всяка версия на модела е в Git история. За данни, нямаме snapshot, само текущите диаграмни HTML.

### Q7: "Как мога да го scale-ам?"
**A:** 
- Замени SQLite с PostgreSQL/MySQL.
- Добави authentication и authorization.
- Кеширай генерираните диаграми.
- Добави queue система (Bull, Celery) за асинхронна обработка на големи модели.
- Миграция на frontend към TypeScript, добавяне на tests.

---

## РЕЗЮМЕ

| Компонент | Технология | Отговорност |
|-----------|-----------|-----------|
| База | SQLite | Съхранение на сирови и преобработени данни |
| Backend | Node.js + Express | API, SQL изпълнение, генериране на диаграми |
| Chart Logic | JavaScript (chartGenerator.js) | Анализ на данни, HTML съставяне |
| Frontend | React | UI, списък на модели, отваряне на диаграмата |
| Диаграми | Chart.js (CDN) | Рисуване на интерактивни графики |
| Съхранение на отчети | Static HTML | Кеширане и sharing на генерирани диаграми |

**Главния поток:** Raw DB → Staging SQL → Curated SQL → Backend SQL Execution → Chart Generation → Static HTML → Frontend Display → Браузър.

Хайде! Вече имаш пълно разбиране на проекта. При презентация говори спокойно и помни: **главното е данни → обработка → визуализация**.

