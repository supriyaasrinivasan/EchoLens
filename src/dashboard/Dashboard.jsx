import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, Tag, Sparkles, Grid, List, Map as MapIcon, Settings, Download, Upload, User, TrendingUp, Target, Brain, Heart, Sun, Moon } from 'lucide-react';
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

const Dashboard = () => {
  const [view, setView] = useState('mindsync'); // mindsync, personality, evolution, map, list, timeline, insights, goals, twin
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark'); // Theme state
  const [filters, setFilters] = useState({
    dateRange: 'all',
    minVisits: 0,
    tags: []
  });

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

    // Get all memories
    chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
      if (response?.memories) {
        setMemories(response.memories);
      }
    });

    // Get stats
    chrome.runtime.sendMessage({ type: 'GET_STATS' }, (response) => {
      if (response?.stats) {
        setStats(response.stats);
      }
      setLoading(false);
    });
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
        link.download = `echolens-export-${Date.now()}.json`;
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
          <Sparkles size={48} className="loading-icon" />
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
          <span className="sidebar-icon">✨</span>
          <h1>SupriAI</h1>
          <p className="sidebar-tagline">Your AI Mirror</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">PersonaSync</div>
            <button 
              className={`nav-item ${view === 'mindsync' ? 'active' : ''}`}
              onClick={() => setView('mindsync')}
              title="MindSync Dashboard"
            >
              <Heart size={20} />
              <span>MindSync</span>
            </button>
            <button 
              className={`nav-item ${view === 'personality' ? 'active' : ''}`}
              onClick={() => setView('personality')}
              title="Weekly Snapshots"
            >
              <User size={20} />
              <span>Personality</span>
            </button>
            <button 
              className={`nav-item ${view === 'evolution' ? 'active' : ''}`}
              onClick={() => setView('evolution')}
              title="Interest Evolution"
            >
              <TrendingUp size={20} />
              <span>Evolution</span>
            </button>
            <button 
              className={`nav-item ${view === 'goals' ? 'active' : ''}`}
              onClick={() => setView('goals')}
              title="Goal Alignment"
            >
              <Target size={20} />
              <span>Goals</span>
            </button>
            <button 
              className={`nav-item ${view === 'twin' ? 'active' : ''}`}
              onClick={() => setView('twin')}
              title="Digital Twin"
            >
              <Brain size={20} />
              <span>Digital Twin</span>
            </button>
          </div>

          <div className="nav-section">
            <div className="nav-section-label">Memory</div>
            <button 
              className={`nav-item ${view === 'map' ? 'active' : ''}`}
              onClick={() => setView('map')}
            >
              <MapIcon size={20} />
              <span>Knowledge Map</span>
            </button>
            <button 
              className={`nav-item ${view === 'list' ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              <List size={20} />
              <span>Memory List</span>
            </button>
            <button 
              className={`nav-item ${view === 'timeline' ? 'active' : ''}`}
              onClick={() => setView('timeline')}
            >
              <Calendar size={20} />
              <span>Timeline</span>
            </button>
            <button 
              className={`nav-item ${view === 'insights' ? 'active' : ''}`}
              onClick={() => setView('insights')}
            >
              <Sparkles size={20} />
              <span>AI Insights</span>
            </button>
          </div>
        </nav>

        {stats && <StatsOverview stats={stats} />}
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="content-header">
          <div className="header-left">
            <h2 className="page-title">
              {view === 'mindsync' && '💭 MindSync Dashboard'}
              {view === 'personality' && '🪞 Personality Snapshots'}
              {view === 'evolution' && '🌱 Interest Evolution'}
              {view === 'goals' && '🎯 Goal Alignment'}
              {view === 'twin' && '🧠 Digital Twin'}
              {view === 'map' && '🗺️ Knowledge Map'}
              {view === 'list' && '📚 Memory Library'}
              {view === 'timeline' && '📅 Memory Timeline'}
              {view === 'insights' && '✨ AI Insights'}
            </h2>
            <p className="page-subtitle">
              {view === 'mindsync' && 'Your weekly vibe, trending interests, and goal progress'}
              {view === 'personality' && 'Weekly reflections of your digital identity'}
              {view === 'evolution' && 'Watch how your curiosity has evolved over time'}
              {view === 'goals' && 'Track your intentional browsing goals'}
              {view === 'twin' && 'Your AI reflection trained on your patterns'}
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
              {theme === 'dark' ? <Sun className="theme-toggle-icon" size={20} /> : <Moon className="theme-toggle-icon" size={20} />}
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
          {view === 'mindsync' && <MindSyncDashboard />}
          {view === 'personality' && <PersonalitySnapshots />}
          {view === 'evolution' && <InterestEvolutionTimeline />}
          {view === 'goals' && <GoalsManager />}
          {view === 'twin' && <DigitalTwin />}
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
