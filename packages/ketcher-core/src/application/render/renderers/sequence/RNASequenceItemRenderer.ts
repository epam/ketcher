import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import {
  AmbiguousMonomer,
  Nucleoside,
  Nucleotide,
  Vec2,
} from 'domain/entities';
import { Chain } from 'domain/entities/monomer-chains/Chain';
import { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';

export abstract class RNASequenceItemRenderer extends BaseSequenceItemRenderer {
  constructor(
    public node: Nucleoside | Nucleotide,
    _firstNodeInChainPosition: Vec2,
    _monomerIndexInChain: number,
    _isLastMonomerInChain: boolean,
    _chain: Chain,
    _isEditingSymbol: boolean,
    public monomerSize: { width: number; height: number },
    public scaledMonomerPosition: Vec2,
    _previousRowsWithAntisense = 0,
    _twoStrandedNode?: ITwoStrandedChainItem,
  ) {
    super(
      node,
      _firstNodeInChainPosition,
      _monomerIndexInChain,
      _isLastMonomerInChain,
      _chain,
      _isEditingSymbol,
      monomerSize,
      scaledMonomerPosition,
      _previousRowsWithAntisense,
      _twoStrandedNode,
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
