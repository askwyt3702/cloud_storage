from fastapi import APIRouter, HTTPException

from backend.services.auth_service import (
    login_user,
    logout_user,
    get_current_user
)

router = APIRouter()


# =====================================
# ログインAPI
#
# URL:
# POST /login
#
# パラメータ:
#   username : ユーザー名
#   password : パスワード
#
# エラー:
#   400 : 入力が空の場合
#   401 : 認証失敗
# =====================================
@router.post("/login")
def login(

    username: str,

    password: str

):

    # 入力チェック（空文字を弾く）
    if not username or not password:

        raise HTTPException(
            status_code=400,
            detail="ユーザー名とパスワードを入力してください"
        )


    result = login_user(username, password)


    if result:

        return {
            "success": True,
            "user": username,      # ← 担当Aの追加をそのまま維持
            "message": "ログイン成功"
        }


    # 認証失敗は401エラーに統一
    raise HTTPException(
        status_code=401,
        detail="ユーザー名またはパスワードが違います"
    )


# =====================================
# ログアウトAPI
#
# URL:
# POST /logout
#
# エラー:
#   400 : 未ログイン状態でのログアウト
# =====================================
@router.post("/logout")
def logout():

    success = logout_user()


    if not success:

        raise HTTPException(
            status_code=400,
            detail="ログインしていません"
        )


    return {
        "success": True,
        "user": None,
        "message": "ログアウトしました"
    }


# =====================================
# ログイン状態確認API（デバッグ用）
#
# URL:
# GET /me
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/me")
def me():

    user = get_current_user()


    if not user:

        raise HTTPException(
            status_code=401,
            detail="ログインしていません"
        )


    return {
        "success": True,
        "user": user,
        "message": "ログイン中"
    }