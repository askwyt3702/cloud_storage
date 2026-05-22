# 権限確認
def check_permission(
    login_user_id,
    file_user_id
):

    return login_user_id == file_user_id