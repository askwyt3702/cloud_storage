import os
from datetime import datetime

from security.logger import (
    log_success,   # ← 成功ログ
    log_error      # ← エラーログ
)


# =====================================
# ファイル保存先ディレクトリ
# =====================================
UPLOAD_DIR = "uploads"


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
