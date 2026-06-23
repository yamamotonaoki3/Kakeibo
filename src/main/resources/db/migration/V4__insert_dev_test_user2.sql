-- 開発用テストユーザー2（パスワード: test5678）
INSERT INTO users (username, password, display_name)
VALUES ('testuser2', '$2a$10$XdZMXHPpHHHhyp6M3A9ZB.ViFhj2LnlC1Q3vMgKNk7VGrE9NW3R.W', 'テストユーザー2')
ON CONFLICT (username) DO NOTHING;
