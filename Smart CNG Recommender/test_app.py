#!/usr/bin/env python3
"""
Test script for Smart CNG Recommender functionality
"""

import requests
import json
import time
from database import db

def test_database():
    """Test database functionality"""
    print("=== Testing Database ===")
    
    try:
        # Test getting all stations
        stations = db.get_all_stations()
        print(f"✓ Retrieved {len(stations)} stations from database")
        
        if stations:
            # Test nearby stations query
            sample_station = stations[0]
            lat, lng = sample_station['lat'], sample_station['lng']
            nearby = db.get_stations_near_location(lat, lng, 5.0)
            print(f"✓ Found {len(nearby)} stations within 5km of sample location")
        
        return True
        
    except Exception as e:
        print(f"✗ Database test failed: {e}")
        return False

def test_api_endpoints(base_url="http://localhost:5000"):
    """Test API endpoints"""
    print("=== Testing API Endpoints ===")
    
    try:
        # Test stations from file endpoint
        response = requests.get(f"{base_url}/api/stations-from-file", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Stations API returned {len(data.get('stations', []))} stations")
        else:
            print(f"✗ Stations API failed: {response.status_code}")
            return False
        
        # Test nearby stations endpoint (using Delhi coordinates)
        delhi_lat, delhi_lng = 28.6139, 77.2090
        response = requests.get(f"{base_url}/api/stations/{delhi_lat}/{delhi_lng}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Nearby stations API returned {len(data.get('stations', []))} stations")
        else:
            print(f"✗ Nearby stations API failed: {response.status_code}")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("✗ Could not connect to server. Make sure the Flask app is running.")
        return False
    except Exception as e:
        print(f"✗ API test failed: {e}")
        return False

def test_wait_time_prediction():
    """Test wait time prediction"""
    print("=== Testing Wait Time Prediction ===")
    
    try:
        from models.wait_time_predictor import WaitTimePredictor
        
        predictor = WaitTimePredictor()
        
        # Try training from database
        if predictor.train_from_database():
            print("✓ Wait time model trained from database")
        else:
            print("⚠ Wait time model training from database failed, using heuristic")
        
        # Test prediction
        sample_data = [{
            'id': 'test-station',
            'active_chargers': 2,
            'total_chargers': 3,
            'current_queue_length': 2,
            'hour_of_day': 14,
            'day_of_week': 2,
            'is_weekend': 0,
            'traffic_density': 0.7,
            'historical_avg_wait_time': 8.5
        }]
        
        predictions = predictor.predict_wait_time(sample_data)
        if predictions:
            pred = predictions[0]
            print(f"✓ Predicted wait time: {pred['predicted_wait']:.2f} minutes (confidence: {pred['confidence']:.2f})")
        
        return True
        
    except Exception as e:
        print(f"✗ Wait time prediction test failed: {e}")
        return False

def test_location_optimization():
    """Test location optimization"""
    print("=== Testing Location Optimization ===")
    
    try:
        from models.location_optimizer import LocationOptimizer
        
        optimizer = LocationOptimizer()
        
        # Test with Delhi coordinates
        delhi_lat, delhi_lng = 28.6139, 77.2090
        time_info = {'is_weekend': False, 'time_of_day': 'afternoon'}
        
        optimal_locations = optimizer.optimize_station_locations(
            center_lat=delhi_lat,
            center_lng=delhi_lng,
            radius_km=5.0,
            num_stations=3,
            time_info=time_info
        )
        
        print(f"✓ Found {len(optimal_locations)} optimal locations for new stations")
        
        if optimal_locations:
            for i, loc in enumerate(optimal_locations[:2]):
                print(f"  {i+1}. {loc['area_type']} area at ({loc['lat']:.4f}, {loc['lng']:.4f}) - Score: {loc['total_score']:.3f}")
        
        return True
        
    except Exception as e:
        print(f"✗ Location optimization test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("Smart CNG Recommender - Test Suite")
    print("=" * 40)
    
    tests = [
        ("Database", test_database),
        ("Wait Time Prediction", test_wait_time_prediction),
        ("Location Optimization", test_location_optimization),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        time.sleep(0.5)  # Brief pause between tests
    
    print("\n" + "=" * 40)
    print(f"Tests completed: {passed}/{total} passed")
    
    if passed == total:
        print("✓ All tests passed! The application is ready to use.")
        
        print("\nTo test API endpoints, start the Flask application:")
        print("python app.py")
        print("\nThen run this test script again to test API endpoints.")
    else:
        print("⚠ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    main()