import logging
from datetime import datetime

# =========================
# ログ設定
# =========================
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)


# =========================
# ベースログ関数
# =========================
def write_log(message: str, level: str = "INFO"):
    """
    汎用ログ関数
    level: INFO / WARNING / ERROR
    """

    if level == "INFO":
        logging.info(message)
    elif level == "WARNING":
        logging.warning(message)
    elif level == "ERROR":
        logging.error(message)
    else:
        logging.info(message)


# =========================
# 成功ログ
# =========================
def log_success(username: str, action: str = "LOGIN"):
    write_log(f"SUCCESS - {action} - user: {username}", "INFO")


# =========================
# 失敗ログ
# =========================
def log_failed(username: str, action: str = "LOGIN", reason: str = ""):
    msg = f"FAILED - {action} - user: {username}"
    if reason:
        msg += f" - reason: {reason}"
    write_log(msg, "WARNING")


# =========================
# ロックログ
# =========================
def log_locked(username: str):
    write_log(f"LOCKED - LOGIN ATTEMPT - user: {username}", "ERROR")


# =========================
# システムエラーログ
# =========================
def log_error(message: str):
    write_log(f"SYSTEM ERROR - {message}", "ERROR")