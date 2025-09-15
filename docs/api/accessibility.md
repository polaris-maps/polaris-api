# Accessibility Data Management

## Indoor Issues (Accessibility Problems)

### GET /app/indoorIssue/all
List all reported accessibility issues.

**Response:**
```json
[{
  "issue_id": 1,
  "location": "Library Main Entrance",
  "latitude": 35.910000,
  "longitude": -79.050000,
  "description": "Automatic door button not working",
  "status": "open",
  "categories": ["door", "automatic"],
  "votes": 5,
  "datetimeOpen": "2024-09-01T10:30:00Z"
}]
```

### POST /app/indoorIssue/filtered
Filter issues by categories.

**Request:**
```json
{
  "category": ["elevator", "ramp", "door"]
}
```

### POST /app/indoorIssue/add
Report new accessibility issue.

**Request:**
```json
{
  "location": "Student Union South Entrance",
  "latitude": 35.909500,
  "longitude": -79.051000,
  "description": "Ramp is blocked by construction materials",
  "categories": ["ramp", "construction"],
  "avoidPolygon": {
    "type": "Polygon",
    "coordinates": [[
      [-79.051100, 35.909400],
      [-79.050900, 35.909400], 
      [-79.050900, 35.909600],
      [-79.051100, 35.909600],
      [-79.051100, 35.909400]
    ]]
  }
}
```

### PATCH /app/indoorIssue/update/:id
Update issue status or details.

**Request:**
```json
{
  "status": "resolved",
  "datetimeClosed": "2024-09-15T14:20:00Z"
}
```

## User Management

### GET /app/user/all
List user profiles.

### POST /app/user/add
Create user profile.

**Request:**
```json
{
  "favoriteLocations": ["Library", "Student Union"],
  "indoorIssueInteractions": [1, 3, 7],
  "indoorIssuesCreated": [5, 12]
}
```

## Logging Endpoints

### POST /app/log/add
Submit client-side error logs.

**Request:**
```json
{
  "log_timestamp": "2024-09-11T15:30:00Z",
  "log_level": "error",
  "log_message": "Navigation request failed",
  "file_name": "navigation.js",
  "line_number": 45,
  "column_number": 12,
  "additional": "User agent: Mozilla/5.0..."
}
```

### GET /app/clientlog/all
Retrieve client error logs (admin only).

## Issue Categories

### Standard Categories
- **door** - Door accessibility problems
- **elevator** - Elevator issues
- **ramp** - Wheelchair ramp problems
- **narrow** - Passages too narrow
- **construction** - Construction barriers
- **automatic** - Automatic door failures
- **stairs** - Stair-related barriers

### Issue Status Values
- **open** - Newly reported, needs attention
- **in-progress** - Being addressed
- **resolved** - Fixed/completed
- **permanent** - Long-term or design limitation

## Obstacle Avoidance Integration

Issues with `avoidPolygon` data automatically become routing obstacles:

```json
{
  "avoidPolygon": {
    "type": "Polygon",
    "coordinates": [[
      [-79.051000, 35.909000],
      [-79.050000, 35.909000],
      [-79.050000, 35.910000], 
      [-79.051000, 35.910000],
      [-79.051000, 35.909000]
    ]]
  }
}
```

Navigation system queries issues by category and applies polygons as routing constraints:
- `avoid_obstacles: ["construction"]` → Avoids all construction-related polygons
- Real-time updates as issues are added/resolved
