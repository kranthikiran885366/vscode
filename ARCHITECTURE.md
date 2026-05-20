# ZenCode AI - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client Layer                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js App │  │  React UI    │  │  Monaco     │      │
│  │  (SSR/SSG)   │  │  Components  │  │  Editor     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │              │
│  ┌──────────────────────────────────────────────────┐       │
│  │     Context API + useReducer (State Mgmt)       │       │
│  └──────────────────────────────────────────────────┘       │
│         │                                                    │
│  ┌──────────────────────────────────────────────────┐       │
│  │  HTTP Client + Socket.IO (Communication)         │       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌─────▼──────┐ ┌──────▼────────┐
│   HTTP REST    │ │ WebSocket  │ │  File Storage │
│   API Server   │ │ (Real-time)│ │   Service     │
└───────┬────────┘ └─────┬──────┘ └──────┬────────┘
        │                │              │
└───────┼────────────────┼──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Layer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Node.js / Express.js API Server                     │   │
│  └──────────────────────────────────────────────────────┘   │
│       ┌────────────┬────────────┬────────────┐              │
│       │            │            │            │              │
│  ┌────▼──┐  ┌─────▼──┐  ┌────▼──┐  ┌────▼────┐           │
│  │ Auth  │  │  Files │  │ Git   │  │Execution│           │
│  │Routes │  │ Routes │  │Routes │  │ Routes  │           │
│  └────┬──┘  └─────┬──┘  └────┬──┘  └────┬────┘           │
│       │           │           │          │                 │
│  ┌────▼───────────▼───────────▼──────────▼────┐           │
│  │  Business Logic & Services Layer            │           │
│  │  - AuthService                              │           │
│  │  - FileService                              │           │
│  │  - GitService                               │           │
│  │  - CodeExecutor                             │           │
│  │  - FormatterService                         │           │
│  └────┬────────────────────────────────────────┘           │
│       │                                                     │
│  ┌────▼────────────────────────────────────────────────┐   │
│  │  Database Layer                                     │   │
│  │  - MongoDB (Documents/Files)                        │   │
│  │  - PostgreSQL (Transactions/Auth)                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: Next.js 13+ (App Router)
- **UI Library**: React 18+
- **State Management**: Context API + useReducer
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Real-time**: Socket.IO Client
- **HTTP Client**: Fetch API
- **Type Safety**: TypeScript

### Folder Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── editor-enhanced/
│   └── page.tsx              # Main IDE page
├── dashboard/
│   └── page.tsx              # Project management
├── organization/             # Enterprise features
│   ├── [orgId]/
│   │   ├── billing/
│   │   ├── team/
│   │   ├── api/
│   │   ├── analytics/
│   │   └── security/
│   └── page.tsx
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page
└── globals.css               # Global styles

components/
├── ui/                       # Reusable UI components (50+)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── monaco-editor.tsx         # Code editor
├── file-explorer.tsx         # File navigation
├── terminal.tsx              # Terminal
├── advanced-debugger.tsx     # Debugger
├── enhanced-git-panel.tsx    # Git integration
├── advanced-search.tsx       # Search & replace
├── snippets-manager.tsx      # Code snippets
├── themes-manager.tsx        # Theme manager
└── ...                       # 20+ other components

lib/
├── editor-store.tsx          # Global state (Context + Reducer)
├── editor-context.tsx        # Context setup
├── language-support.ts       # Language configurations
└── utils.ts                  # Utility functions

types/
├── editor.ts                 # Type definitions
└── ...
```

### State Management

**EditorStore** (Context + Reducer Pattern)

```typescript
interface EditorState {
  openTabs: Tab[]
  activeTabId: string | null
  sidebarVisible: boolean
  chatVisible: boolean
  terminalVisible: boolean
  theme: 'light' | 'dark'
  activeLeftPanel: PanelType
  activeBottomPanel: PanelType
  // ... more state
}

type EditorAction =
  | { type: 'ADD_TAB'; payload: Tab }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  // ... more actions
```

### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
dispatch(Action)
    ↓
useReducer (EditorStore)
    ↓
State Update
    ↓
Component Re-render
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Database**: MongoDB + PostgreSQL
- **Code Execution**: Docker/Sandbox
- **Version Control**: Git Library

### API Routes

```
/api/auth/
├── POST /login          # User login
├── POST /signup         # User registration
├── POST /logout         # User logout
└── GET /me              # Current user info

/api/projects/
├── GET /                # List user projects
├── GET /:id             # Get project details
├── POST /               # Create new project
├── PUT /:id             # Update project
└── DELETE /:id          # Delete project

/api/files/
├── GET /:projectId      # List project files
├── POST /               # Create new file
├── GET /:fileId         # Get file content
├── PUT /:fileId         # Update file
└── DELETE /:fileId      # Delete file

/api/git/
├── GET /:projectId/branches      # List branches
├── POST /:projectId/commit       # Create commit
├── POST /:projectId/push         # Push to remote
├── POST /:projectId/pull         # Pull from remote
└── GET /:projectId/history       # Commit history

