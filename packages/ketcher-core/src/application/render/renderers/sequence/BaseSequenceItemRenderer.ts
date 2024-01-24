import { BaseRenderer } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, Vec2 } from 'domain/entities';

export abstract class BaseSequenceItemRenderer extends BaseRenderer {
  constructor(
    protected monomer: BaseMonomer,
    private firstMonomerInChainPosition: Vec2,
    private monomerIndexInChain: number,
    private monomerNumberInSubChain: number,
  ) {
    super(monomer);
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  moveSelection(): void {}

  protected removeHover(): void {}

  private appendRootElement() {
    return this.canvas
      .append('g')
      .data([this])
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${
          this.firstMonomerInChainPosition.x +
          this.monomerIndexInChain * 18 +
          Math.floor((this.monomerIndexInChain - 1) / this.nthSeparationInRow) *
            10
        }, ${this.firstMonomerInChainPosition.y})`,
      ) as never as D3SvgElementSelection<SVGGElement, void>;
  }

  private get nthSeparationInRow() {
    return 10;
  }

  private get symbolsInRow() {
    return 30;
  }

  show(): void {
    this.rootElement = this.appendRootElement();
    this.textElement = this.rootElement
      .append('text')
      .text(this.symbolToDisplay)
      .attr('font-family', 'Courier New')
      .attr('font-size', '20px')
      .attr('font-weight', '700')
      .attr('fill', '#333333');

    if (this.monomerNumberInSubChain % this.nthSeparationInRow === 0) {
      this.rootElement
        .append('text')
        .attr('x', '-2')
        .attr('y', '-24')
        .text(this.monomerNumberInSubChain)
        .attr('font-family', 'Courier New')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', '#7C7C7F');
    }
  }

  abstract get symbolToDisplay(): string;
}
