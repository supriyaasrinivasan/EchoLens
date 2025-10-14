// AI Processor for EchoLens
// Handles all AI-related operations (summarization, tagging, topic extraction)

export class AIProcessor {
  constructor() {
    this.apiKey = null;
    this.provider = 'openai'; // or 'anthropic'
    this.loadConfig();
  }

  async loadConfig() {
    // Load API key from storage
    chrome.storage.local.get(['ai_api_key', 'ai_provider'], (result) => {
      this.apiKey = result.ai_api_key || null;
      this.provider = result.ai_provider || 'openai';
    });
  }

  // Generate a summary of the content
  async generateSummary(content) {
    if (!this.apiKey) {
      console.warn('No AI API key configured');
      return this.generateFallbackSummary(content);
    }

    try {
      if (this.provider === 'openai') {
        return await this.openAISummary(content);
      } else if (this.provider === 'anthropic') {
        return await this.anthropicSummary(content);
      }
    } catch (error) {
      console.error('AI summary error:', error);
      return this.generateFallbackSummary(content);
    }
  }

  async openAISummary(content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a concise summarizer. Create a 1-2 sentence summary of the following content that captures the main topic and purpose.'
          },
          {
            role: 'user',
            content: content.substring(0, 3000)
          }
        ],
        max_tokens: 100,
        temperature: 0.5
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  }

  async anthropicSummary(content) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: `Summarize this content in 1-2 sentences:\n\n${content.substring(0, 3000)}`
          }
        ]
      })
    });

    const data = await response.json();
    return data.content[0].text.trim();
  }

  // Predict tags based on content
  async predictTags(content, title) {
    if (!this.apiKey) {
      return this.generateFallbackTags(content, title);
    }

    try {
      if (this.provider === 'openai') {
        return await this.openAITags(content, title);
      } else if (this.provider === 'anthropic') {
        return await this.anthropicTags(content, title);
      }
    } catch (error) {
      console.error('AI tagging error:', error);
      return this.generateFallbackTags(content, title);
    }
  }

  async openAITags(content, title) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate 3-5 relevant tags for this content. Return only the tags separated by commas, like: learning, ai, research'
          },
          {
            role: 'user',
            content: `Title: ${title}\n\nContent: ${content.substring(0, 2000)}`
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    const data = await response.json();
    const tags = data.choices[0].message.content.trim().split(',').map(t => t.trim());
    return tags.slice(0, 5);
  }

  async anthropicTags(content, title) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: `Generate 3-5 relevant tags for this content. Return only tags separated by commas.\n\nTitle: ${title}\n\nContent: ${content.substring(0, 2000)}`
          }
        ]
      })
    });

    const data = await response.json();
    const tags = data.content[0].text.trim().split(',').map(t => t.trim());
    return tags.slice(0, 5);
  }

  // Extract key topics/concepts
  async extractTopics(content) {
    if (!this.apiKey) {
      return this.generateFallbackTopics(content);
    }

    try {
      if (this.provider === 'openai') {
        return await this.openAITopics(content);
      } else if (this.provider === 'anthropic') {
        return await this.anthropicTopics(content);
      }
    } catch (error) {
      console.error('AI topic extraction error:', error);
      return this.generateFallbackTopics(content);
    }
  }

  async openAITopics(content) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract 3-5 key topics or concepts from this content. Return only the topics separated by commas.'
          },
          {
            role: 'user',
            content: content.substring(0, 2000)
          }
        ],
        max_tokens: 60,
        temperature: 0.5
      })
    });

    const data = await response.json();
    return data.choices[0].message.content.trim().split(',').map(t => t.trim());
  }

  async anthropicTopics(content) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 60,
        messages: [
          {
            role: 'user',
            content: `Extract 3-5 key topics or concepts from this content. Return only topics separated by commas.\n\n${content.substring(0, 2000)}`
          }
        ]
      })
    });

    const data = await response.json();
    return data.content[0].text.trim().split(',').map(t => t.trim());
  }

  // Fallback methods when API is not available

  generateFallbackSummary(content) {
    // Simple extractive summary - first meaningful sentence
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).join('. ').substring(0, 200) + '...';
  }

  generateFallbackTags(content, title) {
    // Simple keyword extraction
    const text = (title + ' ' + content).toLowerCase();
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'];
    
    const words = text.split(/\W+/).filter(w => 
      w.length > 3 && 
      !commonWords.includes(w) &&
      !/^\d+$/.test(w)
    );

    // Count frequency
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);

    // Get top words
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return sorted;
  }

  generateFallbackTopics(content) {
    // Similar to tags but focused on noun phrases
    return this.generateFallbackTags(content, '');
  }
}
