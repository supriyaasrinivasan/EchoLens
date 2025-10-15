"""
SQLite database setup and models for the Smart CNG Recommender
"""
import sqlite3
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
import json

class DatabaseManager:
    def __init__(self, db_path: str = "smart_cng.db"):
        """Initialize database connection and create tables if needed"""
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize database and create tables"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # CNG Stations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cng_stations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    address TEXT,
                    brand TEXT,
                    phone TEXT,
                    opening_hours TEXT,
                    services TEXT,  -- JSON string for services list
                    total_pumps INTEGER DEFAULT 1,
                    active_pumps INTEGER DEFAULT 1,
                    fuel_types TEXT DEFAULT 'CNG',  -- JSON array
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Station Analytics table (for wait times and utilization)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS station_analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_id INTEGER NOT NULL,
                    arrivals_per_hr_morning REAL DEFAULT 0,
                    arrivals_per_hr_evening REAL DEFAULT 0,
                    arrivals_per_hr_overall REAL DEFAULT 0,
                    avg_service_time_min REAL DEFAULT 5.0,
                    servers_available INTEGER DEFAULT 1,
                    rush_pattern TEXT DEFAULT 'Steady',
                    weekend_multiplier REAL DEFAULT 1.0,
                    holiday_multiplier REAL DEFAULT 1.0,
                    wait_prob REAL DEFAULT 0.1,
                    wait_time_morning_min REAL DEFAULT 0,
                    wait_time_evening_min REAL DEFAULT 0,
                    wait_time_overall_min REAL DEFAULT 0,
                    total_station_time_min REAL DEFAULT 5.0,
                    utilization_rate REAL DEFAULT 0.5,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (station_id) REFERENCES cng_stations (id)
                )
            """)
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    email TEXT,
                    full_name TEXT,
                    vehicle_type TEXT DEFAULT 'CNG',
                    vehicle_model TEXT,
                    vehicle_capacity REAL,  -- Tank capacity in kg
                    preferred_stations TEXT,  -- JSON array of station IDs
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            """)
            
            # Trip History table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trip_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    origin_lat REAL NOT NULL,
                    origin_lng REAL NOT NULL,
                    destination_lat REAL NOT NULL,
                    destination_lng REAL NOT NULL,
                    total_distance REAL,
                    planned_stops TEXT,  -- JSON array of station stops
                    actual_stops TEXT,   -- JSON array of actual stops taken
                    fuel_consumed REAL,
                    total_time_min REAL,
                    total_wait_time_min REAL,
                    trip_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Favorites table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS favorite_stations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    station_id INTEGER NOT NULL,
                    nickname TEXT,
                    notes TEXT,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (station_id) REFERENCES cng_stations (id),
                    UNIQUE(user_id, station_id)
                )
            """)
            
            # Real-time station status
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS station_status (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    station_id INTEGER NOT NULL,
                    current_queue_length INTEGER DEFAULT 0,
                    pumps_operational INTEGER,
                    fuel_available BOOLEAN DEFAULT 1,
                    estimated_wait_time_min REAL DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (station_id) REFERENCES cng_stations (id)
                )
            """)
            
            # System settings
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    description TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def migrate_csv_data(self, csv_file_path: str):
        """Migrate data from CSV file to database"""
        if not os.path.exists(csv_file_path):
            print(f"CSV file not found: {csv_file_path}")
            return False
        
        try:
            # Read CSV data
            df = pd.read_csv(csv_file_path)
            
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                # Clear existing data
                cursor.execute("DELETE FROM station_analytics")
                cursor.execute("DELETE FROM cng_stations")
                
                migrated_count = 0
                
                for _, row in df.iterrows():
                    # Insert station data
                    cursor.execute("""
                        INSERT INTO cng_stations (
                            name, latitude, longitude, total_pumps, active_pumps
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        row['name'],
                        float(row['@lat']),
                        float(row['@lon']),
                        int(row.get('demo_servers_disp', 1)),
                        int(row.get('demo_servers_disp', 1))
                    ))
                    
                    station_id = cursor.lastrowid
                    
                    # Insert analytics data
                    cursor.execute("""
                        INSERT INTO station_analytics (
                            station_id, arrivals_per_hr_morning, arrivals_per_hr_evening,
                            arrivals_per_hr_overall, avg_service_time_min, servers_available,
                            rush_pattern, weekend_multiplier, holiday_multiplier,
                            wait_prob, wait_time_morning_min, wait_time_evening_min,
                            wait_time_overall_min, total_station_time_min
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        station_id,
                        float(row.get('demo_arrivals_per_hr_morning', 0)),
                        float(row.get('demo_arrivals_per_hr_evening', 0)),
                        float(row.get('demo_overall_arrivals_per_hr', 0)),
                        float(row.get('demo_avg_service_time_min', 5.0)),
                        int(row.get('demo_servers_disp', 1)),
                        row.get('demo_rush_pattern', 'Steady'),
                        float(row.get('demo_weekend_multiplier', 1.0)),
                        float(row.get('demo_holiday_multiplier', 1.0)),
                        float(row.get('demo_est_wait_prob', 0.1)),
                        self._safe_float(row.get('Wq_morning_min', 0)),
                        self._safe_float(row.get('Wq_evening_min', 0)),
                        self._safe_float(row.get('Wq_overall_min', 0)),
                        self._safe_float(row.get('Expected_total_station_time_min', 5.0))
                    ))
                    
                    migrated_count += 1
                
                conn.commit()
                print(f"Successfully migrated {migrated_count} stations from CSV to database")
                return True
                
        except Exception as e:
            print(f"Error migrating CSV data: {e}")
            return False
    
    def _safe_float(self, value):
        """Safely convert value to float, handling 'inf' and other edge cases"""
        try:
            if str(value).lower() == 'inf' or str(value) == 'inf':
                return 999.99  # Use a large number instead of infinity
            return float(value)
        except (ValueError, TypeError):
            return 0.0
    
    def get_stations_near_location(self, lat: float, lng: float, radius_km: float = 5.0) -> List[Dict]:
        """Get stations within radius of a location"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = """
                SELECT 
                    s.id, s.name, s.latitude, s.longitude, s.address, s.brand,
                    s.phone, s.opening_hours, s.total_pumps, s.active_pumps,
                    a.arrivals_per_hr_overall, a.avg_service_time_min,
                    a.wait_time_overall_min, a.total_station_time_min,
                    a.utilization_rate,
                    st.current_queue_length, st.estimated_wait_time_min,
                    st.fuel_available
                FROM cng_stations s
                LEFT JOIN station_analytics a ON s.id = a.station_id
                LEFT JOIN station_status st ON s.id = st.station_id
                WHERE (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians(?)) + 
                        sin(radians(?)) * sin(radians(latitude))
                    )
                ) <= ?
                ORDER BY (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians(?)) + 
                        sin(radians(?)) * sin(radians(latitude))
                    )
                )
            """
            
            cursor.execute(query, (lat, lng, lat, radius_km, lat, lng, lat))
            rows = cursor.fetchall()
            
            stations = []
            for row in rows:
                stations.append({
                    'id': row[0],
                    'name': row[1],
                    'position': {'lat': row[2], 'lng': row[3]},
                    'address': row[4],
                    'brand': row[5],
                    'phone': row[6],
                    'opening_hours': row[7],
                    'total_chargers': row[8],
                    'active_chargers': row[9],
                    'arrivals_per_hr': row[10] or 0,
                    'avg_service_time': row[11] or 5.0,
                    'predicted_wait': row[12] or 0,
                    'total_station_time': row[13] or 5.0,
                    'utilization_rate': row[14] or 0.5,
                    'current_queue_length': row[15] or 0,
                    'estimated_wait_time': row[16] or 0,
                    'fuel_available': bool(row[17]) if row[17] is not None else True
                })
            
            return stations
    
    def get_all_stations(self) -> List[Dict]:
        """Get all stations for location optimization"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = """
                SELECT 
                    s.id, s.name, s.latitude, s.longitude,
                    a.arrivals_per_hr_morning, a.arrivals_per_hr_evening,
                    a.arrivals_per_hr_overall, a.avg_service_time_min,
                    a.servers_available, a.rush_pattern,
                    a.wait_time_morning_min, a.wait_time_evening_min,
                    a.wait_time_overall_min, a.total_station_time_min,
                    a.utilization_rate
                FROM cng_stations s
                LEFT JOIN station_analytics a ON s.id = a.station_id
            """
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            stations = []
            for row in rows:
                stations.append({
                    'id': row[0],
                    'name': row[1],
                    'lat': row[2],
                    'lng': row[3],
                    'morning_arrivals': row[4] or 0,
                    'evening_arrivals': row[5] or 0,
                    'overall_arrivals': row[6] or 0,
                    'service_time': row[7] or 5.0,
                    'servers': row[8] or 1,
                    'rush_pattern': row[9] or 'Steady',
                    'wait_time_morning': row[10] or 0,
                    'wait_time_evening': row[11] or 0,
                    'wait_time_overall': row[12] or 0,
                    'total_station_time': row[13] or 5.0,
                    'utilization': row[14] or 0.5
                })
            
            return stations
    
    def add_user(self, username: str, password_hash: str, email: str = None, 
                 full_name: str = None) -> int:
        """Add a new user to the database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (username, password_hash, email, full_name)
                VALUES (?, ?, ?, ?)
            """, (username, password_hash, email, full_name))
            return cursor.lastrowid
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, username, password_hash, email, full_name, 
                       vehicle_type, vehicle_model, vehicle_capacity,
                       preferred_stations, created_at, last_login
                FROM users WHERE username = ?
            """, (username,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'password_hash': row[2],
                    'email': row[3],
                    'full_name': row[4],
                    'vehicle_type': row[5],
                    'vehicle_model': row[6],
                    'vehicle_capacity': row[7],
                    'preferred_stations': json.loads(row[8]) if row[8] else [],
                    'created_at': row[9],
                    'last_login': row[10]
                }
            return None
    
    def add_trip_history(self, user_id: int, origin_lat: float, origin_lng: float,
                        destination_lat: float, destination_lng: float,
                        planned_stops: List[Dict], **kwargs) -> int:
        """Add trip history record"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO trip_history (
                    user_id, origin_lat, origin_lng, destination_lat, destination_lng,
                    total_distance, planned_stops, fuel_consumed, total_time_min
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, origin_lat, origin_lng, destination_lat, destination_lng,
                kwargs.get('total_distance', 0),
                json.dumps(planned_stops),
                kwargs.get('fuel_consumed', 0),
                kwargs.get('total_time_min', 0)
            ))
            return cursor.lastrowid
    
    def update_station_status(self, station_id: int, queue_length: int = 0,
                             pumps_operational: int = None, fuel_available: bool = True,
                             estimated_wait_time: float = 0):
        """Update real-time station status"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Check if status record exists
            cursor.execute("SELECT id FROM station_status WHERE station_id = ?", (station_id,))
            if cursor.fetchone():
                cursor.execute("""
                    UPDATE station_status SET
                        current_queue_length = ?,
                        pumps_operational = COALESCE(?, pumps_operational),
                        fuel_available = ?,
                        estimated_wait_time_min = ?,
                        last_updated = CURRENT_TIMESTAMP
                    WHERE station_id = ?
                """, (queue_length, pumps_operational, fuel_available, estimated_wait_time, station_id))
            else:
                cursor.execute("""
                    INSERT INTO station_status (
                        station_id, current_queue_length, pumps_operational,
                        fuel_available, estimated_wait_time_min
                    ) VALUES (?, ?, ?, ?, ?)
                """, (station_id, queue_length, pumps_operational, fuel_available, estimated_wait_time))
    
    def get_station_by_coordinates(self, lat: float, lng: float, tolerance: float = 0.001) -> Optional[Dict]:
        """Find station by coordinates with tolerance"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, latitude, longitude FROM cng_stations
                WHERE ABS(latitude - ?) < ? AND ABS(longitude - ?) < ?
                LIMIT 1
            """, (lat, tolerance, lng, tolerance))
            
            row = cursor.fetchone()
            if row:
                return {
                    'id': row[0],
                    'name': row[1],
                    'lat': row[2],
                    'lng': row[3]
                }
            return None

# Global database instance
db = DatabaseManager()