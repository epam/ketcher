import { Selection } from 'd3';
import { Peptide } from 'domain/entities/Peptide';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';

const PEPTIDE_SELECTED_ELEMENT_ID = '#peptide-selection';
const PEPTIDE_HOVERED_ELEMENT_ID = '#peptide-hover';
const PEPTIDE_SYMBOL_ELEMENT_ID = '#peptide';

export class PeptideRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Peptide, scale?: number) {
    super(
      monomer,
      PEPTIDE_SELECTED_ELEMENT_ID,
      PEPTIDE_HOVERED_ELEMENT_ID,
      PEPTIDE_SYMBOL_ELEMENT_ID,
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
      .attr('href', PEPTIDE_SYMBOL_ELEMENT_ID)
      .style('cursor', 'pointer')
      .attr('fill', this.getMonomerColor(theme));
  }

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
  }

  protected get enumerationElementPosition() {
    return { x: 20, y: -1 };
  }
}
