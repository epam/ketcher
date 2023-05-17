FROM node:18.12.0

FROM mcr.microsoft.com/playwright:v1.33.0-jammy

WORKDIR /app

COPY . .

ENV CI false
ENV MODE standalone

RUN npm ci && npx playwright install