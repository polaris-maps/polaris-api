# First API Call

## Test Server Connection
```bash
curl http://localhost:5000/app/
```
**Response:** `{"message":"Your API works! (200)"}`

## Basic Navigation Request
```bash
curl -X POST http://localhost:5000/app/route \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
    "avoid_features": ["steps"]
  }'
```

**Response:** GeoJSON route with wheelchair-accessible path

## Get All Buildings
```bash
curl http://localhost:5000/app/building/all
```

## Report Accessibility Issue
```bash
curl -X POST http://localhost:5000/app/indoorIssue/add \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Main Library Entrance",
    "latitude": 35.910000,
    "longitude": -79.050000,
    "description": "Automatic door not working",
    "categories": ["door", "automatic"]
  }'
```

## Common Response Formats

### Navigation Response
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
        "distance": 125.5,
        "duration": 90.2,
        "steps": [...]
      }]
    }
  }]
}
```

### Error Response
```json
{
  "message": "Route impossible. No accessible path found.",
  "status": 404
}
```

## Next Steps
- Read [Core Concepts](core-concepts.md)
- Explore [Navigation Endpoints](../api/navigation.md)
- Try [Building-to-Building Routing](../navigation/building-to-building.md)
