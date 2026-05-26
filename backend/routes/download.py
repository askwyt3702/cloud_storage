from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

# ファイル操作サービスを読み込む
from backend.services.file_service import (
    get_file_path,
    file_exists
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
#   404 : ファイルが存在しない場合
# =====================================
@router.get("/download/{filename}")
def download_file(filename: str):

    # ファイルの存在チェック
    if not file_exists(filename):

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {filename}"
        )

    # ファイルパスを取得
    file_path = get_file_path(filename)

    # ファイルをレスポンスとして返す
    return FileResponse(
        path=file_path,
        filename=filename,
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
#   404 : ファイルが存在しない場合
#   500 : 削除処理に失敗した場合
# =====================================
@router.delete("/delete/{filename}")
def delete_file(filename: str):

    # ファイルの存在チェック
    if not file_exists(filename):

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {filename}"
        )

    # ファイル削除処理
    success = _delete_file_from_storage(filename)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの削除に失敗しました"
        )

    return {
        "success": True,
        "message": f"{filename} を削除しました"
    }


# =====================================
# 内部関数：ファイル削除実行
#
# 引数:
#   filename : 削除対象ファイル名
#
# 戻り値:
#   True  : 削除成功
#   False : 削除失敗
# =====================================
def _delete_file_from_storage(filename: str) -> bool:

    import os

    try:

        file_path = get_file_path(filename)
        os.remove(file_path)
        return True

    except Exception:

        return False