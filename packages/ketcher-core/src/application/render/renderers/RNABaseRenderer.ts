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
      RNABASE_SYMBOL_ELEMENT_ID,
      scale,
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

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
  }

  protected get enumerationElementPosition() {
    return { x: 23, y: 10 };
  }
}
