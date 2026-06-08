# Use lightweight Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies to minimize image size
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose port 3000 (default port for the Express app)
EXPOSE 3000

# Set production environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "server.js"]
