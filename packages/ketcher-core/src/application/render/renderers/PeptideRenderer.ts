import { Selection } from 'd3';
import { Peptide } from 'domain/entities/Peptide';
import { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import { MONOMER_SYMBOLS_IDS } from 'application/render/renderers/constants';
import { KetMonomerClass } from 'application/formatters';

const PEPTIDE_SELECTED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.AminoAcid].selected;
const PEPTIDE_HOVERED_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.AminoAcid].hover;
const PEPTIDE_SYMBOL_ELEMENT_ID =
  MONOMER_SYMBOLS_IDS[KetMonomerClass.AminoAcid].body;

export class PeptideRenderer extends BaseMonomerRenderer {
  public CHAIN_START_TERMINAL_INDICATOR_TEXT = 'N';
  public CHAIN_END_TERMINAL_INDICATOR_TEXT = 'C';

  constructor(public monomer: Peptide, scale?: number) {
    super(
      monomer,
      PEPTIDE_SELECTED_ELEMENT_ID,
      PEPTIDE_HOVERED_ELEMENT_ID,
      PEPTIDE_SYMBOL_ELEMENT_ID,
      scale,
    );
  }

  protected get modificationConfig() {
    return { backgroundId: '#modified-background', requiresFill: true };
  }

  protected appendBody(
    rootElement: Selection<SVGGElement, void, HTMLElement, never>,
    theme,
  ) {
    const isPeptide = this.monomer.monomerItem.props?.MonomerType === 'PEPTIDE';
    const color = isPeptide
      ? this.getPeptideColor(theme)
      : this.getMonomerColor(theme);
    return rootElement
      .append('use')
      .data([this])
      .attr('href', PEPTIDE_SYMBOL_ELEMENT_ID)
      .attr('fill', color);
  }

  public get textColor() {
    const LIGHT_COLOR = 'white';
    const DARK_COLOR = '#333333';

    const peptideColorsMap: { [key: string]: string } = {
      D: DARK_COLOR,
      E: LIGHT_COLOR,
      K: DARK_COLOR,
      H: LIGHT_COLOR,
      O: LIGHT_COLOR,
      R: LIGHT_COLOR,
      Q: DARK_COLOR,
      Y: LIGHT_COLOR,
      U: DARK_COLOR,
      S: LIGHT_COLOR,
      C: LIGHT_COLOR,
      N: LIGHT_COLOR,
      T: LIGHT_COLOR,
      L: DARK_COLOR,
      I: LIGHT_COLOR,
      F: LIGHT_COLOR,
      A: LIGHT_COLOR,
      W: DARK_COLOR,
      P: DARK_COLOR,
      G: DARK_COLOR,
      M: DARK_COLOR,
      V: DARK_COLOR,
    };

    const monomerCode = this.monomer.monomerItem.props.MonomerNaturalAnalogCode;
    let baseColor = peptideColorsMap[monomerCode] ?? super.textColor;

    if (this.monomer.isModification) {
      baseColor = baseColor === LIGHT_COLOR ? DARK_COLOR : LIGHT_COLOR;
    }

    return baseColor;
  }

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
  }

  public get enumerationElementPosition() {
    return { x: 10, y: -1 };
  }

  public get beginningElementPosition() {
    return { x: -6, y: 10 };
  }
}
