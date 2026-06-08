from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
from backend.services.auth_service import get_current_role
from backend.services.backup_service import (
    get_backup_settings,
    save_backup_settings,
    create_backup,
    list_backups,
    delete_backup,
    BACKUP_DIR
)

router = APIRouter()

class BackupSettingsRequest(BaseModel):
    enabled: bool
    time: str

def require_admin(role: str = Depends(get_current_role)):
    if role is None:
        raise HTTPException(status_code=401, detail="ログインが必要です")
    if role != "admin":
        raise HTTPException(status_code=403, detail="バックアップ機能は管理者専用です")
    return role

@router.get("/backup/settings")
def get_settings(role: str = Depends(require_admin)):
    return get_backup_settings()

@router.post("/backup/settings")
def save_settings(body: BackupSettingsRequest, role: str = Depends(require_admin)):
    success = save_backup_settings(body.enabled, body.time)
    if not success:
        raise HTTPException(status_code=500, detail="バックアップ設定の保存に失敗しました")
    return {"success": True, "message": "設定を保存しました"}

@router.get("/backup/list")
def get_backup_list(role: str = Depends(require_admin)):
    return list_backups()

@router.post("/backup/run")
def run_backup(role: str = Depends(require_admin)):
    res = create_backup()
    if not res.get("success"):
        raise HTTPException(status_code=500, detail=res.get("detail", "バックアップ作成に失敗しました"))
    return res

@router.get("/backup/download/{filename}")
def download_backup_file(filename: str, role: str = Depends(require_admin)):
    safe_name = os.path.basename(filename)
    path = os.path.join(BACKUP_DIR, safe_name)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="バックアップファイルが見つかりません")
    return FileResponse(path, filename=safe_name, media_type="application/zip")

@router.delete("/backup/{filename}")
def delete_backup_file(filename: str, role: str = Depends(require_admin)):
    success = delete_backup(filename)
    if not success:
        raise HTTPException(status_code=404, detail="バックアップファイルの削除に失敗しました")
    return {"success": True, "message": "バックアップファイルを削除しました"}
