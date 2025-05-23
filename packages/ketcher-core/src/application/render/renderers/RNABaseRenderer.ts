import { Selection } from 'd3';
import { RNABase } from 'domain/entities/RNABase';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';

const RNABASE_HOVERED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].hover;
const RNABASE_SYMBOL_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].body;

export class RNABaseRenderer extends BaseMonomerRenderer {
  constructor(public monomer: RNABase, scale?: number) {
    super(
      monomer,
      RNABASE_HOVERED_ELEMENT_ID,
      RNABASE_SYMBOL_ELEMENT_ID,
      scale,
    );
  }

  public get textColor() {
    return this.monomer.isModification ? '#fff' : '#333333';
  }

  protected get modificationConfig() {
    return { backgroundId: '#rna-base-modified-background' };
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

  public get enumerationElementPosition() {
    return { x: 11, y: 5 };
  }

  public get beginningElementPosition() {
    return undefined;
  }
}
