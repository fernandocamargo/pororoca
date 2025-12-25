# Use Node.js 14 LTS (compatible with older dependencies)
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy application files
COPY . .

# Make the CLI globally available in the container
RUN yarn link

# Set entry point to the CLI
ENTRYPOINT ["pororoca"]

# Default command shows help
CMD ["--help"]
