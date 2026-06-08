import os
import psycopg2
from psycopg2.extras import DictCursor

def get_db_connection():
    # Docker環境（docker-compose）の環境変数や設定に合わせて接続します
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "localhost"),
            database=os.getenv("DB_NAME", "storage_management"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "secret_password123"),
            cursor_factory=DictCursor
        )
        return conn
    except psycopg2.OperationalError as e:
        # 日本語 Windows 環境で PostgreSQL の接続エラーが発生した際、
        # エラーメッセージが Shift-JIS/CP932 で返ってくるため utf-8 デコードエラーになるのを防ぐ
        err_msg = ""
        try:
            err_msg = str(e)
        except UnicodeDecodeError:
            try:
                if e.args and isinstance(e.args[0], bytes):
                    err_msg = e.args[0].decode("cp932", errors="ignore")
                else:
                    err_msg = "PostgreSQLの接続に失敗しました (日本語エラーメッセージのデコード失敗)"
            except Exception:
                err_msg = "PostgreSQLの接続に失敗しました。サーバーが起動しているか、接続設定を確認してください。"
        
        if not err_msg:
            err_msg = "PostgreSQLの接続に失敗しました。サーバーが起動しているか、接続設定を確認してください。"
            
        raise RuntimeError(f"データベース接続エラー: {err_msg}")

