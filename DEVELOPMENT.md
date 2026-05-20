# Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 7.0.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Git Bash** (Windows users)
- **Docker** (optional, for running databases locally) ([Download](https://www.docker.com/))

### Recommended Tools
- **VS Code** - Code editor ([Download](https://code.visualstudio.com/))
- **Postman** - API testing ([Download](https://www.postman.com/))
- **MongoDB Compass** - Database GUI ([Download](https://www.mongodb.com/products/compass))
- **pgAdmin** - PostgreSQL GUI ([Download](https://www.pgadmin.org/))

## Project Setup

### 1. Clone the Repository

```bash
# HTTPS
git clone https://github.com/kranthikiran885366/vscode.git

# SSH
git clone git@github.com:kranthikiran885366/vscode.git

# Navigate to project
cd vscode
```

### 2. Install Dependencies

```bash
# Using npm (recommended for this project)
npm install

# Using pnpm (faster alternative)
pnpm install

# Using yarn
yarn install
```

### 3. Environment Configuration

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000

# Backend
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/zencode_dev
POSTGRES_URL=postgresql://user:password@localhost:5432/zencode_dev

# Authentication
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRE=7d

# Third-party Services (optional)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
GITHUB_API_TOKEN=ghp_...

# AWS (optional)
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1

# AI Services (optional)
OPENAI_API_KEY=sk-...
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MongoDB and PostgreSQL containers
docker-compose up -d

# Check running containers
docker ps
```

#### Option B: Manual Installation

**MongoDB:**
```bash
# macOS
brew install mongodb-community

# Windows - Download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod
```

**PostgreSQL:**
```bash
# macOS
brew install postgresql

# Windows - Download from https://www.postgresql.org/download/windows/

# Start PostgreSQL
brew services start postgresql
```

#### Initialize Databases

```bash
# Create MongoDB database (auto-created on first use)

# Create PostgreSQL database
createdb zencode_dev

# Run migrations (if any)
npm run migrate
```

### 5. Start Development Servers

#### Terminal 1: Frontend (Next.js)

```bash
npm run dev

# App runs at http://localhost:3000
```

#### Terminal 2: Backend (Express.js)

```bash
npm run dev:server

# Server runs at http://localhost:5000
```

#### Terminal 3 (Optional): Build Watcher

```bash
npm run build:watch
```

## Project Structure for Development

```
vscode/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities and helpers
├── public/                 # Static assets
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── server.ts      # Express server
│   ├── package.json
│   └── tsconfig.json
├── styles/                 # Global styles
├── types/                  # TypeScript types
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Project dependencies
```

## Available Scripts

### Frontend Scripts
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm test:watch

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

### Backend Scripts
```bash
# Development server
npm run dev:server

# Build backend
npm run build:server

# Start production backend
npm run start:server

# Run migrations
npm run migrate

# Seed database
npm run seed
```

## Code Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- No unused variables

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Formatting
```bash
# Format with Prettier
npm run format

# Check formatting
npm run format:check
```

### Pre-commit Hooks
Husky is configured to run:
- Lint checker
- Prettier formatting
- Type checking

## Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm test -- path/to/test.spec.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- git-operations
```

### E2E Tests
```bash
# Run end-to-end tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed
```

## Debugging

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "protocol": "inspector"
    },
    {
      "name": "Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/src/server.ts",
      "restart": true,
      "runtimeArgs": ["--loader", "ts-node/esm"],
      "env": { "NODE_ENV": "development" }
    }
  ]
}
```

### Browser DevTools
- Open DevTools: `F12` or `Ctrl+Shift+I`
- React DevTools: Install [extension](https://react-devtools-tutorial.vercel.app/)
- Redux DevTools: Install [extension](https://github.com/reduxjs/redux-devtools)

### Network Inspection
```bash
# Use Charles or Fiddler to inspect API calls
# or DevTools Network tab
```

## Common Development Tasks

### Adding a New Component

1. Create component file in `components/`
```typescript
// components/MyComponent.tsx
interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return <button onClick={onAction}>{title}</button>
}
```

2. Export from `components/index.ts` (if using)
3. Use in pages/other components
4. Add tests in `components/__tests__/`

### Adding a New API Endpoint

1. Create route file in `server/src/routes/`
2. Define handler function
3. Register route in `server/src/server.ts`
4. Document in [API.md](API.md)

```typescript
// server/src/routes/myroute.ts
export async function handleMyRoute(req, res) {
  const data = req.body
  // Process data
  res.json({ success: true })
}
```

### Database Migrations

```bash
# Create new migration
npm run migrate:create -- add_users_table

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### Updating Dependencies

```bash
# Check outdated packages
npm outdated

# Update minor/patch versions
npm update

# Update specific package
npm install package-name@latest

# Update all packages (caution!)
npm upgrade-interactive --latest
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Module Not Found Error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Generate types for dependencies
npm run type-check

# Watch for type errors
npm run type-check:watch
```

### Database Connection Issues

```bash
# Test MongoDB connection
npm run db:test:mongodb

# Test PostgreSQL connection
npm run db:test:postgres

# Check database status
docker ps
```

### Git Conflicts

```bash
# List conflicted files
git status

# Open conflicted file and resolve manually
# Then mark as resolved
git add path/to/file

# Complete merge
git commit -m "Merge: resolve conflicts"
```

## Performance Tips

### Frontend Optimization
- Use React DevTools Profiler
- Check bundle size: `npm run build && npm run analyze`
- Lazy load components: `const Component = dynamic(() => import('...'))`
- Use `useCallback` to prevent unnecessary re-renders

### Backend Optimization
- Use database indexes
- Implement caching (Redis)
- Profile with node --inspect
- Monitor with clinic.js

## Security Best Practices

### Development
- Never commit `.env.local` (use `.env.example`)
- Validate all inputs server-side
- Use HTTPS in production
- Rotate secrets regularly
- Use environment variables for sensitive data

### Git
```bash
# Check for secrets in code
npm install -g detect-secrets
detect-secrets scan

# Sign commits
git config user.signingkey YOUR_GPG_KEY
git commit -S -m "message"
```

## Getting Help

- **Documentation**: See [README.md](README.md), [ARCHITECTURE.md](ARCHITECTURE.md)
- **Issues**: Check [GitHub Issues](https://github.com/kranthikiran885366/vscode/issues)
- **Discussions**: Ask in [GitHub Discussions](https://github.com/kranthikiran885366/vscode/discussions)
- **Email**: support@zencode.ai

---

**Happy developing!** 🚀
