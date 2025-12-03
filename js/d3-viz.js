

export class D3Visualizations {
    constructor() {
        this.colors = {
            primary: '#6366f1',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#3b82f6',
            categories: [
                '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
                '#f59e0b', '#10b981', '#14b8a6', '#06b6d4',
                '#3b82f6', '#6366f1'
            ]
        };
    }

    
    createCategoryPieChart(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        container.innerHTML = '';

        const width = container.offsetWidth || 400;
        const height = 300;
        const radius = Math.min(width, height) / 2 - 10;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.category))
            .range(this.colors.categories);

        const pie = d3.pie()
            .value(d => d.time)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius);

        const arcHover = d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 1.05);

        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute');

        const slices = svg.selectAll('path')
            .data(pie(data))
            .enter()
            .append('path')
            .attr('class', 'pie-slice')
            .attr('d', arc)
            .attr('fill', d => color(d.data.category))
            .attr('stroke', 'var(--bg-card)')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arcHover);

                tooltip
                    .html(`
                        <div class="d3-tooltip-title">${d.data.category}</div>
                        <div class="d3-tooltip-value">
                            Time: ${formatTime(d.data.time)}<br>
                            ${Math.round(d.data.percentage)}% of total
                        </div>
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .classed('visible', true);
            })
            .on('mouseout', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('d', arc);

                tooltip.classed('visible', false);
            });

        svg.selectAll('text')
            .data(pie(data))
            .enter()
            .append('text')
            .attr('class', 'pie-label')
            .attr('transform', d => `translate(${arc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', '600')
            .style('fill', 'white')
            .text(d => d.data.percentage > 5 ? `${Math.round(d.data.percentage)}%` : '');

        const legend = d3.select(`#${containerId}`)
            .append('div')
            .attr('class', 'chart-legend')
            .style('margin-top', '20px')
            .style('display', 'flex')
            .style('flex-wrap', 'wrap')
            .style('gap', '12px')
            .style('justify-content', 'center');

        legend.selectAll('.legend-item')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'legend-item')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('gap', '6px')
            .style('font-size', '12px')
            .html(d => `
                <div style="width: 12px; height: 12px; border-radius: 2px; background: ${color(d.category)}"></div>
                <span style="color: var(--text-secondary)">${d.category}</span>
            `);
    }

    
    createTimelineChart(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        container.innerHTML = '';

        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = (container.offsetWidth || 600) - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const parseDate = d3.timeParse('%Y-%m-%d');
        data.forEach(d => {
            d.date = parseDate(d.date);
        });

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.time)])
            .nice()
            .range([height, 0]);

        const area = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.time))
            .curve(d3.curveMonotoneX);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.time))
            .curve(d3.curveMonotoneX);

        svg.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat(''));

        svg.append('path')
            .datum(data)
            .attr('class', 'timeline-area')
            .attr('fill', this.colors.primary)
            .attr('d', area);

        svg.append('path')
            .datum(data)
            .attr('class', 'timeline-line')
            .attr('fill', 'none')
            .attr('stroke', this.colors.primary)
            .attr('d', line);

        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'd3-tooltip')
            .style('position', 'absolute');

        svg.selectAll('.timeline-dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'timeline-dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.time))
            .attr('r', 4)
            .attr('fill', this.colors.primary)
            .attr('stroke', 'var(--bg-card)')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                tooltip
                    .html(`
                        <div class="d3-tooltip-title">${d3.timeFormat('%B %d, %Y')(d.date)}</div>
                        <div class="d3-tooltip-value">
                            Learning Time: ${formatTime(d.time)}<br>
                            Sessions: ${d.sessions || 1}
                        </div>
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .classed('visible', true);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 6);
            })
            .on('mouseout', function() {
                tooltip.classed('visible', false);
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('r', 4);
            });

        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(x)
                .ticks(7)
                .tickFormat(d3.timeFormat('%b %d')));

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d => formatTimeShort(d)));
    }

    
    createSkillTreeVisualization(data, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !data || data.length === 0) return;

        container.innerHTML = '';

        const width = container.offsetWidth || 500;
        const height = 400;

        const svg = d3.select(`#${containerId}`)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const root = d3.hierarchy(data);
        const treeLayout = d3.tree().size([width - 100, height - 100]);
        treeLayout(root);

        svg.selectAll('path.link')
            .data(root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkVertical()
                .x(d => d.x + 50)
                .y(d => d.y + 50))
            .attr('fill', 'none')
            .attr('stroke', 'var(--border-color)')
            .attr('stroke-width', 2);

        const node = svg.selectAll('g.node')
            .data(root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x + 50}, ${d.y + 50})`);

        node.append('circle')
            .attr('r', 20)
            .attr('fill', d => d.data.completed ? this.colors.success : this.colors.info)
            .attr('stroke', 'var(--bg-card)')
            .attr('stroke-width', 3);

        node.append('text')
            .attr('dy', 30)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('fill', 'var(--text-primary)')
            .text(d => d.data.name);
    }
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}

function formatTimeShort(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(ms / (1000 * 60));
    return `${minutes}m`;
}
