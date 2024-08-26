import { Selection } from 'd3';
import { RNABase } from 'domain/entities/RNABase';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';

const RNABASE_SELECTED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].selected;
const RNABASE_SYMBOL_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].body;

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
      .attr('fill', this.getMonomerColor(theme));
  }

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
  }

  protected get enumerationElementPosition() {
    return { x: 11, y: 5 };
  }

  protected get beginningElementPosition() {
    return undefined;
  }
}
