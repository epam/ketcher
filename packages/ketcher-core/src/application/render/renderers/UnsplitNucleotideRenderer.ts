import { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { UnsplitNucleotide } from 'domain/entities';
import { D3SvgElementSelection } from 'application/render/types';

const NUCLEOTIDE_SELECTED_ELEMENT_ID = '#nucleotide-selection';
const NUCLEOTIDE_HOVERED_ELEMENT_ID = '#nucleotide-hover';
const NUCLEOTIDE_SYMBOL_ELEMENT_ID = '#nucleotide';

export class UnsplitNucleotideRenderer extends BaseMonomerRenderer {
  constructor(public monomer: UnsplitNucleotide, scale?: number) {
    super(
      monomer,
      NUCLEOTIDE_SELECTED_ELEMENT_ID,
      NUCLEOTIDE_HOVERED_ELEMENT_ID,
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

  protected appendLabel(rootElement: D3SvgElementSelection<SVGGElement, void>) {
    const fontSize = 6;
    rootElement
      .append('foreignObject')
      .attr('width', this.width)
      .attr('height', this.height)
      .html(
        `
        <div style="padding: 0 4px; text-align: center; color: ${this.textColor}">
          ${this.monomer.label}
        </div>
      `,
      )
      .attr('font-size', `${fontSize}px`)
      .attr('line-height', `${fontSize}px`)
      .attr('font-weight', '700')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .attr('pointer-events', 'none')
      .attr('x', '4px')
      .attr('y', this.height / 2);
  }

  protected get enumerationElementPosition() {
    return { x: 7, y: 7 };
  }

  protected get beginningElementPosition() {
    return undefined;
  }
}
