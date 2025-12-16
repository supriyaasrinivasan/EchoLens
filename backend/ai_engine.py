
import re
import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta
import math

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
    
    def __init__(self):
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
        
        self.learning_styles = {
            'visual': ['video', 'diagram', 'chart', 'visualization', 'infographic'],
            'reading': ['article', 'documentation', 'book', 'tutorial', 'guide'],
            'practical': ['exercise', 'practice', 'project', 'hands-on', 'code-along'],
            'interactive': ['quiz', 'game', 'interactive', 'sandbox', 'playground']
        }
        
        if SKLEARN_AVAILABLE:
            self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
    
    def get_status(self):
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
        insights = []
        
        if not isinstance(sessions, list):
            sessions = []
        if not isinstance(topics, list):
            topics = []
        
        try:
            pattern_insights = self.detect_learning_patterns(sessions)
            insights.extend(pattern_insights)
        except Exception as e:
            print(f"Pattern analysis error: {e}")
        
        try:
            topic_insights = self.analyze_topics(topics)
            insights.extend(topic_insights)
        except Exception as e:
            print(f"Topic analysis error: {e}")
        
        try:
            engagement_insights = self.analyze_engagement(sessions)
            insights.extend(engagement_insights)
        except Exception as e:
            print(f"Engagement analysis error: {e}")
        
        try:
            profile_insights = self.generate_user_profile(sessions, topics)
            insights.extend(profile_insights)
        except Exception as e:
            print(f"Profile analysis error: {e}")
        
        try:
            skill_insights = self.analyze_skill_progression(sessions)
            insights.extend(skill_insights)
        except Exception as e:
            print(f"Skill analysis error: {e}")
        
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
        insights = []
        
        if not sessions:
            return insights
        
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
        insights = []
        
        if not topics:
            return insights
        
        total_time = sum(t.get('totalTime', 0) for t in topics)
        if total_time > 0:
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
            
            topic_count = len([t for t in topics if t.get('totalTime', 0) > 0])
            diversity_score = min(topic_count / 10 * 100, 100)
            
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
        insights = []
        
        if not sessions:
            return insights
        
        engagement_scores = [s.get('engagementScore', 0) for s in sessions]
        scroll_depths = [s.get('scrollDepth', 0) for s in sessions]
        
        if engagement_scores:
            avg_engagement = sum(engagement_scores) / len(engagement_scores)
            
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
        insights = []
        
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
        insights = []
        
        if not sessions or len(sessions) < 5:
            return insights
        
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
        if not texts:
            return []
        
        if SKLEARN_AVAILABLE and len(texts) >= 3:
            return self._extract_topics_ml(texts)
        else:
            return self._extract_topics_basic(texts)
    
    def _extract_topics_ml(self, texts):
        try:
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            
            feature_names = self.vectorizer.get_feature_names_out()
            
            topics = []
            for i, text in enumerate(texts):
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
        combined_text = f"{title} {content}".lower()
        
        category_scores = {}
        for category, keywords in self.topic_keywords.items():
            score = sum(1 for kw in keywords if kw in combined_text)
            if score > 0:
                category_scores[category] = score
        
        best_category = max(category_scores, key=category_scores.get) if category_scores else 'general'
        
        words = re.findall(r'\b[a-z]{4,}\b', combined_text)
        word_freq = Counter(words)
        top_keywords = [word for word, _ in word_freq.most_common(10)]
        
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

    # =====================================================
    # Enhanced AI Functionalities for History Analysis
    # =====================================================
    
    def analyze_history_advanced(self, sessions):
        """
        Advanced history analysis with ML-powered insights.
        Returns comprehensive learning insights from browsing history.
        """
        if not sessions:
            return {
                'focusArea': 'No data',
                'peakHours': 'Not determined',
                'learningPattern': 'Unknown',
                'recommendedTopic': 'Start learning',
                'insights': []
            }
        
        insights = {}
        
        # 1. Determine Focus Area
        category_time = defaultdict(int)
        for session in sessions:
            category = session.get('category', 'General')
            duration = session.get('duration', 0)
            category_time[category] += duration
        
        if category_time:
            focus_area = max(category_time, key=category_time.get)
            total_time = sum(category_time.values())
            focus_percentage = (category_time[focus_area] / total_time * 100) if total_time > 0 else 0
            
            insights['focusArea'] = focus_area
            insights['focusAreaChange'] = {
                'type': 'positive' if focus_percentage >= 50 else 'neutral',
                'text': f'{focus_percentage:.0f}% of learning time'
            }
        
        # 2. Determine Peak Learning Hours
        hour_activity = defaultdict(int)
        for session in sessions:
            ts = session.get('timestamp')
            if ts:
                hour = datetime.fromtimestamp(ts / 1000).hour
                hour_activity[hour] += 1
        
        if hour_activity:
            peak_hour = max(hour_activity, key=hour_activity.get)
            if 6 <= peak_hour < 12:
                peak_time = 'Morning (6AM-12PM)'
            elif 12 <= peak_hour < 18:
                peak_time = 'Afternoon (12PM-6PM)'
            elif 18 <= peak_hour < 22:
                peak_time = 'Evening (6PM-10PM)'
            else:
                peak_time = 'Night (10PM-6AM)'
            insights['peakHours'] = peak_time
        
        # 3. Analyze Learning Pattern
        pattern = self._analyze_learning_consistency(sessions)
        insights['learningPattern'] = pattern['pattern_type']
        insights['patternTrend'] = {
            'type': pattern['trend'],
            'text': pattern['description']
        }
        
        # 4. Recommend Next Topic
        recommended = self._recommend_next_topic(sessions, category_time)
        insights['recommendedTopic'] = recommended
        
        # 5. Generate Additional Insights
        insights['additionalInsights'] = self._generate_additional_insights(sessions)
        
        return insights
    
    def _analyze_learning_consistency(self, sessions):
        """Analyze the consistency of learning patterns."""
        daily_counts = defaultdict(int)
        
        for session in sessions:
            ts = session.get('timestamp')
            if ts:
                date = datetime.fromtimestamp(ts / 1000).strftime('%Y-%m-%d')
                daily_counts[date] += 1
        
        if not daily_counts:
            return {
                'pattern_type': 'Unknown',
                'trend': 'neutral',
                'description': 'Insufficient data'
            }
        
        counts = list(daily_counts.values())
        avg_sessions = sum(counts) / len(counts)
        active_days = len(counts)
        
        # Calculate variance
        variance = sum((c - avg_sessions) ** 2 for c in counts) / len(counts)
        std_dev = math.sqrt(variance)
        
        # Determine pattern type
        if std_dev < 2 and avg_sessions >= 3:
            pattern_type = 'Very Consistent'
            trend = 'positive'
            description = f'Avg {avg_sessions:.1f} sessions/day'
        elif std_dev < 4:
            pattern_type = 'Consistent'
            trend = 'positive'
            description = f'{active_days} active days'
        elif avg_sessions >= 5:
            pattern_type = 'Intensive Bursts'
            trend = 'neutral'
            description = 'High activity with gaps'
        else:
            pattern_type = 'Sporadic'
            trend = 'neutral'
            description = 'Irregular learning pattern'
        
        return {
            'pattern_type': pattern_type,
            'trend': trend,
            'description': description
        }
    
    def _recommend_next_topic(self, sessions, category_time):
        """Recommend the next topic based on learning patterns."""
        if not category_time:
            return 'Start with Web Development'
        
        # Find related topics that haven't been explored much
        topic_relationships = {
            'programming': ['data_science', 'web_development', 'devops'],
            'web_development': ['programming', 'devops', 'database'],
            'data_science': ['programming', 'database', 'security'],
            'devops': ['programming', 'security', 'database'],
            'database': ['programming', 'web_development', 'data_science'],
            'security': ['devops', 'programming', 'database']
        }
        
        # Get current focus
        focus = max(category_time, key=category_time.get).lower().replace(' ', '_')
        
        if focus in topic_relationships:
            related = topic_relationships[focus]
            # Find least explored related topic
            related_times = {t: category_time.get(t, 0) for t in related}
            recommended = min(related_times, key=related_times.get)
            return recommended.replace('_', ' ').title()
        
        return 'Advanced ' + max(category_time, key=category_time.get)
    
    def _generate_additional_insights(self, sessions):
        """Generate additional learning insights."""
        insights = []
        
        # Total learning time
        total_duration = sum(s.get('duration', 0) for s in sessions)
        total_hours = total_duration / 3600
        insights.append({
            'label': 'Total Learning Time',
            'value': f'{total_hours:.1f} hours'
        })
        
        # Unique domains visited
        domains = set(s.get('domain') for s in sessions if s.get('domain'))
        insights.append({
            'label': 'Learning Sources',
            'value': f'{len(domains)} unique sites'
        })
        
        # Most productive day
        day_activity = defaultdict(int)
        for session in sessions:
            ts = session.get('timestamp')
            if ts:
                day = datetime.fromtimestamp(ts / 1000).strftime('%A')
                day_activity[day] += session.get('duration', 0)
        
        if day_activity:
            best_day = max(day_activity, key=day_activity.get)
            insights.append({
                'label': 'Most Productive Day',
                'value': best_day
            })
        
        return insights
    
    def cluster_sessions(self, sessions, n_clusters=5):
        """
        Cluster sessions by content similarity using ML.
        Falls back to category-based clustering if sklearn unavailable.
        """
        if not sessions:
            return {'clusters': [], 'summary': 'No data to cluster'}
        
        if SKLEARN_AVAILABLE and len(sessions) >= n_clusters:
            return self._cluster_sessions_ml(sessions, n_clusters)
        else:
            return self._cluster_sessions_basic(sessions)
    
    def _cluster_sessions_ml(self, sessions, n_clusters):
        """ML-powered session clustering using TF-IDF and KMeans."""
        try:
            # Prepare text for vectorization
            texts = []
            for s in sessions:
                text_parts = [
                    s.get('title', ''),
                    s.get('domain', ''),
                    s.get('category', ''),
                    ' '.join(s.get('topics', []) if isinstance(s.get('topics'), list) else [])
                ]
                texts.append(' '.join(text_parts))
            
            # Vectorize
            vectorizer = TfidfVectorizer(max_features=200, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(texts)
            
            # Cluster
            n_clusters = min(n_clusters, len(sessions))
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = kmeans.fit_predict(tfidf_matrix)
            
            # Organize results
            clusters = defaultdict(list)
            for i, label in enumerate(labels):
                clusters[int(label)].append({
                    'id': sessions[i].get('id'),
                    'title': sessions[i].get('title'),
                    'category': sessions[i].get('category')
                })
            
            # Get cluster keywords
            feature_names = vectorizer.get_feature_names_out()
            cluster_keywords = {}
            for i, center in enumerate(kmeans.cluster_centers_):
                top_indices = center.argsort()[-5:][::-1]
                cluster_keywords[i] = [feature_names[idx] for idx in top_indices]
            
            return {
                'clusters': [
                    {
                        'id': k,
                        'sessions': v,
                        'keywords': cluster_keywords.get(k, []),
                        'count': len(v)
                    }
                    for k, v in clusters.items()
                ],
                'method': 'ML (KMeans + TF-IDF)',
                'summary': f'Found {n_clusters} learning clusters'
            }
            
        except Exception as e:
            print(f"ML clustering failed: {e}")
            return self._cluster_sessions_basic(sessions)
    
    def _cluster_sessions_basic(self, sessions):
        """Basic category-based clustering fallback."""
        clusters = defaultdict(list)
        
        for session in sessions:
            category = session.get('category', 'General')
            clusters[category].append({
                'id': session.get('id'),
                'title': session.get('title'),
                'category': category
            })
        
        return {
            'clusters': [
                {
                    'id': i,
                    'name': k,
                    'sessions': v,
                    'count': len(v)
                }
                for i, (k, v) in enumerate(clusters.items())
            ],
            'method': 'Category-based',
            'summary': f'Grouped into {len(clusters)} categories'
        }
    
    def predict_learning_interests(self, sessions, profile=None):
        """
        Predict future learning interests based on patterns.
        Uses time series analysis and topic co-occurrence.
        """
        if not sessions or len(sessions) < 5:
            return {
                'predictions': [],
                'confidence': 'low',
                'reason': 'Insufficient data for prediction'
            }
        
        # Analyze recent vs older interests
        mid = len(sessions) // 2
        recent_sessions = sessions[:mid]
        older_sessions = sessions[mid:]
        
        # Count categories
        recent_cats = Counter(s.get('category', 'General') for s in recent_sessions)
        older_cats = Counter(s.get('category', 'General') for s in older_sessions)
        
        # Find trending up categories
        predictions = []
        all_cats = set(recent_cats.keys()) | set(older_cats.keys())
        
        for cat in all_cats:
            recent_count = recent_cats.get(cat, 0)
            older_count = older_cats.get(cat, 0)
            
            if older_count > 0:
                growth = (recent_count - older_count) / older_count * 100
            elif recent_count > 0:
                growth = 100
            else:
                growth = 0
            
            if growth > 20:
                predictions.append({
                    'topic': cat,
                    'trend': 'rising',
                    'growth': f'+{growth:.0f}%',
                    'confidence': min(0.9, 0.5 + (recent_count / 10))
                })
            elif growth < -20 and recent_count > 0:
                predictions.append({
                    'topic': cat,
                    'trend': 'declining',
                    'growth': f'{growth:.0f}%',
                    'confidence': min(0.8, 0.4 + (older_count / 10))
                })
        
        # Sort by absolute growth
        predictions.sort(key=lambda x: abs(float(x['growth'].replace('+', '').replace('%', ''))), reverse=True)
        
        return {
            'predictions': predictions[:5],
            'confidence': 'high' if len(sessions) > 20 else 'medium',
            'method': 'Trend analysis',
            'total_sessions_analyzed': len(sessions)
        }
    
    def generate_learning_summary(self, sessions, period='week'):
        """
        Generate a comprehensive learning summary for a time period.
        """
        if not sessions:
            return {
                'summary': 'No learning activity recorded',
                'stats': {},
                'recommendations': []
            }
        
        total_time = sum(s.get('duration', 0) for s in sessions)
        total_hours = total_time / 3600
        
        # Category breakdown
        category_time = defaultdict(int)
        for s in sessions:
            category_time[s.get('category', 'General')] += s.get('duration', 0)
        
        top_categories = sorted(category_time.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Unique domains
        domains = list(set(s.get('domain') for s in sessions if s.get('domain')))
        
        # Calculate engagement
        engagements = [s.get('engagement', 0) for s in sessions if s.get('engagement')]
        avg_engagement = sum(engagements) / len(engagements) if engagements else 0
        
        # Generate summary text
        summary_text = f"This {period}, you spent {total_hours:.1f} hours learning across {len(sessions)} sessions. "
        if top_categories:
            summary_text += f"Your primary focus was {top_categories[0][0]}. "
        if avg_engagement >= 70:
            summary_text += "Your engagement level was excellent!"
        elif avg_engagement >= 40:
            summary_text += "Your engagement level was good."
        else:
            summary_text += "Consider focusing more during learning sessions."
        
        # Generate recommendations
        recommendations = []
        if total_hours < 5:
            recommendations.append({
                'type': 'time',
                'text': 'Try to increase your weekly learning time to at least 5 hours'
            })
        if len(top_categories) == 1:
            recommendations.append({
                'type': 'diversity',
                'text': f'Explore topics related to {top_categories[0][0]} for broader knowledge'
            })
        if avg_engagement < 50:
            recommendations.append({
                'type': 'engagement',
                'text': 'Try shorter, more focused learning sessions'
            })
        
        return {
            'summary': summary_text,
            'stats': {
                'totalHours': round(total_hours, 1),
                'sessionsCount': len(sessions),
                'topCategories': [{'name': c, 'hours': round(t/3600, 1)} for c, t in top_categories],
                'uniqueSources': len(domains),
                'avgEngagement': round(avg_engagement, 0)
            },
            'recommendations': recommendations,
            'period': period
        }
