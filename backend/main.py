import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# FastAPI起動
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ログインAPI
from routes.login import (
    router as login_router
)

# 容量API
from routes.storage import (
    router as storage_router
)

# ダウンロード・削除API  ← 担当B追加
from routes.download import (
    router as download_router
)

# アップロードAPI
from routes.upload import (
    router as upload_router
)


# アプリ作成
app = FastAPI()

# ==========================
# CORS設定
# フロントエンドからのアクセスを許可
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# トップ画面 → ログイン画面にリダイレクト
# ==========================
@app.get("/")
def home():
    return RedirectResponse(url="/static/login.html")


# ログイン機能追加
app.include_router(
    login_router
)

# 容量機能追加
app.include_router(
    storage_router
)

# ダウンロード・削除機能追加  ← 担当B追加
app.include_router(
    download_router
)


# アップロード機能追加
app.include_router(
    upload_router
)


# ==========================
# フロントエンドの配信
# frontend/ フォルダを /static として公開
# ==========================
app.mount(
    "/static",
    StaticFiles(directory="../frontend"),
    name="static"
)