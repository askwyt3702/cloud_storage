import os
import json
import shutil
import bcrypt
from datetime import datetime

from security.logger import (
    log_success,   # ← 成功ログ
    log_error      # ← エラーログ
)


# =====================================
# ファイル保存先ディレクトリ
# =====================================
UPLOAD_DIR = "uploads"

# ゴミ箱フォルダ名
# 各ユーザーのフォルダ内に作る: uploads/{username}/.trash/
# 先頭がドットの隠しフォルダなので、通常のファイル一覧には出てこない
TRASH_DIRNAME = ".trash"

# 共有フォルダ名
# uploads/_shared/{owner}/ に共有ファイルを置く
# ※ この名前はユーザー名として使えない予約名
SHARED_DIRNAME = "_shared"

# 共有ファイルのパスワード情報を保存するファイル名
# uploads/_shared/{owner}/.shared_meta.json に
# { "ファイル名": {"password_hash": "..."} } の形で保存する
SHARED_META_FILENAME = ".shared_meta.json"


# =====================================
# ファイル名の無害化（サニタイズ）
#
# 目的:
#   パストラバーサル攻撃を防ぐ
#   例: "../../etc/passwd" のような
#       危険なパスを無効化する
#
# 引数:
#   filename : ユーザーから受け取ったファイル名
#
# 戻り値:
#   安全なファイル名（str）
#   危険と判断した場合は None
# =====================================
def sanitize_filename(filename: str) -> str | None:

    # Windowsのパス区切り文字 '\' を '/' に変換して統一する（Linuxでの動作時にパストラバーサルを防ぐため）
    normalized_name = filename.replace("\\", "/")

    # パス部分をすべて取り除く
    # "../../etc/passwd" → "passwd"
    safe_name = os.path.basename(normalized_name)

    # 空文字・"." や ".." は拒否
    if not safe_name or safe_name in (".", ".."):

        return None

    return safe_name


# =====================================
# ファイルパス取得
#
# ユーザーごとのフォルダにファイルを保存
# 例: uploads/admin/test.txt
#
# 引数:
#   username : ユーザー名
#   filename : ファイル名（sanitize済み）
#
# 戻り値:
#   ファイルのフルパス（文字列）
# =====================================
def get_file_path(username: str, filename: str) -> str:

    return os.path.join(UPLOAD_DIR, username, filename)


# =====================================
# ファイル存在チェック
#
# 引数:
#   username : ユーザー名
#   filename : 確認するファイル名
#
# 戻り値:
#   True  : ファイルが存在する
#   False : ファイルが存在しない
# =====================================
def file_exists(username: str, filename: str) -> bool:

    file_path = get_file_path(username, filename)

    return os.path.isfile(file_path)


# =====================================
# ファイル一覧取得
#
# 引数:
#   username : ユーザー名
#
# 戻り値:
#   ファイル名のリスト（存在しない場合は空リスト）
# =====================================
def list_files(username: str) -> list:

    user_dir = os.path.join(UPLOAD_DIR, username)

    if not os.path.exists(user_dir):

        return []

    files = [
        f for f in os.listdir(user_dir)
        if os.path.isfile(
            os.path.join(user_dir, f)
        )
    ]

    return files


# =====================================
# ファイルサイズ取得（バイト）
#
# 引数:
#   username : ユーザー名
#   filename : ファイル名
#
# 戻り値:
#   ファイルサイズ（バイト）、存在しない場合は 0
# =====================================
def get_file_size(username: str, filename: str) -> int:

    file_path = get_file_path(username, filename)

    if not os.path.isfile(file_path):

        return 0

    return os.path.getsize(file_path)


# =====================================
# ファイル更新日時取得（並び替え用）
#
# 引数:
#   username : ユーザー名
#   filename : ファイル名
#
# 戻り値:
#   更新日時のタイムスタンプ（float）、存在しない場合は 0
# =====================================
def get_file_mtime(username: str, filename: str) -> float:

    file_path = get_file_path(username, filename)

    if not os.path.isfile(file_path):

        return 0

    return os.path.getmtime(file_path)


