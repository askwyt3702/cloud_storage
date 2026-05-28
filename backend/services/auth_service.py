import pyotp
from database.db import get_db_connection  # データベース接続用の関数をインポート

# セッション管理（ログイン中のユーザーを保持）
# MFA用に状態を持てるように拡張します
# { "username": str, "mfa_verified": bool }
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


# =====================================
# 認証サービス（ログイン処理）
# =====================================
def login_user(username: str, password: str) -> dict:
    """
    ユーザー名とパスワードを確認します。
    
    戻り値 (dict):
        {
            "success": bool,        # ログイン自体の成否
            "mfa_required": bool    # MFA（2段階認証）が必要かどうか
        }
    """
    # 📝 班の皆さんでテストしやすいよう、仮アカウント（admin）のロジックも残しています。
    # 将来的にデータベースから本物のユーザーを引っ張る場合はここを書き換えます。
    correct_username = "admin"
    correct_password = "1234"

    if username == correct_username and password == correct_password:
        # セッションに一旦ユーザー名を登録（ただしMFAはまだ未完了状態）
        _active_session["username"] = username
        
        # 💡 ここでデータベースを確認し、MFAが有効（TRUE）かどうかを判定します
        # 今回は初期状態として、有効な場合はTrue、未設定ならFalseを返す想定にします
        mfa_enabled = False  # テスト用に最初はFalse（DB連携時はここをDBの値に変えます）
        
        if mfa_enabled:
            _active_session["mfa_verified"] = False  # まだ2段階目が終わっていない
            return {"success": True, "mfa_required": True}
        else:
            _active_session["mfa_verified"] = True   # MFA不要なのでログイン完了
            return {"success": True, "mfa_required": False}

    return {"success": False, "mfa_required": False}


# =====================================
# MFA（2段階認証）のコード検証
# =====================================
def verify_mfa_login(code: str) -> bool:
    """
    ID・パスワード成功後に、6桁のMFAコードを検証してログインを完全完了させます。
    """
    username = _active_session.get("username")
    if not username:
        return False

    # 本来はここでデータベースから該当ユーザーの「mfa_secret」を取得します
    # 例: conn = get_db_connection() ... 
    # 今回はテスト用に仮のシークレットキーで検証する流れを想定します
    # user_secret = "DBから取得したシークレットキー"
    
    # テスト用（仮のキーでの検証ロジック）
    # 実際はここにユーザー固有の鍵が入ります
    user_secret = pyotp.random_base32() 

    is_valid = MFAService.verify_code(user_secret, code)
    if is_valid:
        _active_session["mfa_verified"] = True  # 2段階目もクリア！
        return True
    
    return False


# =====================================
# ログアウト処理
# =====================================
def logout_user() -> bool:
    if "username" not in _active_session:
        return False

    _active_session.clear()
    return True


# =====================================
# ログイン済みチェック（MFAもクリアしているか）
# =====================================
def is_logged_in() -> bool:
    # ユーザー名が存在し、かつMFA認証も完了している場合のみ「ログイン中」とみなす！
    return _active_session.get("username") is not None and _active_session.get("mfa_verified") is True


# =====================================
# 現在のログインユーザー名を取得
# =====================================
def get_current_user() -> str | None:
    if not is_logged_in():
        return None
    return _active_session.get("username")