# Core Concepts

## Accessibility-First Design
Every route calculation prioritizes wheelchair and mobility device access:
- **Avoid stairs** by default
- **Surface quality** analysis (smooth vs rough)
- **Incline limitations** for wheelchair safety
- **Door accessibility** (automatic, width, emergency exits)

## Key Data Models

### Coordinates
All locations use `[longitude, latitude]` format (GeoJSON standard)
```json
[-79.045848, 35.904798]  // [lng, lat] NOT [lat, lng]
```

### Buildings & Doors
- **Buildings** have multiple **doors** (entrances/exits)
- Each door has accessibility attributes (automatic, stairs, emergency)
- Routing automatically selects optimal doors for wheelchair access

### Indoor Issues
Community-reported accessibility problems:
- **Temporary**: Broken elevator, blocked ramp
- **Permanent**: Construction, design barriers
- **Categories**: door, elevator, ramp, narrow, construction

## Navigation Types

### 1. Point-to-Point
Direct routing between two coordinates
```json
{
  "coordinates": [[lng1, lat1], [lng2, lat2]]
}
```

### 2. Building-to-Building
Intelligent door selection for optimal accessibility
```json
{
  "source_building": "Library",
  "destination_building": "Student Union"
}
```

### 3. Location-to-Building
Find best entrance from current position
```json
{
  "longitude": -79.045848,
  "latitude": 35.904798,
  "destination": "Library"
}
```

## Routing Constraints

### Surface Types
- `paved`, `asphalt`, `concrete` - Wheelchair friendly
- `cobblestone`, `gravel`, `dirt` - May be difficult
- `grass`, `sand`, `mud` - Usually avoided

### Restrictions
```json
{
  "surface_type": "cobblestone:flattened",
  "track_type": "grade1",           // Best quality
  "smoothness_type": "good",
  "maximum_incline": 6              // Max slope in degrees
}
```

### Obstacle Avoidance
Real-time barriers from community reports:
- `construction` - Construction zones
- `narrow` - Passages too narrow for wheelchairs

## API Response Flow
1. **Request validation** - Check required parameters
2. **Building detection** - Identify nearby buildings
3. **Door optimization** - Select accessible entrances
4. **Obstacle integration** - Apply current barriers
5. **Route calculation** - Generate wheelchair path
6. **GeoJSON response** - Return navigation data

## Error Handling
- `404` - No accessible route found
- `400` - Invalid request parameters
- `500` - Server or external API error
- `429` - Rate limit exceeded