/api/execute/
├── POST /               # Execute code
├── GET /status/:id      # Get execution status
└── POST /cancel/:id     # Cancel execution

/api/ai/
├── POST /chat           # AI chat endpoint
├── POST /completion     # Code completion
├── POST /refactor       # Code refactoring
└── POST /generate       # Code generation
```

### Service Layer

```
Services/
├── AuthService
│   ├── authenticate()
│   ├── register()
│   ├── generateToken()
│   └── verifyToken()
│
├── FileService
│   ├── createFile()
│   ├── updateFile()
│   ├── deleteFile()
│   └── listFiles()
│
├── GitService
│   ├── createBranch()
│   ├── switchBranch()
│   ├── commit()
│   ├── push()
│   └── pull()
│
├── CodeExecutor
│   ├── execute()
│   ├── validateCode()
│   └── getSandboxStatus()
│
└── FormatterService
    ├── formatCode()
    ├── validateFormat()
    └── getFormatConfig()
```

### Database Schema

#### MongoDB Collections

**Users**
```javascript
{
  _id: ObjectId,
  email: string,
  username: string,
  passwordHash: string,
  profile: {
    firstName: string,
    lastName: string,
    avatar: string
  },
  settings: {
    theme: string,
    fontSize: number,
    // ... editor settings
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Projects**
```javascript
{
  _id: ObjectId,
  name: string,
  description: string,
  ownerId: ObjectId,
  collaborators: [ObjectId],
  repository: {
    url: string,
    branch: string
  },
  settings: {
    visibility: 'private' | 'public',
    language: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Files**
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  name: string,
  path: string,
  content: string,
  language: string,
  isDirty: boolean,
  lastModified: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### PostgreSQL Tables

**accounts** (Billing & Subscriptions)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id VARCHAR,
  subscription_id VARCHAR,
  status VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**audit_logs** (Security & Compliance)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  action VARCHAR,
  resource VARCHAR,
  timestamp TIMESTAMP
);
```

## Real-time Communication

### Socket.IO Events

**Client → Server**
```javascript
socket.emit('join-project', projectId)
socket.emit('editor-update', { fileId, content })
socket.emit('cursor-move', { line, column })
socket.emit('file-save', { fileId })
socket.emit('code-execute', { fileId, language })
```

**Server → Client**
```javascript
socket.emit('editor-update', { userId, fileId, content })
socket.emit('cursor-update', { userId, line, column })
socket.emit('file-saved', { fileId, timestamp })
socket.emit('execution-result', { output, error })
socket.emit('collaborator-joined', { userId, username })
```

## Security Architecture

### Authentication Flow

```
1. User enters credentials
        ↓
2. POST /api/auth/login
        ↓
3. Verify credentials against MongoDB
        ↓
4. Generate JWT token
        ↓
5. Send token to client
        ↓
6. Client stores in localStorage
        ↓
7. Include in API requests
        ↓
8. Server validates JWT
        ↓
9. Grant access to resources
```

### Authorization

- **Role-based Access Control (RBAC)**
  - Admin
  - Owner
  - Contributor
  - Viewer

- **Permission-based**
  - Project: read, write, delete, share
  - File: read, write, execute
  - Settings: read, write

## Deployment Architecture

### Frontend Deployment
- **Platform**: Vercel, Netlify, or AWS CloudFront
- **CDN**: Global edge network
- **Build**: Next.js static generation + SSR
- **Cache**: Aggressive caching for assets

### Backend Deployment
- **Platform**: AWS EC2, DigitalOcean, or Heroku
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **Load Balancing**: Nginx or AWS ELB

### Database Deployment
- **MongoDB**: MongoDB Atlas (Cloud)
- **PostgreSQL**: AWS RDS or managed provider
- **Backups**: Automated daily backups
- **Replication**: Multi-region replication

## Scaling Strategy

### Horizontal Scaling
- Load balancer distributes traffic
- Multiple API server instances
- Database connection pooling
- Cache layer (Redis)

### Vertical Scaling
- Increase server resources
- Database optimization
- Code optimization

### Performance Optimization
- Lazy loading for components
- Code splitting
- Minification and compression
- Image optimization
- API response caching

## Monitoring & Logging

### Metrics
- Request latency
- Error rates
- CPU/Memory usage
- Database performance
- WebSocket connections

### Logging
- Application logs
- Error tracking (Sentry)
- User action logs
- Audit logs

## Future Architecture Improvements

1. **Microservices Migration**
   - Separate services for auth, files, execution
   - API gateway pattern

2. **Event-Driven Architecture**
   - Message queues (RabbitMQ, Kafka)
   - Event sourcing

3. **Advanced Caching**
   - Redis for session/cache
   - GraphQL subscription caching

4. **Distributed Tracing**
   - OpenTelemetry
   - Distributed request tracking

---

For more details, see:
- [API.md](API.md) - API documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
