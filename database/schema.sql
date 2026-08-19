-- Allergy Guard database schema
-- Covers the Sprint 1 core loop: users, profiles, and scan history.

CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE allergy_profiles (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER REFERENCES users(id) ON DELETE CASCADE,
    allergy_categories      TEXT[] DEFAULT '{}',
    severity                JSONB DEFAULT '{}',
    emergency_medication    VARCHAR(255),
    emergency_contact_name  VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scan_history (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER REFERENCES users(id) ON DELETE CASCADE,
    scan_type         VARCHAR(20) NOT NULL,
    barcode           VARCHAR(50),
    product_name      VARCHAR(255),
    ingredient_text   TEXT,
    verdict           VARCHAR(20) NOT NULL,
    flagged_allergens JSONB DEFAULT '[]',
    scanned_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE reactions (
    id             SERIAL PRIMARY KEY,
    user_id        INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_name   VARCHAR(255),
    symptoms       TEXT,
    severity       VARCHAR(20),
    medication_taken VARCHAR(255),
    photo_url      VARCHAR(500),
    notes          TEXT,
    logged_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scan_history_user ON scan_history(user_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
