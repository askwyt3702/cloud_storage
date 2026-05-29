import os

from fastapi import APIRouter, HTTPException, UploadFile, File

from text
fromschemas import MessageResponse

from text
fromservices.file_service import (
    sanitize_filename,     # ← ファイル名の無害化
    save_file,             # ← ファイル保存
    file_exists            # ← 上書き防止チェック
)

from text
fromservices.auth_service import (
    is_logged_in,          # ← 認証チェック
    get_current_user       # ← ログイン中ユーザー取得
)

from security.logger import (
    log_success,   # ← 成功ログ
    log_failed,    # ← 失敗ログ
)

from text
fromservices.storage_service import (
    get_used_bytes         # ← 使用量チェック
)


# =====================================
# アップロード制限の定数
# =====================================

# 総容量上限：10GB
MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024

# 1ファイルの上限：100MB
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

# アップロード許可する拡張子
ALLOWED_EXTENSIONS = {
    ".pdf", ".txt", ".csv",
    ".jpg", ".jpeg", ".png", ".gif",
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".zip", ".mp4", ".mp3"
}


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
#   409 : 同名ファイルが存在する
#   413 : ファイルサイズ超過 / 容量不足
#   415 : 許可されていないファイル形式
#   500 : 保存処理に失敗した場合
# =====================================
@router.post("/upload", response_model=MessageResponse)
async def upload_file(file: UploadFile = File(...)):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "UPLOAD", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )

    username = get_current_user()

    # ② ファイル名の無害化
    #    例: "../../etc/passwd" → "passwd" に変換
    safe_name = sanitize_filename(file.filename)

    if not safe_name:

        log_failed(username, "UPLOAD", f"不正なファイル名: {file.filename}")

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ③ ファイル形式チェック
    #    許可されていない拡張子はブロック
    ext = os.path.splitext(safe_name)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:

        log_failed(username, "UPLOAD", f"許可されていない形式: {ext}")

        raise HTTPException(
            status_code=415,
            detail=f"このファイル形式は許可されていません: {ext}"
        )


    # ④ 上書き防止チェック
    #    同名ファイルが既にある場合は拒否
    if file_exists(username, safe_name):

        log_failed(username, "UPLOAD", f"同名ファイルあり: {safe_name}")

        raise HTTPException(
            status_code=409,
            detail=f"同名のファイルが既に存在します: {safe_name}"
        )


    # ⑤ ファイルの読み込み
    data = await file.read()


    # ⑥ 1ファイルサイズチェック（100MB上限）
    if len(data) > MAX_FILE_SIZE_BYTES:

        log_failed(username, "UPLOAD", f"ファイルサイズ超過: {len(data)}bytes")

        raise HTTPException(
            status_code=413,
            detail="1ファイルの上限は100MBです"
        )


    # ⑦ 総容量チェック（10GB上限）
    used_bytes = get_used_bytes(username)

    if used_bytes + len(data) > MAX_STORAGE_BYTES:

        log_failed(username, "UPLOAD", "総容量不足")

        raise HTTPException(
            status_code=413,
            detail="容量が足りません（上限10GB）"
        )


    # ⑧ ファイルの保存
    success = save_file(username, safe_name, data)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの保存に失敗しました"
        )


    log_success(username, f"UPLOAD: {safe_name}")

    return MessageResponse(
        success=True,
        user=username,
        message=f"{safe_name} をアップロードしました"
    )
