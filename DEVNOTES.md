## Prerequisites

- Stable [Node.js](https://nodejs.org) version
- [Yarn](https://yarnpkg.com/) installed globally

## Build instructions

The latest version of Ketcher has been splitted into two packages: component library (see /src folder) and React Ready-to-run application (see /example folder).

### Build component library (terminal #1)

    yarn install
    yarn start

For production build:

    yarn build

### Build example application (terminal #2)

    cd example
    yarn install
    yarn start

For production build:

    yarn build

## Indigo Service

Ketcher uses Indigo Service for server operations.
You may pass it as a property while Editor component is used or just add api_path query parameter:

    <Editor staticResourcesUrl={process.env.PUBLIC_URL} apiPath={link to Indigo service} />
      or
    http://localhost:3000/?api_path={link to Indigo service}

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

## 3D Viewer

Ketcher can use Miew for viewing and editing data in 3D.
For use of this functionality you should add the link to miew by your own:

    <html lang="en">
      <head>
      ...
        <link href="{link to Miew.min.css}" rel="stylesheet">
        ...
        </head>
      </head>
      <body>
        ...
        <script src="{link to Miew.min.js}"></script>
        ...
      </body>
    </html>

You can find the latest version of viewer [here](https://github.com/epam/miew).
The last checked version - [0.7.13](https://github.com/epam/miew/releases/tag/v0.7.13).

## Additional commands

To start unit tests:

    yarn test:unit
      or
    yarn test:watch

To start prettier:

    prettier
    prettier:write

To start eslint:

    test:lint 

To start stylelint:

    yarn stylelint
      or
    yarn stylelint:fix

To start all tests and formatting:

    yarn test

## Simple server

Place this docker-compose.yml file at the root of your repository

```
version: '3'
services:
  nginx:
    image: nginx:1.17.10-alpine
    ports:
      - 8080:80
    volumes:
      - ./nginx:/etc/nginx/conf.d:ro
      - ./ketcher:/srv/www:ro
    links:
      - indigo_service
    depends_on:
      - indigo_service

  indigo_service:
    image: epmlsop/indigo_service
    environment:
      - PYTHONPATH=${INDIGO_SERVICE_PYTHONPATH:-/srv/indigo-python}
      - INDIGO_UWSGI_RUN_PARAMETERS=--plugin python3 --py-autoreload=1
      - PYTHONDONTWRITEBYTECODE=1
    ports:
      - 8002:8002
    command: supervisord -n
```

Copy Ketcher files under ketcher/ folder
Add this file under nginx/defaut.conf

```
server {
  listen 80;
  keepalive_timeout 5;

  # The following configuration are related to the indigo service
  # see here https://lifescience.opensource.epam.com/indigo/service/index.html
  location / {
    root /srv/www;
    index ketcher.html;
    try_files $uri $uri/ @indigoservice;
  }

  location @indigoservice {
    # Should be set 'always' to transfer our lovely HTTP500 errors
    # Headers could be also set by Flasgger in service/config.py
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'POST, GET, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Accept, Content-Type' always;
    add_header 'Access-Control-Max-Age' '86400' always;
    include uwsgi_params;
    uwsgi_pass indigo_service:8002;
  }
}
```

Run

```
docker-compose up -d
```

Service with Ketcher will be run under localhost:8080/ketcher.html
