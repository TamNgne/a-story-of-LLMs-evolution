// /client/src/components/BenchmarkDashboard/BenchmarkDashboard.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './BenchmarkDashboard.module.css';

// --- BACKEND_HOOKUP_POINT ---
// Mock data. This structure supports multiple benchmarks.
const MOCK_DATA = {
  General: [
    { model: 'Chat GPT-4', writingbench: 90, scienceqa: 70 },
    { model: 'Claude', writingbench: 65, scienceqa: 72 },
    { model: 'Gemini 1.0 Pro', writingbench: 70, scienceqa: 60 },
    { model: 'GPT-3.5 Turbo', writingbench: 85, scienceqa: 80 },
    { model: 'DeepSeek VL2', writingbench: 80, scienceqa: 75 },
  ],
  Coding: [
    { model: 'Chat GPT-4', writingbench: 95, scienceqa: 75 },
    { model: 'Claude', writingbench: 70, scienceqa: 70 },
    { model: 'Gemini 1.0 Pro', writingbench: 75, scienceqa: 65 },
    { model: 'GPT-3.5 Turbo', writingbench: 80, scienceqa: 70 },
    { model: 'DeepSeek VL2', writingbench: 88, scienceqa: 80 },
  ],
};

// --- BACKEND_HOOKUP_POINT ---
const BENCHMARK_INFO = {
  writingbench: 'Measures performance on a suite of writing and text-generation tasks.',
  scienceqa: 'Measures reasoning and knowledge on scientific questions (with images).',
};

const BENCHMARK_KEYS = ['writingbench', 'scienceqa'];
const BENCHMARK_COLORS = {
  writingbench: '#1f77b4',
  scienceqa: '#aec7e8',
};

const BenchmarkDashboard = () => {
  const d3Container = useRef(null);
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('Hover over a bar to see benchmark details.');
  const [searchTerm, setSearchTerm] = useState('');
  const [benchmarkFilter, setBenchmarkFilter] = useState('all');

  const categories = Object.keys(MOCK_DATA);
  const data = MOCK_DATA[category] || [];
  const benchmarks = BENCHMARK_KEYS;
  useEffect(() => {
    if (!d3Container.current) {
      return;
    }

    const svgElement = d3.select(d3Container.current);
    svgElement.selectAll('*').remove();

    const filteredData = data.filter((d) =>
      d.model.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const activeBenchmarks = benchmarkFilter === 'all' ? benchmarks : [benchmarkFilter];

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svgElement.attr('width', width + margin.left + margin.right);
    svgElement.attr('height', height + margin.top + margin.bottom);

    if (filteredData.length === 0 || activeBenchmarks.length === 0) {
      svgElement
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .append('text')
        .text('No data available for the current filters.')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .style('text-anchor', 'middle')
        .style('fill', '#333')
        .style('font-size', 14);
      return;
    }

    const svg = svgElement
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x0 = d3
      .scaleBand()
      .domain(filteredData.map((d) => d.model))
      .rangeRound([0, width])
      .paddingInner(0.1);

    const x1 = d3
      .scaleBand()
      .domain(activeBenchmarks)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .rangeRound([height, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(benchmarks)
      .range(benchmarks.map((key) => BENCHMARK_COLORS[key]));

    const groups = svg
      .append('g')
      .selectAll('g')
      .data(filteredData)
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${x0(d.model)},0)`);

    groups
      .selectAll('rect')
      .data((d) => activeBenchmarks.map((key) => ({ key, value: d[key] ?? 0 })))
      .enter()
      .append('rect')
      .attr('x', (d) => x1(d.key))
      .attr('y', (d) => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', (d) => height - y(d.value))
      .attr('fill', (d) => color(d.key))
      .on('mouseover', (event, d) => {
        setDescription(BENCHMARK_INFO[d.key] || 'No description available.');
      })
      .on('mouseout', () => {
        setDescription('Hover over a bar to see benchmark details.');
      });

    svg
      .append('g')
      .attr('class', styles.axis)
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x0));

    svg.append('g').attr('class', styles.axis).call(d3.axisLeft(y));
  }, [data, searchTerm, benchmarkFilter]);

  useEffect(() => {
    setDescription('Hover over a bar to see benchmark details.');
  }, [category, searchTerm, benchmarkFilter]);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Benchmark Dashboard</h2>
      </div>
      <div className={styles.controls}>
        <label>
          Categories
          <select
            className={styles.dropdown}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label>
          Filter
          <select
            className={styles.dropdown}
            value={benchmarkFilter}
            onChange={(event) => setBenchmarkFilter(event.target.value)}
          >
            <option value="all">All benchmarks</option>
            {benchmarks.map((benchmark) => (
              <option key={benchmark} value={benchmark}>
                {benchmark}
              </option>
            ))}
          </select>
        </label>
        <input
          className={styles.searchBar}
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search models"
          aria-label="Search models"
        />
      </div>
      <div className={styles.legend}>
        {benchmarks.map((benchmark) => (
          <div key={benchmark} className={styles.legendItem}>
            <span
              className={styles.legendColorBox}
              style={{ backgroundColor: BENCHMARK_COLORS[benchmark] }}
            />
            <span>{benchmark}</span>
          </div>
        ))}
      </div>
      <div className={styles.content}>
        <div className={styles.chartArea}>
          <svg ref={d3Container} />
        </div>
        <aside className={styles.descriptionPanel}>
          <h3>Description</h3>
          <p>{description}</p>
        </aside>
      </div>
    </div>
  );
};

export default BenchmarkDashboard;
