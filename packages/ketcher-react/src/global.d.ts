import type { BaseRenderer, Ketcher } from 'ketcher-core';
import type { CurrentAppState } from './script/ui/action/types';

declare global {
  let global: typeof globalThis;
  var currentState: CurrentAppState;

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
