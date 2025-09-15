# Installation

## Prerequisites
- Node.js 16+ 
- PostgreSQL 13+
- MongoDB (for logging)

## Setup
```bash
# Clone and install
git clone https://github.com/polaris-maps/polaris-api.git
cd polaris-api
npm install

# Environment configuration
cp config.env.example config.env
# Edit config.env with your database credentials and API keys
```

## Environment Variables
```bash
# PostgreSQL
POSTGRES_URI=postgresql://user:pass@localhost:5432/polaris

# MongoDB (logging)
ATLAS_URI_LOGS=mongodb://localhost:27017/polaris_logs

# OpenRouteService API
ORS_API_KEY=your_openrouteservice_api_key

# Database connection details
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=polaris
```

## Database Setup
```sql
-- Create PostgreSQL database
CREATE DATABASE polaris;

-- Required tables (basic structure)
CREATE TABLE Location (
    location_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    abbreviation VARCHAR(50),
    defaultLatitude DECIMAL,
    defaultLongitude DECIMAL
);

CREATE TABLE Door (
    door_id SERIAL PRIMARY KEY,
    latitude DECIMAL,
    longitude DECIMAL,
    building_id INTEGER REFERENCES Location(location_id),
    is_emergency BOOLEAN DEFAULT FALSE,
    automatic BOOLEAN DEFAULT FALSE,
    stairs BOOLEAN DEFAULT FALSE
);

CREATE TABLE Issue (
    issue_id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    latitude DECIMAL,
    longitude DECIMAL,
    description TEXT,
    categories TEXT[],
    status VARCHAR(50) DEFAULT 'open'
);
```

## Start Server
```bash
# Development
npm start

# Test connection
curl http://localhost:5000/app/
# Expected: {"message":"Your API works! (200)"}
```

## Verify Setup
```bash
# Run tests
npm run mocha

# Check database connection
curl http://localhost:5000/app/test-db
```
