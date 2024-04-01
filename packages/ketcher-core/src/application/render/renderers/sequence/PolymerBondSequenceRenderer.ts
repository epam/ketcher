import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';
import { BaseSequenceRenderer } from 'application/render/renderers/sequence/BaseSequenceRenderer';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';

export class PolymerBondSequenceRenderer extends BaseSequenceRenderer {
  private selectionElement:
    | D3SvgElementSelection<SVGPathElement, void>
    | undefined;

  constructor(public polymerBond: PolymerBond) {
    super(polymerBond);
  }

  private get areMonomersOnSameRow() {
    assert(
      this.polymerBond.firstMonomer.renderer instanceof
        BaseSequenceItemRenderer,
    );
    assert(
      this.polymerBond.secondMonomer?.renderer instanceof
        BaseSequenceItemRenderer,
    );

    return (
      this.polymerBond.firstMonomer.renderer?.scaledMonomerPositionForSequence
        .y ===
      this.polymerBond.secondMonomer?.renderer?.scaledMonomerPositionForSequence
        .y
    );
  }

  public get scaledPosition() {
    assert(
      this.polymerBond.firstMonomer.renderer instanceof
        BaseSequenceItemRenderer,
    );
    assert(
      this.polymerBond.secondMonomer?.renderer instanceof
        BaseSequenceItemRenderer,
    );
    const firstMonomerY =
      this.polymerBond.firstMonomer.renderer.scaledMonomerPositionForSequence.y;
    const firstMonomerX =
      this.polymerBond.firstMonomer.renderer.scaledMonomerPositionForSequence.x;
    const secondMonomerY =
      this.polymerBond.secondMonomer.renderer.scaledMonomerPositionForSequence
        .y;
    const secondMonomerX =
      this.polymerBond.secondMonomer.renderer.scaledMonomerPositionForSequence
        .x;

    return {
      startPosition: new Vec2(firstMonomerX, firstMonomerY),
      endPosition: new Vec2(secondMonomerX, secondMonomerY),
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
        : -3) +
      (this.areMonomersOnSameRow ? -25 : 0);

    const mainLineY2 =
      this.scaledPosition.endPosition.y -
      (this.scaledPosition.endPosition.y > this.scaledPosition.startPosition.y
        ? 15
        : -3) +
      (this.areMonomersOnSameRow ? -25 : 0);
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

  public drawSelection() {
    assert(this.rootElement);
    if (this.polymerBond.selected) {
      this.selectionElement?.remove();
      this.selectionElement = this.rootElement
        ?.insert('path', ':first-child')
        .attr('stroke', '#57FF8F')
        .attr('stroke-width', '6')
        .attr('fill', 'none');

      this.selectionElement.attr('d', this.getBondPath());
    } else {
      this.selectionElement?.remove();
    }
  }

  private getBondPath() {
    let path = '';
    if (this.areMonomersOnSameRow) {
      path = `M ${this.scaledPosition.startPosition.x + 6},
      ${this.mainLineY.mainLineY1 + 5} 
      L ${this.scaledPosition.startPosition.x + 6}, ${
        this.mainLineY.mainLineY1
      } 
      L ${this.scaledPosition.endPosition.x + 6}, ${this.mainLineY.mainLineY2}
      L ${this.scaledPosition.endPosition.x + 6}, ${
        this.mainLineY.mainLineY2 + 5
      }`;
    } else {
      path = `M ${this.scaledPosition.startPosition.x + 6}, ${
        this.mainLineY.mainLineY1
      } L ${this.scaledPosition.endPosition.x + 6}, ${
        this.mainLineY.mainLineY2
      }`;
    }
    return path;
  }
}
