'use strict';

const fs = require('fs');
const path = require('path');
const Module = require('module');

const originalLoad = Module._load;

function safeCheckRequiredFiles(files) {
  let currentFilePath;

  try {
    files.forEach((filePath) => {
      currentFilePath = filePath;
      fs.accessSync(filePath, fs.constants.F_OK);
    });

    return true;
  } catch (err) {
    const dirName = path.dirname(currentFilePath || '');
    const fileName = path.basename(currentFilePath || '');

    // Keep output aligned with react-dev-utils/checkRequiredFiles.js.
    console.log('Could not find a required file.');
    console.log(`  Name: ${fileName}`);
    console.log(`  Searched in: ${dirName}`);

    return false;
  }
}

Module._load = function patchedModuleLoad(request, parent, isMain) {
  if (request === 'react-dev-utils/checkRequiredFiles') {
    return safeCheckRequiredFiles;
  }

  return originalLoad.call(this, request, parent, isMain);
};
