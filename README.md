# A Story of LLMs Evolution

Data storytelling for the rise of Large Language Models. Frontend renders interactive D3 visuals, backend aggregates MongoDB collections, everything ships in a MERN stack.

## 🚀 Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React 18, Vite, React Router DOM, D3.js v7
- Styling: CSS Modules, Kelvinch font, dark-first theme

## 📦 Prerequisites

- Node.js 18+
- npm (bundled with Node)
- MongoDB instance (local or Atlas)
- Git

## ⚙️ Setup

```bash
git clone <repository-url>
cd a-story-of-LLMs-evolution
```
# Create .env in server folder

echo PORT=5001 >> .env

python data_loader.py
### Backend

```bash
cd server
npm install

npm run dev
# http://localhost:5001
```

### Frontend

```bash
cd client
npm install
npm run dev
# http://localhost:3000
```

Run both servers in parallel (two terminals) for full functionality.

## 🗂️ Project Structure (key bits)

```
a-story-of-LLMs-evolution/
├── server/
│   ├── models/
│   │   ├── BenchmarkModel.js
│   │   └── LlmModel.js
│   ├── routes/api.js
│   ├── server.js
│   └── package.json
└── client/
    ├── public/fonts/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── BenchmarkDashboard/
    │   │   ├── Header/
    │   │   ├── TaskSpecializationChart/
    │   │   └── VisualizationChart/
    │   ├── pages/
    │   │   ├── HomePage/
    │   │   └── PlaygroundPage/
    │   └── hooks/
    └── package.json
```

## 📊 Data Integration Checklist

These notes consolidate all component-level READMEs. Use them as TODO anchors for backend + data engineering handoff.

### 1. Timeline & Existing Visuals

- Endpoint: `GET /api/llms` → drives timeline chart (`VisualizationChart`).
- Fields expected: `name`, `releaseDate`, `organization`, `parameters`, `architecture`, `description`.
- TODO (BE): ensure query sorts by `releaseDate` ascending.

### 2. TaskSpecializationChart (`/playground`, top card)

Replace the mock data inside `client/src/components/TaskSpecializationChart/TaskSpecializationChart.jsx`.

```js
// TODO[data]: inject real dataset
const MOCK_DATA = [];

// Expected payload
[
  {
    task: 'Web searching',
    percentage: 33.3,
    models: ['Model label 1', 'Model label 2']
  }
]

// Suggested integration hook
// props: <TaskSpecializationChart data={yourArray} />
```

**Data engineer notes**

- Fetch from backend endpoint `GET /api/task-specialization` (TODO create).
- Ensure percentages sum to ~100 (front end does no normalization).
- Each entry’s `models` array renders verbatim inside tooltip `<li>` items—sanitize text before returning.

### 3. ComparisonChart (`/playground`, top card)

This chart uses a static data file for now.

**Data engineer notes**

- Edit `client/src/data/comparisonData.js` to update the models and metrics.
- Format:
  ```js
  export const comparisonData = [
    { model: 'Model Name', cost: 10, performance: 90, build: 50 },
    // ...
  ];
  ```

### 4. BenchmarkDashboard (`/playground`, bottom card)

Replace `MOCK_DATA`, `BENCHMARK_INFO`, and `BENCHMARK_KEYS` in `client/src/components/BenchmarkDashboard/BenchmarkDashboard.jsx`.

```js
// TODO[data]: hydrate via API response
const MOCK_DATA = {};
const BENCHMARK_INFO = {};
const BENCHMARK_KEYS = [];
const BENCHMARK_COLORS = {}; // optional override per benchmark id

/* Expected shape:
{
  "General": [
    { "model": "Chat GPT-4", "writingbench": 90, "scienceqa": 70 }
  ],
  "Coding": [ ... ]
}

Benchmarks metadata:
{
  "writingbench": {
    "label": "Writing Bench",
    "description": "...",
    "color": "#1f77b4"
  }
}
*/
```

**Integration steps**

1. Provide endpoint `GET /api/benchmarks/dashboard` returning `{ categories, dataByCategory, benchmarkMeta }`.
2. Map `benchmarkMeta` to component constants:
   - `BENCHMARK_KEYS = benchmarkMeta.order`
   - `BENCHMARK_COLORS[key] = benchmarkMeta[key].color`
   - `BENCHMARK_INFO[key] = benchmarkMeta[key].description`
3. Optional search/filter already handled in component; ensure model names stay human readable.

### 4. Shared Notes

- All charts expect numbers (not strings) for scores/percentages.
- If API errors occur, surfaces stay empty; add error boundaries when connecting.
- Keep character set ASCII-safe to match font pipeline.

## 🗄️ Database Collections

1. **LLM overall info**
   - `name`: String
   - `releaseDate`: Date
   - `organization`: String
   - `parameters`: Number (billions)
   - `architecture`: String
   - `description`: String

2. **Benchmark MD**
   - `llmName`: String
   - `benchmarkName`: String
   - `score`: Number
   - `metric`: String
   - `date`: Date

Add new collections for task specialization and dashboard aggregation if required.

## 🔌 HTTP API (current)

| Method | Endpoint | Notes |
| ------ | -------- | ----- |
| GET | `/health` | uptime check |
| GET | `/api/llms` | timeline data |
| GET | `/api/llms/:id` | detail view |
| GET | `/api/benchmarks` | raw benchmark list |
| GET | `/api/benchmarks/:llmName` | filter by model |

> TODO[data]: add endpoints for `/api/task-specialization` and `/api/benchmarks/dashboard`.

## 🧪 Development Tips

- Backend uses `nodemon` (via `npm run dev`).
- Frontend served by Vite (`npm run dev`).
- Vite proxy forwards `/api` to `http://localhost:5001` (see `client/vite.config.js`).
- Kelvinch font lives in `client/public/fonts/`; check browser console if missing.

## 🔐 Environment Variables

`server/.env`

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5001
```

## 🐛 Troubleshooting

- **Mongo connection fails** → verify URI, allow IPs in Atlas, ensure service is running.
- **Vite launches Python binary** → run `npm install` inside `client` to grab Node Vite.
- **Empty charts** → confirm API returns JSON in shapes above; inspect network tab.
- **Port conflicts** → change `PORT` in `.env` or update Vite config.

## 🤝 Contributing

1. Fork & clone
2. `git checkout -b feature/<name>`
3. Commit (`git commit -m "feat: describe change"`)
4. Push & open PR

## 👥 Team

_Đang cập nhật, push tiếp nha 😄_

---

Happy coding & keep the LLM lore alive! 🚀
MONGODB_URI="your_mongodb_connection_string"
