# Building-to-Building Navigation

## Overview
Intelligent routing between buildings with automatic door selection for optimal wheelchair accessibility.

## Basic Building Routing
```bash
curl -X POST http://localhost:5000/app/route \
  -H "Content-Type: application/json" \
  -d '{
    "source_building": "Library",
    "destination_building": "Student Union",
    "exclude_stairs": true,
    "require_automatic": false
  }'
```

## Door Optimization Endpoint
```bash
curl -X POST http://localhost:5000/app/route/minimize-door-distance \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Library", 
    "destination": "Student Union",
    "maximum_number_results": 1,
    "exclude_stairs": true,
    "require_automatic": true
  }'
```

**Response:**
```json
{
  "SourceDoorCoordinates": [-79.045900, 35.904850],
  "DestinationDoorCoordinates": [-79.053100, 35.909600], 
  "distance": 450.2
}
```

## Door Selection Algorithm

### 1. Filter Available Doors
```javascript
// Automatic filtering based on parameters
let doorAttributes = {
  "emergency": false  // Always exclude emergency exits
};

if (exclude_stairs) {
  doorAttributes.stairs = false;
}

if (require_automatic) {
  doorAttributes.automatic = true;
}
```

### 2. Matrix Distance Calculation
```javascript
// Calculate distances between all source/destination door pairs
orsMatrix.calculate({
  locations: [...sourceDoorsLocations, ...destinationDoorsLocations],
  profile: "foot-walking",
  sources: Array.from({length: sourceDoors.length}, (_, i) => i),
  destinations: Array.from({length: destDoors.length}, (_, i) => i + sourceDoors.length)
})
```

### 3. Optimal Pair Selection
```javascript
// Find shortest door-to-door distance
let minDistance = Infinity;
let closestPair = { sourceIndex: -1, destinationIndex: -1 };

for (let i = 0; i < sourceLocations.length; i++) {
  for (let j = 0; j < destLocations.length; j++) {
    let distance = json.durations[i][j];
    if (distance < minDistance) {
      minDistance = distance;
      closestPair = { sourceIndex: i, destinationIndex: j };
    }
  }
}
```

## Location-to-Building Routing
Find the best building entrance from current position:

```bash
curl -X POST http://localhost:5000/app/route/to-door \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": -79.045848,
    "latitude": 35.904798,
    "destination": "Library",
    "exclude_stairs": true
  }'
```

**Response:**
```json
{
  "start": {
    "longitude": -79.045848,
    "latitude": 35.904798
  },
  "end": {
    "longitude": -79.045900,
    "latitude": 35.904850,
    "door_id": 123,
    "automatic": true,
    "stairs": false,
    "building_id": 1
  },
  "duration": 120.5
}
```

## Door Accessibility Attributes

### Primary Filters
- **stairs**: `true` if stairs required to reach door
- **automatic**: `true` for push-button or motion-sensor doors  
- **emergency**: `true` for emergency exits (usually locked)
- **is_service**: `true` for service/delivery entrances

### Building Door Types
```json
{
  "door_id": 45,
  "building_id": 1,
  "latitude": 35.910100,
  "longitude": -79.050100,
  "automatic": true,     // Push-button activation
  "stairs": false,       // Ground-level access
  "is_emergency": false, // Regular entrance
  "is_service": false,   // Public entrance
  "is_indoor": false     // Exterior door
}
```

## Fallback Behavior
When no suitable doors are found:
1. **Log warning** - "No doors meet accessibility criteria"
2. **Use original coordinates** - Fall back to basic point-to-point routing
3. **Return route** - Still attempt navigation with user-provided coordinates

```javascript
if (sourceDoors.length < 1 || destinationDoors.length < 1) {
  resolve({ useOriginal: true });
}
```

## Integration with Main Routing
Building-to-building routing automatically integrates with the main `/app/route` endpoint:

```json
{
  "coordinates": [[-79.045000, 35.904000], [-79.053000, 35.909000]],
  "source_building": "Library",
  "destination_building": "Student Union",
  "exclude_stairs": true,
  "avoid_features": ["steps"],
  "restrictions": {
    "maximum_incline": 6
  }
}
```

**Process:**
1. Override coordinates with optimal door locations
2. Apply standard accessibility constraints
3. Integrate obstacle avoidance
4. Generate complete wheelchair-accessible route

## Error Scenarios

### No Accessible Doors
```json
{
  "message": "Route impossible. (No destination doors exist with those attributes.)",
  "status": 500
}
```

### Building Not Found
```json
{
  "message": "Building 'Unknown Building' not found in database",
  "status": 404
}
```

### Database Error
```json
{
  "message": "Database connection failed during door lookup",
  "status": 500
}
```
