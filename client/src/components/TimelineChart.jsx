import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useLlmData } from '../hooks/useData';
import '../App.css';

const TimelineChart = () => {
  const svgRef = useRef(null);
  const { data, loading, error } = useLlmData();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Set up SVG dimensions
    const width = 1200;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create scales
    // Parse dates and create time scale
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dates = data
      .map((d) => {
        if (d.releaseDate) {
          const date = d.releaseDate instanceof Date 
            ? d.releaseDate 
            : new Date(d.releaseDate);
          return isNaN(date) ? null : date;
        }
        return null;
      })
      .filter((d) => d !== null);

    if (dates.length === 0) {
      // If no valid dates, use index-based positioning
      const xScale = d3
        .scaleBand()
        .domain(data.map((_, i) => i))
        .range([margin.left, width - margin.right])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.parameters || 0) || 100])
        .nice()
        .range([height - margin.bottom, margin.top]);

      // Draw circles based on parameters
      svg
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr('cy', (d) => yScale(d.parameters || 0))
        .attr('r', (d) => Math.sqrt(d.parameters || 0) / 10 || 5)
        .attr('fill', '#61dafb')
        .attr('opacity', 0.7)
        .append('title')
        .text((d) => `${d.name || 'Unknown'}: ${d.parameters || 'N/A'}B params`);

      // Add labels
      svg
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
        .attr('y', height - margin.bottom + 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', '#333')
        .text((d) => d.name || 'Unknown')
        .call((text) =>
          text
            .filter((d, i) => {
              const node = text.nodes()[i];
              return node.getComputedTextLength() > xScale.bandwidth();
            })
            .attr('transform', 'rotate(-45)')
            .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
            .attr('y', height - margin.bottom + 30)
        );

      // Add Y axis
      svg
        .append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('fill', '#333')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .text('Parameters (Billions)');

      return;
    }

    // Time-based visualization
    const minDate = d3.min(dates);
    const maxDate = d3.max(dates);
    const xScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.parameters || 0) || 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Draw circles for each LLM
    svg
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d) => {
        if (d.releaseDate) {
          const date = d.releaseDate instanceof Date 
            ? d.releaseDate 
            : new Date(d.releaseDate);
          return isNaN(date) ? margin.left : xScale(date);
        }
        return margin.left;
      })
      .attr('cy', (d) => yScale(d.parameters || 0))
      .attr('r', (d) => Math.sqrt(d.parameters || 0) / 10 || 5)
      .attr('fill', '#61dafb')
      .attr('opacity', 0.7)
      .attr('stroke', '#282c34')
      .attr('stroke-width', 1)
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1).attr('r', (d) => Math.sqrt(d.parameters || 0) / 8 || 7);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).attr('opacity', 0.7).attr('r', (d) => Math.sqrt(d.parameters || 0) / 10 || 5);
      })
      .append('title')
      .text(
        (d) =>
          `${d.name || 'Unknown'}\n${d.parameters || 'N/A'}B parameters\n${d.organization || 'Unknown org'}`
      );

    // Add X axis (time)
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .append('text')
      .attr('fill', '#333')
      .attr('x', width / 2)
      .attr('y', 50)
      .attr('text-anchor', 'middle')
      .text('Release Date');

    // Add Y axis (parameters)
    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .append('text')
      .attr('fill', '#333')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -(height / 2))
      .attr('text-anchor', 'middle')
      .text('Parameters (Billions)');

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('LLM Evolution Timeline');
  }, [data]);

  if (loading) {
    return <div className="loading">Loading LLM data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="chart-container">
      <h2>Timeline Visualization</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TimelineChart;

