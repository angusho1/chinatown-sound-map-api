USE chinatown_sound_map;

CREATE TABLE auth_providers(
	id INT AUTO_INCREMENT,
    name varchar(50),
    PRIMARY KEY (id)
);

INSERT INTO auth_providers (name) values ('google'), ('facebook');

CREATE TABLE auth_users(
	id INT AUTO_INCREMENT,
    provider_user_key varchar(128) NOT NULL,
    user_id INT,
    provider_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES auth_providers(id)
);