from fastapi import APIRouter
router = APIRouter()
# ==========================
# 容量取得API
#
# URL:
# GET /storage
# ==========================
@router.get("/storage")
def storage():

    # 仮データ
    return {
        # 使用量
        "used": "3GB",
        # 最大容量
        "max": "10GB"}