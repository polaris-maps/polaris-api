# Testing Guide

## Running Tests

### Full Test Suite
```bash
npm run mocha
```

### Server Health Check
```bash
npm test
# Starts server on port 5001, tests /app/ endpoint, then stops
```

### Individual Test Files
```bash
npx mocha test/adaptiveNav.test.js --exit
```

## Test Structure

### Framework Setup
```javascript
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();
```

### Test Categories

#### 1. Basic Route Testing
```javascript
describe('/app/route', function() {
  this.timeout(5000);  // Allow time for external API
  
  it('should return valid route', (done) => {
    const requestBody = {
      "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
      "avoid_features": ["steps"]
    };
    
    chai.request('http://localhost:5001')
      .post('/app/route')
      .send(requestBody)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('type').that.equals('FeatureCollection');
        done();
      });
  });
});
```

#### 2. Response Validation
```javascript
// Validate GeoJSON structure
res.body.should.have.property('features').that.is.an('array');
res.body.features[0].should.have.property('geometry');
res.body.features[0].geometry.should.have.property('type').that.equals('LineString');

// Validate route properties
const route = res.body.features[0].properties;
route.should.have.property('segments').that.is.an('array');

// Validate steps
const steps = route.segments[0].steps;
steps.should.be.an('array').with.length.greaterThan(0);
steps.forEach((step) => {
  step.should.have.property('distance').that.is.a('number');
  step.should.have.property('duration').that.is.a('number');
  step.should.have.property('instruction').that.is.a('string');
});
```

## Writing New Tests

### Test Template
```javascript
describe('New Feature Tests', () => {
  it('should handle valid input', (done) => {
    const testData = {
      // Your test data
    };
    
    chai.request('http://localhost:5001')
      .post('/app/your-endpoint')
      .send(testData)
      .end((err, res) => {
        if (err) return done(err);
        
        res.should.have.status(200);
        res.body.should.have.property('expectedField');
        done();
      });
  });
  
  it('should handle invalid input', (done) => {
    chai.request('http://localhost:5001')
      .post('/app/your-endpoint')
      .send({})  // Invalid/empty data
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });
});
```

### Async/Await Pattern
```javascript
it('should return building data', async () => {
  const res = await chai.request('http://localhost:5001')
    .get('/app/building/all');
    
  res.should.have.status(200);
  res.body.should.be.an('array');
});
```

## Database Testing

### Test Database Setup
```javascript
before(async () => {
  // Set up test database
  await pool.query('CREATE TABLE IF NOT EXISTS test_table...');
});

after(async () => {
  // Clean up test data
  await pool.query('DROP TABLE IF EXISTS test_table');
});
```

### Mock External APIs
```javascript
const sinon = require('sinon');

beforeEach(() => {
  // Mock OpenRouteService
  sinon.stub(orsDirections, 'calculate').resolves({
    type: 'FeatureCollection',
    features: [/* mock route data */]
  });
});

afterEach(() => {
  sinon.restore();
});
```

## Common Test Scenarios

### Navigation Tests
```javascript
// Test valid coordinates
{
  "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]]
}

// Test with accessibility constraints  
{
  "coordinates": [[-79.046155, 35.910851], [-79.052946, 35.909613]],
  "avoid_features": ["steps"],
  "restrictions": {
    "surface_type": "cobblestone:flattened",
    "maximum_incline": 6
  }
}

// Test with obstacle avoidance
{
  "coordinates": [[-79.046155, 35.910851], [-79.052946, 35.909613]],
  "avoid_obstacles": ["construction"],
  "avoid_polygons": {
    "type": "Polygon",
    "coordinates": [[...]]
  }
}
```

### Error Handling Tests
```javascript
// Invalid coordinates
it('should reject invalid coordinates', (done) => {
  chai.request('http://localhost:5001')
    .post('/app/route')
    .send({ coordinates: "invalid" })
    .end((err, res) => {
      res.should.have.status(400);
      done();
    });
});

// Missing required fields
it('should require coordinates', (done) => {
  chai.request('http://localhost:5001')
    .post('/app/route')
    .send({})
    .end((err, res) => {
      res.should.have.status(400);
      done();
    });
});
```

## Performance Testing

### Response Time Testing
```javascript
it('should respond within reasonable time', function(done) {
  this.timeout(10000);  // 10 second max
  
  const startTime = Date.now();
  
  chai.request('http://localhost:5001')
    .post('/app/route')
    .send(validRouteRequest)
    .end((err, res) => {
      const responseTime = Date.now() - startTime;
      responseTime.should.be.below(5000);  // Under 5 seconds
      done();
    });
});
```

## Test Configuration

### Environment Variables
```bash
# Test-specific environment
NODE_ENV=test
POSTGRES_URI=postgresql://user:pass@localhost:5432/polaris_test
PORT=5001
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "(timeout --signal=SIGINT 15 node server.js --port=5001; exit 0) & sleep 5s && curl -s http://localhost:5001/app/ && sleep 5s",
    "mocha": "mocha test/*.test.js --exit",
    "test:watch": "mocha test/*.test.js --watch",
    "test:coverage": "nyc mocha test/*.test.js"
  }
}
```

## Debugging Tests

### Console Output
```javascript
// Add debugging output
console.log('Request body:', requestBody);
console.log('Response:', res.body);
```

### Test Isolation
```javascript
// Run single test
npx mocha test/adaptiveNav.test.js --grep "should return valid route"
```

### Error Investigation
```javascript
.end((err, res) => {
  if (err) {
    console.error('Test error:', err);
    console.error('Response body:', res ? res.body : 'No response');
  }
  // Continue with assertions
});
```
