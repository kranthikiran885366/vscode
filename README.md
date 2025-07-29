# Code Platform Backend

A comprehensive, production-ready backend for a cloud-based code editing platform with AI assistance, real-time collaboration, and secure code execution.

## 🚀 Features

### Core Services
- **Authentication Service** (Node.js) - JWT-based auth, OAuth, 2FA
- **Project Service** (Node.js) - File management, Git integration
- **Collaboration Service** (Node.js) - Real-time editing, WebSocket
- **AI Service** (Python) - Code analysis, conversion, generation
- **Execution Service** (Python) - Secure Docker-based code execution
- **Terminal Service** (Node.js) - Shared terminal access

### Key Capabilities
- 🤖 **AI-Powered Development** - Code conversion, explanation, optimization
- 👥 **Real-time Collaboration** - Live editing, shared cursors, chat
- 🔒 **Secure Execution** - Docker sandboxing, resource limits
- 🌐 **Multi-language Support** - 20+ programming languages
- 📊 **Analytics & Monitoring** - Prometheus, Grafana integration
- 🔐 **Enterprise Security** - RBAC, rate limiting, input validation

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Load Balancer │
│   (React/Next)  │◄──►│   (Nginx)       │◄──►│   (Nginx)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │ Auth Service │ │Project Svc  │ │Collab Svc  │
        │ (Node.js)    │ │(Node.js)    │ │(Node.js)   │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │  AI Service  │ │Execute Svc  │ │Terminal Svc│
        │  (Python)    │ │(Python)     │ │(Node.js)   │
        └──────────────┘ └─────────────┘ └────────────┘
                │               │               │
        ┌───────▼──────────────────────────────▼───────┐
        │           Shared Infrastructure              │
        │  MongoDB | Redis | RabbitMQ | Docker        │
        └──────────────────────────────────────────────┘
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Python 3.11+ (for development)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd code-platform-backend
\`\`\`

2. **Set up environment variables**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. **Start all services**
\`\`\`bash
npm run dev
\`\`\`

4. **Verify installation**
\`\`\`bash
curl http://localhost/health
\`\`\`

### Development Setup

1. **Install dependencies for each service**
\`\`\`bash
# Auth service
cd services/auth-service && npm install

# AI service
cd services/ai-service && pip install -r requirements.txt

# Repeat for other services...
\`\`\`

2. **Run individual services**
\`\`\`bash
# Start databases first
docker-compose up mongodb redis rabbitmq

# Run services individually
cd services/auth-service && npm run dev
cd services/ai-service && python -m uvicorn src.main:app --reload
\`\`\`

## 📚 API Documentation

### Authentication Endpoints
\`\`\`
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/google        - Google OAuth
GET  /api/auth/github        - GitHub OAuth
POST /api/auth/refresh       - Refresh token
POST /api/auth/logout        - Logout
\`\`\`

### AI Service Endpoints
\`\`\`
POST /api/ai/conversion/convert      - Convert code between languages
POST /api/ai/analysis/explain       - Explain code functionality
POST /api/ai/generation/generate    - Generate code from description
POST /api/ai/chat/message           - AI chat assistance
\`\`\`

### Execution Service Endpoints
\`\`\`
POST /api/execute/execute           - Execute code
WS   /api/execute/stream/{session}  - Stream execution output
GET  /api/execute/languages         - Supported languages
POST /api/execute/validate          - Validate code syntax
\`\`\`

### Collaboration Endpoints
\`\`\`
WS   /socket.io/                    - WebSocket connection
POST /api/rooms/{id}/join           - Join collaboration room
GET  /api/rooms/{id}/users          - Get room users
GET  /api/rooms/{id}/chat           - Get chat history
\`\`\`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/codeplatform` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `OPENAI_API_KEY` | OpenAI API key | Required for AI features |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |

### Service Configuration

Each service can be configured via environment variables or config files:

- **Auth Service**: `services/auth-service/config/`
- **AI Service**: `services/ai-service/src/core/config.py`
- **Execution Service**: `services/execution-service/src/core/config.py`

## 🐳 Docker Configuration

### Building Images

