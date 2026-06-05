import os
import json
import urllib.request
import urllib.error
from datetime import datetime
from security.logger import log_success, log_error

UPLOAD_DIR = "uploads"
WEBHOOK_SETTINGS_FILE = os.path.join(UPLOAD_DIR, "_webhooks.json")

def get_webhook_settings() -> dict:
    default_settings = {
        "webhook_url": "",
        "notify_upload": True,
        "notify_delete": True,
        "notify_share": True
    }
    if not os.path.exists(WEBHOOK_SETTINGS_FILE):
        return default_settings
    try:
        with open(WEBHOOK_SETTINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # 不足しているキーがあればデフォルトで補完
            for k, v in default_settings.items():
                if k not in data:
                    data[k] = v
            return data
    except Exception as e:
        log_error(f"Webhook設定の読み込み失敗: {e}")
        return default_settings

def save_webhook_settings(webhook_url: str, notify_upload: bool, notify_delete: bool, notify_share: bool) -> bool:
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        settings = {
            "webhook_url": webhook_url.strip(),
            "notify_upload": notify_upload,
            "notify_delete": notify_delete,
            "notify_share": notify_share
        }
        with open(WEBHOOK_SETTINGS_FILE, "w", encoding="utf-8") as f:
            json.dump(settings, f, ensure_ascii=False, indent=2)
        log_success("SYSTEM", f"WEBHOOK_SETTINGS_UPDATED: url={'configured' if settings['webhook_url'] else 'empty'}, upload={notify_upload}, delete={notify_delete}, share={notify_share}")
        return True
    except Exception as e:
        log_error(f"Webhook設定の保存失敗: {e}")
        return False

def send_notification(username: str, event_type: str, message: str, title: str = None, webhook_url_override: str = None) -> bool:
    """
    指定したイベント種別の通知を送信します。
    event_type: 'upload', 'delete', 'share', 'test'
    """
    settings = get_webhook_settings()
    webhook_url = webhook_url_override.strip() if webhook_url_override is not None else settings.get("webhook_url", "").strip()
    
    if not webhook_url:
        # Webhook URLが設定されていない場合は何もしない
        return False

    # テスト送信（'test'）以外は、設定のオン/オフをチェック
    if event_type != "test":
        if event_type == "upload" and not settings.get("notify_upload", True):
            return False
        if event_type == "delete" and not settings.get("notify_delete", True):
            return False
        if event_type == "share" and not settings.get("notify_share", True):
            return False

    # 不正なサロゲート文字および文字化けエラー文字(U+FFFD)を除去して安全にする
    clean_message = "".join(c for c in message if not (0xD800 <= ord(c) <= 0xDFFF or ord(c) == 0xFFFD))
    clean_title = "".join(c for c in title if not (0xD800 <= ord(c) <= 0xDFFF or ord(c) == 0xFFFD)) if title else ""

    if not clean_title:
        clean_title = "Cloud Storage 通知"

    # Discord と Slack の両方に互換性のあるペイロード
    payload = {
        "content": f"**{clean_title}**\n{clean_message}",  # Discord用（テキスト）
        "text": f"*{clean_title}*\n{clean_message}",       # Slack用（テキスト）
        "embeds": [                            # Discord用（リッチ埋め込み）
            {
                "title": clean_title,
                "description": clean_message,
                "color": 3066993,  # 緑っぽい青色 (0x2F3136)
                "fields": [
                    {"name": "実行ユーザー", "value": username or "システム", "inline": True},
                    {"name": "イベント", "value": event_type.upper(), "inline": True}
                ],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        ]
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            webhook_url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "CloudStorage-Notification-Agent"
            },
            method="POST"
        )
        
        # タイムアウト5秒で送信
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.status
            if 200 <= status < 300:
                log_success("SYSTEM", f"NOTIFICATION_SENT: event={event_type}")
                return True
            else:
                log_error(f"Notification HTTP error status: {status}")
                return False
    except urllib.error.HTTPError as e:
        log_error(f"Webhook HTTP送信失敗: {e.code} {e.reason} - {e.read().decode('utf-8', errors='ignore')}")
        return False
    except Exception as e:
        log_error(f"Webhook送信失敗: {e}")
        return False
