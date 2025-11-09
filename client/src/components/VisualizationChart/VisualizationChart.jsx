// /client/src/components/VisualizationChart/VisualizationChart.jsx
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './VisualizationChart.module.css';

// --- BACKEND_HOOKUP_POINT ---
// This mock data should be replaced by data fetched from the API (e.g., props.data)
const MOCK_DATA = [
  { id: 'm1', modelName: 'GPT-3.5 Turbo', releaseDate: '2023-03-01', performanceScore: 40, provider: 'OpenAI' },
  { id: 'm2', modelName: 'Llama 2', releaseDate: '2023-07-18', performanceScore: 45, provider: 'Meta AI' },
  { id: 'm3', modelName: 'Gemini 1.0 Pro', releaseDate: '2023-12-06', performanceScore: 50, provider: 'Google' },
  { id: 'm4', modelName: 'Claude 3 Opus', releaseDate: '2024-03-04', performanceScore: 55, provider: 'Anthropic' },
  { id: 'm5', modelName: 'GPT-4o', releaseDate: '2024-05-13', performanceScore: 88, provider: 'OpenAI' },
  { id: 'm6', modelName: 'Gemini 2.5 Pro', releaseDate: '2024-06-15', performanceScore: 90, provider: 'Google' },
  { id: 'm7', modelName: 'Llama 3', releaseDate: '2024-04-18', performanceScore: 78, provider: 'Meta AI' },
];

// --- BACKEND_HOOKUP_POINT ---
// This data defines the trend line. This could be calculated or provided by the backend.
const MOCK_TREND_LINE_DATA = [
  { releaseDate: '2023-03-01', performanceScore: 40 },
  { releaseDate: '2024-03-04', performanceScore: 55 },
  { releaseDate: '2024-05-13', performanceScore: 88 },
  { releaseDate: '2024-06-15', performanceScore: 90 },
];

