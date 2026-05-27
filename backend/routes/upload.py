from fastapi import APIRouter, HTTPException, UploadFile, File

from backend.services.file_service import (
    sanitize_filename,     # ← ファイル名の無害化
    save_file              # ← ファイル保存
)

from backend.services.auth_service import (
    is_logged_in,          # ← 認証チェック
    get_current_user       # ← ログイン中ユーザー取得
)


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

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② ファイル名の無害化
    #    例: "../../etc/passwd" → "passwd" に変換
    safe_name = sanitize_filename(file.filename)

    if not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ③ ファイルの読み込み
    data = await file.read()


    # ④ ファイルの保存
    #    uploads/{username}/{filename} に保存される
    username = get_current_user()
    success = save_file(username, safe_name, data)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの保存に失敗しました"
        )


    return {
        "success": True,
        "user": username,
        "message": f"{safe_name} をアップロードしました"
    }
