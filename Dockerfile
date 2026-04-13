FROM node:20-alpine AS base

# --- Server build ---
FROM base AS server
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate

# --- Client build ---
FROM base AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Production image ---
FROM base AS production
WORKDIR /app

# Copy server
COPY --from=server /app/server ./server

# Copy built client into server's public folder
COPY --from=client-build /app/client/dist ./server/public

EXPOSE 4000

WORKDIR /app/server

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
