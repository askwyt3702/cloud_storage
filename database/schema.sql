-- ユーザー情報を管理するテーブル（MFA機能付き、権限管理付き）
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'user',         -- 【追加】ロール（admin / user / guest）
    mfa_secret VARCHAR(32),                  -- 【追加】MFA用の秘密鍵（シークレットキー）を保存する場所
    mfa_enabled BOOLEAN DEFAULT FALSE,       -- 【追加】MFAが有効かどうか（初期値は無効: FALSE）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テスト用の初期データ（田中太郎さん）
-- パスワード: 'password123'
INSERT INTO users (username, password_hash, email, role, mfa_enabled)
VALUES ('tarou_tanaka', '$2b$12$YwtQUzcw1hw0DUYpiBCMU.xVPWbtoCt9OqWQD0Hja3LjO2YF4Td02', 'tanaka@example.com', 'admin', FALSE)
ON CONFLICT (email) DO NOTHING;
