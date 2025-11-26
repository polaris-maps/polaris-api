# Database Schema & Models

## PostgreSQL Tables

### Location (Buildings)
```sql
CREATE TABLE Location (
    location_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(50),
    defaultLatitude DECIMAL(10,8),
    defaultLongitude DECIMAL(11,8),
    campus_id INTEGER,
    geo_address TEXT
);
```

**Purpose:** Central registry of all campus buildings and locations.

### Door (Building Entrances)
```sql
CREATE TABLE Door (
    door_id SERIAL PRIMARY KEY,
    node_id VARCHAR(50),              -- OpenStreetMap node reference
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    building_id INTEGER REFERENCES Location(location_id),
    is_indoor BOOLEAN DEFAULT FALSE,
    is_emergency BOOLEAN DEFAULT FALSE,
    is_service BOOLEAN DEFAULT FALSE,
    automatic BOOLEAN DEFAULT FALSE,   -- Push-button or motion sensor
    stairs BOOLEAN DEFAULT FALSE       -- Requires stairs to access
);
```

**Purpose:** Accessibility data for all building entrances/exits.

### Ramp (Wheelchair Access)
```sql
CREATE TABLE Ramp (
    ramp_id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    building VARCHAR(255)              -- Building association
);
```

**Purpose:** Wheelchair ramp locations for accessible routing.

### Issue (Accessibility Problems)
```sql
CREATE TABLE Issue (
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
    image TEXT,                        -- Image URL
    categories TEXT[],                 -- Array of issue types
    qna JSONB,                        -- Questions and answers
    avoidPolygon JSONB                -- GeoJSON polygon for routing
);
```

**Purpose:** Community-reported accessibility barriers and obstacles.

### Profile (User Data)
```sql
CREATE TABLE Profile (
    profile_id SERIAL PRIMARY KEY,
    favoriteLocations TEXT[],          -- Array of preferred buildings
    indoorIssueInteractions INTEGER[], -- Issues user has voted on
    indoorIssuesCreated INTEGER[]      -- Issues reported by user
);
```

**Purpose:** User preferences and interaction history.

### ClientLog (Error Tracking)
```sql
CREATE TABLE ClientLog (
    client_log_id SERIAL PRIMARY KEY,
    log_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    log_level VARCHAR(20),             -- error, warning, info
    log_message TEXT,
    file_name VARCHAR(255),
    line_number INTEGER,
    column_number INTEGER,
    additional TEXT                    -- Extra debugging info
);
```

**Purpose:** Client-side error reporting and debugging.

### ApiLog (Request Logging)
```sql
CREATE TABLE ApiLog (
    api_log_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(10),
    url TEXT,
    status_code INTEGER,
    response_time INTEGER,
    user_agent TEXT,
    ip_address INET
);
```

**Purpose:** Server-side request logging (if not using MongoDB).

## MongoDB Collections

### api (Request Logs)
```javascript
{
  _id: ObjectId,
  timestamp: ISODate,
  level: "info",
  message: "HTTP POST /app/route",
  meta: {
    req: {
      method: "POST",
      url: "/app/route",
      headers: {...},
      body: {...}
    },
    res: {
      statusCode: 200,
      responseTime: 450
    }
  }
}
```

**Purpose:** Structured HTTP request logging via Winston.

## Entity Relationships

### Core Relationships
```
Location (1) ←→ (many) Door
    ↓
Building references in:
- Ramp.building (string)
- Issue.location (string)  
- Profile.favoriteLocations (array)
```

### Data Flow
```
Client Request
    ↓
Route Calculation
    ↓
Query Doors by building_id
    ↓
Filter by accessibility attributes
    ↓
Query Issues by categories
    ↓
Apply obstacle avoidance polygons
    ↓
Return optimized route
```

## Data Types & Constraints

### Coordinate Precision
```sql
-- High precision for GPS coordinates
latitude DECIMAL(10,8)   -- 99.99999999 (8 decimal places)
longitude DECIMAL(11,8)  -- -999.99999999 (8 decimal places)
```

### Boolean Accessibility Flags
```sql
-- Door accessibility attributes
automatic BOOLEAN DEFAULT FALSE    -- Push-button activation
stairs BOOLEAN DEFAULT FALSE       -- Ground-level access
is_emergency BOOLEAN DEFAULT FALSE -- Regular vs emergency exit
is_service BOOLEAN DEFAULT FALSE   -- Public vs service entrance
```

### Array Storage
```sql
-- PostgreSQL array types
categories TEXT[]                  -- ['door', 'elevator', 'ramp']
favoriteLocations TEXT[]          -- ['Library', 'Student Union']
indoorIssueInteractions INTEGER[] -- [1, 5, 12, 23]
```

### JSON Storage
```sql
-- Complex structured data
qna JSONB                 -- Questions and answers about issues
avoidPolygon JSONB        -- GeoJSON polygon for obstacle avoidance
```

## Indexing Strategy

### Geospatial Indexes
```sql
-- Speed up coordinate-based queries
CREATE INDEX idx_door_coordinates ON Door (latitude, longitude);
CREATE INDEX idx_issue_coordinates ON Issue (latitude, longitude);
CREATE INDEX idx_ramp_coordinates ON Ramp (latitude, longitude);
```

### Foreign Key Indexes
```sql
-- Optimize building-door relationships
CREATE INDEX idx_door_building ON Door (building_id);
```

### Array Indexes
```sql
-- Speed up category-based issue filtering
CREATE INDEX idx_issue_categories ON Issue USING GIN (categories);
```

## Sample Data

### Location Example
```sql
INSERT INTO Location (full_name, abbreviation, defaultLatitude, defaultLongitude, campus_id)
VALUES ('Davis Library', 'DLIB', 35.910000, -79.050000, 1);
```

### Door Example  
```sql
INSERT INTO Door (latitude, longitude, building_id, automatic, stairs, is_emergency)
VALUES (35.910100, -79.050100, 1, true, false, false);
```

### Issue Example
```sql
INSERT INTO Issue (location, latitude, longitude, description, categories, avoidPolygon)
VALUES (
  'Library Main Entrance',
  35.910000, -79.050000,
  'Automatic door button not working',
  ARRAY['door', 'automatic'],
  '{"type":"Polygon","coordinates":[[[-79.050100,35.909900],[-79.049900,35.909900],[-79.049900,35.910100],[-79.050100,35.910100],[-79.050100,35.909900]]]}'::jsonb
);
```

## Migration Strategy

### Version Control
```sql
-- Track schema versions
CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Safe Migrations
```sql
-- Add columns safely
ALTER TABLE Door ADD COLUMN IF NOT EXISTS width_cm INTEGER;

-- Add indexes concurrently
CREATE INDEX CONCURRENTLY idx_issue_status ON Issue (status);
```
