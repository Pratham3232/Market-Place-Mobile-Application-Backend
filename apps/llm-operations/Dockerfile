FROM node:24-slim AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install -g nestjs/cli

RUN npm install --no-audit

COPY . .

RUN npx prisma generate

RUN npm run build llm-operations

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

# Command to run the application
CMD ["node", "dist/apps/llm-operations/main"]