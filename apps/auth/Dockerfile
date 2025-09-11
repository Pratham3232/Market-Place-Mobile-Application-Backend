# Use Node.js as the base image
FROM node:24-slim AS development

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package-lock.json ./

RUN npm install -g @nestjs/cli 

# Install dependencies
RUN npm install --no-audit

# Copy the rest of the application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build auth

FROM node:24-slim AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g @nestjs/cli 
RUN npm install --only=production

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist

# Command to run the applications
CMD ["node", "dist/apps/auth/main"]