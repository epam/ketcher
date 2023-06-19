import { Ketcher } from 'ketcher-core';

declare global {
  interface Window {
    ketcher: Ketcher;
  }
}
