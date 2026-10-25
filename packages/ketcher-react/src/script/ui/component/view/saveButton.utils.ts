import { saveAs } from 'file-saver';
import type { FileSaverReturnType } from './saveButton.types';

export const fileSaver = async (server): FileSaverReturnType => {
  if (global.Blob && saveAs) {
    return (data, fn, type) => {
      const blob = new Blob([data], { type });
      saveAs(blob, fn);
    };
  }
  if (server) {
    await server;
    throw new Error("Server doesn't still support echo method");
  }
  throw new Error('Your browser does not support opening files locally');
};
