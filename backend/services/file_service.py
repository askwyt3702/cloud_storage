import os


# =====================================
# ファイル保存先ディレクトリ
# =====================================
UPLOAD_DIR = "uploads"


# =====================================
# ファイルパス取得
#
# 引数:
#   filename : ファイル名
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

    # uploadsフォルダがなければ空リストを返す
    if not os.path.exists(UPLOAD_DIR):

        return []

    # ファイルのみ取得（フォルダは除外）
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
#   ファイルサイズ（バイト）
#   ファイルが存在しない場合は 0
# =====================================
def get_file_size(filename: str) -> int:

    file_path = get_file_path(filename)

    if not os.path.isfile(file_path):

        return 0

    return os.path.getsize(file_path)


# =====================================
# ファイル保存（担当Aのupload.pyから呼ばれる想定）
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

        # uploadsフォルダがなければ作成
        os.makedirs(UPLOAD_DIR, exist_ok=True)

        file_path = get_file_path(filename)

        with open(file_path, "wb") as f:
            f.write(data)

        return True

    except Exception:

        return False