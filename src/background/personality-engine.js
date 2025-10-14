// Personality Reflection Engine for SupriAI
// Generates weekly identity snapshots, analyzes tone, and tracks emotional themes

export class PersonalityEngine {
  constructor(aiProcessor) {
    this.ai = aiProcessor;
  }

  // Generate weekly personality snapshot
  async generateWeeklySnapshot(weeklyData) {
    const { visits, highlights, topics, timeSpent } = weeklyData;

    try {
      if (!this.ai.apiKey) {
        return this.generateFallbackSnapshot(weeklyData);
      }

      const snapshot = await this.ai.generatePersonalityReport(weeklyData);
      
      return {
        timestamp: Date.now(),
        weekStart: weeklyData.weekStart,
        weekEnd: weeklyData.weekEnd,
        tone: snapshot.tone,
        topTopics: snapshot.topTopics,
        readingHabits: snapshot.readingHabits,
        emotionalThemes: snapshot.emotionalThemes,
        summary: snapshot.summary,
        totalTimeSpent: timeSpent,
        totalVisits: visits.length,
        totalHighlights: highlights.length,
        dominantInterests: snapshot.dominantInterests
      };
    } catch (error) {
      console.error('Snapshot generation error:', error);
      return this.generateFallbackSnapshot(weeklyData);
    }
  }

