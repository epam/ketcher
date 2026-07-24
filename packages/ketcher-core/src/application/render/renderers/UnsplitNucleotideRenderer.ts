import type { Selection } from 'd3';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import type { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import type { D3SvgElementSelection } from 'application/render/types';
import {
  MONOMER_SYMBOLS_IDS,
  UNRESOLVED_MONOMER_COLOR,
} from 'application/render/renderers/constants';

const NUCLEOTIDE_SYMBOL_ELEMENTS_IDS = MONOMER_SYMBOLS_IDS.RNA;
if (!NUCLEOTIDE_SYMBOL_ELEMENTS_IDS) {
  throw new Error('Missing monomer symbol ids for RNA');
}

const NUCLEOTIDE_HOVERED_ELEMENT_ID = NUCLEOTIDE_SYMBOL_ELEMENTS_IDS.hover;
const NUCLEOTIDE_SYMBOL_ELEMENT_ID = NUCLEOTIDE_SYMBOL_ELEMENTS_IDS.body;
const NUCLEOTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID =
  NUCLEOTIDE_SYMBOL_ELEMENTS_IDS.autochainPreview;

export class UnsplitNucleotideRenderer extends BaseMonomerRenderer {
  public CHAIN_START_TERMINAL_INDICATOR_TEXT = '’5';
  public CHAIN_END_TERMINAL_INDICATOR_TEXT = '’3';

  constructor(public monomer: UnsplitNucleotide, scale?: number) {
    super(
      monomer,
      NUCLEOTIDE_HOVERED_ELEMENT_ID,
      NUCLEOTIDE_SYMBOL_ELEMENT_ID,
      NUCLEOTIDE_AUTOCHAIN_PREVIEW_ELEMENT_ID,
      scale,
    );
  }

  public get textColor() {
    if (this.monomer.monomerItem.props.unresolved) {
      return 'white';
    }
    return super.textColor;
  }

  protected getMonomerColor(theme) {
    if (this.monomer.monomerItem.props.unresolved) {
      return UNRESOLVED_MONOMER_COLOR;
    }
    return super.getMonomerColor(theme);
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
    const Y_OFFSET_FROM_MIDDLE = -2;

    const foreignObject = rootElement
      .append('foreignObject')
      .attr('width', this.width)
      .attr('height', this.height - this.height / 3)
      .attr('font-size', `${fontSize}px`)
      .attr('line-height', `${fontSize}px`)
      .attr('font-weight', '700')
      .style('cursor', 'pointer')
      .style('user-select', 'none')
      .attr('pointer-events', 'none')
      .attr('x', '4px')
      .attr('y', this.height / 2 + Y_OFFSET_FROM_MIDDLE);

    foreignObject
      .append('xhtml:div')
      .style('padding', '0 4px')
      .style('text-align', 'center')
      .style('color', this.textColor)
      .style('display', 'flex')
      .style('height', '100%')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .text(this.monomer.label);
  }

  public get enumerationElementPosition() {
    return { x: 7, y: 7 };
  }

  public get beginningElementPosition() {
    return { x: 0, y: 15 };
  }

  protected get modificationConfig() {
    return undefined;
  }
}
