# Use the official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build the React app
RUN cd client && npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
