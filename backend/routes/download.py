import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.services.file_service import (
    get_file_path,
    file_exists,
    sanitize_filename      # ← ファイル名の無害化
)

from backend.services.auth_service import (
    is_logged_in           # ← 認証チェック
)


router = APIRouter()


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
#   400 : ファイル名が不正
#   404 : ファイルが存在しない
# =====================================
@router.get("/download/{filename}")
def download_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② ファイル名の無害化
    #    例: "../../etc/passwd" → "passwd" に変換
    safe_name = sanitize_filename(filename)

    if not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ③ ファイルの存在チェック
    if not file_exists(safe_name):

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {safe_name}"
        )


    # ④ ダウンロード実行
    file_path = get_file_path(safe_name)

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
#   400 : ファイル名が不正
#   404 : ファイルが存在しない
#   500 : 削除処理に失敗した場合
# =====================================
@router.delete("/delete/{filename}")
def delete_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② ファイル名の無害化
    safe_name = sanitize_filename(filename)

    if not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ③ ファイルの存在チェック
    if not file_exists(safe_name):

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {safe_name}"
        )


    # ④ 削除実行
    success = _delete_file_from_storage(safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの削除に失敗しました"
        )


    return {
        "success": True,
        "user": None,
        "message": f"{safe_name} を削除しました"
    }


# =====================================
# 内部関数：ファイル削除実行
#
# 引数:
#   filename : 削除対象ファイル名（無害化済み）
#
# 戻り値:
#   True  : 削除成功
#   False : 削除失敗
# =====================================
def _delete_file_from_storage(filename: str) -> bool:

    try:

        file_path = get_file_path(filename)
        os.remove(file_path)
        return True

    except Exception:

        return False