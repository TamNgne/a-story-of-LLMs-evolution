import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './TaskSpecializationChart.module.css';

// --- BACKEND_HOOKUP_POINT ---

const TaskSpecializationChart = ({ apiBaseUrl = "http://localhost:5001/api" }) => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/percentage`, { signal: controller.signal });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to fetch percentage data');
        }
        const normalized = (json.data || []).map((d) => ({
          task: d.task,
          percentage: Number(d.percentage) || 0,
          models: d.models || [],
        }));
        
        // SORT DATA DESCENDING HERE to ensure colors align with size
        normalized.sort((a, b) => b.percentage - a.percentage);
        
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

    const width = 800; 
    const height = 500;

    // 1. Clear previous chart
    d3.select(d3Container.current).selectAll('*').remove();

    const svg = d3
      .select(d3Container.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('width', '100%')
      .style('height', 'auto')
      .style('font-family', 'sans-serif');

    // 2. Prepare Hierarchy
    const root = d3.hierarchy({ children: data })
      .sum((d) => d.percentage)
      .sort((a, b) => b.value - a.value);

    // 3. Layout
    d3.treemap()
      .size([width, height])
      .paddingInner(3)
      .paddingOuter(2)
      .round(true)
      (root);

    // --- UPDATED COLOR LOGIC ---
    // The specific hex codes from your image, ordered from Darkest -> Lightest
    const pastelPalette = [
        "#2f527aff", // Darkest Blue
        "#3d6a9fff",
        "#5284bd",
        "#779ecb",
        "#9cb8d9",
        "#c1d3e7"  // Lightest Blue
    ];

    // Map the sorted data tasks to colors based on their index (rank)
    // This forces a gradient even if values are identical (e.g. 32.6% vs 32.3%)
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.task)) 
        .range(pastelPalette);

    const tooltip = d3.select(tooltipRef.current);

    const leaf = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x0},${d.y0})`);

    // --- CLIP PATH DEFINITION ---
    // This creates an invisible boundary matching each rectangle's size
    leaf.append("defs")
      .append("clipPath")
      .attr("id", (d, i) => `clip-${i}-${d.data.task.replace(/\s+/g, '')}`) // Unique safe ID
      .append("rect")
      .attr("width", (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0));

    // Draw Rects
    leaf
      .append('rect')
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))
      .attr('fill', (d) => colorScale(d.data.task))
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('stroke', '#242424')
      .style('stroke-width', '2px')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).style('filter', 'brightness(1.1)'); // Lighten on hover
        tooltip.style('opacity', 1);
        const [x, y] = d3.pointer(event, d3Container.current.parentElement);
        tooltip
          .html(
            `<strong>${d.data.task}</strong>
             <br/><span style="color:#666; font-size:0.85em">Share: ${d.data.percentage}%</span>
             <hr style="margin: 8px 0; border-color: #eee"/>
             <ul style="padding-left: 15px; margin: 0">
               ${d.data.models.map(m => `<li>${m}</li>`).join('')}
             </ul>`
          )
          .style('left', `${x + 20}px`)
          .style('top', `${y - 20}px`);
      })
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event, d3Container.current.parentElement);
        tooltip.style('left', `${x + 20}px`).style('top', `${y - 20}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).style('filter', 'none');
        tooltip.style('opacity', 0);
      });

    // --- TEXT HANDLING ---
    // We group text and apply the clip-path ID we created earlier
    const textGroup = leaf.append('text')
      .attr("clip-path", (d, i) => `url(#clip-${i}-${d.data.task.replace(/\s+/g, '')})`)
      .style('pointer-events', 'none'); 

    // Task Name
    textGroup
      .append('tspan')
      .text((d) => d.data.task)
      .attr('x', 6)
      .attr('y', 20)
      .style('font-size', '16px')
      .style('font-weight', '600')
      .style('fill', '#fff')
      .style('text-shadow', '0 1px 3px rgba(0,0,0,0.4)')
      .style('display', (d) => {
         // Strict Hiding: Hide text if width < 60px OR height < 35px
         return (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 35 ? 'block' : 'none';
      });

    // Percentage
    textGroup
      .append('tspan')
      .text((d) => `${d.data.percentage}%`)
      .attr('x', 6)
      .attr('y', 38)
      .style('font-size', '13px')
      .style('font-weight', 'bold')
      .style('fill', 'rgba(255,255,255,0.9)')
      .style('display', (d) => {
         // Strict Hiding: Needs more vertical space than the title
         return (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 50 ? 'block' : 'none';
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