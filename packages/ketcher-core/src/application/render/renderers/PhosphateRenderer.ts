import { Selection } from 'd3';
import { Phosphate } from 'domain/entities/Phosphate';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import {
  MONOMER_SYMBOLS_IDS,
  UNRESOLVED_MONOMER_COLOR,
} from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

const PHOSPHATE_HOVERED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].hover;
const PHOSPHATE_SYMBOL_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].body;
const PHOSPHATE_AUTOCHAIN_PREVIEW_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.Phosphate].autochainPreview;

export class PhosphateRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Phosphate, scale?: number) {
    super(
      monomer,
      PHOSPHATE_HOVERED_ELEMENT_ID,
      PHOSPHATE_SYMBOL_ELEMENT_ID,
      PHOSPHATE_AUTOCHAIN_PREVIEW_ELEMENT_ID,
      scale,
    );
  }

  protected getMonomerColor(theme) {
    return theme.monomer.color[RNA_DNA_NON_MODIFIED_PART.PHOSPHATE].regular;
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
    return { backgroundId: '#phosphate-modified-background' };
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
      .attr('href', PHOSPHATE_SYMBOL_ELEMENT_ID)
      .attr('fill', color);
  }

  show(theme) {
    super.show(theme);
  }

  public get enumerationElementPosition() {
    return undefined;
  }

  public get beginningElementPosition() {
    return undefined;
  }
}
