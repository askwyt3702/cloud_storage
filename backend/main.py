# FastAPI起動
from fastapi import FastAPI

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

from backend.routes.user import (
    router as user_router
)

# アップロードAPI  ← 担当A実装後に有効化
# from backend.routes.upload import (
#     router as upload_router
# )


# アプリ作成
app = FastAPI()


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

app.include_router(
    user_router
)

# アップロード機能追加  ← 担当A実装後に有効化
# app.include_router(
#     upload_router
# )