FROM node:18.12.0

FROM mcr.microsoft.com/playwright:v1.33.0-jammy

WORKDIR /app

COPY package.json /app/package.json
RUN npm ci
COPY . /app

ENV CI false
ENV MODE standalone
