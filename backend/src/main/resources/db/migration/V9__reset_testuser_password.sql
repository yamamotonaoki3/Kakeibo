-- 開発用テストユーザーのパスワードをリセット（パスワード: test1234）
UPDATE users SET password = '$2b$10$Fqw8NczZ8ogKKDJHDJE3J.1umqVceU/TpTO.BPonCVkb6TTmGs9JW'
WHERE username = 'testuser';
