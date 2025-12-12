# ZenCode AI - API Documentation

## Base URL

```
https://api.zencode.ai/api
# or
http://localhost:3000/api (development)
```

## Authentication

All API endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🔐 Authentication Endpoints

### Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Status Codes:**
- `201` - User created successfully
- `400` - Invalid input
- `409` - Email already registered

---

### Sign In
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `404` - User not found

---

### Get Current User
Get authenticated user information.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "settings": {
      "theme": "dark",
      "fontSize": 14,
      "tabSize": 2
    }
  }
}
```

---

## 📁 Project Endpoints

### List Projects
Get all projects for the authenticated user.

**Endpoint:** `GET /projects`

**Query Parameters:**
```
?skip=0&limit=10&sort=-createdAt&search=query
```

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "My First Project",
        "description": "A sample project",
        "language": "javascript",
        "owner": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "collaborators": [],
        "files": [],
        "createdAt": "2024-01-01T12:00:00Z",
        "lastModified": "2024-01-01T12:00:00Z"
      }
    ],
    "total": 1
  }
}
```

**Status Codes:**
- `200` - Projects retrieved
- `401` - Unauthorized

---

### Create Project
Create a new project.

**Endpoint:** `POST /projects`

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description",
  "language": "javascript"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "My Project",
      "description": "Project description",
      "language": "javascript",
      "owner": "507f1f77bcf86cd799439011",
      "files": [],
      "collaborators": [],
      "createdAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

**Status Codes:**
- `201` - Project created
- `400` - Invalid input
- `401` - Unauthorized

---

### Get Project Details
Get a specific project with all files.

**Endpoint:** `GET /projects/:projectId`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "My Project",
    "files": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "index.js",
        "path": "/index.js",
        "content": "console.log('Hello')",
        "language": "javascript",
        "isDirty": false
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Project retrieved
- `404` - Project not found
- `401` - Unauthorized

---

### Update Project
Update project metadata.

**Endpoint:** `PUT /projects/:projectId`

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "project": { /* updated project */ }
  }
}
```

**Status Codes:**
- `200` - Updated successfully
- `404` - Project not found
- `401` - Unauthorized

---

### Delete Project
Delete a project and all its files.

**Endpoint:** `DELETE /projects/:projectId`

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Status Codes:**
- `204` - Deleted successfully
- `404` - Project not found
- `401` - Unauthorized

---

## 📝 File Endpoints

### Get Files
Get all files in a project.

**Endpoint:** `GET /files/:projectId`

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "index.js",
        "path": "/index.js",
        "content": "console.log('Hello')",
        "language": "javascript",
        "isDirty": false
      }
    ]
  }
}
```

---

### Create File
Create a new file in a project.

**Endpoint:** `POST /files/:projectId`

**Request Body:**
```json
{
  "name": "new-file.js",
  "path": "/src/new-file.js",
  "content": "// new file content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": { /* created file */ }
  }
}
```

---

### Update File
Update file content.

**Endpoint:** `PUT /files/:projectId/:fileId`

**Request Body:**
```json
{
  "content": "updated content"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "file": { /* updated file */ }
  }
}
```

---

### Delete File
Delete a file.

**Endpoint:** `DELETE /files/:projectId/:fileId`

**Response:**
```json
{
  "success": true,
  "message": "File deleted"
}
```

---

## 🎨 Code Formatting Endpoints

### Format Code
Format code using selected formatter preset.

**Endpoint:** `POST /formatter/format`

**Request Body:**
```json
{
  "code": "const x=1",
  "language": "javascript",
  "formatter": "prettier",
  "options": {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "formatted": "const x = 1;"
  }
}
```

---

### Get Formatter Presets
Get available formatter presets.

**Endpoint:** `GET /formatter/presets`

**Response:**
```json
{
  "success": true,
  "data": {
    "presets": [
      {
        "name": "prettier",
        "label": "Prettier",
        "options": { /* default options */ }
      },
      {
        "name": "eslint",
        "label": "ESLint"
      }
    ]
  }
}
```

---

## 🔀 Git Endpoints

### Get Git Status
Get current git status of project.

**Endpoint:** `GET /git/:projectId/status`

**Response:**
```json
{
  "success": true,
  "data": {
    "branch": "main",
    "status": "working tree clean",
    "staged": [],
    "unstaged": [
      {
        "path": "src/index.js",
        "status": "M"
      }
    ]
  }
}
```

---

### Get Branches
Get all branches in repository.

**Endpoint:** `GET /git/:projectId/branches`

**Response:**
```json
{
  "success": true,
  "data": {
    "branches": [
      {
        "name": "main",
        "current": true,
        "commits": 42
      },
      {
        "name": "develop",
        "current": false,
        "commits": 50
      }
    ]
  }
}
```

