import { Selection } from 'd3';
import { Peptide } from 'domain/entities/Peptide';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const PEPTIDE_SELECTED_ELEMENT_ID = '#peptide-selection';

export class PeptideRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Peptide, scale?: number) {
    super(monomer, PEPTIDE_SELECTED_ELEMENT_ID, scale);
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', '#peptide')
      .style('cursor', 'pointer')
      .attr(
        'fill',
        theme.monomer.color[
          this.monomer.monomerItem.props.MonomerNaturalAnalogCode
        ].regular,
      );
  }
}
