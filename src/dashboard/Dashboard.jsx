import React, { useState, useEffect } from 'react';
import { 
  RiSearchLine, 
  RiFilterLine, 
  RiCalendarLine, 
  RiTimeLine, 
  RiPriceTag3Line, 
  RiSparklingLine, 
  RiGridLine, 
  RiListCheck, 
  RiMapPinLine, 
  RiSettings3Line, 
  RiDownloadLine, 
  RiUploadLine, 
  RiUserLine, 
  RiLineChartLine, 
  RiTargetLine, 
  RiBrainLine, 
  RiHeartLine, 
  RiSunLine, 
  RiMoonLine, 
  RiArrowDownSLine, 
  RiArrowRightSLine,
  RiSparklingFill,
  RiHomeLine,
  RiDashboardLine,
  RiBookOpenLine,
  RiTrophyLine,
  RiBarChartLine,
  RiMentalHealthLine
} from '@remixicon/react';
import KnowledgeMap from './components/KnowledgeMap';
import MemoryList from './components/MemoryList';
import MemoryTimeline from './components/MemoryTimeline';
import StatsOverview from './components/StatsOverview';
import SearchBar from './components/SearchBar';
import InsightsPanel from './components/InsightsPanel';
import PersonalitySnapshots from './components/PersonalitySnapshots';
import InterestEvolutionTimeline from './components/InterestEvolutionTimeline';
import MindSyncDashboard from './components/MindSyncDashboard';
import GoalsManager from './components/GoalsManager';
import DigitalTwin from './components/DigitalTwin';
// New Feature Components
import SkillsDashboard from './components/SkillsDashboard';
import AchievementsDashboard from './components/AchievementsDashboard';
import ProgressAnalyticsDashboard from './components/ProgressAnalyticsDashboard';
import MindfulnessDashboard from './components/MindfulnessDashboard';

