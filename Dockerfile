# ── Stage 1: Build React frontend ──────────────────────────────
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG VITE_API_URL=/api
ARG VITE_ADMIN_EMAILS
ARG VITE_BASE_PATH=/
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_ADMIN_EMAILS=$VITE_ADMIN_EMAILS
ENV VITE_BASE_PATH=$VITE_BASE_PATH
RUN npm run build

# ── Stage 2: API + built frontend (single container) ───────────
FROM node:22-alpine
WORKDIR /app

# API dependencies
COPY api/package*.json ./
RUN npm ci --omit=dev

# API source
COPY api/src/ ./src/
COPY api/entrypoint.sh ./entrypoint.sh

# React built files
COPY --from=frontend /app/dist ./public

RUN find ./public/assets -type f \( -name '*.js' -o -name '*.css' \) -exec gzip -9 -k {} \; \
  && mkdir -p uploads \
  && chmod +x entrypoint.sh

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
ENV UPLOADS_DIR=/app/uploads

ENTRYPOINT ["./entrypoint.sh"]
