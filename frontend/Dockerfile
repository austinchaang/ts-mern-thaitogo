# Use a Node.js base image
FROM node:latest as build

# Set working directory
WORKDIR /usr/src/app

# Copy application code from local machine to Docker image
COPY /Users/austin/Documents/ts-mern-chadthai/frontend/src .

# Install dependencies
COPY package*.json ./
RUN npm install

# Build React app
RUN npm run build

# Use Nginx base image to serve the built React app
FROM nginx:alpine

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port Nginx listens on
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
