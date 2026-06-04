# =====================================
# 共有リンクAPI（ギガファイル便方式）
#
# ファイルごとに推測不可能なURLを発行し、
# URLを知っている人だけがダウンロードできる。
# 受け取り側はログイン不要。
# =====================================

from fastapi import APIRouter, HTTPException, Request, Header, Body
from fastapi.responses import FileResponse
from typing import Optional

from backend.schemas import (
    CreateLinkRequest,
    CreateLinkResponse,
    LinkInfoResponse,
    LinkListResponse,
    LinkItem,
    MessageResponse
)

from backend.services.file_service import (
    sanitize_filename,
    # --- 共有フォルダ関連（リンクは共有ファイルを対象にする）---
    shared_file_exists,
    get_shared_file_path,
    get_shared_file_size,
    get_shared_file_metadata,
    is_shared_protected,
    verify_shared_password
)

from backend.services.auth_service import (
    is_logged_in,
    get_current_user,
    get_current_role
)

from backend.services.link_service import (
    create_link,
    get_link,
    list_links_by_owner,
    delete_link
)

from security.permission import can_access
from security.logger import log_success, log_failed


router = APIRouter()


# 内部関数：バイトを読みやすい単位に変換
def _format_size(size_bytes: int) -> str:
    if size_bytes < 1024:
        return f"{size_bytes}B"
    elif size_bytes < 1024 ** 2:
        return f"{round(size_bytes / 1024, 1)}KB"
    elif size_bytes < 1024 ** 3:
        return f"{round(size_bytes / (1024 ** 2), 1)}MB"
    else:
        return f"{round(size_bytes / (1024 ** 3), 2)}GB"


# 内部関数：リクエストから共有URLのベースを組み立てる
#   例: http://127.0.0.1:8000/static/share.html?t=トークン
def _build_share_url(request: Request, token: str) -> str:
    base = str(request.base_url).rstrip("/")
    return f"{base}/static/share.html?t={token}"


# =====================================
# 共有リンクを発行
#
# 対象は「共有フォルダにある自分のファイル」。
# パスワード保護は共有時に設定したものをそのまま使う
# （リンク側では新たにパスワードを設定しない）。
#
# URL:
# POST /create-link/{filename}
#
# ボディ（任意）:
#   { "expire_days": 7 }
#
# エラー:
#   401 : 未ログイン
#   403 : 権限なし
#   400 : ファイル名が不正
#   404 : 共有ファイルが存在しない（先に共有が必要）
# =====================================
@router.post("/create-link/{filename}", response_model=CreateLinkResponse)
def create_share_link(
    filename: str,
    request: Request,
    body: Optional[CreateLinkRequest] = Body(default=None)
):

    # ① 認証チェック
    if not is_logged_in():
        log_failed("不明", "CREATE_LINK", "未ログイン")
        raise HTTPException(status_code=401, detail="ログインが必要です")

    # ② 権限チェック
    current_user = get_current_user()
    role = get_current_role()
    if not can_access(role, "write"):
        log_failed(current_user, "CREATE_LINK", "権限なし")
        raise HTTPException(status_code=403, detail="リンクを発行する権限がありません")

    # ③ ファイル名の無害化
    safe_name = sanitize_filename(filename)
    if not safe_name:
        raise HTTPException(status_code=400, detail="ファイル名が不正です")

    # ④ 共有ファイルの存在チェック（先に共有しておく必要がある）
    if not shared_file_exists(current_user, safe_name):
        raise HTTPException(
            status_code=404,
            detail="このファイルはまだ共有されていません。先に「共有」してからリンクを作成してください。"
        )

    # ⑤ リンク発行
    expire_days = body.expire_days if body else None

    token = create_link(current_user, safe_name, expire_days)
    link = get_link(token)["info"]

    log_success(current_user, f"CREATE_LINK: {safe_name}")

    return CreateLinkResponse(
        success=True,
        token=token,
        url=_build_share_url(request, token),
        expires_at=link.get("expires_at"),
        # パスワード保護されているかは「共有時の設定」に従う
        protected=is_shared_protected(current_user, safe_name)
    )


