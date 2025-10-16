from flask import Flask, render_template, jsonify, send_from_directory, request, redirect, url_for, session
import requests
import json
from datetime import datetime
import numpy as np
import time
from models.location_optimizer import LocationOptimizer
from models.wait_time_predictor import WaitTimePredictor
from dataclasses import dataclass
from typing import Dict, Any
from models.station_calculating_model import ChargingStationCalculator
import os
import pandas as pd
import math
import bcrypt
from database import db

app = Flask(__name__, static_url_path='/static')
app.secret_key = 'smart-cng-recommender-secret-key-change-in-production'

# Initialize database and migrate CSV data
print("Initializing database...")
csv_file_path = os.path.join(os.path.dirname(__file__), 'CNG_pumps_with_Erlang-C_waiting_times_250.csv')
if os.path.exists(csv_file_path):
    db.migrate_csv_data(csv_file_path)
    print("CSV data migrated to database")
else:
    print("CSV file not found, using existing database data")

# Initialize models
station_calculator = ChargingStationCalculator()
wait_time_predictor = WaitTimePredictor()

# Try to train the wait time predictor from database first, then CSV
try:
    if wait_time_predictor.train_from_database():
        print("Wait time model trained from database")
    else:
        # Fallback to CSV training
        wt_path_candidates = [
            os.path.join(os.path.dirname(__file__), 'CNG_pumps_with_Erlang-C_waiting_times_250.csv'),
            os.path.join(os.path.dirname(__file__), 'waiting_times.csv')
        ]
        for p in wt_path_candidates:
            if os.path.exists(p):
                wait_time_predictor.train_from_csv(p)
                print(f"Wait time model trained from {os.path.basename(p)}")
                break
except Exception as e:
    print(f"Wait time model training failed: {e}")

location_optimizer = LocationOptimizer()

# Define water bodies and restricted areas in NCR
RESTRICTED_AREAS = [
    # Yamuna River and floodplains - more detailed polygon
    {
        'name': 'Yamuna River and Floodplains',
        'polygon': [
            {'lat': 28.6890, 'lng': 77.2170},  # North Delhi
            {'lat': 28.6800, 'lng': 77.2220},
            {'lat': 28.6700, 'lng': 77.2250},
            {'lat': 28.6600, 'lng': 77.2280},
            {'lat': 28.6500, 'lng': 77.2300},
            {'lat': 28.6400, 'lng': 77.2320},
            {'lat': 28.6300, 'lng': 77.2340},
            {'lat': 28.6200, 'lng': 77.2360},
            {'lat': 28.6100, 'lng': 77.2380},
            {'lat': 28.6000, 'lng': 77.2400},
            {'lat': 28.5900, 'lng': 77.2420},
            {'lat': 28.5800, 'lng': 77.2440},
            {'lat': 28.5700, 'lng': 77.2460},  # South Delhi
            # West bank
            {'lat': 28.5700, 'lng': 77.2360},
            {'lat': 28.5800, 'lng': 77.2340},
            {'lat': 28.5900, 'lng': 77.2320},
            {'lat': 28.6000, 'lng': 77.2300},
            {'lat': 28.6100, 'lng': 77.2280},
            {'lat': 28.6200, 'lng': 77.2260},
            {'lat': 28.6300, 'lng': 77.2240},
            {'lat': 28.6400, 'lng': 77.2220},
            {'lat': 28.6500, 'lng': 77.2200},
            {'lat': 28.6600, 'lng': 77.2180},
            {'lat': 28.6700, 'lng': 77.2160},
            {'lat': 28.6800, 'lng': 77.2140},
            {'lat': 28.6890, 'lng': 77.2170}  # Close the polygon
        ]
    },
    # Add other water bodies
    {
        'name': 'Okhla Bird Sanctuary',
        'polygon': [
            {'lat': 28.5680, 'lng': 77.3000},
            {'lat': 28.5700, 'lng': 77.3100},
            {'lat': 28.5600, 'lng': 77.3150},
            {'lat': 28.5550, 'lng': 77.3050},
            {'lat': 28.5680, 'lng': 77.3000}
        ]
    }
]

