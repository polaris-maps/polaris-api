# Navigation Endpoints

## POST /app/route
**Primary routing endpoint with full accessibility support**

### Request
```json
{
  "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
  "avoid_features": ["steps"],
  "avoid_obstacles": ["construction", "narrow"],
  "restrictions": {
    "surface_type": "cobblestone:flattened",
    "track_type": "grade1",
    "smoothness_type": "good", 
    "maximum_incline": 6
  },
  "source_building": "Library",          // Optional: auto door selection
  "destination_building": "Student Union", // Optional: auto door selection
  "exclude_stairs": true,                // Optional: filter door selection
  "require_automatic": false             // Optional: require automatic doors
}
```

### Response
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString", 
      "coordinates": [[-79.045848, 35.904798], ...]
    },
    "properties": {
      "segments": [{
        "distance": 245.7,
        "duration": 180.3,
        "steps": [{
          "distance": 125.5,
          "duration": 90.2,
          "type": 0,
          "instruction": "Head southwest",
          "name": "Campus Drive",
          "way_points": [0, 15]
        }]
      }]
    }
  }]
}
```

## POST /app/route/minimize-door-distance
**Optimized building-to-building routing with door selection**

### Request
```json
{
  "source": "Library",
  "destination": "Student Union",
  "maximum_number_results": 1,
  "exclude_stairs": true,
  "require_automatic": false
}
```

### Response
```json
{
  "SourceDoorCoordinates": [-79.045900, 35.904850],
  "DestinationDoorCoordinates": [-79.053100, 35.909600],
  "distance": 450.2
}
```

## POST /app/route/to-door
**Find best building entrance from current location**

### Request
```json
{
  "longitude": -79.045848,
  "latitude": 35.904798,
  "destination": "Library",
  "exclude_stairs": true,
  "require_automatic": false
}
```

### Response
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
    "stairs": false
  },
  "duration": 120.5
}
```

## GET /app/route/hardcodedtest
**Test endpoint with predefined route**

Returns sample route data for testing integration.

## Error Responses

### No Accessible Route
```json
{
  "message": "Route impossible. No accessible path found.",
  "status": 404
}
```

### Missing Building Doors
```json
{
  "message": "Route impossible. (No destination doors exist with those attributes.)",
  "status": 500
}
```

### Invalid Parameters
```json
{
  "message": "Missing required coordinates",
  "status": 400
}
```

## Route Calculation Process
1. **Coordinate validation** - Ensure valid lat/lng pairs
2. **Building detection** - Check if coordinates near buildings
3. **Door filtering** - Apply accessibility constraints
4. **Matrix calculation** - Compute door-to-door distances
5. **Optimization** - Select best door pair
6. **Obstacle integration** - Apply real-time barriers
7. **External routing** - Use OpenRouteService for path
8. **Response formatting** - Return GeoJSON result
