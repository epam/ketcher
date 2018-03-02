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
