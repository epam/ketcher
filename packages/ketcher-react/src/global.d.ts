import type { BaseRenderer, Ketcher } from 'ketcher-core';

declare global {
  let global: typeof globalThis;

  export interface Window {
    ketcher?: Ketcher;
    isPolymerEditorTurnedOn: boolean;
  }

  export interface Element {
    __data__?: BaseRenderer;
  }

  export interface EventTarget {
    __data__?: BaseRenderer;
  }
}
