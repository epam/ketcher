import { Selection } from 'd3';
import { Chem } from 'domain/entities/Chem';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const CHEM_SELECTED_ELEMENT_ID = '#chem-selection';
const CHEM_SYMBOL_ELEMENT_ID = '#chem';

export class ChemRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Chem, scale?: number) {
    super(
      monomer,
      CHEM_SELECTED_ELEMENT_ID,
      CHEM_SELECTED_ELEMENT_ID,
      CHEM_SYMBOL_ELEMENT_ID,
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
      .attr('href', CHEM_SYMBOL_ELEMENT_ID)
      .style('cursor', 'pointer')
      .attr('stroke', theme.monomer.color.CHEM.regular);
  }

  protected get enumerationElementPosition() {
    return undefined;
  }
}
