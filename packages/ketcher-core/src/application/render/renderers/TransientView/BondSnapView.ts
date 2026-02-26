import { Coordinates } from 'application/editor';
import { D3SvgElementSelection } from 'application/render/types';
import { HydrogenBond, PolymerBond } from 'domain/entities';
import { TransientView } from './TransientView';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class BondSnapView extends TransientView {
  public static readonly viewName = 'BondSnapView';

  public static show<P extends PolymerBond>(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    bond: P,
  ) {
    const startPositionInPixels = Coordinates.modelToCanvas(bond.startPosition);
    const endPositionInPixels = Coordinates.modelToCanvas(bond.endPosition);

    transientLayer
      .append('circle')
      .attr('cx', startPositionInPixels.x)
      .attr('cy', startPositionInPixels.y)
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('style', 'pointer-events: none');
    transientLayer
      .append('circle')
      .attr('cx', startPositionInPixels.x)
      .attr('cy', startPositionInPixels.y)
      .attr('r', 3)
      .attr('fill', '#365CFF')
      .attr('style', 'pointer-events: none');

    transientLayer
      .append('circle')
      .attr('cx', endPositionInPixels.x)
      .attr('cy', endPositionInPixels.y)
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('style', 'pointer-events: none');
    transientLayer
      .append('circle')
      .attr('cx', endPositionInPixels.x)
      .attr('cy', endPositionInPixels.y)
      .attr('r', 3)
      .attr('fill', '#365CFF')
      .attr('style', 'pointer-events: none');

    transientLayer
      .append('line')
      .attr('x1', startPositionInPixels.x)
      .attr('y1', startPositionInPixels.y)
      .attr('x2', endPositionInPixels.x)
      .attr('y2', endPositionInPixels.y)
      .attr('stroke', '#365CFF')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', bond instanceof HydrogenBond ? '2' : '0')
      .attr('style', 'pointer-events: none');
  }
}
