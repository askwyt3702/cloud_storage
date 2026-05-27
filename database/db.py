import os
import psycopg2
from psycopg2.extras import DictCursor

def get_db_connection():
    # Docker環境（docker-compose）の環境変数や設定に合わせて接続します
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "storage_management"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "password"),
        cursor_factory=DictCursor
    )
    return conn
