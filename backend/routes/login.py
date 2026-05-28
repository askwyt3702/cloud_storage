from fastapi import APIRouter, HTTPException

from backend.schemas import LoginRequest, RegisterRequest
from backend.services.auth_service import (
    login_user,
    logout_user,
    get_current_user,
    get_current_role,
    register_user
)

router = APIRouter()


# =====================================
# ログインAPI
#
# URL:
# POST /login
#
# パラメータ (JSON Body):
#   username_or_email : ユーザー名またはメールアドレス
#   password : パスワード
#
# エラー:
#   400 : 入力が空の場合、またはバリデーションエラー
#   401 : 認証失敗 (アカウントロック含む)
# =====================================
@router.post("/login")
def login(body: LoginRequest):

    # 入力チェック
    if not body.username_or_email or not body.password:
        raise HTTPException(
            status_code=400,
            detail="ユーザー名（またはメール）とパスワードを入力してください"
        )

    result = login_user(body.username_or_email, body.password)

    if result["success"]:
        return {
            "success": True,
            "user": result["username"],
            "message": "ログイン成功"
        }

    # 認証失敗
    raise HTTPException(
        status_code=401,
        detail=result["detail"]
    )


# =====================================
# 新規登録API
#
# URL:
# POST /register
#
# パラメータ (JSON Body):
#   username : ユーザー名
#   email    : メールアドレス
#   password : パスワード
#
# エラー:
#   400 : 入力不備、パスワードの強度不足、重複登録など
# =====================================
@router.post("/register")
def register(body: RegisterRequest):

    if not body.username or not body.email or not body.password:
        raise HTTPException(
            status_code=400,
            detail="すべての項目を入力してください"
        )

    result = register_user(body.username, body.email, body.password)

    if result["success"]:
        return {
            "success": True,
            "message": "ユーザー登録が完了しました"
        }

    raise HTTPException(
        status_code=400,
        detail=result["detail"]
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
    role = get_current_role()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="ログインしていません"
        )

    return {
        "success": True,
        "user": user,
        "role": role,
        "message": "ログイン中"
    }