# Define CNG models data structure
cng_models = {
    'tesla_model_3': {
        'name': "Tesla Model 3",
        'battery_capacity': 82,  # kWh
        'range': 358,  # km
        'filling_speed': 250,  # kg/min
        'consumption': 0.229  # kWh/km
    },
    'nissan_leaf': {
        'name': "Nissan Leaf",
        'battery_capacity': 62,
        'range': 385,
        'filling_speed': 100,
        'consumption': 0.161
    },
    'chevy_bolt': {
        'name': "Chevrolet Bolt",
        'battery_capacity': 65,
        'range': 417,
        'filling_speed': 55,
        'consumption': 0.156
    }
}

def point_in_polygon(point, polygon):
    """Ray casting algorithm to determine if point is in polygon"""
    x, y = point['lng'], point['lat']
    inside = False
    j = len(polygon) - 1
    
    for i in range(len(polygon)):
        if ((polygon[i]['lng'] > x) != (polygon[j]['lng'] > x) and
            y < (polygon[j]['lat'] - polygon[i]['lat']) * 
            (x - polygon[i]['lng']) / 
            (polygon[j]['lng'] - polygon[i]['lng']) + 
            polygon[i]['lat']):
            inside = not inside
        j = i
    
    return inside

def is_valid_location(lat, lng):
    """Enhanced location validation with buffer zone"""
    point = {'lat': lat, 'lng': lng}
    
    # Add a buffer zone around restricted areas (approximately 100 meters)
    BUFFER = 0.001  # roughly 100 meters in degrees
    
    for area in RESTRICTED_AREAS:
        # Check if point is in restricted area or buffer zone
        for i in range(len(area['polygon'])):
            p1 = area['polygon'][i]
            p2 = area['polygon'][(i + 1) % len(area['polygon'])]
            
            # Calculate distance to line segment
            if distance_to_line_segment(point, p1, p2) < BUFFER:
                return False
    
    return True

def distance_to_line_segment(p, p1, p2):
    """Calculate distance from point to line segment"""
    x, y = p['lng'], p['lat']
    x1, y1 = p1['lng'], p1['lat']
    x2, y2 = p2['lng'], p2['lat']
    
    A = x - x1
    B = y - y1
    C = x2 - x1
    D = y2 - y1
    
    dot = A * C + B * D
    len_sq = C * C + D * D
    
    if len_sq == 0:
        return np.sqrt(A * A + B * B)
        
    param = dot / len_sq
    
    if param < 0:
        return np.sqrt(A * A + B * B)
    elif param > 1:
        return np.sqrt((x - x2) * (x - x2) + (y - y2) * (y - y2))
    
    return abs(A * D - C * B) / np.sqrt(len_sq)

def get_time_info():
    """Get current time information"""
    current_time = datetime.now()
    hour = current_time.hour
    
    # Determine time of day
    if 6 <= hour < 12:
        time_of_day = 'morning'
    elif 12 <= hour < 17:
        time_of_day = 'afternoon'
    else:
        time_of_day = 'evening'
    
    return {
        'is_weekend': current_time.weekday() >= 5,
        'time_of_day': time_of_day,
        'hour': hour,
        'day_of_week': current_time.weekday()
    }

def fetch_gas_stations(lat, lng, radius=3000):
    """Fetch gas stations and convert them to nodes for optimization"""
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    overpass_query = f"""
    [out:json][timeout:25];
    (
        node["amenity"="fuel"](around:{radius},{lat},{lng});
        way["amenity"="fuel"](around:{radius},{lat},{lng});
    );
    out body;
    >;
    out skel qt;
    """
    
    try:
        response = requests.post(overpass_url, data=overpass_query)
        data = response.json()
        
        nodes = []
        for element in data.get('elements', []):
            if element.get('type') == 'node':
                node = {
                    'lat': element.get('lat'),
                    'lng': element.get('lon'),
                    'type': determine_area_type(element),
                    'name': element.get('tags', {}).get('name', 'Unnamed Station')
                }
                if is_valid_location(node['lat'], node['lng']):
                    nodes.append(node)
        return nodes
    except Exception as e:
        print(f"Error fetching gas stations: {e}")
        return []

