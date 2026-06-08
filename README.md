# Cloud Storage（卒研プロジェクト）

ブラウザからファイルをアップロード／ダウンロードできるクラウドストレージ Web アプリ。
ユーザー管理・2段階認証（MFA）・ゴミ箱・共有フォルダ・共有リンク（ギガファイル便方式）・
自動バックアップ・外部通知（Discord/Slack）まで備えた、本格的なファイル管理サービスです。

---

## 主な機能

| 区分 | 機能 |
|---|---|
| 認証 | ログイン / 新規登録 / ログアウト / **2段階認証（MFA）** |
| ファイル | アップロード（複数同時・ZIPまとめ可）/ ダウンロード / 削除（ゴミ箱経由）/ リネーム（拡張子は保護） |
| 一覧 | 並び替え（名前 / 日付 / サイズ）/ ページング / **ファイル名で絞り込み** / **タブUI** / **カテゴリ別自動分類** |
| プレビュー | 画像・PDF・動画・音声・テキストをDLせず**ブラウザ内でプレビュー** |
| お気に入り | ★スターで上部固定（ユーザーごとに保存） |
| 一括操作 | 全選択 / 一括削除 / 一括共有 / **ZIP一括ダウンロード** |
| ゴミ箱 | 一覧 / 復元 / 完全削除 / 空にする |
| 共有フォルダ | 任意のパスワード付きで共有 / 一括共有 / 共有解除 |
| **共有リンク** | URLを知っている人だけDL可（**ログイン不要**）/ 有効期限 / **QRコード表示** |
| バックアップ | 手動・自動バックアップ / 履歴管理 / DL（管理者向け） |
| 外部通知 | アップロード・削除・共有時に Discord / Slack へ Webhook 通知 |
| UI | ライト／ダークテーマ切替 / トースト通知 / 進捗バー / 各種アニメーション |
| セキュリティ | パスワードは bcrypt ハッシュ / RBAC（admin / user / guest）/ パストラバーサル防止 / ログイン試行ロックアウト |

---

## ディレクトリ構成

