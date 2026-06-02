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
# 一括削除リクエスト
# =====================================
class BulkDeleteRequest(BaseModel):
    filenames: List[str]   # 削除するファイル名のリスト


# =====================================
# 一括ダウンロード（ZIP）リクエスト
# =====================================
class BulkDownloadRequest(BaseModel):
    filenames: List[str]   # ZIPにまとめるファイル名のリスト


# =====================================
# 一括操作レスポンス
# （一括削除などで使用）
# =====================================
class BulkActionResponse(BaseModel):
    success: bool
    user: Optional[str] = None
    succeeded: List[str]   # 成功したファイル名
    failed: List[str]      # 失敗したファイル名
    message: str


# =====================================
# ゴミ箱内ファイル情報
# =====================================
class TrashFileInfo(BaseModel):
    name: str          # ファイル名
    size: str          # 例: "1.2MB"
    file_type: str     # 例: ".pdf"
    deleted_at: str    # ゴミ箱に入れた日時 例: "2026-05-29 12:00"


# =====================================
# ゴミ箱一覧レスポンス
# =====================================
class TrashListResponse(BaseModel):
    success: bool
    user: str
    files: List[TrashFileInfo]
    total: int


# =====================================
# 共有ファイル情報
# =====================================
class SharedFileInfo(BaseModel):
    owner: str         # 共有した人のユーザー名
    name: str          # ファイル名
    size: str          # 例: "1.2MB"
    file_type: str     # 例: ".pdf"
    shared_at: str     # 共有した日時 例: "2026-05-29 12:00"
    protected: bool    # パスワードで保護されているか


# =====================================
# 共有ファイル一覧レスポンス
# =====================================
class SharedListResponse(BaseModel):
    success: bool
    files: List[SharedFileInfo]
    total: int


# =====================================
# 共有リクエスト（単体）
# password が空ならパスワードなしで共有
# =====================================
class ShareRequest(BaseModel):
    password: Optional[str] = None


# =====================================
# 一括共有リクエスト
# 選択した複数ファイルに、同じパスワードを付けて共有
# =====================================
class BulkShareRequest(BaseModel):
    filenames: List[str]
    password: Optional[str] = None


# =====================================
# 共有リンク発行リクエスト
# =====================================
class CreateLinkRequest(BaseModel):
    expire_days: Optional[int] = None    # 有効日数（未指定で無期限）
    password: Optional[str] = None       # パスワード（未指定で無し）


# =====================================
# 共有リンク発行レスポンス
# =====================================
class CreateLinkResponse(BaseModel):
    success: bool
    token: str
    url: str                             # 完成した共有URL
    expires_at: Optional[str] = None
    protected: bool


# =====================================
# 共有リンク情報（受け取り側のプレビュー用）
# =====================================
class LinkInfoResponse(BaseModel):
    success: bool
    filename: str
    size: str
    file_type: str
    owner: str
    protected: bool                      # パスワード保護されているか
    expires_at: Optional[str] = None


# =====================================
# 共有リンク一覧の1件
# =====================================
class LinkItem(BaseModel):
    token: str
    filename: str
    url: str
    created_at: str
    expires_at: Optional[str] = None
    protected: bool


# =====================================
# 共有リンク一覧レスポンス
# =====================================
class LinkListResponse(BaseModel):
    success: bool
    links: List[LinkItem]
    total: int


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