def determine_area_type(element):
    """Determine area type based on surroundings"""
    tags = element.get('tags', {})
    
    if tags.get('shop') in ['mall', 'supermarket']:
        return 'Market'
    elif tags.get('building') in ['commercial', 'office']:
        return 'Office'
    elif tags.get('amenity') in ['hospital', 'clinic']:
        return 'Hospital'
    elif tags.get('amenity') in ['school', 'university']:
        return 'School'
    elif tags.get('industrial') == 'yes':
        return 'Factory'
    else:
        return 'Market'  # Default to market for gas stations

def analyze_location_suitability(gas_station, existing_stations):
    """Enhanced location suitability analysis"""
    if not is_valid_location(gas_station['lat'], gas_station['lng']):
        return 0
    
    # Check minimum distance from existing stations
    MIN_DISTANCE = 0.005  # roughly 500m
    for existing in existing_stations:
        dist = np.sqrt(
            (gas_station['lat'] - existing['lat'])**2 + 
            (gas_station['lng'] - existing['lng'])**2
        )
        if dist < MIN_DISTANCE:
            return 0
    
    # Base score
    score = 1.0
    
    # Factors affecting suitability
    if gas_station.get('near_highway', False):
        score *= 1.3  # Prefer locations near major roads
    
    if gas_station.get('in_commercial', False):
        score *= 1.2  # Prefer commercial areas
    
    if '24/7' in gas_station.get('opening_hours', ''):
        score *= 1.2  # Prefer 24/7 locations
    
    if gas_station.get('brand', 'Unknown') != 'Unknown':
        score *= 1.1  # Prefer established brands
    
    return score

app.secret_key = 'smart-cng-recommender-secret-key-change-in-production'

# Authentication helper functions
def hash_password(password: str) -> str:
    """Hash a password for storing"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password: str, hashed: str) -> bool:
    """Check a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_default_user():
    """Create default user if it doesn't exist"""
    existing_user = db.get_user_by_username("Codex")
    if not existing_user:
        hashed_password = hash_password("codex")
        db.add_user("Codex", hashed_password, "admin@smartcng.com", "CNG Admin")
        print("Default user 'Codex' created")

# Create default user on startup
create_default_user()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = db.get_user_by_username(username)
        if user and check_password(password, user['password_hash']):
            session['logged_in'] = True
            session['username'] = username
            session['user_id'] = user['id']
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', error="Invalid credentials")
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/')
def dashboard():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('dashboard.html', username=session.get('username'))

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/api/stations/<lat>/<lng>')
def get_nearby_stations(lat, lng):
    """Return stations from database near the provided lat/lng, optional radius in km."""
    lat, lng = float(lat), float(lng)
    try:
        radius_km = float(request.args.get('radius', 5))
    except Exception:
        radius_km = 5.0

    # Get stations from database
    stations = db.get_stations_near_location(lat, lng, radius_km)
    
    if not stations:
        return jsonify({'error': 'No stations found in the area', 'stations': []}), 404

    # Calculate distance and format response
    def haversine_km(lat1, lon1, lat2, lon2):
        R = 6371.0
        dlat = np.radians(lat2 - lat1)
        dlon = np.radians(lon2 - lon1)
        a = np.sin(dlat/2)**2 + np.cos(np.radians(lat1)) * np.cos(np.radians(lat2)) * np.sin(dlon/2)**2
        c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
        return float(R * c)

    result = []
    for station in stations:
        pos = station['position']
        distance = haversine_km(lat, lng, pos['lat'], pos['lng'])
        
        result.append({
            'id': station['id'],
            'name': station['name'],
            'position': pos,
            'distance_km': round(distance, 3),
            'active_chargers': station['active_chargers'],
            'total_chargers': station['total_chargers'],
            'brand': station.get('brand', 'Unknown'),
            'phone': station.get('phone', ''),
            'opening_hours': station.get('opening_hours', '24/7'),
            'fuel_available': station.get('fuel_available', True)
        })

    # Predict wait times
    timeinfo = get_time_info()
    feature_recs = []
    for st in result:
        station_data = next((s for s in stations if s['id'] == st['id']), {})
        feature_recs.append({
            'id': st['id'],
            'active_chargers': st.get('active_chargers', 1),
            'total_chargers': st.get('total_chargers', 2),
            'current_queue_length': station_data.get('current_queue_length', 0),
            'hour_of_day': timeinfo['hour'],
            'day_of_week': timeinfo['day_of_week'],
            'is_weekend': 1 if timeinfo['is_weekend'] else 0,
            'traffic_density': 0.5,
            'historical_avg_wait_time': station_data.get('predicted_wait', 5.0)
        })
    
    preds = wait_time_predictor.predict_wait_time(feature_recs)
    pred_map = {str(p['station_id']): p for p in preds}

    for st in result:
        pm = pred_map.get(str(st['id']))
        if pm:
            st['predicted_wait'] = round(float(pm['predicted_wait']), 2)
            st['prediction_confidence'] = round(float(pm['confidence']), 2)
        else:
            st['predicted_wait'] = round(np.random.uniform(2, 15), 2)
            st['prediction_confidence'] = 0.6

    # Sort by predicted wait then distance
    result.sort(key=lambda x: (x.get('predicted_wait', 9999), x['distance_km']))
    return jsonify({'stations': result})

