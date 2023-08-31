import { Selection } from 'd3';
import { Chem } from 'domain/entities/Chem';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const CHEM_SELECTED_ELEMENT_ID = '#chem-selection';

export class ChemRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Chem, scale?: number) {
    super(monomer, CHEM_SELECTED_ELEMENT_ID, scale);
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', '#chem')
      .style('cursor', 'pointer')
      .attr('stroke', theme.monomer.color.CHEM.regular);
  }
}
