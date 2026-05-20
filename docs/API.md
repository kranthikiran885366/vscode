# ZenCode AI - REST API Documentation

## Base URL
```
https://api.zencode.ai/api
```

## Authentication

All endpoints (except `/auth/signup` and `/auth/login`) require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "status": 400
  },
  "timestamp": "2026-05-20T10:30:00Z"
}
```

## HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## Rate Limiting

Rate limiting headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

Specific rate limits:
- General API: 100 requests per 15 minutes
- Auth Login: 5 attempts per 15 minutes
- Signup: 3 accounts per hour
- Code Execution: 10 executions per minute per user

## Authentication Endpoints

### Sign Up
```
POST /auth/signup

Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (201):
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Login
```
POST /auth/login

Body:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Refresh Token
```
POST /auth/refresh

Body:
{
  "refreshToken": "..."
}

Response (200):
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

### Get Current User
```
GET /auth/me

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "...",
      "isVerified": true,
      "twoFactorEnabled": false,
      "preferences": { ... }
    }
  }
}
```

### Change Password
```
POST /auth/change-password

Body:
{
  "oldPassword": "...",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}

Response (200):
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Setup 2FA
```
POST /auth/2fa/setup

Response (200):
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEBLW64TMMQ======",
    "qrCode": "data:image/png;base64,..."
  }
}
```

### Enable 2FA
```
POST /auth/2fa/enable

Body:
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "token": "123456"
}

Response (200):
{
  "success": true,
  "message": "2FA enabled successfully"
}
```

### Disable 2FA
```
POST /auth/2fa/disable

Body:
{
  "password": "..."
}

Response (200):
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

## Project Endpoints

### List Projects
```
GET /projects?limit=50&offset=0

Response (200):
{
  "success": true,
  "data": {
    "projects": [ ... ],
    "total": 10
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 10
  }
}
```

### Get Project
```
GET /projects/:projectId

Response (200):
{
  "success": true,
  "data": {
    "project": { ... },
    "permissions": { ... }
  }
}
```

### Create Project
```
POST /projects

Body:
{
  "name": "My Project",
  "description": "A great project",
  "language": "javascript"
}

Response (201):
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": { ... }
  }
}
```

### Update Project
```
PUT /projects/:projectId

Body:
{
  "name": "Updated Name",
  "description": "...",
  "visibility": "private",
  "tags": ["tag1", "tag2"]
}

Response (200):
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": { ... }
  }
}
```

### Delete Project
```
DELETE /projects/:projectId

Response (200):
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Archive Project
```
POST /projects/:projectId/archive

Response (200):
{
  "success": true,
  "message": "Project archived successfully",
  "data": {
    "project": { ... }
  }
}
```

### Duplicate Project
```
POST /projects/:projectId/duplicate

Response (201):
{
  "success": true,
  "message": "Project duplicated successfully",
  "data": {
    "project": { ... }
  }
}
```

### Add Collaborator
```
POST /projects/:projectId/collaborators

Body:
{
  "email": "collaborator@example.com",
  "role": "contributor"
}

Response (200):
{
  "success": true,
  "message": "Collaborator added successfully",
  "data": {
    "project": { ... }
  }
}
```

## File Endpoints

### List Project Files
```
GET /files/project/:projectId

Response (200):
{
  "success": true,
  "data": {
    "files": [ ... ]
  }
}
```

### Get File
```
GET /files/:fileId

Response (200):
{
  "success": true,
  "data": {
    "file": {
      "_id": "...",
      "name": "index.js",
      "path": "/index.js",
      "content": "...",
      "language": "javascript",
      "lineCount": 42,
      "lastModifiedBy": "...",
      "updatedAt": "2026-05-20T10:30:00Z"
    }
  }
}
```

### Create File
```
POST /files

Body:
{
  "projectId": "...",
  "name": "index.js",
  "language": "javascript",
  "content": "console.log('hello');"
}

