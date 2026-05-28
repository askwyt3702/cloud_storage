# =====================================
# 認証サービス
# ユーザー名とパスワードを確認（PostgreSQL & bcrypt対応）
# =====================================

from database.db import get_db_connection
from security.password import login_check, hash_password, validate_password
from security.logger import log_success, log_failed, log_error

# セッション管理（ログイン中のユーザー情報を保持）
# { "username": str, "role": str } の形で保存
# 本番環境ではRedisやDBに置き換えること
_active_session: dict = {}


def login_user(
    username_or_email: str,
    password: str
) -> dict:
    """
    ユーザーログイン処理
    戻り値:
        {"success": True, "username": str}
        {"success": False, "detail": str}
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # ユーザー名またはメールアドレスで検索
            cur.execute(
                "SELECT username, password_hash, role FROM users WHERE username = %s OR email = %s",
                (username_or_email, username_or_email)
            )
            row = cur.fetchone()

        if not row:
            log_failed(username_or_email, "LOGIN", "ユーザーが存在しません")
            return {"success": False, "detail": "ユーザー名またはパスワードが違います"}

        db_username = row['username']
        stored_hash = row['password_hash']
        role = row['role']

        # パスワードとロックアウト状態のチェック
        check_result = login_check(db_username, password, stored_hash)

        if check_result["status"] == "SUCCESS":
            # セッションにユーザー情報を登録
            _active_session["username"] = db_username
            _active_session["role"] = role
            log_success(db_username, "LOGIN")
            return {"success": True, "username": db_username}

        elif check_result["status"] == "LOCKED":
            log_failed(db_username, "LOGIN", f"アカウントロック中 (残り {check_result['remaining_seconds']} 秒)")
            return {
                "success": False,
                "detail": f"アカウントが一時的にロックされています。残り時間: {check_result['remaining_seconds']}秒"
            }
        else:
            log_failed(db_username, "LOGIN", "パスワードが違います")
            return {"success": False, "detail": "ユーザー名またはパスワードが違います"}

    except Exception as e:
        log_error(f"ログイン処理エラー: {e}")
        return {"success": False, "detail": f"システムエラーが発生しました: {e}"}
    finally:
        if conn:
            conn.close()


def register_user(
    username: str,
    email: str,
    password: str
) -> dict:
    """
    ユーザー新規登録処理
    戻り値:
        {"success": True}
        {"success": False, "detail": str}
    """
    if not username or not email or not password:
        return {"success": False, "detail": "すべての項目を入力してください"}

    # パスワード強度チェック
    try:
        validate_password(password)
    except ValueError as e:
        return {"success": False, "detail": str(e)}

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # 重複チェック (ユーザー名またはメールアドレス)
            cur.execute(
                "SELECT id FROM users WHERE username = %s OR email = %s",
                (username, email)
            )
            if cur.fetchone():
                return {"success": False, "detail": "ユーザー名またはメールアドレスが既に登録されています"}

            # パスワードをハッシュ化して保存
            hashed = hash_password(password)

            # 新規ユーザーインサート (デフォルトロール: 'user')
            cur.execute(
                "INSERT INTO users (username, email, password_hash, role) VALUES (%s, %s, %s, 'user')",
                (username, email, hashed)
            )
            conn.commit()

        log_success(username, "REGISTER")
        return {"success": True}

    except Exception as e:
        if conn:
            conn.rollback()
        log_error(f"ユーザー登録エラー: {e}")
        return {"success": False, "detail": f"システムエラーが発生しました: {e}"}
    finally:
        if conn:
            conn.close()


def logout_user() -> bool:
    """
    ログアウト処理
    """
    if "username" not in _active_session:
        return False

    # セッション削除
    _active_session.clear()
    return True


def is_logged_in() -> bool:
    """
    ログイン判定
    """
    return "username" in _active_session


def get_current_user() -> str | None:
    """
    現在のログインユーザー名を取得
    """
    return _active_session.get("username")


def get_current_role() -> str | None:
    """
    現在のログインユーザーのロールを取得
    """
    return _active_session.get("role")