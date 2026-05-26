from fastapi import APIRouter

# 認証サービス読み込み
from backend.services.auth_service import (
    login_user
)


router = APIRouter()


# =====================================
# ログインAPI
# =====================================
@router.post("/login")
def login(

    username: str,

    password: str

):

    # 認証実行
    result = login_user(
        username,
        password
    )


    # 成功
    if result:

        return {

            "success": True,

            "message": "ログイン成功"

        }


    # 失敗
    return {

        "success": False,

        "message": "ユーザー名またはパスワードが違います"

    }


# =====================================
# ログアウト
# =====================================
@router.post("/logout")
def logout():

    return {

        "success": True

    }