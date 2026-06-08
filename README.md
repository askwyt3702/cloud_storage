# Cloud Storage（卒研プロジェクト）

ブラウザからファイルをアップロード／ダウンロードできるクラウドストレージ Web アプリ。
ユーザーごとのファイル管理、2段階認証（MFA）、ゴミ箱、共有フォルダ（任意パスワード付き）に対応。

---

## 主な機能

| 区分 | 機能 |
|---|---|
| 認証 | ログイン / 新規登録 / ログアウト / **2段階認証（MFA）** |
| ファイル | アップロード / ダウンロード / 削除（ゴミ箱経由）/ リネーム |
| 一覧 | 並び替え（名前 / 日付 / サイズ）・ページング |
| 一括操作 | 全選択 / 一括削除 / 一括共有 |
| ゴミ箱 | 一覧 / 復元 / 完全削除 / 空にする |
| 共有 | 任意のパスワード付きで共有 / 一括共有 / 共有解除 |
| セキュリティ | パスワードは bcrypt ハッシュ / RBAC（admin / user / guest）/ パストラバーサル防止 / ロックアウト |

---

## ディレクトリ構成

```
cloud_storage/
├── backend/                FastAPI アプリ本体
│   ├── main.py             起動エントリ
│   ├── schemas.py          Pydantic モデル
│   ├── routes/             API ルート定義（login / upload / download / storage / user）
│   └── services/           ビジネスロジック（auth_service / file_service / storage_service）
├── database/               DB スキーマと接続
│   ├── db.py               PostgreSQL 接続（環境変数で上書き可）
│   └── schema.sql          users テーブル + テストデータ
├── security/               認証ヘルパー
│   ├── password.py         bcrypt + 強度チェック + ロックアウト
│   ├── permission.py       RBAC
│   └── logger.py           app.log への書き込み
├── frontend/               静的フロントエンド
│   ├── login.html / register.html / files.html
│   ├── script.js
│   └── style.css
├── docker/                 Docker 用ファイル（サーバー PC 用）
├── docker-compose.yml      PostgreSQL を docker で立てる場合
├── setup_db.bat            **DB をワンクリックで構築**
├── requirements.txt        Python 依存
└── README.md
```

---

## 環境構築

### 前提
- **Python 3.13**（venv 使用）
- **PostgreSQL 15 〜 18**
- Windows（手順は PowerShell 想定。Mac/Linux でも同じ流れで可）

### 手順（初回のみ）

```powershell
# 1) 仮想環境を作って Python 依存を入れる
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 2) PostgreSQL をインストール（公式インストーラー）
#    インストール時に「postgres ユーザーのパスワード = secret_password123」「ポート = 5432」を設定

# 3) データベースを作成（ワンクリック）
setup_db.bat        ← ダブルクリック
#    storage_management DB + users テーブル + テストユーザーが作られる
```

> パスワードを `secret_password123` 以外にした場合は、`setup_db.bat` 内の `PGPASSWORD=` の行と、起動時の環境変数 `DB_PASSWORD` を自分のパスワードに合わせてください。

---

## 起動方法

仮想環境を有効化したうえで、**`backend` フォルダから** uvicorn を起動：

```powershell
.\.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload
```

または、ルートから一発で（どちらでもOK）：

```powershell
uvicorn main:app --reload --app-dir backend
```

起動後、ブラウザで <http://127.0.0.1:8000/> にアクセス。

---

## テスト用ログイン情報

`setup_db.bat` を実行すると、以下のユーザーが自動で作られます：

| 項目 | 値 |
|---|---|
| メール | `tanaka@example.com` |
| ユーザー名 | `tarou_tanaka` |
| パスワード | `password123` |
| ロール | `admin` |

### MFA（2段階認証）について
現状はテスト用に **全員強制 MFA + 固定の秘密鍵 `JBSWY3DPEHPK3PXP`** で動いています。
ログイン後に MFA 画面が出るので、下記コマンドで 6 桁コードを取得して入力：

```powershell
.\.venv\Scripts\python.exe -c "import pyotp,time; print('CODE:', pyotp.TOTP('JBSWY3DPEHPK3PXP').now(), '/ 残り', 30-int(time.time())%30, '秒')"
```

または、スマホの認証アプリ（Google Authenticator など）に `JBSWY3DPEHPK3PXP` を手動登録すると、常に有効なコードが見られます。

