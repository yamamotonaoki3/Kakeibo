-- 開発用テストユーザー2のパスワードハッシュを修正（パスワード: test5678）
UPDATE users SET password = '$2b$10$cIjBE8uw1rg3OApPUvU32OpRDkXfsUjhXfx81nV.QdxHpbLaPAV/S'
WHERE username = 'testuser2';
