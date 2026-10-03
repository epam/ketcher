import type { BaseRenderer, Ketcher } from 'ketcher-core';
import type { CurrentState } from './script/ui/action/copyAs.types';

declare global {
  var currentState: CurrentState | undefined;

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
