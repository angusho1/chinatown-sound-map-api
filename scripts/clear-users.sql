USE chinatown_sound_map;
DELETE FROM auth_identities WHERE id > 0;
DELETE FROM users WHERE id > 0;
ALTER TABLE auth_identities AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;
SELECT * FROM users;