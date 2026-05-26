import bcrypt
from datetime import datetime, timedelta

# =========================
# パスワード強度チェック
# =========================
def validate_password(password: str) -> None:
    if not password:
        raise ValueError("パスワードが空です")

    if len(password) < 8:
        raise ValueError("パスワードは8文字以上必要です")

    if password.isdigit():
        raise ValueError("数字のみのパスワードは不可です")


# =========================
# ハッシュ化（保存用）
# =========================
def hash_password(password: str) -> str:
    validate_password(password)

    hashed = bcrypt.hashpw(
        password.encode(),
        bcrypt.gensalt()
    )
    return hashed.decode()


# =========================
# パスワード照合
# =========================
def check_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode(),
            hashed.encode()
        )
    except Exception:
        return False


# =========================
# 認証統合
# =========================
def authenticate(password: str, stored_hash: str) -> bool:
    return check_password(password, stored_hash)


# =========================
# 不正アクセス対策（強化版）
# =========================

# username → [失敗回数, 最終試行時間]
login_attempts = {}

MAX_ATTEMPTS = 5
LOCK_TIME = timedelta(minutes=10)


def is_locked(username: str) -> bool:
    if username not in login_attempts:
        return False

    attempts, last_time = login_attempts[username]

    # ロック時間が過ぎたら自動解除
    if datetime.now() - last_time > LOCK_TIME:
        del login_attempts[username]
        return False

    return attempts >= MAX_ATTEMPTS


def record_failed_attempt(username: str):
    if username not in login_attempts:
        login_attempts[username] = [1, datetime.now()]
    else:
        login_attempts[username][0] += 1
        login_attempts[username][1] = datetime.now()


def reset_attempts(username: str):
    if username in login_attempts:
        del login_attempts[username]


# =========================
# 追加：安全なログイン判定統合
# =========================
def login_check(username: str, password: str, stored_hash: str) -> str:
    """
    戻り値:
    SUCCESS / FAILED / LOCKED
    """

    if is_locked(username):
        return "LOCKED"

    if authenticate(password, stored_hash):
        reset_attempts(username)
        return "SUCCESS"

    record_failed_attempt(username)
    return "FAILED"