Response (201):
{
  "success": true,
  "message": "File created successfully",
  "data": {
    "file": { ... }
  }
}
```

### Update File
```
PUT /files/:fileId

Body:
{
  "content": "...",
  "message": "Update description"
}

Response (200):
{
  "success": true,
  "message": "File updated successfully",
  "data": {
    "file": { ... }
  }
}
```

### Get File Versions
```
GET /files/:fileId/versions

Response (200):
{
  "success": true,
  "data": {
    "versions": [
      {
        "versionNumber": 1,
        "content": "...",
        "changedBy": "...",
        "createdAt": "2026-05-20T10:30:00Z"
      }
    ]
  }
}
```

### Restore File Version
```
POST /files/:fileId/restore/1

Response (200):
{
  "success": true,
  "message": "File restored successfully",
  "data": {
    "file": { ... }
  }
}
```

## Organization Endpoints

### Create Organization
```
POST /organization

Body:
{
  "name": "My Team",
  "slug": "my-team",
  "description": "Our team"
}

Response (201):
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "organization": { ... }
  }
}
```

### List Organizations
```
GET /organization

Response (200):
{
  "success": true,
  "data": {
    "organizations": [ ... ]
  }
}
```

### Invite Member
```
POST /organization/:organizationId/members/invite

Body:
{
  "email": "member@example.com",
  "role": "member"
}

Response (200):
{
  "success": true,
  "message": "Member invited successfully",
  "data": {
    "organization": { ... }
  }
}
```

## API Keys Endpoints

### Generate API Key
```
POST /api-keys

Body:
{
  "name": "My API Key",
  "description": "For CI/CD",
  "permissions": ["project:read", "project:write"],
  "expiresAt": "2027-05-20T00:00:00Z"
}

Response (201):
{
  "success": true,
  "message": "API key generated successfully",
  "data": {
    "id": "...",
    "key": "sk_...", // Only returned at creation time
    "apiKey": { ... }
  }
}
```

### List API Keys
```
GET /api-keys

Response (200):
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "...",
        "name": "My API Key",
        "key": "sk_....", // Masked in list view
        "permissions": [ ... ],
        "isActive": true,
        "lastUsedAt": "2026-05-20T10:30:00Z"
      }
    ]
  }
}
```

## Analytics Endpoints

### Track Event
```
POST /analytics/events

Body:
{
  "action": "FILE_UPDATE",
  "resource": "file",
  "resourceId": "...",
  "metadata": { ... }
}

Response (200):
{
  "success": true,
  "message": "Event tracked"
}
```

### Get User Analytics
```
GET /analytics/user?days=30

Response (200):
{
  "success": true,
  "data": {
    "analytics": {
      "userId": "...",
      "period": "30 days",
      "totalEvents": 150,
      "topActions": [ ... ],
      "topResources": [ ... ]
    }
  }
}
```

### Get Team Productivity
```
GET /analytics/team/productivity/:organizationId?days=30

Response (200):
{
  "success": true,
  "data": {
    "stats": {
      "organizationId": "...",
      "period": "30 days",
      "teamSize": 5,
      "totalActivity": 500,
      "averageActivityPerMember": "100",
      "memberMetrics": { ... }
    }
  }
}
```

## Code Execution Endpoint

### Execute Code
```
POST /execute

Body:
{
  "code": "console.log('hello');",
  "language": "javascript",
  "timeout": 5000
}

Response (200):
{
  "success": true,
  "data": {
    "result": {
      "success": true,
      "output": "hello\n",
      "error": "",
      "duration": 125,
      "language": "javascript",
      "executionId": "..."
    }
  }
}
```

## System Endpoints

### Health Check
```
GET /health

Response (200):
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-05-20T10:30:00Z",
  "environment": "production",
  "database": {
    "postgres": true,
    "mongodb": true,
    "poolStats": { ... }
  },
  "uptime": 3600.5,
  "memoryUsage": { ... }
}
```

---

For more details, check the source code documentation or contact the development team.
