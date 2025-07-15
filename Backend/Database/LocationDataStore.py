import sqlite3
import sys
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'UserLocationData.db')

def save_location(latitude, longitude, polygon_arr):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()


    cursor.execute('''
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL,
            longitude REAL,
            polygon_json TEXT
        )
    ''')

    polygon_json = json.dumps(polygon_arr)
    cursor.execute('''
        INSERT INTO locations (latitude, longitude, polygon_json)
        VALUES (?, ?, ?)
    ''', (latitude, longitude, polygon_json))

    conn.commit()
    conn.close()
    print("Data saved successfully")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python save_location_sqlite.py <lat> <lon> <polygon_json>")
        sys.exit(1)

    lat = float(sys.argv[1])
    lon = float(sys.argv[2])
    polygon_arr = json.loads(sys.argv[3])  

    save_location(lat, lon, polygon_arr)
