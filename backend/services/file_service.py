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
# 処理内容:
#   1. basename() でパス部分を除去
#      "../../etc/passwd" → "passwd"
#   2. uploadsフォルダ内に収まるか確認
#   3. 空文字・ドットのみは拒否
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
    # "/absolute/path/file.txt" → "file.txt"
    safe_name = os.path.basename(filename)


    # 空文字・"." や ".." は拒否
    if not safe_name or safe_name in (".", ".."):

        return None


    # 最終確認：uploadsフォルダの外に出ていないか
    expected_dir = os.path.abspath(UPLOAD_DIR)
    full_path    = os.path.abspath(
        os.path.join(UPLOAD_DIR, safe_name)
    )

    if not full_path.startswith(expected_dir + os.sep):

        return None


    return safe_name


# =====================================
# ファイルパス取得
#
# 引数:
#   filename : ファイル名（sanitize済みのもの）
#
# 戻り値:
#   ファイルのフルパス（文字列）
# =====================================
def get_file_path(filename: str) -> str:

    return os.path.join(UPLOAD_DIR, filename)


# =====================================
# ファイル存在チェック
#
# 引数:
#   filename : 確認するファイル名
#
# 戻り値:
#   True  : ファイルが存在する
#   False : ファイルが存在しない
# =====================================
def file_exists(filename: str) -> bool:

    file_path = get_file_path(filename)

    return os.path.isfile(file_path)


# =====================================
# ファイル一覧取得
#
# 戻り値:
#   ファイル名のリスト（存在しない場合は空リスト）
# =====================================
def list_files() -> list:

    if not os.path.exists(UPLOAD_DIR):

        return []


    files = [
        f for f in os.listdir(UPLOAD_DIR)
        if os.path.isfile(
            os.path.join(UPLOAD_DIR, f)
        )
    ]

    return files


# =====================================
# ファイルサイズ取得（バイト）
#
# 引数:
#   filename : ファイル名
#
# 戻り値:
#   ファイルサイズ（バイト）、存在しない場合は 0
# =====================================
def get_file_size(filename: str) -> int:

    file_path = get_file_path(filename)

    if not os.path.isfile(file_path):

        return 0

    return os.path.getsize(file_path)


# =====================================
# ファイル保存（担当AのuploadAPIから呼ばれる想定）
#
# 引数:
#   filename : 保存するファイル名
#   data     : ファイルのバイトデータ
#
# 戻り値:
#   True  : 保存成功
#   False : 保存失敗
# =====================================
def save_file(filename: str, data: bytes) -> bool:

    try:

        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = get_file_path(filename)

        with open(file_path, "wb") as f:
            f.write(data)

        return True

    except Exception:

        return False