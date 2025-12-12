import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { AmbiguousMonomer, Nucleoside, Nucleotide } from 'domain/entities';
import { SequenceNodeOptions } from './types';

export abstract class RNASequenceItemRenderer extends BaseSequenceItemRenderer {
  declare node: Nucleoside | Nucleotide;

  constructor(options: SequenceNodeOptions) {
    super(options);
    this.node = options.node as Nucleoside | Nucleotide;
  }

  get symbolToDisplay(): string {
    return this.node.rnaBase instanceof AmbiguousMonomer
      ? this.node.rnaBase.label
      : this.node.rnaBase.monomerItem?.props.MonomerNaturalAnalogCode || '@';
  }

  get dataSymbolType(): string {
    return 'RNA';
  }

  protected drawCommonModification(node: Nucleoside | Nucleotide) {
    if (node.rnaBase.isModification) {
      let modificationFillColor = '#CAD3DD';

      if (this.node.monomer.selected) {
        modificationFillColor = this.isSequenceEditInRnaBuilderModeTurnedOn
          ? '#41A8B2'
          : '#3ACA6A';
      }

      this.backgroundElement?.attr('fill', modificationFillColor);
    }

    if (node.sugar.isModification) {
      this.backgroundElement
        ?.attr(
          'stroke',
          this.isSequenceEditInRnaBuilderModeTurnedOn ? '#24545A' : '#585858',
        )
        .attr('stroke-width', '1px');
    }
  }

  public reset(): void {
    super.reset();
  }
}
