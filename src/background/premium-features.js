/**
 * EchoLens Premium Features Framework
 * Manages feature access, subscription tiers, and team/enterprise functionality
 */

class PremiumFeatures {
  constructor(dbManager) {
    this.dbManager = dbManager;
    this.currentTier = 'free'; // free, pro, team, enterprise
    this.userId = null;
  }

  /**
   * Initialize premium features system
   */
  async initialize() {
    try {
      await this.createTables();
      await this.loadUserTier();
      console.log('Premium features initialized');
    } catch (error) {
      console.error('Failed to initialize premium features:', error);
    }
  }

  async createTables() {
    const db = await this.dbManager.getDatabase();

    // User subscription info
    db.run(`
      CREATE TABLE IF NOT EXISTS user_subscription (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        tier TEXT DEFAULT 'free',
        started_at INTEGER NOT NULL,
        expires_at INTEGER,
        auto_renew BOOLEAN DEFAULT 0,
        payment_method TEXT,
        last_payment INTEGER
      )
    `);

    // Feature usage tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS feature_usage_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_name TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        limit_count INTEGER NOT NULL,
        reset_at INTEGER NOT NULL,
        user_id TEXT NOT NULL
      )
    `);

    // Team management
    db.run(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        owner_id TEXT NOT NULL,
        tier TEXT DEFAULT 'team',
        member_limit INTEGER DEFAULT 10,
        created_at INTEGER NOT NULL
      )
    `);

    // Team members
    db.run(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at INTEGER NOT NULL,
        permissions TEXT,
        UNIQUE(team_id, user_id)
      )
    `);

    // Feature flags
    db.run(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_name TEXT UNIQUE NOT NULL,
        enabled BOOLEAN DEFAULT 0,
        tier_required TEXT,
        rollout_percentage INTEGER DEFAULT 100,
        metadata TEXT
      )
    `);

    await this.dbManager.saveDatabase();
  }

  // ==================== Subscription Tiers ====================

  /**
   * Feature access matrix for different tiers
   */
  getTierFeatures() {
    return {
      free: {
        name: 'Free',
        price: 0,
        features: {
          // Core features
          basicTracking: true,
          contextCapture: true,
          browserHistory: true,
          
          // Limited features
          maxStoredPages: 1000,
          maxEchoSpaces: 1,
          maxSkillTracking: 3,
          achievementTracking: true,
          basicAnalytics: true,
          
          // Premium features (disabled)
          advancedAnalytics: false,
          aiInsights: false,
          exportFeatures: false,
          teamCollaboration: false,
          prioritySupport: false,
          customIntegrations: false,
          apiAccess: false,
          
          // Limits
          dailyReflections: 3,
          focusSessionsPerDay: 3,
          weeklyDigests: 1,
          exportFormats: ['CSV']
        }
      },

      pro: {
        name: 'Pro',
        price: 9.99,
        features: {
          // All free features
          basicTracking: true,
          contextCapture: true,
          browserHistory: true,
          achievementTracking: true,
          
          // Enhanced limits
          maxStoredPages: 10000,
          maxEchoSpaces: 10,
          maxSkillTracking: 999,
          basicAnalytics: true,
          
          // Pro features
          advancedAnalytics: true,
          aiInsights: true,
          exportFeatures: true,
          teamCollaboration: false,
          prioritySupport: true,
          customIntegrations: true,
          apiAccess: false,
          
          // Enhanced limits
          dailyReflections: 999,
          focusSessionsPerDay: 999,
          weeklyDigests: 999,
          exportFormats: ['CSV', 'JSON', 'Notion', 'Obsidian', 'Markdown'],
          
          // Pro-only features
          predictiveInsights: true,
          futureSelfSimulation: true,
          conversationalTwin: true,
          customGoals: true,
          advancedVisualization: true
        }
      },

      team: {
        name: 'Team',
        price: 29.99,
        features: {
          // All Pro features
          ...this.getTierFeatures().pro.features,
          
          // Team features
          teamCollaboration: true,
          sharedEchoSpaces: true,
          teamAnalytics: true,
          memberManagement: true,
          roleBasedAccess: true,
          
          // Team limits
          maxTeamMembers: 10,
          maxSharedSpaces: 25,
          
          // Team-only features
          knowledgeSharing: true,
          teamInsights: true,
          collaborativeGoals: true,
          activityFeed: true
        }
      },

      enterprise: {
        name: 'Enterprise',
        price: 99.99,
        features: {
          // All Team features
          ...this.getTierFeatures().team.features,
          
          // Enterprise features
          apiAccess: true,
          ssoIntegration: true,
          customBranding: true,
          dedicatedSupport: true,
          advancedSecurity: true,
          auditLogs: true,
          customRetention: true,
          
          // Unlimited
          maxTeamMembers: 999,
          maxSharedSpaces: 999,
          maxStoredPages: 999999,
          
          // Enterprise-only
          adminDashboard: true,
          usageAnalytics: true,
          complianceReports: true,
          customWorkflows: true,
          onPremiseOption: true
        }
      }
    };
  }

  /**
   * Load current user's subscription tier
   */
  async loadUserTier() {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT tier, expires_at 
      FROM user_subscription 
      WHERE user_id = 'local-user'
      ORDER BY started_at DESC 
      LIMIT 1
    `);

    if (result.length > 0 && result[0].values.length > 0) {
      const [tier, expiresAt] = result[0].values[0];
      
      // Check if subscription is still valid
      if (!expiresAt || expiresAt > Date.now()) {
        this.currentTier = tier;
      } else {
        this.currentTier = 'free';
      }
    } else {
      this.currentTier = 'free';
    }

    this.userId = 'local-user';
  }

  /**
   * Check if a feature is available for current tier
   */
  async hasFeatureAccess(featureName) {
    const tierFeatures = this.getTierFeatures()[this.currentTier];
    
    if (!tierFeatures) return false;
    
    return tierFeatures.features[featureName] === true;
  }

  /**
   * Get feature limit for current tier
   */
  async getFeatureLimit(featureName) {
    const tierFeatures = this.getTierFeatures()[this.currentTier];
    
    if (!tierFeatures) return 0;
    
    return tierFeatures.features[featureName] || 0;
  }

  /**
   * Check if feature usage is within limits
   */
  async checkUsageLimit(featureName) {
    const limit = await this.getFeatureLimit(featureName);
    
    if (limit === 999 || limit === 999999) return true; // Unlimited
    
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT usage_count, limit_count, reset_at 
      FROM feature_usage_limits 
      WHERE feature_name = ? AND user_id = ?
    `, [featureName, this.userId]);

    if (result.length === 0 || result[0].values.length === 0) {
      // First time using this feature
      return true;
    }

    const [usageCount, limitCount, resetAt] = result[0].values[0];

    // Check if limit has reset
    if (Date.now() >= resetAt) {
      await this.resetFeatureUsage(featureName);
      return true;
    }

    return usageCount < limitCount;
  }

  /**
   * Increment feature usage
   */
  async incrementFeatureUsage(featureName) {
    const limit = await this.getFeatureLimit(featureName);
    const db = await this.dbManager.getDatabase();

    const existing = db.exec(`
      SELECT id, usage_count, reset_at 
      FROM feature_usage_limits 
      WHERE feature_name = ? AND user_id = ?
    `, [featureName, this.userId]);

    if (existing.length === 0 || existing[0].values.length === 0) {
      // Create new usage record
      const resetAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
      
      db.run(`
        INSERT INTO feature_usage_limits (feature_name, usage_count, limit_count, reset_at, user_id)
        VALUES (?, 1, ?, ?, ?)
      `, [featureName, limit, resetAt, this.userId]);
    } else {
      const [id, usageCount, resetAt] = existing[0].values[0];
      
      // Check if needs reset
      if (Date.now() >= resetAt) {
        const newResetAt = Date.now() + (24 * 60 * 60 * 1000);
        db.run(`
          UPDATE feature_usage_limits 
          SET usage_count = 1, reset_at = ? 
          WHERE id = ?
        `, [newResetAt, id]);
      } else {
        db.run(`
          UPDATE feature_usage_limits 
          SET usage_count = usage_count + 1 
          WHERE id = ?
        `, [id]);
      }
    }

    await this.dbManager.saveDatabase();
  }

  /**
   * Reset feature usage (called daily or on tier upgrade)
   */
  async resetFeatureUsage(featureName) {
    const db = await this.dbManager.getDatabase();
    const resetAt = Date.now() + (24 * 60 * 60 * 1000);

    db.run(`
      UPDATE feature_usage_limits 
      SET usage_count = 0, reset_at = ? 
      WHERE feature_name = ? AND user_id = ?
    `, [resetAt, featureName, this.userId]);

    await this.dbManager.saveDatabase();
  }

  /**
   * Get current tier info
   */
  async getCurrentTierInfo() {
    const tierInfo = this.getTierFeatures()[this.currentTier];
    
    const db = await this.dbManager.getDatabase();
    const result = db.exec(`
      SELECT expires_at, auto_renew 
      FROM user_subscription 
      WHERE user_id = ? AND tier = ?
      ORDER BY started_at DESC 
      LIMIT 1
    `, [this.userId, this.currentTier]);

    let expiresAt = null;
    let autoRenew = false;

    if (result.length > 0 && result[0].values.length > 0) {
      [expiresAt, autoRenew] = result[0].values[0];
    }

    return {
      tier: this.currentTier,
      ...tierInfo,
      expiresAt,
      autoRenew,
      daysRemaining: expiresAt ? Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)) : null
    };
  }

  /**
   * Upgrade subscription tier
   */
  async upgradeTier(newTier, duration = 30) {
    const validTiers = ['free', 'pro', 'team', 'enterprise'];
    
    if (!validTiers.includes(newTier)) {
      return { success: false, error: 'Invalid tier' };
    }

    const db = await this.dbManager.getDatabase();
    const now = Date.now();
    const expiresAt = now + (duration * 24 * 60 * 60 * 1000);

    db.run(`
      INSERT INTO user_subscription (user_id, tier, started_at, expires_at, auto_renew)
      VALUES (?, ?, ?, ?, 1)
    `, [this.userId, newTier, now, expiresAt]);

    await this.dbManager.saveDatabase();

    this.currentTier = newTier;

    // Reset all usage limits
    db.run(`
      DELETE FROM feature_usage_limits 
      WHERE user_id = ?
    `, [this.userId]);

    await this.dbManager.saveDatabase();

    return {
      success: true,
      tier: newTier,
      expiresAt
    };
  }

  // ==================== Team Management ====================

  /**
   * Create a team (requires team tier or higher)
   */
  async createTeam(teamName) {
    if (this.currentTier !== 'team' && this.currentTier !== 'enterprise') {
      return { success: false, error: 'Team or Enterprise tier required' };
    }

    const teamId = 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    const db = await this.dbManager.getDatabase();
    
    const memberLimit = this.currentTier === 'enterprise' ? 999 : 10;

    db.run(`
      INSERT INTO teams (team_id, name, owner_id, tier, member_limit, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [teamId, teamName, this.userId, this.currentTier, memberLimit, now]);

    // Add owner as admin
    db.run(`
      INSERT INTO team_members (team_id, user_id, role, joined_at, permissions)
      VALUES (?, ?, 'admin', ?, 'all')
    `, [teamId, this.userId, now]);

    await this.dbManager.saveDatabase();

    return {
      success: true,
      teamId,
      name: teamName
    };
  }

  /**
   * Add member to team
   */
  async addTeamMember(teamId, userId, role = 'member') {
    const db = await this.dbManager.getDatabase();
    
    // Check team exists and user is admin
    const teamCheck = db.exec(`
      SELECT t.member_limit, COUNT(m.id) as current_members
      FROM teams t
      LEFT JOIN team_members m ON t.team_id = m.team_id
      WHERE t.team_id = ?
      GROUP BY t.team_id
    `, [teamId]);

    if (teamCheck.length === 0 || teamCheck[0].values.length === 0) {
      return { success: false, error: 'Team not found' };
    }

    const [memberLimit, currentMembers] = teamCheck[0].values[0];

    if (currentMembers >= memberLimit) {
      return { success: false, error: 'Team member limit reached' };
    }

    const now = Date.now();

    try {
      db.run(`
        INSERT INTO team_members (team_id, user_id, role, joined_at)
        VALUES (?, ?, ?, ?)
      `, [teamId, userId, role, now]);

      await this.dbManager.saveDatabase();

      return { success: true, userId, role };
    } catch (error) {
      return { success: false, error: 'User already in team or invalid data' };
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId) {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT user_id, role, joined_at, permissions
      FROM team_members
      WHERE team_id = ?
      ORDER BY joined_at ASC
    `, [teamId]);

    if (!result.length) return [];

    return this.formatQueryResults(result[0]);
  }

  /**
   * Get user's teams
   */
  async getUserTeams() {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT t.team_id, t.name, t.tier, t.created_at, m.role,
             (SELECT COUNT(*) FROM team_members WHERE team_id = t.team_id) as member_count
      FROM teams t
      INNER JOIN team_members m ON t.team_id = m.team_id
      WHERE m.user_id = ?
      ORDER BY t.created_at DESC
    `, [this.userId]);

    if (!result.length) return [];

    return this.formatQueryResults(result[0]);
  }

  // ==================== Feature Flags ====================

  /**
   * Set feature flag
   */
  async setFeatureFlag(featureName, enabled, tierRequired = null, rolloutPercentage = 100) {
    const db = await this.dbManager.getDatabase();

    db.run(`
      INSERT OR REPLACE INTO feature_flags (feature_name, enabled, tier_required, rollout_percentage)
      VALUES (?, ?, ?, ?)
    `, [featureName, enabled ? 1 : 0, tierRequired, rolloutPercentage]);

    await this.dbManager.saveDatabase();
  }

  /**
   * Check if feature flag is enabled
   */
  async isFeatureEnabled(featureName) {
    const db = await this.dbManager.getDatabase();
    
    const result = db.exec(`
      SELECT enabled, tier_required, rollout_percentage
      FROM feature_flags
      WHERE feature_name = ?
    `, [featureName]);

    if (!result.length || result[0].values.length === 0) {
      return false;
    }

    const [enabled, tierRequired, rolloutPercentage] = result[0].values[0];

    if (!enabled) return false;

    // Check tier requirement
    if (tierRequired) {
      const tierOrder = ['free', 'pro', 'team', 'enterprise'];
      const requiredIndex = tierOrder.indexOf(tierRequired);
      const currentIndex = tierOrder.indexOf(this.currentTier);
      
      if (currentIndex < requiredIndex) return false;
    }

    // Check rollout percentage
    if (rolloutPercentage < 100) {
      const userHash = this.hashUserId(this.userId);
      return (userHash % 100) < rolloutPercentage;
    }

    return true;
  }

  // ==================== Helper Methods ====================

  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  formatQueryResults(queryResult) {
    const columns = queryResult.columns;
    const values = queryResult.values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }
}

// Export for use in background script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PremiumFeatures;
}
