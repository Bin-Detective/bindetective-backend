# Use a lightweight Node.js base image
FROM node:18-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on (Cloud Run automatically assigns a port)
EXPOSE 7070

# Run the web service on container startup.
CMD [ "npm", "start" ]
