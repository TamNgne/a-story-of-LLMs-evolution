// /client/src/components/TaskSpecializationChart/TaskSpecializationChart.jsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './TaskSpecializationChart.module.css';

// --- BACKEND_HOOKUP_POINT ---
// Mock data, replace with API data
const MOCK_DATA = [
  { task: 'Web searching', percentage: 33.3, models: ['GPT - 4', 'DeepSeek - 3', 'Llama - 2', 'GPT - 3', 'Gemini'] },
  { task: 'Finetuning', percentage: 26.7, models: ['Model A', 'Model B'] },
  { task: 'Batch inference', percentage: 16.7, models: ['Model C', 'Model D'] },
  { task: 'Function calling', percentage: 13.3, models: ['Model E', 'Model F'] },
  { task: 'Structured output', percentage: 6.7, models: ['Model G', 'Model H'] },
];

const TaskSpecializationChart = () => {
  const d3Container = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (MOCK_DATA.length > 0 && d3Container.current) {
      const width = 500;
      const height = 500;
      const margin = 40;
      const radius = Math.min(width, height) / 2 - margin;

      d3.select(d3Container.current).selectAll('*').remove();

      const svg = d3
        .select(d3Container.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      const color = d3
        .scaleOrdinal()
        .domain(MOCK_DATA.map((d) => d.task))
        .range(['#82E0D9', '#9B59B6', '#546E7A', '#45B39D', '#3498DB']);

      const pie = d3
        .pie()
        .value((d) => d.percentage)
        .sort(null);

      const dataReady = pie(MOCK_DATA);

      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      const tooltip = d3.select(tooltipRef.current);

      svg
        .selectAll('path')
        .data(dataReady)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d) => color(d.data.task))
        .attr('stroke', '#2c2c2c')
        .style('stroke-width', '3px')
        .on('mouseover', (event, d) => {
          tooltip.style('opacity', 1);
          const [x, y] = d3.pointer(event, d3Container.current.parentElement);
          tooltip
            .html(
              `\n        <strong>${d.data.task}</strong>\n        <ul>\n          ${d.data.models.map((m) => `<li>${m}</li>`).join('')}\n        </ul>\n      `,
            )
            .style('left', `${x + 20}px`)
            .style('top', `${y - 20}px`);
        })
        .on('mousemove', (event) => {
          const [x, y] = d3.pointer(event, d3Container.current.parentElement);
          tooltip
            .style('left', `${x + 20}px`)
            .style('top', `${y - 20}px`);
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });

      svg
        .selectAll('text')
        .data(dataReady)
        .enter()
        .append('text')
        .text((d) => `${d.data.task} ${d.data.percentage}%`)
        .attr('transform', (d) => {
          const pos = arc.centroid(d);
          return `translate(${pos})`;
        })
        .style('text-anchor', 'middle')
        .style('font-size', 12)
        .style('fill', '#fff')
        .style('font-family', 'Kelvinch');
    }
  }, []);

  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.title}>Proportional Breakdown of LLM Task Specialization</h2>
      <div className={styles.chartContainer}>
        <svg ref={d3Container} />
        <div className={styles.tooltip} ref={tooltipRef} />
      </div>
    </div>
  );
};

export default TaskSpecializationChart;
