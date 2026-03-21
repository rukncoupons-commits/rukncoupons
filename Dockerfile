# ═══════════════════════════════════════════════════════════════════
#  Google Cloud Run — Optimized Single-Stage Dockerfile
# ═══════════════════════════════════════════════════════════════════
#
#  Build: Next.js must be pre-built before running docker build
#  Run:   docker run -p 8080:8080 --env-file .env.local rukncoupons
#
#  Cloud Run specific:
#   - Listens on PORT env var (Cloud Run injects this, defaults to 8080)
#   - Runs as non-root user (Cloud Run security requirement)
#   - Standalone output for minimal image size
# ═══════════════════════════════════════════════════════════════════

# Stage 1: Production runner (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for Cloud Run security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone output and static files built by Cloud Build
COPY public ./public
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

USER nextjs

# Cloud Run injects PORT automatically (usually 8080)
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE 8080

# Healthcheck for Cloud Run readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
