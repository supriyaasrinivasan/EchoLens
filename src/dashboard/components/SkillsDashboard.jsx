import React, { useState, useEffect } from 'react';
import { 
  RiBookOpenLine, 
  RiTrophyLine, 
  RiTimeLine, 
  RiLineChartLine,
  RiStarLine,
  RiStarFill,
  RiAddLine,
  RiSearchLine,
  RiFilterLine,
  RiArrowRightSLine,
  RiFireLine,
  RiFlashlightLine,
  RiTargetLine
} from '@remixicon/react';

const SkillsDashboard = () => {
  const [skills, setSkills] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // recent, xp, name, progress
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [favoriteSkills, setFavoriteSkills] = useState([]);

  useEffect(() => {
    loadSkillsData();
    loadFavorites();
  }, []);

  const loadSkillsData = async () => {
    try {
      // Request skill progress from background
      const response = await chrome.runtime.sendMessage({
        type: 'GET_SKILL_PROGRESS'
      });

      if (response && response.success) {
        setSkills(response.skills || []);
      }

      // Request learning paths
      const pathsResponse = await chrome.runtime.sendMessage({
        type: 'GET_LEARNING_PATHS'
      });

      if (pathsResponse && pathsResponse.success) {
        setLearningPaths(pathsResponse.paths || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load skills data:', error);
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    chrome.storage.sync.get(['favoriteSkills'], (result) => {
      if (result.favoriteSkills) {
        setFavoriteSkills(result.favoriteSkills);
      }
    });
  };

  const toggleFavorite = (skillName) => {
    const newFavorites = favoriteSkills.includes(skillName)
      ? favoriteSkills.filter(s => s !== skillName)
      : [...favoriteSkills, skillName];
    
    setFavoriteSkills(newFavorites);
    chrome.storage.sync.set({ favoriteSkills: newFavorites });
  };

  const addCustomSkill = async () => {
    if (!newSkillName.trim()) return;
    
    // Add skill to the background tracker
    chrome.runtime.sendMessage({
      type: 'ADD_CUSTOM_SKILL',
      skill: newSkillName.trim()
    }, (response) => {
      if (response && response.success) {
        loadSkillsData();
        setNewSkillName('');
        setShowAddSkill(false);
      }
    });
  };

  const getLevelForXP = (xp) => {
    if (xp >= 1000) return { level: 5, name: 'Expert', color: '#8b5cf6', nextXP: null };
    if (xp >= 500) return { level: 4, name: 'Advanced', color: '#6366f1', nextXP: 1000 };
    if (xp >= 200) return { level: 3, name: 'Intermediate', color: '#3b82f6', nextXP: 500 };
    if (xp >= 50) return { level: 2, name: 'Learner', color: '#10b981', nextXP: 200 };
    return { level: 1, name: 'Beginner', color: '#6b7280', nextXP: 50 };
  };

  const getProgressPercentage = (xp) => {
    const thresholds = [0, 50, 200, 500, 1000];
    const currentLevel = getLevelForXP(xp).level;
    
    if (currentLevel === 5) return 100;
    
    const currentThreshold = thresholds[currentLevel - 1];
    const nextThreshold = thresholds[currentLevel];
    const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return Math.min(progress, 100);
  };

  const getSkillIcon = (skillName) => {
    const icons = {
      'programming': '💻',
      'design': '🎨',
      'ai': '🤖',
      'data-science': '📊',
      'marketing': '📢',
      'business': '💼',
      'writing': '✍️',
      'productivity': '⚡',
      'personal-development': '🌱',
      'Web Development': '💻',
      'Data Science': '📊',
      'Machine Learning': '🤖',
      'Design': '🎨',
      'Writing': '✍️',
      'Business': '💼',
      'Marketing': '📢',
      'Languages': '🌍',
      'General Knowledge': '📚'
    };
    return icons[skillName] || '🎯';
  };

  // Filter and sort skills
  const getFilteredAndSortedSkills = () => {
    let filtered = skills.filter(skill => {
      const matchesSearch = skill.skill.toLowerCase().includes(searchQuery.toLowerCase());
      const levelInfo = getLevelForXP(skill.totalXP);
      const matchesLevel = filterLevel === 'all' || levelInfo.name === filterLevel;
      return matchesSearch && matchesLevel;
    });

    // Sort skills
    switch (sortBy) {
      case 'xp':
        filtered.sort((a, b) => b.totalXP - a.totalXP);
        break;
      case 'name':
        filtered.sort((a, b) => a.skill.localeCompare(b.skill));
        break;
      case 'progress':
        filtered.sort((a, b) => getProgressPercentage(b.totalXP) - getProgressPercentage(a.totalXP));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
        break;
    }

    // Favorites first
    filtered.sort((a, b) => {
      const aFav = favoriteSkills.includes(a.skill) ? 1 : 0;
      const bFav = favoriteSkills.includes(b.skill) ? 1 : 0;
      return bFav - aFav;
    });

    return filtered;
  };

  // Calculate total stats
  const getTotalStats = () => {
    const totalXP = skills.reduce((sum, skill) => sum + skill.totalXP, 0);
    const totalHours = skills.reduce((sum, skill) => sum + (skill.totalTime || 0), 0) / 3600;
    const totalActivities = skills.reduce((sum, skill) => sum + skill.activityCount, 0);
    const expertSkills = skills.filter(s => getLevelForXP(s.totalXP).level === 5).length;
    
    return { totalXP, totalHours, totalActivities, expertSkills };
  };

  if (loading) {
    return (
      <div className="skills-dashboard loading">
        <div className="loading-container">
          <RiBookOpenLine size={48} className="loading-icon" />
          <p>Loading your skills...</p>
        </div>
      </div>
    );
  }

  const filteredSkills = getFilteredAndSortedSkills();
  const stats = getTotalStats();

  return (
    <div className="skills-dashboard">
      {/* Stats Overview */}
      <div className="skills-stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <RiFireLine size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalXP.toLocaleString()}</h3>
            <p>Total XP</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <RiTimeLine size={24} />
          </div>
          <div className="stat-content">
            <h3>{Math.round(stats.totalHours)}h</h3>
            <p>Learning Time</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <RiBookOpenLine size={24} />
          </div>
          <div className="stat-content">
            <h3>{skills.length}</h3>
            <p>Skills Tracked</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <RiTrophyLine size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.expertSkills}</h3>
            <p>Expert Level</p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="skills-controls">
        <div className="search-filter-group">
          <div className="search-box">
            <RiSearchLine size={18} />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <RiFilterLine size={18} />
            <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Learner">Learner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div className="sort-group">
            <RiLineChartLine size={18} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Most Recent</option>
              <option value="xp">Highest XP</option>
              <option value="progress">Best Progress</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
        <button className="add-skill-btn" onClick={() => setShowAddSkill(!showAddSkill)}>
          <RiAddLine size={18} />
          Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddSkill && (
        <div className="add-skill-form">
          <input
            type="text"
            placeholder="Enter skill name..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
          />
          <button onClick={addCustomSkill}>Add</button>
          <button onClick={() => setShowAddSkill(false)}>Cancel</button>
        </div>
      )}

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="skills-grid">
          {filteredSkills.map((skill) => {
            const levelInfo = getLevelForXP(skill.totalXP);
            const progress = getProgressPercentage(skill.totalXP);
            const isFavorite = favoriteSkills.includes(skill.skill);
            const xpToNext = levelInfo.nextXP ? levelInfo.nextXP - skill.totalXP : 0;

            return (
              <div key={skill.skill} className={`skill-card ${isFavorite ? 'favorite' : ''}`}>
                <div className="skill-card-header">
                  <div className="skill-header">
                    <span className="skill-icon">{getSkillIcon(skill.skill)}</span>
                    <div className="skill-info">
                      <h3>{skill.skill}</h3>
                      <span className="skill-level" style={{ color: levelInfo.color }}>
                        {levelInfo.name}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="favorite-btn"
                    onClick={() => toggleFavorite(skill.skill)}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite ? <RiStarFill size={20} /> : <RiStarLine size={20} />}
                  </button>
                </div>

                <div className="skill-stats">
                  <div className="stat">
                    <span className="stat-label">XP</span>
                    <span className="stat-value">{skill.totalXP}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Activities</span>
                    <span className="stat-value">{skill.activityCount}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Hours</span>
                    <span className="stat-value">
                      {Math.round((skill.totalTime || 0) / 3600)}h
                    </span>
                  </div>
                </div>

                <div className="skill-progress">
                  <div className="progress-info">
                    <span className="progress-text">
                      Level {levelInfo.level}
                    </span>
                    {levelInfo.nextXP && (
                      <span className="xp-to-next">{xpToNext} XP to next level</span>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`
                      }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>

                {skill.lastActivity && (
                  <div className="recent-activity">
                    <RiFlashlightLine size={14} />
                    <small>
                      Last active: {new Date(skill.lastActivity).toLocaleDateString()}
                    </small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-results">
          <RiSearchLine size={48} />
          <h3>No skills found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Learning Paths */}
      {learningPaths.length > 0 && (
        <div className="learning-paths-section">
          <div className="section-header">
            <h3>
              <RiTargetLine size={24} />
              Recommended Learning Paths
            </h3>
            <p>Curated resources based on your current progress</p>
          </div>
          <div className="learning-paths-grid">
            {learningPaths.map((path, index) => (
              <div key={index} className="learning-path-card">
                <div className="path-header">
                  <span className="path-icon">{getSkillIcon(path.skill)}</span>
                  <h4>{path.skill}</h4>
                </div>
                <p className="path-description">
                  Current Level: <strong>{path.currentLevel}</strong>
                </p>
                <div className="path-resources">
                  {path.resources.slice(0, 3).map((resource, idx) => (
                    <a 
                      key={idx}
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      <span className="resource-platform">{resource.platform}</span>
                      <span className="resource-title">{resource.title}</span>
                      <RiArrowRightSLine size={18} />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {skills.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">
            <RiBookOpenLine size={64} />
          </div>
          <h3>No Skills Tracked Yet</h3>
          <p>Start browsing and learning! SupriAI will automatically detect and track your skills as you explore different topics.</p>
          <button className="primary-btn" onClick={() => setShowAddSkill(true)}>
            <RiAddLine size={18} />
            Add Your First Skill
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsDashboard;
