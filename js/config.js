const CONFIG = {
    BACKEND_URL: 'http://localhost:5000',
    
    BACKEND_ENABLED: true,
    
    SYNC_TIMEOUT: 5000,
    
    FALLBACK_TO_LOCAL: true,
    
    AUTO_SYNC_INTERVAL: 300000,
    
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

export default CONFIG;
