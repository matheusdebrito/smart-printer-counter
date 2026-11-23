# Smart Printer Counter - Dockerfile
FROM node:20-alpine

# Install system dependencies for Playwright (Chromium) + build tools for native modules (better-sqlite3)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    dumb-init \
    # Build tools for native modules
    make \
    g++ \
    python3

# Tell Playwright to use system Chromium
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including native module compilation)
RUN npm ci --omit=dev

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p data

# Create contadores directory for generated files
RUN mkdir -p contadores

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]