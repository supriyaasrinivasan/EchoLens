"""
SupriAI Backend Configuration
Centralized configuration for the backend server
"""

import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Server Configuration
SERVER_CONFIG = {
    'host': '0.0.0.0',  # Listen on all interfaces
    'port': 5000,        # Default port
    'debug': True,       # Enable debug mode (set False in production)
}

# Database Configuration
DATABASE_CONFIG = {
    'path': BASE_DIR / 'supriai.db',
    'timeout': 30,  # Connection timeout in seconds
}

# CORS Configuration
CORS_CONFIG = {
    'origins': '*',  # Allow all origins (customize for production)
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': ['Content-Type', 'Authorization'],
}

# AI Engine Configuration
AI_CONFIG = {
    'use_ml': True,  # Try to use ML libraries if available
    'min_confidence': 0.5,  # Minimum confidence for insights
    'max_insights': 20,  # Maximum insights to return
    'max_recommendations': 10,  # Maximum recommendations to return
}

# Logging Configuration
LOGGING_CONFIG = {
    'level': 'INFO',  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    'log_file': BASE_DIR / 'logs' / 'server.log',
    'max_bytes': 10_000_000,  # 10MB
    'backup_count': 5,
}

# API Configuration
API_CONFIG = {
    'version': '1.0.0',
    'rate_limit': 100,  # requests per minute
    'timeout': 30,  # Request timeout in seconds
}

# Data Retention Configuration
RETENTION_CONFIG = {
    'sessions_days': 90,  # Keep sessions for 90 days
    'insights_days': 30,  # Keep insights for 30 days
    'recommendations_days': 7,  # Keep recommendations for 7 days
}

# Feature Flags
FEATURES = {
    'topic_modeling': True,
    'pattern_detection': True,
    'skill_progression': True,
    'user_profiling': True,
    'ml_recommendations': True,
}

def get_config(section=None):
    """Get configuration by section or all config"""
    configs = {
        'server': SERVER_CONFIG,
        'database': DATABASE_CONFIG,
        'cors': CORS_CONFIG,
        'ai': AI_CONFIG,
        'logging': LOGGING_CONFIG,
        'api': API_CONFIG,
        'retention': RETENTION_CONFIG,
        'features': FEATURES,
    }
    
    if section:
        return configs.get(section, {})
    return configs

def ensure_directories():
    """Create necessary directories if they don't exist"""
    dirs = [
        BASE_DIR / 'logs',
        BASE_DIR / 'data',
    ]
    
    for directory in dirs:
        directory.mkdir(exist_ok=True)

# Create directories on import
ensure_directories()
