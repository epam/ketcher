import { Ketcher } from 'ketcher-core';

declare global {
  export interface Window {
    ketcher?: Ketcher;
    logging: LogSettings;
    isPolymerEditorTurnedOn: boolean;
  }

  export interface SVGElement {
    getBBox: () => void;
  }

  export interface Element {
    __data__?: BaseRenderer;
  }
}
