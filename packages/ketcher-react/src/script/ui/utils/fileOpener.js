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

function throughFileReader(file) {
  const isCDX = file.name.endsWith('cdx') && !file.name.endsWith('b64cdx');
  return new Promise((resolve, reject) => {
    const rd = new FileReader(); // eslint-disable-line no-undef

    rd.onload = () => {
      const content = isCDX ? rd.result.slice(37) : rd.result;
      if (file.msClose) file.msClose();
      resolve(content);
    };

    rd.onerror = (event) => {
      reject(event);
    };
    isCDX ? rd.readAsDataURL(file) : rd.readAsText(file, 'UTF-8');
  });
}

function throughFileSystemObject(fso, file) {
  // IE9 and below
  const fd = fso.OpenTextFile(file.name, 1);
  const content = fd.ReadAll();
  fd.Close();
  return content;
}
