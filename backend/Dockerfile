# Use the official Microsoft Playwright image as the base
# This image comes with all the necessary system dependencies pre-installed
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install all dependencies (including devDependencies like 'tsx')
# We use --include=dev because we are using tsx to run the app directly
RUN npm install

# Copy the rest of the backend code
COPY . .

# Ensure the port is exposed
EXPOSE 3000

# Set the host for Fastify/Node to listen on 0.0.0.0
ENV HOST=0.0.0.0

# Start the application using 'tsx' as defined in your package.json
CMD ["npm", "run", "start"]
