from fastapi import APIRouter

# 認証関数を読み込む
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

    # 認証処理実行
    result = login_user(
        username,
        password
    )


    if result:

        return {
            "success": True,
            "message": "ログイン成功"
        }


    return {

        "success": False,

        "message": "ユーザー名またはパスワード違います"

    }


# =====================================
# ログアウト
# =====================================
@router.post("/logout")
def logout():

    return {

        "success": True

    }