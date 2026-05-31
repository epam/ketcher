import type { Ketcher } from 'ketcher-core';
import type { BaseRenderer } from 'application/render';
import type { LogSettings } from 'utilities';

declare global {
  export interface Window {
    ketcher?: Ketcher;
    logging: LogSettings;
    isPolymerEditorTurnedOn: boolean;
  }

  export interface SVGElement {
    getBBox: () => DOMRect;
  }

  export interface Element {
    __data__?: BaseRenderer;
  }

  export interface EventTarget {
    __data__?: BaseRenderer;
  }

  declare module '*.ket' {
    const content: string;
    export default content;
  }
}
