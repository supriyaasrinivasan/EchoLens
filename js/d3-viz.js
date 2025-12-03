

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
        
        this.d3Available = false;
        console.warn('D3.js visualizations disabled - using Chart.js instead');
    }

    createCategoryPieChart(data, containerId) {
        console.log('D3 pie chart skipped - using Chart.js alternative');
        return null;
    }

    createTimelineChart(data, containerId) {
        console.log('D3 timeline chart skipped - using Chart.js alternative');
        return null;
    }

    createNetworkGraph(data, containerId) {
        console.log('D3 network graph skipped');
        return null;
    }

    createHeatmap(data, containerId) {
        console.log('D3 heatmap skipped');
        return null;
    }

    createSankeyDiagram(data, containerId) {
        console.log('D3 sankey diagram skipped');
        return null;
    }

    createForceDirectedGraph(data, containerId) {
        console.log('D3 force directed graph skipped');
        return null;
    }

    updateTheme(isDark) {
        // Theme update placeholder - D3 not loaded
        return null;
    }

    destroy() {
        // Cleanup placeholder - D3 not loaded
        return null;
    }
}

// Helper function for time formatting
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
