import { Selection } from 'd3';
import { Sugar } from 'domain/entities/Sugar';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

const SUGAR_SELECTED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Sugar].selected;
const SUGAR_SYMBOL_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.Sugar].body;

export class SugarRenderer extends BaseMonomerRenderer {
  public CHAIN_BEGINNING = '’5';

  constructor(public monomer: Sugar, scale?: number) {
    super(
      monomer,
      SUGAR_SELECTED_ELEMENT_ID,
      SUGAR_SELECTED_ELEMENT_ID,
      SUGAR_SYMBOL_ELEMENT_ID,
      scale,
    );
  }

  public get textColor() {
    return '#fff';
  }

  protected getMonomerColor(theme) {
    return theme.monomer.color[RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA].regular;
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', SUGAR_SYMBOL_ELEMENT_ID)
      .attr('fill', this.getMonomerColor(theme));
  }

  show(theme) {
    super.show(theme);
    this.appendChainBeginning();
  }

  public get enumerationElementPosition() {
    return undefined;
  }

  public get beginningElementPosition() {
    return { x: -5, y: 7 };
  }
}
