import { Selection } from 'd3';
import { RNABase } from 'domain/entities/RNABase';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import {
  MONOMER_SYMBOLS_IDS,
  UNRESOLVED_MONOMER_COLOR,
} from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';

const RNABASE_HOVERED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].hover;
const RNABASE_SYMBOL_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].body;
const RNABASE_AUTOCHAIN_PREVIEW_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Base].autochainPreview;

export class RNABaseRenderer extends BaseMonomerRenderer {
  constructor(public monomer: RNABase, scale?: number) {
    super(
      monomer,
      RNABASE_HOVERED_ELEMENT_ID,
      RNABASE_SYMBOL_ELEMENT_ID,
      RNABASE_AUTOCHAIN_PREVIEW_ELEMENT_ID,
      scale,
    );
  }

  public get textColor() {
    if (this.monomer.monomerItem.props.unresolved) {
      return '#fff';
    }
    return this.monomer.isModification ? '#fff' : '#333333';
  }

  protected get modificationConfig() {
    if (this.monomer.monomerItem.props.unresolved) {
      return undefined;
    }
    return { backgroundId: '#rna-base-modified-background' };
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
      .attr('href', RNABASE_SYMBOL_ELEMENT_ID)
      .attr('fill', color);
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
