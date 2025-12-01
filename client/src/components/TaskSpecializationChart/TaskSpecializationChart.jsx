import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './TaskSpecializationChart.module.css';

// --- BACKEND_HOOKUP_POINT ---


const TaskSpecializationChart = ({apiBaseUrl="http://localhost:5001/api"}) => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);
  const tooltipRef = useRef(null);

  // fetch percentages from backend
  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/percentage`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch percentage data');
        }
        // normalize data: ensure percentage is a number and provide empty models array if absent
        const normalized = (json.data || []).map((d) => ({
          task: d.task,
          percentage: Number(d.percentage) || 0,
          models: d.models || [],
        }));
        setData(normalized);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching percentage data:', err);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [apiBaseUrl]);

  // draw chart when data changes
  useEffect(() => {
    if (!data || data.length === 0 || !d3Container.current) return;

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
      .domain(data.map((d) => d.task))
      .range(['#82E0D9', '#9B59B6', '#546E7A', '#45B39D', '#3498DB']);

    const pie = d3
      .pie()
      .value((d) => d.percentage)
      .sort(null);

    const dataReady = pie(data);

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
            `<strong>${d.data.task}</strong>
             <ul>
               ${d.data.models.map((m) => `<li>${m}</li>`).join('')}
             </ul>`
          )
          .style('left', `${x + 20}px`)
          .style('top', `${y - 20}px`);
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, d3Container.current.parentElement);
        tooltip.style('left', `${x + 20}px`).style('top', `${y - 20}px`);
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
  }, [data]);

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
