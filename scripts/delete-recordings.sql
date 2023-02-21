USE chinatown_sound_map;

DELETE FROM sound_recording_taggings WHERE sound_recording_id != QUOTE('');
DELETE FROM publications WHERE submission_id != QUOTE('');
DELETE FROM submissions WHERE id != QUOTE('');
DELETE FROM sound_recording_images WHERE sound_recording_id != QUOTE('');
DELETE FROM sound_recordings WHERE id != QUOTE('');

DROP TABLE sound_recording_taggings WHERE TRUE;
DROP TABLE publications;
DROP TABLE submissions;
DROP TABLE sound_recording_images;
DROP TABLE sound_recordings;

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

CREATE TABLE sound_recording_taggings(
    tag_id VARCHAR(36),
    sound_recording_id VARCHAR(36),
    PRIMARY KEY (tag_id, sound_recording_id),
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    FOREIGN KEY (sound_recording_id) REFERENCES sound_recordings(id) ON DELETE CASCADE
);
