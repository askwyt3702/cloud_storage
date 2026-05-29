import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from schemas import (
    FileInfo,
    FileListResponse,
    MessageResponse,
    RenameRequest
)

from services.file_service import (
    get_file_path,
    file_exists,
    sanitize_filename,
    list_files,      # ファイル名の無害化
    get_file_size,    # ファイル一覧取得
    get_file_metadata # ファイルサイズ取得
)     # ← メタデータ取得


from services.auth_service import (
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
    log_error      # ← エラーログ
)


router = APIRouter()


# =====================================
# 内部関数：バイトを読みやすい単位に変換
#
# 例:
#   500      → "500B"
#   1500     → "1.5KB"
#   2000000  → "1.9MB"
# =====================================
def _format_size(size_bytes: int) -> str:

    if size_bytes < 1024:
        return f"{size_bytes}B"

    elif size_bytes < 1024 ** 2:
        return f"{round(size_bytes / 1024, 1)}KB"

    elif size_bytes < 1024 ** 3:
        return f"{round(size_bytes / (1024 ** 2), 1)}MB"

    else:
        return f"{round(size_bytes / (1024 ** 3), 2)}GB"


# =====================================
# ファイル一覧取得API
#
# URL:
# GET /files?page=1&per_page=20
#
# クエリパラメータ:
#   page     : ページ番号（デフォルト: 1）
#   per_page : 1ページの件数（デフォルト: 20）
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/files", response_model=FileListResponse)
def get_files(page: int = 1, per_page: int = 20):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "LIST", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 全ファイル取得
    current_user = get_current_user()
    all_files = list_files(current_user)
    total = len(all_files)


    # ③ ページネーション
    #    例: page=2, per_page=20 → 21件目〜40件目
    start = (page - 1) * per_page
    end = start + per_page
    paged_files = all_files[start:end]


    # ④ メタデータ付きで整形
    files_info = [
        FileInfo(
            name=f,
            size=_format_size(get_file_size(current_user, f)),
            **get_file_metadata(current_user, f)
        )
        for f in paged_files
    ]

    log_success(current_user, "LIST")

    return FileListResponse(
        success=True,
        user=current_user,
        files=files_info,
        total=total,
        page=page,
        per_page=per_page
    )


# =====================================
# ファイルダウンロードAPI
#
# URL:
# GET /download/{filename}
#
# パラメータ:
#   filename : ダウンロードするファイル名
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : ファイル名が不正
#   404 : ファイルが存在しない
# =====================================
@router.get("/download/{filename}")
def download_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "DOWNLOAD", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "read"):

        log_failed(current_user, "DOWNLOAD", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="このファイルにアクセスする権限がありません"
        )


    # ③ ファイル名の無害化
    safe_name = sanitize_filename(filename)

    if not safe_name:

        log_failed(current_user, "DOWNLOAD", f"不正なファイル名: {filename}")

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ ファイルの存在チェック
    if not file_exists(current_user, safe_name):

        log_failed(current_user, "DOWNLOAD", f"ファイルなし: {safe_name}")

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {safe_name}"
        )


    # ⑤ ダウンロード実行
    file_path = get_file_path(current_user, safe_name)

    log_success(current_user, f"DOWNLOAD: {safe_name}")

    return FileResponse(
        path=file_path,
        filename=safe_name,
        media_type="application/octet-stream"
    )


# =====================================
# ファイル削除API
#
# URL:
# DELETE /delete/{filename}
#
# パラメータ:
#   filename : 削除するファイル名
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : ファイル名が不正
#   404 : ファイルが存在しない
#   500 : 削除処理に失敗した場合
# =====================================
@router.delete("/delete/{filename}", response_model=MessageResponse)
def delete_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "DELETE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "write"):

        log_failed(current_user, "DELETE", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="このファイルを削除する権限がありません"
        )


    # ③ ファイル名の無害化
    safe_name = sanitize_filename(filename)

    if not safe_name:

        log_failed(current_user, "DELETE", f"不正なファイル名: {filename}")

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ ファイルの存在チェック
    if not file_exists(current_user, safe_name):

        log_failed(current_user, "DELETE", f"ファイルなし: {safe_name}")

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {safe_name}"
        )


    # ⑤ 削除実行
    success = _delete_file_from_storage(current_user, safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの削除に失敗しました"
        )


    log_success(current_user, f"DELETE: {safe_name}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_name} を削除しました"
    )


# =====================================
# ファイルリネームAPI
#
# URL:
# PATCH /rename/{filename}
#
# パラメータ:
#   filename : 変更前のファイル名
#   body     : { "new_name": "変更後のファイル名" }
#
# エラー:
#   401 : 未ログイン
#   400 : ファイル名が不正
#   404 : ファイルが存在しない
#   409 : 変更後の名前が既に存在する
#   500 : リネーム処理に失敗した場合
# =====================================
@router.patch("/rename/{filename}", response_model=MessageResponse)
def rename_file(filename: str, body: RenameRequest):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "RENAME", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )

    current_user = get_current_user()
    role = get_current_role()

    # ② 権限チェック
    if not can_access(role, "write"):

        log_failed(current_user, "RENAME", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルを変更する権限がありません"
        )


    # ② 変更前ファイル名の無害化
    safe_old = sanitize_filename(filename)

    if not safe_old:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ③ 変更後ファイル名の無害化
    safe_new = sanitize_filename(body.new_name)

    if not safe_new:

        raise HTTPException(
            status_code=400,
            detail="変更後のファイル名が不正です"
        )


    # ④ 変更前ファイルの存在チェック
    if not file_exists(current_user, safe_old):

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {safe_old}"
        )


    # ⑤ 変更後ファイル名の重複チェック
    if file_exists(current_user, safe_new):

        raise HTTPException(
            status_code=409,
            detail=f"同名のファイルが既に存在します: {safe_new}"
        )


    # ⑥ リネーム実行
    try:

        old_path = get_file_path(current_user, safe_old)
        new_path = get_file_path(current_user, safe_new)
        os.rename(old_path, new_path)

    except Exception as e:

        log_error(f"リネーム失敗: {current_user}/{safe_old} → {safe_new} - {e}")

        raise HTTPException(
            status_code=500,
            detail="リネームに失敗しました"
        )


    log_success(current_user, f"RENAME: {safe_old} → {safe_new}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_old} を {safe_new} に変更しました"
    )


# =====================================
# 内部関数：ファイル削除実行
# =====================================
def _delete_file_from_storage(username: str, filename: str) -> bool:

    try:

        file_path = get_file_path(username, filename)
        os.remove(file_path)
        return True

    except Exception as e:

        log_error(f"ファイル削除失敗: {username}/{filename} - {e}")

        return False
