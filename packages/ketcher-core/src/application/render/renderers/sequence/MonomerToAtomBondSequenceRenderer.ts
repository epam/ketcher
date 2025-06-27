import assert from 'assert';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { MonomerToAtomBond, SubChainNode, Vec2 } from 'domain/entities';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class MonomerToAtomBondSequenceRenderer extends BaseSequenceRenderer {
  constructor(
    public monomerToAtomBond: MonomerToAtomBond,
    private monomerNode: SubChainNode,
  ) {
    super(monomerToAtomBond);
  }

  private get monomer() {
    return this.monomerNode.monomer;
  }

  private get atom() {
    return this.monomerToAtomBond.atom;
  }

  public get scaledPosition() {
    assert(this.monomer.renderer instanceof BaseSequenceItemRenderer);

    const monomerY = this.monomer.renderer.scaledMonomerPositionForSequence.y;
    const monomerX = this.monomer.renderer.scaledMonomerPositionForSequence.x;
    const atomY = this.atom.renderer?.center.y;
    const atomX = this.atom.renderer?.center.x;

    return {
      startPosition: new Vec2(monomerX, monomerY),
      endPosition: new Vec2(atomX, atomY),
    };
  }

  public get center() {
    return Vec2.centre(
      new Vec2(
        this.scaledPosition.startPosition.x + 6,
        this.mainLineY.mainLineY1,
      ),
      new Vec2(
        this.scaledPosition.startPosition.x + 6,
        this.mainLineY.mainLineY2,
      ),
    );
  }

  private get mainLineY() {
    const mainLineY1 =
      this.scaledPosition.startPosition.y -
      (this.scaledPosition.startPosition.y > this.scaledPosition.endPosition.y
        ? 15
        : -3);
    const mainLineY2 = this.scaledPosition.endPosition.y;

    return { mainLineY1, mainLineY2 };
  }

  public show() {
    this.rootElement = this.canvas
      .insert('g', `:first-child`)
      .data([this]) as never as D3SvgElementSelection<SVGGElement, void>;

    this.rootElement
      ?.append('path')
      .attr('stroke', 'black')
      .attr('fill', 'none')
      .attr('d', this.getBondPath());
  }

  private getBondPath() {
    return `M ${this.scaledPosition.startPosition.x + 6}, ${
      this.mainLineY.mainLineY1
    } L ${this.scaledPosition.endPosition.x}, ${this.mainLineY.mainLineY2}`;
  }

  public moveStart(): void {}

  public moveEnd(): void {}

  public get isSnake(): false {
    return false;
  }

  public isMonomersOnSameHorizontalLine(): false {
    return false;
  }
}
