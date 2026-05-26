# =====================================
# 認証サービス
# ログイン判定を行う
# =====================================

def login_user(
    username,
    password
):

    # 仮ユーザー
    if (
        username == "admin"
        and
        password == "1234"
    ):

        return True


    return False