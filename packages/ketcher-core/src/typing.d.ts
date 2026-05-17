import { Ketcher } from 'ketcher-core';
import { BaseRenderer } from 'application/render';
import type { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import type { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import type { FlexOrSequenceOrSnakeModePolymerBondRenderer } from 'domain/entities/PolymerBond';
import { LogSettings } from 'utilities';

type D3ElementData =
  | BaseRenderer
  | BaseMonomerRenderer
  | BaseSequenceItemRenderer
  | FlexOrSequenceOrSnakeModePolymerBondRenderer;

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
    __data__?: D3ElementData;
  }

  export interface EventTarget {
    __data__?: D3ElementData;
  }

  declare module '*.ket' {
    const content: string;
    export default content;
  }
}
