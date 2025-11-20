# BenchmarkDashboard Component

Renders the grouped bar chart (Sketch 2) for benchmark comparison.

## Data Integration

Update `BenchmarkDashboard.jsx` when wiring up real data.

1. Remove the `MOCK_DATA` and `BENCHMARK_INFO` constants at the top of the file.
2. Fetch benchmark data from the backend and pass it into the component or load it via your preferred state management solution.
3. Expected payload shape:

```json
{
  "CategoryName": [
    { "model": "Model Name", "benchmark1_id": 0, "benchmark2_id": 0 }
  ],
  "AnotherCategory": [
    { "model": "Model Name", "benchmark1_id": 0, "benchmark2_id": 0 }
  ]
}
```

4. Provide an array of benchmark IDs (e.g., `["writingbench", "scienceqa"]`) alongside a mapping of benchmark ID to description so the legend and hover states stay in sync with the dataset.
