# FastAPI起動
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ログインAPI
from backend.routes.login import (
    router as login_router
)

# 容量API
from backend.routes.storage import (
    router as storage_router
)

# ダウンロード・削除API  ← 担当B追加
from backend.routes.download import (
    router as download_router
)

# user.py はルートなし（現在未使用）
# from backend.routes.user import (
#     router as user_router
# )

# アップロードAPI
from backend.routes.upload import (
    router as upload_router
)


# アプリ作成
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# トップ画面
# ==========================
@app.get("/")
def home():

    return """
    <h1>クラウドストレージ</h1>

    <input placeholder='ユーザー名'>

    <br><br>

    <input
    type='password'
    placeholder='パスワード'>

    <br><br>

    <button>
    ログイン
    </button>
    """


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