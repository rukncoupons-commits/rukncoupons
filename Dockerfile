# ═══════════════════════════════════════════════════════════════════
#  Google Cloud Run — Optimized Multi-Stage Dockerfile
# ═══════════════════════════════════════════════════════════════════
#
#  Build: docker build -t rukncoupons .
#  Run:   docker run -p 8080:8080 --env-file .env.local rukncoupons
#
#  Cloud Run specific:
#   - Listens on PORT env var (Cloud Run injects this, defaults to 8080)
#   - Runs as non-root user (Cloud Run security requirement)
#   - Standalone output for minimal image size
# ═══════════════════════════════════════════════════════════════════

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for Cloud Run security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Only copy what's needed from the build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run injects PORT automatically (usually 8080)
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE 8080

# Healthcheck for Cloud Run readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
