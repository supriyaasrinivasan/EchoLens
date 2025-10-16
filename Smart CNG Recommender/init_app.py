#!/usr/bin/env python3
"""
Initialization script for Smart CNG Recommender
Sets up the database and migrates CSV data
"""

import os
import sys
from database import db

def initialize_application():
    """Initialize the application with database and data migration"""
    print("=== Smart CNG Recommender Initialization ===")
    
    # Check if CSV file exists
    csv_file = "CNG_pumps_with_Erlang-C_waiting_times_250.csv"
    if os.path.exists(csv_file):
        print(f"Found CSV file: {csv_file}")
        
        # Migrate data
        print("Migrating CSV data to SQLite database...")
        success = db.migrate_csv_data(csv_file)
        
        if success:
            print("✓ Data migration completed successfully")
        else:
            print("✗ Data migration failed")
            return False
    else:
        print(f"CSV file not found: {csv_file}")
        print("Creating empty database...")
    
    # Verify database setup
    try:
        stations = db.get_all_stations()
        print(f"✓ Database contains {len(stations)} CNG stations")
        
        # Show some sample data
        if stations:
            print("\nSample stations:")
            for i, station in enumerate(stations[:3]):
                print(f"  {i+1}. {station['name']} at ({station['lat']:.4f}, {station['lng']:.4f})")
        
        return True
        
    except Exception as e:
        print(f"✗ Database verification failed: {e}")
        return False

def create_sample_data():
    """Create some sample data for testing"""
    print("\nCreating sample data...")
    
    # This would add sample stations if database is empty
    try:
        existing_stations = db.get_all_stations()
        if len(existing_stations) == 0:
            print("Database is empty, consider adding the CSV file for data migration")
        else:
            print(f"Database already contains {len(existing_stations)} stations")
    except Exception as e:
        print(f"Error checking stations: {e}")

def main():
    """Main initialization function"""
    print("Initializing Smart CNG Recommender...")
    
    if initialize_application():
        create_sample_data()
        print("\n✓ Initialization completed successfully!")
        print("\nYou can now run the application with:")
        print("python app.py")
    else:
        print("\n✗ Initialization failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()