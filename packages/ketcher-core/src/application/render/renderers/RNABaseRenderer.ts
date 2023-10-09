import { Selection } from 'd3';
import { RNABase } from 'domain/entities/RNABase';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const RNABASE_SELECTED_ELEMENT_ID = '#rna-base-selection';
const RNABASE_SYMBOL_ELEMENT_ID = '#rna-base';

export class RNABaseRenderer extends BaseMonomerRenderer {
  constructor(public monomer: RNABase, scale?: number) {
    super(
      monomer,
      RNABASE_SELECTED_ELEMENT_ID,
      RNABASE_SELECTED_ELEMENT_ID,
      scale,
      RNABASE_SYMBOL_ELEMENT_ID,
    );
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', RNABASE_SYMBOL_ELEMENT_ID)
      .style('cursor', 'pointer')
      .attr(
        'fill',
        theme.monomer.color[
          this.monomer.monomerItem.props.MonomerNaturalAnalogCode
        ].regular,
      );
  }
}
