from fastapi import APIRouter, HTTPException, Body

from backend.schemas import LoginRequest, RegisterRequest, ResetPasswordRequest
from backend.services.auth_service import (
    login_user,
    logout_user,
    get_current_user,
    get_current_role,
    register_user,
    verify_mfa_login,
    reset_password
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
        # MFA（2段階認証）が必要な場合
        if result["mfa_required"]:
            return {
                "success": True,
                "mfa_required": True,
                "user": result["username"],
                "message": "ID・パスワード認証成功。MFAコードを入力してください"
            }

        # MFA不要な場合はそのままログイン完了
        return {
            "success": True,
            "mfa_required": False,
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
# MFAコード検証API
#
# URL:
# POST /login/mfa
# =====================================
@router.post("/login/mfa")
def login_mfa(code: str = Body(..., embed=True)):
    if not code:
        raise HTTPException(
            status_code=400,
            detail="認証コードを入力してください"
        )

    is_valid = verify_mfa_login(code)

    if is_valid:
        return {
            "success": True,
            "message": "2段階認証に成功しました。ログイン完了です！"
        }

    raise HTTPException(
        status_code=401,
        detail="認証コードが正しくないか、有効期限が切れています"
    )


# =====================================
# パスワードリセットAPI（パスワードを忘れた時）
#
# URL:
# POST /reset-password
#
# パラメータ (JSON Body):
#   email        : 登録メールアドレス
#   code         : MFA（認証アプリ）の6桁コード
#   new_password : 新しいパスワード
#
# エラー:
#   400 : 入力不備 / コード不一致 / パスワード強度不足 / メールなし
# =====================================
@router.post("/reset-password")
def reset_pw(body: ResetPasswordRequest):

    result = reset_password(body.email, body.code, body.new_password)

    if result["success"]:
        return {
            "success": True,
            "message": "パスワードを変更しました。新しいパスワードでログインしてください"
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
            detail="ログインしていません（または2段階認証が未完了です）"
        )

    return {
        "success": True,
        "user": user,
        "role": role,
        "message": "ログイン中"
    }