```
cloud_storage/
├── backend/                        FastAPI アプリ本体
│   ├── main.py                     起動エントリ（ルーター登録・静的配信）
│   ├── schemas.py                  Pydantic モデル（リクエスト/レスポンス）
│   ├── routes/                     API ルート定義
│   │   ├── login.py                ログイン / 登録 / MFA / ログアウト / me
│   │   ├── upload.py               アップロード（拡張子・サイズ制限）
│   │   ├── download.py             DL / 削除 / 共有 / ゴミ箱 / 並び替え / 一括操作 / プレビュー
│   │   ├── storage.py              使用容量
│   │   ├── link.py                 共有リンク（ギガファイル便方式）
│   │   ├── backup.py               バックアップ管理
│   │   └── settings.py             Webhook 通知設定
│   └── services/                   ビジネスロジック
│       ├── auth_service.py         認証・セッション・MFA
│       ├── file_service.py         ファイル操作・共有・ゴミ箱
│       ├── storage_service.py      容量計算
│       ├── link_service.py         共有リンクのトークン管理
│       ├── backup_service.py       バックアップ作成・スケジューラ
│       └── settings_service.py     Webhook 通知送信
├── database/
│   ├── db.py                       PostgreSQL 接続（環境変数で上書き可）
│   └── schema.sql                  users テーブル + テストデータ
├── security/
│   ├── password.py                 bcrypt + 強度チェック + ロックアウト
│   ├── permission.py               RBAC（admin / user / guest）
│   └── logger.py                   app.log への書き込み
├── frontend/                       静的フロントエンド
│   ├── login.html / register.html  ログイン・新規登録
│   ├── files.html                  メイン画面（タブUI）
│   ├── settings.html               設定・プロフィール
│   ├── share.html / share.js       共有リンク受け取りページ（ログイン不要）
│   ├── script.js                   メインのフロントロジック
│   ├── style.css                   スタイル（ライト/ダーク対応）
│   └── favicon.svg                 ファビコン
├── docker/                         Docker 用ファイル（サーバー PC 用）
├── docker-compose.yml              PostgreSQL を docker で立てる場合
├── setup_db.bat                    DB をワンクリックで構築
├── requirements.txt                Python 依存
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

> ⚠️ 環境構築は **3点セット**が必要です。1つでも抜けると起動できません：
> 1. リポジトリ取得
> 2. `.venv` 作成 → **`pip install -r requirements.txt`**（← 忘れやすい！）
> 3. `setup_db.bat` で DB 構築
>
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

起動後、ブラウザで <http://127.0.0.1:8000/> にアクセス（自動でログイン画面へリダイレクト）。

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

> ※ この固定キー方式は **テスト用ハック**です。本番では各ユーザーごとに秘密鍵を生成する流れに戻す予定。

---

## API 一覧

### 認証
| メソッド | パス | 内容 |
|---|---|---|
| `POST` | `/login` | ログイン（JSON Body）。MFA 必要なら `mfa_required: true` |
| `POST` | `/login/mfa` | MFA コードの検証 |
| `POST` | `/logout` | ログアウト |
| `POST` | `/register` | 新規登録 |
| `GET`  | `/me` | 現在のログイン状態 |

### ファイル
| メソッド | パス | 内容 |
|---|---|---|
| `GET`  | `/files?sort_by=&order=&page=&per_page=` | 一覧（並び替え対応） |
| `POST` | `/upload` | アップロード（`multipart/form-data`） |
| `GET`  | `/download/{filename}` | ダウンロード |
| `POST` | `/download-zip` | 選択ファイルをZIPで一括DL |
| `GET`  | `/preview/{filename}` | プレビュー用配信 |
| `PATCH`| `/rename/{filename}` | リネーム（拡張子は変更不可） |
| `DELETE` | `/delete/{filename}` | 削除（ゴミ箱へ移動） |
| `POST` | `/delete-multiple` | 一括削除 |
| `GET`  | `/storage` | 使用容量 |

### ゴミ箱
| メソッド | パス | 内容 |
|---|---|---|
| `GET`  | `/trash` | ゴミ箱一覧 |
| `POST` | `/restore/{filename}` | 復元 |
| `DELETE` | `/trash/{filename}` | 完全削除 |
| `DELETE` | `/trash` | 空にする |

### 共有フォルダ
| メソッド | パス | 内容 |
|---|---|---|
| `GET`  | `/shared` | 共有ファイル一覧 |
| `GET`  | `/shared/download/{owner}/{filename}` | DL（保護時はヘッダー `X-Share-Password`） |
| `GET`  | `/shared/preview/{owner}/{filename}` | 共有ファイルのプレビュー |
| `POST` | `/share/{filename}` | 共有（Body の `password` は任意） |
| `POST` | `/share-multiple` | 一括共有 |
| `DELETE` | `/shared/{owner}/{filename}` | 共有解除（本人のみ） |

### 共有リンク（ギガファイル便方式・受け取り側はログイン不要）
| メソッド | パス | 内容 |
|---|---|---|
| `POST` | `/create-link/{filename}` | 共有ファイルにリンク発行（有効期限を指定可） |
| `GET`  | `/link/{token}/info` | リンク先ファイルの情報 |
| `GET`  | `/link/{token}/download` | リンク経由DL（保護時はヘッダー `X-Link-Password`） |
| `GET`  | `/my-links` | 自分が発行したリンク一覧 |
| `DELETE` | `/link/{token}` | リンク無効化 |

### バックアップ・通知（管理者向け）
| メソッド | パス | 内容 |
|---|---|---|
| `GET` / `POST` | `/backup/settings` | 自動バックアップ設定の取得 / 保存 |
| `POST` | `/backup/run` | 手動バックアップ実行 |
| `GET`  | `/backup/list` | バックアップ履歴 |
| `GET`  | `/backup/download/{filename}` | バックアップDL |
| `DELETE` | `/backup/{filename}` | バックアップ削除 |
| `GET` / `POST` | `/settings/webhook` | Webhook 通知設定 |
| `POST` | `/settings/webhook/test` | テスト通知送信 |

詳細は起動後 <http://127.0.0.1:8000/docs>（FastAPI 自動生成）で確認できます。

---

## 開発分担

| 担当 | 主な領域 |
|---|---|
| API 担当 A | アップロード（`upload.py`）/ ファイル一覧（`storage.py`）/ AI画像検索 |
| API 担当 B | DL / 削除 / 共有 / ゴミ箱 / リンク / 並び替え / 一括操作 / プレビュー（`download.py`, `link.py`） |
| 認証担当 A・B | ログイン / 登録 / MFA / `auth_service.py` / `security/` 一式 |
| DB 担当 | `database/schema.sql` / `db.py` / docker-compose / バックアップ / 通知 |
| フロント | `frontend/`（HTML / JS / CSS） |

---

## 開発中の注意点

- **起動は必ず `backend/` の中から**（または `--app-dir backend`）。プロジェクトルートで `uvicorn backend.main:app` は今は動きません。
- **`(.venv)` が有効か確認**してから `uvicorn` を実行。無効だとシステム Python が使われ `pyotp` / `psycopg2` などが見つからずエラーになります。
- DB の中身（テーブル）は**各自の PC で必要**。`setup_db.bat` で一発作成可能。
- ⚠️ **現状サーバー全体で同時ログインは 1 人まで**（`_active_session` がモジュールレベルのグローバル変数）。複数人が同時にログインすると後の人がセッションを上書きします。**本格的なマルチユーザー運用には認証担当のセッション管理改修（接続ごとのトークン化）が必要**です。
- 共有・リンクのパスワードは **bcrypt でハッシュ化**して保存。DL 時はヘッダー（`X-Share-Password` / `X-Link-Password`）で送信（URL には残さない）。
- お気に入り（★）は**ブラウザの localStorage** にユーザー名ごとに保存。サーバーには保存されないため、別端末では共有されません。
- ⚠️ **マージ時は必ずコンフリクトマーカー（`<<<<<<<` `=======` `>>>>>>>`）を全部消してから commit** してください。残ったままだと全員のサーバーが起動しなくなります。
- ⚠️ **自動生成物（venv / __pycache__ / backups / *.zip）は Git に上げない**（`.gitignore` 設定済み）。

---

## トラブルシューティング

| 症状 | 対処 |
|---|---|
| `No module named 'pyotp'` / `'psycopg2'` 等 | ライブラリ未インストール。`pip install -r requirements.txt` を実行（`(.venv)` 有効状態で） |
| `No module named 'routes'` | `cd backend` を忘れている。または `--app-dir backend` を付ける |
| `Could not import module "main"` | `cloud_storage` の中（main.py がある階層）から起動していない |
| `Connection refused (port 5432)` | PostgreSQL のサービスが止まっている、または未インストール |
| `relation "users" does not exist` | DB のテーブル未作成。`setup_db.bat` を実行 |
| `'utf-8' codec can't decode byte 0x83` | DB セットアップ未完了。`setup_db.bat` を実行 |
| `SyntaxError: <<<<<<< HEAD` | マージのコンフリクトマーカーが残っている。該当ファイルを開いて解消する |
| 画面が古いまま反映されない | ブラウザのキャッシュ。`Ctrl + Shift + R` で強制リロード |
| ポート 8000 が空かない | 古い uvicorn の残骸。`Get-Process python \| Stop-Process -Force` で全部止める |

---

## ライセンス／備考

卒業研究プロジェクト。社外配布は想定していません。
