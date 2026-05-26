-- ユーザー情報を管理するテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- テスト用の初期データ
INSERT INTO users (username, email) 
VALUES ('tarou_tanaka', 'tanaka@example.com');