@app.route('/api/stations-with-wait/<lat>/<lng>')
def get_nearby_stations_with_wait(lat, lng):
    # Proxy to existing endpoint logic
    return get_nearby_stations(lat, lng)

def get_random_connectors():
    connector_types = ["Type 2", "CCS", "CHAdeMO"]
    num_connectors = np.random.randint(1, len(connector_types) + 1)
    return np.random.choice(connector_types, num_connectors, replace=False).tolist()

def get_random_power():
    power_options = ["50kW", "100kW", "150kW", "350kW"]
    return np.random.choice(power_options)

@app.route('/api/optimize-locations/<lat>/<lng>')
def get_optimal_locations(lat, lng):
    """Get optimal locations for new CNG stations using database data"""
    try:
        # Get current time info
        time_info = get_time_info()
        
        # Use location optimizer with database data
        optimal_stations = location_optimizer.optimize_station_locations(
            center_lat=float(lat),
            center_lng=float(lng),
            radius_km=10.0,
            num_stations=5,
            time_info=time_info
        )
        
        return jsonify({'candidates': optimal_stations})
    except Exception as e:
        print(f"Error in location optimization: {e}")
        return jsonify({'error': str(e), 'candidates': []}), 500

@app.route('/nearby-stations')
def nearby_stations():
    return render_template('index.html')

@app.route('/route-planner')
def route_planner():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('route_planner.html', username=session.get('username'))

@app.route('/stations')
def stations():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('index.html', username=session.get('username'))

@app.route('/favorites')
def favorites():
    return render_template('favorites.html')  # You'll need to create this

@app.route('/analytics')
def analytics():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('analytics_soon.html', username=session.get('username'))

@app.route('/cng-switch')
def cng_switch():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('cng_switch_soon.html', username=session.get('username'))

@app.route('/ev-switcher')
def ev_switcher():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('cng_switch_soon.html', username=session.get('username'))