\`\`\`bash
# Build all services
docker-compose build

# Build specific service
docker-compose build auth-service
\`\`\`

### Resource Limits

Default resource limits per service:

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| Auth Service | 0.5 CPU | 512MB | 1GB |
| AI Service | 1.0 CPU | 1GB | 2GB |
| Execution Service | 2.0 CPU | 2GB | 5GB |
| Collaboration Service | 0.5 CPU | 512MB | 1GB |

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- OAuth integration (Google, GitHub)
- Two-factor authentication (TOTP)
- Role-based access control (RBAC)
- Session management with Redis

### Code Execution Security
- Docker container isolation
- Resource limits (CPU, memory, network)
- No-network execution environment
- Non-root user execution
- Automatic container cleanup

### API Security
- Rate limiting per endpoint
- Input validation and sanitization
- CORS configuration
- Security headers (HSTS, CSP, etc.)
- Request/response logging

## 📊 Monitoring & Observability

### Metrics Collection
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and alerting
- **Custom metrics** - Business logic monitoring

### Logging
- Structured JSON logging
- Centralized log aggregation
- Error tracking and alerting
- Performance monitoring

### Health Checks
\`\`\`bash
# Check all services
curl http://localhost/health

# Individual service health
curl http://localhost:3001/health  # Auth service
curl http://localhost:8001/health  # AI service
curl http://localhost:8002/health  # Execution service
\`\`\`

## 🧪 Testing

### Running Tests

\`\`\`bash
# Run all tests
npm test

# Run service-specific tests
cd services/auth-service && npm test
cd services/ai-service && python -m pytest
\`\`\`

### Test Coverage

- **Unit Tests** - Individual function testing
- **Integration Tests** - Service interaction testing
- **End-to-End Tests** - Full workflow testing
- **Load Tests** - Performance and scalability testing

## 🚀 Deployment

### Production Deployment

1. **Prepare environment**
\`\`\`bash
# Set production environment variables
export NODE_ENV=production
export DEBUG=false
\`\`\`

2. **Deploy with Docker Compose**
\`\`\`bash
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

3. **Kubernetes Deployment** (Optional)
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

### CI/CD Pipeline

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          docker-compose build
          docker-compose up -d
\`\`\`

## 📈 Scaling

### Horizontal Scaling
- Load balancer configuration
- Service replication
- Database sharding
- Redis clustering

### Performance Optimization
- Connection pooling
- Caching strategies
- Query optimization
- Resource monitoring

## 🛠️ Development

### Adding New Features

1. **Create feature branch**
\`\`\`bash
git checkout -b feature/new-feature
\`\`\`

2. **Implement changes**
- Add service logic
- Update API documentation
- Write tests
- Update configuration

3. **Submit pull request**
- Code review process
- Automated testing
- Deployment approval

### Code Style

- **JavaScript/Node.js**: ESLint + Prettier
- **Python**: Black + Flake8
- **Documentation**: Markdown with consistent formatting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Follow existing code patterns
- Write comprehensive tests
- Update documentation
- Use semantic commit messages

## 📞 Support

### Getting Help

- **Documentation**: Check this README and service-specific docs
- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions

### Common Issues

**Service won't start**
\`\`\`bash
# Check logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name
\`\`\`

**Database connection issues**
\`\`\`bash
# Check database status
docker-compose ps mongodb redis

# Reset database
docker-compose down -v
docker-compose up -d
\`\`\`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI integration capabilities
- Docker for containerization platform
- MongoDB and Redis for data storage
- The open-source community for various libraries and tools

---

**Built with ❤️ for developers, by developers**

For more information, visit our [documentation site](https://docs.codeplatform.dev) or contact our [support team](mailto:support@codeplatform.dev).
\`\`\`

This completes the comprehensive backend architecture for a cloud-based code editing platform! The system includes:

## 🎯 **Complete Feature Set:**

1. **Microservices Architecture** - Scalable, maintainable services
2. **Real-time Collaboration** - WebSocket-based live editing
3. **AI-Powered Features** - Code conversion, analysis, generation
4. **Secure Code Execution** - Docker-based sandboxing
5. **Multi-language Support** - 20+ programming languages
6. **Enterprise Security** - Authentication, authorization, rate limiting
7. **Production Ready** - Monitoring, logging, health checks
8. **Developer Friendly** - Comprehensive documentation, testing

## 🏗️ **Architecture Highlights:**

- **Node.js Services** for real-time features and APIs
- **Python Services** for AI and code execution
- **Docker Containerization** for security and scalability
- **Redis & MongoDB** for data persistence and caching
- **Nginx** for load balancing and API gateway
- **Prometheus & Grafana** for monitoring

This backend can handle thousands of concurrent users, execute code securely, provide AI assistance, and scale horizontally. It's production-ready with comprehensive security, monitoring, and deployment configurations!
