import { Ketcher } from 'ketcher-core';

declare global {
  export interface Window {
    ketcher?: Ketcher;
    isPolymerEditorTurnedOn: boolean;
  }

  export interface SVGElement {
    getBBox: () => void;
  }
}
