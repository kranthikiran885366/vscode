# ZenCode AI - Project Structure

## Overview

ZenCode AI is a full-stack web application built with Next.js, TypeScript, MongoDB, and Express. It provides a collaborative code editor with real-time collaboration, version control integration, and enterprise features.

## Directory Structure

```
zencode-ai/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── projects/             # Project endpoints
│   │   ├── files/                # File endpoints
│   │   ├── teams/                # Team endpoints
│   │   └── health/               # Health check endpoint
│   ├── dashboard/                # Dashboard page
│   ├── project/[id]/             # Project detail page
│   ├── auth/                     # Auth pages
│   └── layout.tsx                # Root layout
│
├── components/                   # React components
│   ├── layout/                   # Layout components
│   │   ├── MainLayout.tsx        # Main application layout
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── Header.tsx            # Top header
│   │   └── Notifications.tsx     # Notification display
│   ├── editor/                   # Editor components
│   │   └── CodeEditor.tsx        # Code editor component
│   ├── auth/                     # Auth components
│   └── ui/                       # Reusable UI components
│
├── lib/                          # Utility functions and hooks
│   ├── hooks/                    # Custom React hooks
│   │   └── useApi.ts             # API hooks
│   ├── store/                    # State management (Zustand)
│   │   └── useAppStore.ts        # App-wide store
│   ├── api-client.ts             # HTTP client
│   └── utils/                    # Utility functions
│
├── server/                       # Backend Express server
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── app.ts                # Express app setup
│   │   │
│   │   ├── models/               # Database models
│   │   │   ├── User.ts           # User schema
│   │   │   ├── Project.ts        # Project schema
│   │   │   ├── File.ts           # File schema
│   │   │   ├── Team.ts           # Team schema
│   │   │   ├── AuditLog.ts       # Audit log schema
│   │   │   └── Analytics.ts      # Analytics schema
│   │   │
│   │   ├── services/             # Business logic services
│   │   │   ├── AuthService.ts    # Authentication logic
│   │   │   ├── ProjectService.ts # Project management
│   │   │   ├── FileService.ts    # File operations
│   │   │   ├── GitService.ts     # Git integration
│   │   │   ├── TeamsService.ts   # Team management
│   │   │   ├── SecurityService.ts# Security & audit
│   │   │   ├── AnalyticsService.ts # Analytics
│   │   │   └── CollaborationService.ts # Real-time collab
│   │   │
│   │   ├── routes/               # API route handlers
│   │   │   ├── auth.ts           # Auth routes
│   │   │   ├── projects.ts       # Project routes
│   │   │   ├── files.ts          # File routes
│   │   │   └── teams.ts          # Team routes
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.ts           # Authentication middleware
│   │   │   ├── errorHandler.ts   # Error handling
│   │   │   ├── validation.ts     # Input validation
│   │   │   └── rateLimit.ts      # Rate limiting
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── logger.ts         # Logging utility
│   │   │   ├── validators.ts     # Input validators
│   │   │   ├── jwt.ts            # JWT utilities
│   │   │   └── hasher.ts         # Password hashing
│   │   │
│   │   └── types/                # TypeScript types
│   │       └── index.ts          # Global types
│   │
│   └── dist/                     # Compiled JavaScript (generated)
│
├── __tests__/                    # Test files
│   ├── setup.ts                  # Test setup
│   ├── services/                 # Service tests
│   │   └── AuthService.test.ts
│   ├── integration/              # Integration tests
│   │   └── projects.test.ts
│   └── utils/                    # Utility tests
│       └── validators.test.ts
│
├── .github/
│   └── workflows/                # GitHub Actions CI/CD
│       ├── ci.yml                # Continuous integration
│       └── deploy.yml            # Deployment pipeline
│
├── public/                       # Static files
│   ├── images/
│   ├── fonts/
│   └── manifest.json
│
├── styles/                       # Global styles
│   └── globals.css               # Tailwind styles
│
├── Dockerfile                    # Docker build file
├── docker-compose.yml            # Docker Compose config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.js                # Next.js config
├── tailwind.config.js            # Tailwind config
├── jest.config.js                # Jest config
├── .env.example                  # Environment variables template
├── DEPLOYMENT.md                 # Deployment guide
├── API_DOCUMENTATION.md          # API docs
└── PROJECT_STRUCTURE.md          # This file
```

## Key Technologies

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS
- **Zustand** - State management
- **SWR** - Data fetching and caching
- **React Hooks** - Custom hooks for API

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe backend
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcryptjs** - Password hashing

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your values
```

### Running Locally

```bash
# Development mode with hot reload
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Run tests
pnpm test

