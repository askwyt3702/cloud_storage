@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  クラウドストレージ DB セットアップ
REM   - storage_management データベースを作成
REM   - schema.sql でテーブルとテストユーザーを作成
REM  使い方: このファイルをダブルクリックするだけ
REM ============================================================

REM このバッチがある場所（＝プロジェクト直下）へ移動
cd /d "%~dp0"

echo ============================================================
echo   クラウドストレージ データベース セットアップ
echo ============================================================
echo.

REM ===== psql.exe を探す（PostgreSQL 15〜18 と PATH を確認）=====
set "PSQL="
for %%V in (15 16 17 18) do (
    if exist "C:\Program Files\PostgreSQL\%%V\bin\psql.exe" (
        set "PSQL=C:\Program Files\PostgreSQL\%%V\bin\psql.exe"
    )
)
if "!PSQL!"=="" (
    where psql >nul 2>&1 && set "PSQL=psql"
)
if "!PSQL!"=="" (
    echo [エラー] psql.exe が見つかりませんでした。
    echo   PostgreSQL がインストールされているか確認してください。
    echo   見つからない場合は、psql.exe のフルパスを直接指定してください。
    echo.
    pause
    exit /b 1
)
echo 使用する psql : !PSQL!
echo.

REM ===== 接続情報（db.py の既定値と合わせる）=====
REM  ※ PostgreSQL インストール時のパスワードを secret_password123 に
REM     していない場合は、下の行を自分のパスワードに書き換えてください。
set "PGPASSWORD=secret_password123"

echo === [1/3] データベース storage_management を作成 ===
"!PSQL!" -U postgres -h localhost -c "CREATE DATABASE storage_management WITH ENCODING 'UTF8' TEMPLATE template0;"
echo   （"already exists" のエラーは「既に作成済み」という意味なので無視でOK）
echo.

echo === [2/3] テーブルとテストユーザーを作成 (database\schema.sql) ===
"!PSQL!" -U postgres -h localhost -d storage_management -f "database\schema.sql"
echo.

echo === [3/3] 確認（テストユーザーが表示されれば成功）===
"!PSQL!" -U postgres -h localhost -d storage_management -c "SELECT id, username, email, role FROM users;"
echo.

echo ============================================================
echo  完了です。
echo   - 上に tarou_tanaka / tanaka@example.com が出ていれば成功。
echo   - もし password 認証エラーが出た場合は、PostgreSQL の
echo     パスワードが secret_password123 ではありません。
echo     このファイルの PGPASSWORD の行を自分のパスワードに直してください。
echo ============================================================
echo.
pause
