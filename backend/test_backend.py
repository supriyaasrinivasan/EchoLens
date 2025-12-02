"""
SupriAI Backend Test Suite
Tests all API endpoints to ensure backend is working correctly
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BASE_URL = 'http://localhost:5000'
TIMEOUT = 10  # seconds

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(test_name, passed, details=''):
    """Print test result"""
    status = f"{Colors.GREEN}✓ PASS{Colors.RESET}" if passed else f"{Colors.RED}✗ FAIL{Colors.RESET}"
    print(f"{status} {test_name}")
    if details:
        print(f"     {details}")

def test_health_check():
    """Test health check endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/api/health', timeout=TIMEOUT)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('status') in ['healthy', 'degraded'] and
            'database' in data and
            'version' in data
        )
        
        print_test(
            "Health Check",
            passed,
            f"Status: {data.get('status')}, DB: {data.get('database', {}).get('status')}"
        )
        return passed
        
    except Exception as e:
        print_test("Health Check", False, f"Error: {str(e)}")
        return False

def test_sync_endpoint():
    """Test main sync endpoint"""
    try:
        # Create test data
        test_data = {
            'sessions': [
                {
                    'url': 'https://example.com/learn-python',
                    'domain': 'example.com',
                    'title': 'Learn Python Programming',
                    'category': 'programming',
                    'topics': ['Python', 'Programming'],
                    'duration': 300000,
                    'engagementScore': 85,
                    'scrollDepth': 90,
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'timestamp': int(datetime.now().timestamp() * 1000)
                },
                {
                    'url': 'https://example.com/web-dev',
                    'domain': 'example.com',
                    'title': 'Web Development Guide',
                    'category': 'web_development',
                    'topics': ['HTML', 'CSS', 'JavaScript'],
                    'duration': 450000,
                    'engagementScore': 75,
                    'scrollDepth': 80,
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'timestamp': int(datetime.now().timestamp() * 1000)
                }
            ],
            'topics': [
                {
                    'name': 'Python',
                    'category': 'programming',
                    'totalTime': 300000,
                    'sessionCount': 1,
                    'averageEngagement': 85
                }
            ],
            'profile': {
                'learningStyle': 'visual',
                'skillLevel': 'intermediate',
                'weeklyGoal': 10
            },
            'skills': [
                {
                    'name': 'Python',
                    'category': 'programming',
                    'experience': 5,
                    'level': 2,
                    'lastPracticed': datetime.now().isoformat()
                }
            ]
        }
        
        response = requests.post(
            f'{BASE_URL}/api/sync',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=TIMEOUT
        )
        
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('success') == True and
            'insights' in data and
            'recommendations' in data and
            isinstance(data.get('insights'), list) and
            isinstance(data.get('recommendations'), list)
        )
        
        print_test(
            "Sync Endpoint",
            passed,
            f"Insights: {len(data.get('insights', []))}, Recommendations: {len(data.get('recommendations', []))}"
        )
        return passed
        
    except Exception as e:
        print_test("Sync Endpoint", False, f"Error: {str(e)}")
        return False

