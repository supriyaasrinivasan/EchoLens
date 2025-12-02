"""
SupriAI - AI Analysis Engine
Topic modeling, pattern detection, and user profiling using ML
"""

import re
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import math

# Try to import ML libraries, fall back to basic implementations if not available
try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("NumPy not available, using basic implementations")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
    from sklearn.decomposition import LatentDirichletAllocation
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn not available, using basic implementations")


class AIAnalysisEngine:
    """
    AI-powered analysis engine for learning behavior
    Performs topic modeling, pattern detection, and user profiling
    """
    
    def __init__(self):
        # Educational keywords for topic extraction
        self.topic_keywords = {
            'programming': ['code', 'programming', 'developer', 'software', 'algorithm', 
                           'function', 'variable', 'class', 'object', 'method'],
            'web_development': ['html', 'css', 'javascript', 'react', 'angular', 'vue',
                               'frontend', 'backend', 'fullstack', 'responsive'],
            'data_science': ['data', 'machine learning', 'ai', 'neural', 'tensorflow',
                            'pandas', 'numpy', 'statistics', 'model', 'training'],
            'devops': ['docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'linux',
                      'deployment', 'infrastructure', 'automation'],
            'database': ['sql', 'database', 'mongodb', 'postgresql', 'mysql', 'nosql',
                        'query', 'table', 'index'],
            'security': ['security', 'encryption', 'authentication', 'vulnerability',
                        'hacking', 'firewall', 'ssl', 'cyber']
        }
        
        # Learning style indicators
        self.learning_styles = {
            'visual': ['video', 'diagram', 'chart', 'visualization', 'infographic'],
            'reading': ['article', 'documentation', 'book', 'tutorial', 'guide'],
            'practical': ['exercise', 'practice', 'project', 'hands-on', 'code-along'],
            'interactive': ['quiz', 'game', 'interactive', 'sandbox', 'playground']
        }
        
        if SKLEARN_AVAILABLE:
            self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    
    def get_status(self):
        """Get AI engine status and capabilities"""
        return {
            'available': True,
            'ml_enabled': SKLEARN_AVAILABLE and NUMPY_AVAILABLE,
            'capabilities': {
                'topic_extraction': True,
                'pattern_detection': True,
                'clustering': SKLEARN_AVAILABLE,
                'tfidf_vectorization': SKLEARN_AVAILABLE,
                'user_profiling': True
            },
            'libraries': {
                'numpy': NUMPY_AVAILABLE,
                'sklearn': SKLEARN_AVAILABLE
            },
            'mode': 'ML-Enhanced' if (SKLEARN_AVAILABLE and NUMPY_AVAILABLE) else 'Basic'
        }
        
    def analyze(self, sessions, topics):
        """
        Main analysis method - processes sessions and generates insights
        Returns a list of insight objects with guaranteed structure
        """
        insights = []
        
        # Validate inputs
        if not isinstance(sessions, list):
            sessions = []
        if not isinstance(topics, list):
            topics = []
        
        try:
            # 1. Learning pattern analysis
            pattern_insights = self.detect_learning_patterns(sessions)
            insights.extend(pattern_insights)
        except Exception as e:
            print(f"Pattern analysis error: {e}")
        
        try:
            # 2. Topic clustering
            topic_insights = self.analyze_topics(topics)
            insights.extend(topic_insights)
        except Exception as e:
            print(f"Topic analysis error: {e}")
        
        try:
            # 3. Engagement analysis
            engagement_insights = self.analyze_engagement(sessions)
            insights.extend(engagement_insights)
        except Exception as e:
            print(f"Engagement analysis error: {e}")
        
        try:
            # 4. User profiling
            profile_insights = self.generate_user_profile(sessions, topics)
            insights.extend(profile_insights)
        except Exception as e:
            print(f"Profile analysis error: {e}")
        
        try:
            # 5. Skill progression analysis
            skill_insights = self.analyze_skill_progression(sessions)
            insights.extend(skill_insights)
        except Exception as e:
            print(f"Skill analysis error: {e}")
        
        # Ensure all insights have required fields
        validated_insights = []
        for insight in insights:
            validated_insights.append({
                'type': insight.get('type', 'general'),
                'title': insight.get('title', 'Insight'),
                'description': insight.get('description', ''),
                'confidence': insight.get('confidence', 0.5),
                'value': insight.get('value'),
                'data': insight.get('data')
            })
        
        return validated_insights
    
    def detect_learning_patterns(self, sessions):
        """
        Detect learning patterns from session data
        """
        insights = []
        
        if not sessions:
            return insights
        
        # Time-of-day pattern
        hour_distribution = defaultdict(int)
        for session in sessions:
            if session.get('timestamp'):
                hour = datetime.fromtimestamp(session['timestamp'] / 1000).hour
                hour_distribution[hour] += session.get('duration', 0)
        
        if hour_distribution:
            peak_hour = max(hour_distribution, key=hour_distribution.get)
            time_period = 'morning' if 6 <= peak_hour < 12 else \
                         'afternoon' if 12 <= peak_hour < 18 else \
                         'evening' if 18 <= peak_hour < 22 else 'night'
            
            insights.append({
                'type': 'time_preference',
                'title': 'Peak Learning Time',
                'description': f'You learn most effectively during {time_period} hours (around {peak_hour}:00)',
                'value': time_period,
                'confidence': 0.85,
                'data': dict(hour_distribution)
            })
        
        # Session duration pattern
        durations = [s.get('duration', 0) for s in sessions if s.get('duration')]
        if durations:
            avg_duration = sum(durations) / len(durations)
            avg_minutes = avg_duration / 60000
            
            session_style = 'quick_learner' if avg_minutes < 10 else \
                           'balanced_learner' if avg_minutes < 30 else \
                           'deep_focus_learner'
            
            insights.append({
                'type': 'session_pattern',
                'title': 'Learning Session Style',
                'description': f'Average session: {avg_minutes:.0f} minutes. You are a {session_style.replace("_", " ")}.',
                'value': session_style,
                'confidence': 0.8,
                'avg_duration': avg_minutes
            })
        
        # Category sequence pattern
        categories = [s.get('category') for s in sessions if s.get('category')]
        if len(categories) >= 2:
            transitions = defaultdict(int)
            for i in range(len(categories) - 1):
                transition = f"{categories[i]} → {categories[i+1]}"
                transitions[transition] += 1
            
            if transitions:
                common_transition = max(transitions, key=transitions.get)
                insights.append({
                    'type': 'learning_flow',
                    'title': 'Common Learning Path',
                    'description': f'You often transition: {common_transition}',
                    'value': common_transition,
                    'confidence': 0.7,
                    'transitions': dict(transitions)
                })
        
        # Consistency pattern
        dates = set(s.get('date') for s in sessions if s.get('date'))
        if dates:
            total_days = (datetime.now() - datetime.now() + timedelta(days=7)).days or 7
            consistency = len(dates) / min(total_days, 7) * 100
            
            insights.append({
                'type': 'consistency',
                'title': 'Learning Consistency',
                'description': f'You maintained {consistency:.0f}% consistency this week',
                'value': consistency,
                'confidence': 0.9,
                'active_days': len(dates)
            })
        
        return insights
    
    def analyze_topics(self, topics):
        """
        Analyze topic distribution and clustering
        """
        insights = []
        
        if not topics:
            return insights
        
        # Topic concentration
        total_time = sum(t.get('totalTime', 0) for t in topics)
        if total_time > 0:
            # Find dominant topic
            sorted_topics = sorted(topics, key=lambda x: x.get('totalTime', 0), reverse=True)
            dominant = sorted_topics[0] if sorted_topics else None
            
            if dominant:
                concentration = (dominant.get('totalTime', 0) / total_time) * 100
                
                insights.append({
                    'type': 'topic_focus',
                    'title': 'Primary Focus Area',
                    'description': f'{dominant.get("name")} dominates your learning ({concentration:.0f}% of time)',
                    'value': dominant.get('name'),
                    'confidence': 0.85,
                    'concentration': concentration
                })
            
            # Topic diversity
            topic_count = len([t for t in topics if t.get('totalTime', 0) > 0])
            diversity_score = min(topic_count / 10 * 100, 100)  # Normalize to 100
            
            diversity_level = 'specialist' if diversity_score < 30 else \
                             'balanced' if diversity_score < 60 else 'explorer'
            
            insights.append({
                'type': 'topic_diversity',
                'title': 'Learning Diversity',
                'description': f'You are a {diversity_level} learner with {topic_count} active topics',
                'value': diversity_level,
                'confidence': 0.8,
                'topic_count': topic_count,
                'diversity_score': diversity_score
            })
        
        return insights
    
    def analyze_engagement(self, sessions):
        """
        Analyze engagement patterns
        """
        insights = []
        
        if not sessions:
            return insights
        
        engagement_scores = [s.get('engagementScore', 0) for s in sessions]
        scroll_depths = [s.get('scrollDepth', 0) for s in sessions]
        
        if engagement_scores:
            avg_engagement = sum(engagement_scores) / len(engagement_scores)
            
            # Engagement trend (compare recent vs older)
            mid = len(engagement_scores) // 2
            if mid > 0:
                recent_avg = sum(engagement_scores[:mid]) / mid
                older_avg = sum(engagement_scores[mid:]) / (len(engagement_scores) - mid)
                trend = recent_avg - older_avg
                
                trend_direction = 'improving' if trend > 5 else \
                                 'declining' if trend < -5 else 'stable'
                
                insights.append({
                    'type': 'engagement_trend',
                    'title': 'Engagement Trend',
                    'description': f'Your engagement is {trend_direction} ({"+" if trend > 0 else ""}{trend:.1f}%)',
                    'value': trend_direction,
                    'confidence': 0.75,
                    'trend_value': trend
                })
            
            # Engagement level insight
            level = 'high' if avg_engagement >= 70 else \
                   'medium' if avg_engagement >= 40 else 'low'
            
            insights.append({
                'type': 'engagement_level',
                'title': 'Overall Engagement',
                'description': f'Average engagement: {avg_engagement:.0f}% ({level} engagement)',
                'value': level,
                'confidence': 0.85,
                'average': avg_engagement
            })
        
        if scroll_depths:
            avg_scroll = sum(scroll_depths) / len(scroll_depths)
            
            reading_style = 'thorough' if avg_scroll >= 80 else \
                           'selective' if avg_scroll >= 50 else 'scanner'
            
            insights.append({
                'type': 'reading_depth',
                'title': 'Content Consumption Style',
                'description': f'You are a {reading_style} reader (avg scroll: {avg_scroll:.0f}%)',
                'value': reading_style,
                'confidence': 0.8,
                'avg_scroll': avg_scroll
            })
        
        return insights
    
    def generate_user_profile(self, sessions, topics):
        """
        Generate user profile insights
        """
        insights = []
        
        # Determine learning style
        style_scores = defaultdict(int)
        
        for session in sessions:
            url = session.get('url', '').lower()
            title = (session.get('title') or '').lower()
            combined = f"{url} {title}"
            
            for style, keywords in self.learning_styles.items():
                for keyword in keywords:
                    if keyword in combined:
                        style_scores[style] += 1
        
        if style_scores:
            dominant_style = max(style_scores, key=style_scores.get)
            total = sum(style_scores.values())
            
            insights.append({
                'type': 'learning_style',
                'title': 'Preferred Learning Style',
                'description': f'You prefer {dominant_style} learning ({style_scores[dominant_style]/total*100:.0f}% of sessions)',
                'value': dominant_style,
                'confidence': 0.7,
                'style_distribution': dict(style_scores)
            })
        
        # Skill level estimation
        if topics:
            total_time = sum(t.get('totalTime', 0) for t in topics)
            hours = total_time / (1000 * 60 * 60)
            
            skill_level = 'beginner' if hours < 10 else \
                         'intermediate' if hours < 50 else \
                         'advanced' if hours < 200 else 'expert'
            
            insights.append({
                'type': 'skill_level',
                'title': 'Estimated Skill Level',
                'description': f'Based on {hours:.0f} hours of learning, you are at {skill_level} level',
                'value': skill_level,
                'confidence': 0.6,
                'total_hours': hours
            })
        
        return insights
    
    def analyze_skill_progression(self, sessions):
        """
        Analyze skill progression over time
        """
        insights = []
        
        if not sessions or len(sessions) < 5:
            return insights
        
        # Group sessions by date
        daily_learning = defaultdict(lambda: {'time': 0, 'sessions': 0, 'topics': set()})
        
        for session in sessions:
            date = session.get('date')
            if date:
                daily_learning[date]['time'] += session.get('duration', 0)
                daily_learning[date]['sessions'] += 1
                for topic in session.get('topics', []):
                    if isinstance(topic, str):
                        daily_learning[date]['topics'].add(topic)
        
        if len(daily_learning) >= 3:
            dates = sorted(daily_learning.keys())
            
            # Learning acceleration
            first_half = dates[:len(dates)//2]
            second_half = dates[len(dates)//2:]
            
            first_avg = sum(daily_learning[d]['time'] for d in first_half) / len(first_half) if first_half else 0
            second_avg = sum(daily_learning[d]['time'] for d in second_half) / len(second_half) if second_half else 0
            
            if first_avg > 0:
                growth = ((second_avg - first_avg) / first_avg) * 100
                
                momentum = 'accelerating' if growth > 20 else \
                          'decelerating' if growth < -20 else 'steady'
                
                insights.append({
                    'type': 'learning_momentum',
                    'title': 'Learning Momentum',
                    'description': f'Your learning pace is {momentum} ({"+" if growth > 0 else ""}{growth:.0f}% change)',
                    'value': momentum,
                    'confidence': 0.7,
                    'growth_rate': growth
                })
        
        return insights
    
    def extract_topics(self, texts):
        """
        Extract topics from text using TF-IDF or basic keyword matching
        """
        if not texts:
            return []
        
        if SKLEARN_AVAILABLE and len(texts) >= 3:
            return self._extract_topics_ml(texts)
        else:
            return self._extract_topics_basic(texts)
    
    def _extract_topics_ml(self, texts):
        """
        Extract topics using TF-IDF and clustering
        """
        try:
            # Vectorize texts
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            # Get feature names
            feature_names = self.vectorizer.get_feature_names_out()
            
            # Get top terms for each document
            topics = []
            for i, text in enumerate(texts):
                # Get TF-IDF scores for this document
                scores = tfidf_matrix[i].toarray().flatten()
                top_indices = scores.argsort()[-5:][::-1]
                top_terms = [feature_names[idx] for idx in top_indices if scores[idx] > 0]
                
                if top_terms:
                    topics.append({
                        'text_index': i,
                        'keywords': top_terms,
                        'score': float(max(scores))
                    })
            
            return topics
            
        except Exception as e:
            print(f"ML topic extraction failed: {e}")
            return self._extract_topics_basic(texts)
    
    def _extract_topics_basic(self, texts):
        """
        Basic keyword-based topic extraction
        """
        topics = []
        
        for i, text in enumerate(texts):
            text_lower = text.lower()
            matched_topics = {}
            
            for topic, keywords in self.topic_keywords.items():
                matches = sum(1 for kw in keywords if kw in text_lower)
                if matches > 0:
                    matched_topics[topic] = matches
            
            if matched_topics:
                best_topic = max(matched_topics, key=matched_topics.get)
                topics.append({
                    'text_index': i,
                    'topic': best_topic,
                    'keywords': list(matched_topics.keys()),
                    'score': matched_topics[best_topic] / len(self.topic_keywords[best_topic])
                })
        
        return topics
    
    def analyze_content(self, url, title, content=''):
        """
        Analyze specific content for educational classification
        """
        combined_text = f"{title} {content}".lower()
        
        # Determine category
        category_scores = {}
        for category, keywords in self.topic_keywords.items():
            score = sum(1 for kw in keywords if kw in combined_text)
            if score > 0:
                category_scores[category] = score
        
        best_category = max(category_scores, key=category_scores.get) if category_scores else 'general'
        
        # Extract keywords
        words = re.findall(r'\b[a-z]{4,}\b', combined_text)
        word_freq = Counter(words)
        top_keywords = [word for word, _ in word_freq.most_common(10)]
        
        # Estimate educational value
        edu_indicators = ['learn', 'tutorial', 'course', 'guide', 'documentation',
                         'example', 'how to', 'introduction', 'beginner', 'advanced']
        edu_score = sum(1 for ind in edu_indicators if ind in combined_text) / len(edu_indicators)
        
        return {
            'url': url,
            'title': title,
            'category': best_category,
            'keywords': top_keywords,
            'educational_score': edu_score,
            'is_educational': edu_score >= 0.2,
            'category_scores': category_scores
        }
