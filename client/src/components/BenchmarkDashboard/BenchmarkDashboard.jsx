import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import styles from './BenchmarkDashboard.module.css';
import MultiSelectDropdown from './MultiSelectDropdown'; // Import custom component

const BenchmarkDashboard = ({ apiBaseUrl = "http://localhost:5001/api" }) => {
  const d3Container = useRef(null);

  const [rawData, setRawData] = useState(null);

  const [description, setDescription] = useState('Hover over a model (outer ring) to see the score.');

  // State for Filters
  const [availableOrgs, setAvailableOrgs] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [filters, setFilters] = useState({
    years: [], // Empty means "All"
    orgs: [],  // Empty means "All"
    topK: 10   // Default to Top 10 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {

        const [benchRes, perfRes, llmRes] = await Promise.all([
          fetch(`${apiBaseUrl}/benchmark`),
          fetch(`${apiBaseUrl}/performance`),
          fetch(`${apiBaseUrl}/llms`)
        ]);

        const benchmarkJson = await benchRes.json();
        const performanceJson = await perfRes.json();
        const llmsJson = await llmRes.json();

        const benchmark = Array.isArray(benchmarkJson) ? benchmarkJson : benchmarkJson.data || [];
        const performance = Array.isArray(performanceJson) ? performanceJson : performanceJson.data || [];
        const llms = Array.isArray(llmsJson) ? llmsJson : llmsJson.data || [];

        const llmMap = {};

        const orgSet = new Set();
        const yearSet = new Set();

        llms.forEach(model => {
          llmMap[model.model_id] = model;
          if (model.organization) orgSet.add(model.organization);
          if (model.release_date) {
            const year = new Date(model.release_date).getFullYear();
            if (!isNaN(year)) yearSet.add(year);
          }
        });


        setAvailableOrgs(Array.from(orgSet).sort());
        setAvailableYears(Array.from(yearSet).sort((a, b) => b - a)); // Descending years

        const categories = {};
        benchmark.forEach(b => {

          if (!categories[b.category]) categories[b.category] = [];

          const models = performance
            .filter(p => p.benchmark_id === b.benchmark_id)
            .map(p => {
              const details = llmMap[p.model_id] || {};
              return {
                name: p.model_id,
                value: p.normalized_score,
                ...details,
                description: details.description || 'N/A',
                scorecard_blog_link: details.source_scorecard_blog_link || 'N/A',
                weights_link: details.source_weights_link || 'N/A',
                api_ref: details.source_api_ref || 'N/A',
                release_year: details.release_date ? new Date(details.release_date).getFullYear() : 'N/A'
              };
            });

          categories[b.category].push({
            name: b.name,
            description: b.description,
            modality: b.modality,
            max_score: b.max_score,
            children: models
          });
        });

        const rootData = {
          name: "LLM Universe",
          children: Object.keys(categories).map(cat => ({
            name: cat,
            children: categories[cat]
          }))
        };

        setRawData(rootData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [apiBaseUrl]);

  const data = useMemo(() => {
    if (!rawData) return null;
    // Apply filters to rawData
    const processChildren = (node) => {
      if (!node.children) return node;

      const filteredChildren = node.children.map(child => {

        const isBenchmark = child.children && child.children.length > 0 && !child.children[0].children;

        if (isBenchmark) {
          let validModels = child.children.filter(model => {
            const yearMatch = filters.years.length === 0 || filters.years.includes(model.release_year);
            const orgMatch = filters.orgs.length === 0 || filters.orgs.includes(model.organization);
            return yearMatch && orgMatch;
          });

          validModels.sort((a, b) => b.value - a.value);

          if (filters.topK !== 'All') {
            validModels = validModels.slice(0, filters.topK);
          }
          return { ...child, children: validModels };
        }
        return processChildren(child);
      });
      const nonEmptyChildren = filteredChildren.filter(c => c.children && c.children.length > 0);
      return { ...node, children: nonEmptyChildren };
    };

    return processChildren(rawData);
  }, [rawData, filters]);

  const categoryColor = useMemo(
    () => d3.scaleOrdinal(d3.schemeSet3),
    []
  );

  const modelColor = useMemo(
    () =>
      d3.scaleLinear()
        .domain([0, 100])
        .range(["#E2E8F0", "#63B3ED"]), // Light gray to Light Blue
    []
  );
  //render sunburst chart
  useEffect(() => {
    if (!data || !d3Container.current) return;

    d3.select(d3Container.current).selectAll('*').remove();

    const width = 928;
    const height = width;
    const radius = width / 6;
    const formatDate = d3.timeFormat('%Y-%m-%d');

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])
      (hierarchy);

    root.each(d => d.current = d);

    // Create the arc generator.
    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    // Create the SVG container.
    const svg = d3.select(d3Container.current)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "18px 'Inter', sans-serif"); // Use Inter

    // Append the arcs.
    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", d => {
        if (!d.children) {
          // Gradient Coloring: Inherit Hue from Parent Category, Saturation based on Score
          let ancestor = d;
          while (ancestor.depth > 1) ancestor = ancestor.parent;
          const parentColor = categoryColor(ancestor.data.name);

          // Interpolate between white/light-gray and parent color based on normalized score (0-100)
          const normalizedScore = Math.min(Math.max(d.value / 100, 0), 1);
          return d3.interpolateRgb("#F1F5F9", parentColor)(normalizedScore);
        }
        // If it is Category/Benchmark, use Rainbow scale based on top parent
        let ancestor = d;
        while (ancestor.depth > 1) ancestor = ancestor.parent;
        return categoryColor(ancestor.data.name);
      })
      .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 1.0) : 0) // Models (no children) should be opaque (1.0) for better color visibility
      .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
      .attr("d", d => arc(d.current));

    // Make them clickable if they have children.
    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

    const format = d3.format(",d");
    path.append("title")
      .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("fill", "#1E293B") // Dark Slate Text (High Contrast)
      .attr("dy", "0.35em")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name.length > 15 ? d.data.name.substring(0, 12) + "..." : d.data.name);

    const parent = svg.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);

    // Add mouseover for dashboard description
    path.on("mouseover", (event, d) => {
      const isModel = !d.children;
      const isBenchmark = d.depth === 2;
      const isCategory = d.depth === 1;

      if (isModel) {
        const m = d.data;
        // Cleaned Description: No links, just key info
        setDescription(`
                          <strong>Model:</strong> ${m.name}<br/>
                          <strong>Release Date:</strong> ${formatDate(new Date(m.release_date)) || "N/A"}<br/>
                          <strong>Organization:</strong> ${m.organization || "N/A"}<br/>
                          <strong>Provider:</strong> ${m.provider || "N/A"}<br/>
                          <strong>Description:</strong><br/>${m.description || "No description"}<br/><br/>
                          <strong>Score:</strong>
                          <span style="font-weight:bold; font-size:1.2em; color: #1D4ED8;">${m.value}</span>
                        `);

      } else if (isBenchmark) {
        const b = d.data;
        setDescription(`
          <strong>Benchmark:</strong> ${b.name}<br/>
          <strong>Description:</strong> ${b.description}<br/>
          <strong>Max Score:</strong> ${b.max_score || "N/A"}<br/>
          <strong>Modality:</strong> ${b.modality || "General"}
`     );
      } else if (isCategory) {
        setDescription(`
          <strong>Category:</strong> ${d.data.name}<br/>
          Click to zoom in. (Click the center of the circle to zoom out)
      `);
      }
    });


    // Handle zoom on click.
    function clicked(event, p) {
      parent.datum(p.parent || root);

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      const t = svg.transition().duration(event.altKey ? 7500 : 750);

      path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 1.0) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
        .attrTween("d", d => () => arc(d.current));

      label.transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

  }, [data, categoryColor]);

  //Handlers render
  const toggleYear = (year) => {
    setFilters(prev => {
      const newYears = prev.years.includes(year)
        ? prev.years.filter(y => y !== year)
        : [...prev.years, year];
      return { ...prev, years: newYears };
    });
  };

  const handleOrgChange = (selectedOrgs) => {
    setFilters(prev => ({ ...prev, orgs: selectedOrgs }));
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Performance of LLMs for each Benchmark</h2>
      </div>

      <div className={styles.filterContainer}>
        <div className={styles.filterGroup}>
          <label><strong>Show Top:</strong> </label>

          <select
            value={filters.topK}
            onChange={(e) => setFilters({ ...filters, topK: e.target.value === 'All' ? 'All' : Number(e.target.value) })}
            className={styles.filterSelect}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value="All">All Models</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label><strong>Release Year:</strong> </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableYears.map(year => (
              <label key={year} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.years.includes(year)}
                  onChange={() => toggleYear(year)}
                /> {year}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label><strong>Organization:</strong> </label>
          <MultiSelectDropdown
            options={availableOrgs}
            selected={filters.orgs}
            onChange={handleOrgChange}
            placeholder="Select Organizations..."
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.chartArea}>
          {data && data.children && data.children.length === 0
            ? <p style={{ textAlign: 'center', marginTop: '50px' }}>No models match these filters.</p>
            : <svg ref={d3Container} className={styles.sunburstSvg} />
          }
        </div>
        <aside className={styles.descriptionPanel}>
          <h3>Details</h3>
          <p dangerouslySetInnerHTML={{ __html: description }}></p>
        </aside>
      </div>
    </div >
  );
};

export default BenchmarkDashboard;