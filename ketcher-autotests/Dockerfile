FROM node:18.12.0

FROM mcr.microsoft.com/playwright:v1.33.0-jammy

WORKDIR /app

COPY . .

RUN curl localhost:4002
RUN curl http://host.docker.internal:4002
RUN curl http://host.docker.internal:4002:host-gateway

RUN npm i && npx playwright install chromium