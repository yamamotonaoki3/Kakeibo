-- 開発用テストユーザー（パスワード: test1234）
-- このユーザーは dev プロファイルの自動ログインで使用される
INSERT INTO users (username, password, display_name)
VALUES ('testuser', '$2a$10$7QVyZJpHmH5BmV5y.b9WTuXhMC5CRn4YkWvKAp0YPxz4UVanK7Bwa', 'テストユーザー')
ON CONFLICT (username) DO NOTHING;
