import sqlite3
import json

def get_latest_location():
    conn = sqlite3.connect('Database/UserLocationData.db')
    cursor = conn.cursor()

    cursor.execute("SELECT latitude, longitude FROM locations ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        data = {
            "lat": row[0],
            "lon": row[1]
        }
        print(json.dumps(data))  
    else:
        print(json.dumps({"error": "No data found"}))

if __name__ == "__main__":
    get_latest_location()
