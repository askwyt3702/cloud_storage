from fastapi import APIRouter, HTTPException, Body  # ← 【修正】Body を追加インポート
from services.auth_service import (
    login_user,
    logout_user,
    get_current_user,
    verify_mfa_login
)

router = APIRouter()


# =====================================
# ログインAPI
# =====================================
@router.post("/login")
def login(username: str, password: str):
    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail="ユーザー名とパスワードを入力してください"
        )

    result = login_user(username, password)

    if result["success"]:
        if result["mfa_required"]:
            return {
                "success": True,
                "mfa_required": True,
                "user": username,
                "message": "ID・パスワード認証成功。MFAコードを入力してください"
            }
        
        return {
            "success": True,
            "mfa_required": False,
            "user": username,
            "message": "ログイン成功"
        }

    raise HTTPException(
        status_code=401,
        detail="ユーザー名またはパスワードが違います"
    )


# =====================================
# 【修正】MFAコード検証API
#
# URL:
# POST /login/mfa
# =====================================
@router.post("/login/mfa")
def login_mfa(code: str = Body(..., embed=True)):  # ← 【修正】Body(..., embed=True) を指定
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
# ログアウトAPI
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
# =====================================
@router.get("/me")
def me():
    user = get_current_user()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="ログインしていません（または2段階認証が未完了です）"
        )

    return {
        "success": True,
        "user": user,
        "message": "ログイン中"
    }