/**
 * SupriAI - Recommendation Engine
 * Generates personalized learning recommendations based on user behavior
 */

import { StorageManager } from './storage.js';
import { getCategoryColor, getCategoryIcon } from './utils.js';

export class RecommendationEngine {
    constructor() {
        this.storage = new StorageManager();
        
        // Learning resources database (curated)
        this.resourceDatabase = {
            'Programming': [
                { title: 'JavaScript Fundamentals', url: 'https://javascript.info/', type: 'Tutorial', difficulty: 'beginner' },
                { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'Documentation', difficulty: 'beginner' },
                { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/', type: 'Course', difficulty: 'beginner' },
                { title: 'LeetCode Problems', url: 'https://leetcode.com/', type: 'Practice', difficulty: 'intermediate' },
                { title: 'Clean Code Principles', url: 'https://www.youtube.com/results?search_query=clean+code', type: 'Video', difficulty: 'intermediate' }
            ],
            'Data Science': [
                { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', type: 'Course', difficulty: 'beginner' },
                { title: 'Towards Data Science', url: 'https://towardsdatascience.com/', type: 'Articles', difficulty: 'intermediate' },
                { title: 'StatQuest with Josh Starmer', url: 'https://www.youtube.com/c/joshstarmer', type: 'Video', difficulty: 'beginner' },
                { title: 'Fast.ai Courses', url: 'https://www.fast.ai/', type: 'Course', difficulty: 'intermediate' },
                { title: 'Scikit-learn Documentation', url: 'https://scikit-learn.org/stable/tutorial/', type: 'Documentation', difficulty: 'intermediate' }
            ],
            'Web Development': [
                { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', type: 'Documentation', difficulty: 'beginner' },
                { title: 'CSS Tricks', url: 'https://css-tricks.com/', type: 'Articles', difficulty: 'intermediate' },
                { title: 'The Odin Project', url: 'https://www.theodinproject.com/', type: 'Course', difficulty: 'beginner' },
                { title: 'React Documentation', url: 'https://react.dev/', type: 'Documentation', difficulty: 'intermediate' },
                { title: 'Frontend Masters', url: 'https://frontendmasters.com/', type: 'Course', difficulty: 'advanced' }
            ],
            'DevOps': [
                { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'Tutorial', difficulty: 'beginner' },
                { title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/', type: 'Tutorial', difficulty: 'intermediate' },
                { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/', type: 'Platform', difficulty: 'intermediate' },
                { title: 'Linux Journey', url: 'https://linuxjourney.com/', type: 'Course', difficulty: 'beginner' },
                { title: 'DevOps Roadmap', url: 'https://roadmap.sh/devops', type: 'Roadmap', difficulty: 'beginner' }
            ],
            'Mathematics': [
                { title: 'Khan Academy Math', url: 'https://www.khanacademy.org/math', type: 'Course', difficulty: 'beginner' },
                { title: '3Blue1Brown', url: 'https://www.youtube.com/c/3blue1brown', type: 'Video', difficulty: 'intermediate' },
                { title: 'Brilliant.org', url: 'https://brilliant.org/', type: 'Interactive', difficulty: 'intermediate' },
                { title: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/mathematics/', type: 'Course', difficulty: 'advanced' },
                { title: 'Paul\'s Online Math Notes', url: 'https://tutorial.math.lamar.edu/', type: 'Tutorial', difficulty: 'intermediate' }
            ],
            'Machine Learning': [
                { title: 'Andrew Ng ML Course', url: 'https://www.coursera.org/learn/machine-learning', type: 'Course', difficulty: 'beginner' },
                { title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials', type: 'Tutorial', difficulty: 'intermediate' },
                { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', type: 'Tutorial', difficulty: 'intermediate' },
                { title: 'Hugging Face Course', url: 'https://huggingface.co/course', type: 'Course', difficulty: 'intermediate' },
                { title: 'Papers With Code', url: 'https://paperswithcode.com/', type: 'Research', difficulty: 'advanced' }
            ]
        };

        // Skill trees for structured learning paths
        this.skillTrees = {
            'Web Development': [
                { level: 1, skills: ['HTML Basics', 'CSS Fundamentals', 'JavaScript Intro'] },
                { level: 2, skills: ['Responsive Design', 'CSS Flexbox/Grid', 'DOM Manipulation'] },
                { level: 3, skills: ['React/Vue/Angular', 'State Management', 'API Integration'] },
                { level: 4, skills: ['Testing', 'Performance Optimization', 'PWAs'] },
                { level: 5, skills: ['Full Stack', 'DevOps', 'System Design'] }
            ],
            'Data Science': [
                { level: 1, skills: ['Python Basics', 'Statistics Fundamentals', 'Data Types'] },
                { level: 2, skills: ['Pandas', 'NumPy', 'Data Visualization'] },
                { level: 3, skills: ['Machine Learning Basics', 'Scikit-learn', 'Feature Engineering'] },
                { level: 4, skills: ['Deep Learning', 'NLP', 'Computer Vision'] },
                { level: 5, skills: ['MLOps', 'Model Deployment', 'Research'] }
            ],
            'Programming': [
                { level: 1, skills: ['Variables', 'Control Flow', 'Functions'] },
                { level: 2, skills: ['Data Structures', 'OOP', 'File I/O'] },
                { level: 3, skills: ['Algorithms', 'Design Patterns', 'Testing'] },
                { level: 4, skills: ['Concurrency', 'Databases', 'APIs'] },
                { level: 5, skills: ['System Design', 'Architecture', 'Performance'] }
            ]
        };
    }

    async init() {
        await this.storage.init();
    }

    /**
     * Generate personalized recommendations
     */
    async generate() {
        const profile = await this.storage.getUserProfile();
        const topics = await this.storage.getTopTopics(5);
        const skills = await this.storage.getSkills();
        const recentSessions = await this.storage.getSessions({ limit: 20 });

        const recommendations = [];

        // 1. Continue learning recommendations
        const continueRecs = this.generateContinueLearning(topics, recentSessions);
        recommendations.push(...continueRecs);

        // 2. Skill progression recommendations
        const skillRecs = this.generateSkillProgression(skills, topics);
        recommendations.push(...skillRecs);

        // 3. New topic exploration
        const explorationRecs = this.generateExplorationRecs(topics, profile);
        recommendations.push(...explorationRecs);

        // 4. Resource recommendations
        const resourceRecs = this.generateResourceRecs(topics);
        recommendations.push(...resourceRecs);

        // 5. Study pattern recommendations
        const patternRecs = await this.generatePatternRecs(recentSessions);
        recommendations.push(...patternRecs);

        // Deduplicate and prioritize
        const prioritized = this.prioritizeRecommendations(recommendations);

        // Save recommendations
        await this.storage.saveRecommendations(prioritized);

        return prioritized;
    }

    /**
     * Generate "continue learning" recommendations
     */
    generateContinueLearning(topics, recentSessions) {
        const recommendations = [];
        
        // Find topics that were recently studied but not completed
        const recentTopics = new Map();
        recentSessions.forEach(session => {
            (session.topics || []).forEach(topic => {
                if (!recentTopics.has(topic)) {
                    recentTopics.set(topic, {
                        topic,
                        lastStudied: session.timestamp,
                        totalTime: 0,
                        sessions: 0
                    });
                }
                const data = recentTopics.get(topic);
                data.totalTime += session.duration || 0;
                data.sessions++;
            });
        });

        // Recommend continuing topics with momentum
        const sortedTopics = Array.from(recentTopics.values())
            .filter(t => t.sessions >= 2 && t.totalTime < 3600000) // Less than 1 hour total
            .sort((a, b) => b.lastStudied - a.lastStudied);

        sortedTopics.slice(0, 2).forEach(topicData => {
            recommendations.push({
                type: 'continue',
                title: `Continue: ${topicData.topic}`,
                description: `You've spent ${Math.round(topicData.totalTime / 60000)} minutes on this. Keep the momentum!`,
                topic: topicData.topic,
                priority: 'high',
                icon: '📖'
            });
        });

        return recommendations;
    }

    /**
     * Generate skill progression recommendations
     */
    generateSkillProgression(skills, topics) {
        const recommendations = [];
        
        // Find the user's primary learning path
        const topCategories = topics.map(t => t.category).filter(Boolean);
        const primaryCategory = this.getMostCommon(topCategories);

        if (primaryCategory && this.skillTrees[primaryCategory]) {
            const skillTree = this.skillTrees[primaryCategory];
            const userSkillNames = skills.map(s => s.name.toLowerCase());
            
            // Find current level
            let currentLevel = 0;
            for (const level of skillTree) {
                const hasAllSkills = level.skills.every(skill => 
                    userSkillNames.some(us => us.includes(skill.toLowerCase()))
                );
                if (hasAllSkills) {
                    currentLevel = level.level;
                } else {
                    // Recommend next skill
                    const nextSkill = level.skills.find(skill => 
                        !userSkillNames.some(us => us.includes(skill.toLowerCase()))
                    );
                    if (nextSkill) {
                        recommendations.push({
                            type: 'skill_progression',
                            title: `Next Skill: ${nextSkill}`,
                            description: `Level up your ${primaryCategory} skills by learning ${nextSkill}`,
                            topic: nextSkill,
                            category: primaryCategory,
                            priority: 'high',
                            icon: '🎯'
                        });
                        break;
                    }
                }
            }
        }

        return recommendations;
    }

    /**
     * Generate exploration recommendations for new topics
     */
    generateExplorationRecs(topics, profile) {
        const recommendations = [];
        
        // Get categories user hasn't explored much
        const studiedCategories = new Set(topics.map(t => t.category));
        const allCategories = Object.keys(this.resourceDatabase);
        
        const unexplored = allCategories.filter(c => !studiedCategories.has(c));
        
        if (unexplored.length > 0) {
            const randomCategory = unexplored[Math.floor(Math.random() * unexplored.length)];
            const resources = this.resourceDatabase[randomCategory];
            
            if (resources && resources.length > 0) {
                const beginnerResource = resources.find(r => r.difficulty === 'beginner') || resources[0];
                
                recommendations.push({
                    type: 'explore',
                    title: `Explore: ${randomCategory}`,
                    description: `Broaden your skills with ${beginnerResource.title}`,
                    url: beginnerResource.url,
                    category: randomCategory,
                    priority: 'low',
                    icon: '🌟'
                });
            }
        }

        return recommendations;
    }

    /**
     * Generate specific resource recommendations
     */
    generateResourceRecs(topics) {
        const recommendations = [];
        
        topics.slice(0, 3).forEach(topic => {
            const category = topic.category;
            const resources = this.resourceDatabase[category];
            
            if (resources && resources.length > 0) {
                // Determine difficulty based on time spent
                let difficulty = 'beginner';
                if (topic.totalTime > 3600000) difficulty = 'intermediate';
                if (topic.totalTime > 10800000) difficulty = 'advanced';
                
                const suitableResources = resources.filter(r => {
                    if (difficulty === 'beginner') return r.difficulty === 'beginner';
                    if (difficulty === 'intermediate') return r.difficulty !== 'advanced';
                    return true;
                });
                
                const randomResource = suitableResources[Math.floor(Math.random() * suitableResources.length)];
                
                if (randomResource) {
                    recommendations.push({
                        type: 'resource',
                        title: randomResource.title,
                        description: `${randomResource.type} for ${category} - ${randomResource.difficulty} level`,
                        url: randomResource.url,
                        category: category,
                        resourceType: randomResource.type,
                        priority: 'medium',
                        icon: this.getResourceIcon(randomResource.type)
                    });
                }
            }
        });

        return recommendations;
    }

    /**
     * Generate study pattern recommendations
     */
    async generatePatternRecs(recentSessions) {
        const recommendations = [];
        
        // Analyze recent session patterns
        if (recentSessions.length >= 5) {
            const avgEngagement = recentSessions.reduce((acc, s) => acc + (s.engagementScore || 0), 0) / recentSessions.length;
            const avgDuration = recentSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / recentSessions.length;
            
            // Low engagement suggestion
            if (avgEngagement < 50) {
                recommendations.push({
                    type: 'pattern',
                    title: 'Boost Your Focus',
                    description: 'Try the Pomodoro technique: 25 min focused study + 5 min break',
                    priority: 'medium',
                    icon: '🧘'
                });
            }
            
            // Short sessions suggestion
            if (avgDuration < 600000) { // Less than 10 minutes
                recommendations.push({
                    type: 'pattern',
                    title: 'Extend Study Sessions',
                    description: 'Aim for 25-30 minute sessions for better retention',
                    priority: 'medium',
                    icon: '⏱️'
                });
            }
            
            // Consistency check
            const uniqueDays = new Set(recentSessions.map(s => s.date)).size;
            if (uniqueDays < 3 && recentSessions.length >= 5) {
                recommendations.push({
                    type: 'pattern',
                    title: 'Build a Daily Habit',
                    description: 'Even 15 minutes daily is better than long irregular sessions',
                    priority: 'medium',
                    icon: '📅'
                });
            }
        }

        return recommendations;
    }

    /**
     * Prioritize and deduplicate recommendations
     */
    prioritizeRecommendations(recommendations) {
        // Remove duplicates based on title
        const unique = [];
        const seen = new Set();
        
        for (const rec of recommendations) {
            if (!seen.has(rec.title)) {
                seen.add(rec.title);
                unique.push(rec);
            }
        }

        // Sort by priority
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        unique.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        // Return top recommendations
        return unique.slice(0, 10);
    }

    /**
     * Get icon for resource type
     */
    getResourceIcon(type) {
        const icons = {
            'Tutorial': '📝',
            'Course': '🎓',
            'Video': '🎥',
            'Documentation': '📖',
            'Articles': '📰',
            'Practice': '💪',
            'Interactive': '🎮',
            'Platform': '🌐',
            'Roadmap': '🗺️',
            'Research': '🔬'
        };
        return icons[type] || '📚';
    }

    /**
     * Get most common element in array
     */
    getMostCommon(arr) {
        const counts = {};
        arr.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        
        let maxCount = 0;
        let mostCommon = null;
        
        for (const [item, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = item;
            }
        }
        
        return mostCommon;
    }

    /**
     * Generate learning path for a category
     */
    generateLearningPath(category) {
        const skillTree = this.skillTrees[category];
        if (!skillTree) return null;

        return {
            category,
            levels: skillTree,
            resources: this.resourceDatabase[category] || [],
            estimatedTime: skillTree.reduce((acc, level) => 
                acc + level.skills.length * 5, 0) + ' hours' // 5 hours per skill estimate
        };
    }
}