# =====================================
# リンク情報の取得（受け取り側のプレビュー用・ログイン不要）
#
# URL:
# GET /link/{token}/info
#
# エラー:
#   404 : 存在しない
#   410 : 期限切れ
# =====================================
@router.get("/link/{token}/info", response_model=LinkInfoResponse)
def link_info(token: str):

    result = get_link(token)

    if result["status"] == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="リンクが見つかりません")
    if result["status"] == "EXPIRED":
        raise HTTPException(status_code=410, detail="このリンクは有効期限が切れています")

    info = result["info"]
    owner = info["owner"]
    fname = info["filename"]

    # 共有が解除されている場合
    if not shared_file_exists(owner, fname):
        raise HTTPException(status_code=404, detail="ファイルの共有が解除されています")

    meta = get_shared_file_metadata(owner, fname)

    return LinkInfoResponse(
        success=True,
        filename=fname,
        size=_format_size(get_shared_file_size(owner, fname)),
        file_type=meta["file_type"],
        owner=owner,
        # パスワード保護されているかは共有時の設定に従う
        protected=is_shared_protected(owner, fname),
        expires_at=info.get("expires_at")
    )


# =====================================
# リンク経由のダウンロード（ログイン不要）
#
# URL:
# GET /link/{token}/download
#   パスワード保護時はヘッダー X-Link-Password で送る
#
# エラー:
#   404 : 存在しない
#   410 : 期限切れ
#   401 : パスワード不一致
# =====================================
@router.get("/link/{token}/download")
def link_download(
    token: str,
    x_link_password: Optional[str] = Header(default=None)
):

    result = get_link(token)

    if result["status"] == "NOT_FOUND":
        raise HTTPException(status_code=404, detail="リンクが見つかりません")
    if result["status"] == "EXPIRED":
        raise HTTPException(status_code=410, detail="このリンクは有効期限が切れています")

    info = result["info"]
    owner = info["owner"]
    fname = info["filename"]

    # 共有が解除されていないか
    if not shared_file_exists(owner, fname):
        raise HTTPException(status_code=404, detail="ファイルの共有が解除されています")

    # パスワード照合（共有時に設定したパスワードを使う）
    if not verify_shared_password(owner, fname, x_link_password):
        log_failed(owner, "LINK_DOWNLOAD", "パスワード不一致")
        raise HTTPException(status_code=401, detail="パスワードが必要です（または間違っています）")

    log_success(owner, f"LINK_DOWNLOAD: {fname}")

    return FileResponse(
        path=get_shared_file_path(owner, fname),
        filename=fname,
        media_type="application/octet-stream"
    )


# =====================================
# 自分が発行したリンク一覧
#
# URL:
# GET /my-links
# =====================================
@router.get("/my-links", response_model=LinkListResponse)
def my_links(request: Request):

    if not is_logged_in():
        raise HTTPException(status_code=401, detail="ログインが必要です")

    current_user = get_current_user()
    raw = list_links_by_owner(current_user)

    items = [
        LinkItem(
            token=r["token"],
            filename=r["filename"],
            url=_build_share_url(request, r["token"]),
            created_at=r["created_at"],
            expires_at=r["expires_at"],
            # パスワード保護の有無は共有ファイルの設定から取得
            protected=is_shared_protected(current_user, r["filename"])
        )
        for r in raw
    ]

    return LinkListResponse(success=True, links=items, total=len(items))


# =====================================
# リンクを削除（無効化）
#
# URL:
# DELETE /link/{token}
# =====================================
@router.delete("/link/{token}", response_model=MessageResponse)
def remove_link(token: str):

    if not is_logged_in():
        raise HTTPException(status_code=401, detail="ログインが必要です")

    current_user = get_current_user()

    if not delete_link(token, current_user):
        raise HTTPException(status_code=404, detail="リンクが見つからないか、削除権限がありません")

    log_success(current_user, f"DELETE_LINK: {token}")

    return MessageResponse(
        success=True,
        user=current_user,
        message="リンクを無効化しました"
    )
