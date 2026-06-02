FROM node:22-alpine

WORKDIR /app

# NestJS app lives in hr-api/, not the repo root
COPY hr-api/package*.json ./
RUN npm ci

COPY hr-api/ .

RUN npm run build

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
