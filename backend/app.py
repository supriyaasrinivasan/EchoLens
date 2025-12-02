"""
SupriAI - Python Backend Server
Flask-based API server with SQLite database for AI analysis
"""

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

# Ensure directories exist
ensure_directories()

app = Flask(__name__)

# Configure CORS
cors_config = get_config('cors')
CORS(app, origins=cors_config['origins'], 
     methods=cors_config['methods'],
     allow_headers=cors_config['allow_headers'])

# Configure logging
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

# Also log to console
console_handler = logging.StreamHandler()
console_handler.setFormatter(logging.Formatter(log_config['format']))
app.logger.addHandler(console_handler)

# Database path
db_config = get_config('database')
DB_PATH = str(db_config['path'])

# Initialize AI engines
ai_engine = AIAnalysisEngine()
recommendation_engine = MLRecommendationEngine()


def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Sessions table
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
    
    # Topics table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            category TEXT,
            total_time INTEGER DEFAULT 0,
            session_count INTEGER DEFAULT 0,
            avg_engagement REAL DEFAULT 0,
            embeddings TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # User profile table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY,
            interest_clusters TEXT,
            learning_style TEXT,
            skill_level TEXT,
            preferred_categories TEXT,
            weekly_goal INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # AI Insights table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            insight_type TEXT,
            content TEXT,
            confidence REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Recommendations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            url TEXT,
            rec_type TEXT,
            priority TEXT,
            topic TEXT,
            category TEXT,
            score REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Learning patterns table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pattern_type TEXT,
            pattern_data TEXT,
            confidence REAL,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Skills progression table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            category TEXT,
            experience INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            last_practiced DATETIME,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully")


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    app.logger.info("Health check requested")
    
    # Verify database connection
    db_status = 'connected'
    session_count = 0
    topic_count = 0
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM sessions')
        session_count = cursor.fetchone()[0]
        cursor.execute('SELECT COUNT(*) FROM topics')
        topic_count = cursor.fetchone()[0]
        cursor.execute('SELECT COUNT(*) FROM recommendations')
        rec_count = cursor.fetchone()[0]
        conn.close()
        app.logger.info(f"Database check: {session_count} sessions, {topic_count} topics, {rec_count} recommendations")
    except Exception as e:
        db_status = f'error: {str(e)}'
        app.logger.error(f"Database health check failed: {e}")
    
    api_config = get_config('api')
    health_status = {
        'status': 'healthy' if db_status == 'connected' else 'degraded',
        'service': 'SupriAI Backend',
        'version': api_config['version'],
        'database': {
            'status': db_status,
            'sessions': session_count,
            'topics': topic_count,
            'recommendations': rec_count if db_status == 'connected' else 0
        },
        'ai_engine': 'ready',
        'recommendation_engine': 'ready',
        'timestamp': datetime.now().isoformat()
    }
    
    return jsonify(health_status)


@app.route('/api/sync', methods=['POST'])
def sync_data():
    """
    Main sync endpoint - receives data from Chrome extension
    Performs AI analysis and returns insights + recommendations
    """
    app.logger.info("Sync request received")
    
    try:
        data = request.json
        
        if not data:
            app.logger.warning("Sync request with no data")
            return jsonify({
                'success': False,
                'error': 'No data provided',
                'code': 'EMPTY_REQUEST'
            }), 400
        
        # Validate required fields
        sessions = data.get('sessions', [])
        if not isinstance(sessions, list):
            app.logger.warning(f"Invalid sessions type: {type(sessions)}")
            return jsonify({
                'success': False,
                'error': 'Sessions must be an array',
                'code': 'INVALID_SESSIONS'
            }), 400
        
        app.logger.info(f"Processing {len(sessions)} sessions")
        
        # Store sessions with validation
        stored_sessions = store_sessions(sessions)
        
        # Update topics
        topics = data.get('topics', [])
        if isinstance(topics, list):
            store_topics(topics)
        
        # Update user profile
        profile = data.get('profile', {})
        if isinstance(profile, dict):
            update_profile(profile)
        
        # Update skills
        skills = data.get('skills', [])
        if isinstance(skills, list):
            store_skills(skills)
        
        # Run AI analysis
        try:
            app.logger.info("Running AI analysis...")
            insights = ai_engine.analyze(sessions, topics)
            app.logger.info(f"Generated {len(insights)} insights")
        except Exception as ai_error:
            app.logger.error(f"AI analysis error: {ai_error}", exc_info=True)
            insights = [{
                'type': 'error',
                'title': 'Analysis Error',
                'description': 'Could not generate insights',
                'confidence': 0
            }]
        
        # Generate ML-based recommendations
        try:
            app.logger.info("Generating recommendations...")
            recommendations = recommendation_engine.generate(
                sessions=sessions,
                topics=topics,
                profile=profile,
                skills=skills
            )
            app.logger.info(f"Generated {len(recommendations)} recommendations")
        except Exception as rec_error:
            app.logger.error(f"Recommendation error: {rec_error}", exc_info=True)
            recommendations = []
        
        # Store insights and recommendations
        store_insights(insights)
        store_recommendations(recommendations)
        
        response_data = {
            'success': True,
            'code': 'SYNC_COMPLETE',
            'data': {
                'sessions_stored': stored_sessions,
                'topics_processed': len(topics),
                'skills_updated': len(skills),
                'insights_generated': len(insights),
                'recommendations_generated': len(recommendations)
            },
            'insights': insights,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }
        
        app.logger.info(f"Sync completed successfully: {stored_sessions} sessions, {len(insights)} insights, {len(recommendations)} recommendations")
        return jsonify(response_data)
        
    except json.JSONDecodeError as e:
        app.logger.error(f"JSON decode error: {e}")
        return jsonify({
            'success': False,
            'error': 'Invalid JSON data',
            'code': 'INVALID_JSON'
        }), 400
    except Exception as e:
        app.logger.error(f"Sync error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'SYNC_ERROR'
        }), 500


