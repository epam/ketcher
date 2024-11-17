import { Selection } from 'd3';
import { Phosphate } from 'domain/entities/Phosphate';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

const PHOSPHATE_SELECTED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].selected;
const PHOSPHATE_SYMBOL_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].body;

export class PhosphateRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Phosphate, scale?: number) {
    super(
      monomer,
      PHOSPHATE_SELECTED_ELEMENT_ID,
      PHOSPHATE_SELECTED_ELEMENT_ID,
      PHOSPHATE_SYMBOL_ELEMENT_ID,
      scale,
    );
  }

  protected getMonomerColor(theme) {
    return theme.monomer.color[RNA_DNA_NON_MODIFIED_PART.PHOSPHATE].regular;
  }

  public get textColor() {
    return this.monomer.isModification ? '#fff' : '#333333';
  }

  protected highlightIfModified(): void {
    if (this.monomer.isModification) {
      this.rootElement
        ?.append('use')
        .attr('xlink:href', '#phosphate-modified-background')
        .attr('class', 'modification-background');
    }
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', PHOSPHATE_SYMBOL_ELEMENT_ID)
      .attr('fill', this.getMonomerColor(theme));
  }

  show(theme) {
    super.show(theme);
    this.highlightIfModified();
  }

  public get enumerationElementPosition() {
    return undefined;
  }

  public get beginningElementPosition() {
    return undefined;
  }
}
