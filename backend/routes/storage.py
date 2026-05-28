from fastapi import APIRouter, HTTPException

from backend.schemas import StorageResponse

from backend.services.auth_service import (
    is_logged_in,          # ← 認証チェック
    get_current_user       # ← ログイン中ユーザー取得
)

from backend.services.storage_service import (
    calculate_storage      # ← 容量計算
)


router = APIRouter()


# =====================================
# 容量取得API
#
# URL:
# GET /storage
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/storage", response_model=StorageResponse)
def storage():

    # ① 認証チェック
    if not is_logged_in():

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 容量計算
    current_user = get_current_user()
    result = calculate_storage(current_user)

    return StorageResponse(
        success=True,
        user=current_user,
        used=result["used"],
        max=result["max"]
    )
