
# =====================================
# hashlib
# Python標準の暗号化ライブラリ
# =====================================
import hashlib


# =====================================
# パスワード暗号化関数
#
# 入力：
# password
#
# 出力：
# ハッシュ化文字列
# =====================================
def hash_password(
    password
):

    # password.encode()
    # ↓
    # 文字列をバイト変換

    # sha256()
    # ↓
    # SHA256暗号化

    # hexdigest()
    # ↓
    # 16進数文字列へ変換

    return hashlib.sha256(

        password.encode()

    ).hexdigest()
