import { BaseRenderer } from 'application/render';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { SubChainNode } from 'domain/entities/monomer-chains/types';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';

export abstract class BaseSequenceItemRenderer extends BaseRenderer {
  constructor(
    protected node: SubChainNode,
    private firstNodeInChainPosition: Vec2,
    private monomerIndexInChain: number,
    private monomerNumberInSubChain: number,
    private isLastMonomerInChain: boolean,
  ) {
    super(node instanceof BaseMonomer ? node : node.monomer);
  }

  protected appendHover(): D3SvgElementSelection<SVGUseElement, void> | void {
    return undefined;
  }

  protected appendHoverAreaElement(): void {}

  drawSelection(): void {}

  moveSelection(): void {}

  protected removeHover(): void {}

  public get scaledMonomerPosition() {
    const indexInRow = this.monomerIndexInChain % this.symbolsInRow;
    const rowIndex = Math.floor(this.monomerIndexInChain / this.symbolsInRow);

    return new Vec2(
      this.firstNodeInChainPosition.x +
        indexInRow * 18 +
        Math.floor(indexInRow / this.nthSeparationInRow) * 10,
      this.firstNodeInChainPosition.y + 50 * rowIndex,
    );
  }

  private appendRootElement() {
    return this.canvas
      .append('g')
      .data([this])
      .attr('transition', 'transform 0.2s')
      .attr(
        'transform',
        `translate(${this.scaledMonomerPosition.x}, ${this.scaledMonomerPosition.y})`,
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

    if (
      (this.monomerIndexInChain + 1) % this.nthSeparationInRow === 0 ||
      this.isLastMonomerInChain
    ) {
      this.rootElement
        .append('text')
        .attr('x', '-2')
        .attr('y', '-24')
        .text(this.monomerIndexInChain + 1)
        .attr('font-family', 'Courier New')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('fill', '#7C7C7F');
    }
  }

  abstract get symbolToDisplay(): string;
}
