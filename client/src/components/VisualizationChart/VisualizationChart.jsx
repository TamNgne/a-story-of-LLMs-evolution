// /client/src/components/VisualizationChart/VisualizationChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './VisualizationChart.module.css';

// --- BACKEND_HOOKUP_POINT ---
// This mock data should be replaced by data fetched from the API (e.g., props.data)
// const MOCK_DATA = [
//   { id: 'm1', modelName: 'GPT-3.5 Turbo', releaseDate: '2023-03-01', performanceScore: 40, provider: 'OpenAI' },
//   { id: 'm2', modelName: 'Llama 2', releaseDate: '2023-07-18', performanceScore: 45, provider: 'Meta AI' },
//   { id: 'm3', modelName: 'Gemini 1.0 Pro', releaseDate: '2023-12-06', performanceScore: 50, provider: 'Google' },
//   { id: 'm4', modelName: 'Claude 3 Opus', releaseDate: '2024-03-04', performanceScore: 55, provider: 'Anthropic' },
//   { id: 'm5', modelName: 'GPT-4o', releaseDate: '2024-05-13', performanceScore: 88, provider: 'OpenAI' },
//   { id: 'm6', modelName: 'Gemini 2.5 Pro', releaseDate: '2024-06-15', performanceScore: 90, provider: 'Google' },
//   { id: 'm7', modelName: 'Llama 3', releaseDate: '2024-04-18', performanceScore: 78, provider: 'Meta AI' },
// ];

// // --- BACKEND_HOOKUP_POINT ---
// // This data defines the trend line. This could be calculated or provided by the backend.
// const MOCK_TREND_LINE_DATA = [
//   { releaseDate: '2023-03-01', performanceScore: 40 },
//   { releaseDate: '2024-03-04', performanceScore: 55 },
//   { releaseDate: '2024-05-13', performanceScore: 88 },
//   { releaseDate: '2024-06-15', performanceScore: 90 },
// ];

const VisualizationChart = ({apiBaseUrl = "http://localhost:5001/api"}) => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);
  const [trendLineData, setTrendLineData] = useState([]);

  useEffect(() => {
    const fetchLLMData = async () => {
      try {
        const llmresponse = await fetch(`${apiBaseUrl}/llms`);
        const llmJson = await llmresponse.json();
        const data = (llmJson.success ? llmJson.data : [])
          .filter(d => d.release_date && d.avg_benchmark_score != null)
          .map(d => ({
            ...d,
            releaseDate: new Date(d.release_date),
            // year: new Date(d.releaseDate).getFullYear()
            performanceScore: d.avg_benchmark_score,
            modelName: d.name,
            provider: d.provider_id || 'Unknown',
            organization: d.organization_id || 'Unknown',
          }));

        setData(data);
        

        const trendresponse = await fetch(`${apiBaseUrl}/llms/avg_score`);
        const trendJson = await trendresponse.json();

        const trendData = (trendJson.success ? trendJson.data : [])
            .filter(d => d.release_date && d.avg_benchmark_score != null)
            .map(d => ({
              ...d,
              releaseDate: new Date(d.release_date),
              performanceScore: d.avg_benchmark_score,
        }));

        setTrendLineData(trendData);;
        
      } catch (error) {
          console.error('Failed to fetch LLM data:', llmJson.error);
        }
    };

    fetchLLMData();

  }, [apiBaseUrl]);

  console.log(trendLineData);


  useEffect(() => {
    if (data.length > 0 && d3Container.current) {
      // Clear previous render
      d3.select(d3Container.current).selectAll('*').remove();
      
      // Remove existing tooltip if any
      d3.select('body').selectAll('.llm-tooltip').remove();

      // Setup dimensions
      const margin = { top: 20, right: 30, bottom: 120, left: 50 };
      const width = 1100 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      // Create SVG
      const svg = d3.select(d3Container.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      //X-Axis (Time) 
      const xDomain = [new Date('2023-03-01'), new Date('2025-12-31')];
      const x = d3.scaleTime()
        .domain(xDomain)
        .range([0, width]);

      
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
        .domain([0, 1]) 
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
        .attr('opacity', 0.2) // will be updated by scrubber highlight
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
              <div>Model: ${d.modelName}</div>
              <div>Avg Score: ${d.performanceScore?.toFixed(2)}</div>
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
        .attr('opacity', 0.2);
      
      labels.exit().remove();

      // --- Draggable scrubber (time handle) ---
      const maxDateVal = d3.max(data, d => d.releaseDate);
      const startingX = x(maxDateVal);
      const timeWindow = 30 * 24 * 60 * 60 * 1000; // 30 days

      const scrubber = svg.append('g')
        .attr('class', styles.scrubber)
        .attr('transform', `translate(${startingX}, 0)`)
        .style('cursor', 'ew-resize');

      // Circle handle on x-axis baseline
      scrubber.append('circle')
        .attr('class', styles.scrubberHandle)
        .attr('cy', height)
        .attr('r', 8);

      const updateHighlight = (currentDate) => {
        dots.attr('opacity', d => (Math.abs(d.releaseDate - currentDate) < timeWindow ? 1.0 : 0.2));
        svg.selectAll('.modelLabel')
          .attr('opacity', d => (Math.abs(d.releaseDate - currentDate) < timeWindow ? 1.0 : 0.2));
      };

      const dragged = (event) => {
        const constrainedX = Math.max(0, Math.min(width, event.x));
        const currentDate = x.invert(constrainedX);
        scrubber.attr('transform', `translate(${constrainedX}, 0)`);
        updateHighlight(currentDate);
      };

      scrubber.call(d3.drag().on('drag', dragged));

      // Initial highlight at starting position
      updateHighlight(maxDateVal);
      
      // Cleanup function
      return () => {
        d3.select('body').selectAll('.llm-tooltip').remove();
      };
    }
  }, [data, trendLineData]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper}>
        <svg ref={d3Container} className={styles.d3Svg}></svg>
      </div>
    </div>
  );
};

export default VisualizationChart;
