import type { Selection } from 'd3';
import type { Sugar } from 'domain/entities/Sugar';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import {
  MONOMER_SYMBOLS_IDS,
  UNRESOLVED_MONOMER_COLOR,
} from 'application/render/renderers/constants';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

const SUGAR_SYMBOL_ELEMENTS_IDS = MONOMER_SYMBOLS_IDS.Sugar;
if (!SUGAR_SYMBOL_ELEMENTS_IDS) {
  throw new Error('Missing monomer symbol ids for Sugar');
}

const SUGAR_HOVERED_ELEMENT_ID = SUGAR_SYMBOL_ELEMENTS_IDS.hover;
const SUGAR_SYMBOL_ELEMENT_ID = SUGAR_SYMBOL_ELEMENTS_IDS.body;
const SUGAR_AUTOCHAIN_PREVIEW_ELEMENT_ID =
  SUGAR_SYMBOL_ELEMENTS_IDS.autochainPreview;

export class SugarRenderer extends BaseMonomerRenderer {
  public CHAIN_START_TERMINAL_INDICATOR_TEXT = '’5';
  public CHAIN_END_TERMINAL_INDICATOR_TEXT = '’3';

  constructor(public monomer: Sugar, scale?: number) {
    super(
      monomer,
      SUGAR_HOVERED_ELEMENT_ID,
      SUGAR_SYMBOL_ELEMENT_ID,
      SUGAR_AUTOCHAIN_PREVIEW_ELEMENT_ID,
      scale,
    );
  }

  public get textColor() {
    if (this.monomer.monomerItem.props.unresolved) {
      return '#fff';
    }
    return this.monomer.isModification ? '#333333' : '#fff';
  }

  protected get modificationConfig() {
    if (this.monomer.monomerItem.props.unresolved) {
      return undefined;
    }
    return { backgroundId: '#sugar-modified-background', requiresFill: true };
  }

  protected getMonomerColor(theme) {
    return theme.monomer.color[RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA].regular;
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
    theme,
  ) {
    const isUnresolved = this.monomer.monomerItem.props.unresolved;
    const color = isUnresolved
      ? UNRESOLVED_MONOMER_COLOR
      : this.getMonomerColor(theme);
    return rootElement
      .append('use')
      .data([this])
      .attr('href', SUGAR_SYMBOL_ELEMENT_ID)
      .attr('fill', color);
  }

  public get enumerationElementPosition() {
    return undefined;
  }

  public get beginningElementPosition() {
    return { x: -5, y: 7 };
  }
}
