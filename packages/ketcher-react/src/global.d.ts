import { BaseRenderer, Ketcher, CoreEditor } from 'ketcher-core';

declare global {
  export interface Window {
    ketcher?: Ketcher;
    isPolymerEditorTurnedOn: boolean;
    ketcherMacro?: CoreEditor;
  }

  export interface Element {
    __data__?: BaseRenderer;
  }

  export interface EventTarget {
    __data__?: BaseRenderer;
  }
}
