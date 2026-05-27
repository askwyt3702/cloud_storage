import os


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

    # パス部分をすべて取り除く
    # "../../etc/passwd" → "passwd"
    safe_name = os.path.basename(filename)

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

    except Exception:

        return False
