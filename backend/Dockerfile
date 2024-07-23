# Use a specific Node.js base image for consistency
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript@^5.4.5

# Copy application code from local machine to Docker image
COPY . .

# Compile TypeScript code
RUN npm run build

# Expose the port your app runs on
EXPOSE 4000

# Ensure entrypoint script has executable permissions
RUN chmod +x /usr/src/app/docker-entrypoint.sh

# Set entrypoint script
ENTRYPOINT ["sh", "/usr/src/app/docker-entrypoint.sh"]

# Command to run the application
CMD ["npm", "start"]
