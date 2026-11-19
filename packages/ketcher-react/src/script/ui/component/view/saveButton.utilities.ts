import { saveAs } from 'file-saver';
import type { FileSaverReturnType } from './saveButton.types';

export const fileSaver = async (server): FileSaverReturnType => {
  if (globalThis.Blob && saveAs) {
    return (data, filename, type) => {
      const blob = new Blob([data], { type });
      saveAs(blob, filename);
    };
  }
  if (server) {
    await server;
    throw new Error("Server doesn't still support echo method");
  }
  throw new Error('Your browser does not support opening files locally');
};
