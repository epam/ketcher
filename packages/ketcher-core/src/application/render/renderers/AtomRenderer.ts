import { BaseRenderer } from 'application/render';
import { select } from 'd3';
import { Atom } from 'domain/entities/CoreAtom';
import Coordinates from 'application/editor/shared/coordinates';

export class AtomRenderer extends BaseRenderer {
  constructor(public atom: Atom) {
    super(atom);
  }

  get scaledPosition() {
    return Coordinates.modelToView(this.atom.position)
  }

  show() {
    this.canvas
      .append('circle')
      .attr('r', 1)
      .attr('cx', this.scaledPosition.x)
      .attr('cy', this.scaledPosition.y)
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('fill', 'black');
  }
}
