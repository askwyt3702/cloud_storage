-- ユーザー情報を管理するテーブル（MFA機能付き）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mfa_secret VARCHAR(32),                  -- 【追加】MFA用の秘密鍵（シークレットキー）を保存する場所
    mfa_enabled BOOLEAN DEFAULT FALSE,       -- 【追加】MFAが有効かどうか（初期値は無効: FALSE）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テスト用の初期データ（田中太郎さん）
-- パスワードは仮で 'password123' などが入る想定です
INSERT INTO users (username, password_hash, email, mfa_enabled)
VALUES ('tarou_tanaka', 'hashed_password_here', 'tanaka@example.com', FALSE)
ON CONFLICT (email) DO NOTHING;
