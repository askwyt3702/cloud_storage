# FastAPI起動
from fastapi import FastAPI


# API読み込み
from backend.routes.login import router as login_router

from backend.routes.storage import router as storage_router


# アプリ作成
app = FastAPI()


# ==========================
# ログイン機能追加
# ==========================
app.include_router(
    login_router
)


# ==========================
# 容量機能追加
# ==========================
app.include_router(
    storage_router
)