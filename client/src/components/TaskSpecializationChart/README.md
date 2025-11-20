# TaskSpecializationChart Component

Renders the pie chart (Sketch 3) showing LLM task specialization.

## Data Integration

Update `TaskSpecializationChart.jsx` when wiring up real data.

1. Remove the `MOCK_DATA` constant at the top of the file.
2. Pass data in as props (e.g., from `PlaygroundPage.jsx`).
3. Expected data structure:

```json
[
  { "task": "Task Name", "percentage": 0, "models": ["Model 1", "Model 2"] }
]
```
