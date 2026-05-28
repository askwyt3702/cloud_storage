-- ユーザー情報を管理するテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テスト用の初期データ（田中太郎さん）
-- パスワードは仮で 'password123' などが入る想定です
INSERT INTO users (username, password_hash, email)
VALUES ('tarou_tanaka', 'hashed_password_here', 'tanaka@example.com')
ON CONFLICT (email) DO NOTHING;
