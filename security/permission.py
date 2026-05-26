
# =========================
# 権限定義（RBAC）
# =========================
PERMISSIONS = {
    "admin": ["read", "write", "delete", "manage_users"],
    "user": ["read", "write"],
    "guest": ["read"]
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
# ロールレベルチェック（強化版）
# =========================
def has_permission(role: str, target_role: str) -> bool:
    """
    role: 現在のユーザー権限
    target_role: アクセス対象の権限
    """

    # 管理者はすべて許可
    if role == "admin":
        return True

    # 同じレベルのみ許可
    return role == target_role


# =========================
# 操作ベース権限チェック（メイン）
# =========================
def can_access(role: str, action: str) -> bool:
    """
    action: read / write / delete など
    """

    return action in PERMISSIONS.get(role, [])


# =========================
# 管理機能チェック（強化）
# =========================
def can_manage_users(role: str) -> bool:
    return role == "admin"


# =========================
# 追加：安全版アクセスチェック（おすすめ）
# =========================
def safe_check(role: str, action: str, target_role: str = None) -> bool:
    """
    まとめチェック関数
    - 操作権限
    - ロール制御
    """

    # 管理者はすべてOK
    if role == "admin":
        return True

    # ロール制御がある場合
    if target_role and role != target_role:
        return False

    # 操作チェック
    return action in PERMISSIONS.get(role, [])