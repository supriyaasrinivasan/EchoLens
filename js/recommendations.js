

import { StorageManager } from './storage.js';
import { getCategoryColor, getCategoryIcon } from './utils.js';

export class RecommendationEngine {
    constructor() {
        this.storage = new StorageManager();
        
        this.resourceDatabase = {
            'Programming': [
                { title: 'JavaScript Fundamentals', url: 'https://javascript.info/' },
                { title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/' },
                { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/' },
                { title: 'LeetCode Problems', url: 'https://leetcode.com/problemset/all/' },
                { title: 'Clean Code Principles', url: 'https://github.com/ryanmcdermott/clean-code-javascript' }
            ],
            'Data Science': [
                { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' },
                { title: 'Towards Data Science', url: 'https://towardsdatascience.com/' },
                { title: 'StatQuest with Josh Starmer', url: 'https://www.youtube.com/c/joshstarmer' },
                { title: 'Fast.ai Courses', url: 'https://www.fast.ai/' },
                { title: 'Scikit-learn Documentation', url: 'https://scikit-learn.org/stable/tutorial/index.html' }
            ],
            'Web Development': [
                { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
                { title: 'CSS Tricks', url: 'https://css-tricks.com/' },
                { title: 'The Odin Project', url: 'https://www.theodinproject.com/' },
                { title: 'React Documentation', url: 'https://react.dev/' },
                { title: 'Frontend Masters', url: 'https://frontendmasters.com/' }
            ],
            'DevOps': [
                { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/' },
                { title: 'Kubernetes Basics', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
                { title: 'AWS Free Tier', url: 'https://aws.amazon.com/free/' },
                { title: 'Linux Journey', url: 'https://linuxjourney.com/' },
                { title: 'DevOps Roadmap', url: 'https://roadmap.sh/devops' }
            ],
            'Mathematics': [
                { title: 'Khan Academy Math', url: 'https://www.khanacademy.org/math' },
                { title: '3Blue1Brown', url: 'https://www.youtube.com/c/3blue1brown' },
                { title: 'Brilliant.org', url: 'https://brilliant.org/' },
                { title: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/courses/mathematics/' },
                { title: 'Paul\'s Online Math Notes', url: 'https://tutorial.math.lamar.edu/' }
            ],
            'Machine Learning': [
                { title: 'Andrew Ng ML Course', url: 'https://www.coursera.org/learn/machine-learning' },
                { title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials' },
                { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/' },
                { title: 'Hugging Face Course', url: 'https://huggingface.co/course' },
                { title: 'Papers With Code', url: 'https://paperswithcode.com/' }
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

    // Enhanced: Get recommendations by type
    async getRecommendationsByType(type) {
        const profile = await this.storage.getKnowledgeProfile();
        const gaps = await this.storage.getLearningGaps();
        const sessions = await this.storage.getSessions({ limit: 50 });
        const topics = await this.storage.getTopTopics(10);

        switch (type) {
            case 'personalized':
                return this.generatePersonalizedRecs(profile, sessions, topics);
            case 'trending':
                return this.generateTrendingRecs(sessions);
            case 'gaps':
                return this.generateGapFillerRecs(gaps, profile);
            case 'advanced':
                return this.generateAdvancedRecs(profile);
            default:
                return this.generate();
        }
    }

    // Generate personalized recommendations based on user's strongest areas
    generatePersonalizedRecs(profile, sessions, topics) {
        const recommendations = [];

        // Recommend based on strongest areas
        profile.areas.slice(0, 3).forEach(area => {
            const resources = this.resourceDatabase[area.category] || [];
            const levelResources = this.getResourcesForLevel(resources, area.level);

            levelResources.slice(0, 2).forEach(resource => {
                recommendations.push({
                    type: 'personalized',
                    title: resource.title,
                    description: `Continue your ${area.level} journey in ${area.category}`,
                    url: resource.url,
                    category: area.category,
                    priority: 'high',
                    icon: '🎯',
                    reason: `You've shown strong interest with ${area.sessions} sessions`
                });
            });
        });

        // Continue where you left off
        const recentCategories = new Set();
        sessions.slice(0, 10).forEach(session => {
            if (session.category && !recentCategories.has(session.category)) {
                recentCategories.add(session.category);
                recommendations.push({
                    type: 'continue',
                    title: `Continue: ${session.title || session.category}`,
                    description: `Pick up where you left off`,
                    url: session.url,
                    category: session.category,
                    priority: 'medium',
                    icon: '📖',
                    reason: 'Recently viewed'
                });
            }
        });

        return recommendations.slice(0, 8);
    }

    // Generate trending recommendations based on recent activity
    generateTrendingRecs(sessions) {
        const recommendations = [];
        
        // Analyze recent session patterns
        const categoryFrequency = {};
        const recentWeek = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        sessions.filter(s => s.timestamp >= recentWeek).forEach(session => {
            const cat = session.category || 'General';
            categoryFrequency[cat] = (categoryFrequency[cat] || 0) + 1;
        });

        // Sort by frequency
        const trending = Object.entries(categoryFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        trending.forEach(([category, count]) => {
            const resources = this.resourceDatabase[category] || [];
            resources.slice(0, 2).forEach(resource => {
                recommendations.push({
                    type: 'trending',
                    title: resource.title,
                    description: `Hot topic this week in ${category}`,
                    url: resource.url,
                    category: category,
                    priority: 'medium',
                    icon: '🔥',
                    reason: `${count} sessions this week`
                });
            });
        });

        return recommendations.slice(0, 6);
    }

    // Generate recommendations to fill knowledge gaps
    generateGapFillerRecs(gaps, profile) {
        const recommendations = [];

        gaps.forEach(gap => {
            const resources = this.resourceDatabase[gap.category] || [];
            
            recommendations.push({
                type: 'gap',
                title: `Strengthen ${gap.category}`,
                description: gap.recommendation,
                category: gap.category,
                priority: 'high',
                icon: '📈',
                currentLevel: gap.currentLevel,
                reason: gap.gap
            });

            // Add specific resources for the gap
            resources.slice(0, 2).forEach(resource => {
                recommendations.push({
                    type: 'gap_resource',
                    title: resource.title,
                    description: `Resource to improve your ${gap.category} skills`,
                    url: resource.url,
                    category: gap.category,
                    priority: 'medium',
                    icon: '📚',
                    reason: `Currently at ${gap.currentLevel} level`
                });
            });
        });

        // Add suggestions for unexplored areas
        const exploredCategories = new Set(profile.areas.map(a => a.category));
        Object.keys(this.resourceDatabase).forEach(category => {
            if (!exploredCategories.has(category)) {
                recommendations.push({
                    type: 'explore',
                    title: `Explore ${category}`,
                    description: `You haven't explored this area yet`,
                    category: category,
                    priority: 'low',
                    icon: '🔍',
                    reason: 'Unexplored territory'
                });
            }
        });

        return recommendations.slice(0, 8);
    }

    // Generate advanced recommendations for leveling up
    generateAdvancedRecs(profile) {
        const recommendations = [];

        profile.areas.filter(a => a.level !== 'Novice').forEach(area => {
            const nextLevel = this.getNextLevel(area.level);
            const skillTree = this.skillTrees[area.category];
            
            if (skillTree) {
                const currentLevelIndex = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'].indexOf(area.level);
                const nextSkills = skillTree[currentLevelIndex + 1]?.skills || [];

                nextSkills.forEach(skill => {
                    recommendations.push({
                        type: 'level_up',
                        title: `Learn ${skill}`,
                        description: `Advance from ${area.level} to ${nextLevel} in ${area.category}`,
                        category: area.category,
                        priority: 'high',
                        icon: '⬆️',
                        currentLevel: area.level,
                        targetLevel: nextLevel,
                        reason: `Next step in your ${area.category} journey`
                    });
                });
            }

            // Add advanced resources
            const advancedResources = this.getAdvancedResources(area.category);
            advancedResources.forEach(resource => {
                recommendations.push({
                    type: 'advanced_resource',
                    title: resource.title,
                    description: resource.description || `Advanced ${area.category} resource`,
                    url: resource.url,
                    category: area.category,
                    priority: 'medium',
                    icon: '🚀',
                    reason: `For ${area.level}+ learners`
                });
            });
        });

        return recommendations.slice(0, 8);
    }

    getResourcesForLevel(resources, level) {
        // For now, return all resources - could be enhanced with level metadata
        return resources;
    }

    getNextLevel(currentLevel) {
        const levels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
        const index = levels.indexOf(currentLevel);
        return levels[Math.min(index + 1, levels.length - 1)];
    }

    getAdvancedResources(category) {
        const advancedResources = {
            'Programming': [
                { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', description: 'Learn large-scale system design' },
                { title: 'Design Patterns', url: 'https://refactoring.guru/design-patterns', description: 'Master software design patterns' }
            ],
            'Data Science': [
                { title: 'Deep Learning Book', url: 'https://www.deeplearningbook.org/', description: 'Comprehensive deep learning theory' },
                { title: 'MLOps Guide', url: 'https://ml-ops.org/', description: 'Production ML best practices' }
            ],
            'Web Development': [
                { title: 'Web Performance', url: 'https://web.dev/learn/', description: 'Advanced web performance techniques' },
                { title: 'Patterns.dev', url: 'https://patterns.dev/', description: 'Modern web development patterns' }
            ],
            'Machine Learning': [
                { title: 'Papers With Code', url: 'https://paperswithcode.com/', description: 'Latest ML research implementations' },
                { title: 'Distill.pub', url: 'https://distill.pub/', description: 'Clear explanations of ML concepts' }
            ]
        };

        return advancedResources[category] || [];
    }
}
