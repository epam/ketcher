'use strict';

const fs = require('node:fs');
const path = require('node:path');

const mode = process.env.MODE;
const command = process.argv[2];

if (!mode) {
  throw new Error('MODE environment variable is required');
}

const buildDir = path.resolve(__dirname, '..', 'build');
const distDir = path.resolve(__dirname, '..', 'dist', mode);

switch (command) {
  case 'init-dist':
    fs.mkdirSync(distDir, { recursive: true });
    break;
  case 'delete-dist':
    fs.rmSync(distDir, { force: true, recursive: true });
    break;
  case 'copy-build':
    fs.mkdirSync(distDir, { recursive: true });
    fs.cpSync(buildDir, distDir, { force: true, recursive: true });
    break;
  default:
    throw new Error(`Unknown command: ${command}`);
}
