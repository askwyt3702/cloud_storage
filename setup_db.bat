@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM   Cloud Storage - Database setup script
REM   Creates "storage_management" DB and runs schema.sql
REM   Usage: just double-click this file
REM ============================================================

cd /d "%~dp0"

echo ============================================================
echo   Cloud Storage - Database Setup
echo ============================================================
echo.

REM ---- Locate psql.exe (try PostgreSQL 15..18, then PATH) ----
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
    echo [ERROR] psql.exe was not found.
    echo   Please install PostgreSQL or set its bin folder in PATH.
    echo.
    pause
    exit /b 1
)
echo Using psql: !PSQL!
echo.

REM ---- Connection password (must match db.py defaults) ----
REM   If your postgres password is NOT "secret_password123",
REM   change the line below to your actual password.
set "PGPASSWORD=secret_password123"

REM ---- Tell psql that the input files are UTF-8 ----
REM   schema.sql contains Japanese comments saved as UTF-8.
REM   Without this, Japanese Windows defaults to SJIS and breaks.
set "PGCLIENTENCODING=UTF8"

echo === [1/3] Creating database "storage_management" ===
"!PSQL!" -U postgres -h localhost -c "CREATE DATABASE storage_management WITH ENCODING 'UTF8' TEMPLATE template0;"
echo   ("already exists" error is OK - the DB was already created.)
echo.

echo === [2/3] Creating tables and test user (database\schema.sql) ===
"!PSQL!" -U postgres -h localhost -d storage_management -f "database\schema.sql"
echo.

echo === [3/3] Verifying (the test user should appear) ===
"!PSQL!" -U postgres -h localhost -d storage_management -c "SELECT id, username, email, role FROM users;"
echo.

echo ============================================================
echo  Done!
echo   - If you see "tarou_tanaka / tanaka@example.com" above, success.
echo   - If you got an authentication error, your postgres password
echo     is not "secret_password123". Edit the PGPASSWORD line above
echo     and change it to your actual password.
echo ============================================================
echo.
pause
