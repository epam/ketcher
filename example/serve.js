/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();
const staticFilesPath = path.join(__dirname, process.env.STATIC_FILES_PATH);

app.use(express.static(staticFilesPath));

app.get('*', function (req, res) {
  res.sendfile(staticFilesPath + '/index.html');
});

// https://web.dev/articles/how-to-use-local-https#setup
const options = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

const server = https.createServer(options, app);

server.listen(process.env.PORT, () => {
  const mode = process.env.STATIC_FILES_PATH.includes('standalone')
    ? 'standalone'
    : 'remote';
  console.log(
    `Serving ${mode} Ketcher on url https://localhost:${process.env.PORT}`,
  );
});