# =====================================
# ファイルメタデータ取得
#
# 引数:
#   username : ユーザー名
#   filename : ファイル名
#
# 戻り値:
#   uploaded_at : アップロード日時（文字列）
#   file_type   : 拡張子（例: ".pdf"）
# =====================================
def get_file_metadata(username: str, filename: str) -> dict:

    file_path = get_file_path(username, filename)

    # アップロード日時（ファイルの更新日時を使用）
    mtime = os.path.getmtime(file_path)
    uploaded_at = datetime.fromtimestamp(mtime).strftime(
        "%Y-%m-%d %H:%M"
    )

    # ファイル種類（拡張子）
    ext = os.path.splitext(filename)[1].lower()
    file_type = ext if ext else "不明"

    return {
        "uploaded_at": uploaded_at,
        "file_type": file_type
    }


# =====================================
# ファイル保存
#
# 引数:
#   username : 保存するユーザー名
#   filename : 保存するファイル名
#   data     : ファイルのバイトデータ
#
# 戻り値:
#   True  : 保存成功
#   False : 保存失敗
# =====================================
def save_file(username: str, filename: str, data: bytes) -> bool:

    try:

        # ユーザーフォルダを作成（なければ）
        # 例: uploads/admin/
        user_dir = os.path.join(UPLOAD_DIR, username)
        os.makedirs(user_dir, exist_ok=True)

        file_path = get_file_path(username, filename)

        with open(file_path, "wb") as f:
            f.write(data)

        return True

    except Exception as e:

        # 失敗理由をログに記録
        log_error(f"ファイル保存失敗: {username}/{filename} - {e}")

        return False


# =====================================================
# ここから下：ゴミ箱（.trash）関連の関数
# =====================================================


# =====================================
# ゴミ箱フォルダのパス取得
#
# 例: uploads/admin/.trash
# =====================================
def get_trash_dir(username: str) -> str:

    return os.path.join(UPLOAD_DIR, username, TRASH_DIRNAME)


# =====================================
# ゴミ箱内のファイルパス取得
#
# 例: uploads/admin/.trash/test.txt
# =====================================
def get_trash_file_path(username: str, filename: str) -> str:

    return os.path.join(get_trash_dir(username), filename)


# =====================================
# ゴミ箱にそのファイルがあるか
# =====================================
def trash_file_exists(username: str, filename: str) -> bool:

    return os.path.isfile(get_trash_file_path(username, filename))


# =====================================
# ゴミ箱内のファイル一覧取得
#
# 戻り値:
#   ファイル名のリスト（無ければ空リスト）
# =====================================
def list_trash(username: str) -> list:

    trash_dir = get_trash_dir(username)

    if not os.path.exists(trash_dir):

        return []

    files = [
        f for f in os.listdir(trash_dir)
        if os.path.isfile(
            os.path.join(trash_dir, f)
        )
    ]

    return files


# =====================================
# ゴミ箱内ファイルのサイズ取得（バイト）
# =====================================
def get_trash_file_size(username: str, filename: str) -> int:

    file_path = get_trash_file_path(username, filename)

    if not os.path.isfile(file_path):

        return 0

    return os.path.getsize(file_path)


# =====================================
# ゴミ箱内ファイルのメタデータ取得
#
# 戻り値:
#   deleted_at : ゴミ箱に入れた日時（＝移動した時刻）
#   file_type  : 拡張子
# =====================================
def get_trash_file_metadata(username: str, filename: str) -> dict:

    file_path = get_trash_file_path(username, filename)

    # ゴミ箱に移動した時刻（ファイルの更新日時）
    mtime = os.path.getmtime(file_path)
    deleted_at = datetime.fromtimestamp(mtime).strftime(
        "%Y-%m-%d %H:%M"
    )

    ext = os.path.splitext(filename)[1].lower()
    file_type = ext if ext else "不明"

    return {
        "deleted_at": deleted_at,
        "file_type": file_type
    }


# =====================================
# ファイルをゴミ箱へ移動（＝論理削除）
#
# 通常のフォルダから .trash/ へ移すだけ。
# ゴミ箱に同名ファイルがある場合は、上書きを避けるため
# ファイル名にタイムスタンプを付ける。
#
# 戻り値:
#   True  : 成功
#   False : 失敗
# =====================================
def move_to_trash(username: str, filename: str) -> bool:

    try:

        trash_dir = get_trash_dir(username)
        os.makedirs(trash_dir, exist_ok=True)

        src = get_file_path(username, filename)
        dest = os.path.join(trash_dir, filename)

        # ゴミ箱に同名がある場合は名前を変えて衝突を回避
        if os.path.exists(dest):

            base, ext = os.path.splitext(filename)
            stamp = datetime.now().strftime("%Y%m%d%H%M%S")
            dest = os.path.join(trash_dir, f"{base}_{stamp}{ext}")

        os.rename(src, dest)

        return True

    except Exception as e:

        log_error(f"ゴミ箱への移動失敗: {username}/{filename} - {e}")

        return False


