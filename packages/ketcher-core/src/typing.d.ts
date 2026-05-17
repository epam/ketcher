import { Ketcher } from 'ketcher-core';
import { LogSettings } from 'utilities';

declare global {
  const global: typeof globalThis;

  export interface Window {
    ketcher?: Ketcher;
    logging: LogSettings;
    isPolymerEditorTurnedOn: boolean;
  }

  export interface SVGElement {
    getBBox: () => DOMRect;
  }

  export interface Element {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __data__?: any;
  }

  export interface EventTarget {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __data__?: any;
  }

  export interface Map<K, V> {
    get(key: K): V;
  }

  declare module '*.ket' {
    const content: string;
    export default content;
  }
}
