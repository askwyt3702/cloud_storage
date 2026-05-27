from fastapi import APIRouter, HTTPException, UploadFile, File

from backend.services.file_service import (
    sanitize_filename,     # ← ファイル名の無害化
    save_file              # ← ファイル保存
)

from backend.services.auth_service import (
    is_logged_in,          # ← 認証チェック
    get_current_user       # ← ログイン中ユーザー取得
)

from security.logger import (
    log_success,   # ← 成功ログ
    log_failed,    # ← 失敗ログ
    log_error      # ← エラーログ
)

from backend.services.storage_service import (
    get_used_bytes          # ← 使用量チェック
)

# 最大容量：10GB
MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024


router = APIRouter()


# =====================================
# ファイルアップロードAPI
#
# URL:
# POST /upload
#
# パラメータ:
#   file : アップロードするファイル
#
# エラー:
#   401 : 未ログイン
#   400 : ファイル名が不正
#   500 : 保存処理に失敗した場合
# =====================================
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "UPLOAD", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② ファイル名の無害化
    #    例: "../../etc/passwd" → "passwd" に変換
    username = get_current_user()
    safe_name = sanitize_filename(file.filename)

    if not safe_name:

        log_failed(username, "UPLOAD", f"不正なファイル名: {file.filename}")

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ③ ファイルの読み込み
    data = await file.read()


    # ④ 容量制限チェック
    #    現在の使用量 + 新ファイルが 10GB を超えたら拒否
    used_bytes = get_used_bytes(username)

    if used_bytes + len(data) > MAX_STORAGE_BYTES:

        log_failed(username, "UPLOAD", "容量不足")

        raise HTTPException(
            status_code=413,
            detail="容量が足りません（上限10GB）"
        )


    # ⑤ ファイルの保存
    #    uploads/{username}/{filename} に保存される
    success = save_file(username, safe_name, data)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの保存に失敗しました"
        )


    log_success(username, f"UPLOAD: {safe_name}")

    return {
        "success": True,
        "user": username,
        "message": f"{safe_name} をアップロードしました"
    }