const Dashboard = () => {
  const [view, setView] = useState('welcome'); // welcome, mindsync, personality, evolution, map, list, timeline, insights, goals, twin, skills, achievements, analytics, mindfulness
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark'); // Theme state
  const [username, setUsername] = useState(''); // User's name
  const [personaSyncOpen, setPersonaSyncOpen] = useState(false); // PersonaSync dropdown state - closed by default
  const [echoLenzOpen, setEchoLenzOpen] = useState(false); // EchoLenz dropdown state - closed by default
  const [newFeaturesOpen, setNewFeaturesOpen] = useState(false); // New Features dropdown state - open by default
  const [filters, setFilters] = useState({
    dateRange: 'all',
    minVisits: 0,
    tags: []
  });

  useEffect(() => {
    loadData();
    // Load theme from storage
    chrome.storage.sync.get(['theme', 'username'], (result) => {
      if (result.theme) {
        setTheme(result.theme);
        document.documentElement.setAttribute('data-theme', result.theme);
      }
      if (result.username) {
        setUsername(result.username);
      }
    });
    
    // Try to get username from Chrome profile
    if (chrome.identity && chrome.identity.getProfileUserInfo) {
      chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
        // Check for errors first
        if (chrome.runtime.lastError) {
          console.warn('Could not get user info:', chrome.runtime.lastError.message);
          return;
        }
        
        if (userInfo && userInfo.email) {
          // Extract name from email (before @)
          const name = userInfo.email.split('@')[0];
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          setUsername(formattedName);
          chrome.storage.sync.set({ username: formattedName });
        }
      });
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [memories, searchQuery, filters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.search-input')?.focus();
      }
      // Number keys for view switching (1-4)
      if (!e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        if (e.key === '1') setView('map');
        if (e.key === '2') setView('list');
        if (e.key === '3') setView('timeline');
        if (e.key === '4') setView('insights');
      }
      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
      // Get all memories
      chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('GET_MEMORIES error:', chrome.runtime.lastError);
          setLoading(false);
          return;
        }
        if (response?.memories) {
          setMemories(response.memories);
        } else {
          console.warn('GET_MEMORIES returned no memories');
          setMemories([]);
        }
      });

      // Get stats
      chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('GET_STATS error:', chrome.runtime.lastError);
          setLoading(false);
          return;
        }
        if (response?.stats) {
          setStats(response.stats);
        } else {
          console.warn('GET_STATS returned no stats');
        }
        setLoading(false);
      });
    } catch (err) {
      console.error('loadData error:', err);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...memories];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.url.toLowerCase().includes(query) ||
        m.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        'today': 24 * 60 * 60 * 1000,
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000
      };
      const range = ranges[filters.dateRange];
      if (range) {
        filtered = filtered.filter(m => now - m.lastVisit < range);
      }
    }

    // Min visits filter
    if (filters.minVisits > 0) {
      filtered = filtered.filter(m => m.visits >= filters.minVisits);
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(m => 
        filters.tags.some(tag => m.tags.includes(tag))
      );
    }

    setFilteredMemories(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleExport = async () => {
    chrome.runtime.sendMessage({ type: 'EXPORT_DATA' }, (response) => {
      if (response?.data) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `supriai-export-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target.result);
            chrome.runtime.sendMessage({ type: 'IMPORT_DATA', data }, (response) => {
              if (response?.success) {
                loadData(); // Reload data after import
                alert('Data imported successfully!');
              } else {
                alert('Failed to import data');
              }
            });
          } catch (error) {
            alert('Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    chrome.storage.sync.set({ theme: newTheme });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <RiSparklingLine size={48} className="loading-icon" />
          <h2>Loading your memories...</h2>
          <p>Mapping your digital consciousness</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <RiSparklingFill size={28} className="sidebar-icon" />
            <div className="sidebar-brand-text">
              <h1>SupriAI</h1>
              <p className="sidebar-tagline">Your AI Mirror</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard Home */}
          <div className="nav-section">
            <button 
              className={`nav-item nav-item-featured ${view === 'welcome' ? 'active' : ''}`}
              onClick={() => setView('welcome')}
              title="Dashboard Home"
            >
              <RiDashboardLine size={20} />
              <span>Dashboard</span>
            </button>
          </div>

          {/* PersonaSync Section */}
          <div className="nav-section">
            <div className="nav-section-header" onClick={() => setPersonaSyncOpen(!personaSyncOpen)}>
              <div className="nav-section-label">
                {personaSyncOpen ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />}
                <span>PersonaSync</span>
              </div>
            </div>
            {personaSyncOpen && (
              <div className="nav-section-items">
                <button 
                  className={`nav-item ${view === 'mindsync' ? 'active' : ''}`}
                  onClick={() => setView('mindsync')}
                  title="MindSync Dashboard"
                >
                  <RiHeartLine size={20} />
                  <span>MindSync</span>
                </button>
                <button 
                  className={`nav-item ${view === 'personality' ? 'active' : ''}`}
                  onClick={() => setView('personality')}
                  title="Weekly Snapshots"
                >
                  <RiUserLine size={20} />
                  <span>Personality</span>
                </button>
                <button 
                  className={`nav-item ${view === 'evolution' ? 'active' : ''}`}
                  onClick={() => setView('evolution')}
                  title="Interest Evolution"
                >
                  <RiLineChartLine size={20} />
                  <span>Evolution</span>
                </button>
                <button 
                  className={`nav-item ${view === 'goals' ? 'active' : ''}`}
                  onClick={() => setView('goals')}
                  title="Goal Alignment"
                >
                  <RiTargetLine size={20} />
                  <span>Goals</span>
                </button>
                <button 
                  className={`nav-item ${view === 'twin' ? 'active' : ''}`}
                  onClick={() => setView('twin')}
                  title="Digital Twin"
                >
                  <RiBrainLine size={20} />
                  <span>Digital Twin</span>
                </button>
              </div>
            )}
          </div>

          {/* New Features Section */}
          <div className="nav-section">
            <div className="nav-section-header" onClick={() => setNewFeaturesOpen(!newFeaturesOpen)}>
              <div className="nav-section-label">
                {newFeaturesOpen ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />}
                <span>Skillify</span>
              </div>
            </div>
            {newFeaturesOpen && (
              <div className="nav-section-items">
                <button 
                  className={`nav-item ${view === 'skills' ? 'active' : ''}`}
                  onClick={() => setView('skills')}
                  title="Skill Tracker"
                >
                  <RiBookOpenLine size={20} />
                  <span>Skills</span>
                </button>
                <button 
                  className={`nav-item ${view === 'achievements' ? 'active' : ''}`}
                  onClick={() => setView('achievements')}
                  title="Achievements & Badges"
                >
                  <RiTrophyLine size={20} />
                  <span>Achievements</span>
                </button>
                <button 
                  className={`nav-item ${view === 'analytics' ? 'active' : ''}`}
                  onClick={() => setView('analytics')}
                  title="Progress Analytics"
                >
                  <RiBarChartLine size={20} />
                  <span>Analytics</span>
                </button>
                <button 
                  className={`nav-item ${view === 'mindfulness' ? 'active' : ''}`}
                  onClick={() => setView('mindfulness')}
                  title="Mindfulness Center"
                >
                  <RiMentalHealthLine size={20} />
                  <span>Mindfulness</span>
                </button>
              </div>
            )}
          </div>

          {/* EchoLenz Section */}
          <div className="nav-section">
            <div className="nav-section-header" onClick={() => setEchoLenzOpen(!echoLenzOpen)}>
              <div className="nav-section-label">
                {echoLenzOpen ? <RiArrowDownSLine size={16} /> : <RiArrowRightSLine size={16} />}
                <span>EchoLenz</span>
              </div>
            </div>
            {echoLenzOpen && (
              <div className="nav-section-items">
                <button 
                  className={`nav-item ${view === 'map' ? 'active' : ''}`}
                  onClick={() => setView('map')}
                >
                  <RiMapPinLine size={20} />
                  <span>Knowledge Map</span>
                </button>
                <button 
                  className={`nav-item ${view === 'list' ? 'active' : ''}`}
                  onClick={() => setView('list')}
                >
                  <RiListCheck size={20} />
                  <span>Memory List</span>
                </button>
                <button 
                  className={`nav-item ${view === 'timeline' ? 'active' : ''}`}
                  onClick={() => setView('timeline')}
                >
                  <RiCalendarLine size={20} />
                  <span>Timeline</span>
                </button>
                <button 
                  className={`nav-item ${view === 'insights' ? 'active' : ''}`}
                  onClick={() => setView('insights')}
                >
                  <RiSparklingLine size={20} />
                  <span>AI Insights</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="content-header">
          <div className="header-left">
            <div className="page-title-wrapper">
              {view === 'welcome' && <RiHomeLine size={24} className="page-title-icon" />}
              {view === 'mindsync' && <RiHeartLine size={24} className="page-title-icon" />}
              {view === 'personality' && <RiUserLine size={24} className="page-title-icon" />}
              {view === 'evolution' && <RiLineChartLine size={24} className="page-title-icon" />}
              {view === 'goals' && <RiTargetLine size={24} className="page-title-icon" />}
              {view === 'twin' && <RiBrainLine size={24} className="page-title-icon" />}
              {view === 'skills' && <RiBookOpenLine size={24} className="page-title-icon" />}
              {view === 'achievements' && <RiTrophyLine size={24} className="page-title-icon" />}
              {view === 'analytics' && <RiBarChartLine size={24} className="page-title-icon" />}
              {view === 'mindfulness' && <RiMentalHealthLine size={24} className="page-title-icon" />}
              {view === 'map' && <RiMapPinLine size={24} className="page-title-icon" />}
              {view === 'list' && <RiListCheck size={24} className="page-title-icon" />}
              {view === 'timeline' && <RiCalendarLine size={24} className="page-title-icon" />}
              {view === 'insights' && <RiSparklingLine size={24} className="page-title-icon" />}
              <h2 className="page-title">
                {view === 'welcome' && 'Dashboard'}
                {view === 'mindsync' && 'MindSync Dashboard'}
                {view === 'personality' && 'Personality Snapshots'}
                {view === 'evolution' && 'Interest Evolution'}
                {view === 'goals' && 'Goal Alignment'}
                {view === 'twin' && 'Digital Twin'}
                {view === 'skills' && 'Skill Tracker'}
                {view === 'achievements' && 'Achievements & Badges'}
                {view === 'analytics' && 'Progress Analytics'}
                {view === 'mindfulness' && 'Mindfulness Center'}
                {view === 'map' && 'Knowledge Map'}
                {view === 'list' && 'Memory Library'}
                {view === 'timeline' && 'Memory Timeline'}
                {view === 'insights' && 'AI Insights'}
              </h2>
            </div>
            <p className="page-subtitle">
              {view === 'welcome' && `Your personal AI companion for mindful browsing`}
              {view === 'mindsync' && 'Your weekly vibe, trending interests, and goal progress'}
              {view === 'personality' && 'Weekly reflections of your digital identity'}
              {view === 'evolution' && 'Watch how your curiosity has evolved over time'}
              {view === 'goals' && 'Track your intentional browsing goals'}
              {view === 'twin' && 'Your AI reflection trained on your patterns'}
              {view === 'skills' && 'Your learning journey across different domains'}
              {view === 'achievements' && 'Your milestones and progress'}
              {view === 'analytics' && 'Your learning evolution over time'}
              {view === 'mindfulness' && 'Track your mental well-being and focus'}
              {(view === 'map' || view === 'list' || view === 'timeline' || view === 'insights') && 
                `${filteredMemories.length} memories${searchQuery ? ` matching "${searchQuery}"` : ''}`
              }
            </p>
          </div>
          <div className="header-actions">
            {(view === 'map' || view === 'list' || view === 'timeline' || view === 'insights') && (
              <SearchBar onSearch={handleSearch} />
            )}
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <RiSunLine className="theme-toggle-icon" size={20} /> : <RiMoonLine className="theme-toggle-icon" size={20} />}
              <span className="theme-toggle-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar - only show for memory views */}
        {(view === 'map' || view === 'list' || view === 'timeline' || view === 'insights') && (
          <div className="filter-bar">
            <div className="filter-group">
              <label>Time Range:</label>
              <select 
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Visits:</label>
              <select 
                value={filters.minVisits}
                onChange={(e) => setFilters({...filters, minVisits: Number(e.target.value)})}
              >
                <option value="0">Any</option>
                <option value="2">2+</option>
                <option value="5">5+</option>
                <option value="10">10+</option>
                <option value="20">20+</option>
              </select>
            </div>
          </div>
        )}

        {/* View Content */}
        <div className="view-content">
          {view === 'welcome' && (
            <div className="welcome-view">
              <div className="welcome-card">
                <div className="welcome-header">
                  <div className="welcome-icon">
                    <RiSparklingLine size={48} />
                  </div>
                  <h1 className="welcome-title">
                    Welcome{username ? `, ${username}` : ''}!
                  </h1>
                  <p className="welcome-subtitle">
                    Your personal AI companion for mindful browsing and self-discovery
                  </p>
                </div>
                
                <div className="welcome-features">
                  <div className="feature-card" onClick={() => setView('mindsync')}>
                    <div className="feature-icon">
                      <RiHeartLine size={32} />
                    </div>
                    <h3>MindSync</h3>
                    <p>Track your weekly vibe and trending interests</p>
                  </div>
                  
                  <div className="feature-card" onClick={() => setView('personality')}>
                    <div className="feature-icon">
                      <RiUserLine size={32} />
                    </div>
                    <h3>Personality</h3>
                    <p>Weekly snapshots of your digital identity</p>
                  </div>
                  
                  <div className="feature-card" onClick={() => setView('evolution')}>
                    <div className="feature-icon">
                      <RiLineChartLine size={32} />
                    </div>
                    <h3>Evolution</h3>
                    <p>Watch your curiosity evolve over time</p>
                  </div>
                  
                  <div className="feature-card" onClick={() => setView('twin')}>
                    <div className="feature-icon">
                      <RiBrainLine size={32} />
                    </div>
                    <h3>Digital Twin</h3>
                    <p>Your AI reflection trained on your patterns</p>
                  </div>
                  
                  <div className="feature-card featured-new" onClick={() => setView('skills')}>
                    <div className="feature-icon">
                      <RiBookOpenLine size={32} />
                    </div>
                    <h3>Skills <span className="new-badge">NEW</span></h3>
                    <p>Track your learning journey and progress</p>
                  </div>
                  
                  <div className="feature-card featured-new" onClick={() => setView('achievements')}>
                    <div className="feature-icon">
                      <RiTrophyLine size={32} />
                    </div>
                    <h3>Achievements <span className="new-badge">NEW</span></h3>
                    <p>Unlock badges and complete challenges</p>
                  </div>
                  
                  <div className="feature-card featured-new" onClick={() => setView('analytics')}>
                    <div className="feature-icon">
                      <RiBarChartLine size={32} />
                    </div>
                    <h3>Analytics <span className="new-badge">NEW</span></h3>
                    <p>Visualize your knowledge evolution</p>
                  </div>
                  
                  <div className="feature-card featured-new" onClick={() => setView('mindfulness')}>
                    <div className="feature-icon">
                      <RiMentalHealthLine size={32} />
                    </div>
                    <h3>Mindfulness <span className="new-badge">NEW</span></h3>
                    <p>Focus sessions and mood tracking</p>
                  </div>
                  
                  <div className="feature-card" onClick={() => setView('map')}>
                    <div className="feature-icon">
                      <RiMapPinLine size={32} />
                    </div>
                    <h3>Knowledge Map</h3>
                    <p>Visualize your browsing patterns</p>
                  </div>
                  
                  <div className="feature-card" onClick={() => setView('insights')}>
                    <div className="feature-icon">
                      <RiSparklingLine size={32} />
                    </div>
                    <h3>AI Insights</h3>
                    <p>Discover patterns in your browsing</p>
                  </div>
                </div>
                
                {stats && <StatsOverview stats={stats} />}
              </div>
            </div>
          )}
          {view === 'mindsync' && <MindSyncDashboard />}
          {view === 'personality' && <PersonalitySnapshots />}
          {view === 'evolution' && <InterestEvolutionTimeline />}
          {view === 'goals' && <GoalsManager />}
          {view === 'twin' && <DigitalTwin />}
          {view === 'skills' && <SkillsDashboard />}
          {view === 'achievements' && <AchievementsDashboard />}
          {view === 'analytics' && <ProgressAnalyticsDashboard />}
          {view === 'mindfulness' && <MindfulnessDashboard />}
          {view === 'map' && <KnowledgeMap memories={filteredMemories} />}
          {view === 'list' && <MemoryList memories={filteredMemories} />}
          {view === 'timeline' && <MemoryTimeline memories={filteredMemories} />}
          {view === 'insights' && <InsightsPanel memories={filteredMemories} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
