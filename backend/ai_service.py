import sys
import json
from ai_engine import AIAnalysisEngine
from recommendation_engine import MLRecommendationEngine

ai_engine = AIAnalysisEngine()
rec_engine = MLRecommendationEngine()

def get_status():
    ai_status = ai_engine.get_status()
    rec_status = rec_engine.get_status()
    
    return {
        'available': True,
        'ai_engine': ai_status,
        'recommendation_engine': rec_status,
        'mode': ai_status.get('mode', 'Basic')
    }

def analyze(data):
    sessions = data.get('sessions', [])
    topics = data.get('topics', [])
    insights = ai_engine.analyze(sessions, topics)
    
    return {
        'success': True,
        'insights': insights
    }

def recommend(data):
    sessions = data.get('sessions', [])
    topics = data.get('topics', [])
    profile = data.get('profile', {})
    skills = data.get('skills', [])
    
    recommendations = rec_engine.generate(sessions, topics, profile, skills)
    
    return {
        'success': True,
        'recommendations': recommendations
    }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No action specified'}))
        sys.exit(1)
    
    action = sys.argv[1]
    data = {}
    
    if len(sys.argv) > 2:
        try:
            data = json.loads(sys.argv[2])
        except:
            data = {}
    
    try:
        if action == 'status':
            result = get_status()
        elif action == 'analyze':
            result = analyze(data)
        elif action == 'recommend':
            result = recommend(data)
        else:
            result = {'error': f'Unknown action: {action}'}
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e), 'success': False}))
        sys.exit(1)
