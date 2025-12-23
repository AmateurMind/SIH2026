# TestSprite Testing Guide

This directory contains automated tests for the Campus Placement Portal using TestSprite.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env` to `.env.test` for test-specific configuration
   - Ensure MongoDB is running for test database

3. **Test Data:**
   - Test users and data are automatically created/cleaned up
   - See `setup.js` for test data definitions

## Running Tests

### All Tests
```bash
npm test
```

### Specific Test Categories
```bash
npm run test:security    # Security tests only
npm run test:functional  # Functional tests only
npm run test:ui         # UI tests only
```

### Development Mode
```bash
npm run test:watch      # Run tests on file changes
npm run test:coverage   # Generate coverage reports
```

## Test Structure

### Test Files
- `testsprite_frontend_test_plan.json` - Main test suite (15 test cases)
- `setup.js` - Test data management
- `testsprite.config.js` - TestSprite configuration

### Test Categories
- **Security** (High Priority)
  - JWT authentication success/failure
  - Secure PDF generation and viewing

- **Functional** (High Priority)
  - CRUD operations for all entities
  - Application workflows
  - Real-time status updates

- **UI** (Medium Priority)
  - Frontend responsiveness
  - Accessibility compliance

## Test Cases Overview

| ID | Title | Category | Priority |
|----|-------|----------|----------|
| TC001 | JWT Authentication Success | Security | High |
| TC002 | JWT Authentication Failure | Security | High |
| TC003 | Student Profile CRUD | Functional | High |
| TC004 | Internship CRUD by Admin/Recruiter | Functional | High |
| TC005 | Student Application Submission | Functional | High |
| TC006 | Mentor Application Review | Functional | High |
| TC007 | Admin User Management | Functional | High |
| TC008 | Recruiter Application Management | Functional | High |
| TC009 | Secure PDF Generation | Security | High |
| TC010 | Real-time Status Updates | Functional | High |
| TC011 | Frontend Responsiveness | UI | Medium |
| TC012 | Backend API Validation | Error Handling | High |
| TC013 | Mentor Dashboard Filtering | Functional | Medium |
| TC014 | Bulk Operations by Admin | Functional | Medium |
| TC015 | Audit Logging | Security | Medium |

## Writing New Tests

Add new test cases to `testsprite_frontend_test_plan.json`:

```json
{
  "id": "TC016",
  "title": "Resume Builder AI Generation",
  "description": "Verify AI-powered resume content generation works correctly",
  "category": "functional",
  "priority": "Medium",
  "steps": [
    {
      "type": "action",
      "description": "Authenticate as student and access resume builder"
    },
    {
      "type": "action",
      "description": "Generate AI content for summary section"
    },
    {
      "type": "assertion",
      "description": "Verify AI-generated content is professional and relevant"
    }
  ]
}
```

## CI/CD Integration

Add to your GitHub Actions workflow:

```yaml
- name: Run TestSprite Tests
  run: |
    cd backend
    npm ci
    npm test
  env:
    NODE_ENV: test
    MONGODB_URI: ${{ secrets.TEST_MONGODB_URI }}
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection:**
   - Ensure test database is accessible
   - Check `MONGODB_URI` in test environment

2. **Test Data Conflicts:**
   - Tests clean up data automatically
   - Run `npm run test:cleanup` if needed

3. **API Timeouts:**
   - Increase timeout in `testsprite.config.js`
   - Check server startup time

### Debug Mode
```bash
DEBUG=testsprite:* npm test
```

## Test Results

Results are saved to `./test-results/` directory:
- `results.json` - Detailed test results
- `coverage.json` - Coverage metrics
- `security-report.json` - Security findings

## Contributing

1. Add new test cases to the JSON file
2. Update test data in `setup.js` if needed
3. Run tests locally before committing
4. Update this README for new test categories