def store_sessions(sessions):
    """Store learning sessions in database"""
    conn = get_db()
    cursor = conn.cursor()
    stored = 0
    
    for session in sessions:
        try:
            cursor.execute('''
                INSERT INTO sessions (url, domain, title, category, topics, duration, 
                                     engagement_score, scroll_depth, date, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                session.get('url'),
                session.get('domain'),
                session.get('title', 'Unknown'),
                session.get('category'),
                json.dumps(session.get('topics', [])),
                session.get('duration', 0),
                session.get('engagementScore', 0),
                session.get('scrollDepth', 0),
                session.get('date'),
                session.get('timestamp', int(datetime.now().timestamp() * 1000))
            ))
            stored += 1
        except Exception as e:
            print(f"Error storing session: {e}")
    
    conn.commit()
    conn.close()
    return stored


def store_topics(topics):
    """Store or update topics in database"""
    conn = get_db()
    cursor = conn.cursor()
    
    for topic in topics:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO topics (name, category, total_time, session_count, avg_engagement, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                topic.get('name'),
                topic.get('category'),
                topic.get('totalTime', 0),
                topic.get('sessionCount', 0),
                topic.get('averageEngagement', 0),
                datetime.now().isoformat()
            ))
        except Exception as e:
            print(f"Error storing topic: {e}")
    
    conn.commit()
    conn.close()


def update_profile(profile):
    """Update user profile"""
    if not profile:
        return
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT OR REPLACE INTO user_profile 
            (id, interest_clusters, learning_style, skill_level, preferred_categories, weekly_goal, updated_at)
            VALUES (1, ?, ?, ?, ?, ?, ?)
        ''', (
            json.dumps(profile.get('interestClusters', [])),
            profile.get('learningStyle'),
            profile.get('skillLevel'),
            json.dumps(profile.get('preferredCategories', [])),
            profile.get('weeklyGoal', 0),
            datetime.now().isoformat()
        ))
    except Exception as e:
        print(f"Error updating profile: {e}")
    
    conn.commit()
    conn.close()


def store_skills(skills):
    """Store or update skills"""
    conn = get_db()
    cursor = conn.cursor()
    
    for skill in skills:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO skills (name, category, experience, level, last_practiced, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                skill.get('name'),
                skill.get('category'),
                skill.get('experience', 0),
                skill.get('level', 0),
                skill.get('lastPracticed'),
                datetime.now().isoformat()
            ))
        except Exception as e:
            print(f"Error storing skill: {e}")
    
    conn.commit()
    conn.close()


def store_insights(insights):
    """Store AI-generated insights"""
    conn = get_db()
    cursor = conn.cursor()
    
    for insight in insights:
        try:
            cursor.execute('''
                INSERT INTO ai_insights (insight_type, content, confidence)
                VALUES (?, ?, ?)
            ''', (
                insight.get('type'),
                json.dumps(insight),
                insight.get('confidence', 0.8)
            ))
        except Exception as e:
            print(f"Error storing insight: {e}")
    
    conn.commit()
    conn.close()