# Run linter
pnpm lint
```

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Data Flow

### Authentication Flow
1. User submits login form
2. Frontend sends credentials to `/api/auth/login`
3. Backend validates and creates JWT tokens
4. Frontend stores tokens (localStorage/cookie)
5. Subsequent requests include Authorization header
6. Backend validates JWT middleware
7. Route handler processes authenticated request

### Project Creation Flow
1. User clicks "New Project"
2. Form data sent to `/api/projects`
3. Backend validates project data
4. Service creates project in MongoDB
5. Frontend updates state with new project
6. User redirected to project editor

### File Editing Flow
1. User opens file in editor
2. Content displayed in CodeEditor component
3. User types changes (local state updated)
4. Auto-save sends to `/api/files/:fileId`
5. Backend updates file and creates git commit
6. Collaboration service broadcasts to other users
7. All connected clients receive update

### Real-time Collaboration
1. Multiple users open same project
2. Each client connects to collaboration service
3. Editor changes tracked locally
4. Changes broadcast to all connected clients
5. Merge conflicts handled with operational transform
6. Activity history maintained

## Database Schema

### User
- `_id`: ObjectId
- `name`: string
- `email`: string (unique)
- `password`: string (hashed)
- `avatar`: string (optional)
- `role`: enum ['user', 'admin', 'enterprise']
- `createdAt`: Date
- `updatedAt`: Date
- `lastLogin`: Date

### Project
- `_id`: ObjectId
- `name`: string
- `description`: string (optional)
- `owner`: ObjectId (User)
- `members`: array of {userId, role}
- `language`: string
- `visibility`: enum ['private', 'public']
- `stars`: number
- `forks`: number
- `createdAt`: Date
- `updatedAt`: Date

### File
- `_id`: ObjectId
- `projectId`: ObjectId (Project)
- `name`: string
- `language`: string
- `content`: string
- `size`: number
- `version`: number
- `createdBy`: ObjectId (User)
- `lastModifiedBy`: ObjectId (User)
- `createdAt`: Date
- `updatedAt`: Date

### Team
- `_id`: ObjectId
- `name`: string
- `description`: string (optional)
- `owner`: ObjectId (User)
- `members`: array of {userId, email, name, role, joinedAt}
- `plan`: enum ['free', 'pro', 'enterprise']
- `maxMembers`: number
- `createdAt`: Date
- `updatedAt`: Date

### AuditLog
- `_id`: ObjectId
- `userId`: ObjectId (User)
- `userName`: string
- `action`: string
- `resource`: string
- `resourceId`: string
- `status`: enum ['success', 'failure']
- `ipAddress`: string (optional)
- `userAgent`: string (optional)
- `metadata`: object (optional)
- `timestamp`: Date

### Analytics
- `_id`: ObjectId
- `userId`: ObjectId (User)
- `action`: string
- `resource`: string
- `resourceId`: string
- `metadata`: object (optional)
- `timestamp`: Date

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Files
- `GET /api/files/project/:projectId`
- `POST /api/files`
- `GET /api/files/:id`
- `PUT /api/files/:id`
- `DELETE /api/files/:id`

### Teams
- `POST /api/teams`
- `GET /api/teams/:id`
- `PUT /api/teams/:id`
- `DELETE /api/teams/:id`
- `POST /api/teams/:id/members`
- `DELETE /api/teams/:id/members/:userId`

### Analytics
- `GET /api/analytics/user`
- `GET /api/analytics/resource/:id`
- `GET /api/analytics/system`

## State Management

Using Zustand for client-side state:

### Stores
- `useAuthStore` - User authentication state
- `useProjectStore` - Project management state
- `useFileStore` - File editor state
- `useCollaborationStore` - Real-time collaboration state
- `useUIStore` - UI preferences and notifications

## Testing Strategy

### Unit Tests
- Service classes
- Utility functions
- Validators

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### E2E Tests (future)
- User workflows
- Multi-user scenarios
- Browser compatibility

## Deployment

- See `DEPLOYMENT.md` for detailed deployment instructions
- Supports Docker, Vercel, AWS, DigitalOcean, Netlify
- CI/CD pipeline via GitHub Actions
- Automated testing and builds

## Security

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation on all endpoints
- CORS configuration
- Rate limiting
- SQL injection prevention
- XSS protection
- Audit logging
- Environment variable management

## Performance

- Code splitting with Next.js
- Image optimization
- CSS-in-JS minification
- Database query optimization
- Redis caching
- CDN for static assets
- WebSocket for real-time features

## Contributing

1. Create feature branch from `develop`
2. Make changes with descriptive commits
3. Write tests for new features
4. Submit pull request for review
5. Pass CI/CD checks
6. Merge after approval

## License

Proprietary - ZenCode AI
