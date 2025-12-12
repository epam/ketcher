import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class UnresolvedMonomerSequenceItemRenderer extends BaseSequenceItemRenderer {
  get symbolToDisplay(): string {
    return '?';
  }

  get dataSymbolType(): string {
    return 'Unresolved';
  }

  protected drawModification(): void {
    return undefined;
  }
}
