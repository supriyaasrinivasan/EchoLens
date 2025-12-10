

/**
 * D3 Visualizations Stub
 * This is a placeholder class - the project uses Chart.js for visualizations.
 * This class provides empty implementations to prevent errors if D3 methods are called.
 */
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
        // Silent initialization - Chart.js is the primary visualization library
    }

    createCategoryPieChart(data, containerId) {
        // Handled by Chart.js in dashboard
        return null;
    }

    createTimelineChart(data, containerId) {
        // Handled by Chart.js in dashboard
        return null;
    }

    createNetworkGraph(data, containerId) {
        // Not implemented - using Chart.js alternatives
        return null;
    }

    createHeatmap(data, containerId) {
        // Not implemented - using Chart.js alternatives
        return null;
    }

    createSankeyDiagram(data, containerId) {
        // Not implemented - using Chart.js alternatives
        return null;
    }

    createForceDirectedGraph(data, containerId) {
        // Not implemented - using Chart.js alternatives
        return null;
    }

    updateTheme(isDark) {
        // Theme handled by CSS variables
        return null;
    }

    destroy() {
        // No cleanup needed
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
