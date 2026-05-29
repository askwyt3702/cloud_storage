import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from schemas import (
    FileInfo,
    FileListResponse,
    MessageResponse,
    RenameRequest,
    BulkDeleteRequest,     # ← 一括削除リクエスト
    BulkActionResponse,    # ← 一括操作レスポンス
    TrashFileInfo,         # ← ゴミ箱内ファイル情報
    TrashListResponse,     # ← ゴミ箱一覧レスポンス
    SharedFileInfo,        # ← 共有ファイル情報
    SharedListResponse     # ← 共有ファイル一覧レスポンス
)

from services.file_service import (
    get_file_path,
    file_exists,
    sanitize_filename,     # ← ファイル名の無害化
    list_files,            # ← ファイル一覧取得
    get_file_size,         # ← ファイルサイズ取得
    get_file_mtime,        # ← 更新日時取得（並び替え用）
    get_file_metadata,     # ← メタデータ取得
    # --- ゴミ箱関連 ---
    move_to_trash,             # ← ゴミ箱へ移動（論理削除）
    list_trash,                # ← ゴミ箱一覧
    trash_file_exists,         # ← ゴミ箱に存在するか
    get_trash_file_size,       # ← ゴミ箱内ファイルのサイズ
    get_trash_file_metadata,   # ← ゴミ箱内ファイルのメタデータ
    restore_from_trash,        # ← ゴミ箱から復元
    delete_from_trash,         # ← ゴミ箱から完全削除
    empty_trash,               # ← ゴミ箱を空にする
    # --- 共有フォルダ関連 ---
    share_file,                # ← 個人ファイルを共有
    unshare_file,              # ← 共有を解除
    list_shared,               # ← 共有ファイル一覧（全員分）
    shared_file_exists,        # ← 共有に存在するか
    get_shared_file_path,      # ← 共有ファイルのパス
    get_shared_file_size,      # ← 共有ファイルのサイズ
    get_shared_file_metadata   # ← 共有ファイルのメタデータ
)


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
# GET /files?page=1&per_page=20&sort_by=name&order=asc
#
# クエリパラメータ:
#   page     : ページ番号（デフォルト: 1）
#   per_page : 1ページの件数（デフォルト: 20）
#   sort_by  : 並び替えの基準 name(名前) / date(日付) / size(サイズ)
#   order    : 並び順 asc(昇順) / desc(降順)
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/files", response_model=FileListResponse)
def get_files(
    page: int = 1,
    per_page: int = 20,
    sort_by: str = "name",
    order: str = "asc"
):

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


    # ③ 並び替え
    #    desc（降順）かどうか
    reverse = (order == "desc")

    if sort_by == "size":
        # サイズ順
        all_files.sort(
            key=lambda f: get_file_size(current_user, f),
            reverse=reverse
        )

    elif sort_by == "date":
        # 更新日時順
        all_files.sort(
            key=lambda f: get_file_mtime(current_user, f),
            reverse=reverse
        )

    else:
        # 名前順（大文字小文字を区別しない）
        all_files.sort(
            key=lambda f: f.lower(),
            reverse=reverse
        )


    # ④ ページネーション
    #    例: page=2, per_page=20 → 21件目〜40件目
    start = (page - 1) * per_page
    end = start + per_page
    paged_files = all_files[start:end]


    # ⑤ メタデータ付きで整形
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
# ファイル削除API（ゴミ箱へ移動＝論理削除）
#
# 即座に消すのではなく、ゴミ箱（.trash）へ移動する。
# 完全に消したい場合は DELETE /trash/{filename} を使う。
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


    # ⑤ ゴミ箱へ移動
    success = move_to_trash(current_user, safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの削除に失敗しました"
        )


    log_success(current_user, f"TRASH: {safe_name}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_name} をゴミ箱に移動しました"
    )


