FROM node:18.12.0

FROM mcr.microsoft.com/playwright:v1.33.0-jammy

ARG IGNORE_UNSTABLE_TESTS
ENV IGNORE_UNSTABLE_TESTS ${IGNORE_UNSTABLE_TESTS}

WORKDIR /app

COPY . .

RUN npm i && npx playwright install chromium