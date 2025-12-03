

import { StorageManager } from './storage.js';
import { getCategoryColor, getCategoryIcon } from './utils.js';

export class RecommendationEngine {
    constructor() {
        this.storage = new StorageManager();
        
        this.resourceDatabase = {
            'Programming': [
                { title: 'JavaScript Fundamentals', url: 'https:
                { title: 'Python Official Tutorial', url: 'https:
                { title: 'FreeCodeCamp', url: 'https:
                { title: 'LeetCode Problems', url: 'https:
                { title: 'Clean Code Principles', url: 'https:
            ],
            'Data Science': [
                { title: 'Kaggle Learn', url: 'https:
                { title: 'Towards Data Science', url: 'https:
                { title: 'StatQuest with Josh Starmer', url: 'https:
                { title: 'Fast.ai Courses', url: 'https:
                { title: 'Scikit-learn Documentation', url: 'https:
            ],
            'Web Development': [
                { title: 'MDN Web Docs', url: 'https:
                { title: 'CSS Tricks', url: 'https:
                { title: 'The Odin Project', url: 'https:
                { title: 'React Documentation', url: 'https:
                { title: 'Frontend Masters', url: 'https:
            ],
            'DevOps': [
                { title: 'Docker Getting Started', url: 'https:
                { title: 'Kubernetes Basics', url: 'https:
                { title: 'AWS Free Tier', url: 'https:
                { title: 'Linux Journey', url: 'https:
                { title: 'DevOps Roadmap', url: 'https:
            ],
            'Mathematics': [
                { title: 'Khan Academy Math', url: 'https:
                { title: '3Blue1Brown', url: 'https:
                { title: 'Brilliant.org', url: 'https:
                { title: 'MIT OpenCourseWare', url: 'https:
                { title: 'Paul\'s Online Math Notes', url: 'https:
            ],
            'Machine Learning': [
                { title: 'Andrew Ng ML Course', url: 'https:
                { title: 'TensorFlow Tutorials', url: 'https:
                { title: 'PyTorch Tutorials', url: 'https:
                { title: 'Hugging Face Course', url: 'https:
                { title: 'Papers With Code', url: 'https:
            ]
        };

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

    
    async generate() {
        const profile = await this.storage.getUserProfile();
        const topics = await this.storage.getTopTopics(5);
        const skills = await this.storage.getSkills();
        const recentSessions = await this.storage.getSessions({ limit: 20 });

        const recommendations = [];

        const continueRecs = this.generateContinueLearning(topics, recentSessions);
        recommendations.push(...continueRecs);

        const skillRecs = this.generateSkillProgression(skills, topics);
        recommendations.push(...skillRecs);

        const explorationRecs = this.generateExplorationRecs(topics, profile);
        recommendations.push(...explorationRecs);

        const resourceRecs = this.generateResourceRecs(topics);
        recommendations.push(...resourceRecs);

        const patternRecs = await this.generatePatternRecs(recentSessions);
        recommendations.push(...patternRecs);

        const prioritized = this.prioritizeRecommendations(recommendations);

        await this.storage.saveRecommendations(prioritized);

        return prioritized;
    }

    
    generateContinueLearning(topics, recentSessions) {
        const recommendations = [];
        
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

        const sortedTopics = Array.from(recentTopics.values())
            .filter(t => t.sessions >= 2 && t.totalTime < 3600000)
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

    
    generateSkillProgression(skills, topics) {
        const recommendations = [];
        
        const topCategories = topics.map(t => t.category).filter(Boolean);
        const primaryCategory = this.getMostCommon(topCategories);

        if (primaryCategory && this.skillTrees[primaryCategory]) {
            const skillTree = this.skillTrees[primaryCategory];
            const userSkillNames = skills.map(s => s.name.toLowerCase());
            
            let currentLevel = 0;
            for (const level of skillTree) {
                const hasAllSkills = level.skills.every(skill => 
                    userSkillNames.some(us => us.includes(skill.toLowerCase()))
                );
                if (hasAllSkills) {
                    currentLevel = level.level;
                } else {
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

    
    generateExplorationRecs(topics, profile) {
        const recommendations = [];
        
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

    
    generateResourceRecs(topics) {
        const recommendations = [];
        
        topics.slice(0, 3).forEach(topic => {
            const category = topic.category;
            const resources = this.resourceDatabase[category];
            
            if (resources && resources.length > 0) {
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

    
    async generatePatternRecs(recentSessions) {
        const recommendations = [];
        
        if (recentSessions.length >= 5) {
            const avgEngagement = recentSessions.reduce((acc, s) => acc + (s.engagementScore || 0), 0) / recentSessions.length;
            const avgDuration = recentSessions.reduce((acc, s) => acc + (s.duration || 0), 0) / recentSessions.length;
            
            if (avgEngagement < 50) {
                recommendations.push({
                    type: 'pattern',
                    title: 'Boost Your Focus',
                    description: 'Try the Pomodoro technique: 25 min focused study + 5 min break',
                    priority: 'medium',
                    icon: '🧘'
                });
            }
            
            if (avgDuration < 600000) {
                recommendations.push({
                    type: 'pattern',
                    title: 'Extend Study Sessions',
                    description: 'Aim for 25-30 minute sessions for better retention',
                    priority: 'medium',
                    icon: '⏱️'
                });
            }
            
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

    
    prioritizeRecommendations(recommendations) {
        const unique = [];
        const seen = new Set();
        
        for (const rec of recommendations) {
            if (!seen.has(rec.title)) {
                seen.add(rec.title);
                unique.push(rec);
            }
        }

        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        unique.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return unique.slice(0, 10);
    }

    
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

    
    generateLearningPath(category) {
        const skillTree = this.skillTrees[category];
        if (!skillTree) return null;

        return {
            category,
            levels: skillTree,
            resources: this.resourceDatabase[category] || [],
            estimatedTime: skillTree.reduce((acc, level) => 
                acc + level.skills.length * 5, 0) + ' hours'
        };
    }
}
