# VisualizationChart Component

This component (`VisualizationChart.jsx`) is responsible for rendering the interactive D3 scatter plot found on the Home Page, which visualizes the evolution of Large Language Models (LLMs) over time.

## Features

- **Scatter Plot**: Renders each LLM as a circle positioned by release date (X-axis) and performance score (Y-axis)
- **X-Axis**: Release Date (Time scale)
- **Y-Axis**: Performance Score (Linear scale, 0-100)
- **Trend Line**: Draws a line connecting the top-performing models chronologically
- **Year Slider**: A range slider allows users to select a specific year
- **Interactive Highlighting**: Models released in the selected year are highlighted (full opacity), while all others are dimmed (0.2 opacity)

## Component Structure

```
VisualizationChart/
├── VisualizationChart.jsx      # Main component with D3 logic
├── VisualizationChart.module.css  # Styling for chart and slider
└── README.md                   # This file
```

## Usage

The component is used in `HomePage.jsx`:

```jsx
import VisualizationChart from '../../components/VisualizationChart/VisualizationChart';

// In HomePage component:
<VisualizationChart />
```

## Data Integration (For Backend Developers)

This component is currently using **mock data**. To connect the backend, you will need to modify `VisualizationChart.jsx`:

### 1. Remove Mock Data

Find the `MOCK_DATA` and `MOCK_TREND_LINE_DATA` arrays at the top of the file. These should be removed or replaced with API calls.

### 2. Fetch Real Data

You have two options:

**Option A: Fetch via Props (Recommended)**
- Modify `HomePage.jsx` to fetch data from the API using `useLlmData()` hook
- Pass the data as props to `VisualizationChart`
- Update the component to accept and use `props.data` and `props.trendLineData`

**Option B: Fetch Directly in Component**
- Modify the `useEffect` hook (marked with `// --- BACKEND_HOOKUP_POINT ---`)
- Add API calls to fetch data from endpoints like `/api/llms/timeline` or `/api/llms`
- Process the response and set state using `setData()` and `setTrendLineData()`

### 3. Data Structure

The component expects the primary data (`MOCK_DATA`) to be an array of objects with (at minimum):

```json
{
  "id": "string-id",
  "modelName": "String",
  "releaseDate": "YYYY-MM-DD",
  "performanceScore": Number,
  "provider": "String" // Optional, for future use
}
```

The component expects the trend line data (`MOCK_TREND_LINE_DATA`) to be an array of objects:

```json
{
  "releaseDate": "YYYY-MM-DD",
  "performanceScore": Number
}
```

### 4. Data Processing

Ensure the fetched data is parsed correctly:
- **Dates**: Convert string dates to `Date` objects using `new Date(d.releaseDate)`
- **Year extraction**: Add a `year` property: `year: new Date(d.releaseDate).getFullYear()`
- Set state using `setData()` and `setTrendLineData()` as seen in the initial `useEffect` hook

### Example Integration

```jsx
// In VisualizationChart.jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('/api/llms');
      const parsedData = response.data.data.map(d => ({
        ...d,
        releaseDate: new Date(d.releaseDate),
        year: new Date(d.releaseDate).getFullYear()
      }));
      setData(parsedData);
      
      // Calculate or fetch trend line data
      const trendData = calculateTrendLine(parsedData);
      setTrendLineData(trendData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  fetchData();
}, []);
```

## Styling

The component uses CSS Modules for styling. Key classes:

- `.chartContainer`: Main container with flexbox layout
- `.d3Svg`: SVG element styling
- `.axis`: Axis lines and text
- `.modelDot`: Individual data point circles
- `.trendLine`: Trend line path
- `.sliderContainer`: Slider wrapper
- `.yearSlider`: Range input styling
- `.sliderLabel`: Label text

## Dependencies

- **React**: For component structure and state management
- **D3.js**: For data visualization and DOM manipulation
- **CSS Modules**: For scoped styling

## Future Enhancements

- Add tooltips showing model details on hover
- Add company logos/icons for each data point
- Implement zoom and pan functionality
- Add animation when data loads
- Support for multiple trend lines
- Export chart as image/PDF

