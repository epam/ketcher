
FROM node:18-alpine
FROM mcr.microsoft.com/playwright:v1.37.0-jammy

WORKDIR /app

COPY . .

RUN npm i && npx playwright install chromium