def test_analytics_endpoint():
    """Test analytics endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/api/analytics?range=week', timeout=TIMEOUT)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('success') == True and
            'data' in data and
            'summary' in data
        )
        
        summary = data.get('summary', {})
        print_test(
            "Analytics Endpoint",
            passed,
            f"Sessions: {summary.get('totalSessions', 0)}, Topics: {summary.get('uniqueTopics', 0)}"
        )
        return passed
        
    except Exception as e:
        print_test("Analytics Endpoint", False, f"Error: {str(e)}")
        return False

def test_recommendations_endpoint():
    """Test recommendations endpoint"""
    try:
        response = requests.get(f'{BASE_URL}/api/recommendations?limit=5', timeout=TIMEOUT)
        data = response.json()
        
        passed = (
            response.status_code == 200 and
            data.get('success') == True and
            'recommendations' in data and
            isinstance(data.get('recommendations'), list)
        )
        
        print_test(
            "Recommendations Endpoint",
            passed,
            f"Returned: {len(data.get('recommendations', []))} recommendations"
        )
        return passed
        
    except Exception as e:
        print_test("Recommendations Endpoint", False, f"Error: {str(e)}")
        return False

def test_profile_endpoint():
    """Test user profile endpoint"""
    try:
        # GET profile
        response = requests.get(f'{BASE_URL}/api/profile', timeout=TIMEOUT)
        passed_get = response.status_code == 200
        
        # POST profile
        test_profile = {
            'learningStyle': 'visual',
            'skillLevel': 'intermediate',
            'weeklyGoal': 15
        }
        response = requests.post(
            f'{BASE_URL}/api/profile',
            json=test_profile,
            headers={'Content-Type': 'application/json'},
            timeout=TIMEOUT
        )
        data = response.json()
        passed_post = response.status_code == 200 and data.get('success') == True
        
        passed = passed_get and passed_post
        print_test("Profile Endpoint (GET/POST)", passed)
        return passed
        
    except Exception as e:
        print_test("Profile Endpoint", False, f"Error: {str(e)}")
        return False

def test_analyze_content_endpoint():
    """Test content analysis endpoint"""
    try:
        test_content = {
            'url': 'https://example.com/python-tutorial',
            'title': 'Learn Python Programming',
            'content': 'This is a comprehensive guide to learning Python programming language'
        }
        
        response = requests.post(
            f'{BASE_URL}/api/analyze',
            json=test_content,
            headers={'Content-Type': 'application/json'},
            timeout=TIMEOUT
        )
        
        data = response.json()
        passed = (
            response.status_code == 200 and
            'category' in data and
            'educational_score' in data
        )
        
        print_test(
            "Content Analysis Endpoint",
            passed,
            f"Category: {data.get('category')}, Edu Score: {data.get('educational_score', 0):.2f}"
        )
        return passed
        
    except Exception as e:
        print_test("Content Analysis Endpoint", False, f"Error: {str(e)}")
        return False

def test_error_handling():
    """Test error handling"""
    try:
        # Test with invalid JSON
        response = requests.post(
            f'{BASE_URL}/api/sync',
            data='invalid json',
            headers={'Content-Type': 'application/json'},
            timeout=TIMEOUT
        )
        
        # Test with missing data
        response2 = requests.post(
            f'{BASE_URL}/api/sync',
            json={},
            headers={'Content-Type': 'application/json'},
            timeout=TIMEOUT
        )
        
        # Test with invalid sessions type
        response3 = requests.post(
            f'{BASE_URL}/api/sync',
            json={'sessions': 'not_an_array'},
            headers={'Content-Type': 'application/json'},
            timeout=TIMEOUT
        )
        
        passed = (
            response.status_code == 400 and
            response2.status_code == 400 and
            response3.status_code == 400
        )
        
        print_test("Error Handling", passed, "All invalid requests properly rejected")
        return passed
        
    except Exception as e:
        print_test("Error Handling", False, f"Error: {str(e)}")
        return False

def run_tests():
    """Run all tests"""
    print(f"\n{Colors.BLUE}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BLUE}  SupriAI Backend Test Suite{Colors.RESET}")
    print(f"{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")
    print(f"Testing server at: {BASE_URL}\n")
    
    # Check if server is running
    try:
        requests.get(f'{BASE_URL}/api/health', timeout=2)
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}✗ Server is not running at {BASE_URL}{Colors.RESET}")
        print(f"\nPlease start the server first with:")
        print(f"  python start_server.py")
        print(f"\nor:")
        print(f"  python app.py\n")
        sys.exit(1)
    except Exception as e:
        print(f"{Colors.RED}✗ Cannot connect to server: {str(e)}{Colors.RESET}\n")
        sys.exit(1)
    
    # Run tests
    tests = [
        ('Health Check', test_health_check),
        ('Sync Endpoint', test_sync_endpoint),
        ('Analytics Endpoint', test_analytics_endpoint),
        ('Recommendations Endpoint', test_recommendations_endpoint),
        ('Profile Endpoint', test_profile_endpoint),
        ('Content Analysis', test_analyze_content_endpoint),
        ('Error Handling', test_error_handling),
    ]
    
    results = []
    for name, test_func in tests:
        results.append(test_func())
        print()  # Blank line between tests
    
    # Summary
    passed = sum(results)
    total = len(results)
    
    print(f"{Colors.BLUE}{'=' * 60}{Colors.RESET}")
    print(f"Test Results: {passed}/{total} passed")
    
    if passed == total:
        print(f"{Colors.GREEN}✓ All tests passed!{Colors.RESET}")
        print(f"{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")
        sys.exit(0)
    else:
        print(f"{Colors.YELLOW}⚠ {total - passed} test(s) failed{Colors.RESET}")
        print(f"{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")
        sys.exit(1)

if __name__ == '__main__':
    run_tests()
