# Tasky Backend - Production Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start the server (prisma db push handled separately)
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/index.js"]
