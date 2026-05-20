# ZenCode AI API Documentation

## Base URL

```
https://api.zencode.ai/api
```

## Authentication

All API requests (except login/signup) require a Bearer token:

```
Authorization: Bearer <accessToken>
```

## Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "data": {
    // Response payload
  },
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Authentication Endpoints

### Login

```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 3600
    }
  }
}
```

### Signup

```
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response 201:
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

### Get Current User

```
GET /auth/me
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

## Projects Endpoints

### List Projects

```
GET /projects?limit=10&offset=0
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "project-id",
        "name": "My Project",
        "description": "...",
        "language": "javascript",
        "owner": "user-id",
        "members": [
          {
            "userId": "user-id",
            "role": "owner"
          }
        ],
        "visibility": "private",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "stars": 5,
        "forks": 2
      }
    ],
    "total": 1,
    "limit": 10,
    "offset": 0
  }
}
```

### Create Project

```
POST /projects
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "New Project",
  "description": "Project description",
  "language": "typescript",
  "visibility": "private"
}

Response 201:
{
  "success": true,
  "data": {
    "project": { ... }
  }
}
```

### Get Project

```
GET /projects/:projectId
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "project": { ... }
  }
}
```

### Update Project

```
PUT /projects/:projectId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "visibility": "public"
}

Response 200:
{
  "success": true,
  "data": {
    "project": { ... }
  }
}
```

### Delete Project

```
DELETE /projects/:projectId
Authorization: Bearer <accessToken>

Response 204: No Content
```

## Files Endpoints

### List Files

```
GET /files/project/:projectId
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "files": [
      {
        "_id": "file-id",
        "projectId": "project-id",
        "name": "index.js",
        "language": "javascript",
        "content": "...",
        "size": 1024,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "version": 1
      }
    ]
  }
}
```

### Create File

```
POST /files
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "projectId": "project-id",
  "name": "app.js",
  "language": "javascript",
  "content": "// Initial content"
}

Response 201:
{
  "success": true,
  "data": {
    "file": { ... }
  }
}
```

### Update File

```
PUT /files/:fileId
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "content": "// Updated content",
  "message": "Update message for git commit"
}

Response 200:
{
  "success": true,
  "data": {
    "file": { ... }
  }
}
```

### Delete File

```
DELETE /files/:fileId
Authorization: Bearer <accessToken>

Response 204: No Content
```

## Teams Endpoints

### Create Team

```
POST /teams
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Development Team",
  "description": "Core development team"
}

Response 201:
{
  "success": true,
  "data": {
    "team": {
      "_id": "team-id",
      "name": "Development Team",
      "description": "...",
      "owner": "user-id",
      "members": [ ... ],
      "plan": "free",
      "maxMembers": 5
    }
  }
}
```

### Get Team

```
GET /teams/:teamId
Authorization: Bearer <accessToken>

Response 200:
{
  "success": true,
  "data": {
    "team": { ... }
  }
}
```

### Add Team Member

```
POST /teams/:teamId/members
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "userId": "new-user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "member"
}

Response 201:
{
  "success": true,
  "data": {
    "team": { ... }
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| INVALID_CREDENTIALS | 401 | Invalid email or password |
| TOKEN_EXPIRED | 401 | Access token has expired |
| UNAUTHORIZED | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Header**: `X-RateLimit-Remaining`
- **Reset**: `X-RateLimit-Reset`

## Pagination

Use `limit` and `offset` query parameters:

```
GET /projects?limit=20&offset=0
```

## Webhooks

### Project Updated

```
POST https://your-webhook-url
Content-Type: application/json
X-Signature: sha256=...

{
  "event": "project.updated",
  "data": {
    "projectId": "...",
    "changes": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Examples

### cURL

```bash
# Login
curl -X POST https://api.zencode.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'

# Create project
curl -X POST https://api.zencode.ai/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","language":"javascript"}'
```

### JavaScript/Fetch

```javascript
// Login
const response = await fetch('https://api.zencode.ai/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
})

const { data } = await response.json()
const token = data.tokens.accessToken

// Create project
const projectResponse = await fetch('https://api.zencode.ai/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Project',
    language: 'javascript'
  })
})
```

## Support

For API questions and issues:
- Documentation: https://docs.zencode.ai
- Status: https://status.zencode.ai
- Email: api-support@zencode.ai
