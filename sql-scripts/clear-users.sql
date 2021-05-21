USE chinatown_sound_map;
DELETE FROM users WHERE id > 0;
ALTER TABLE users AUTO_INCREMENT = 1;
SELECT * FROM users;