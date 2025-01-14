-- Create tables for items, users, and feedback
CREATE TABLE IF NOT EXISTS items (
    item_id TEXT PRIMARY KEY,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    categories JSON NOT NULL DEFAULT '[]',
    time_stamp TIMESTAMP NOT NULL DEFAULT '0001-01-01',
    labels JSON NOT NULL DEFAULT '{}',
    comment TEXT NOT NULL DEFAULT '',
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    labels JSON NOT NULL DEFAULT '{}',
    subscribe JSON NOT NULL DEFAULT '{}',
    comment TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS feedbacks (
    feedback_type TEXT,
    user_id TEXT,
    item_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    comment TEXT DEFAULT '',
    PRIMARY KEY (feedback_type, user_id, item_id)
); 