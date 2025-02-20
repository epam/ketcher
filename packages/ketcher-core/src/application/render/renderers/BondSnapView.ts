import { PolymerBond } from 'domain/entities';
import { TransientView } from 'application/render/renderers/TransientView';
import { Coordinates } from 'application/editor';

export class BondSnapView extends TransientView {
  constructor(private bond: PolymerBond) {
    super();
  }

  private get scaledPosition() {
    const startPositionInPixels = Coordinates.modelToCanvas(
      this.bond.startPosition,
    );
    const endPositionInPixels = Coordinates.modelToCanvas(
      this.bond.endPosition,
    );
    return {
      startPositionInPixels,
      endPositionInPixels,
    };
  }

  show() {
    this.remove();

    this.rootElement = this.canvas.append('g');

    this.rootElement
      .append('circle')
      .attr('cx', this.scaledPosition.startPositionInPixels.x)
      .attr('cy', this.scaledPosition.startPositionInPixels.y)
      .attr('r', 5)
      .attr('fill', 'red');

    this.rootElement
      .append('circle')
      .attr('cx', this.scaledPosition.endPositionInPixels.x)
      .attr('cy', this.scaledPosition.endPositionInPixels.y)
      .attr('r', 5)
      .attr('fill', 'red');

    this.rootElement
      .append('line')
      .attr('x1', this.scaledPosition.startPositionInPixels.x)
      .attr('y1', this.scaledPosition.startPositionInPixels.y)
      .attr('x2', this.scaledPosition.endPositionInPixels.x)
      .attr('y2', this.scaledPosition.endPositionInPixels.y)
      .attr('stroke', 'red')
      .attr('stroke-width', 1);
  }
}
