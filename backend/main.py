import sys
import os

# プロジェクトのルート（このファイルの2つ上 = cloud_storage）
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# FastAPI起動
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

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

# 共有リンクAPI（ギガファイル便方式）cd backend
from backend.routes.link import (
    router as link_router
)

# バックアップ管理API & スケジューラー
from backend.routes.backup import (
    router as backup_router
)
from backend.services.backup_service import start_backup_scheduler

# ゴミ箱自動削除スケジューラ（保持期間切れを定期削除）
from backend.services.file_service import start_trash_scheduler

# 認証用の contextvars と検証関数のインポート
from backend.services.auth_service import (
    verify_token,
    current_user_var,
    current_role_var,
    mfa_verified_var
)

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

# HTTPミドルウェアでリクエストごとにCookieから認証情報を復元し、contextvarsに設定する
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    token = request.cookies.get("access_token")
    payload = verify_token(token)
    
    if payload:
        username = payload.get("username")
        role = payload.get("role")
        mfa_verified = payload.get("mfa_verified", False)
    else:
        username = None
        role = None
        mfa_verified = False
        
    # contextvars のスレッド/タスクローカル設定
    token_user = current_user_var.set(username)
    token_role = current_role_var.set(role)
    token_mfa = mfa_verified_var.set(mfa_verified)
    
    try:
        response = await call_next(request)
        return response
    finally:
        # リクエスト終了後にクリーンアップ
        current_user_var.reset(token_user)
        current_role_var.reset(token_role)
        mfa_verified_var.reset(token_mfa)


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

# 起動時に自動バックアップ監視スレッド＆ゴミ箱自動削除スレッドを開始
@app.on_event("startup")
def startup_event():
    start_backup_scheduler()
    start_trash_scheduler()


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