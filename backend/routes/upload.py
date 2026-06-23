import os
import re

from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from backend.schemas import MessageResponse

from backend.services.file_service import (
    sanitize_filename,     # ← ファイル名の無害化
    sanitize_path,         # ← フォルダパスの無害化
    folder_exists,         # ← フォルダ存在チェック
    save_file,             # ← ファイル保存
    file_exists,           # ← 上書き防止チェック
    save_chunk,            # ← チャンク一時保存
    assemble_chunks,       # ← チャンク結合
    cleanup_temp_chunks,   # ← チャンククリーンアップ
    get_temp_chunks_size   # ← チャンクサイズ取得
)

from backend.services.auth_service import (
    is_logged_in,          # ← 認証チェック
    get_current_user,      # ← ログイン中ユーザー取得
    get_current_role       # ← ログイン中ユーザーのロール取得
)

from security.permission import (
    can_access             # ← 権限チェック
)

from security.logger import (
    log_success,   # ← 成功ログ
    log_failed,    # ← 失敗ログ
)

from backend.services.storage_service import (
    get_used_bytes         # ← 使用量チェック
)

from backend.services.settings_service import send_notification


# =====================================
# アップロード制限の定数
# =====================================

# 総容量上限：10GB
MAX_STORAGE_BYTES = 10 * 1024 * 1024 * 1024

# 1ファイルの上限：100MB
MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024

# アップロード許可する拡張子
# 方針：中身が「素直なデータファイル」で安全なものだけを許可（ホワイトリスト）。
#       スクリプトを埋め込める .svg や、実行ファイル系（.exe/.bat等）は意図的に除外。
ALLOWED_EXTENSIONS = {
    # --- 文書 ---
    ".pdf", ".txt", ".csv",
    # --- 画像 ---
    ".jpg", ".jpeg", ".jfif", ".png", ".gif",
    ".webp", ".bmp", ".tif", ".tiff", ".heic", ".heif",
    # --- Office ---
    ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    # --- 音声 ---
    ".mp3", ".wav", ".m4a", ".aac",
    # --- 動画 ---
    ".mp4", ".mov", ".webm",
    # --- 圧縮 ---
    ".zip"
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
async def upload_file(
    file: UploadFile = File(...),
    path: str = Form("")
):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "UPLOAD", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )

    username = get_current_user()
    role = get_current_role()

    # ② 権限チェック
    if not can_access(role, "write"):

        log_failed(username, "UPLOAD", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルをアップロードする権限がありません"
        )

    # ② ファイル名・アップロード先パスの無害化
    #    例: "../../etc/passwd" → "passwd" に変換
    safe_name = sanitize_filename(file.filename)
    safe_path = sanitize_path(path)

    if not safe_name or safe_path is None:

        log_failed(username, "UPLOAD", f"不正なファイル名/パス: {path}/{file.filename}")

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )

    # ②-2 アップロード先フォルダが存在するか（ルートは常にOK）
    if safe_path and not folder_exists(username, safe_path):

        log_failed(username, "UPLOAD", f"アップロード先フォルダなし: {safe_path}")

        raise HTTPException(
            status_code=404,
            detail="アップロード先のフォルダが見つかりません"
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
    if file_exists(username, safe_name, safe_path):

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
    success = save_file(username, safe_name, data, safe_path)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの保存に失敗しました"
        )


    log_success(username, f"UPLOAD: {safe_name}")

    try:
        size_kb = round(len(data) / 1024, 1)
        size_str = f"{size_kb} KB" if size_kb < 1024 else f"{round(size_kb / 1024, 2)} MB"
        send_notification(
            username=username,
            event_type="upload",
            message=f"ファイル `{safe_name}` ({size_str}) がアップロードされました。",
            title="📥 ファイルアップロード"
        )
    except Exception as e:
        from security.logger import log_error
        log_error(f"アップロード通知の送信失敗: {e}")

    return MessageResponse(
        success=True,
        user=username,
        message=f"{safe_name} をアップロードしました"
    )


