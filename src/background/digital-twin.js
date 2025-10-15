// Digital Twin AI for SupriAI
// Creates an AI reflection trained on browsing patterns, tone, and interests

export class DigitalTwinAI {
  constructor(aiProcessor, dbManager) {
    this.ai = aiProcessor;
    this.db = dbManager;
    this.twinProfile = null;
    this.loadProfile();
  }

  // Load digital twin profile
  async loadProfile() {
    chrome.storage.local.get(['digital_twin_profile'], (result) => {
      this.twinProfile = result.digital_twin_profile || this.createEmptyProfile();
    });
  }

  // Save digital twin profile
  async saveProfile() {
    await chrome.storage.local.set({ digital_twin_profile: this.twinProfile });
  }

  // Create empty profile structure
  createEmptyProfile() {
    return {
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      interestHistory: [],
      toneHistory: [],
      topicPreferences: {},
      emotionalPatterns: {},
      browsingPatterns: {
        peakHours: [],
        averageSessionDuration: 0,
        favoriteCategories: []
      },
      personalityTraits: [],
      thoughtPatterns: [],
      learningStyle: null,
      totalDataPoints: 0
    };
  }

  // Update twin with new data
  async updateTwin(data) {
    const { topics, tone, emotions, timestamp, timeSpent, category } = data;

    if (!this.twinProfile) {
      this.twinProfile = this.createEmptyProfile();
    }

    // Update topic preferences
    if (topics) {
      topics.forEach(topic => {
        if (!this.twinProfile.topicPreferences[topic]) {
          this.twinProfile.topicPreferences[topic] = {
            count: 0,
            totalTime: 0,
            firstSeen: timestamp,
            lastSeen: timestamp
          };
        }
        this.twinProfile.topicPreferences[topic].count++;
        this.twinProfile.topicPreferences[topic].totalTime += timeSpent || 0;
        this.twinProfile.topicPreferences[topic].lastSeen = timestamp;
      });
    }

    // Update tone history
    if (tone) {
      this.twinProfile.toneHistory.push({
        tone,
        timestamp
      });
      // Keep last 100 tone records
      if (this.twinProfile.toneHistory.length > 100) {
        this.twinProfile.toneHistory = this.twinProfile.toneHistory.slice(-100);
      }
    }

    // Update emotional patterns
    if (emotions) {
      emotions.forEach(emotion => {
        if (!this.twinProfile.emotionalPatterns[emotion]) {
          this.twinProfile.emotionalPatterns[emotion] = 0;
        }
        this.twinProfile.emotionalPatterns[emotion]++;
      });
    }

    // Update browsing patterns
    const hour = new Date(timestamp).getHours();
    if (!this.twinProfile.browsingPatterns.peakHours[hour]) {
      this.twinProfile.browsingPatterns.peakHours[hour] = 0;
    }
    this.twinProfile.browsingPatterns.peakHours[hour]++;

    if (category) {
      if (!this.twinProfile.browsingPatterns.favoriteCategories.includes(category)) {
        this.twinProfile.browsingPatterns.favoriteCategories.push(category);
      }
    }

    this.twinProfile.totalDataPoints++;
    this.twinProfile.lastUpdated = timestamp;

    await this.saveProfile();
  }

