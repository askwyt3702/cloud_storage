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