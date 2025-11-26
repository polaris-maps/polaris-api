-- Polaris API Database Schema
-- PostgreSQL Tables for Accessibility Navigation

-- Location (Buildings)
CREATE TABLE IF NOT EXISTS Location (
    location_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(50),
    defaultLatitude DECIMAL(10,8),
    defaultLongitude DECIMAL(11,8),
    campus_id INTEGER,
    geo_address TEXT
);

-- Door (Building Entrances)
CREATE TABLE IF NOT EXISTS Door (
    door_id SERIAL PRIMARY KEY,
    node_id VARCHAR(50),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    building_id INTEGER REFERENCES Location(location_id),
    is_indoor BOOLEAN DEFAULT FALSE,
    is_emergency BOOLEAN DEFAULT FALSE,
    is_service BOOLEAN DEFAULT FALSE,
    automatic BOOLEAN DEFAULT FALSE,
    stairs BOOLEAN DEFAULT FALSE
);

-- Ramp (Wheelchair Access)
CREATE TABLE IF NOT EXISTS Ramp (
    ramp_id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    building VARCHAR(255)
);

-- Issue (Accessibility Problems)
CREATE TABLE IF NOT EXISTS Issue (
    issue_id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    datetimeOpen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    datetimeClosed TIMESTAMP,
    datetimePermanent TIMESTAMP,
    votes INTEGER DEFAULT 0,
    image TEXT,
    categories TEXT[],
    qna JSONB,
    avoidPolygon JSONB
);

-- Profile (User Data)
CREATE TABLE IF NOT EXISTS Profile (
    profile_id SERIAL PRIMARY KEY,
    favoriteLocations TEXT[],
    indoorIssueInteractions INTEGER[],
    indoorIssuesCreated INTEGER[]
);

-- ClientLog (Error Tracking)
CREATE TABLE IF NOT EXISTS ClientLog (
    client_log_id SERIAL PRIMARY KEY,
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_level VARCHAR(20),
    log_message TEXT,
    file_name VARCHAR(255),
    line_number INTEGER,
    column_number INTEGER,
    additional TEXT
);

-- ApiLog (Request Logging)
CREATE TABLE IF NOT EXISTS ApiLog (
    api_log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(10),
    url TEXT,
    status_code INTEGER,
    response_time INTEGER,
    user_agent TEXT,
    ip_address INET
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_door_coordinates ON Door (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_issue_coordinates ON Issue (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_ramp_coordinates ON Ramp (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_door_building ON Door (building_id);
CREATE INDEX IF NOT EXISTS idx_issue_categories ON Issue USING GIN (categories);
