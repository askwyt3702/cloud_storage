# =====================================
# 権限確認
#
# login_user_id
# ↓
# ログイン中ユーザー
#
# file_user_id
# ↓
# ファイル所有者
# =====================================
def check_permission(

    login_user_id,

    file_user_id

):

    # 同じユーザーならOK
    if (
        login_user_id
        ==
        file_user_id
    ):

        return True


    # 違うなら拒否
    return False
result = check_permission(
    1,
    2
)

print(result)