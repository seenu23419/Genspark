# Testing

This project uses Jest for unit and integration testing. Tests validate request validation, language mapping, rate-limiting, authentication, and execution flows.

## Running Tests

### Run tests once
```bash
npm test
```

### Run tests in watch mode
```bash
npm test:watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

## Test Structure

- `__tests__/mocks.ts` - Mock utilities for requests, responses, and logger
- `__tests__/server.test.ts` - Core execution logic tests (validation, language mapping, timeouts, error handling)

## Test Coverage

Current test suites cover:
- **Request Validation** - Missing language/code, size limits
- **Language Mapping** - Piston & Judge0 language identifiers, case-insensitive handling
- **Rate Limiting** - 30 req/min per IP enforcement
- **Token Authentication** - EXECUTE_API_TOKEN header validation
- **Input Size Limits** - 100kb body size limit, 20000 char code limit
- **Execution Timeout** - 12-second timeout for Judge0 polling
- **Response Format** - Standard execution response structure
- **Error Handling** - Status codes (400, 401, 429, 500)

## CI Integration

Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/ci.yml`):
1. Install dependencies
2. Typecheck with TypeScript
3. Run test suite
4. Build the application
5. Upload coverage to Codecov (optional)

## Adding New Tests

1. Create test files in `__tests__/` with `.test.ts` or `.spec.ts` suffix
2. Import mocks from `__tests__/mocks.ts` if needed
3. Use Jest matchers and assertions
4. Run tests locally before pushing

Example:
```typescript
import { mockRequest, mockResponse } from './mocks';

describe('MyFeature', () => {
  it('should do something', () => {
    const req = mockRequest({ body: { /* ... */ } });
    const res = mockResponse();
    
    expect(res.status).toBeDefined();
  });
});
```
