# Path-to-Path Routing

## Overview
Direct navigation between any two coordinate points with wheelchair accessibility optimization.

## Basic Usage
```bash
curl -X POST http://localhost:5000/app/route \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]]
  }'
```

## Advanced Parameters

### Accessibility Constraints
```json
{
  "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
  "avoid_features": ["steps"],
  "restrictions": {
    "surface_type": "cobblestone:flattened",
    "track_type": "grade1",
    "smoothness_type": "good",
    "maximum_incline": 6
  }
}
```

### Obstacle Avoidance
```json
{
  "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
  "avoid_obstacles": ["construction", "narrow"],
  "avoid_polygons": {
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

## Algorithm Flow
1. **Input validation** - Verify coordinate format `[lng, lat]`
2. **Building detection** - Check if coordinates near building entrances  
3. **Accessibility filtering** - Apply surface, incline, feature restrictions
4. **Obstacle integration** - Query database for current barriers
5. **Route calculation** - External OpenRouteService API call
6. **Response formatting** - Return GeoJSON with accessibility metadata

## Surface Type Analysis

### Wheelchair-Friendly Surfaces
- `paved`, `asphalt`, `concrete` - Smooth, predictable
- `cobblestone:flattened` - Acceptable if well-maintained
- `paving_stones` - Usually accessible

### Challenging Surfaces  
- `cobblestone`, `gravel`, `dirt` - Bumpy, unstable
- `grass`, `sand`, `mud` - Soft, difficult navigation
- `snow`, `ice` - Weather-dependent hazards

## Incline Restrictions
```json
{
  "maximum_incline": 6  // degrees, ADA recommends ≤5%
}
```

**Slope Guidelines:**
- 0-3°: Comfortable for most wheelchairs
- 3-5°: Manageable, may require assistance
- 5-8°: Difficult, power wheelchair recommended
- >8°: Usually avoided by routing system

## Track Quality Levels
```json
{
  "track_type": "grade1"  // OpenStreetMap standard
}
```

**Quality Scale:**
- `grade1`: Solid, best quality (paved roads)
- `grade2`: Mostly solid (gravel roads) 
- `grade3`: Mixed solid/soft (dirt roads)
- `grade4`: Mostly soft (rough tracks)
- `grade5`: Soft (grass, sand paths)

## Response Structure
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [-79.045848, 35.904798],
        [-79.046000, 35.905000],
        [-79.053061, 35.909575]
      ]
    },
    "properties": {
      "segments": [{
        "distance": 1245.7,      // meters
        "duration": 900.3,       // seconds  
        "steps": [{
          "distance": 125.5,
          "duration": 90.2,
          "type": 0,               // turn type
          "instruction": "Head southwest on Campus Drive",
          "name": "Campus Drive",
          "way_points": [0, 15]    // coordinate indices
        }]
      }]
    }
  }]
}
```

## Error Handling

### No Accessible Route
When no wheelchair-accessible path exists between points:
```json
{
  "message": "Route impossible. No accessible path found.",
  "status": 404
}
```

### Invalid Coordinates
```json
{
  "message": "Invalid coordinate format. Use [longitude, latitude]",
  "status": 400
}
```

### External API Failure
```json
{
  "message": "Routing service temporarily unavailable",
  "status": 503
}
```
