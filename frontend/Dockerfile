# Use an official Node runtime as a parent image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install git and other build utilities if needed by any npm dependencies
RUN apk add --no-cache git

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies (use npm ci or npm install)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expo web default port is 8081
EXPOSE 8081

# Set environment variables for non-interactive CLI usage
ENV CI=1

# Start the Expo application in web mode and host it
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
