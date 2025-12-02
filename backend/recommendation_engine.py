import json
from collections import defaultdict
from datetime import datetime, timedelta
import random
import math

# Try to import ML libraries
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.preprocessing import normalize
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class MLRecommendationEngine:
    """
    Machine Learning based recommendation engine
    Uses collaborative filtering, content-based filtering, and rule-based heuristics
    """
    
    def __init__(self):
        # Curated learning resources database
        self.resources = {
            'programming': [
                {'title': 'JavaScript.info', 'url': 'https://javascript.info/', 
                 'type': 'Tutorial', 'difficulty': 'beginner', 'topic': 'JavaScript'},
                {'title': 'Python Official Docs', 'url': 'https://docs.python.org/', 
                 'type': 'Documentation', 'difficulty': 'beginner', 'topic': 'Python'},
                {'title': 'LeetCode', 'url': 'https://leetcode.com/', 
                 'type': 'Practice', 'difficulty': 'intermediate', 'topic': 'Algorithms'},
                {'title': 'Clean Code Concepts', 'url': 'https://github.com/ryanmcdermott/clean-code-javascript', 
                 'type': 'Guide', 'difficulty': 'intermediate', 'topic': 'Best Practices'},
                {'title': 'Design Patterns', 'url': 'https://refactoring.guru/design-patterns', 
                 'type': 'Tutorial', 'difficulty': 'advanced', 'topic': 'Design Patterns'}
            ],
            'web_development': [
                {'title': 'MDN Web Docs', 'url': 'https://developer.mozilla.org/', 
                 'type': 'Documentation', 'difficulty': 'beginner', 'topic': 'Web Fundamentals'},
                {'title': 'CSS-Tricks', 'url': 'https://css-tricks.com/', 
                 'type': 'Articles', 'difficulty': 'intermediate', 'topic': 'CSS'},
                {'title': 'React Documentation', 'url': 'https://react.dev/', 
                 'type': 'Documentation', 'difficulty': 'intermediate', 'topic': 'React'},
                {'title': 'The Odin Project', 'url': 'https://www.theodinproject.com/', 
                 'type': 'Course', 'difficulty': 'beginner', 'topic': 'Full Stack'},
                {'title': 'Frontend Masters', 'url': 'https://frontendmasters.com/', 
                 'type': 'Course', 'difficulty': 'advanced', 'topic': 'Frontend'}
            ],
            'data_science': [
                {'title': 'Kaggle Learn', 'url': 'https://www.kaggle.com/learn', 
                 'type': 'Course', 'difficulty': 'beginner', 'topic': 'Data Science'},
                {'title': 'Fast.ai', 'url': 'https://www.fast.ai/', 
                 'type': 'Course', 'difficulty': 'intermediate', 'topic': 'Deep Learning'},
                {'title': 'Towards Data Science', 'url': 'https://towardsdatascience.com/', 
                 'type': 'Articles', 'difficulty': 'intermediate', 'topic': 'ML/AI'},
                {'title': 'TensorFlow Tutorials', 'url': 'https://www.tensorflow.org/tutorials', 
                 'type': 'Tutorial', 'difficulty': 'intermediate', 'topic': 'TensorFlow'},
                {'title': 'Papers With Code', 'url': 'https://paperswithcode.com/', 
                 'type': 'Research', 'difficulty': 'advanced', 'topic': 'ML Research'}
            ],
            'devops': [
                {'title': 'Docker Getting Started', 'url': 'https://docs.docker.com/get-started/', 
                 'type': 'Tutorial', 'difficulty': 'beginner', 'topic': 'Docker'},
                {'title': 'Kubernetes Docs', 'url': 'https://kubernetes.io/docs/', 
                 'type': 'Documentation', 'difficulty': 'intermediate', 'topic': 'Kubernetes'},
                {'title': 'Linux Journey', 'url': 'https://linuxjourney.com/', 
                 'type': 'Course', 'difficulty': 'beginner', 'topic': 'Linux'},
                {'title': 'AWS Training', 'url': 'https://aws.amazon.com/training/', 
                 'type': 'Course', 'difficulty': 'intermediate', 'topic': 'AWS'},
                {'title': 'DevOps Roadmap', 'url': 'https://roadmap.sh/devops', 
                 'type': 'Roadmap', 'difficulty': 'beginner', 'topic': 'DevOps'}
            ]
        }
        
        # Skill trees for learning paths
        self.skill_trees = {
            'programming': [
                ['Variables', 'Data Types', 'Operators'],
                ['Control Flow', 'Functions', 'Scope'],
                ['Arrays', 'Objects', 'Classes'],
                ['Algorithms', 'Data Structures', 'Complexity'],
                ['Design Patterns', 'Testing', 'Architecture']
            ],
            'web_development': [
                ['HTML Basics', 'CSS Fundamentals', 'JavaScript Intro'],
                ['Responsive Design', 'Flexbox/Grid', 'DOM Manipulation'],
                ['React/Vue/Angular', 'State Management', 'Routing'],
                ['APIs', 'Authentication', 'Databases'],
                ['Testing', 'Performance', 'Deployment']
            ],
            'data_science': [
                ['Python Basics', 'Statistics', 'Probability'],
                ['Pandas', 'NumPy', 'Data Visualization'],
                ['Machine Learning', 'Scikit-learn', 'Feature Engineering'],
                ['Deep Learning', 'TensorFlow/PyTorch', 'Neural Networks'],
                ['NLP', 'Computer Vision', 'Reinforcement Learning']
            ]
        }
        
        # Difficulty progression weights
        self.difficulty_weights = {
            'beginner': 1.0,
            'intermediate': 0.8,
            'advanced': 0.6
        }
    
    def get_status(self):
        """Get recommendation engine status and capabilities"""
        resource_count = sum(len(resources) for resources in self.resources.values())
        return {
            'available': True,
            'ml_enabled': SKLEARN_AVAILABLE and NUMPY_AVAILABLE,
            'capabilities': {
                'content_based': True,
                'collaborative_filtering': SKLEARN_AVAILABLE,
                'skill_path_recommendation': True,
                'resource_curation': True
            },
            'libraries': {
                'numpy': NUMPY_AVAILABLE,
                'sklearn': SKLEARN_AVAILABLE
            },
            'resources': {
                'total': resource_count,
                'categories': list(self.resources.keys())
            },
            'mode': 'ML-Enhanced' if (SKLEARN_AVAILABLE and NUMPY_AVAILABLE) else 'Rule-Based'
        }
        
    def generate(self, sessions, topics, profile, skills):
        """
        Generate personalized recommendations with guaranteed structure
        """
        recommendations = []
        
        # Validate inputs
        if not isinstance(sessions, list):
            sessions = []
        if not isinstance(topics, list):
            topics = []
        if not isinstance(profile, dict):
            profile = {}
        if not isinstance(skills, list):
            skills = []
        
        try:
            # 1. Content-based recommendations
            content_recs = self.content_based_recommendations(sessions, topics)
            recommendations.extend(content_recs)
        except Exception as e:
            print(f"Content-based recommendation error: {e}")
        
        try:
            # 2. Skill progression recommendations
            skill_recs = self.skill_progression_recommendations(skills, topics)
            recommendations.extend(skill_recs)
        except Exception as e:
            print(f"Skill progression recommendation error: {e}")
        
        try:
            # 3. Pattern-based recommendations
            pattern_recs = self.pattern_based_recommendations(sessions)
            recommendations.extend(pattern_recs)
        except Exception as e:
            print(f"Pattern-based recommendation error: {e}")
        
        try:
            # 4. Exploration recommendations
            exploration_recs = self.exploration_recommendations(topics)
            recommendations.extend(exploration_recs)
        except Exception as e:
            print(f"Exploration recommendation error: {e}")
        
        try:
            # 5. Resource recommendations
            resource_recs = self.resource_recommendations(topics, profile)
            recommendations.extend(resource_recs)
        except Exception as e:
            print(f"Resource recommendation error: {e}")
        
        # Score and rank recommendations
        try:
            scored_recs = self.score_recommendations(recommendations, sessions, profile)
        except Exception as e:
            print(f"Scoring error: {e}")
            scored_recs = recommendations
        
        # Deduplicate and return top recommendations
        try:
            unique_recs = self.deduplicate_recommendations(scored_recs)
        except Exception as e:
            print(f"Deduplication error: {e}")
            unique_recs = scored_recs
        
        # Ensure all recommendations have required fields
        validated_recs = []
        for rec in unique_recs[:10]:
            validated_recs.append({
                'type': rec.get('type', 'suggestion'),
                'title': rec.get('title', 'Recommendation'),
                'description': rec.get('description', ''),
                'url': rec.get('url'),
                'topic': rec.get('topic'),
                'category': rec.get('category', 'General'),
                'priority': rec.get('priority', 'medium'),
                'icon': rec.get('icon', '💡'),
                'score': rec.get('score', 0.5)
            })
        
        return validated_recs
    
    def content_based_recommendations(self, sessions, topics):
        """
        Generate recommendations based on learning content similarity
        """
        recommendations = []
        
        if not topics:
            return recommendations
        
        # Find topics with high engagement but low time
        for topic in topics:
            avg_engagement = topic.get('averageEngagement', 0)
            total_time = topic.get('totalTime', 0)
            
            # High engagement but needs more time
            if avg_engagement >= 60 and total_time < 3600000:  # Less than 1 hour
                recommendations.append({
                    'type': 'continue',
                    'title': f"Continue: {topic.get('name')}",
                    'description': f"You're highly engaged with this topic. Keep the momentum!",
                    'topic': topic.get('name'),
                    'category': topic.get('category'),
                    'priority': 'high',
                    'icon': '🎯',
                    'score': 0.9
                })
        
        # Find related topics
        if sessions and len(topics) >= 2:
            recent_categories = [s.get('category') for s in sessions[:10] if s.get('category')]
            category_counts = defaultdict(int)
            for cat in recent_categories:
                category_counts[cat] += 1
            
            if category_counts:
                top_category = max(category_counts, key=category_counts.get)
                
                recommendations.append({
                    'type': 'focus',
                    'title': f"Deepen {top_category} Knowledge",
                    'description': f"You've been focusing on {top_category}. Consider advanced topics.",
                    'category': top_category,
                    'priority': 'high',
                    'icon': '📈',
                    'score': 0.85
                })
        
        return recommendations
    
    def skill_progression_recommendations(self, skills, topics):
        """
        Generate recommendations based on skill tree progression
        """
        recommendations = []
        
        if not topics:
            return recommendations
        
        # Determine primary category
        category_time = defaultdict(int)
        for topic in topics:
            cat = topic.get('category', '').lower().replace(' ', '_')
            category_time[cat] += topic.get('totalTime', 0)
        
        if not category_time:
            return recommendations
        
        primary_category = max(category_time, key=category_time.get)
        
        # Get skill tree for this category
        skill_tree = self.skill_trees.get(primary_category, [])
        
        if skill_tree:
            # Estimate current level based on time
            total_time_hours = category_time[primary_category] / (1000 * 60 * 60)
            estimated_level = min(int(total_time_hours / 10), len(skill_tree) - 1)
            
            # Recommend next skill level
            if estimated_level < len(skill_tree) - 1:
                next_skills = skill_tree[estimated_level + 1]
                
                for skill in next_skills[:2]:  # Recommend top 2 skills
                    recommendations.append({
                        'type': 'skill_progression',
                        'title': f"Next Skill: {skill}",
                        'description': f"Level up your {primary_category.replace('_', ' ')} skills",
                        'topic': skill,
                        'category': primary_category,
                        'priority': 'high',
                        'icon': '🚀',
                        'score': 0.88
                    })
        
        return recommendations
    
    def pattern_based_recommendations(self, sessions):
        """
        Generate recommendations based on learning patterns
        """
        recommendations = []
        
        if not sessions or len(sessions) < 5:
            return recommendations
        
        # Analyze session durations
        durations = [s.get('duration', 0) for s in sessions if s.get('duration')]
        
        if durations:
            avg_duration = sum(durations) / len(durations)
            avg_minutes = avg_duration / 60000
            
            # Short sessions recommendation
            if avg_minutes < 10:
                recommendations.append({
                    'type': 'pattern',
                    'title': "Extend Your Sessions",
                    'description': "Try 25-minute focused sessions for better retention (Pomodoro technique)",
                    'priority': 'medium',
                    'icon': '⏰',
                    'score': 0.7
                })
            
            # Long sessions recommendation
            elif avg_minutes > 60:
                recommendations.append({
                    'type': 'pattern',
                    'title': "Take Regular Breaks",
                    'description': "Consider shorter sessions with breaks for optimal learning",
                    'priority': 'medium',
                    'icon': '☕',
                    'score': 0.65
                })
        
        # Engagement pattern
        engagement_scores = [s.get('engagementScore', 0) for s in sessions]
        if engagement_scores:
            avg_engagement = sum(engagement_scores) / len(engagement_scores)
            
            if avg_engagement < 50:
                recommendations.append({
                    'type': 'pattern',
                    'title': "Boost Your Focus",
                    'description': "Try interactive content or hands-on exercises to increase engagement",
                    'priority': 'medium',
                    'icon': '🧘',
                    'score': 0.75
                })
        
        # Consistency check
        dates = set(s.get('date') for s in sessions if s.get('date'))
        if len(dates) < 3:
            recommendations.append({
                'type': 'pattern',
                'title': "Build a Daily Habit",
                'description': "Even 15 minutes daily is better than long irregular sessions",
                'priority': 'medium',
                'icon': '📅',
                'score': 0.72
            })
        
        return recommendations
    
    def exploration_recommendations(self, topics):
        """
        Generate recommendations for exploring new areas
        """
        recommendations = []
        
        # Get studied categories
        studied_categories = set()
        for topic in topics:
            cat = topic.get('category', '').lower().replace(' ', '_')
            if cat:
                studied_categories.add(cat)
        
        # Find unexplored categories
        all_categories = set(self.resources.keys())
        unexplored = all_categories - studied_categories
        
        if unexplored:
            random_unexplored = random.choice(list(unexplored))
            category_name = random_unexplored.replace('_', ' ').title()
            
            recommendations.append({
                'type': 'explore',
                'title': f"Explore: {category_name}",
                'description': f"Broaden your skills by exploring {category_name}",
                'category': random_unexplored,
                'priority': 'low',
                'icon': '🌟',
                'score': 0.5
            })
        
        return recommendations
    
    def resource_recommendations(self, topics, profile):
        """
        Recommend specific learning resources
        """
        recommendations = []
        
        # Determine user's skill level
        skill_level = profile.get('skillLevel', 'beginner') if profile else 'beginner'
        
        # Get top categories from topics
        category_time = defaultdict(int)
        for topic in topics:
            cat = topic.get('category', '').lower().replace(' ', '_')
            category_time[cat] += topic.get('totalTime', 0)
        
        # Get resources for top categories
        for category, time in sorted(category_time.items(), key=lambda x: x[1], reverse=True)[:2]:
            resources = self.resources.get(category, [])
            
            # Filter by difficulty
            suitable_resources = [
                r for r in resources 
                if self.is_suitable_difficulty(r.get('difficulty'), skill_level, time)
            ]
            
            if suitable_resources:
                resource = random.choice(suitable_resources)
                
                recommendations.append({
                    'type': 'resource',
                    'title': resource['title'],
                    'description': f"{resource['type']} for {resource['topic']}",
                    'url': resource['url'],
                    'topic': resource['topic'],
                    'category': category,
                    'priority': 'medium',
                    'icon': self.get_resource_icon(resource['type']),
                    'score': 0.78
                })
        
        return recommendations
    
    def is_suitable_difficulty(self, resource_difficulty, user_level, time_spent):
        """
        Check if resource difficulty matches user level
        """
        level_order = ['beginner', 'intermediate', 'advanced']
        
        try:
            resource_idx = level_order.index(resource_difficulty)
            user_idx = level_order.index(user_level)
            
            # Adjust based on time spent (more time = higher level)
            time_bonus = min(time_spent / (1000 * 60 * 60 * 10), 1)  # Max 1 level boost after 10 hours
            adjusted_user_idx = user_idx + time_bonus
            
            # Allow resources within 1 level of user's adjusted level
            return abs(resource_idx - adjusted_user_idx) <= 1
            
        except ValueError:
            return True
    
    def get_resource_icon(self, resource_type):
        """
        Get icon for resource type
        """
        icons = {
            'Tutorial': '📝',
            'Course': '🎓',
            'Documentation': '📖',
            'Articles': '📰',
            'Practice': '💪',
            'Guide': '📋',
            'Research': '🔬',
            'Roadmap': '🗺️'
        }
        return icons.get(resource_type, '📚')
    
    def score_recommendations(self, recommendations, sessions, profile):
        """
        Score and rank recommendations based on relevance
        """
        # Calculate recency weights for topics
        recent_topics = set()
        for session in sessions[:10]:
            for topic in session.get('topics', []):
                if isinstance(topic, str):
                    recent_topics.add(topic.lower())
        
        for rec in recommendations:
            base_score = rec.get('score', 0.5)
            
            # Boost if related to recent topics
            rec_topic = rec.get('topic', '').lower()
            if rec_topic in recent_topics:
                base_score *= 1.2
            
            # Boost based on priority
            priority_boost = {
                'high': 1.3,
                'medium': 1.0,
                'low': 0.8
            }
            base_score *= priority_boost.get(rec.get('priority', 'medium'), 1.0)
            
            # Ensure score is between 0 and 1
            rec['score'] = min(max(base_score, 0), 1)
        
        # Sort by score
        return sorted(recommendations, key=lambda x: x.get('score', 0), reverse=True)
    
    def deduplicate_recommendations(self, recommendations):
        """
        Remove duplicate recommendations
        """
        seen_titles = set()
        unique = []
        
        for rec in recommendations:
            title = rec.get('title', '')
            if title not in seen_titles:
                seen_titles.add(title)
                unique.append(rec)
        
        return unique
    
    def calculate_similarity(self, vec1, vec2):
        """
        Calculate cosine similarity between two vectors
        """
        if NUMPY_AVAILABLE:
            vec1 = np.array(vec1)
            vec2 = np.array(vec2)
            
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0
            
            return dot_product / (norm1 * norm2)
        else:
            # Basic implementation
            dot_product = sum(a * b for a, b in zip(vec1, vec2))
            norm1 = math.sqrt(sum(a * a for a in vec1))
            norm2 = math.sqrt(sum(b * b for b in vec2))
            
            if norm1 == 0 or norm2 == 0:
                return 0
            
            return dot_product / (norm1 * norm2)
