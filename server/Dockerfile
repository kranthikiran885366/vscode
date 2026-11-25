# Express API + code execution
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
# Interpreters used by /api/execute
RUN apk add --no-cache python3
ENV NODE_ENV=production PORT=5000
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
EXPOSE 5000
CMD ["node", "dist/server.js"]
