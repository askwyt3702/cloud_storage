# =====================================
# 認証サービス
# ユーザー名とパスワードを確認
# =====================================

# セッション管理（ログイン中のユーザーを保持）
# { username: str } の形で保存
# 本番環境ではRedisやDBに置き換えること
_active_session: dict = {}


def login_user(
    username: str,
    password: str
) -> bool:

    # 仮アカウント
    correct_username = "admin"

    correct_password = "1234"


    # 一致判定
    if (
        username == correct_username
        and
        password == correct_password
    ):

        # セッションにユーザーを登録
        _active_session["username"] = username

        return True


    return False


# =====================================
# ログアウト処理
# セッションからユーザーを削除する
#
# 戻り値:
#   True  : ログアウト成功
#   False : そもそもログインしていなかった
# =====================================
def logout_user() -> bool:

    if "username" not in _active_session:

        return False


    # セッション削除
    _active_session.clear()

    return True


# =====================================
# ログイン済みチェック
# download/deleteなどで呼び出す
#
# 戻り値:
#   True  : ログイン済み
#   False : 未ログイン
# =====================================
def is_logged_in() -> bool:

    return "username" in _active_session


# =====================================
# 現在のログインユーザー名を取得
#
# 戻り値:
#   ユーザー名（str）
#   未ログインの場合は None
# =====================================
def get_current_user() -> str | None:

    return _active_session.get("username")