def store_recommendations(recommendations):
    """Store generated recommendations"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Clear old recommendations
    cursor.execute('DELETE FROM recommendations')
    
    for rec in recommendations:
        try:
            cursor.execute('''
                INSERT INTO recommendations (title, description, url, rec_type, priority, topic, category, score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                rec.get('title'),
                rec.get('description'),
                rec.get('url'),
                rec.get('type'),
                rec.get('priority'),
                rec.get('topic'),
                rec.get('category'),
                rec.get('score', 0.5)
            ))
        except Exception as e:
            print(f"Error storing recommendation: {e}")
    
    conn.commit()
    conn.close()


@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data with computed statistics"""
    try:
        time_range = request.args.get('range', 'week')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Calculate date range
        end_date = datetime.now()
        if time_range == 'day':
            start_date = end_date - timedelta(days=1)
        elif time_range == 'week':
            start_date = end_date - timedelta(weeks=1)
        elif time_range == 'month':
            start_date = end_date - timedelta(days=30)
        else:
            start_date = end_date - timedelta(days=365)
        
        start_str = start_date.strftime('%Y-%m-%d')
        
        # Get sessions
        cursor.execute('''
            SELECT * FROM sessions WHERE date >= ? ORDER BY timestamp DESC
        ''', (start_str,))
        sessions = [dict(row) for row in cursor.fetchall()]
        
        # Get topics
        cursor.execute('SELECT * FROM topics ORDER BY total_time DESC')
        topics = [dict(row) for row in cursor.fetchall()]
        
        # Get insights
        cursor.execute('SELECT * FROM ai_insights ORDER BY created_at DESC LIMIT 20')
        insights_raw = cursor.fetchall()
        insights = []
        for row in insights_raw:
            try:
                insight = dict(row)
                if insight.get('content'):
                    insight['content'] = json.loads(insight['content'])
                insights.append(insight)
            except:
                insights.append(dict(row))
        
        conn.close()
        
        # Calculate summary statistics
        total_time = sum(s.get('duration', 0) for s in sessions)
        total_sessions = len(sessions)
        avg_engagement = round(sum(s.get('engagement_score', 0) for s in sessions) / max(total_sessions, 1), 1)
        unique_topics = len(set(t.get('name') for t in topics if t.get('name')))
        unique_days = len(set(s.get('date') for s in sessions if s.get('date')))
        
        # Category breakdown
        category_stats = {}
        for s in sessions:
            cat = s.get('category', 'Other')
            if cat not in category_stats:
                category_stats[cat] = {'count': 0, 'time': 0}
            category_stats[cat]['count'] += 1
            category_stats[cat]['time'] += s.get('duration', 0)
        
        return jsonify({
            'success': True,
            'data': {
                'sessions': sessions,
                'topics': topics,
                'insights': insights
            },
            'summary': {
                'totalTime': total_time,
                'totalSessions': total_sessions,
                'avgEngagement': avg_engagement,
                'uniqueTopics': unique_topics,
                'uniqueDays': unique_days,
                'categoryBreakdown': category_stats
            },
            'timeRange': time_range,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'ANALYTICS_ERROR'
        }), 500


@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get current recommendations with metadata"""
    try:
        limit = request.args.get('limit', 10, type=int)
        category = request.args.get('category', None)
        
        conn = get_db()
        cursor = conn.cursor()
        
        if category:
            cursor.execute('''
                SELECT * FROM recommendations 
                WHERE category = ? 
                ORDER BY score DESC LIMIT ?
            ''', (category, limit))
        else:
            cursor.execute('SELECT * FROM recommendations ORDER BY score DESC LIMIT ?', (limit,))
        
        recommendations = [dict(row) for row in cursor.fetchall()]
        
        # Get total count
        cursor.execute('SELECT COUNT(*) FROM recommendations')
        total = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'metadata': {
                'total': total,
                'returned': len(recommendations),
                'limit': limit,
                'category': category
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'RECOMMENDATIONS_ERROR'
        }), 500


@app.route('/api/patterns', methods=['GET'])
def get_patterns():
    """Get detected learning patterns"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM learning_patterns ORDER BY detected_at DESC LIMIT 10')
        patterns = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        return jsonify({'patterns': patterns})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/profile', methods=['GET', 'POST'])
def user_profile():
    """Get or update user profile"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        if request.method == 'GET':
            cursor.execute('SELECT * FROM user_profile WHERE id = 1')
            profile = cursor.fetchone()
            conn.close()
            
            if profile:
                return jsonify(dict(profile))
            return jsonify({})
        
        elif request.method == 'POST':
            data = request.json
            update_profile(data)
            return jsonify({'success': True})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    """Analyze specific content using AI"""
    try:
        data = request.json
        url = data.get('url')
        title = data.get('title')
        content = data.get('content', '')
        
        analysis = ai_engine.analyze_content(url, title, content)
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/topic-modeling', methods=['POST'])
def topic_modeling():
    """Run topic modeling on provided text"""
    try:
        data = request.json
        texts = data.get('texts', [])
        
        topics = ai_engine.extract_topics(texts)
        
        return jsonify({'topics': topics})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    init_db()
    server_config = get_config('server')
    app.logger.info("=" * 60)
    app.logger.info("Starting SupriAI Backend Server...")
    app.logger.info(f"Server URL: http://localhost:{server_config['port']}")
    app.logger.info(f"Health Check: http://localhost:{server_config['port']}/api/health")
    app.logger.info("=" * 60)
    
    app.run(
        host=server_config['host'],
        port=server_config['port'],
        debug=server_config['debug']
    )
