import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from schemas import StorageResponse, MessageResponse
from services.auth_service import get_current_user
from services.storage_service import calculate_storage

router = APIRouter()


# =====================================
# 容量取得API
#
# URL:
#   GET /storage
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/storage", response_model=StorageResponse)
def storage(current_user: str = Depends(get_current_user)):  # ← ①ここでログインユーザー（認証）を自動チェックします

    # ② 容量計算
    result = calculate_storage(current_user)

    return StorageResponse(
        success=True,
        user=current_user,
        used=result["used"],
        max=result["max"]
    )