import { saveAs } from 'file-saver';
import { FileSaverReturnType } from './saveButton.types';

export const fileSaver = (server): FileSaverReturnType => {
  return new Promise((resolve, reject) => {
    if (global.Blob && saveAs) {
      resolve((data, fn, type) => {
        const blob = new Blob([data], { type }); // eslint-disable-line no-undef
        saveAs(blob, fn);
      });
    } else if (server) {
      resolve(
        server.then(() => {
          throw Error("Server doesn't still support echo method");
        })
      );
    } else {
      reject(new Error('Your browser does not support opening files locally'));
    }
  });
};
