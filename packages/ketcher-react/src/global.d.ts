import type { BaseRenderer, Ketcher } from 'ketcher-core';
import type { CurrentAppState } from './script/ui/state/store.types';

declare global {
  let global: typeof globalThis;
  let currentState: CurrentAppState;

  export interface Window {
    ketcher?: Ketcher;
    isPolymerEditorTurnedOn: boolean;
    currentState: CurrentAppState;
  }

  export interface Element {
    __data__?: BaseRenderer;
  }

  export interface EventTarget {
    __data__?: BaseRenderer;
  }
}
