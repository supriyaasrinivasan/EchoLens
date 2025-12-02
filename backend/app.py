
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
import os
import logging
from logging.handlers import RotatingFileHandler

from ai_engine import AIAnalysisEngine
from recommendation_engine import MLRecommendationEngine
from config import get_config, ensure_directories

ensure_directories()

app = Flask(__name__)

cors_config = get_config('cors')
CORS(app, origins=cors_config['origins'], 
     methods=cors_config['methods'],
     allow_headers=cors_config['allow_headers'])

log_config = get_config('logging')
log_dir = os.path.dirname(log_config['log_file'])
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

handler = RotatingFileHandler(
    log_config['log_file'],
    maxBytes=log_config['max_bytes'],
    backupCount=log_config['backup_count']
)
handler.setFormatter(logging.Formatter(log_config['format']))
app.logger.addHandler(handler)
app.logger.setLevel(getattr(logging, log_config['level']))

console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(log_config['format']))
app.logger.addHandler(console_handler)

db_config = get_config('database')
DB_PATH = str(db_config['path'])

ai_engine = AIAnalysisEngine()
recommendation_engine = MLRecommendationEngine()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            domain TEXT,
            title TEXT,
            category TEXT,
            topics TEXT,
            duration INTEGER,
            engagement_score REAL,
            scroll_depth REAL,
            date TEXT,
            timestamp INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    ''')
    ''')
    ''')
    ''')
    ''')
    """Health check endpoint with AI model status"""
    """
    """
    """Store learning sessions in database"""
            ''', (
    """Store or update topics in database"""
            ''', (
    """Update user profile"""
        ''', (
    """Store or update skills"""
            ''', (
    """Store AI-generated insights"""
            ''', (
    """Store generated recommendations"""
            ''', (
    """Get analytics data with computed statistics"""
        ''', (start_str,))
    """Get current recommendations with metadata"""
            ''', (category, limit))
    """Get detected learning patterns"""
    """Get or update user profile"""
    """Analyze specific content using AI"""
    """Run topic modeling on provided text"""
    """Comprehensive status endpoint with AI model information"""