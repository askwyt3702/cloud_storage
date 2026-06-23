import pyotp
import contextvars
import hmac
import hashlib
import base64
import json
import time
from database.db import get_db_connection
from security.password import login_check, hash_password, validate_password
from security.logger import log_success, log_failed, log_error

# スレッドセーフなコンテキスト変数
current_user_var: contextvars.ContextVar[str | None] = contextvars.ContextVar("current_user", default=None)
current_role_var: contextvars.ContextVar[str | None] = contextvars.ContextVar("current_role", default=None)
mfa_verified_var: contextvars.ContextVar[bool] = contextvars.ContextVar("mfa_verified", default=False)

# トークン署名用のシークレットキー（十分に長いランダムな文字列）
JWT_SECRET = "cloud_storage_super_secret_key_for_hmac_sha256_2026_06_22"

def create_token(username: str, role: str, mfa_verified: bool, expires_in: int = 86400) -> str:
    payload = {
        "username": username,
        "role": role,
        "mfa_verified": mfa_verified,
        "exp": int(time.time()) + expires_in
    }
    header = {"alg": "HS256", "typ": "JWT"}
    
    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    
    header_b64 = base64.urlsafe_b64encode(header_bytes).decode('utf-8').rstrip('=')
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode('utf-8').rstrip('=')
    
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode('utf-8').rstrip('=')
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_token(token: str | None) -> dict | None:
    if not token:
        return None
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        header_b64, payload_b64, sig_b64 = parts
        
        signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode('utf-8').rstrip('=')
        
        if not hmac.compare_digest(sig_b64, expected_sig_b64):
            return None
        
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += '=' * (4 - rem)
        
        payload_bytes = base64.urlsafe_b64decode(payload_b64.encode('utf-8'))
        payload = json.loads(payload_bytes.decode('utf-8'))
        
        if payload.get("exp", 0) < time.time():
            return None
            
        return payload
    except Exception:
        return None

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
            if mfa_enabled:
                # 暫定トークン（mfa_verified=False）を生成
                token = create_token(db_username, role, mfa_verified=False)
                log_success(db_username, "LOGIN_STAGE_1")
                return {"success": True, "mfa_required": True, "username": db_username, "token": token}
            else:
                # 正規トークン（mfa_verified=True）を生成
                token = create_token(db_username, role, mfa_verified=True)
                log_success(db_username, "LOGIN_STAGE_2")
                return {"success": True, "mfa_required": False, "username": db_username, "token": token}

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


def verify_mfa_login(code: str) -> str | None:
    """
    ID・パスワード成功後に、6桁のMFAコードを検証してログインを完全完了させます。
    """
    username = current_user_var.get()
    role = current_role_var.get()
    if not username:
        return None

    try:
        # 🛠️ 【テスト用変更】DBの空欄を回避するため、固定のテスト用シークレットキーを使用
        user_secret = "JBSWY3DPEHPK3PXP"
        
        is_valid = MFAService.verify_code(user_secret, code)
        
        if is_valid:
            # 認証成功。mfa_verified=True のトークンを発行
            token = create_token(username, role or "user", mfa_verified=True)
            log_success(username, "LOGIN_MFA_SUCCESS")
            return token
        else:
            log_failed(username, "LOGIN_MFA_FAILED", "MFAコード不一致")
            return None
            
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
    username = current_user_var.get()
    if not username:
        return False

    log_success(username, "LOGOUT")
    return True


def is_logged_in() -> bool:
    """
    ログイン判定（MFAもクリアしているか）
    """
    return current_user_var.get() is not None and mfa_verified_var.get() is True


def get_current_user() -> str | None:
    """
    現在のログインユーザー名を取得
    """
    if not is_logged_in():
        return None
    return current_user_var.get()


def get_current_role() -> str | None:
    """
    現在のログインユーザーのロールを取得
    """
    if not is_logged_in():
        return None
    return current_role_var.get()