---

### Create Branch
Create a new branch.

**Endpoint:** `POST /git/:projectId/branches`

**Request Body:**
```json
{
  "name": "feature/new-feature",
  "from": "main"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "branch": {
      "name": "feature/new-feature",
      "current": true
    }
  }
}
```

---

### Stage Files
Stage files for commit.

**Endpoint:** `POST /git/:projectId/stage`

**Request Body:**
```json
{
  "files": ["src/index.js", "package.json"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Files staged"
}
```

---

### Commit
Create a commit with staged changes.

**Endpoint:** `POST /git/:projectId/commit`

**Request Body:**
```json
{
  "message": "feat: add new feature",
  "description": "Detailed description of changes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commit": {
      "hash": "abc123def456",
      "message": "feat: add new feature",
      "author": "John Doe",
      "date": "2024-01-01T12:00:00Z"
    }
  }
}
```

---

### Push Changes
Push commits to remote repository.

**Endpoint:** `POST /git/:projectId/push`

**Request Body:**
```json
{
  "branch": "main"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pushed to main"
}
```

---

## 💾 Code Snippets Endpoints

### List Snippets
Get all code snippets.

**Endpoint:** `GET /snippets`

**Response:**
```json
{
  "success": true,
  "data": {
    "snippets": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Console Log",
        "prefix": "log",
        "body": "console.log('$1')",
        "language": "javascript",
        "description": "Log to console"
      }
    ]
  }
}
```

---

### Create Snippet
Create a new code snippet.

**Endpoint:** `POST /snippets`

**Request Body:**
```json
{
  "name": "Console Log",
  "prefix": "log",
  "body": "console.log('$1')",
  "language": "javascript",
  "description": "Log to console"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "snippet": { /* created snippet */ }
  }
}
```

---

## ⚙️ Execution Endpoints

### Run Code
Execute code and get output.

**Endpoint:** `POST /execution/run`

**Request Body:**
```json
{
  "code": "console.log('Hello World')",
  "language": "javascript",
  "input": ""
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "output": "Hello World\n",
    "exitCode": 0,
    "executionTime": 125
  }
}
```

---

### Get Execution History
Get recent code executions.

**Endpoint:** `GET /execution/history?limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "code": "console.log('Hello')",
        "language": "javascript",
        "output": "Hello\n",
        "exitCode": 0,
        "timestamp": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

---

## 🚨 Error Responses

### Common Error Codes

**400 - Bad Request**
```json
{
  "success": false,
  "error": "INVALID_INPUT",
  "message": "Email is required"
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing authentication token"
}
```

**403 - Forbidden**
```json
{
  "success": false,
  "error": "FORBIDDEN",
  "message": "You don't have permission to access this resource"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Resource not found"
}
```

**429 - Too Many Requests**
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many requests, try again later"
}
```

**500 - Server Error**
```json
{
  "success": false,
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred"
}
```

---

## 🔄 Rate Limiting

- **Standard**: 100 requests per minute
- **Premium**: 1000 requests per minute
- **Rate limit headers**:
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

---

## 📊 Pagination

List endpoints support pagination:

```bash
GET /projects?skip=0&limit=10&sort=-createdAt
```

**Parameters:**
- `skip` - Number of items to skip (default: 0)
- `limit` - Number of items to return (default: 10, max: 100)
- `sort` - Sort field (prefix with `-` for descending)

**Response includes:**
```json
{
  "data": { /* items */ },
  "pagination": {
    "total": 50,
    "skip": 0,
    "limit": 10,
    "pages": 5
  }
}
```

---

## 🧪 Testing API

### Using cURL
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Using Postman
1. Import [Postman Collection](./postman-collection.json)
2. Set environment variables
3. Run requests from collection

---

## 📚 API Client Libraries

- **JavaScript/TypeScript**: [zencode-sdk-js](https://npm.im/zencode-sdk)
- **Python**: [zencode-sdk-python](https://pypi.org/project/zencode-sdk)
- **Go**: [zencode-sdk-go](https://github.com/zencode/sdk-go)

---

## 🔗 WebSocket Events

Connect to WebSocket for real-time updates:

```javascript
const socket = io('http://localhost:3000')

// Listen for events
socket.on('file:updated', (data) => {
  console.log('File updated:', data)
})

socket.on('execution:output', (data) => {
  console.log('Execution output:', data)
})

// Emit events
socket.emit('join-project', { projectId: '...' })
```

---

## 📖 API Changelog

### v1.0.0 (Current)
- Initial API release
- Authentication endpoints
- Projects and files management
- Git integration
- Code formatting
- Execution endpoints

---

## 📞 Support

- **Email**: api-support@zencode.ai
- **Docs**: https://docs.zencode.ai
- **Status**: https://status.zencode.ai
