import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingUp, Clock, BookOpen, Zap, Sun, Moon, PlusCircle, Trash2, ExternalLink, Target, Brain, Activity } from 'lucide-react';

const Popup = () => {
  const [stats, setStats] = useState(null);
  const [recentMemories, setRecentMemories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillProgress, setSkillProgress] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [newSkill, setNewSkill] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
    // Load theme from storage
    chrome.storage.sync.get(['theme'], (result) => {
      if (result.theme) {
        setTheme(result.theme);
        document.documentElement.setAttribute('data-theme', result.theme);
      }
    });
  }, []);

  const sendMessage = (msg) => new Promise((resolve) => chrome.runtime.sendMessage(msg, (res) => resolve(res)));

  const loadData = async () => {
    setLoading(true);
    try {
      // General stats
      const statsResp = await sendMessage({ type: 'GET_STATS' });
      if (statsResp?.stats) setStats(statsResp.stats);

      // Recent memories
      const memResp = await sendMessage({ type: 'GET_MEMORIES', data: { limit: 5 } });
      if (memResp?.memories) setRecentMemories(memResp.memories);

      // Skills data
      const skillsResp = await sendMessage({ type: 'GET_ALL_SKILLS' });
      if (skillsResp?.skills) setSkills(skillsResp.skills);

      // Weekly skill summary
      const weeklyResp = await sendMessage({ type: 'GET_WEEKLY_SKILL_SUMMARY' });
      if (weeklyResp?.summary) setWeeklyStats(weeklyResp.summary);

      // Get skill progress for top 3 skills
      if (skillsResp?.skills && skillsResp.skills.length > 0) {
        const topSkills = skillsResp.skills.slice(0, 3);
        const progressPromises = topSkills.map(async (skill) => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          const resp = await sendMessage({ type: 'GET_SKILL_PROGRESS', data: { skill: skillName } });
          return resp?.progress || null;
        });
        const progressData = await Promise.all(progressPromises);
        setSkillProgress(progressData.filter(p => p !== null));
      }

      setLoading(false);
    } catch (err) {
      console.error('popup loadData error', err);
      setLoading(false);
    }
  };


  const openDashboard = () => {
    chrome.runtime.openOptionsPage();
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      positive: '😊',
      neutral: '😐',
      negative: '😔'
    };
    return emojis[mood] || '🤔';
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  const addSkill = async () => {
    const name = newSkill.trim();
    if (!name) return;
    setActionLoading(true);
    try {
      const resp = await sendMessage({ type: 'ADD_CUSTOM_SKILL', data: { name } });
      if (resp?.success) {
        setNewSkill('');
        await loadData();
      } else {
        console.error('Failed to add skill:', resp?.error);
        alert(`Failed to add skill: ${resp?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('addSkill error', err);
      alert('Error adding skill. Please try again.');
    }
    setActionLoading(false);
  };

  const removeSkill = async (skill) => {
    if (!confirm(`Delete skill "${skill}"? This will remove tracked entries.`)) return;
    setActionLoading(true);
    try {
      const resp = await sendMessage({ type: 'DELETE_SKILL', data: { skill } });
      if (resp?.success) await loadData();
    } catch (err) {
      console.error('removeSkill error', err);
    }
    setActionLoading(false);
  };

  const openLearningPath = async (skill) => {
    setActionLoading(true);
    try {
      const resp = await sendMessage({ type: 'GET_LEARNING_PATH', data: { skill } });
      if (resp?.success && resp.learningPath && resp.learningPath.length > 0) {
        // open first resource in new tab
        const firstResource = resp.learningPath[0];
        const url = firstResource.url || firstResource;
        window.open(url, '_blank');
      } else {
        alert(`No learning resources found for ${skill} yet.`);
      }
    } catch (err) {
      console.error('openLearningPath error', err);
      alert('Error loading learning path. Please try again.');
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="popup-container">
        <div className="loading-state">
          <Sparkles className="loading-icon" />
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="header-left">
          <div className="brand">✨ SupriAI</div>
          <div className="subtitle">Your AI Learning Companion</div>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="popup-content">
        {/* Stats Overview */}
        {stats && (
          <section className="stats-overview">
            <div className="stat-item">
              <Activity size={18} className="stat-icon" />
              <div className="stat-info">
                <div className="stat-value">{stats.totalVisits || 0}</div>
                <div className="stat-label">Sites Visited</div>
              </div>
            </div>
            <div className="stat-item">
              <Clock size={18} className="stat-icon" />
              <div className="stat-info">
                <div className="stat-value">{formatTime(stats.totalTimeSpent || 0)}</div>
                <div className="stat-label">Time Tracked</div>
              </div>
            </div>
            <div className="stat-item">
              <Brain size={18} className="stat-icon" />
              <div className="stat-info">
                <div className="stat-value">{skills.length}</div>
                <div className="stat-label">Skills Tracked</div>
              </div>
            </div>
          </section>
        )}

        {/* Skill Progress */}
        {skillProgress.length > 0 && (
          <section className="skill-progress-section">
            <h3 className="section-title">
              <TrendingUp size={16} />
              Top Skills Progress
            </h3>
            <div className="progress-list">
              {skillProgress.map((progress, idx) => (
                <div className="progress-item" key={idx}>
                  <div className="progress-header">
                    <span className="progress-name">{progress.skill}</span>
                    <span className="progress-level">Level {progress.level || 1}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.xp_percentage || 0}%` }}></div>
                  </div>
                  <div className="progress-stats">
                    <span>{progress.total_time ? formatTime(progress.total_time) : '0m'}</span>
                    <span>{progress.xp || 0} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Management */}
        <section className="skills-section">
          <h3 className="section-title">
            <Target size={16} />
            My Skills
          </h3>
          <div className="skills-input-group">
            <input 
              className="skill-input" 
              placeholder="Add a new skill (e.g., React, Python)" 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && addSkill()} 
            />
            <button className="add-btn" onClick={addSkill} disabled={actionLoading}>
              <PlusCircle size={16}/> Add
            </button>
          </div>

          <div className="skills-list">
            {skills.length === 0 && (
              <div className="empty-state">
                <BookOpen size={32} className="empty-icon" />
                <p>No skills tracked yet</p>
                <p className="empty-hint">Add your first skill above to get started!</p>
              </div>
            )}
            {skills.map((skill, idx) => {
              // Skills are now always returned as objects from getAllSkills()
              return (
                <div className="skill-item" key={idx}>
                  <div className="skill-info">
                    <div className="skill-name">{skill.name}</div>
                    {skill.total_time > 0 && <div className="skill-time">{formatTime(skill.total_time)}</div>}
                  </div>
                  <div className="skill-actions">
                    <button className="btn-icon" onClick={() => openLearningPath(skill.name)} title="Open learning resources">
                      <Zap size={14}/>
                    </button>
                    <button className="btn-icon danger" onClick={() => removeSkill(skill.name)} title="Delete skill">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        {recentMemories.length > 0 && (
          <section className="recent-section">
            <h3 className="section-title">
              <Calendar size={16} />
              Recent Activity
            </h3>
            <div className="memory-list">
              {recentMemories.slice(0, 3).map((memory, idx) => (
                <div className="memory-item" key={idx} onClick={() => window.open(memory.url, '_blank')}>
                  <div className="memory-title">{memory.title || 'Untitled'}</div>
                  <div className="memory-meta">
                    <span>{formatDate(memory.lastVisit)}</span>
                    {memory.visits > 1 && <span>• {memory.visits} visits</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Weekly Summary */}
        {weeklyStats && (
          <section className="weekly-summary">
            <h3 className="section-title">
              <Sparkles size={16} />
              This Week
            </h3>
            <div className="summary-grid">
              {weeklyStats.totalTimeSpent && (
                <div className="summary-card">
                  <div className="summary-value">{formatTime(weeklyStats.totalTimeSpent)}</div>
                  <div className="summary-label">Learning Time</div>
                </div>
              )}
              {weeklyStats.skillsImproved && (
                <div className="summary-card">
                  <div className="summary-value">{weeklyStats.skillsImproved}</div>
                  <div className="summary-label">Skills Improved</div>
                </div>
              )}
              {weeklyStats.totalXP && (
                <div className="summary-card">
                  <div className="summary-value">{weeklyStats.totalXP}</div>
                  <div className="summary-label">XP Earned</div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="popup-footer">
        <button className="dashboard-btn" onClick={() => chrome.runtime.openOptionsPage()}>
          <ExternalLink size={16} />
          Open Full Dashboard
        </button>
      </footer>
    </div>
  );
};

export default Popup;
