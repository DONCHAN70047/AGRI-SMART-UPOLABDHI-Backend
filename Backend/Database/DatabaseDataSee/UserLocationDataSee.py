import sqlite3
import pandas as pd

conn = sqlite3.connect('Database/UserLocationData.db')

df = pd.read_sql_query("SELECT * FROM locations", conn)

conn.close()

print(df)
