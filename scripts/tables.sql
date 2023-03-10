CREATE DATABASE chinatown_sound_map;
USE chinatown_sound_map;

CREATE TABLE sound_recordings(
    id VARCHAR(36),
    title VARCHAR(100) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    file_location VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    description TEXT,
    date_recorded DATE,
    latitude DECIMAL(19, 15),
    longitude DECIMAL(19, 15),
    PRIMARY KEY (id)
);

CREATE TABLE sound_recording_images(
    sound_recording_id VARCHAR(36),
    file_location VARCHAR(200) NOT NULL,
    PRIMARY KEY (sound_recording_id, file_location),
    FOREIGN KEY (sound_recording_id) REFERENCES sound_recordings(id) ON DELETE CASCADE
);

CREATE TABLE locations(
    id INT AUTO_INCREMENT,
    latitude DECIMAL(19, 15),
    longitude DECIMAL(19, 15),
    name VARCHAR(150),
    PRIMARY KEY (id)
);

CREATE TABLE users(
    id INT AUTO_INCREMENT,
    username VARCHAR(50),
    email VARCHAR(50),
    creation_date TIMESTAMP,
    hashed_password CHAR(60),
    PRIMARY KEY (id)
);

CREATE TABLE submissions(
    id VARCHAR(36),
    sound_recording_id VARCHAR(36),
    email VARCHAR(50) NOT NULL,
    date_created TIMESTAMP NOT NULL,
    status TINYINT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (sound_recording_id) REFERENCES sound_recordings(id) ON DELETE SET NULL
);

CREATE TABLE publications(
    submission_id VARCHAR(36),
    date_approved TIMESTAMP NOT NULL,
    PRIMARY KEY (submission_id, date_approved),
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE auth_providers(
	id INT AUTO_INCREMENT,
    name VARCHAR(50),
    PRIMARY KEY (id)
);

INSERT INTO auth_providers (name) VALUES ('google'), ('facebook');

CREATE TABLE auth_users(
	id INT AUTO_INCREMENT,
    provider_user_key VARCHAR(128) NOT NULL,
    user_id INT,
    provider_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES auth_providers(id)
);

CREATE TABLE tags(
    id VARCHAR(36),
    name VARCHAR(50) UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE sound_recording_taggings(
    tag_id VARCHAR(36),
    sound_recording_id VARCHAR(36),
    PRIMARY KEY (tag_id, sound_recording_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (sound_recording_id) REFERENCES sound_recordings(id) ON DELETE CASCADE
);
