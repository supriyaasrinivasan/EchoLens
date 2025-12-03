const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 5000;
const DB_PATH = path.join(__dirname, 'supriai.db');

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS sessions (
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
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            category TEXT,
            total_time INTEGER DEFAULT 0,
            session_count INTEGER DEFAULT 0,
            avg_engagement REAL DEFAULT 0,
            embeddings TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS user_profile (
            id INTEGER PRIMARY KEY,
            interest_clusters TEXT,
            learning_style TEXT,
            skill_level TEXT,
            preferred_categories TEXT,
            weekly_goal INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS ai_insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            insight_type TEXT,
            content TEXT,
            confidence REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS recommendations (
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
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS learning_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pattern_type TEXT,
            pattern_data TEXT,
            confidence REAL,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            category TEXT,
            experience INTEGER DEFAULT 0,
            level INTEGER DEFAULT 0,
            last_practiced DATETIME,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

function callPythonAI(action, data) {
    return new Promise((resolve, reject) => {
        const python = spawn('python', [path.join(__dirname, 'ai_service.py'), action, JSON.stringify(data)]);
        let result = '';
        let error = '';

        python.stdout.on('data', (data) => {
            result += data.toString();
        });

        python.stderr.on('data', (data) => {
            error += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(error || 'Python process failed'));
            } else {
                try {
                    resolve(JSON.parse(result));
                } catch (e) {
                    resolve({ success: true, data: result });
                }
            }
        });
    });
}

app.get('/api/health', async (req, res) => {
    try {
        let aiStatus = { available: false, mode: 'Basic' };
        try {
            aiStatus = await callPythonAI('status', {});
        } catch (aiError) {
            console.log('AI engine check failed (non-critical):', aiError.message);
        }
        
        db.get('SELECT COUNT(*) as count FROM sessions', (err, sessionCount) => {
            db.get('SELECT COUNT(*) as count FROM topics', (err2, topicCount) => {
                db.get('SELECT COUNT(*) as count FROM recommendations', (err3, recCount) => {
                    res.json({
                        status: 'healthy',
                        service: 'SupriAI Backend',
                        version: '2.0.0',
                        database: {
                            status: 'connected',
                            sessions: sessionCount?.count || 0,
                            topics: topicCount?.count || 0,
                            recommendations: recCount?.count || 0
                        },
                        ai_engine: aiStatus,
                        timestamp: new Date().toISOString()
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            service: 'SupriAI Backend',
            version: '2.0.0',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/sync', async (req, res) => {
    try {
        const { sessions = [], topics = [], profile = {}, skills = [] } = req.body;

        let storedSessions = 0;
        for (const session of sessions) {
            await new Promise((resolve, reject) => {
                db.run(`INSERT INTO sessions (url, domain, title, category, topics, duration, 
                        engagement_score, scroll_depth, date, timestamp)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [session.url, session.domain, session.title || 'Unknown', session.category,
                    JSON.stringify(session.topics || []), session.duration || 0,
                    session.engagementScore || 0, session.scrollDepth || 0,
                    session.date, session.timestamp || Date.now()],
                    (err) => {
                        if (err) reject(err);
                        else {
                            storedSessions++;
                            resolve();
                        }
                    }
                );
            }).catch(() => {});
        }

        for (const topic of topics) {
            await new Promise((resolve) => {
                db.run(`INSERT OR REPLACE INTO topics (name, category, total_time, session_count, avg_engagement, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [topic.name, topic.category, topic.totalTime || 0, topic.sessionCount || 0,
                    topic.averageEngagement || 0, new Date().toISOString()],
                    () => resolve()
                );
            });
        }

        if (Object.keys(profile).length > 0) {
            await new Promise((resolve) => {
                db.run(`INSERT OR REPLACE INTO user_profile 
                        (id, interest_clusters, learning_style, skill_level, preferred_categories, weekly_goal, updated_at)
                        VALUES (1, ?, ?, ?, ?, ?, ?)`,
                    [JSON.stringify(profile.interestClusters || []), profile.learningStyle,
                    profile.skillLevel, JSON.stringify(profile.preferredCategories || []),
                    profile.weeklyGoal || 0, new Date().toISOString()],
                    () => resolve()
                );
            });
        }

        for (const skill of skills) {
            await new Promise((resolve) => {
                db.run(`INSERT OR REPLACE INTO skills (name, category, experience, level, last_practiced, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [skill.name, skill.category, skill.experience || 0, skill.level || 0,
                    skill.lastPracticed, new Date().toISOString()],
                    () => resolve()
                );
            });
        }

        const insights = await callPythonAI('analyze', { sessions, topics }).catch(() => ({ insights: [] }));
        const recommendations = await callPythonAI('recommend', { sessions, topics, profile, skills }).catch(() => ({ recommendations: [] }));

        for (const insight of insights.insights || []) {
            await new Promise((resolve) => {
                db.run(`INSERT INTO ai_insights (insight_type, content, confidence)
                        VALUES (?, ?, ?)`,
                    [insight.type, JSON.stringify(insight), insight.confidence || 0.8],
                    () => resolve()
                );
            });
        }

        await new Promise((resolve) => {
            db.run('DELETE FROM recommendations', () => resolve());
        });

        for (const rec of recommendations.recommendations || []) {
            await new Promise((resolve) => {
                db.run(`INSERT INTO recommendations (title, description, url, rec_type, priority, topic, category, score)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [rec.title, rec.description, rec.url, rec.type, rec.priority,
                    rec.topic, rec.category, rec.score || 0.5],
                    () => resolve()
                );
            });
        }

        res.json({
            success: true,
            code: 'SYNC_COMPLETE',
            data: {
                sessions_stored: storedSessions,
                topics_processed: topics.length,
                skills_updated: skills.length,
                insights_generated: insights.insights?.length || 0,
                recommendations_generated: recommendations.recommendations?.length || 0
            },
            insights: insights.insights || [],
            recommendations: recommendations.recommendations || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: 'SYNC_ERROR'
        });
    }
});

app.get('/api/analytics', (req, res) => {
    const timeRange = req.query.range || 'week';
    const daysAgo = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    const startStr = startDate.toISOString().split('T')[0];

    db.all('SELECT * FROM sessions WHERE date >= ? ORDER BY timestamp DESC', [startStr], (err, sessions) => {
        db.all('SELECT * FROM topics ORDER BY total_time DESC', [], (err2, topics) => {
            db.all('SELECT * FROM ai_insights ORDER BY created_at DESC LIMIT 20', [], (err3, insightsRaw) => {
                const insights = insightsRaw.map(row => {
                    try {
                        return { ...row, content: JSON.parse(row.content) };
                    } catch {
                        return row;
                    }
                });

                const totalTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
                const avgEngagement = sessions.length > 0 ? 
                    Math.round(sessions.reduce((acc, s) => acc + (s.engagement_score || 0), 0) / sessions.length) : 0;
                const uniqueTopics = new Set(topics.map(t => t.name)).size;
                const uniqueDays = new Set(sessions.map(s => s.date)).size;

                const categoryStats = {};
                sessions.forEach(s => {
                    const cat = s.category || 'Other';
                    if (!categoryStats[cat]) categoryStats[cat] = { count: 0, time: 0 };
                    categoryStats[cat].count++;
                    categoryStats[cat].time += s.duration || 0;
                });

                res.json({
                    success: true,
                    data: { sessions, topics, insights },
                    summary: {
                        totalTime,
                        totalSessions: sessions.length,
                        avgEngagement,
                        uniqueTopics,
                        uniqueDays,
                        categoryBreakdown: categoryStats
                    },
                    timeRange,
                    timestamp: new Date().toISOString()
                });
            });
        });
    });
});

app.get('/api/recommendations', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;

    const query = category ? 
        'SELECT * FROM recommendations WHERE category = ? ORDER BY score DESC LIMIT ?' :
        'SELECT * FROM recommendations ORDER BY score DESC LIMIT ?';
    const params = category ? [category, limit] : [limit];

    db.all(query, params, (err, recommendations) => {
        db.get('SELECT COUNT(*) as total FROM recommendations', (err2, countResult) => {
            res.json({
                success: true,
                recommendations: recommendations || [],
                metadata: {
                    total: countResult?.total || 0,
                    returned: recommendations?.length || 0,
                    limit,
                    category
                },
                timestamp: new Date().toISOString()
            });
        });
    });
});

app.get('/api/status', async (req, res) => {
    try {
        let aiStatus = { available: false, mode: 'Basic' };
        try {
            aiStatus = await callPythonAI('status', {});
        } catch (aiError) {
            console.log('AI engine check failed (non-critical)');
        }

        db.get('SELECT COUNT(*) as count FROM sessions', (err, sessions) => {
            db.get('SELECT COUNT(*) as count FROM topics', (err2, topics) => {
                db.get('SELECT COUNT(*) as count FROM recommendations', (err3, recs) => {
                    db.get('SELECT COUNT(*) as count FROM ai_insights', (err4, insights) => {
                        db.get('SELECT COUNT(*) as count FROM skills', (err5, skills) => {
                            db.get('SELECT MAX(created_at) as last FROM sessions', (err6, lastActivity) => {
                                res.json({
                                    service: 'SupriAI Backend',
                                    version: '2.0.0',
                                    status: 'operational',
                                    database: {
                                        status: 'connected',
                                        data: {
                                            sessions: sessions?.count || 0,
                                            topics: topics?.count || 0,
                                            recommendations: recs?.count || 0,
                                            insights: insights?.count || 0,
                                            skills: skills?.count || 0
                                        },
                                        last_activity: lastActivity?.last
                                    },
                                    ai_models: aiStatus,
                                    timestamp: new Date().toISOString()
                                });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('SupriAI Backend Server (Node.js + Python AI)');
    console.log(`Server URL: http://localhost:${PORT}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\nError: Port ${PORT} is already in use.`);
        console.error('Please close any other applications using this port, or run:');
        console.error('  Windows: netstat -ano | findstr :5000');
        console.error('  Then: taskkill /PID <PID> /F\n');
        process.exit(1);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

let isShuttingDown = false;

function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
        db.close();
        console.log('Server closed.');
        process.exit(0);
    });
    
    // Force exit after 5 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error('Forcing shutdown...');
        process.exit(1);
    }, 5000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
