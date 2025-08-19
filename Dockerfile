# Multi-stage Docker build for Maxiphy monorepo
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies for the entire monorepo
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules

# Generate Prisma client
RUN npm run prisma:generate

# Build applications
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=builder --chown=nextjs:nodejs /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next ./packages/frontend/.next
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/backend/package*.json ./packages/backend/
COPY --from=builder /app/packages/frontend/package*.json ./packages/frontend/

# Copy production node_modules
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=deps --chown=nextjs:nodejs /app/packages/frontend/node_modules ./packages/frontend/node_modules

# Create necessary directories
RUN mkdir -p /app/packages/backend/logs && chown nextjs:nodejs /app/packages/backend/logs

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node packages/backend/dist/health/health.controller.js || exit 1

# Start the backend server (which will also serve the frontend in production)
CMD ["npm", "run", "start:backend"]