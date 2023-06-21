FROM mcr.microsoft.com/playwright:v1.33.0-jammy

WORKDIR /app

COPY . .

RUN npm i && npx playwright install chromium