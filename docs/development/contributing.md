# Contributing to Polaris API

## Quick Start

### 1. Setup
```bash
git clone https://github.com/polaris-maps/polaris-api.git
cd polaris-api
npm install
cp config.env.example config.env
# Add your database credentials and API keys
```

### 2. Make Your Changes
```bash
git checkout -b feature/cool-new-thing
# Write some code, add tests
npm run lint && npm test
git commit -m "add cool new thing"
git push origin feature/cool-new-thing
```

### 3. Create Pull Request
- Make sure CI/CD passes ✅
- That's it! We'll review and merge

## Coding Standards

### ESLint Configuration
We use ESLint for code quality enforcement:
```javascript
{
  "rules": {
    "no-console": "warn",           // Avoid console.log in production
    "no-unused-vars": "error",      // Remove unused variables
    "prefer-const": "error",        // Use const when possible
    "semi": ["error", "always"],    // Require semicolons
    "quotes": ["error", "single"],  // Use single quotes
    "indent": ["error", 4]          // 4-space indentation
  }
}
```

### Code Style Guidelines

#### Function Naming
```javascript
// Use descriptive, camelCase names
function calculateOptimalDoorPair(sourceDoors, destinationDoors) {
  // Implementation
}

// Async functions should be clear
async function queryAccessibleDoors(buildingId, filters) {
  // Implementation
}
```

#### Error Handling
```javascript
// Consistent error handling pattern
router.post('/app/endpoint', async (req, res, next) => {
  try {
    const result = await someAsyncOperation();
    res.status(200).json({
      message: "Success message",
      data: result
    });
  } catch (error) {
    next(error);  // Pass to global error handler
  }
});
```

#### Database Queries
```javascript
// Use parameterized queries (never string concatenation)
const { rows } = await pool.query(
  'SELECT * FROM Door WHERE building_id = $1 AND stairs = $2',
  [buildingId, false]
);

// Consistent response format
res.status(200).json({
  message: "Successfully retrieved doors",
  data: rows
});
```

#### Comments and Documentation
```javascript
/**
 * Calculates optimal door pair for building-to-building navigation
 * @param {Array} sourceDoors - Available source building doors
 * @param {Array} destDoors - Available destination building doors
 * @param {Object} filters - Accessibility filters (stairs, automatic)
 * @returns {Promise<Object>} Optimal door coordinates and distance
 */
async function selectOptimalDoors(sourceDoors, destDoors, filters) {
  // Implementation with clear inline comments
}
```

## Testing Requirements

### Test Coverage
All new features must include tests:
```javascript
describe('New Feature', () => {
  it('should handle valid input', async () => {
    const response = await chai.request(app)
      .post('/app/new-endpoint')
      .send(validTestData);
      
    response.should.have.status(200);
    response.body.should.have.property('data');
  });
  
  it('should reject invalid input', async () => {
    const response = await chai.request(app)
      .post('/app/new-endpoint')  
      .send(invalidTestData);
      
    response.should.have.status(400);
  });
});
```

### Database Tests
```javascript
describe('Database Operations', () => {
  beforeEach(async () => {
    // Set up test data
    await pool.query('INSERT INTO test_table...');
  });
  
  afterEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM test_table WHERE...');
  });
});
```

## Documentation Updates

### API Documentation
When adding/modifying endpoints, update:
- `docs/api/` - Endpoint documentation
- `docs/navigation/` - Navigation-specific features
- Code comments with JSDoc format

### README Updates
Update relevant README files when changing:
- Installation procedures
- Environment variables
- Dependencies

## Pull Requests

Keep it simple:
- Descriptive title (what you did)
- Brief description in the PR
- Make sure CI/CD passes
- Reference any related issues

We'll handle the rest during review!

## Issue Reporting

### Bug Reports
```markdown
## Bug Description
Clear description of the issue.

## Steps to Reproduce
1. Make request to `/app/route`
2. Use coordinates `[...]`
3. Observe error response

## Expected Behavior
Should return valid route.

## Actual Behavior
Returns 500 error.

## Environment
- Node.js version: 18.x
- OS: macOS/Linux/Windows
- Database: PostgreSQL 13
```

### Feature Requests
```markdown
## Feature Description
Describe the new accessibility feature needed.

## Use Case
Explain why this feature would benefit wheelchair users.

## Proposed Solution
Suggest implementation approach if known.

## Acceptance Criteria
- [ ] Feature works with existing routing
- [ ] Includes proper error handling
- [ ] Has test coverage
- [ ] Documentation is updated
```

## What We Look For

- Does it help wheelchair users? 🎯
- Does it break anything? 🔧
- Are there tests? ✅
- Does CI/CD pass? 🚀

That's about it! We're pretty chill.

## Release Schedule

We do monthly releases using weekly branches:
- `develop/2025.40` (week 40 of 2025)
- `develop/2025.41` (week 41 of 2025)
- etc.

Features merge to the current develop branch, then we cut releases monthly.
