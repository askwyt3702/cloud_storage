from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.services.auth_service import get_current_role, get_current_user
from backend.services.settings_service import (
    get_webhook_settings,
    save_webhook_settings,
    send_notification
)

router = APIRouter()

class WebhookSettingsRequest(BaseModel):
    webhook_url: str
    notify_upload: bool
    notify_delete: bool
    notify_share: bool

class WebhookTestRequest(BaseModel):
    webhook_url: str

def require_admin(role: str = Depends(get_current_role)):
    if role is None:
        raise HTTPException(status_code=401, detail="ログインが必要です")
    if role != "admin":
        raise HTTPException(status_code=403, detail="設定機能は管理者専用です")
    return role

@router.get("/settings/webhook")
def get_settings(role: str = Depends(require_admin)):
    return get_webhook_settings()

@router.post("/settings/webhook")
def save_settings(body: WebhookSettingsRequest, role: str = Depends(require_admin)):
    success = save_webhook_settings(
        body.webhook_url,
        body.notify_upload,
        body.notify_delete,
        body.notify_share
    )
    if not success:
        raise HTTPException(status_code=500, detail="Webhook設定の保存に失敗しました")
    return {"success": True, "message": "設定を保存しました"}

@router.post("/settings/webhook/test")
def test_webhook(body: WebhookTestRequest, role: str = Depends(require_admin), username: str = Depends(get_current_user)):
    if not body.webhook_url.strip():
        raise HTTPException(status_code=400, detail="Webhook URLが入力されていません")
    
    success = send_notification(
        username=username,
        event_type="test",
        message="🎉 Webhook通知の連携に成功しました！このチャンネルにイベント通知が送信されます。",
        title="🔔 Cloud Storage テスト通知",
        webhook_url_override=body.webhook_url
    )
    if not success:
        raise HTTPException(status_code=500, detail="テスト送信に失敗しました。URLが正しいか、または接続状態を確認してください。")
    return {"success": True, "message": "テスト通知を送信しました"}
