import { saveAs } from 'file-saver';
import type { FileSaverReturnType } from './saveButton.types';

export const fileSaver = (server): FileSaverReturnType => {
  return new Promise((resolve, reject) => {
    if (global.Blob && saveAs) {
      resolve((data, filename, type) => {
        const blob = new Blob([data], { type });
        saveAs(blob, filename);
      });
    } else if (server) {
      resolve(
        server.then(() => {
          throw new Error("Server doesn't still support echo method");
        }),
      );
    } else {
      reject(new Error('Your browser does not support opening files locally'));
    }
  });
};