> ※ この固定キー方式は **テスト用ハック**です。本番では各ユーザーごとに秘密鍵を生成する流れに戻す予定（QR コードの設定画面実装と合わせて）。

---

## API 一覧（主要）

| メソッド | パス | 内容 |
|---|---|---|
| `POST` | `/login` | ログイン（JSON Body）。MFA 必要なら `mfa_required: true` を返す |
| `POST` | `/login/mfa` | MFA コードの検証 |
| `POST` | `/logout` | ログアウト |
| `POST` | `/register` | 新規登録 |
| `GET`  | `/me` | 現在のログイン状態 |
| `GET`  | `/files?sort_by=&order=&page=&per_page=` | ファイル一覧（並び替え対応） |
| `GET`  | `/download/{filename}` | ダウンロード |
| `POST` | `/upload` | アップロード（`multipart/form-data`） |
| `DELETE` | `/delete/{filename}` | 削除（ゴミ箱へ移動） |
| `POST` | `/delete-multiple` | 一括削除 |
| `PATCH` | `/rename/{filename}` | リネーム |
| `GET`  | `/trash` | ゴミ箱一覧 |
| `POST` | `/restore/{filename}` | ゴミ箱から復元 |
| `DELETE` | `/trash/{filename}` | 完全削除 |
| `DELETE` | `/trash` | ゴミ箱を空にする |
| `GET`  | `/shared` | 共有ファイル一覧 |
| `GET`  | `/shared/download/{owner}/{filename}` | 共有ファイル DL（保護時はヘッダー `X-Share-Password`） |
| `POST` | `/share/{filename}` | 自分のファイルを共有（Body の `password` は任意） |
| `POST` | `/share-multiple` | 一括共有 |
| `DELETE` | `/shared/{owner}/{filename}` | 共有解除（本人のみ） |
| `GET`  | `/storage` | 使用容量 |

詳細は起動後 <http://127.0.0.1:8000/docs>（FastAPI 自動生成）で確認できます。

---

## 開発分担

| 担当 | 主な領域 |
|---|---|
| API 担当 A | アップロード（`upload.py`）/ ファイル一覧（`storage.py`） |
| API 担当 B | ダウンロード / 削除 / 共有 / ゴミ箱 / 並び替え / 一括操作（`download.py`） |
| 認証担当 A・B | ログイン / 登録 / MFA / `auth_service.py` / `security/` 一式 |
| DB 担当 | `database/schema.sql` / `db.py` / docker-compose |
| フロント | `frontend/`（HTML / JS / CSS） |

---

## 開発中の注意点

- **起動は必ず `backend/` の中から**（または `--app-dir backend`）。プロジェクトルートで `uvicorn backend.main:app` は今は動きません。
- **`(.venv)` が有効か確認**してから `uvicorn` を実行。無効だとシステム Python が使われ `psycopg2` などが見つからずエラーになります。
- DB の中身（テーブル）は**各自の PC で必要**。`setup_db.bat` で一発作成可能。
- 現状サーバー全体で **同時ログインは 1 人まで**（`_active_session` がモジュールレベル）。本格的なマルチユーザーテストには認証担当のセッション管理改修が必要。
- 共有のパスワードは **bcrypt でハッシュ化**して `uploads/_shared/{owner}/.shared_meta.json` に保存。DL 時はヘッダー `X-Share-Password` で送信（URL には残さない）。

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| `No module named 'routes'` | `cd backend` を忘れている。または `--app-dir backend` を付ける |
| `No module named 'psycopg2'` | `(.venv)` が有効になっていない。`.\.venv\Scripts\Activate.ps1` で有効化 |
| `Connection refused (port 5432)` | PostgreSQL のサービスが止まっている、または未インストール |
| `Could not import module "main"` | `cloud_storage` の中（main.py がある階層）から起動していない |
| `'utf-8' codec can't decode byte 0x83` | DB セットアップが未完了（多くの場合は `setup_db.bat` 実行で解決） |
| 画面が古いまま反映されない | ブラウザのキャッシュ。`Ctrl + Shift + R` で強制リロード |
| ポート 8000 が空かない | 古い uvicorn の残骸。`Get-Process python \| Stop-Process -Force` で全部止める |

---

## ライセンス／備考

卒業研究プロジェクト。社外配布は想定していません。
