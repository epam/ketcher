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
import type {
  ActiveXObjectConstructor,
  FileContent,
  FileSystemObject,
  FileWithMsClose,
  OpenerFunction,
} from './fileOpener.types';

const ForReading = 1;

function getActiveXObject(): ActiveXObjectConstructor | undefined {
  return (globalThis as { ActiveXObject?: ActiveXObjectConstructor })
    .ActiveXObject;
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

export function fileOpener(server?: unknown): Promise<OpenerFunction> {
  return new Promise<OpenerFunction>((resolve, reject) => {
    const ActiveXObject = getActiveXObject();
    // TODO: refactor return
    if (globalThis.FileReader) {
      resolve(throughFileReader);
    } else if (ActiveXObject) {
      try {
        const fso = new ActiveXObject('Scripting.FileSystemObject');
        resolve((file) => Promise.resolve(throughFileSystemObject(fso, file)));
      } catch (e) {
        reject(
          e instanceof Error ? e : new Error('Failed to open file via ActiveX'),
        );
      }
    } else if (isThenable(server)) {
      resolve(
        server.then((): OpenerFunction => {
          throw Error("Server doesn't still support echo method");
        }),
      );
    } else {
      reject(new Error('Your browser does not support opening files locally'));
    }
  });
}

function arrayBufferToBase64(buffer: ArrayLike<number>): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function readPPTXStructures(buffer: ArrayBuffer): string[] {
  const cfb = CFB.read(new Uint8Array(buffer), { type: 'array' });
  const structures: string[] = [];
  cfb.FullPaths.forEach((path) => {
    if (path.endsWith('.bin')) {
      const ole = CFB.find(cfb, path);
      if (!ole) return;
      const sdf = CFB.find(CFB.parse(ole.content), 'CONTENTS');
      if (!sdf) return;
      const base64String = arrayBufferToBase64(sdf.content);
      if (base64String.startsWith('VmpDRDAxMDAEAw')) {
        structures.push(base64String);
      }
    }
  });
  return structures;
}

function throughFileReader(file: FileWithMsClose): Promise<FileContent> {
  const CDX = 'cdx';
  const PPTX = 'pptx';
  let fileType: typeof CDX | typeof PPTX | undefined;
  if (file.name.endsWith('cdx') && !file.name.endsWith('b64cdx')) {
    fileType = CDX;
  } else if (file.name.endsWith('pptx')) {
    fileType = PPTX;
  }

  return new Promise<FileContent>((resolve, reject) => {
    const rd = new FileReader();

    rd.onload = () => {
      const { result } = rd;
      let content: FileContent;
      switch (fileType) {
        case CDX:
          content = String(result).split(',').at(-1) ?? '';
          break;
        case PPTX:
          content = {
            structures:
              result instanceof ArrayBuffer ? readPPTXStructures(result) : [],
            isPPTX: true,
          };
          break;
        default:
          content = typeof result === 'string' ? result : '';
          break;
      }
      if (file.msClose) file.msClose();
      resolve(content);
    };

    rd.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    switch (fileType) {
      case CDX:
        rd.readAsDataURL(file);
        break;
      case PPTX:
        rd.readAsArrayBuffer(file);
        break;
      default:
        rd.readAsText(file, 'UTF-8');
        break;
    }
  });
}

function throughFileSystemObject(fso: FileSystemObject, file: File): string {
  // IE9 and below
  const fd = fso.OpenTextFile(file.name, ForReading);
  const content = fd.ReadAll();
  fd.Close();
  return content;
}
