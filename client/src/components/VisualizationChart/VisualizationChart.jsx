import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import styles from './VisualizationChart.module.css';

const VisualizationChart = ({ apiBaseUrl = "http://localhost:5001/api" }) => {
  const d3Container = useRef(null);
  const [data, setData] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState('All');
  const [selectedProvider, setSelectedProvider] = useState('All');

  // Extract unique organizations and providers for filters
  const organizations = useMemo(() => {
    const orgs = new Set(data.map(d => d.organization).filter(Boolean));
    return ['All', ...Array.from(orgs).sort()];
  }, [data]);

  const providers = useMemo(() => {
    const provs = new Set(data.map(d => d.provider).filter(Boolean));
    return ['All', ...Array.from(provs).sort()];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(d => {
      const matchOrg = selectedOrganization === 'All' || d.organization === selectedOrganization;
      const matchProv = selectedProvider === 'All' || d.provider === selectedProvider;
      return matchOrg && matchProv;
    });
  }, [data, selectedOrganization, selectedProvider]);

  const sotaData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    const sortedData = [...filteredData].sort((a, b) => a.releaseDate - b.releaseDate);
    const trend = [];
    let currentMaxScore = -1;

    sortedData.forEach(d => {
      if (d.performanceScore >= currentMaxScore) {
        currentMaxScore = d.performanceScore;
        trend.push(d);
      }
    });

    return trend;
  }, [filteredData]);

  useEffect(() => {
    const fetchLLMData = async () => {
      try {
        const llmresponse = await fetch(`${apiBaseUrl}/llms`);
        const llmJson = await llmresponse.json();

        const formattedData = (llmJson.success ? llmJson.data : [])
          .filter(d => d.release_date && d.avg_benchmark_score != null)
          .map(d => ({
            ...d,
            releaseDate: new Date(d.release_date),
            performanceScore: parseFloat(d.avg_benchmark_score),
            modelName: d.name,
            // TODO: Backend Team - Please ensure the API returns 'organization' and 'provider' fields
            organization: d.organization || 'Unknown',
            provider: d.provider || 'Unknown',
          }));

        setData(formattedData);
      } catch (error) {
        console.error('Failed to fetch LLM data:', error);
      }
    };

    fetchLLMData();
  }, [apiBaseUrl]);

  useEffect(() => {
    if (filteredData.length > 0 && d3Container.current) {
      d3.select(d3Container.current).selectAll('*').remove();
      d3.select('body').selectAll('.llm-tooltip').remove();

      const margin = { top: 20, right: 30, bottom: 120, left: 50 };
      const width = 1100 - margin.left - margin.right;
      const height = 500 - margin.top - margin.bottom;

      const svg = d3.select(d3Container.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X-Axis
      const xDomain = [new Date('2023-03-01'), new Date('2025-12-31')];
      const x = d3.scaleTime().domain(xDomain).range([0, width]);

      const xAxis = d3.axisBottom(x)
        .ticks(d3.timeMonth.every(3))
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

      // Y-Axis
      const maxDataScore = d3.max(filteredData, d => d.performanceScore) || 1;
      const y = d3.scaleLinear()
        .domain([0, maxDataScore * 1.05])
        .range([height, 0]);

      svg.append('g')
        .call(d3.axisLeft(y))
        .attr('class', styles.axis);

      // --- TREND LINE ---
      const line = d3.line()
        .x(d => x(d.releaseDate))
        .y(d => y(d.performanceScore))

      svg.append('path')
        .datum(sotaData)
        .attr('class', styles.trendLine)
        .attr('fill', 'none')
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 2.5)
        .attr('d', line);

      const isOnTrendLine = (model) => {
        return sotaData.some(s => s.modelName === model.modelName && s.releaseDate.getTime() === model.releaseDate.getTime());
      };

      // --- Tooltip ---
      const tooltipDiv = d3.select('body').append('div')
        .attr('class', `llm-tooltip ${styles.tooltip}`)
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('pointer-events', 'none');

      // --- Dots ---
      const dots = svg.selectAll('.modelDot')
        .data(filteredData)
        .enter()
        .append('circle')
        .attr('class', styles.modelDot)
        .attr('cx', d => x(d.releaseDate))
        .attr('cy', d => y(d.performanceScore))
        .attr('r', 7.8)
        .attr('opacity', 0.2)
        .on('mouseover', function (event, d) {
          const svgRect = d3Container.current.getBoundingClientRect();
          const xPos = svgRect.left + window.scrollX + margin.left + x(d.releaseDate);
          const yPos = svgRect.top + window.scrollY + margin.top + y(d.performanceScore);

          tooltipDiv
            .style('left', `${xPos + 10}px`)
            .style('top', `${yPos - 10}px`)
            .html(`<div><strong>${d.modelName}</strong></div><div>Score: ${d.performanceScore?.toFixed(2)}</div><div>Org: ${d.organization}</div><div>Prov: ${d.provider}</div>`)
            .transition().duration(200).style('opacity', 1);
        })
        .on('mouseout', () => tooltipDiv.transition().duration(200).style('opacity', 0))
        .on('mousemove', function (event, d) {
          const svgRect = d3Container.current.getBoundingClientRect();
          const xPos = svgRect.left + window.scrollX + margin.left + x(d.releaseDate);
          const yPos = svgRect.top + window.scrollY + margin.top + y(d.performanceScore);

          tooltipDiv.style('left', `${xPos + 10}px`)
            .style('top', `${yPos - 10}px`);
        });

      // --- Labels ---
      const modelsOnTrendLine = filteredData.filter(isOnTrendLine);
      const labels = svg.selectAll('.modelLabel').data(modelsOnTrendLine);

      labels.enter()
        .append('text')
        .attr('class', styles.modelLabel)
        .merge(labels)
        .attr('x', d => x(d.releaseDate))
        .attr('y', d => y(d.performanceScore) - 15)
        .attr('text-anchor', 'middle')
        .style('fill', '#fff')
        .style('font-size', '10px')
        .text(d => d.modelName)
        .attr('opacity', 0.6);

      labels.exit().remove();

      // --- Scrubber ---
      const maxDateVal = d3.max(filteredData, d => d.releaseDate);
      const startingX = x(maxDateVal);
      const timeWindow = 30 * 24 * 60 * 60 * 1000;

      const scrubber = svg.append('g')
        .attr('class', styles.scrubber)
        .attr('transform', `translate(${startingX}, 0)`)
        .style('cursor', 'ew-resize');

      scrubber.append('circle')
        .attr('class', styles.scrubberHandle)
        .attr('cy', height)
        .attr('r', 9)
        .style('fill', '#15587eff')
        .style('stroke', '#ffffff')
        .style('stroke-width', '2px');

      scrubber.append('text')
        .text("Drag Time")
        .attr('x', 0)
        .attr('y', height - 18)
        .attr('text-anchor', 'middle')
        .style('fill', '#8a8a8aff')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('pointer-events', 'none')
        .style('text-shadow', '0px 0px 4px rgba(0,0,0,0.8)');

      // --- Update Highlight Logic --- ( It doesn't work :< )
      const updateHighlight = (currentDate) => {
        dots.attr('opacity', d => (Math.abs(d.releaseDate - currentDate) < timeWindow ? 1.0 : 0.2));

        svg.selectAll('.modelLabel')
          .attr('opacity', d => (Math.abs(d.releaseDate - currentDate) < timeWindow ? 1.0 : 0.6));
      };

      const dragged = (event) => {
        const constrainedX = Math.max(0, Math.min(width, event.x));
        const currentDate = x.invert(constrainedX);
        scrubber.attr('transform', `translate(${constrainedX}, 0)`);
        updateHighlight(currentDate);
      };

      scrubber.call(d3.drag().on('drag', dragged));

      updateHighlight(maxDateVal);

      return () => {
        d3.select('body').selectAll('.llm-tooltip').remove();
      };
    }
  }, [filteredData, sotaData]);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label htmlFor="org-filter">Organization:</label>
          <select
            id="org-filter"
            value={selectedOrganization}
            onChange={(e) => setSelectedOrganization(e.target.value)}
            className={styles.filterSelect}
          >
            {organizations.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label htmlFor="prov-filter">Provider:</label>
          <select
            id="prov-filter"
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className={styles.filterSelect}
          >
            {providers.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>
      </div>
      <div className={styles.chartWrapper}>
        <svg ref={d3Container} className={styles.d3Svg}></svg>
      </div>
    </div>
  );
};

export default VisualizationChart;