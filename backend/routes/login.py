from fastapi import APIRouter
from backend.services.auth_service import (
    login_user
)

router = APIRouter()


@router.post("/login")
def login(

    username: str,

    password: str

):

    result = login_user(
        username,
        password
    )


    if result:

        return {

            "success": True,

            # ←追加
            "user": username,

            "message": "ログイン成功"

        }


    return {

        "success": False,

        "message": "失敗"

    }