# =====================================
# ゴミ箱からファイルを復元
#
# .trash/ から通常のフォルダへ戻す。
#
# 戻り値:
#   True  : 成功
#   False : 失敗
# =====================================
def restore_from_trash(username: str, filename: str) -> bool:

    try:

        src = get_trash_file_path(username, filename)
        dest = get_file_path(username, filename)

        os.rename(src, dest)

        return True

    except Exception as e:

        log_error(f"ゴミ箱からの復元失敗: {username}/{filename} - {e}")

        return False


# =====================================
# ゴミ箱内ファイルの完全削除（復元不可）
#
# 戻り値:
#   True  : 成功
#   False : 失敗
# =====================================
def delete_from_trash(username: str, filename: str) -> bool:

    try:

        os.remove(get_trash_file_path(username, filename))

        return True

    except Exception as e:

        log_error(f"ゴミ箱の完全削除失敗: {username}/{filename} - {e}")

        return False


# =====================================
# ゴミ箱を空にする（全ファイル完全削除）
#
# 戻り値:
#   削除した件数（int）
# =====================================
def empty_trash(username: str) -> int:

    trash_dir = get_trash_dir(username)

    if not os.path.exists(trash_dir):

        return 0

    count = 0

    for f in os.listdir(trash_dir):

        path = os.path.join(trash_dir, f)

        if os.path.isfile(path):

            try:

                os.remove(path)
                count += 1

            except Exception as e:

                log_error(f"ゴミ箱を空にする処理で失敗: {username}/{f} - {e}")

    return count


# =====================================================
# ここから下：共有フォルダ（_shared）関連の関数
#
# 構成: uploads/_shared/{owner}/{filename}
# 所有者ごとにフォルダを分けることで
#   ・誰が共有したか分かる
#   ・別の人が同名ファイルを共有しても衝突しない
# =====================================================


# =====================================
# 共有フォルダのルートパス
# 例: uploads/_shared
# =====================================
def get_shared_root() -> str:

    return os.path.join(UPLOAD_DIR, SHARED_DIRNAME)


# =====================================
# 共有フォルダ内・所有者ごとのパス
# 例: uploads/_shared/admin
# =====================================
def get_shared_user_dir(owner: str) -> str:

    return os.path.join(get_shared_root(), owner)


# =====================================
# 共有ファイルのパス
# 例: uploads/_shared/admin/test.txt
# =====================================
def get_shared_file_path(owner: str, filename: str) -> str:

    return os.path.join(get_shared_user_dir(owner), filename)


# =====================================
# 共有フォルダにそのファイルがあるか
# =====================================
def shared_file_exists(owner: str, filename: str) -> bool:

    return os.path.isfile(get_shared_file_path(owner, filename))


# =====================================
# 共有ファイル一覧取得（全ユーザー分）
#
# 戻り値:
#   [{"owner": "admin", "name": "test.txt"}, ...]
# =====================================
def list_shared() -> list:

    shared_root = get_shared_root()

    if not os.path.exists(shared_root):

        return []

    result = []

    # 所有者フォルダを順に見る
    for owner in os.listdir(shared_root):

        owner_dir = os.path.join(shared_root, owner)

        if not os.path.isdir(owner_dir):
            continue

        for f in os.listdir(owner_dir):

            # パスワード情報ファイルは一覧に出さない
            if f == SHARED_META_FILENAME:
                continue

            if os.path.isfile(os.path.join(owner_dir, f)):

                result.append({"owner": owner, "name": f})

    return result


# =====================================
# 共有ファイルのサイズ取得（バイト）
# =====================================
def get_shared_file_size(owner: str, filename: str) -> int:

    file_path = get_shared_file_path(owner, filename)

    if not os.path.isfile(file_path):

        return 0

    return os.path.getsize(file_path)


