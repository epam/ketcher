import { BaseSequenceItemRenderer } from 'application/render/renderers/sequence/BaseSequenceItemRenderer';
import { BaseMonomer } from 'domain/entities';
import { BaseRenderer } from 'application/render';
import { PolymerBond } from 'domain/entities/PolymerBond';
import assert from 'assert';

export class PolymerBondSequenceRenderer extends BaseRenderer {
  constructor(public polymerBond: PolymerBond) {
    super(polymerBond);
  }

  private get areMonomersOnSameRow() {
    return (
      this.polymerBond.firstMonomer.renderer.scaledMonomerPosition.y ===
      this.polymerBond.secondMonomer.renderer.scaledMonomerPosition.y
    );
  }

  public show() {
    assert(this.polymerBond.firstMonomer.renderer);
    assert(this.polymerBond.secondMonomer?.renderer);
    this.rootElement = this.canvas.insert('g', `:first-child`).data([this]);

    const firstMonomerY =
      this.polymerBond.firstMonomer.renderer.scaledMonomerPosition.y;
    const firstMonomerX =
      this.polymerBond.firstMonomer.renderer.scaledMonomerPosition.x;
    const secondMonomerY =
      this.polymerBond.secondMonomer.renderer.scaledMonomerPosition.y;
    const secondMonomerX =
      this.polymerBond.secondMonomer.renderer.scaledMonomerPosition.x;

    const mainLineY1 =
      firstMonomerY -
      (firstMonomerY > secondMonomerY ? 15 : -3) +
      (this.areMonomersOnSameRow ? -25 : 0);

    const mainLineY2 =
      secondMonomerY -
      (secondMonomerY > firstMonomerY ? 15 : -3) +
      (this.areMonomersOnSameRow ? -25 : 0);

    this.rootElement
      ?.append('line')
      .attr('stroke', 'black')
      .attr('x1', firstMonomerX + 6)
      .attr('y1', mainLineY1)
      .attr('x2', secondMonomerX + 6)
      .attr('y2', mainLineY2);

    if (this.areMonomersOnSameRow) {
      this.rootElement
        ?.append('line')
        .attr('stroke', 'black')
        .attr('x1', firstMonomerX + 6)
        .attr('x2', firstMonomerX + 6)
        .attr('y1', mainLineY1 + 5)
        .attr('y2', mainLineY1);

      this.rootElement
        ?.append('line')
        .attr('stroke', 'black')
        .attr('x1', secondMonomerX + 6)
        .attr('x2', secondMonomerX + 6)
        .attr('y1', mainLineY2 + 5)
        .attr('y2', mainLineY2);
    }
  }
}
