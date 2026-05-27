from backend.services.file_service import (
    list_files,       # ← ファイル一覧
    get_file_size     # ← ファイルサイズ取得
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

    files = list_files(username)

    return sum(
        get_file_size(username, f)
        for f in files
    )


def calculate_storage(username: str) -> dict:

    # ユーザーの全ファイルを取得
    files = list_files(username)

    # 全ファイルのバイト数を合計
    total_bytes = sum(
        get_file_size(username, f)
        for f in files
    )

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
