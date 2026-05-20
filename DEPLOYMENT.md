# Deployment Guide

This guide covers deploying ZenCode AI IDE to production environments.

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

**Pros**: Zero-config Next.js deployment, automatic scaling, edge functions
**Cons**: Limited to frontend only, need separate backend

#### Setup Steps

1. **Push code to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com/)
- Click "New Project"
- Import GitHub repository
- Select project root

3. **Configure Environment Variables**
```
NEXT_PUBLIC_API_URL=https://api.zencode.ai/api
NEXT_PUBLIC_WS_URL=wss://api.zencode.ai
```

4. **Deploy**
- Click "Deploy"
- Vercel builds and deploys automatically

#### Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records

### Option 2: AWS (Full Stack)

**Pros**: Complete control, scalable, enterprise-grade
**Cons**: More complex setup, requires DevOps knowledge

#### Frontend Deployment (CloudFront + S3)

1. **Build Next.js project**
```bash
npm run build
```

2. **Create S3 bucket**
```bash
aws s3 mb s3://zencode-ai-frontend --region us-east-1
```

3. **Upload build files**
```bash
aws s3 sync ./out s3://zencode-ai-frontend
```

4. **Create CloudFront distribution**
```bash
# Use AWS Console or CDK
# Point to S3 bucket as origin
# Enable SSL/TLS
```

#### Backend Deployment (EC2 + RDS)

1. **Create EC2 instance**
```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name zencode-key \
  --security-groups zencode-backend
```

2. **Connect and setup**
```bash
ssh -i zencode-key.pem ec2-user@instance-ip

# Update system
sudo yum update -y
sudo yum install -y nodejs npm git

# Clone and setup
git clone https://github.com/kranthikiran885366/vscode.git
cd vscode/server
npm install
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name zencode -- run start
pm2 save
```

3. **Create RDS databases**
```bash
# MongoDB Atlas (managed)
# PostgreSQL on AWS RDS
```

4. **Configure load balancer**
```bash
# Use AWS ELB or ALB
# Point to EC2 instances
# Enable health checks
```

### Option 3: DigitalOcean (Budget-Friendly)

**Pros**: Simple, affordable, good documentation
**Cons**: Less scalability than AWS

#### Setup Steps

1. **Create Droplet**
- Choose Ubuntu 22.04 LTS
- Select $5-20/month size
- Add SSH key

2. **Initial Setup**
```bash
# SSH into droplet
ssh root@your_droplet_ip

# Create user
adduser zencode
usermod -aG sudo zencode
su - zencode

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

3. **Deploy with Docker**
```bash
# Build Docker image
docker build -t zencode-app .

# Run container
docker run -p 3000:3000 -p 5000:5000 \
  --env-file .env \
  zencode-app
```

4. **Setup Nginx Reverse Proxy**
```nginx
# /etc/nginx/sites-available/zencode
server {
  listen 80;
  server_name zencode.ai;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

### Option 4: Netlify (Simple Frontend)

**Pros**: GitHub integration, automatic builds, free tier
**Cons**: Serverless limitations, separate backend needed

1. **Connect GitHub**
- Go to [netlify.com](https://netlify.com/)
- Click "New site from Git"
- Select repository

2. **Configure Build**
- Build command: `npm run build`
- Publish directory: `.next`

3. **Set Environment Variables**
```
NEXT_PUBLIC_API_URL=https://api.zencode.ai/api
NEXT_PUBLIC_WS_URL=wss://api.zencode.ai
```

4. **Deploy**
- Netlify builds on every push

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY public ./public

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:5000/api
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: mongodb://mongo:27017/zencode
      POSTGRES_URL: postgresql://postgres:password@postgres:5432/zencode
    depends_on:
      - mongo
      - postgres

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: zencode
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  mongo_data:
  postgres_data:
```

### Deploy with Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Kubernetes Deployment

### Deploy to EKS/GKE

1. **Create deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zencode-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zencode
  template:
    metadata:
      labels:
        app: zencode
    spec:
      containers:
      - name: zencode
        image: zencode-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.zencode.ai/api"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

2. **Deploy to cluster**
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## Database Migration

### MongoDB Migration

```bash
# Export data
mongodump --uri="mongodb://localhost:27017/zencode_old" --out=./backup

# Import data
mongorestore --uri="mongodb://production-server/zencode" ./backup/zencode
```

### PostgreSQL Migration

```bash
# Backup
pg_dump zencode_dev > backup.sql

# Restore
psql -h production-server -U postgres zencode_prod < backup.sql
```

## SSL/TLS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d zencode.ai -d www.zencode.ai

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Configure Nginx for HTTPS

```nginx
server {
  listen 443 ssl http2;
  server_name zencode.ai;

  ssl_certificate /etc/letsencrypt/live/zencode.ai/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/zencode.ai/privkey.pem;

  # Strong SSL configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Redirect HTTP to HTTPS
  if ($scheme != "https") {
    return 301 https://$server_name$request_uri;
  }

  # Rest of configuration...
}
```

## Monitoring & Logging

### Application Monitoring

```bash
# Install monitoring tools
npm install pm2 pm2-logrotate

# Configure PM2
pm2 start npm --name zencode -- run start
pm2 install pm2-logrotate
pm2 save
```

### Logging

```bash
# Winston for structured logging
npm install winston

# Check logs
pm2 logs zencode
docker logs <container-id>
```

### Performance Monitoring

- **Sentry**: Error tracking
- **New Relic**: APM
- **Datadog**: Infrastructure monitoring
- **CloudWatch**: AWS logs

## Backup Strategy

### Automated Backups

```bash
# Weekly database backup script
#!/bin/bash
BACKUP_DIR="/backups/zencode"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# MongoDB backup
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo_$TIMESTAMP"

# PostgreSQL backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/postgres_$TIMESTAMP.sql"

# Upload to S3
aws s3 sync $BACKUP_DIR s3://zencode-backups/
```

### Restore from Backup

```bash
# Restore from specific backup
mongorestore --uri="$MONGO_URI" ./backups/mongo_timestamp/
psql $DATABASE_URL < ./backups/postgres_timestamp.sql
```

## CI/CD Pipeline

### GitHub Actions Example

See `.github/workflows/` for CI/CD configuration.

## Post-Deployment

### Health Checks

```bash
# Check API
curl https://zencode.ai/api/health

# Check WebSocket
wscat -c wss://zencode.ai
```

### Performance Testing

```bash
# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://zencode.ai
```

### Security Audit

```bash
# Check dependencies
npm audit

# Security scanning
npm install -g snyk
snyk test
```

## Scaling Strategy

### Horizontal Scaling

1. **Load Balancer**
   - Distribute traffic across instances
   - Health checks every 10 seconds
   - Sticky sessions for WebSocket

2. **Database Sharding**
   - Shard by user_id
   - Replicate across regions

3. **Caching Layer**
   - Redis for session data
   - CloudFlare for static assets

### Vertical Scaling

- Increase server RAM
- Use faster CPUs
- Optimize code and queries

## Cost Optimization

- Use reserved instances (30-40% savings)
- Implement auto-scaling
- Cache aggressively
- Optimize database queries
- Use CDN for static assets

## Troubleshooting

### High Memory Usage
```bash
# Check memory
free -h
pm2 monit

# Optimize Node
node --max-old-space-size=2048 server.js
```

### Database Connection Issues
```bash
# Check connections
mongo --eval "db.adminCommand('serverStatus').connections"

# Reset connections
killall -9 mongod
```

### WebSocket Disconnections
- Check firewall rules
- Verify CORS settings
- Monitor connection logs

---

For help: support@zencode.ai
