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
log_dir = os.path.dirname(str(log_config['log_file']))
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

handler = RotatingFileHandler(
    str(log_config['log_file']),
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
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            insight_type TEXT,
            content TEXT,
            confidence REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
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


init_db()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint with AI model status"""
    ai_status = ai_engine.get_status()
    rec_status = recommendation_engine.get_status()
    
    return jsonify({
        'status': 'healthy',
        'service': 'SupriAI Backend',
        'version': '2.0.0',
        'ai_engine': ai_status,
        'recommendation_engine': rec_status,
        'timestamp': datetime.now().isoformat()
    })


@app.route('/api/sync', methods=['POST'])
def sync_data():
    """Store learning sessions in database"""
    try:
        data = request.json or {}
        sessions = data.get('sessions', [])
        topics = data.get('topics', [])
        profile = data.get('profile', {})
        skills = data.get('skills', [])
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Store sessions
        sessions_stored = 0
        for session in sessions:
            try:
                cursor.execute('''
                    INSERT INTO sessions (url, domain, title, category, topics, duration,
                        engagement_score, scroll_depth, date, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    session.get('url', ''),
                    session.get('domain', ''),
                    session.get('title', 'Unknown'),
                    session.get('category', 'General'),
                    json.dumps(session.get('topics', [])),
                    session.get('duration', 0),
                    session.get('engagementScore', 0),
                    session.get('scrollDepth', 0),
                    session.get('date', datetime.now().strftime('%Y-%m-%d')),
                    session.get('timestamp', int(datetime.now().timestamp() * 1000))
                ))
                sessions_stored += 1
            except Exception as e:
                app.logger.warning(f"Failed to store session: {e}")
        
        # Store topics
        for topic in topics:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO topics (name, category, total_time, session_count, avg_engagement, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    topic.get('name', 'Unknown'),
                    topic.get('category', 'General'),
                    topic.get('totalTime', 0),
                    topic.get('sessionCount', 0),
                    topic.get('averageEngagement', 0),
                    datetime.now().isoformat()
                ))
            except Exception as e:
                app.logger.warning(f"Failed to store topic: {e}")
        
        # Update profile
        if profile:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO user_profile 
                    (id, interest_clusters, learning_style, skill_level, preferred_categories, weekly_goal, updated_at)
                    VALUES (1, ?, ?, ?, ?, ?, ?)
                ''', (
                    json.dumps(profile.get('interestClusters', [])),
                    profile.get('learningStyle', 'balanced'),
                    profile.get('skillLevel', 'beginner'),
                    json.dumps(profile.get('preferredCategories', [])),
                    profile.get('weeklyGoal', 0),
                    datetime.now().isoformat()
                ))
            except Exception as e:
                app.logger.warning(f"Failed to update profile: {e}")
        
        # Store skills
        for skill in skills:
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO skills (name, category, experience, level, last_practiced, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    skill.get('name', 'Unknown'),
                    skill.get('category', 'General'),
                    skill.get('experience', 0),
                    skill.get('level', 0),
                    skill.get('lastPracticed'),
                    datetime.now().isoformat()
                ))
            except Exception as e:
                app.logger.warning(f"Failed to store skill: {e}")
        
        conn.commit()
        conn.close()
        
        # Generate AI insights
        insights = ai_engine.analyze(sessions, topics)
        
        # Generate recommendations
        recommendations = recommendation_engine.generate(sessions, topics, profile, skills)
        
        # Store insights
        conn = get_db()
        cursor = conn.cursor()
        for insight in insights:
            try:
                cursor.execute('''
                    INSERT INTO ai_insights (insight_type, content, confidence)
                    VALUES (?, ?, ?)
                ''', (
                    insight.get('type', 'general'),
                    json.dumps(insight),
                    insight.get('confidence', 0.5)
                ))
            except Exception as e:
                app.logger.warning(f"Failed to store insight: {e}")
        
        # Store recommendations
        cursor.execute('DELETE FROM recommendations')
        for rec in recommendations:
            try:
                cursor.execute('''
                    INSERT INTO recommendations (title, description, url, rec_type, priority, topic, category, score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    rec.get('title', ''),
                    rec.get('description', ''),
                    rec.get('url'),
                    rec.get('type', 'suggestion'),
                    rec.get('priority', 'medium'),
                    rec.get('topic'),
                    rec.get('category'),
                    rec.get('score', 0.5)
                ))
            except Exception as e:
                app.logger.warning(f"Failed to store recommendation: {e}")
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'code': 'SYNC_COMPLETE',
            'data': {
                'sessions_stored': sessions_stored,
                'topics_processed': len(topics),
                'skills_updated': len(skills),
                'insights_generated': len(insights),
                'recommendations_generated': len(recommendations)
            },
            'insights': insights,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Sync error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'code': 'SYNC_ERROR'
        }), 500


@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data with computed statistics"""
    try:
        time_range = request.args.get('range', 'week')
        days_ago = {'day': 1, 'week': 7, 'month': 30, 'year': 365}.get(time_range, 7)
        
        start_date = datetime.now() - timedelta(days=days_ago)
        start_str = start_date.strftime('%Y-%m-%d')
        
        conn = get_db()
        cursor = conn.cursor()
        
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
            row_dict = dict(row)
            try:
                row_dict['content'] = json.loads(row_dict.get('content', '{}'))
            except:
                pass
            insights.append(row_dict)
        
        conn.close()
        
        # Calculate statistics
        total_time = sum(s.get('duration', 0) for s in sessions)
        avg_engagement = round(sum(s.get('engagement_score', 0) for s in sessions) / max(len(sessions), 1))
        unique_topics = len(set(t.get('name') for t in topics))
        unique_days = len(set(s.get('date') for s in sessions))
        
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
                'totalSessions': len(sessions),
                'avgEngagement': avg_engagement,
                'uniqueTopics': unique_topics,
                'uniqueDays': unique_days,
                'categoryBreakdown': category_stats
            },
            'timeRange': time_range,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Analytics error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    """Get current recommendations with metadata"""
    try:
        limit = int(request.args.get('limit', 10))
        category = request.args.get('category')
        
        conn = get_db()
        cursor = conn.cursor()
        
        if category:
            cursor.execute('''
                SELECT * FROM recommendations WHERE category = ? ORDER BY score DESC LIMIT ?
            ''', (category, limit))
        else:
            cursor.execute('''
                SELECT * FROM recommendations ORDER BY score DESC LIMIT ?
            ''', (limit,))
        
        recommendations = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT COUNT(*) as total FROM recommendations')
        total = cursor.fetchone()['total']
        
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
        app.logger.error(f"Recommendations error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/patterns', methods=['GET'])
def get_patterns():
    """Get detected learning patterns"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 100')
        sessions = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute('SELECT * FROM topics ORDER BY total_time DESC')
        topics = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        patterns = ai_engine.detect_learning_patterns(sessions)
        
        return jsonify({
            'success': True,
            'patterns': patterns,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Patterns error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/profile', methods=['GET', 'POST'])
def handle_profile():
    """Get or update user profile"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        if request.method == 'GET':
            cursor.execute('SELECT * FROM user_profile WHERE id = 1')
            row = cursor.fetchone()
            conn.close()
            
            if row:
                profile = dict(row)
                try:
                    profile['interest_clusters'] = json.loads(profile.get('interest_clusters', '[]'))
                    profile['preferred_categories'] = json.loads(profile.get('preferred_categories', '[]'))
                except:
                    pass
                return jsonify({'success': True, 'profile': profile})
            else:
                return jsonify({'success': True, 'profile': {}})
        
        elif request.method == 'POST':
            data = request.json or {}
            cursor.execute('''
                INSERT OR REPLACE INTO user_profile 
                (id, interest_clusters, learning_style, skill_level, preferred_categories, weekly_goal, updated_at)
                VALUES (1, ?, ?, ?, ?, ?, ?)
            ''', (
                json.dumps(data.get('interestClusters', [])),
                data.get('learningStyle', 'balanced'),
                data.get('skillLevel', 'beginner'),
                json.dumps(data.get('preferredCategories', [])),
                data.get('weeklyGoal', 0),
                datetime.now().isoformat()
            ))
            conn.commit()
            conn.close()
            
            return jsonify({'success': True, 'message': 'Profile updated'})
            
    except Exception as e:
        app.logger.error(f"Profile error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_content():
    """Analyze specific content using AI"""
    try:
        data = request.json or {}
        url = data.get('url', '')
        title = data.get('title', '')
        content = data.get('content', '')
        
        analysis = ai_engine.analyze_content(url, title, content)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Analysis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/topic-modeling', methods=['POST'])
def topic_modeling():
    """Run topic modeling on provided text"""
    try:
        data = request.json or {}
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({
                'success': False,
                'error': 'No texts provided'
            }), 400
        
        topics = ai_engine.extract_topics(texts)
        
        return jsonify({
            'success': True,
            'topics': topics,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Topic modeling error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/learning-path', methods=['POST'])
def get_learning_path():
    """Generate personalized learning path using ML"""
    try:
        data = request.json or {}
        sessions = data.get('sessions', [])
        topics = data.get('topics', [])
        skills = data.get('skills', [])
        
        # Generate learning path
        learning_path = recommendation_engine.generate_personalized_path(sessions, topics, skills)
        
        # Predict next topic
        next_topic = recommendation_engine.predict_next_topic(sessions, topics)
        
        return jsonify({
            'success': True,
            'learning_path': learning_path,
            'next_topic_prediction': next_topic,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Learning path error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/knowledge-gaps', methods=['POST'])
def get_knowledge_gaps():
    """Identify knowledge gaps using ML analysis"""
    try:
        data = request.json or {}
        topics = data.get('topics', [])
        skills = data.get('skills', [])
        
        # Calculate knowledge gaps
        gaps = recommendation_engine.calculate_knowledge_gaps(topics, skills)
        
        return jsonify({
            'success': True,
            'knowledge_gaps': gaps,
            'total_gaps': len(gaps),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Knowledge gaps error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/predict-engagement', methods=['POST'])
def predict_engagement():
    """Predict engagement score for content using ML"""
    try:
        data = request.json or {}
        url = data.get('url', '')
        title = data.get('title', '')
        content = data.get('content', '')
        
        if not url and not title:
            return jsonify({
                'success': False,
                'error': 'URL or title required'
            }), 400
        
        # Analyze content
        analysis = ai_engine.analyze_content(url, title, content)
        
        # Calculate predicted engagement based on past similar content
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT AVG(engagement_score) as avg_engagement, COUNT(*) as count
            FROM sessions 
            WHERE category = ?
        ''', (analysis.get('category', 'general'),))
        
        result = cursor.fetchone()
        conn.close()
        
        predicted_engagement = result['avg_engagement'] if result['avg_engagement'] else 50
        sample_size = result['count'] if result['count'] else 0
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'predicted_engagement': round(predicted_engagement, 1),
            'confidence': min(0.5 + (sample_size / 100), 0.95),
            'sample_size': sample_size,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Engagement prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """Comprehensive status endpoint with AI model information"""
    try:
        ai_status = ai_engine.get_status()
        rec_status = recommendation_engine.get_status()
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) as count FROM sessions')
        sessions_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM topics')
        topics_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM recommendations')
        recs_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM ai_insights')
        insights_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT COUNT(*) as count FROM skills')
        skills_count = cursor.fetchone()['count']
        
        cursor.execute('SELECT MAX(created_at) as last FROM sessions')
        last_activity = cursor.fetchone()['last']
        
        conn.close()
        
        return jsonify({
            'service': 'SupriAI Backend',
            'version': '2.0.0',
            'status': 'operational',
            'database': {
                'status': 'connected',
                'data': {
                    'sessions': sessions_count,
                    'topics': topics_count,
                    'recommendations': recs_count,
                    'insights': insights_count,
                    'skills': skills_count
                },
                'last_activity': last_activity
            },
            'ai_models': {
                'ai_engine': ai_status,
                'recommendation_engine': rec_status
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        app.logger.error(f"Status error: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


if __name__ == '__main__':
    server_config = get_config('server')
    print('=' * 60)
    print('SupriAI Backend Server (Flask + AI Engine)')
    print(f"Server URL: http://localhost:{server_config['port']}")
    print(f"Health Check: http://localhost:{server_config['port']}/api/health")
    print('=' * 60)
    
    app.run(
        host=server_config['host'],
        port=server_config['port'],
        debug=server_config['debug']
    )
