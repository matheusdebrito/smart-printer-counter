# Smart Printer Counter - Dockerfile
# Using node:20-slim (Debian-based) for better native module compatibility (better-sqlite3)
FROM node:20-slim

# Install system dependencies for Playwright (Chromium) + build tools for native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libxcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    # Build tools for native modules (better-sqlite3)
    build-essential \
    python3 \
    # dumb-init for signal handling
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Tell Playwright to use system Chromium
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (including native module compilation)
# Using npm install instead of npm ci to avoid lockfile sync issues
RUN npm install --omit=dev

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