const VisualizationChart = () => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);
  const [trendLineData, setTrendLineData] = useState([]);

  // Get min/max years for slider
  const allDates = MOCK_DATA.map(d => new Date(d.releaseDate));
  const minYear = d3.min(allDates, d => d.getFullYear());
  const maxYear = d3.max(allDates, d => d.getFullYear());

  const [selectedYear, setSelectedYear] = useState(maxYear);

  useEffect(() => {
    // --- BACKEND_HOOKUP_POINT ---
    // In a real app, you would fetch data here and call setData() and setTrendLineData()
    const parsedData = MOCK_DATA.map(d => ({
      ...d,
      releaseDate: new Date(d.releaseDate),
      year: new Date(d.releaseDate).getFullYear()
    }));
    setData(parsedData);

    const parsedTrendData = MOCK_TREND_LINE_DATA.map(d => ({
      ...d,
      releaseDate: new Date(d.releaseDate)
    }));
    setTrendLineData(parsedTrendData);
  }, []);

  useEffect(() => {
    if (data.length > 0 && d3Container.current) {
      // Clear previous render
      d3.select(d3Container.current).selectAll('*').remove();
      
      // Remove existing tooltip if any
      d3.select('body').selectAll('.llm-tooltip').remove();

      // Setup dimensions
      const margin = { top: 20, right: 30, bottom: 80, left: 50 }; // Increased bottom margin for slider
      const width = 1100 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(d3Container.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // --- X-Axis (Time) - Fixed domain 2023-2025, monthly ticks ---
      const xDomain = [new Date('2023-01-01'), new Date('2025-12-31')];
      const x = d3.scaleTime()
        .domain(xDomain)
        .range([0, width]);

      // Create monthly ticks for 2023-2025 (36 months total, but we'll show every 3 months for readability)
      const xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth.every(3)) // Every 3 months
        .tickFormat(d3.timeFormat('%Y-%m'));

      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .attr('class', styles.axis)
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)');

      // --- Y-Axis (Performance) ---
      const y = d3.scaleLinear()
        .domain([0, 100]) // Assuming performance is 0-100
        .range([height, 0]);

      svg.append('g')
        .call(d3.axisLeft(y))
        .attr('class', styles.axis);

      // --- Trend Line ---
      const line = d3.line()
        .x(d => x(d.releaseDate))
        .y(d => y(d.performanceScore));

      svg.append('path')
        .datum(trendLineData)
        .attr('class', styles.trendLine)
        .attr('d', line);

      // Helper function to check if a model is on the trend line
      const isOnTrendLine = (model) => {
        return trendLineData.some(trendPoint => {
          const dateMatch = Math.abs(trendPoint.releaseDate.getTime() - model.releaseDate.getTime()) < 86400000; // Within 1 day
          const scoreMatch = Math.abs(trendPoint.performanceScore - model.performanceScore) < 1; // Within 1 point
          return dateMatch && scoreMatch;
        });
      };

      // --- Tooltip container ---
      // Remove existing tooltip first
      d3.select('body').selectAll('.llm-tooltip').remove();
      
      const tooltipDiv = d3.select('body')
        .append('div')
        .attr('class', `llm-tooltip ${styles.tooltip}`)
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('pointer-events', 'none');

      // --- Dots (Models) - 30% larger ---
      const dots = svg.selectAll('.modelDot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', styles.modelDot)
        .attr('cx', d => x(d.releaseDate))
        .attr('cy', d => y(d.performanceScore))
        .attr('r', 7.8) // 30% larger: 6 * 1.3 = 7.8
        .attr('opacity', d => (d.year === selectedYear ? 1.0 : 0.2)) // Highlighting logic
        .on('mouseover', function(event, d) {
          // Get SVG position relative to page
          const svgRect = d3Container.current.getBoundingClientRect();
          const xPos = svgRect.left + margin.left + x(d.releaseDate);
          const yPos = svgRect.top + margin.top + y(d.performanceScore);
          
          // Format date
          const dateStr = d3.timeFormat('%Y-%m-%d')(d.releaseDate);
          const scoreStr = d.performanceScore.toFixed(2);
          
          tooltipDiv
            .style('left', `${xPos + 15}px`)
            .style('top', `${yPos - 15}px`)
            .html(`
              <div>Average Performance score: ${scoreStr}</div>
              <div>Released: ${dateStr}</div>
            `)
            .transition()
            .duration(200)
            .style('opacity', 1);
        })
        .on('mouseout', function() {
          tooltipDiv
            .transition()
            .duration(200)
            .style('opacity', 0);
        })
        .on('mousemove', function(event, d) {
          // Update tooltip position on mouse move
          const svgRect = d3Container.current.getBoundingClientRect();
          const xPos = svgRect.left + margin.left + x(d.releaseDate);
          const yPos = svgRect.top + margin.top + y(d.performanceScore);
          
          tooltipDiv
            .style('left', `${xPos + 15}px`)
            .style('top', `${yPos - 15}px`);
        });

      // --- Labels for models on trend line ---
      const modelsOnTrendLine = data.filter(isOnTrendLine);
      
      const labels = svg.selectAll('.modelLabel')
        .data(modelsOnTrendLine);
      
      labels.enter()
        .append('text')
        .attr('class', styles.modelLabel)
        .merge(labels)
        .attr('x', d => x(d.releaseDate))
        .attr('y', d => y(d.performanceScore) - 15) // Position above the dot
        .attr('text-anchor', 'middle')
        .text(d => d.modelName)
        .attr('opacity', d => (d.year === selectedYear ? 1.0 : 0.2)); // Match dot opacity
      
      labels.exit().remove();
      
      // Cleanup function
      return () => {
        d3.select('body').selectAll('.llm-tooltip').remove();
      };
    }
  }, [data, trendLineData, selectedYear]); // Redraw on data or year change

  // Update function for highlighting
  useEffect(() => {
    if (d3Container.current && data.length > 0) {
      const svg = d3.select(d3Container.current).select('g');
      if (svg.empty()) return;
      
      // Helper function to check if a model is on the trend line
      const isOnTrendLine = (model) => {
        return trendLineData.some(trendPoint => {
          const dateMatch = Math.abs(trendPoint.releaseDate.getTime() - model.releaseDate.getTime()) < 86400000;
          const scoreMatch = Math.abs(trendPoint.performanceScore - model.performanceScore) < 1;
          return dateMatch && scoreMatch;
        });
      };
      
      const modelsOnTrendLine = data.filter(isOnTrendLine);
      
      svg.selectAll('.modelDot')
        .data(data)
        .transition()
        .duration(300)
        .attr('opacity', d => (d.year === selectedYear ? 1.0 : 0.2));
      
      // Update label opacity to match dots
      svg.selectAll('.modelLabel')
        .data(modelsOnTrendLine)
        .transition()
        .duration(300)
        .attr('opacity', d => (d.year === selectedYear ? 1.0 : 0.2));
    }
  }, [selectedYear, data, trendLineData]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper}>
        <svg ref={d3Container} className={styles.d3Svg}></svg>
        <div className={styles.sliderContainer}>
          <label className={styles.sliderLabel}>Select Year: {selectedYear}</label>
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className={styles.yearSlider}
          />
        </div>
      </div>
    </div>
  );
};

export default VisualizationChart;
