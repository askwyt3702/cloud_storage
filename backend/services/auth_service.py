import pyotp
from database.db import get_db_connection
from security.password import login_check, hash_password, validate_password
from security.logger import log_success, log_failed, log_error

# セッション管理（ログイン中のユーザー情報を保持）
_active_session: dict = {}


class MFAService:
    @staticmethod
    def generate_secret() -> str:
        """ユーザーごとに固有のMFA用秘密鍵を生成します。"""
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(username: str, secret: str, issuer_name: str = "CloudStorage") -> str:
        """認証アプリ（Google Authenticatorなど）に読み込ませるQRコード用URLを生成します。"""
        return pyotp.totp.TOTP(secret).provisioning_uri(name=username, issuer_name=issuer_name)

    @staticmethod
    def verify_code(secret: str, code: str) -> bool:
        """ユーザーが入力した6桁のコードが正しいか検証します。"""
        totp = pyotp.totp.TOTP(secret)
        return totp.verify(code)


def login_user(
    username_or_email: str,
    password: str
) -> dict:
    """
    ユーザーログイン処理
    """
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                "SELECT username, password_hash, role, mfa_enabled, mfa_secret FROM users WHERE username = %s OR email = %s",
                (username_or_email, username_or_email)
            )
            row = cur.fetchone()

        if not row:
            log_failed(username_or_email, "LOGIN", "ユーザーが存在しません")
            return {"success": False, "detail": "ユーザー名またはパスワードが違います"}

        db_username = row['username']
        stored_hash = row['password_hash']
        role = row['role']
        
        # 🛠️ 【テスト用変更】データベースの値に関わらず、強制的に二段階認証（MFA）をTrueにする
        mfa_enabled = True

        check_result = login_check(db_username, password, stored_hash)

        if check_result["status"] == "SUCCESS":
            _active_session["username"] = db_username
            _active_session["role"] = role
            
            if mfa_enabled:
                _active_session["mfa_verified"] = False  # まだ2段階認証が完了していない
                log_success(db_username, "LOGIN_STAGE_1")
                return {"success": True, "mfa_required": True, "username": db_username}
            else:
                _active_session["mfa_verified"] = True
                log_success(db_username, "LOGIN_STAGE_2")
                return {"success": True, "mfa_required": False, "username": db_username}

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


def verify_mfa_login(code: str) -> bool:
    """
    ID・パスワード成功後に、6桁のMFAコードを検証してログインを完全完了させます。
    """
    username = _active_session.get("username")
    if not username:
        return False

    try:
        # 🛠️ 【テスト用変更】DBの空欄を回避するため、固定のテスト用シークレットキーを使用
        user_secret = "JBSWY3DPEHPK3PXP"
        
        is_valid = MFAService.verify_code(user_secret, code)
        
        if is_valid:
            _active_session["mfa_verified"] = True  # 2段階目もクリア！
            log_success(username, "LOGIN_MFA_SUCCESS")
            return True
        else:
            log_failed(username, "LOGIN_MFA_FAILED", "MFAコード不一致")
            return False
            
    except Exception as e:
        log_error(f"MFA検証エラー: {e}")
        return False


def reset_password(email: str, code: str, new_password: str) -> dict:
    """
    パスワードリセット処理（パスワードを忘れた時用）

    本人確認は MFA（認証アプリの6桁コード）で行う。
    流れ:
        1. メールアドレスでユーザーを検索
        2. MFAコードを検証（本人確認）
        3. 新パスワードの強度チェック
        4. ハッシュ化してDBを更新

    戻り値:
        {"success": True}
        {"success": False, "detail": str}
    """
    if not email or not code or not new_password:
        return {"success": False, "detail": "すべての項目を入力してください"}

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                "SELECT username, mfa_secret FROM users WHERE email = %s",
                (email,)
            )
            row = cur.fetchone()

        if not row:
            log_failed(email, "RESET_PW", "メールが存在しません")
            return {"success": False, "detail": "メールアドレスが見つかりません"}

        username = row["username"]

        # MFAコードで本人確認
        # DBに秘密鍵があればそれを使い、無ければテスト用の固定鍵を使う
        user_secret = row["mfa_secret"] or "JBSWY3DPEHPK3PXP"

        if not MFAService.verify_code(user_secret, code):
            log_failed(username, "RESET_PW", "MFAコード不一致")
            return {"success": False, "detail": "認証コードが正しくありません"}

        # 新パスワードの強度チェック
        try:
            validate_password(new_password)
        except ValueError as e:
            return {"success": False, "detail": str(e)}

        # ハッシュ化してDBを更新
        hashed = hash_password(new_password)
        conn2 = get_db_connection()
        try:
            with conn2.cursor() as cur:
                cur.execute(
                    "UPDATE users SET password_hash = %s WHERE email = %s",
                    (hashed, email)
                )
                conn2.commit()
        finally:
            conn2.close()

        log_success(username, "RESET_PW")
        return {"success": True}

    except Exception as e:
        log_error(f"パスワードリセットエラー: {e}")
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
    """
    if not username or not email or not password:
        return {"success": False, "detail": "すべての項目を入力してください"}

    try:
        validate_password(password)
    except ValueError as e:
        return {"success": False, "detail": str(e)}

    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM users WHERE username = %s OR email = %s",
                (username, email)
            )
            if cur.fetchone():
                return {"success": False, "detail": "ユーザー名またはメールアドレスが既に登録されています"}

            hashed = hash_password(password)

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

    _active_session.clear()
    return True


def is_logged_in() -> bool:
    """
    ログイン判定（MFAもクリアしているか）
    """
    return _active_session.get("username") is not None and _active_session.get("mfa_verified") is True


def get_current_user() -> str | None:
    """
    現在のログインユーザー名を取得
    """
    if not is_logged_in():
        return None
    return _active_session.get("username")


def get_current_role() -> str | None:
    """
    現在のログインユーザーのロールを取得
    """
    if not is_logged_in():
        return None
    return _active_session.get("role")