# Step 1: Use Node.js official Alpine image
FROM node:18-alpine

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Step 4: Copy source code
COPY . .

# Step 5: Set environment variables
ENV NODE_ENV=production

# Step 6: Expose the port (same as your backend server)
EXPOSE 3000

# Step 7: Start the server
CMD ["node", "src/server.js"]
