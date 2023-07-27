import { BaseRenderer } from './BaseRenderer';
import { Selection } from 'd3';
import { Peptide } from 'domain/entities/Peptide';

export class PeptideRenderer extends BaseRenderer {
  protected rootElement:
    | Selection<SVGGElement, this, HTMLElement, never>
    | undefined;

  static isSelectable() {
    return true;
  }

  constructor(private peptide: Peptide, private scale?: number) {
    super();
  }

  public get rootBBox() {
    const rootNode = this.rootElement?.node();
    if (!rootNode) return;

    return rootNode.getBBox();
  }

  public get width() {
    return this.rootBBox?.width || 0;
  }

  public get height() {
    return this.rootBBox?.height || 0;
  }

  public get textColor() {
    const WHITE = 'white';
    const colorsMap = {
      D: WHITE,
      F: WHITE,
      K: WHITE,
      Q: WHITE,
      R: WHITE,
      W: WHITE,
      Y: WHITE,
    };
    return (
      colorsMap[this.peptide.monomerItem.props.MonomerNaturalAnalogCode] ||
      'black'
    );
  }

  private appendRootElement(
    canvas: Selection<SVGElement, unknown, HTMLElement, never>,
  ) {
    return canvas
      .append('g')
      .data([this])
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${this.peptide.position.x}, ${
          this.peptide.position.y
        }) scale(${this.scale || 1})`,
      );
  }

  private appendHexagon(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    theme,
  ) {
    return rootElement
      .append('use')
      .data([this])
      .attr('href', '#peptide')
      .attr(
        'fill',
        theme.monomer.color[
          this.peptide.monomerItem.props.MonomerNaturalAnalogCode
        ].regular,
      );
  }

  private appendLabel(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ) {
    const textElement = rootElement
      .append('text')
      .text(this.peptide.label)
      .attr('fill', this.textColor)
      .attr('font-size', '12px')
      .attr('line-height', '12px')
      .attr('font-weight', '700');

    const textBBox = (textElement.node() as SVGTextElement).getBBox();

    textElement
      .attr('x', this.width / 2 - textBBox.width / 2)
      .attr('y', this.height / 2);
  }

  public show(theme) {
    this.rootElement = this.rootElement || this.appendRootElement(this.canvas);
    this.appendHexagon(this.rootElement, theme);
    this.appendLabel(this.rootElement);
  }

  public highlight() {}

  public move() {
    this.rootElement?.attr(
      'transform',
      `translate(${this.peptide.position.x}, ${
        this.peptide.position.y
      }) scale(${this.scale || 1})`,
    );
  }

  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }
}
