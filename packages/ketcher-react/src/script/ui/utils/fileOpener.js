/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import * as CFB from 'cfb';

export function fileOpener(server) {
  return new Promise((resolve, reject) => {
    // TODO: refactor return
    if (global.FileReader) {
      resolve(throughFileReader);
    } else if (global.ActiveXObject) {
      try {
        const fso = new ActiveXObject('Scripting.FileSystemObject'); // eslint-disable-line no-undef
        resolve((file) => Promise.resolve(throughFileSystemObject(fso, file)));
      } catch (e) {
        reject(e);
      }
    } else if (server) {
      resolve(
        server.then(() => {
          throw Error("Server doesn't still support echo method");
          // return resolve(throughForm2IframePosting);
        }),
      );
    } else {
      reject(new Error('Your browser does not support opening files locally'));
    }
  });
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function throughFileReader(file) {
  const CDX = 'cdx';
  const PPTX = 'pptx';
  let fileType;
  if (file.name.endsWith('cdx') && !file.name.endsWith('b64cdx')) {
    fileType = CDX;
  } else if (file.name.endsWith('pptx')) {
    fileType = PPTX;
  }

  return new Promise((resolve, reject) => {
    const rd = new FileReader(); // eslint-disable-line no-undef

    rd.onload = (e) => {
      let content, structures;
      let cfb;
      switch (fileType) {
        case CDX:
          content = rd.result.split(',').at(-1);
          break;
        case PPTX:
          cfb = CFB.read(e.target.result, { type: 'binary' });
          structures = [];
          cfb.FullPaths.forEach((path) => {
            if (path.endsWith('.bin')) {
              const ole = CFB.find(cfb, path);
              const sdf = CFB.find(CFB.parse(ole?.content), 'CONTENTS');
              const base64String = arrayBufferToBase64(sdf?.content);
              if (base64String.startsWith('VmpDRDAxMDAEAw')) {
                structures.push(base64String);
              }
            }
          });
          content = { structures, isPPTX: true };
          break;
        default:
          content = rd.result;
          break;
      }
      if (file.msClose) file.msClose();
      resolve(content);
    };

    rd.onerror = (event) => {
      reject(event);
    };
    switch (fileType) {
      case CDX:
        rd.readAsDataURL(file);
        break;
      case PPTX:
        rd.readAsBinaryString(file);
        break;
      default:
        rd.readAsText(file, 'UTF-8');
        break;
    }
  });
}

function throughFileSystemObject(fso, file) {
  // IE9 and below
  const fd = fso.OpenTextFile(file.name, 1);
  const content = fd.ReadAll();
  fd.Close();
  return content;
}
