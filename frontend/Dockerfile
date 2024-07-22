# Use a Node.js base image for building frontend assets
FROM node:18 as build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Verify files
RUN ls -l /usr/src/app/src

# Build Vite app
RUN npm run build

# Use Nginx base image to serve the built React app
FROM nginx:stable-alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built frontend assets from build stage
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy Nginx configuration template
COPY nginx.conf /etc/nginx/templates/nginx.conf.template

# Copy start-nginx.sh script
COPY start-nginx.sh /usr/bin/start-nginx.sh
RUN chmod +x /usr/bin/start-nginx.sh

# Expose the port Nginx listens on
EXPOSE 8080

# Command to run the start-nginx.sh script
CMD ["/usr/bin/start-nginx.sh"]
