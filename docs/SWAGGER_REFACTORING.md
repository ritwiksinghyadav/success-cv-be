# Swagger Documentation Refactoring

## Overview
The Swagger documentation has been refactored to separate API documentation from route definitions, improving code maintainability and organization.

## Structure

### New Documentation Directory
```
docs/
└── swagger/
    ├── auth.swagger.js           # Authentication endpoints documentation
    ├── user.swagger.js            # User management endpoints documentation
    └── candidate-auth.swagger.js  # Candidate auth endpoints documentation
```

### Updated Configuration
- **File**: `config/swagger.config.js`
- **Change**: Updated `apis` path from `./routes/**/*.js` to `./docs/swagger/**/*.js`
- Now scans only the dedicated documentation directory for Swagger annotations

### Cleaned Route Files
The following route files now contain only business logic without Swagger comments:
- `routes/v1/auth.route.js` - 8 endpoints (register, login, refresh-token, verify, forgot-password)
- `routes/v1/user.route.js` - 7 endpoints (health, CRUD operations, organisations, profile)
- `routes/v1/candidate-auth.route.js` - 7 endpoints (health, bulk register, login, verify, forgot-password)

## Benefits

1. **Separation of Concerns**: Route files now focus solely on routing logic and middleware
2. **Better Maintainability**: Documentation changes don't clutter route definitions
3. **Easier Testing**: Cleaner route files are easier to unit test
4. **Centralized Documentation**: All API docs are in one location
5. **Improved Readability**: Both route files and documentation are more readable

## Swagger UI Access
- **URL**: http://localhost:8000/api-docs/
- **Total Documented Endpoints**: 24
  - Auth: 8 endpoints
  - User: 7 endpoints  
  - Candidate Auth: 7 endpoints
  - Health checks: 2 endpoints

## Documentation Pattern
Each swagger file follows this structure:

```javascript
/**
 * @swagger
 * tags:
 *   - name: [Category Name]
 *     description: [Category Description]
 */

/**
 * @swagger
 * /api/v1/[route]/[path]:
 *   [method]:
 *     summary: [Endpoint summary]
 *     tags: [[Category Name]]
 *     security:
 *       - bearerAuth: []  # If authentication required
 *     parameters:
 *       # Path/query/header parameters
 *     requestBody:
 *       # Request body schema
 *     responses:
 *       # Response schemas for different status codes
 */
```

## Important Field Names
**Critical**: Always use these field names in API documentation:
- `fullname` (NOT `name`)
- `accessToken` (NOT `token`)
- `newPassword` (for password reset, NOT `password`)
- `slug` (required for organisation creation - URL-friendly identifier)

## Next Steps
- Keep documentation synchronized with route implementations
- Add new endpoint documentation to respective swagger files
- Update schemas in `swagger.config.js` when data models change
