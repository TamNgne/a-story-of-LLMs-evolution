// client/src/components/ComparisonChart/ComparisonChart.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import styles from './ComparisonChart.module.css';

const ComparisonChart = ({ apiBaseUrl = "http://localhost:5001/api" }) => {
  const d3Container = useRef(null);
  const tooltipRef = useRef(null);

  const [xAxis, setXAxis] = useState('cost');
  const [yAxis, setYAxis] = useState('performance');
  const [selectedProvider, setSelectedProvider] = useState('all');

  // Lựa chọn hiện tại trong dropdown
  const [pendingX, setPendingX] = useState('cost');
  const [pendingY, setPendingY] = useState('performance');
  const [pendingProvider, setPendingProvider] = useState('all');

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
        // Fetch data từ server API endpoint
        const response = await fetch(`${apiBaseUrl}/comparison`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        
        // Handle both array and object response formats
        const data = Array.isArray(json) ? json : (json.data || json);
        
        if (Array.isArray(data) && data.length > 0) {
          setComparisonData(data);
        } else if (json.success && json.data) {
          setComparisonData(json.data);
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

  // Danh sách
  const metrics = [
    { value: 'performance',        label: 'Performance (Quality Rating)' }, // alias cho qualityRating
    { value: 'qualityRating',      label: 'Quality Rating' },
    { value: 'speedRating',        label: 'Speed Rating' },
    { value: 'priceRating',        label: 'Price Rating' },
    { value: 'cost',               label: 'Cost (Price / Million Tokens)' },
    { value: 'speed',              label: 'Speed (tokens/sec)' },
    { value: 'latency',            label: 'Latency (sec)' },
    { value: 'contextWindow',      label: 'Context Window (tokens)' },
    { value: 'trainingDatasetSize',label: 'Training Dataset Size' },
    { value: 'computePower',       label: 'Compute Power' },
    { value: 'energyEfficiency',   label: 'Energy Efficiency' },
  ];

  // Build
  const handleBuild = () => {
    setXAxis(pendingX);
    setYAxis(pendingY);
    setSelectedProvider(pendingProvider);
  };

  // Lấy danh sách providers duy nhất từ data
  const providers = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];
    const uniqueProviders = [...new Set(comparisonData.map((d) => d.provider).filter(Boolean))];
    return uniqueProviders.sort();
  }, [comparisonData]);

  // Lọc data theo provider
  const filteredData = useMemo(() => {
    if (!comparisonData || comparisonData.length === 0) return [];
    if (selectedProvider === 'all') return comparisonData;
    return comparisonData.filter((d) => d.provider === selectedProvider);
  }, [comparisonData, selectedProvider]);

  // Vẽ chart - chỉ sử dụng dữ liệu từ API
  useEffect(() => {
    // Chỉ render chart khi có dữ liệu thực từ API
    if (!filteredData || filteredData.length === 0 || !d3Container.current || loading) return;
    if (error) return; // Không render nếu có lỗi

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

    // Lọc dữ liệu hợp lệ (loại bỏ null/undefined)
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
      .attr('color', '#a0a0a0')
      .select('.domain')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Trục Y
    svg
      .append('g')
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
      .attr('color', '#a0a0a0')
      .select('.domain')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Nhãn trục X
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 35)
      .text(metrics.find((m) => m.value === xAxis)?.label)
      .style('fill', '#fff')
      .style('font-size', '14px');

    // Nhãn trục Y
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('y', -35)
      .attr('x', -height / 2)
      .text(metrics.find((m) => m.value === yAxis)?.label)
      .style('fill', '#fff')
      .style('font-size', '14px');

    const tooltip = d3.select(tooltipRef.current);

    // Vẽ các chấm - chỉ sử dụng dữ liệu hợp lệ từ API
    svg
      .append('g')
      .selectAll('circle')
      .data(validData)
      .join('circle')
      .attr('cx', (d) => x(d[xAxis]))
      .attr('cy', (d) => y(d[yAxis]))
      .attr('r', 12)
      .style('fill', '#999')
      .style('opacity', 0.8)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget).style('fill', '#fff').style('opacity', 1);
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
        d3.select(event.currentTarget).style('fill', '#999').style('opacity', 0.8);
        tooltip.style('opacity', 0);
      });
  }, [filteredData, xAxis, yAxis, loading, error]);

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
              value={pendingY}
              onChange={(e) => setPendingY(e.target.value)}
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
              value={pendingX}
              onChange={(e) => setPendingX(e.target.value)}
            >
              {metrics.map((m) => (
                <option key={`x-${m.value}`} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className={styles.buildButton}
            onClick={handleBuild}
            disabled={loading || !comparisonData}
          >
            Build
          </button>
        </div>
        <div className={styles.providerFilter}>
          <div className={styles.controlGroup}>
            <label className={styles.label}>     Provider:</label>
            <select
              className={styles.select}
              value={pendingProvider}
              onChange={(e) => setPendingProvider(e.target.value)}
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