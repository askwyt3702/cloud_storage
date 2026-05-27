# =========================
# 権限定義（RBAC）
# =========================
PERMISSIONS = {
    "admin": [
        "read",
        "write",
        "delete",
        "manage_users",
        "view_logs"
    ],

    "user": [
        "read",
        "write"
    ],

    "guest": [
        "read"
    ]
}


# =========================
# ロール優先順位
# =========================
ROLE_LEVELS = {
    "guest": 1,
    "user": 2,
    "admin": 3
}


# =========================
# 基本ロールチェック
# =========================
def is_admin(role: str) -> bool:
    return role == "admin"


def is_user(role: str) -> bool:
    return role == "user"


def is_guest(role: str) -> bool:
    return role == "guest"


# =========================
# ロール存在確認
# =========================
def role_exists(role: str) -> bool:
    return role in ROLE_LEVELS


# =========================
# ロールレベルチェック
# =========================
def has_permission(role: str, target_role: str) -> bool:
    """
    自分より下位権限へアクセス可能
    """

    if not role_exists(role):
        return False

    if not role_exists(target_role):
        return False

    return ROLE_LEVELS[role] >= ROLE_LEVELS[target_role]


# =========================
# 操作ベース権限チェック
# =========================
def can_access(role: str, action: str) -> bool:

    if not role_exists(role):
        return False

    return action in PERMISSIONS.get(role, [])


# =========================
# 管理者専用チェック
# =========================
def can_manage_users(role: str) -> bool:
    return can_access(role, "manage_users")


# =========================
# ログ閲覧権限
# =========================
def can_view_logs(role: str) -> bool:
    return can_access(role, "view_logs")


# =========================
# 安全版アクセスチェック
# =========================
def safe_check(
    role: str,
    action: str,
    target_role: str = None
) -> bool:

    # ロール存在確認
    if not role_exists(role):
        return False

    # 操作権限確認
    if not can_access(role, action):
        return False

    # 対象ロール確認
    if target_role:
        return has_permission(role, target_role)

    return True


# =========================
# 権限一覧取得
# =========================
def get_permissions(role: str) -> list:

    if not role_exists(role):
        return []

    return PERMISSIONS.get(role, [])