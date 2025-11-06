# Swagger API Documentation

This project uses Swagger/OpenAPI 3.0 for API documentation.

## Access Swagger UI

Once the server is running, you can access the interactive API documentation at:

**Local Development:**
```
http://localhost:8000/api-docs
```

## Features

- **Interactive API Testing**: Test all endpoints directly from the browser
- **Request/Response Schemas**: View detailed request body and response formats
- **Authentication**: Support for Bearer JWT token authentication
- **Auto-generated Documentation**: Documentation is generated from JSDoc comments in route files

## Using Authentication in Swagger

Many endpoints require authentication. To test authenticated endpoints:

1. First, use the `/api/v1/auth/login` or `/api/v1/auth/register` endpoint to get a JWT token
2. Click the **"Authorize"** button at the top of the Swagger UI
3. Enter your token in the format: `Bearer YOUR_JWT_TOKEN`
4. Click **"Authorize"** and then **"Close"**
5. Now you can test protected endpoints

## Available Endpoints

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/verify/send` - Send verification email
- `GET /api/v1/auth/verify/{token}` - Verify email with token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/forgot-password/{token}` - Reset password with token

### User Management (`/api/v1/user`)
All user endpoints require authentication.

- `GET /api/v1/user/{id}` - Get user by ID
- `PUT /api/v1/user/{id}` - Update user
- `GET /api/v1/user/{id}/organisations` - Get user's organisations
- `POST /api/v1/user/{id}/organisations` - Create organisation for user
- `GET /api/v1/user/{id}/profile` - Get user profile

### Health Checks
- `GET /` - Root health check
- `GET /health-check` - Server health check
- `GET /api/v1/health` - API v1 health check

## Adding Documentation to New Routes

To document new routes, add JSDoc comments above your route definitions:

```javascript
/**
 * @swagger
 * /api/v1/your-route:
 *   get:
 *     summary: Brief description of endpoint
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 */
router.get('/your-route', yourController);
```

## Configuration

Swagger configuration is located in `config/swagger.config.js`. You can modify:
- API metadata (title, version, description)
- Server URLs
- Security schemes
- Reusable schemas

## Swagger Spec Export

The Swagger specification is also available as JSON at:
```
http://localhost:8000/api-docs.json
```

This can be imported into tools like Postman or used for API testing frameworks.