@app.route('/api/route-plan', methods=['POST'])
def plan_route():
    data = request.json
    
    # Extract route data
    route = {
        'distance': data['route']['distance'],
        'coordinates': data['route']['coordinates']
    }
    # Accept both old and new payload shapes
    ev_model = data.get('evModel', {}).get('name') or data.get('cngModel', {}).get('name') or 'CNG Vehicle'
    current_charge = float(data.get('currentCharge') or data.get('currentFuel'))
    
    # Create CNG specs from the received data
    cng_payload = data.get('cngModel') or {}
    cng_specs = {
        'tankCapacity': float(cng_payload.get('tankCapacity', 60)),
        'range': float(cng_payload.get('range', 320)),
        'fillingSpeed': float(cng_payload.get('fillingSpeed', 10)),
        'consumption': float(cng_payload.get('consumption', 0.2))
    }
    
    try:
        # Map CNG specs to calculator's expected EV spec keys
        ev_specs_mapped = {
            'batteryCapacity': float(cng_specs['tankCapacity']),
            'chargingSpeed': float(cng_specs['fillingSpeed']),
            'consumption': float(cng_specs['consumption']),
            'range': float(cng_specs['range'])
        }

        filling_stops = station_calculator.calculate_charging_stops(
            route_data=route,
            ev_specs=ev_specs_mapped,
            current_charge=current_charge,
            available_stations=fetch_stations_in_bbox(calculate_route_bbox(route['coordinates']))
        )
        
        # Convert stops to JSON-serializable format
        stops_data = [
            {
                'name': stop.name,
                'lat': stop.lat,
                'lng': stop.lng,
                'arrivalFuel': stop.arrival_charge,
                'departureFuel': stop.departure_charge,
                'fillTime': stop.charge_time,
                'distanceFromStart': stop.distance_from_start,
                'type': stop.type
            }
            for stop in filling_stops
        ]
        
        # Log trip history if user is logged in
        if session.get('user_id') and len(route['coordinates']) >= 2:
            try:
                origin = route['coordinates'][0]
                destination = route['coordinates'][-1]
                db.add_trip_history(
                    user_id=session['user_id'],
                    origin_lat=origin[0],
                    origin_lng=origin[1],
                    destination_lat=destination[0],
                    destination_lng=destination[1],
                    planned_stops=stops_data,
                    total_distance=route['distance']
                )
            except Exception as e:
                print(f"Error logging trip history: {e}")
        
        return jsonify({
            'fillingStops': stops_data
        })
        
    except Exception as e:
        print(f"Route planning error: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 400

def calculate_route_bbox(coordinates):
    """Calculate the bounding box for a set of coordinates"""
    lats = [coord[0] for coord in coordinates]
    lngs = [coord[1] for coord in coordinates]
    
    # Add some padding to the bbox (about 5km)
    padding = 0.045  # roughly 5km in degrees
    
    return {
        'min_lat': min(lats) - padding,
        'max_lat': max(lats) + padding,
        'min_lng': min(lngs) - padding,
        'max_lng': max(lngs) + padding
    }

def fetch_stations_in_bbox(bbox):
    """Fetch CNG stations within a bounding box using database"""
    center_lat = (bbox['min_lat'] + bbox['max_lat']) / 2
    center_lng = (bbox['min_lng'] + bbox['max_lng']) / 2
    
    # Calculate radius to cover the bbox
    radius_km = ((bbox['max_lat'] - bbox['min_lat']) * 111 + 
                 (bbox['max_lng'] - bbox['min_lng']) * 111 * 
                 np.cos(np.radians(center_lat))) / 2
    radius_km = max(radius_km, 25)  # Minimum 25km radius
    
    stations = db.get_stations_near_location(center_lat, center_lng, radius_km)
    
    result = []
    for station in stations:
        pos = station['position']
        if (bbox['min_lat'] <= pos['lat'] <= bbox['max_lat'] and
            bbox['min_lng'] <= pos['lng'] <= bbox['max_lng']):
            result.append({
                'name': station['name'],
                'lat': pos['lat'],
                'lng': pos['lng'],
                'type': 'CNG Pump',
                'power': 'N/A',
                'active_chargers': station.get('active_chargers', 1),
                'total_chargers': station.get('total_chargers', 1)
            })
    
    return result

@app.route('/api/stations-from-file')
def stations_from_file():
    """Get all stations from database"""
    try:
        stations = db.get_all_stations()
        formatted_stations = []
        
        for station in stations:
            formatted_stations.append({
                'name': station['name'],
                'position': {
                    'lat': station['lat'],
                    'lng': station['lng']
                }
            })
        
        return jsonify({'stations': formatted_stations}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'stations': []}), 500

# Remove the old _read_stations_file function as we're using database now

@app.route('/location-optimizer')
def location_optimizer():
    if not session.get('logged_in'):
        return redirect(url_for('login'))
    return render_template('location_optimizer.html', username=session.get('username'))

if __name__ == '__main__':
    app.run(debug=True)