# =====================================
# ファイル一括削除API（まとめてゴミ箱へ）
#
# URL:
# POST /delete-multiple
#
# リクエストボディ:
#   { "filenames": ["a.txt", "b.pdf", ...] }
#
# レスポンス:
#   succeeded : ゴミ箱へ移動できたファイル
#   failed    : 失敗したファイル（存在しない・不正な名前など）
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
# =====================================
@router.post("/delete-multiple", response_model=BulkActionResponse)
def delete_multiple(body: BulkDeleteRequest):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "BULK_DELETE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "write"):

        log_failed(current_user, "BULK_DELETE", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルを削除する権限がありません"
        )


    # ③ 1件ずつゴミ箱へ移動
    succeeded = []
    failed = []

    for name in body.filenames:

        safe_name = sanitize_filename(name)

        # 名前が不正、または存在しないものは失敗扱い
        if not safe_name or not file_exists(current_user, safe_name):

            failed.append(name)
            continue

        if move_to_trash(current_user, safe_name):
            succeeded.append(safe_name)
        else:
            failed.append(name)


    log_success(current_user, f"BULK_DELETE: 成功{len(succeeded)}件 / 失敗{len(failed)}件")

    return BulkActionResponse(
        success=True,
        user=current_user,
        succeeded=succeeded,
        failed=failed,
        message=f"{len(succeeded)}件をゴミ箱に移動しました"
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


# =====================================================
# ここから下：ゴミ箱（.trash）操作API
# =====================================================


# =====================================
# ゴミ箱一覧取得API
#
# URL:
# GET /trash
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/trash", response_model=TrashListResponse)
def get_trash():

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "TRASH_LIST", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② ゴミ箱の中身を取得
    current_user = get_current_user()
    trash_files = list_trash(current_user)


    # ③ メタデータ付きで整形
    files_info = [
        TrashFileInfo(
            name=f,
            size=_format_size(get_trash_file_size(current_user, f)),
            **get_trash_file_metadata(current_user, f)
        )
        for f in trash_files
    ]

    log_success(current_user, "TRASH_LIST")

    return TrashListResponse(
        success=True,
        user=current_user,
        files=files_info,
        total=len(trash_files)
    )


# =====================================
# ゴミ箱からの復元API
#
# URL:
# POST /restore/{filename}
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : ファイル名が不正
#   404 : ゴミ箱に存在しない
#   409 : 同名のファイルが既に存在する
#   500 : 復元処理に失敗した場合
# =====================================
@router.post("/restore/{filename}", response_model=MessageResponse)
def restore_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "RESTORE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "write"):

        log_failed(current_user, "RESTORE", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルを復元する権限がありません"
        )


    # ③ ファイル名の無害化
    safe_name = sanitize_filename(filename)

    if not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ ゴミ箱に存在するか
    if not trash_file_exists(current_user, safe_name):

        log_failed(current_user, "RESTORE", f"ゴミ箱にファイルなし: {safe_name}")

        raise HTTPException(
            status_code=404,
            detail=f"ゴミ箱にファイルが見つかりません: {safe_name}"
        )


    # ⑤ 復元先に同名ファイルが無いか（あると上書きしてしまうので拒否）
    if file_exists(current_user, safe_name):

        raise HTTPException(
            status_code=409,
            detail=f"同名のファイルが既に存在するため復元できません: {safe_name}"
        )


    # ⑥ 復元実行
    success = restore_from_trash(current_user, safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの復元に失敗しました"
        )


    log_success(current_user, f"RESTORE: {safe_name}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_name} を復元しました"
    )


# =====================================
# ゴミ箱内ファイルの完全削除API（復元不可）
#
# URL:
# DELETE /trash/{filename}
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : ファイル名が不正
#   404 : ゴミ箱に存在しない
#   500 : 削除処理に失敗した場合
# =====================================
@router.delete("/trash/{filename}", response_model=MessageResponse)
def delete_trash_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "TRASH_DELETE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "write"):

        log_failed(current_user, "TRASH_DELETE", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルを削除する権限がありません"
        )


    # ③ ファイル名の無害化
    safe_name = sanitize_filename(filename)

    if not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ ゴミ箱に存在するか
    if not trash_file_exists(current_user, safe_name):

        raise HTTPException(
            status_code=404,
            detail=f"ゴミ箱にファイルが見つかりません: {safe_name}"
        )


    # ⑤ 完全削除実行
    success = delete_from_trash(current_user, safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="ファイルの完全削除に失敗しました"
        )


    log_success(current_user, f"TRASH_DELETE: {safe_name}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_name} を完全に削除しました"
    )


# =====================================
# ゴミ箱を空にするAPI（全件完全削除）
#
# URL:
# DELETE /trash
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
# =====================================
@router.delete("/trash", response_model=MessageResponse)
def empty_trash_all():

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "TRASH_EMPTY", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "write"):

        log_failed(current_user, "TRASH_EMPTY", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ゴミ箱を空にする権限がありません"
        )


    # ③ 全件完全削除
    count = empty_trash(current_user)

    log_success(current_user, f"TRASH_EMPTY: {count}件")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"ゴミ箱を空にしました（{count}件）"
    )


# =====================================================
# ここから下：共有フォルダ（_shared）操作API
# =====================================================


# =====================================
# 共有ファイル一覧取得API（全員分）
#
# URL:
# GET /shared
#
# ログインしていれば、誰が共有したファイルでも一覧で見られる。
#
# エラー:
#   401 : 未ログイン
# =====================================
@router.get("/shared", response_model=SharedListResponse)
def get_shared():

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "SHARED_LIST", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 共有ファイルを取得
    current_user = get_current_user()
    shared_files = list_shared()


    # ③ メタデータ付きで整形
    files_info = [
        SharedFileInfo(
            owner=item["owner"],
            name=item["name"],
            size=_format_size(
                get_shared_file_size(item["owner"], item["name"])
            ),
            **get_shared_file_metadata(item["owner"], item["name"])
        )
        for item in shared_files
    ]

    log_success(current_user, "SHARED_LIST")

    return SharedListResponse(
        success=True,
        files=files_info,
        total=len(files_info)
    )


