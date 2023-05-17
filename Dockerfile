FROM node:18.12.0

WORKDIR /usr/src/app

COPY . .

EXPOSE 4002
CMD ["npm", "run", "serve:standalone"]