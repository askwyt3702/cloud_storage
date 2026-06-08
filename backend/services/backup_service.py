import os
import json
import zipfile
import shutil
import threading
import time
from datetime import datetime
from database.db import get_db_connection
from security.logger import log_success, log_error

UPLOAD_DIR = "uploads"
BACKUP_DIR = "backups"
SETTINGS_FILE = os.path.join(UPLOAD_DIR, "_backup_settings.json")

# 多重実行を防ぐためのロックと実行日記録
_scheduler_lock = threading.Lock()
_last_run_date = ""

# =====================================
# バックアップ設定の読み書き
# =====================================
def get_backup_settings() -> dict:
    if not os.path.exists(SETTINGS_FILE):
        return {"enabled": False, "time": "00:00"}
    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log_error(f"バックアップ設定の読み込み失敗: {e}")
        return {"enabled": False, "time": "00:00"}

def save_backup_settings(enabled: bool, time_str: str) -> bool:
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump({"enabled": enabled, "time": time_str}, f, ensure_ascii=False, indent=2)
        log_success("SYSTEM", f"BACKUP_SETTINGS_UPDATED: enabled={enabled}, time={time_str}")
        return True
    except Exception as e:
        log_error(f"バックアップ設定の保存失敗: {e}")
        return False

# =====================================
# バックアップの新規作成
# =====================================
def create_backup() -> dict:
    try:
        os.makedirs(BACKUP_DIR, exist_ok=True)
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_{stamp}.zip"
        backup_path = os.path.join(BACKUP_DIR, backup_filename)

        # 1. データベース情報をJSON形式でエクスポート
        db_data = []
        conn = None
        try:
            conn = get_db_connection()
            with conn.cursor() as cur:
                cur.execute("SELECT id, username, password_hash, email, role, mfa_secret, mfa_enabled, created_at FROM users")
                rows = cur.fetchall()
                for row in rows:
                    db_data.append({
                        "id": row["id"],
                        "username": row["username"],
                        "password_hash": row["password_hash"],
                        "email": row["email"],
                        "role": row["role"],
                        "mfa_secret": row["mfa_secret"],
                        "mfa_enabled": row["mfa_enabled"],
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None
                    })
        except Exception as db_err:
            log_error(f"バックアップ中DBダンプ失敗: {db_err}")
        finally:
            if conn:
                conn.close()

        # 2. 一時的にエクスポートしたJSONを保存
        temp_db_file = os.path.join(UPLOAD_DIR, "_temp_db_backup.json")
        with open(temp_db_file, "w", encoding="utf-8") as f:
            json.dump(db_data, f, ensure_ascii=False, indent=2)

        # 3. ZIPファイルに圧縮
        with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zf:
            # DBのJSONを追加
            zf.write(temp_db_file, "db_backup.json")

            # uploads配下のユーザーファイルを再帰的に追加
            for root, dirs, files in os.walk(UPLOAD_DIR):
                for file in files:
                    # 一時ファイルや設定ファイルは除外
                    if file.startswith("_temp_") or file == "_backup_settings.json":
                        continue
                    
                    full_path = os.path.join(root, file)
                    # ZIP内での相対パス
                    rel_path = os.path.relpath(full_path, start=os.path.dirname(UPLOAD_DIR))
                    zf.write(full_path, rel_path)

        # 4. 一時ファイルのクリーンアップ
        if os.path.exists(temp_db_file):
            os.remove(temp_db_file)

        # 出来上がったファイルサイズを取得
        size_bytes = os.path.getsize(backup_path)
        log_success("SYSTEM", f"BACKUP_CREATED: {backup_filename} ({size_bytes} bytes)")
        
        return {
            "success": True,
            "filename": backup_filename,
            "size": _format_size(size_bytes),
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    except Exception as e:
        log_error(f"バックアップ作成失敗: {e}")
        return {"success": False, "detail": str(e)}

# =====================================
# バックアップ一覧取得・削除
# =====================================
def list_backups() -> list:
    if not os.path.exists(BACKUP_DIR):
        return []
    
    backups = []
    try:
        for f in os.listdir(BACKUP_DIR):
            full_path = os.path.join(BACKUP_DIR, f)
            if os.path.isfile(full_path) and f.startswith("backup_") and f.endswith(".zip"):
                stat = os.stat(full_path)
                mtime = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M:%S")
                backups.append({
                    "filename": f,
                    "size": _format_size(stat.st_size),
                    "created_at": mtime
                })
        # 新しい順に並び替え
        backups.sort(key=lambda x: x["filename"], reverse=True)
    except Exception as e:
        log_error(f"バックアップ一覧の取得失敗: {e}")
    return backups

def delete_backup(filename: str) -> bool:
    try:
        # パストラバーサル防止サニタイズ
        safe_name = os.path.basename(filename)
        path = os.path.join(BACKUP_DIR, safe_name)
        if os.path.isfile(path):
            os.remove(path)
            log_success("SYSTEM", f"BACKUP_DELETED: {safe_name}")
            return True
        return False
    except Exception as e:
        log_error(f"バックアップ削除失敗: {e}")
        return False

# =====================================
# スケジューラースレッド処理
# =====================================
def start_backup_scheduler():
    t = threading.Thread(target=_scheduler_loop, daemon=True)
    t.start()

def _scheduler_loop():
    global _last_run_date
    log_success("SYSTEM", "BACKUP_SCHEDULER_STARTED")

    while True:
        try:
            settings = get_backup_settings()
            if settings.get("enabled"):
                now = datetime.now()
                current_time = now.strftime("%H:%M")
                current_date = now.strftime("%Y-%m-%d")

                # 設定時刻と一致し、かつ今日まだ実行していない場合に処理する
                if current_time == settings.get("time") and _last_run_date != current_date:
                    with _scheduler_lock:
                        # 二重実行ガード
                        if _last_run_date != current_date:
                            _last_run_date = current_date
                            log_success("SYSTEM", f"AUTO_BACKUP_TRIGGERED (time: {current_time})")
                            create_backup()
        except Exception as e:
            log_error(f"バックアップスケジューラーエラー: {e}")
        
        # 10秒ごとにチェック
        time.sleep(10)

def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 ** 2:
        return f"{round(size_bytes / 1024, 1)}KB"
    elif size_bytes < 1024 ** 3:
        return f"{round(size_bytes / (1024 ** 2), 1)}MB"
    else:
        return f"{round(size_bytes / (1024 ** 3), 2)}GB"
