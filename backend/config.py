
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent

SERVER_CONFIG = {
    'host': '0.0.0.0',
    'port': 5000,
    'debug': True,
}

DATABASE_CONFIG = {
    'path': BASE_DIR / 'supriai.db',
    'timeout': 30,
}

CORS_CONFIG = {
    'origins': '*',
    'methods': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allow_headers': ['Content-Type', 'Authorization'],
}

AI_CONFIG = {
    'use_ml': True,
    'min_confidence': 0.5,
    'max_insights': 20,
    'max_recommendations': 10,
}

LOGGING_CONFIG = {
    'level': 'INFO',
    'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    'log_file': BASE_DIR / 'logs' / 'server.log',
    'max_bytes': 10_000_000,
    'backup_count': 5,
}

API_CONFIG = {
    'version': '1.0.0',
    'rate_limit': 100,
    'timeout': 30,
}

RETENTION_CONFIG = {
    'sessions_days': 90,
    'insights_days': 30,
    'recommendations_days': 7,
}

FEATURES = {
    'topic_modeling': True,
    'pattern_detection': True,
    'skill_progression': True,
    'user_profiling': True,
    'ml_recommendations': True,
}

def get_config(section=None):
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
    dirs = [
        BASE_DIR / 'logs',
        BASE_DIR / 'data',
    ]
    
    for directory in dirs:
        directory.mkdir(exist_ok=True)

ensure_directories()
