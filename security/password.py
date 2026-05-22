import hashlib


# パスワード暗号化
def hash_password(
    password
):

    return hashlib.sha256(
        password.encode()
    ).hexdigest()