# =====================================
# 共有ファイルのダウンロードAPI
#
# URL:
# GET /shared/download/{owner}/{filename}
#
# ログインしていれば、他人が共有したファイルもダウンロードできる。
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : 名前が不正
#   404 : 共有ファイルが存在しない
# =====================================
@router.get("/shared/download/{owner}/{filename}")
def download_shared_file(owner: str, filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "SHARED_DOWNLOAD", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック（読み取り）
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "read"):

        log_failed(current_user, "SHARED_DOWNLOAD", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルをダウンロードする権限がありません"
        )


    # ③ 名前の無害化（所有者名・ファイル名どちらも）
    safe_owner = sanitize_filename(owner)
    safe_name = sanitize_filename(filename)

    if not safe_owner or not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ 共有ファイルの存在チェック
    if not shared_file_exists(safe_owner, safe_name):

        log_failed(current_user, "SHARED_DOWNLOAD", f"共有ファイルなし: {safe_owner}/{safe_name}")

        raise HTTPException(
            status_code=404,
            detail=f"共有ファイルが見つかりません: {safe_name}"
        )


    # ⑤ ダウンロード実行
    file_path = get_shared_file_path(safe_owner, safe_name)

    log_success(current_user, f"SHARED_DOWNLOAD: {safe_owner}/{safe_name}")

    return FileResponse(
        path=file_path,
        filename=safe_name,
        media_type="application/octet-stream"
    )


# =====================================
# ファイル共有API（自分の個人ファイルを共有フォルダへ）
#
# URL:
# POST /share/{filename}
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : ファイル名が不正
#   404 : 個人ファイルが存在しない
#   409 : 既に共有済み
#   500 : 共有処理に失敗した場合
# =====================================
@router.post("/share/{filename}", response_model=MessageResponse)
def share_my_file(filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "SHARE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()

    if not can_access(role, "write"):

        log_failed(current_user, "SHARE", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="ファイルを共有する権限がありません"
        )


    # ③ ファイル名の無害化
    safe_name = sanitize_filename(filename)

    if not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ 自分の個人ファイルが存在するか
    if not file_exists(current_user, safe_name):

        raise HTTPException(
            status_code=404,
            detail=f"ファイルが見つかりません: {safe_name}"
        )


    # ⑤ 既に共有済みでないか
    if shared_file_exists(current_user, safe_name):

        raise HTTPException(
            status_code=409,
            detail=f"このファイルは既に共有されています: {safe_name}"
        )


    # ⑥ 共有実行
    success = share_file(current_user, safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="共有に失敗しました"
        )


    log_success(current_user, f"SHARE: {safe_name}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_name} を共有しました"
    )


# =====================================
# 共有解除API（自分が共有したファイルのみ）
#
# URL:
# DELETE /shared/{owner}/{filename}
#
# 他人が共有したファイルは解除できない（owner が自分のときだけ）。
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし / 他人の共有を解除しようとした
#   400 : 名前が不正
#   404 : 共有ファイルが存在しない
#   500 : 解除処理に失敗した場合
# =====================================
@router.delete("/shared/{owner}/{filename}", response_model=MessageResponse)
def unshare_my_file(owner: str, filename: str):

    # ① 認証チェック
    if not is_logged_in():

        log_failed("不明", "UNSHARE", "未ログイン")

        raise HTTPException(
            status_code=401,
            detail="ログインが必要です"
        )


    current_user = get_current_user()
    role = get_current_role()


    # ② 権限チェック
    if not can_access(role, "write"):

        log_failed(current_user, "UNSHARE", "権限なし")

        raise HTTPException(
            status_code=403,
            detail="共有を解除する権限がありません"
        )


    # ③ 名前の無害化
    safe_owner = sanitize_filename(owner)
    safe_name = sanitize_filename(filename)

    if not safe_owner or not safe_name:

        raise HTTPException(
            status_code=400,
            detail="ファイル名が不正です"
        )


    # ④ 自分が共有したファイルか（他人のものは解除不可）
    if safe_owner != current_user:

        log_failed(current_user, "UNSHARE", f"他人の共有を解除しようとした: {safe_owner}/{safe_name}")

        raise HTTPException(
            status_code=403,
            detail="他の人が共有したファイルは解除できません"
        )


    # ⑤ 共有ファイルの存在チェック
    if not shared_file_exists(safe_owner, safe_name):

        raise HTTPException(
            status_code=404,
            detail=f"共有ファイルが見つかりません: {safe_name}"
        )


    # ⑥ 共有解除実行
    success = unshare_file(safe_owner, safe_name)

    if not success:

        raise HTTPException(
            status_code=500,
            detail="共有の解除に失敗しました"
        )


    log_success(current_user, f"UNSHARE: {safe_name}")

    return MessageResponse(
        success=True,
        user=current_user,
        message=f"{safe_name} の共有を解除しました"
    )
