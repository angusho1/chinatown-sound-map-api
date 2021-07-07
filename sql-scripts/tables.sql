USE chinatown_sound_map;

CREATE TABLE sound_clips(
    id INT AUTO_INCREMENT,
    title VARCHAR(100),
    author VARCHAR(100),
    description TEXT,
    date DATE,
    content TEXT,
    latitude DECIMAL(19, 15),
    longitude DECIMAL(19, 15),
    PRIMARY KEY (id)
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
    id INT AUTO_INCREMENT,
    date_submitted TIMESTAMP,
    date_approved TIMESTAMP,
    date_rejected TIMESTAMP,
    soundclip_id INT,
    status TINYINT(1),
    user_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (soundclip_id) REFERENCES sound_clips(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
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