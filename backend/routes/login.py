from fastapi import APIRouter, HTTPException
from backend.services.auth_service import (
    login_user,
    logout_user,
    get_current_user,
    verify_mfa_login  # 【追加】MFA検証関数をインポート
)

router = APIRouter()


# =====================================
# ログインAPI
# =====================================
@router.post("/login")
def login(username: str, password: str):
    # 入力チェック（空文字を弾く）
    if not username or not password:
        raise HTTPException(
            status_code=400,
            detail="ユーザー名とパスワードを入力してください"
        )

    # 💡 auth_service から結果を辞書型で受け取ります
    result = login_user(username, password)

    if result["success"]:
        # 💡 MFA（2段階認証）が必要な場合
        if result["mfa_required"]:
            return {
                "success": True,
                "mfa_required": True,
                "user": username,
                "message": "ID・パスワード認証成功。MFAコードを入力してください"
            }
        
        # 💡 MFAが不要（設定OFF）な場合はそのままログイン完了
        return {
            "success": True,
            "mfa_required": False,
            "user": username,      # ← 担当Aの追加をそのまま維持
            "message": "ログイン成功"
        }

    # 認証失敗は401エラーに統一
    raise HTTPException(
        status_code=401,
        detail="ユーザー名またはパスワードが違います"
    )


# =====================================
# 【新設】MFAコード検証API
#
# URL:
# POST /login/mfa
#
# パラメータ:
#   code : 画面から入力された6桁の数字
# =====================================
@router.post("/login/mfa")
def login_mfa(code: str):
    if not code:
        raise HTTPException(
            status_code=400,
            detail="認証コードを入力してください"
        )

    # 6桁のコードを検証
    is_valid = verify_mfa_login(code)

    if is_valid:
        return {
            "success": True,
            "message": "2段階認証に成功しました。ログイン完了です！"
        }

    # コードが間違っている場合
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