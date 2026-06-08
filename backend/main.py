import sys
import os

# プロジェクトのルート（このファイルの2つ上 = cloud_storage）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# FastAPI起動
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # 💡 【追加】StaticFilesのインポート

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

# アップロードAPI
from backend.routes.upload import (
    router as upload_router
)

# 共有リンクAPI（ギガファイル便方式）
from backend.routes.link import (
    router as link_router
)

# バックアップ管理API & スケジューラー
from backend.routes.backup import (
    router as backup_router
)
from backend.services.backup_service import start_backup_scheduler

# 通知設定API
from backend.routes.settings import (
    router as settings_router
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

# 共有リンク機能追加
app.include_router(
    link_router
)

# バックアップ機能追加
app.include_router(
    backup_router
)

# 設定機能追加
app.include_router(
    settings_router
)

# 起動時に自動バックアップ監視スレッドを開始
@app.on_event("startup")
def startup_event():
    start_backup_scheduler()


# ==========================
# フロントエンドの配信
# frontend/ フォルダを /static として公開
# ※ 絶対パスにして、どのフォルダから起動しても動くようにする
# ==========================
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE_DIR, "frontend")),
    name="static"
)