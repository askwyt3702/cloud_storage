import sqlite3


# DB接続
conn = sqlite3.connect(
    "cloud_storage.db"
)

cursor = conn.cursor()