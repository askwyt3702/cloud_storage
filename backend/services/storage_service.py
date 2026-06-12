import os

from backend.services.file_service import (
    get_user_dir,     # ← ユーザーフォルダのパス取得
    TRASH_DIRNAME     # ← ゴミ箱フォルダ名（集計から除外する）
)


# =====================================
# 最大容量（GB）
# =====================================
MAX_STORAGE_GB = 10


# =====================================
# 容量計算
#
# 引数:
#   username : ユーザー名
#
# 出力：
#   used : 使用量（GB）
#   max  : 最大容量（GB）
# =====================================
# =====================================
# 使用バイト数取得（容量チェック用）
#
# 引数:
#   username : ユーザー名
#
# 戻り値:
#   使用バイト数（int）
# =====================================
def get_used_bytes(username: str) -> int:

    user_dir = get_user_dir(username)

    if not os.path.exists(user_dir):
        return 0

    total = 0

    # サブフォルダの中身も含めて再帰的に集計する。
    # ただしゴミ箱（.trash）は「使用量」に含めない。
    for root, dirs, files in os.walk(user_dir):

        # ゴミ箱フォルダ以下は走査しない
        if TRASH_DIRNAME in dirs:
            dirs.remove(TRASH_DIRNAME)

        for f in files:
            try:
                total += os.path.getsize(os.path.join(root, f))
            except OSError:
                # 集計中にファイルが消えた等は無視
                continue

    return total


def calculate_storage(username: str) -> dict:

    # ユーザーの全ファイルを取得
    # (※ 以前のコードの重複箇所を1つに綺麗にまとめています)
    total_bytes = get_used_bytes(username)

    # バイト → GB に変換（小数点2桁）
    # 1GB = 1024 * 1024 * 1024 バイト
    used_gb = round(
        total_bytes / (1024 ** 3),
        2
    )

    return {
        "used": f"{used_gb}GB",
        "max": f"{MAX_STORAGE_GB}GB"
    }