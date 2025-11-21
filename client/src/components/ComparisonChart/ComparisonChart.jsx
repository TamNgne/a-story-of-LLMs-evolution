import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './ComparisonChart.module.css';
import { comparisonData } from '../../data/comparisonData';

const ComparisonChart = () => {
    const d3Container = useRef(null);
    const tooltipRef = useRef(null);
    const [xAxis, setXAxis] = useState('cost');
    const [yAxis, setYAxis] = useState('performance');

    const metrics = [
        { value: 'cost', label: 'Cost' },
        { value: 'performance', label: 'Performance' },
        { value: 'build', label: 'Build' },
    ];

    useEffect(() => {
        if (comparisonData.length > 0 && d3Container.current) {
            // Clear previous chart
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

            // X Axis
            const x = d3
                .scaleLinear()
                .domain([0, 100])
                .range([0, width]);

            svg
                .append('g')
                .attr('transform', `translate(0,${height})`)
                .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
                .attr('color', '#a0a0a0')
                .select('.domain')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);

            // Y Axis
            const y = d3
                .scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            svg
                .append('g')
                .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
                .attr('color', '#a0a0a0')
                .select('.domain')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2);

            // Axis Labels
            svg
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('x', width / 2)
                .attr('y', height + 35)
                .text(metrics.find((m) => m.value === xAxis)?.label)
                .style('fill', '#fff')
                .style('font-size', '14px');

            svg
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90)')
                .attr('y', -35)
                .attr('x', -height / 2)
                .text(metrics.find((m) => m.value === yAxis)?.label)
                .style('fill', '#fff')
                .style('font-size', '14px');

            // Dots
            const tooltip = d3.select(tooltipRef.current);

            svg
                .append('g')
                .selectAll('circle')
                .data(comparisonData)
                .join('circle')
                .attr('cx', (d) => x(d[xAxis]))
                .attr('cy', (d) => y(d[yAxis]))
                .attr('r', 12)
                .style('fill', '#999')
                .style('opacity', 0.8)
                .style('cursor', 'pointer')
                .on('mouseover', (event, d) => {
                    d3.select(event.currentTarget).style('fill', '#fff').style('opacity', 1);
                    const [x, y] = d3.pointer(event, d3Container.current.parentElement);
                    tooltip.style('opacity', 1);
                    tooltip
                        .html(
                            `
              <h4>${d.model}</h4>
              <p>${metrics.find((m) => m.value === xAxis)?.label}: ${d[xAxis]}</p>
              <p>${metrics.find((m) => m.value === yAxis)?.label}: ${d[yAxis]}</p>
            `,
                        )
                        .style('left', `${x + 15}px`)
                        .style('top', `${y - 15}px`);
                })
                .on('mouseout', (event) => {
                    d3.select(event.currentTarget).style('fill', '#999').style('opacity', 0.8);
                    tooltip.style('opacity', 0);
                });
        }
    }, [xAxis, yAxis]);

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.header}>
                <h3 className={styles.title}>Build your own comparison. Select a metric for each axis below.</h3>
                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <select
                            className={styles.select}
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                        >
                            {metrics.map((m) => (
                                <option key={`y-${m.value}`} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.controlGroup}>
                        <select
                            className={styles.select}
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                        >
                            {metrics.map((m) => (
                                <option key={`x-${m.value}`} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <div className={styles.chartContainer}>
                <svg ref={d3Container} />
                <div className={styles.tooltip} ref={tooltipRef} />
            </div>
        </div>
    );
};

export default ComparisonChart;
