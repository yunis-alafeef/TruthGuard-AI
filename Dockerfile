# ============================================================================
# TruthGuard AI (حارس الحقيقة) - Production Multi-Stage Dockerfile
# Optimized for: Koyeb (Eco Tier), Hugging Face Spaces, Fly.io, Railway
# Author: Eng. Yunis Al-Afeef <shoeabvv@gmail.com>
# ============================================================================

# ----------------------------------------------------------------------------
# 1. Builder Stage
# ----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /workspace

# Install core build dependencies
RUN apk add --no-cache python3 make g++ git

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy workspace package definitions
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY tsconfig.base.json tsconfig.json ./

# Copy packages and sources
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

# Install dependencies (respecting pnpm lockfile)
RUN pnpm install --frozen-lockfile

# Build the Web Application Frontend (truthguard-ai)
RUN pnpm --filter @workspace/truthguard-ai run build

# Build the API Server (api-server)
RUN pnpm --filter @workspace/api-server run build

# ----------------------------------------------------------------------------
# 2. Production Runner Stage (Ultra-lightweight ~90MB)
# ----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy compiled backend bundle from builder
COPY --from=builder /workspace/artifacts/api-server/dist ./dist

# Copy built frontend assets to public directory for static serving
COPY --from=builder /workspace/artifacts/truthguard-ai/dist/public ./public

# Expose standard port (Koyeb routes traffic to 3000 by default)
EXPOSE 3000

# Automated health check probe for Koyeb & Docker orchestrators
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Run with non-root node user for enterprise container security
USER node

# Start the unified TruthGuard AI service
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
