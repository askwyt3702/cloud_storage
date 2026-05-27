import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.services.file_service import (
    get_file_path,
    file_exists,
    sanitize_filename,     # ← ファイル名の無害化
    list_files,            # ← ファイル一覧取得
    get_file_size          # ← ファイルサイズ取得
)

from backend.services.auth_service import (
    is_logged_in,          # ← 認証チェック
    get_current_user       # ← ログイン中ユーザー取得
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
# GET /files
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/files")
def get_files():

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "LIST", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② ファイル一覧取得（サイズ付き）
    current_user = get_current_user()

    files = [
        {
            "name": f,
            "size": _format_size(get_file_size(current_user, f))
        }
        for f in list_files(current_user)
    ]

    log_success(current_user, "LIST")

    return {
        "success": True,
        "user": current_user,
        "files": files
    }


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
#   403 : 権限なし（他人のファイル）
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
    #    ログインユーザーは自分のファイルのみアクセス可
    current_user = get_current_user()

    if not can_access("user", "read"):

        log_failed(current_user, "DOWNLOAD", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="このファイルにアクセスする権限がありません"
        )


    # ③ ファイル名の無害化
    #    例: "../../etc/passwd" → "passwd" に変換
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
#   403 : 権限なし（他人のファイル）
#   400 : ファイル名が不正
#   404 : ファイルが存在しない
#   500 : 削除処理に失敗した場合
# =====================================
@router.delete("/delete/{filename}")
def delete_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "DELETE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    #    ログインユーザーは自分のファイルのみ削除可
    current_user = get_current_user()

    if not can_access("user", "write"):

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

    return {
        "success": True,
        "user": current_user,
        "message": f"{safe_name} を削除しました"
    }


# =====================================
# 内部関数：ファイル削除実行
#
# 引数:
#   username : ユーザー名
#   filename : 削除対象ファイル名（無害化済み）
#
# 戻り値:
#   True  : 削除成功
#   False : 削除失敗
# =====================================
def _delete_file_from_storage(username: str, filename: str) -> bool:

    try:

        file_path = get_file_path(username, filename)
        os.remove(file_path)
        return True

    except Exception as e:

        # 失敗理由をログに記録
        log_error(f"ファイル削除失敗: {username}/{filename} - {e}")

        return False
