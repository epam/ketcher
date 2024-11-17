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
  public CHAIN_BEGINNING = 'N';

  constructor(public monomer: Peptide, scale?: number) {
    super(
      monomer,
      PEPTIDE_SELECTED_ELEMENT_ID,
      PEPTIDE_HOVERED_ELEMENT_ID,
      PEPTIDE_SYMBOL_ELEMENT_ID,
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
      .attr('href', PEPTIDE_SYMBOL_ELEMENT_ID)
      .attr('fill', this.getPeptideColor(theme));
  }

  public get textColor() {
    const WHITE = 'white';
    const BLACK = '#333333';
    const peptideColorsMap: { [key: string]: string } = {
      D: BLACK,
      E: WHITE,
      K: BLACK,
      H: WHITE,
      O: WHITE,
      R: WHITE,
      Q: BLACK,
      Y: WHITE,
      U: BLACK,
      S: WHITE,
      C: WHITE,
      N: WHITE,
      T: WHITE,
      L: BLACK,
      I: WHITE,
      F: WHITE,
      A: WHITE,
      W: BLACK,
      P: BLACK,
      G: BLACK,
      M: BLACK,
      V: BLACK,
    };

    const modificateColorsMap: { [key: string]: string } = {
      D: WHITE,
    };

    const monomerCode = this.monomer.monomerItem.props.MonomerNaturalAnalogCode;
    const colorsMap = this.monomer.isModification
      ? modificateColorsMap
      : peptideColorsMap;

    return colorsMap[monomerCode] ?? super.textColor;
  }

  protected highlightIfModified(): void {
    if (this.monomer.isModification) {
      this.rootElement
        ?.append('use')
        .attr('xlink:href', '#modified-background')
        .attr('class', 'modification-background');
    }
  }

  show(theme) {
    super.show(theme);
    this.appendEnumeration();
    this.appendChainBeginning();
    this.highlightIfModified();
  }

  public get enumerationElementPosition() {
    return { x: 10, y: -1 };
  }

  public get beginningElementPosition() {
    return { x: -6, y: 10 };
  }
}
