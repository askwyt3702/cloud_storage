# =====================================
# 共有リンク管理サービス
#
# 「共有フォルダ(_shared)にある自分のファイル」に対して
# 推測不可能なトークンを発行し、
# 「URLを知っている人だけ」がダウンロードできる仕組み。
# （ギガファイル便のような共有リンク）
#
# パスワード保護は、共有時に設定したパスワードをそのまま使う
# （リンク側ではパスワードを持たない）。
#
# トークンと対応情報は uploads/_links.json に保存する。
#   {
#     "トークン": {
#         "owner": "admin",
#         "filename": "report.pdf",
#         "created_at": "2026-06-02T15:00:00",
#         "expires_at": "2026-06-09T15:00:00" or null
#     }, ...
#   }
# =====================================

import os
import json
import secrets
from datetime import datetime, timedelta

from security.logger import log_error

# file_service と同じ uploads ディレクトリを使う
UPLOAD_DIR = "uploads"

# リンク情報を保存するファイル
LINKS_FILE = os.path.join(UPLOAD_DIR, "_links.json")


# =====================================
# リンク情報ファイルの読み書き
# =====================================
def _load_links() -> dict:

    if not os.path.isfile(LINKS_FILE):
        return {}

    try:
        with open(LINKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log_error(f"リンク情報の読み込み失敗: {e}")
        return {}


def _save_links(data: dict) -> None:

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    with open(LINKS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# =====================================
# 共有リンクを発行
#
# 引数:
#   owner       : 所有者のユーザー名
#   filename    : 対象ファイル名（sanitize済み・共有フォルダ内）
#   expire_days : 有効日数（None なら無期限）
#
# 戻り値:
#   発行したトークン（str）
# =====================================
def create_link(owner: str, filename: str, expire_days=None) -> str:

    links = _load_links()

    # 推測不可能なトークンを生成（URLセーフな約27文字）
    token = secrets.token_urlsafe(20)

    # 有効期限
    expires_at = None
    if expire_days:
        expires_at = (datetime.now() + timedelta(days=int(expire_days))).isoformat()

    links[token] = {
        "owner": owner,
        "filename": filename,
        "created_at": datetime.now().isoformat(),
        "expires_at": expires_at,
    }

    _save_links(links)

    return token


# =====================================
# トークンから情報を取得（期限チェック込み）
#
# 戻り値:
#   {"status": "OK", "info": {...}}        正常
#   {"status": "NOT_FOUND"}               存在しない
#   {"status": "EXPIRED"}                 期限切れ
# =====================================
def get_link(token: str) -> dict:

    links = _load_links()
    info = links.get(token)

    if not info:
        return {"status": "NOT_FOUND"}

    # 期限チェック
    if info.get("expires_at"):
        try:
            if datetime.now() > datetime.fromisoformat(info["expires_at"]):
                return {"status": "EXPIRED"}
        except Exception:
            pass

    return {"status": "OK", "info": info}


# =====================================
# あるユーザーが発行したリンク一覧
#
# 戻り値:
#   [{"token": "...", "filename": "...", "created_at": "...",
#     "expires_at": ...}, ...]
# =====================================
def list_links_by_owner(owner: str) -> list:

    links = _load_links()
    result = []

    for token, info in links.items():
        if info.get("owner") != owner:
            continue

        result.append({
            "token": token,
            "filename": info.get("filename"),
            "created_at": info.get("created_at"),
            "expires_at": info.get("expires_at"),
        })

    return result


# =====================================
# リンクを削除（無効化）
#
# 本人のリンクのみ削除できるよう、owner を照合する。
#
# 戻り値:
#   True  : 削除した
#   False : 存在しない or 持ち主が違う
# =====================================
def delete_link(token: str, owner: str) -> bool:

    links = _load_links()
    info = links.get(token)

    if not info or info.get("owner") != owner:
        return False

    links.pop(token, None)
    _save_links(links)

    return True
