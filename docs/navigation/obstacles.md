# Obstacle Avoidance System

## Overview
Real-time integration of community-reported accessibility barriers into navigation routing.

## Obstacle Categories
- **construction** - Construction zones, blocked areas
- **narrow** - Passages too narrow for wheelchairs
- **temporary** - Temporary barriers (events, maintenance)
- **permanent** - Design limitations, permanent obstacles

## Dynamic Obstacle Integration

### Request with Obstacle Avoidance
```json
{
  "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
  "avoid_obstacles": ["construction", "narrow"],
  "avoid_features": ["steps"]
}
```

### Database Query Process
```javascript
// Query indoor issues by obstacle categories
indoorIssueRoutes.find({ 
  "category": { $in: ["construction", "narrow"] } 
}, "avoidPolygon").exec()
```

### Polygon Generation
Issues with geospatial data become routing obstacles:
```json
{
  "issue_id": 15,
  "categories": ["construction"],
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

## OpenRouteService Integration

### MultiPolygon Avoidance
```javascript
const avoidPolygons = obstacleData.map(obj => obj.avoidPolygon);

let adaptiveNavOptions = {
  avoid_features: ["steps"],
  profile_params: {
    "restrictions": {
      "surface_type": "cobblestone:flattened",
      "maximum_incline": 6
    }
  },
  avoid_polygons: {
    "type": "MultiPolygon",
    "coordinates": avoidPolygons
  }
}
```

### Route Calculation
```javascript
orsDirections.calculate({
  coordinates: [[lng1, lat1], [lng2, lat2]],
  profile: 'wheelchair',
  options: adaptiveNavOptions,
  format: 'geojson'
})
```

## Hardcoded Campus Obstacles

### Predefined Avoidance Areas
```javascript
"avoid_polygons": {
  "type": "MultiPolygon",
  "coordinates": [
    // Gardner Hall construction area
    [[
      ["-79.051700", "35.910300"],
      ["-79.050900", "35.910600"], 
      ["-79.050600", "35.910200"],
      ["-79.051400", "35.90990"],
      ["-79.051700", "35.910300"]
    ]],
    // Connor Hall bus stop area
    [[
      ["-79.050574", "35.910172"],
      ["-79.04985", "35.910457"],
      ["-79.049587", "35.909994"], 
      ["-79.050312", "35.909731"],
      ["-79.050574", "35.910172"]
    ]]
  ]
}
```

## Issue-Based Obstacle Creation

### Reporting Obstacle Issues
```bash
curl -X POST http://localhost:5000/app/indoorIssue/add \
  -H "Content-Type: application/json" \  
  -d '{
    "location": "Library South Entrance",
    "description": "Construction blocking wheelchair ramp",
    "categories": ["construction", "ramp"],
    "latitude": 35.910000,
    "longitude": -79.050000,
    "avoidPolygon": {
      "type": "Polygon",
      "coordinates": [[
        [-79.050100, 35.909900],
        [-79.049900, 35.909900],
        [-79.049900, 35.910100], 
        [-79.050100, 35.910100],
        [-79.050100, 35.909900]
      ]]
    }
  }'
```

### Automatic Route Integration
1. **Issue Created** - Community reports obstacle with polygon
2. **Database Storage** - Issue saved with geospatial data
3. **Route Query** - Navigation requests check for obstacles
4. **Dynamic Avoidance** - Polygon applied to routing constraints
5. **Alternative Path** - System finds accessible route around barrier

## Real-Time Updates

### Issue Status Changes
```bash
# Resolve construction issue
curl -X PATCH http://localhost:5000/app/indoorIssue/update/15 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "datetimeClosed": "2024-09-15T10:00:00Z"  
  }'
```

**Impact:** Resolved issues no longer appear in obstacle queries, automatically removing routing constraints.

### Category-Based Filtering
```javascript
// Only avoid active construction
{
  "avoid_obstacles": ["construction"],
  "status": "open"  // Only active issues
}
```

## Polygon Precision

### Accurate Boundary Definition
```json
{
  "avoidPolygon": {
    "type": "Polygon",
    "coordinates": [[
      [-79.051020, 35.909980],  // Southwest corner
      [-79.050980, 35.909980],  // Southeast corner  
      [-79.050980, 35.910020],  // Northeast corner
      [-79.051020, 35.910020],  // Northwest corner
      [-79.051020, 35.909980]   // Close polygon
    ]]
  }
}
```

**Guidelines:**
- **Precise coordinates** - Use GPS measurements when possible
- **Closed polygons** - First and last coordinates must match
- **Reasonable buffer** - Include safety margin around actual obstacle
- **Regular updates** - Update boundaries as obstacles change

## Error Handling

### Invalid Polygon Data
```json
{
  "message": "Invalid avoidPolygon format. Must be valid GeoJSON Polygon",
  "status": 400
}
```

### No Alternative Route
```json
{
  "message": "Route impossible. All accessible paths blocked by obstacles.",
  "status": 404
}
```

### External Service Error
```json
{
  "message": "Routing service failed to process obstacle avoidance",
  "status": 503
}
```