# =====================================
# 共有ファイルのメタデータ取得
#
# 戻り値:
#   shared_at : 共有した日時
#   file_type : 拡張子
# =====================================
def get_shared_file_metadata(owner: str, filename: str) -> dict:

    file_path = get_shared_file_path(owner, filename)

    mtime = os.path.getmtime(file_path)
    shared_at = datetime.fromtimestamp(mtime).strftime(
        "%Y-%m-%d %H:%M"
    )

    ext = os.path.splitext(filename)[1].lower()
    file_type = ext if ext else "不明"

    return {
        "shared_at": shared_at,
        "file_type": file_type
    }


# =====================================
# 自分の個人ファイルを共有フォルダにコピー（＝共有する）
#
# 個人側にもファイルは残る。
#
# 戻り値:
#   True  : 成功
#   False : 失敗
# =====================================
def share_file(username: str, filename: str) -> bool:

    try:

        src = get_file_path(username, filename)

        dest_dir = get_shared_user_dir(username)
        os.makedirs(dest_dir, exist_ok=True)

        dest = os.path.join(dest_dir, filename)

        # メタデータ（更新日時など）も含めてコピー
        shutil.copy2(src, dest)

        return True

    except Exception as e:

        log_error(f"共有失敗: {username}/{filename} - {e}")

        return False


# =====================================
# 共有を解除（共有フォルダ内の自分のファイルを削除）
#
# 個人側のファイルは消えない。
#
# 戻り値:
#   True  : 成功
#   False : 失敗
# =====================================
def unshare_file(owner: str, filename: str) -> bool:

    try:

        os.remove(get_shared_file_path(owner, filename))

        # パスワード情報も消しておく
        remove_shared_password(owner, filename)

        return True

    except Exception as e:

        log_error(f"共有解除失敗: {owner}/{filename} - {e}")

        return False


# =====================================================
# 共有ファイルのパスワード管理
# uploads/_shared/{owner}/.shared_meta.json に保存
# =====================================================


# =====================================
# メタファイルのパス
# =====================================
def _shared_meta_path(owner: str) -> str:

    return os.path.join(get_shared_user_dir(owner), SHARED_META_FILENAME)


# =====================================
# メタ情報の読み込み（無ければ空辞書）
# =====================================
def _load_shared_meta(owner: str) -> dict:

    path = _shared_meta_path(owner)

    if not os.path.isfile(path):
        return {}

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log_error(f"共有メタ読み込み失敗: {owner} - {e}")
        return {}


# =====================================
# メタ情報の保存
# =====================================
def _save_shared_meta(owner: str, meta: dict) -> None:

    os.makedirs(get_shared_user_dir(owner), exist_ok=True)

    path = _shared_meta_path(owner)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)


# =====================================
# 共有ファイルにパスワードを設定
#
# password が空（None や ""）なら「保護なし」として扱い、
# 既存のパスワード情報があれば削除する。
# =====================================
def set_shared_password(owner: str, filename: str, password: str | None) -> None:

    meta = _load_shared_meta(owner)

    if password:
        # bcrypt でハッシュ化して保存（強度チェックはしない）
        hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        meta[filename] = {"password_hash": hashed}
    else:
        # パスワードなし → 情報を消す
        meta.pop(filename, None)

    _save_shared_meta(owner, meta)


# =====================================
# 共有ファイルのパスワード情報を削除
# =====================================
def remove_shared_password(owner: str, filename: str) -> None:

    meta = _load_shared_meta(owner)

    if filename in meta:
        meta.pop(filename, None)
        _save_shared_meta(owner, meta)


# =====================================
# その共有ファイルがパスワード保護されているか
# =====================================
def is_shared_protected(owner: str, filename: str) -> bool:

    meta = _load_shared_meta(owner)

    return filename in meta and bool(meta[filename].get("password_hash"))


# =====================================
# 共有ファイルのパスワード照合
#
# 戻り値:
#   True  : 保護なし、または パスワードが正しい
#   False : 保護ありで パスワードが違う／未入力
# =====================================
def verify_shared_password(owner: str, filename: str, password: str | None) -> bool:

    meta = _load_shared_meta(owner)
    entry = meta.get(filename)

    # 保護されていない → 常にOK
    if not entry or not entry.get("password_hash"):
        return True

    if not password:
        return False

    try:
        return bcrypt.checkpw(
            password.encode(),
            entry["password_hash"].encode()
        )
    except Exception:
        return False
