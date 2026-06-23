-- testuser2a の表示名を修正（testuser2 と区別できるように）
UPDATE users SET display_name = 'テストユーザー2a' WHERE username = 'testuser2a';

-- testuser2a のパスワードをリセット（パスワード: test5678）
UPDATE users SET password = '$2b$10$cIjBE8uw1rg3OApPUvU32OpRDkXfsUjhXfx81nV.QdxHpbLaPAV/S'
WHERE username = 'testuser2a';
