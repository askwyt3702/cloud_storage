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
# フォルダ情報
# =====================================
class FolderInfo(BaseModel):
    name: str              # フォルダ名
    item_count: int        # 直下のフォルダ＋ファイル数
    modified_at: str       # 更新日時 例: "2026-05-28 12:00"


# =====================================
# ファイル一覧レスポンス
# =====================================
class FileListResponse(BaseModel):
    success: bool
    user: str
    files: List[FileInfo]
    folders: List[FolderInfo] = []   # 現在フォルダ内のサブフォルダ
    path: str = ""                   # 現在表示中のフォルダパス（ルートは ""）
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
    filenames: List[str]       # 削除するファイル名のリスト
    path: Optional[str] = ""   # 対象ファイルがあるフォルダ（ルートは ""）


# =====================================
# 一括ダウンロード（ZIP）リクエスト
# =====================================
class BulkDownloadRequest(BaseModel):
    filenames: List[str]       # ZIPにまとめるファイル名のリスト
    path: Optional[str] = ""   # 対象ファイルがあるフォルダ（ルートは ""）


# =====================================
# フォルダ作成リクエスト
# =====================================
class CreateFolderRequest(BaseModel):
    path: Optional[str] = ""   # 作成先の親フォルダ（ルートは ""）
    name: str                  # 作る新しいフォルダ名


# =====================================
# フォルダ名変更リクエスト
# =====================================
class RenameFolderRequest(BaseModel):
    path: Optional[str] = ""   # フォルダがある親フォルダ
    old_name: str              # 現在のフォルダ名
    new_name: str              # 変更後のフォルダ名


# =====================================
# ファイル移動リクエスト
# =====================================
class MoveFileRequest(BaseModel):
    filename: str                  # 移動するファイル名
    src_path: Optional[str] = ""   # 移動元フォルダ
    dest_path: Optional[str] = ""  # 移動先フォルダ


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
# （パスワードは共有時の設定を使うので、ここには持たない）
# =====================================
class CreateLinkRequest(BaseModel):
    expire_days: Optional[int] = None    # 有効日数（未指定で無期限）


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


# =====================================
# パスワードリセットリクエスト
# （メール＋MFAコードで本人確認 → 新パスワード設定）
# =====================================
class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str
