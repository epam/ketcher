## Prerequisites

   Stable [Node.js](https://nodejs.org) version

## Build instructions

    npm install
    npm start

For production build:

    npm run build
   
You could also build only the style with command

    npm run style

## Indigo Service

Ketcher uses Indigo Service for server operations.
You can use `--api-path` parameter to start with it:

    npm start -- --api-path=<server-url>
For production build:

    npm run build -- --api-path=<server-url>

You can find the instruction for service installation
[here](http://lifescience.opensource.epam.com/indigo/service/index.html).

## 3D Viewer

Ketcher uses Miew for viewing and editing data in 3D.
For use of this functionality you need to add parameter `--miew-path`,
having specified a path to directory with Miew files: [Miew.min.js and Miew.min.css](https://github.com/epam/miew/tree/master/dist):

    npm start -- --miew-path=<miew-dir>
For production build:

    npm run build -- --miew-path=<miew-dir>

You can find the latest version of viewer [here](https://github.com/epam/miew).
The last checked version - [0.7.13](https://github.com/epam/miew/releases/tag/v0.7.13).

## Tests instructions

You can start tests for input/output `.mol`-files and render.

    npm test

Tests are started for all structures in `test/fixtures` directory.

To start the tests separately:

    npm run test-io
    npm run test-render

#### Parameters

You can use following parameters to start the tests:
 - `--fixtures` - for the choice of a specific directory with molecules
 - `--headless` - for start of the browser in headless mode

```
npm run test-render -- --fixtures=fixtures/super --headless
```

If you have added new structures for testing to the `test/fixtures` directory 
you have to generate `svg` from them for correct render-test with:

    npm run generate-svg    


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