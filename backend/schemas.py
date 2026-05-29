from pydantic import BaseModel
from typing import List, Optional


# =====================================
# ファイル情報
# =====================================
class FileInfo(BaseModel):
    name: str          # ファイル名
    size: str          # 例: "1.2MB"
    file_type: str     # 例: ".pdf"
    uploaded_at: str   # 例: "2026-05-28 12:00"


# =====================================
# ファイル一覧レスポンス
# =====================================
class FileListResponse(BaseModel):
    success: bool
    user: str
    files: List[FileInfo]
    total: int         # 全ファイル数
    page: int          # 現在のページ
    per_page: int      # 1ページあたりの件数


# =====================================
# 汎用メッセージレスポンス
# （アップロード・削除・リネームで使用）
# =====================================
class MessageResponse(BaseModel):
    success: bool
    user: Optional[str] = None
    message: str


# =====================================
# リネームリクエスト
# =====================================
class RenameRequest(BaseModel):
    new_name: str      # 変更後のファイル名


# =====================================
# 容量レスポンス
# =====================================
class StorageResponse(BaseModel):
    success: bool
    user: str
    used: str          # 例: "3.5GB"
    max: str           # 例: "10GB"


# =====================================
# ログインリクエスト
# =====================================
class LoginRequest(BaseModel):
    username_or_email: str
    password: str


# =====================================
# 新規登録リクエスト
# =====================================
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
