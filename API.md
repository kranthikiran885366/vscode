# ZenCode AI - API Documentation

## Base URL

```
https://api.zencode.ai/v1
```

For development:
```
http://localhost:5000/api
```

## Authentication

All API requests require an authentication token in the header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get Auth Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

## API Endpoints

### Authentication

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "username": "john_doe",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  }
}
```

### Projects

#### List Projects
```http
GET /projects
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "My Project",
      "description": "Project description",
      "language": "typescript",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Project Details
```http
GET /projects/:projectId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "id": "proj_123",
  "name": "My Project",
  "description": "Project description",
  "owner": "user_123",
  "collaborators": ["user_456", "user_789"],
  "files": [
    {
      "id": "file_123",
      "name": "index.ts",
      "path": "/src/index.ts",
      "language": "typescript"
    }
  ],
  "settings": {
    "visibility": "private",
    "language": "typescript"
  }
}
```

#### Create Project
```http
POST /projects
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "My New Project",
  "description": "Project description",
  "language": "typescript"
}
```

**Response (201)**
```json
{
  "id": "proj_456",
  "name": "My New Project",
  "description": "Project description",
  "owner": "user_123",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Project
```http
PUT /projects/:projectId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (200)**
```json
{
  "id": "proj_123",
  "name": "Updated Name",
  "description": "Updated description",
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

#### Delete Project
```http
DELETE /projects/:projectId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (204)** - No content

### Files

#### List Project Files
```http
GET /files?projectId=:projectId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "files": [
    {
      "id": "file_123",
      "name": "index.ts",
      "path": "/src/index.ts",
      "language": "typescript",
      "size": 2048,
      "isDirty": false,
      "lastModified": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get File Content
```http
GET /files/:fileId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "id": "file_123",
  "name": "index.ts",
  "path": "/src/index.ts",
  "language": "typescript",
  "content": "export function hello() { ... }",
  "isDirty": false
}
```

#### Create File
```http
POST /files
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "projectId": "proj_123",
  "name": "newfile.ts",
  "language": "typescript",
  "content": ""
}
```

**Response (201)**
```json
{
  "id": "file_456",
  "name": "newfile.ts",
  "path": "/src/newfile.ts",
  "language": "typescript",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update File
```http
PUT /files/:fileId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "content": "Updated file content"
}
```

**Response (200)**
```json
{
  "id": "file_123",
  "name": "index.ts",
  "content": "Updated file content",
  "isDirty": false,
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

#### Delete File
```http
DELETE /files/:fileId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (204)** - No content

### Git Operations

#### List Branches
```http
GET /git/:projectId/branches
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "branches": [
    {
      "name": "main",
      "isCurrentBranch": true,
      "lastCommit": "abc123",
      "lastCommitMessage": "feat: add feature"
    },
    {
      "name": "develop",
      "isCurrentBranch": false,
      "lastCommit": "def456",
      "lastCommitMessage": "fix: resolve issue"
    }
  ]
}
```

#### Create Branch
```http
POST /git/:projectId/branches
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "branchName": "feature/new-feature",
  "fromBranch": "develop"
}
```

**Response (201)**
```json
{
  "name": "feature/new-feature",
  "isCurrentBranch": true
}
```

#### Switch Branch
```http
POST /git/:projectId/switch
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "branchName": "develop"
}
```

**Response (200)**
```json
{
  "currentBranch": "develop",
  "message": "Switched to branch develop"
}
```

#### Create Commit
```http
POST /git/:projectId/commit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "message": "feat: add new feature",
  "description": "Detailed description of changes",
  "files": ["file_123", "file_456"]
}
```

**Response (201)**
```json
{
  "hash": "abc123def456",
  "message": "feat: add new feature",
  "author": "john_doe",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Get Commit History
```http
GET /git/:projectId/history
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "commits": [
    {
      "hash": "abc123",
      "message": "feat: add feature",
      "author": "john_doe",
      "timestamp": "2024-01-15T10:30:00Z",
      "changes": 15
    }
  ]
}
```

#### Push to Remote
```http
POST /git/:projectId/push
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "branch": "main",
  "remote": "origin"
}
```

**Response (200)**
```json
{
  "message": "Successfully pushed to origin/main",
  "commits": 3
}
```

#### Pull from Remote
```http
POST /git/:projectId/pull
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "branch": "main",
  "remote": "origin"
}
```

**Response (200)**
```json
{
  "message": "Successfully pulled from origin/main",
  "commits": 2,
  "conflicts": 0
}
```

### Code Execution

#### Execute Code
```http
POST /execute
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "code": "console.log('Hello, World!')",
  "language": "javascript",
  "timeout": 5000
}
```

**Response (200)**
```json
{
  "executionId": "exec_123",
  "output": "Hello, World!\n",
  "error": null,
  "duration": 45,
  "status": "completed"
}
```

#### Get Execution Status
```http
GET /execute/:executionId
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "executionId": "exec_123",
  "status": "completed",
  "output": "Hello, World!\n",
  "error": null,
  "duration": 45
}
```

#### Cancel Execution
```http
POST /execute/:executionId/cancel
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**
```json
{
  "message": "Execution cancelled",
  "executionId": "exec_123"
}
```

### AI Features

#### Code Completion
```http
POST /ai/completion
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "code": "function hello() { ",
  "language": "javascript",
  "context": {
    "file": "index.js",
    "line": 5
  }
}
```

**Response (200)**
```json
{
  "suggestions": [
    {
      "text": "console.log('Hello');",
      "score": 0.95
    },
    {
      "text": "return 'Hello';",
      "score": 0.87
    }
  ]
}
```

#### Code Refactoring
```http
POST /ai/refactor
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "code": "var x = 1; var y = 2; var z = x + y;",
  "language": "javascript"
}
```

**Response (200)**
```json
{
  "refactored": "const sum = 1 + 2;",
  "suggestions": [
    "Use const instead of var",
    "Combine variable declarations"
  ]
}
```

#### Code Explanation
```http
POST /ai/explain
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "code": "const arr = [1,2,3]; const doubled = arr.map(x => x * 2);",
  "language": "javascript"
}
```

**Response (200)**
```json
{
  "explanation": "This code creates an array of numbers and uses the map function to double each element."
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {
    "field": "email",
    "error": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong on the server"
}
```

## Rate Limiting

All endpoints are rate limited to prevent abuse:

- **Standard**: 60 requests per minute
- **Authenticated**: 300 requests per minute
- **Pro Plan**: Unlimited

**Rate limit headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642256400
```

## Pagination

List endpoints support pagination:

```http
GET /projects?page=1&limit=20&sort=createdAt&order=desc
```

**Response**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('https://api.zencode.ai', {
  auth: { token: JWT_TOKEN }
})

socket.on('connect', () => {
  socket.emit('join-project', { projectId: 'proj_123' })
})
```

### Events
- `editor-update` - Code change
- `cursor-move` - Cursor position
- `file-saved` - File saved
- `collaborator-joined` - User joined
- `collaborator-left` - User left
- `execution-result` - Code executed

---

For more information, see:
- [Architecture.md](ARCHITECTURE.md) - System design
- [Development.md](DEVELOPMENT.md) - Setup guide
