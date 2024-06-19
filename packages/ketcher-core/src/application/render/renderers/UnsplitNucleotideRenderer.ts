import { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render';
import { Phosphate } from 'domain/entities';

const NUCLEOTIDE_SELECTED_ELEMENT_ID = '#nucleotide-selection';
const NUCLEOTIDE_SYMBOL_ELEMENT_ID = '#nucleotide';

export class UnsplitNucleotideRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Phosphate, scale?: number) {
    super(
      monomer,
      NUCLEOTIDE_SELECTED_ELEMENT_ID,
      NUCLEOTIDE_SELECTED_ELEMENT_ID,
      NUCLEOTIDE_SYMBOL_ELEMENT_ID,
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
      .attr('href', NUCLEOTIDE_SYMBOL_ELEMENT_ID)
      .attr('fill', this.getMonomerColor(theme));
  }

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
  }

  protected get enumerationElementPosition() {
    return { x: 7, y: 7 };
  }

  protected get beginningElementPosition() {
    return undefined;
  }
}
