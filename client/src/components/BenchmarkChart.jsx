import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useBenchmarkData } from '../hooks/useData';
import '../App.css';

const BenchmarkChart = () => {
  const svgRef = useRef(null);
  const { data, loading, error } = useBenchmarkData();

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

    // Group data by benchmark name
    const benchmarks = d3.group(data, (d) => d.benchmarkName || 'Unknown');
    const benchmarkNames = Array.from(benchmarks.keys());

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(benchmarkNames)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.score || 0) || 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Color scale for different LLMs
    const llmNames = [...new Set(data.map((d) => d.llmName || 'Unknown'))];
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(llmNames);

    // Draw bars for each benchmark
    const barWidth = xScale.bandwidth() / llmNames.length;

    llmNames.forEach((llmName, llmIndex) => {
      const llmData = data.filter((d) => (d.llmName || 'Unknown') === llmName);

      svg
        .selectAll(`.bar-${llmIndex}`)
        .data(llmData)
        .enter()
        .append('rect')
        .attr('class', `bar-${llmIndex}`)
        .attr('x', (d) => {
          const benchmarkIndex = benchmarkNames.indexOf(d.benchmarkName || 'Unknown');
          return xScale(benchmarkNames[benchmarkIndex]) + barWidth * llmIndex;
        })
        .attr('y', (d) => yScale(d.score || 0))
        .attr('width', barWidth)
        .attr('height', (d) => height - margin.bottom - yScale(d.score || 0))
        .attr('fill', colorScale(llmName))
        .attr('opacity', 0.8)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('opacity', 1);
        })
        .on('mouseout', function (event, d) {
          d3.select(this).attr('opacity', 0.8);
        })
        .append('title')
        .text(
          (d) =>
            `${d.llmName || 'Unknown'}\n${d.benchmarkName || 'Unknown'}: ${d.score || 'N/A'}\n${d.metric || ''}`
        );
    });

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    svg
      .append('text')
      .attr('fill', '#333')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Benchmark Name');

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
      .text('Score');

    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - margin.right - 150}, ${margin.top})`);

    llmNames.forEach((llmName, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(llmName));

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(llmName);
    });

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Benchmark Performance Comparison');
  }, [data]);

  if (loading) {
    return <div className="loading">Loading benchmark data...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="chart-container">
      <h2>Benchmark Visualization</h2>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BenchmarkChart;

