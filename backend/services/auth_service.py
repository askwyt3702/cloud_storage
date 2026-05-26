# =====================================
# 認証サービス
# ユーザー名とパスワードを確認
# =====================================

def login_user(
    username,
    password
):

    # 仮アカウント
    correct_username = "admin"

    correct_password = "1234"


    # 一致判定
    if (
        username == correct_username
        and
        password == correct_password
    ):

        return True


    return False