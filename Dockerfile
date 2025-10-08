# This dockerfile is not yet configured for CI/CD pipeline
# STAGE 1: Base image with dependencies
# This stage installs all node modules in a clean environment.
FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Copy all package.json files first to leverage Docker cache
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install all dependencies for all workspaces
# This creates a clean, Linux-compatible node_modules folder
RUN npm install


# STAGE 2: Development image
# This stage uses the dependencies from the 'base' stage and runs the app.
FROM node:18-alpine AS development

WORKDIR /app

# Copy the pre-installed node_modules from the 'base' stage
# For npm workspaces, all dependencies are hoisted to the root node_modules directory.
COPY --from=base /app/node_modules ./node_modules

# Copy the application source code
# This will be overlaid by the volume mounts in docker-compose, which is fine
# because the node_modules are now safely copied.
COPY . .

# Expose the ports for frontend and backend
EXPOSE 3000 3001

# The default command to run the development servers
CMD ["npm", "run", "dev"]
