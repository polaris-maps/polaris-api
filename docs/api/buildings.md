# Building & Location Management

## Building Endpoints

### GET /app/building/all
List all buildings/locations in the system.

**Response:**
```json
[{
  "location_id": 1,
  "full_name": "Davis Library", 
  "abbreviation": "DLIB",
  "defaultLatitude": 35.910000,
  "defaultLongitude": -79.050000,
  "campus_id": 1,
  "geo_address": "208 Raleigh St, Chapel Hill, NC"
}]
```

### GET /app/building/:id
Get specific building details.

### POST /app/building/add
Create new building entry.

**Request:**
```json
{
  "full_name": "New Academic Building",
  "abbreviation": "NAB", 
  "defaultLatitude": 35.910500,
  "defaultLongitude": -79.049500,
  "campus_id": 1,
  "geo_address": "123 Campus Drive"
}
```

## Door Endpoints

### GET /app/door/all
List all building doors with accessibility info.

**Response:**
```json
[{
  "door_id": 1,
  "node_id": "osm_123456",
  "latitude": 35.910100,
  "longitude": -79.050100,
  "building_id": 1,
  "is_indoor": false,
  "is_emergency": false,
  "is_service": false,
  "automatic": true,
  "stairs": false
}]
```

### GET /app/door/filtered/:buildingId
Get doors for specific building.

### POST /app/door/add
Add single door entry.

**Request:**
```json
{
  "node_id": "osm_789012",
  "latitude": 35.910200,
  "longitude": -79.050200,
  "building_id": 1,
  "is_indoor": false,
  "is_emergency": false,
  "is_service": false,
  "automatic": true,
  "stairs": false
}
```

### POST /app/door/add/multiple
Batch door creation with transaction safety.

**Request:**
```json
[{
  "node_id": "osm_111",
  "latitude": 35.910300,
  "longitude": -79.050300,
  "building_id": 1,
  "automatic": false,
  "stairs": true
}, {
  "node_id": "osm_222", 
  "latitude": 35.910400,
  "longitude": -79.050400,
  "building_id": 1,
  "automatic": true,
  "stairs": false
}]
```

## Ramp Endpoints

### GET /app/ramp/all
List all wheelchair ramps.

**Response:**
```json
[{
  "ramp_id": 1,
  "latitude": 35.910000,
  "longitude": -79.050000,
  "building": "Library"
}]
```

### POST /app/ramp/add
Add single ramp location.

**Request:**
```json
{
  "latitude": 35.910050,
  "longitude": -79.050050,
  "building": "Student Union"
}
```

### POST /app/ramp/add/multiple
Batch ramp creation.

## Door Accessibility Attributes

### Key Fields
- **automatic**: `true` for push-button or motion-sensor doors
- **stairs**: `true` if stairs required to reach door
- **is_emergency**: `true` for emergency exits (may be locked)
- **is_service**: `true` for service entrances
- **is_indoor**: `true` for interior doors

### Filtering Logic
Navigation system automatically applies filters:
- `exclude_stairs: true` → Only doors with `stairs: false`
- `require_automatic: true` → Only doors with `automatic: true`
- Emergency doors excluded from routing by default

## Database Relationships
```
Location (buildings)
  ↓ (1:many)
Door (entrances/exits)

Ramp (accessibility features)
  → building (string reference)
```
