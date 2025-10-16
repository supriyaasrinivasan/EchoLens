#!/usr/bin/env python3
"""
Test script to verify the route fix is working
"""
import requests
import time

def test_routes():
    """Test if the application routes are working correctly"""
    base_url = "http://localhost:5000"
    
    print("Testing Flask Routes...")
    print("=" * 40)
    
    # Test routes that should work
    test_cases = [
        ("/", "Dashboard redirect"),
        ("/login", "Login page"),
        ("/api/stations-from-file", "Stations API")
    ]
    
    success_count = 0
    total_tests = len(test_cases)
    
    for route, description in test_cases:
        try:
            response = requests.get(f"{base_url}{route}", timeout=5)
            if response.status_code in [200, 302]:  # 200 OK or 302 Redirect
                print(f"✓ {description}: {response.status_code}")
                success_count += 1
            else:
                print(f"✗ {description}: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"✗ {description}: Connection failed - {e}")
    
    print("=" * 40)
    print(f"Route tests completed: {success_count}/{total_tests} passed")
    
    if success_count == total_tests:
        print("✅ All routes are working correctly!")
        return True
    else:
        print("❌ Some routes have issues")
        return False

if __name__ == "__main__":
    # Wait a moment for Flask to be ready
    time.sleep(2)
    test_routes()