# =====================================
# チャンク分割アップロードAPI
#
# URL:
# POST /upload/chunk
#
# パラメータ (Form):
#   file        : チャンクのファイルデータ
#   path        : 保存先のフォルダ相対パス (Form)
#   filename    : 元のファイル名 (Form)
#   chunkNumber : チャンク番号 (Form)
#   totalChunks : 総チャンク数 (Form)
#   identifier  : ファイルの一意の識別子 (Form)
# =====================================
@router.post("/upload/chunk", response_model=MessageResponse)
async def upload_chunk(
    file: UploadFile = File(...),
    path: str = Form(""),
    filename: str = Form(...),
    chunk_number: int = Form(..., alias="chunkNumber"),
    total_chunks: int = Form(..., alias="totalChunks"),
    identifier: str = Form(...)
):
    # ① 認証チェック
    if not is_logged_in():
        log_failed("不明", "UPLOAD_CHUNK", "未ログイン")
        raise HTTPException(status_code=401, detail="ログインが必要です")

    username = get_current_user()
    role = get_current_role()

    # ② 権限チェック
    if not can_access(role, "write"):
        log_failed(username, "UPLOAD_CHUNK", "権限なし")
        raise HTTPException(status_code=403, detail="ファイルをアップロードする権限がありません")

    # ③ パラメータの無害化
    safe_name = sanitize_filename(filename)
    safe_path = sanitize_path(path)

    # identifierのサニタイズ（英数字、ハイフン、アンダースコアのみ許可）
    safe_id = re.sub(r"[^a-zA-Z0-9_-]", "", identifier)

    if not safe_name or safe_path is None or not safe_id:
        log_failed(username, "UPLOAD_CHUNK", f"不正なファイル名/パス/ID: {path}/{filename}")
        raise HTTPException(status_code=400, detail="ファイル名や識別子が不正です")

    # フォルダの存在チェック
    if safe_path and not folder_exists(username, safe_path):
        log_failed(username, "UPLOAD_CHUNK", f"アップロード先フォルダなし: {safe_path}")
        raise HTTPException(status_code=404, detail="アップロード先のフォルダが見つかりません")

    # 拡張子チェック
    ext = os.path.splitext(safe_name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        log_failed(username, "UPLOAD_CHUNK", f"許可されていない形式: {ext}")
        raise HTTPException(status_code=415, detail=f"このファイル形式は許可されていません: {ext}")

    # 上書きチェック（最初のチャンクの段階で既にファイルが存在するかチェック）
    if chunk_number == 1 and file_exists(username, safe_name, safe_path):
        log_failed(username, "UPLOAD_CHUNK", f"同名ファイルあり: {safe_name}")
        raise HTTPException(status_code=409, detail=f"同名のファイルが既に存在します: {safe_name}")

    # ④ データの読み込み
    data = await file.read()

    # ⑤ チャンクデータの保存
    success = save_chunk(username, safe_id, chunk_number, data)
    if not success:
        cleanup_temp_chunks(username, safe_id)
        raise HTTPException(status_code=500, detail="チャンクの保存に失敗しました")

    # ⑥ 最後のチャンクの場合のみ結合処理を行う
    if chunk_number == total_chunks:
        # 一時保存されているチャンクの合算サイズ（バイト）を取得
        total_size = get_temp_chunks_size(username, safe_id)
        
        # 総容量上限チェック（10GB）
        used_bytes = get_used_bytes(username)
        if used_bytes + total_size > MAX_STORAGE_BYTES:
            cleanup_temp_chunks(username, safe_id)
            log_failed(username, "UPLOAD_CHUNK", "総容量不足")
            raise HTTPException(status_code=413, detail="容量が足りません（上限10GB）")

        # 結合実行
        assemble_success = assemble_chunks(username, safe_id, total_chunks, safe_name, safe_path)
        if not assemble_success:
            cleanup_temp_chunks(username, safe_id)
            raise HTTPException(status_code=500, detail="ファイルの結合に失敗しました")

        log_success(username, f"UPLOAD_CHUNK_ASSEMBLED: {safe_name} ({total_size} bytes)")

        # Webhook通知送信
        try:
            size_kb = round(total_size / 1024, 1)
            size_str = f"{size_kb} KB" if size_kb < 1024 else f"{round(size_kb / 1024, 2)} MB"
            send_notification(
                username=username,
                event_type="upload",
                message=f"大容量ファイル `{safe_name}` ({size_str}) が分割アップロードされ、正常に結合されました。",
                title="📥 ファイルアップロード (分割)"
            )
        except Exception as e:
            from security.logger import log_error
            log_error(f"アップロード通知の送信失敗: {e}")

        return MessageResponse(
            success=True,
            user=username,
            message=f"{safe_name} のアップロードと結合が完了しました"
        )

    # 最終チャンク以外は「受け取り完了」を返すだけ
    return MessageResponse(
        success=True,
        user=username,
        message=f"チャンク {chunk_number}/{total_chunks} を受信しました"
    )
