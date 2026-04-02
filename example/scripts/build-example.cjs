'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.resolve(__dirname, '..');
const buildDir = path.join(appRoot, 'build');
const rewiredBin = path.resolve(
  appRoot,
  '..',
  'node_modules',
  'react-app-rewired',
  'bin',
  'index.js',
);
const modes = ['standalone', 'remote'];
const target = process.argv[2] || 'all';

if (target === 'all') {
  modes.forEach((mode) => buildMode(mode));
} else {
  buildMode(target);
}

function buildMode(mode) {
  if (!modes.includes(mode)) {
    throw new Error(`Unsupported mode: ${mode}`);
  }

  const env = {
    ...process.env,
    MODE: mode,
    NODE_OPTIONS: appendNodeOption(
      process.env.NODE_OPTIONS,
      '--disable-warning=DEP0176',
    ),
  };

  fs.mkdirSync(buildDir, { recursive: true });

  const distDir = path.join(appRoot, 'dist', mode);
  fs.rmSync(distDir, { force: true, recursive: true });
  fs.mkdirSync(distDir, { recursive: true });

  const args = [rewiredBin, 'build'];
  if (process.env.ANALYZE === 'true') {
    args.push('--analyze');
  }

  execFileSync(process.execPath, args, {
    cwd: appRoot,
    env,
    stdio: 'inherit',
  });

  fs.cpSync(buildDir, distDir, { force: true, recursive: true });
}

function appendNodeOption(currentValue, option) {
  if (!currentValue) {
    return option;
  }

  if (currentValue.includes(option)) {
    return currentValue;
  }

  return `${currentValue} ${option}`;
}
