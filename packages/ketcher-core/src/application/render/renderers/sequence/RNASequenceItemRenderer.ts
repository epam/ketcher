import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  AmbiguousMonomer,
  Nucleoside,
  Nucleotide,
  Vec2,
} from 'domain/entities';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';

export abstract class RNASequenceItemRenderer extends BaseSequenceItemRenderer {
  constructor(
    public node: Nucleoside | Nucleotide,
    _firstNodeInChainPosition: Vec2,
    _monomerIndexInChain: number,
    _isLastMonomerInChain: boolean,
    _subChain: BaseSubChain,
    _isEditingSymbol: boolean,
    public monomerSize: { width: number; height: number },
    public scaledMonomerPosition: Vec2,
  ) {
    super(
      node,
      _firstNodeInChainPosition,
      _monomerIndexInChain,
      _isLastMonomerInChain,
      _subChain,
      _isEditingSymbol,
      monomerSize,
      scaledMonomerPosition,
    );
  }

  get symbolToDisplay(): string {
    return this.node.rnaBase instanceof AmbiguousMonomer
      ? this.node.rnaBase.label
      : this.node.rnaBase.monomerItem?.props.MonomerNaturalAnalogCode || '@';
  }

  protected drawCommonModification(node: Nucleoside | Nucleotide) {
    if (node.rnaBase.isModification) {
      this.backgroundElement?.attr(
        'fill',
        this.node.monomer.selected
          ? this.isSequenceEditInRnaBuilderModeTurnedOn
            ? '#41A8B2'
            : '#3ACA6A'
          : '#CAD3DD',
      );
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
}
