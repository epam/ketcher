import { Selection } from 'd3';
import { Chem } from 'domain/entities/Chem';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';

const CHEM_HOVERED_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.CHEM].hover;
const CHEM_SYMBOL_ELEMENT_ID = MONOMER_SYMBOLS_IDS[KetMonomerClass.CHEM].body;
const CHEM_AUTOCHAIN_PREVIEW_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.CHEM].autochainPreview;

export class ChemRenderer extends BaseMonomerRenderer {
  constructor(public monomer: Chem, scale?: number) {
    super(
      monomer,
      CHEM_HOVERED_ELEMENT_ID,
      CHEM_SYMBOL_ELEMENT_ID,
      CHEM_AUTOCHAIN_PREVIEW_ELEMENT_ID,
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
      .attr('href', CHEM_SYMBOL_ELEMENT_ID)
      .attr('fill', '#F5F6F7')
      .attr('stroke', theme.monomer.color.CHEM.regular);
  }

  public get enumerationElementPosition() {
    return undefined;
  }

  public get beginningElementPosition() {
    return undefined;
  }

  public show(theme?) {
    if (
      this.monomer.monomerItem.props.isMicromoleculeFragment &&
      !isMonomerSgroupWithAttachmentPoints(this.monomer)
    ) {
      return;
    }

    super.show(theme);
  }

  protected get modificationConfig() {
    return undefined;
  }
}
