from fastapi import APIRouter


router = APIRouter()


# ==========================
# ログイン中ユーザー取得
# ==========================
@router.get("/me")
def get_user():

    return {

        "user": "admin"

    }