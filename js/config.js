const CONFIG = {
    BACKEND_URL: 'http://localhost:5000',
    
    BACKEND_ENABLED: true,
    
    SYNC_TIMEOUT: 5000,
    
    FALLBACK_TO_LOCAL: true,
    
    AUTO_SYNC_INTERVAL: 300000,
    
    HEALTH_CHECK_INTERVAL: 30000,
    
    API_ENDPOINTS: {
        HEALTH: '/api/health',
        SYNC: '/api/sync',
        ANALYTICS: '/api/analytics',
        RECOMMENDATIONS: '/api/recommendations',
        PROFILE: '/api/profile',
        PATTERNS: '/api/patterns',
        ANALYZE: '/api/analyze',
        TOPIC_MODELING: '/api/topic-modeling'
    },
    
    RETRY_CONFIG: {
        MAX_RETRIES: 3,
        RETRY_DELAY: 1000,
        BACKOFF_MULTIPLIER: 2
    }
};


export class BackendConnection {
    constructor() {
        this.isConnected = false;
        this.lastCheckTime = 0;
        this.healthCheckTimer = null;
        this.listeners = [];
        this.detailedStatus = null;
    }

    
    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${CONFIG.BACKEND_URL}${CONFIG.API_ENDPOINTS.HEALTH}`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                this.isConnected = data.status === 'healthy';
                this.detailedStatus = data;
                this.lastCheckTime = Date.now();
                this.notifyListeners(this.isConnected ? 'connected' : 'disconnected');
                return this.isConnected;
            }
        } catch (error) {
            this.isConnected = false;
            this.detailedStatus = null;
            this.lastCheckTime = Date.now();
            this.notifyListeners('disconnected');
        }
        return false;
    }

    
    async getDetailedStatus() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${CONFIG.BACKEND_URL}/api/status`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                this.detailedStatus = await response.json();
                this.isConnected = this.detailedStatus.status === 'operational';
                return this.detailedStatus;
            }
        } catch (error) {
            console.error('Failed to get detailed status:', error);
        }
        return null;
    }

    
    startHealthChecks() {
        this.checkHealth();
        this.healthCheckTimer = setInterval(() => {
            this.checkHealth();
        }, CONFIG.HEALTH_CHECK_INTERVAL);
    }

    
    stopHealthChecks() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }

    
    addListener(callback) {
        this.listeners.push(callback);
    }

    
    notifyListeners(status) {
        this.listeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error notifying connection listener:', error);
            }
        });
    }

    
    async request(endpoint, options = {}, retries = CONFIG.RETRY_CONFIG.MAX_RETRIES) {
        const url = `${CONFIG.BACKEND_URL}${endpoint}`;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.SYNC_TIMEOUT);
                
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    this.isConnected = true;
                    return await response.json();
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                if (attempt === retries) {
                    this.isConnected = false;
                    throw error;
                }
                
                const delay = CONFIG.RETRY_CONFIG.RETRY_DELAY * 
                             Math.pow(CONFIG.RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

export default CONFIG;
