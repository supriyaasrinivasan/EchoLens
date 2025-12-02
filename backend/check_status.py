"""
SupriAI Backend - Quick Status Check
Tests backend and AI model availability
"""

import sys
import requests
from datetime import datetime

BASE_URL = 'http://localhost:5000'

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print('='*60)

def print_status(label, value, status='info'):
    colors = {
        'success': '\033[92m',  # Green
        'error': '\033[91m',    # Red
        'warning': '\033[93m',  # Yellow
        'info': '\033[94m'      # Blue
    }
    reset = '\033[0m'
    color = colors.get(status, '')
    print(f"{label:.<40} {color}{value}{reset}")

def check_server():
    """Check if server is running"""
    print_header("SERVER STATUS")
    try:
        response = requests.get(f'{BASE_URL}/api/health', timeout=3)
        if response.status_code == 200:
            print_status("Server", "ONLINE", 'success')
            return response.json()
        else:
            print_status("Server", f"ERROR {response.status_code}", 'error')
            return None
    except requests.exceptions.ConnectionError:
        print_status("Server", "OFFLINE", 'error')
        print("\n⚠️  Backend server is not running!")
        print("   Start it with: python app.py")
        return None
    except Exception as e:
        print_status("Server", f"ERROR: {str(e)}", 'error')
        return None

def check_detailed_status():
    """Check detailed backend status"""
    print_header("DETAILED SYSTEM STATUS")
    try:
        response = requests.get(f'{BASE_URL}/api/status', timeout=5)
        if response.status_code == 200:
            status = response.json()
            
            # Database stats
            db = status.get('database', {})
            print(f"\n📊 Database:")
            print_status("  Sessions", db.get('data', {}).get('sessions', 0), 'info')
            print_status("  Topics", db.get('data', {}).get('topics', 0), 'info')
            print_status("  Recommendations", db.get('data', {}).get('recommendations', 0), 'info')
            print_status("  Insights", db.get('data', {}).get('insights', 0), 'info')
            
            # AI Models
            ai = status.get('ai_models', {})
            print(f"\n🤖 AI Models:")
            print_status("  Status", ai.get('status', 'unknown'), 
                        'success' if ai.get('status') == 'operational' else 'warning')
            print_status("  Mode", ai.get('mode', 'unknown'), 
                        'success' if 'ML-Enhanced' in ai.get('mode', '') else 'warning')
            
            # ML Libraries
            ml = status.get('ml_libraries', {})
            print(f"\n📚 ML Libraries:")
            numpy_status = "✓ Installed" if ml.get('numpy') else "✗ Not Installed"
            sklearn_status = "✓ Installed" if ml.get('scikit_learn') else "✗ Not Installed"
            print_status("  NumPy", numpy_status, 
                        'success' if ml.get('numpy') else 'warning')
            print_status("  Scikit-learn", sklearn_status, 
                        'success' if ml.get('scikit_learn') else 'warning')
            
            # Features
            features = status.get('features', {})
            print(f"\n⚡ Features:")
            print_status("  Topic Extraction", "✓" if features.get('topic_extraction') else "✗",
                        'success' if features.get('topic_extraction') else 'error')
            print_status("  Pattern Detection", "✓" if features.get('pattern_detection') else "✗",
                        'success' if features.get('pattern_detection') else 'error')
            print_status("  ML Clustering", "✓" if features.get('ml_clustering') else "✗",
                        'success' if features.get('ml_clustering') else 'warning')
            print_status("  Content Recommendations", "✓" if features.get('content_recommendations') else "✗",
                        'success' if features.get('content_recommendations') else 'error')
            
            # Recommendations
            rec_engine = ai.get('recommendation_engine', {})
            resources = rec_engine.get('resources', {})
            print(f"\n💡 Recommendation Engine:")
            print_status("  Mode", rec_engine.get('mode', 'unknown'),
                        'success' if 'ML-Enhanced' in rec_engine.get('mode', '') else 'info')
            print_status("  Total Resources", resources.get('total', 0), 'info')
            print_status("  Categories", ', '.join(resources.get('categories', [])), 'info')
            
            return status
        else:
            print_status("Detailed Status", f"ERROR {response.status_code}", 'error')
            return None
    except Exception as e:
        print_status("Detailed Status", f"ERROR: {str(e)}", 'error')
        return None

def print_recommendations(status):
    """Print setup recommendations"""
    if not status:
        return
    
    print_header("RECOMMENDATIONS")
    
    ml_libs = status.get('ml_libraries', {})
    
    if not ml_libs.get('installed'):
        print("\n⚠️  ML Libraries Not Detected")
        print("   Your backend is running in Basic mode.")
        print("   For enhanced AI analysis, install:")
        print("   \033[96mpip install numpy scikit-learn\033[0m")
        print("   Then restart the backend server.")
    else:
        print("\n✅ All ML libraries installed!")
        print("   Backend is running with full AI capabilities.")
    
    print("\n📝 Next Steps:")
    print("   1. Keep backend running: python app.py")
    print("   2. Load Chrome extension")
    print("   3. Visit learning websites")
    print("   4. Check dashboard for insights")

def main():
    print_header("SupriAI Backend Status Check")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check basic server status
    health = check_server()
    if not health:
        sys.exit(1)
    
    # Get detailed status
    status = check_detailed_status()
    
    # Print recommendations
    print_recommendations(status)
    
    print("\n" + "="*60 + "\n")

if __name__ == '__main__':
    main()