  // Analyze tone from content
  async analyzeTone(content) {
    if (!this.ai.apiKey) {
      return this.generateFallbackTone(content);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the tone of the reading content. Return 2-3 descriptive words like "analytical, reflective, optimistic" or "critical, curious, thoughtful".'
            },
            {
              role: 'user',
              content: content.substring(0, 2000)
            }
          ],
          max_tokens: 20,
          temperature: 0.5
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Tone analysis error:', error);
      return this.generateFallbackTone(content);
    }
  }

  // Detect emotional themes
  async detectEmotionalThemes(content) {
    if (!this.ai.apiKey) {
      return this.generateFallbackEmotions(content);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Identify the emotional themes in this content. Return 2-4 emotions like "curiosity, nostalgia, hope" or "anxiety, determination, wonder".'
            },
            {
              role: 'user',
              content: content.substring(0, 2000)
            }
          ],
          max_tokens: 30,
          temperature: 0.6
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim().split(',').map(e => e.trim());
    } catch (error) {
      console.error('Emotional theme detection error:', error);
      return this.generateFallbackEmotions(content);
    }
  }

  // Generate personality quote for the week
  async generateWeeklyQuote(snapshot) {
    if (!this.ai.apiKey) {
      return this.getFallbackQuote();
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Generate an inspiring quote that matches the user\'s weekly vibe. Keep it under 100 characters, thoughtful and motivating.'
            },
            {
              role: 'user',
              content: `This week's vibe: ${snapshot.tone}. Topics: ${snapshot.topTopics.join(', ')}. Emotional themes: ${snapshot.emotionalThemes.join(', ')}.`
            }
          ],
          max_tokens: 60,
          temperature: 0.8
        })
      });

      const data = await response.json();
      return data.choices[0].message.content.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Quote generation error:', error);
      return this.getFallbackQuote();
    }
  }

  // Analyze sentiment (positive/negative/neutral)
  async analyzeSentiment(content) {
    if (!this.ai.apiKey) {
      return this.generateFallbackSentiment(content);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ai.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Analyze the sentiment. Return ONLY one word: "positive", "negative", or "neutral".'
            },
            {
              role: 'user',
              content: content.substring(0, 1000)
            }
          ],
          max_tokens: 5,
          temperature: 0.3
        })
      });

      const data = await response.json();
      const sentiment = data.choices[0].message.content.trim().toLowerCase();
      
      return {
        sentiment: sentiment,
        score: sentiment === 'positive' ? 0.7 : (sentiment === 'negative' ? -0.7 : 0)
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.generateFallbackSentiment(content);
    }
  }

  // Fallback methods

  generateFallbackSnapshot(weeklyData) {
    const { visits, topics } = weeklyData;
    
    // Extract top topics
    const topicFreq = {};
    topics.forEach(topic => {
      topicFreq[topic] = (topicFreq[topic] || 0) + 1;
    });
    const topTopics = Object.entries(topicFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      timestamp: Date.now(),
      weekStart: weeklyData.weekStart,
      weekEnd: weeklyData.weekEnd,
      tone: 'curious, engaged',
      topTopics: topTopics,
      readingHabits: 'Regular browsing',
      emotionalThemes: ['curiosity', 'interest'],
      summary: `This week, you explored ${topTopics.slice(0, 3).join(', ')}. Your tone: curious and engaged.`,
      totalTimeSpent: weeklyData.timeSpent,
      totalVisits: visits.length,
      totalHighlights: weeklyData.highlights.length,
      dominantInterests: topTopics.slice(0, 3)
    };
  }

  generateFallbackTone(content) {
    const words = content.toLowerCase();
    const toneWords = {
      analytical: ['data', 'analysis', 'study', 'research', 'evidence'],
      creative: ['design', 'art', 'creative', 'innovation', 'imagine'],
      technical: ['code', 'software', 'development', 'programming', 'system'],
      curious: ['why', 'how', 'what', 'learn', 'understand'],
      optimistic: ['success', 'growth', 'opportunity', 'future', 'potential']
    };

    const scores = {};
    for (const [tone, keywords] of Object.entries(toneWords)) {
      scores[tone] = keywords.filter(kw => words.includes(kw)).length;
    }

    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tone]) => tone);

    return sorted.length > 0 ? sorted.join(', ') : 'curious, thoughtful';
  }

  generateFallbackEmotions(content) {
    return ['curiosity', 'interest', 'focus'];
  }

  generateFallbackSentiment(content) {
    const positiveWords = ['good', 'great', 'amazing', 'love', 'excellent', 'happy', 'success'];
    const negativeWords = ['bad', 'terrible', 'hate', 'problem', 'issue', 'difficult', 'fail'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;

    if (positiveCount > negativeCount) {
      return { sentiment: 'positive', score: 0.5 };
    } else if (negativeCount > positiveCount) {
      return { sentiment: 'negative', score: -0.5 };
    }
    return { sentiment: 'neutral', score: 0 };
  }

  getFallbackQuote() {
    const quotes = [
      "Your curiosity is your compass.",
      "Every search shapes who you're becoming.",
      "Your digital journey reflects your growth.",
      "Learning is a continuous adventure.",
      "Your interests tell your story."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Calculate interest evolution
  calculateInterestEvolution(historicalData) {
    // Group topics by time periods
    const periods = {};
    
    historicalData.forEach(item => {
      const month = new Date(item.timestamp).toISOString().slice(0, 7); // YYYY-MM
      if (!periods[month]) {
        periods[month] = { topics: [], count: 0 };
      }
      
      if (item.topics) {
        periods[month].topics.push(...item.topics);
        periods[month].count++;
      }
    });

    // Calculate top topics per period
    const evolution = Object.entries(periods).map(([month, data]) => {
      const topicFreq = {};
      data.topics.forEach(topic => {
        topicFreq[topic] = (topicFreq[topic] || 0) + 1;
      });

      const topTopics = Object.entries(topicFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

      return {
        period: month,
        topTopics: topTopics,
        totalVisits: data.count
      };
    });

    return evolution;
  }

  // Detect trending interests (what's hot this week)
  detectTrendingInterests(currentWeek, previousWeeks) {
    const currentTopics = {};
    currentWeek.topics.forEach(topic => {
      currentTopics[topic] = (currentTopics[topic] || 0) + 1;
    });

    const previousTopics = {};
    previousWeeks.forEach(week => {
      week.topics?.forEach(topic => {
        previousTopics[topic] = (previousTopics[topic] || 0) + 1;
      });
    });

    // Calculate trend scores
    const trends = [];
    for (const [topic, currentCount] of Object.entries(currentTopics)) {
      const previousCount = previousTopics[topic] || 0;
      const avgPreviousCount = previousCount / Math.max(previousWeeks.length, 1);
      const trendScore = currentCount - avgPreviousCount;

      if (trendScore > 0) {
        trends.push({
          topic,
          currentCount,
          previousAvg: avgPreviousCount,
          trendScore,
          status: trendScore > 2 ? 'rising' : 'steady'
        });
      }
    }

    return trends.sort((a, b) => b.trendScore - a.trendScore).slice(0, 10);
  }
}
