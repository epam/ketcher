
FROM node:18-alpine
FROM mcr.microsoft.com/playwright:v1.44.1-jammy

WORKDIR /app

COPY . .

RUN npm i && npx playwright install chromium