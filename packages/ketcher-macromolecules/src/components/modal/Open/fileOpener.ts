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

export type FileOpener = typeof throughFileReader;

export function fileOpener() {
  return new Promise<FileOpener>((resolve, reject) => {
    if (global.FileReader) {
      resolve(throughFileReader);
    } else {
      reject(new Error('Your browser does not support opening files locally'));
    }
  });
}

function throughFileReader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();

    rd.onload = () => {
      const content = rd.result;
      // readAsText below always yields a string result, but FileReader.result
      // is typed as string | ArrayBuffer | null, so narrow it explicitly
      // rather than trusting a cast.
      if (typeof content !== 'string') {
        reject(new Error('Failed to read file as text'));
        return;
      }
      resolve(content);
    };

    rd.onerror = (event) => {
      reject(new Error(`Failed to read file: ${event.type}`));
    };

    rd.readAsText(file, 'UTF-8');
  });
}
