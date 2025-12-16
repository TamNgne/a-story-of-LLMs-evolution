// client/src/components/ComparisonChart/ComparisonChart.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import styles from './ComparisonChart.module.css';

const ComparisonChart = ({ apiBaseUrl = "http://localhost:5001/api" }) => {
  const d3Container = useRef(null);
  const tooltipRef = useRef(null);

  // Bỏ hết mấy cái pending..., dùng trực tiếp state chính luôn
  const [xAxis, setXAxis] = useState('cost');
  const [yAxis, setYAxis] = useState('performance');
  const [selectedProvider, setSelectedProvider] = useState('all');

  // State cho API data
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data từ API
  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiBaseUrl}/comparison`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        const rawData = Array.isArray(json) ? json : (json.data || json);

        if (Array.isArray(rawData) && rawData.length > 0) {
          const mappedData = rawData.map(item => ({
            ...item,
            model: item['Model'],
            provider: item['Provider'],
            performance: item['Quality Rating'],
            qualityRating: item['Quality Rating'],
            speedRating: item['Speed Rating'],
            priceRating: item['Price Rating'],
            cost: item['Price / Million Tokens'],
            speed: item['Speed (tokens/sec)'],
            latency: item['Latency (sec)'],
            contextWindow: item['Context Window'],
            trainingDatasetSize: item['Training Dataset Size'],
            computePower: item['Compute Power'],
            energyEfficiency: item['Energy Efficiency']
          }));
          setComparisonData(mappedData);
        } else {
          throw new Error('Invalid response format or empty data');
        }
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setError(err.message || 'Failed to fetch comparison data');
        setComparisonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [apiBaseUrl]);

  // Danh sách metrics
  const metrics = [
    { value: 'performance', label: 'Performance (Quality Rating)' },
    { value: 'qualityRating', label: 'Quality Rating' },
    { value: 'speedRating', label: 'Speed Rating' },
    { value: 'priceRating', label: 'Price Rating' },
    { value: 'cost', label: 'Cost (Price / Million Tokens)' },
    { value: 'speed', label: 'Speed (tokens/sec)' },
    { value: 'latency', label: 'Latency (sec)' },
    { value: 'contextWindow', label: 'Context Window (tokens)' },
    { value: 'trainingDatasetSize', label: 'Training Dataset Size' },
    { value: 'computePower', label: 'Compute Power' },
    { value: 'energyEfficiency', label: 'Energy Efficiency' },
  ];

  // Lấy danh sách providers duy nhất
  const providers = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];
    const uniqueProviders = [...new Set(comparisonData.map((d) => d.provider).filter(Boolean))];
    return uniqueProviders.sort();
  }, [comparisonData]);

  // Lọc data theo provider (tự động chạy lại khi selectedProvider đổi)
  const filteredData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];
    if (selectedProvider === 'all') return comparisonData;
    return comparisonData.filter((d) => d.provider === selectedProvider);
  }, [comparisonData, selectedProvider]);

  // Vẽ chart
  useEffect(() => {
    if (!filteredData || filteredData.length === 0 || !d3Container.current || loading) return;
    if (error) return;

    // Xoá chart cũ
    d3.select(d3Container.current).selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(d3Container.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const validData = filteredData.filter((d) =>
      d[xAxis] != null && d[yAxis] != null &&
      !isNaN(d[xAxis]) && !isNaN(d[yAxis])
    );

    if (validData.length === 0) return;

    const xExtent = d3.extent(validData, (d) => d[xAxis]);
    const yExtent = d3.extent(validData, (d) => d[yAxis]);

    const x = d3
      .scaleLinear()
      .domain([Math.min(0, xExtent[0] ?? 0), xExtent[1] ?? 1])
      .nice()
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([Math.min(0, yExtent[0] ?? 0), yExtent[1] ?? 1])
      .nice()
      .range([height, 0]);

    // Trục X
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .attr('color', '#9CA3AF')
      .select('.domain')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 2);

    // Trục Y
    svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .attr('color', '#9CA3AF')
      .select('.domain')
      .attr('stroke', '#E5E7EB')
      .attr('stroke-width', 2);

    // Axis text styling
    svg.selectAll('.tick text')
      .style('fill', '#6B7280')
      .style('font-size', '12px');

    // Nhãn trục X
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .text(metrics.find((m) => m.value === xAxis)?.label)
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '500');

    // Nhãn trục Y
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -height / 2)
      .text(metrics.find((m) => m.value === yAxis)?.label)
      .style('fill', '#374151')
      .style('font-size', '14px')
      .style('font-weight', '500');

    const tooltip = d3.select(tooltipRef.current);

    svg
      .append('g')
      .selectAll('circle')
      .data(validData)
      .join('circle')
      .attr('cx', (d) => x(d[xAxis]))
      .attr('cy', (d) => y(d[yAxis]))
      .attr('r', 8)
      .style('fill', '#3B82F6')
      .style('opacity', 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .style('fill', '#2563EB')
          .style('opacity', 1)
          .attr('r', 10);

        const [px, py] = d3.pointer(event, d3Container.current.parentElement);
        const xLabel = metrics.find((m) => m.value === xAxis)?.label;
        const yLabel = metrics.find((m) => m.value === yAxis)?.label;

        tooltip
          .style('opacity', 1)
          .html(`
            <h4>${d.model}</h4>
            <p>${xLabel}: ${d[xAxis]}</p>
            <p>${yLabel}: ${d[yAxis]}</p>
            <p>Provider: ${d.provider}</p>
          `)
          .style('left', `${px + 15}px`)
          .style('top', `${py - 15}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .style('fill', '#3B82F6')
          .style('opacity', 0.6)
          .attr('r', 8);
        tooltip.style('opacity', 0);
      });
  }, [filteredData, xAxis, yAxis, loading, error]); // Render lại khi state xAxis/yAxis đổi

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Build your own comparison. Select a metric for each axis below.
        </h3>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label className={styles.label}></label>
            <select
              className={styles.select}
              value={yAxis} // Dùng thẳng state thật
              onChange={(e) => setYAxis(e.target.value)} // Update thẳng state thật
            >
              {metrics.map((m) => (
                <option key={`y-${m.value}`} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.controlGroup}>
            <label className={styles.label}></label>
            <select
              className={styles.select}
              value={xAxis} // Dùng thẳng state thật
              onChange={(e) => setXAxis(e.target.value)} // Update thẳng state thật
            >
              {metrics.map((m) => (
                <option key={`x-${m.value}`} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          {/* Đã xóa nút Build */}
        </div>
        <div className={styles.providerFilter}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>     Provider:</label>
            <select
              className={styles.select}
              value={selectedProvider} // Dùng thẳng state thật
              onChange={(e) => setSelectedProvider(e.target.value)} // Update thẳng state thật
            >
              <option value="all">All Provider</option>
              {providers.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className={styles.status}>Loading comparison data from API...</div>}
      {error && (
        <div className={styles.error}>
          Failed to load data from API: {error}
          <br />
          <small>Please ensure the server is running and MongoDB is connected.</small>
        </div>
      )}
      {!loading && !error && (!comparisonData || comparisonData.length === 0) && (
        <div className={styles.status}>No data available from API.</div>
      )}

      <div className={styles.chartContainer}>
        {!loading && !error && comparisonData && comparisonData.length > 0 && (
          <>
            <svg ref={d3Container} />
            <div className={styles.tooltip} ref={tooltipRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default ComparisonChart;