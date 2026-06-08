import bcrypt
import re
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

    if not re.search(r"[A-Z]", password):
        raise ValueError("大文字を含めてください")

    if not re.search(r"[a-z]", password):
        raise ValueError("小文字を含めてください")

    if not re.search(r"\d", password):
        raise ValueError("数字を含めてください")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("記号を含めてください")


# =========================
# ハッシュ化
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
def check_password(
    password: str,
    hashed: str
) -> bool:

    try:
        return bcrypt.checkpw(
            password.encode(),
            hashed.encode()
        )

    except Exception:
        return False


# =========================
# 認証
# =========================
def authenticate(
    password: str,
    stored_hash: str
) -> bool:

    return check_password(
        password,
        stored_hash
    )


# =========================
# ログイン失敗管理
# =========================

# username → [失敗回数, 最終試行時間]
login_attempts = {}

# username → ロックレベル
lock_levels = {}

MAX_ATTEMPTS = 5

LOCK_LEVELS = [
    timedelta(minutes=1),
    timedelta(minutes=5),
    timedelta(minutes=15),
    timedelta(minutes=30)
]


# =========================
# ロック時間取得
# =========================
def get_lock_time(username: str) -> timedelta:

    level = lock_levels.get(username, 0)

    if level >= len(LOCK_LEVELS):
        level = len(LOCK_LEVELS) - 1

    return LOCK_LEVELS[level]


# =========================
# 必要失敗回数取得
# =========================
def get_max_attempts(username: str) -> int:

    level = lock_levels.get(username, 0)

    # 初回のみ5回
    if level == 0:
        return MAX_ATTEMPTS

    # 2回目以降は1回
    return 1


# =========================
# ロック状態確認
# =========================
def is_locked(username: str) -> bool:

    if username not in login_attempts:
        return False

    attempts, last_time = login_attempts[username]

    lock_time = get_lock_time(username)

    if attempts >= get_max_attempts(username):

        # ロック解除
        if datetime.now() - last_time > lock_time:

            login_attempts[username] = [
                0,
                datetime.now()
            ]

            return False

        return True

    return False


# =========================
# 残りロック時間取得
# =========================
def get_lock_remaining(
    username: str
) -> int:

    if username not in login_attempts:
        return 0

    attempts, last_time = login_attempts[username]

    lock_time = get_lock_time(username)

    remaining = (
        lock_time -
        (datetime.now() - last_time)
    )

    return max(
        0,
        int(remaining.total_seconds())
    )


# =========================
# 失敗記録
# =========================
def record_failed_attempt(
    username: str
):

    if username not in login_attempts:

        login_attempts[username] = [
            1,
            datetime.now()
        ]

    else:

        login_attempts[username][0] += 1
        login_attempts[username][1] = datetime.now()

    attempts = login_attempts[username][0]

    if attempts >= get_max_attempts(username):

        lock_levels[username] = (
            lock_levels.get(username, 0) + 1
        )


# =========================
# 成功時リセット
# =========================
def reset_attempts(
    username: str
):

    if username in login_attempts:
        del login_attempts[username]

    if username in lock_levels:
        del lock_levels[username]


# =========================
# ログイン判定
# =========================
def login_check(
    username: str,
    password: str,
    stored_hash: str
) -> dict:

    if is_locked(username):

        return {
            "status": "LOCKED",
            "remaining_seconds":
            get_lock_remaining(username)
        }

    if authenticate(
        password,
        stored_hash
    ):

        reset_attempts(username)

        return {
            "status": "SUCCESS"
        }

    record_failed_attempt(username)

    return {
        "status": "FAILED"
    }