  // Ask the digital twin a question
  async askTwin(question) {
    if (!this.ai.apiKey) {
      return this.generateFallbackResponse(question);
    }

    try {
      const context = this.buildTwinContext();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are the user's digital twin - a reflection of their browsing personality and interests. 
              
Your role is to answer questions about the user's past interests, behaviors, and patterns based on the data below.

USER PROFILE:
${context}

Respond as if you ARE the user, using "I" and reflecting their personality. Be insightful, honest, and helpful.`
            },
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      const data = await response.json();
      return {
        answer: data.choices[0].message.content.trim(),
        confidence: this.calculateConfidence(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Digital twin error:', error);
      return this.generateFallbackResponse(question);
    }
  }

  // Build context for the digital twin
  buildTwinContext() {
    const topTopics = Object.entries(this.twinProfile.topicPreferences)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([topic, data]) => `${topic} (${data.count} times)`);

    const recentTones = this.twinProfile.toneHistory
      .slice(-10)
      .map(t => t.tone)
      .join(', ');

    const topEmotions = Object.entries(this.twinProfile.emotionalPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => `${emotion} (${count})`);

    const peakHour = this.twinProfile.browsingPatterns.peakHours
      .reduce((max, count, hour) => count > (max.count || 0) ? { hour, count } : max, {});

    return `
Top Interests: ${topTopics.join(', ')}
Recent Tone: ${recentTones || 'curious, thoughtful'}
Emotional Patterns: ${topEmotions.join(', ')}
Most Active Hour: ${peakHour.hour || 'N/A'}:00
Favorite Categories: ${this.twinProfile.browsingPatterns.favoriteCategories.join(', ')}
Total Data Points: ${this.twinProfile.totalDataPoints}
Profile Age: ${Math.floor((Date.now() - this.twinProfile.createdAt) / (1000 * 60 * 60 * 24))} days
    `.trim();
  }

  // Calculate confidence level based on data quantity
  calculateConfidence() {
    if (this.twinProfile.totalDataPoints < 10) return 'low';
    if (this.twinProfile.totalDataPoints < 50) return 'medium';
    if (this.twinProfile.totalDataPoints < 200) return 'high';
    return 'very high';
  }

  // Generate fallback response when AI is unavailable
  generateFallbackResponse(question) {
    const q = question.toLowerCase();
    
    if (q.includes('topic') || q.includes('interest')) {
      const topTopics = Object.entries(this.twinProfile.topicPreferences)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([topic]) => topic);
      
      return {
        answer: `Based on your browsing, you've been most interested in: ${topTopics.join(', ')}`,
        confidence: 'medium',
        timestamp: Date.now()
      };
    }

    if (q.includes('avoid') || q.includes('less')) {
      const leastTopics = Object.entries(this.twinProfile.topicPreferences)
        .sort((a, b) => a[1].count - b[1].count)
        .slice(0, 3)
        .map(([topic]) => topic);
      
      return {
        answer: `You seem to have explored these less: ${leastTopics.join(', ')}`,
        confidence: 'medium',
        timestamp: Date.now()
      };
    }

    if (q.includes('year ago') || q.includes('last year')) {
      const oldInterests = Object.entries(this.twinProfile.topicPreferences)
        .filter(([_, data]) => data.lastSeen < Date.now() - (180 * 24 * 60 * 60 * 1000))
        .slice(0, 3)
        .map(([topic]) => topic);
      
      return {
        answer: oldInterests.length > 0 
          ? `Looking back, you were interested in: ${oldInterests.join(', ')}`
          : "I don't have enough historical data to answer that yet.",
        confidence: 'low',
        timestamp: Date.now()
      };
    }

