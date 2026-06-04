import logging
from logging.handlers import RotatingFileHandler

# =========================

# ログ設定

# =========================

logger = logging.getLogger(__name__)

logger.setLevel(logging.INFO)

handler = RotatingFileHandler(
"app.log",
maxBytes=1024 * 1024,  # 1MB
backupCount=5,
encoding="utf-8"
)

formatter = logging.Formatter(
"%(asctime)s - %(levelname)s - %(message)s"
)

handler.setFormatter(formatter)

if not logger.handlers:
 logger.addHandler(handler)

# =========================

# ベースログ関数

# =========================

def write_log(message: str, level: str = "INFO"):



 if level == "INFO":
    logger.info(message)

 elif level == "WARNING":
    logger.warning(message)

 elif level == "ERROR":
    logger.error(message)

 else:
    logger.info(message)


# =========================

# 成功ログ

# =========================

def log_success(username: str, action: str = "LOGIN"):
 write_log(
f"SUCCESS - {action} - user: {username}",
"INFO"
)

# =========================

# 失敗ログ

# =========================

def log_failed(
 username: str,
 action: str = "LOGIN",
 reason: str = ""
 ):
 msg = f"FAILED - {action} - user: {username}"


 if reason:
    msg += f" - reason: {reason}"

 write_log(msg, "WARNING")


# =========================

# ロックログ

# =========================

def log_locked(username: str):
 write_log(
f"LOCKED - LOGIN ATTEMPT - user: {username}",
"ERROR"
)

# =========================

# システムエラーログ

# =========================

def log_error(message: str):
 write_log(
f"SYSTEM ERROR - {message}",
"ERROR"
)
