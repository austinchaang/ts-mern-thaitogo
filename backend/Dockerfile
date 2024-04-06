# Use a Node.js base image
FROM node:latest

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./

# Copy application code from local machine to Docker image
COPY ./src ./src

# Install dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "start"]