    return {
      answer: "I'm still learning about you. Keep browsing and I'll have better insights soon!",
      confidence: 'low',
      timestamp: Date.now()
    };
  }

  // Get twin insights summary
  getTwinSummary() {
    const topInterests = Object.entries(this.twinProfile.topicPreferences)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        totalTime: data.totalTime,
        recency: Date.now() - data.lastSeen
      }));

    const dominantEmotions = Object.entries(this.twinProfile.emotionalPatterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);

    const peakHours = this.twinProfile.browsingPatterns.peakHours
      .map((count, hour) => ({ hour, count }))
      .filter(h => h.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    return {
      maturityLevel: this.calculateConfidence(),
      topInterests,
      dominantEmotions,
      peakBrowsingHours: peakHours,
      totalDataPoints: this.twinProfile.totalDataPoints,
      profileAge: Math.floor((Date.now() - this.twinProfile.createdAt) / (1000 * 60 * 60 * 24)),
      lastUpdated: this.twinProfile.lastUpdated
    };
  }

  // Compare current interests with past
  async compareWithPast(periodDaysAgo = 30) {
    const cutoffTime = Date.now() - (periodDaysAgo * 24 * 60 * 60 * 1000);
    
    const pastInterests = Object.entries(this.twinProfile.topicPreferences)
      .filter(([_, data]) => data.lastSeen < cutoffTime && data.firstSeen < cutoffTime)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([topic]) => topic);

    const currentInterests = Object.entries(this.twinProfile.topicPreferences)
      .filter(([_, data]) => data.lastSeen >= cutoffTime)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([topic]) => topic);

    const newInterests = currentInterests.filter(i => !pastInterests.includes(i));
    const fadedInterests = pastInterests.filter(i => !currentInterests.includes(i));
    const continuingInterests = currentInterests.filter(i => pastInterests.includes(i));

    return {
      past: pastInterests,
      current: currentInterests,
      new: newInterests,
      faded: fadedInterests,
      continuing: continuingInterests,
      periodDays: periodDaysAgo
    };
  }

  // Predict future interests based on patterns
  predictFutureInterests() {
    // Simple trend analysis
    const recentTopics = Object.entries(this.twinProfile.topicPreferences)
      .filter(([_, data]) => data.lastSeen > Date.now() - (14 * 24 * 60 * 60 * 1000))
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      likelyNextInterests: recentTopics,
      reasoning: "Based on your recent browsing patterns and interest evolution"
    };
  }

  // Advanced: Predictive Interest Mapping
  async predictInterestMapping() {
    const currentInterests = Object.entries(this.twinProfile.topicPreferences)
      .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
      .slice(0, 10);

    const predictions = [];

    for (const [topic, data] of currentInterests) {
      // Calculate growth rate
      const daysSinceFirst = (Date.now() - data.firstSeen) / (1000 * 60 * 60 * 24);
      const growthRate = data.count / Math.max(daysSinceFirst, 1);

      // Predict continuation
      const willContinue = growthRate > 0.5 && (Date.now() - data.lastSeen) < (14 * 24 * 60 * 60 * 1000);

      predictions.push({
        topic,
        currentLevel: this.calculateTopicLevel(data),
        growthRate,
        likelyContinuation: willContinue ? 'high' : 'medium',
        recommendedAction: this.getRecommendedAction(data, growthRate),
        relatedTopics: this.findRelatedTopics(topic)
      });
    }

    return {
      predictions,
      suggestedNewTopics: this.suggestNewTopics(),
      timestamp: Date.now()
    };
  }

  calculateTopicLevel(data) {
    const hours = data.totalTime / (1000 * 60 * 60);
    if (hours < 2) return 'beginner';
    if (hours < 10) return 'intermediate';
    if (hours < 50) return 'advanced';
    return 'expert';
  }

  getRecommendedAction(data, growthRate) {
    const daysSinceLastSeen = (Date.now() - data.lastSeen) / (1000 * 60 * 60 * 24);

    if (daysSinceLastSeen > 30) {
      return 'This topic has faded. Consider revisiting or moving on.';
    }

    if (growthRate > 1) {
      return 'You\'re deeply engaged! Consider taking a course or building a project.';
    }

    if (growthRate > 0.3) {
      return 'Steady exploration. Keep the momentum going!';
    }

    return 'Light exploration. Dive deeper if interested.';
  }

  findRelatedTopics(topic) {
    // Simple keyword-based relationship mapping
    const relationMap = {
      programming: ['web development', 'software engineering', 'coding'],
      ai: ['machine learning', 'data science', 'neural networks'],
      design: ['ui/ux', 'creative', 'visual arts'],
      business: ['startup', 'entrepreneurship', 'management'],
      marketing: ['social media', 'content creation', 'seo']
    };

    const topicLower = topic.toLowerCase();
    for (const [key, related] of Object.entries(relationMap)) {
      if (topicLower.includes(key)) {
        return related;
      }
    }

    return [];
  }

  suggestNewTopics() {
    // Suggest topics based on current interests
    const currentTopics = Object.keys(this.twinProfile.topicPreferences);
    const suggestions = [];

    // Cross-domain suggestions
    if (currentTopics.some(t => t.includes('programming'))) {
      suggestions.push({
        topic: 'AI/ML',
        reason: 'Natural extension of your programming interests',
        confidence: 0.8
      });
    }

    if (currentTopics.some(t => t.includes('design'))) {
      suggestions.push({
        topic: 'Frontend Development',
        reason: 'Combine design with code',
        confidence: 0.7
      });
    }

    return suggestions;
  }

  // Future Self Simulation - What you might think in 6 months
  async futureSelfSimulation(question, monthsAhead = 6) {
    if (!this.ai.apiKey) {
      return this.generateFutureSelfFallback(question, monthsAhead);
    }

    try {
      const context = this.buildTwinContext();
      const trends = await this.predictInterestMapping();

      const prompt = `Based on this user profile and their interest trends, 
      simulate what they might think about this question ${monthsAhead} months from now:
      
      USER PROFILE: ${context}
      
      CURRENT TRENDS: ${JSON.stringify(trends.predictions.slice(0, 3))}
      
      QUESTION: ${question}
      
      Consider:
      1. How their interests might evolve
      2. What skills they might acquire
      3. How their perspective might mature
      4. What new connections they might make
      
      Respond as their future self would.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are simulating a user\'s future self based on their current interests and trends.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 250,
          temperature: 0.8
        })
      });

      const data = await response.json();
      return {
        answer: data.choices[0].message.content.trim(),
        confidence: 'medium',
        monthsAhead,
        timestamp: Date.now(),
        disclaimer: 'This is a simulation based on your current patterns. Your actual future self may think differently!'
      };
    } catch (error) {
      console.error('Future self simulation error:', error);
      return this.generateFutureSelfFallback(question, monthsAhead);
    }
  }

  generateFutureSelfFallback(question, monthsAhead) {
    const topInterests = Object.entries(this.twinProfile.topicPreferences)
      .sort((a, b) => b[1].totalTime - a[1].totalTime)
      .slice(0, 3)
      .map(([topic]) => topic);

    return {
      answer: `In ${monthsAhead} months, after spending more time with ${topInterests.join(', ')}, I'll likely have a deeper perspective on this. My current exploration suggests I'm heading towards mastery in these areas.`,
      confidence: 'low',
      monthsAhead,
      timestamp: Date.now(),
      disclaimer: 'This is a basic prediction. Enable AI features for more accurate future self simulation.'
    };
  }

  // Conversational Twin - Natural language interface
  async conversationalTwin(message) {
    if (!this.ai.apiKey) {
      return this.generateConversationalFallback(message);
    }

    try {
      const context = this.buildTwinContext();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are this user's digital twin. You know them based on:
              
${context}

Have a natural conversation. Be helpful, insightful, and reflect their personality.
Offer summaries, advice, creative prompts, or answer questions about their patterns.`
            },
            {
              role: 'user',
              content: message
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      // Save interaction
      await this.db.saveTwinInteraction(
        message,
        data.choices[0].message.content.trim(),
        this.calculateConfidence()
      );

      return {
        response: data.choices[0].message.content.trim(),
        confidence: this.calculateConfidence(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Conversational twin error:', error);
      return this.generateConversationalFallback(message);
    }
  }

  generateConversationalFallback(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('summary') || msg.includes('what have i')) {
      const topTopics = Object.entries(this.twinProfile.topicPreferences)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([topic]) => topic);
      
      return {
        response: `Based on your browsing, you've been most engaged with: ${topTopics.join(', ')}. You have ${this.twinProfile.totalDataPoints} data points collected.`,
        confidence: 'medium',
        timestamp: Date.now()
      };
    }

    if (msg.includes('advice') || msg.includes('should')) {
      return {
        response: 'Based on your patterns, I suggest focusing on one topic deeply rather than spreading too thin. Your most consistent interest could become a valuable skill!',
        confidence: 'low',
        timestamp: Date.now()
      };
    }

    if (msg.includes('creative') || msg.includes('idea')) {
      const topics = Object.keys(this.twinProfile.topicPreferences).slice(0, 2);
      return {
        response: `Creative prompt: What if you combined ${topics[0]} with ${topics[1]}? Sometimes the best innovations come from unexpected combinations!`,
        confidence: 'medium',
        timestamp: Date.now()
      };
    }

    return {
      response: 'I\'m your digital twin, still learning about you! Keep browsing and I\'ll have better insights. You can ask me for summaries, advice, or creative prompts.',
      confidence: 'low',
      timestamp: Date.now()
    };
  }
}
