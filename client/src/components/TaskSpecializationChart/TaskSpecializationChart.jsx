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

  useEffect(() => {
    if (!data || data.length === 0 || !d3Container.current) return;

    const width = 600; // Increased width slightly for better rectangular aspect ratio
    const height = 400;

    // 1. Clear previous chart
    d3.select(d3Container.current).selectAll('*').remove();

    const svg = d3
      .select(d3Container.current)
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'Kelvinch'); // Apply font to SVG container

    // 2. Prepare Hierarchical Data
    // Treemaps need a root node. We create a virtual root and assign our data as children.
    const root = d3.hierarchy({ children: data })
      .sum((d) => d.percentage) // Define how to size the rects (by percentage)
      .sort((a, b) => b.value - a.value); // Sort biggest to smallest

    // 3. Define Treemap Layout
    d3.treemap()
      .size([width, height])
      .padding(2) // Gap between rectangles
      (root);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.task))
      .range(['#82E0D9', '#9B59B6', '#546E7A', '#45B39D', '#3498DB']);

    const tooltip = d3.select(tooltipRef.current);

    // 4. Draw Leaf Nodes (The Rectangles)
    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // Append Rectangles
    leaf
      .append('rect')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('fill', (d) => color(d.data.task))
      .attr('stroke', '#2c2c2c')
      .style('stroke-width', '1px')
      .on('mouseover', (event, d) => {
        tooltip.style('opacity', 1);
        const [x, y] = d3.pointer(event, d3Container.current.parentElement);
        tooltip
          .html(
            `<strong>${d.data.task}</strong>
             <br/>Share: ${d.data.percentage}%
             <hr style="margin: 5px 0; border-color: #555"/>
             <ul style="padding-left: 15px; margin: 0">
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

    // Append Text Labels
    // We append two text lines: One for Task Name, one for Percentage
    leaf
      .append('text')
      .text((d) => d.data.task)
      .attr('x', 5)
      .attr('y', 20)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#fff')
      .style('display', (d) => {
        // Hide text if the rectangle is too small
        return (d.x1 - d.x0) > 50 && (d.y1 - d.y0) > 30 ? 'block' : 'none';
      });

    leaf
      .append('text')
      .text((d) => `${d.data.percentage}%`)
      .attr('x', 5)
      .attr('y', 38)
      .style('font-size', '12px')
      .style('fill', '#eee')
      .style('display', (d) => {
        return (d.x1 - d.x0) > 50 && (d.y1 - d.y0) > 40 ? 'block' : 'none';
      });

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