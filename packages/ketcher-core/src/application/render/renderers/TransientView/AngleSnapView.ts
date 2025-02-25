import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, PolymerBond } from 'domain/entities';
import { Coordinates } from 'application/editor';
import { arc } from 'd3';

export type AngleSnapViewParams = {
  connectedMonomer: BaseMonomer;
  polymerBond: PolymerBond;
  isDistanceSnapped: boolean;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class AngleSnapView extends TransientView {
  public static viewName = 'AngleSnapView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: AngleSnapViewParams,
  ) {
    const { connectedMonomer, polymerBond, isDistanceSnapped } = params;

    const connectedPosition = connectedMonomer.position;
    const movingMonomer =
      polymerBond.firstMonomer === connectedMonomer
        ? polymerBond.secondMonomer
        : polymerBond.firstMonomer;

    if (!movingMonomer) {
      return;
    }

    const movingPosition = movingMonomer.position;

    const connectedPositionInPixels =
      Coordinates.modelToCanvas(connectedPosition);
    const movingPositionInPixels = Coordinates.modelToCanvas(movingPosition);

    transientLayer
      .append('line')
      .attr('x1', connectedPositionInPixels.x)
      .attr('y1', connectedPositionInPixels.y)
      .attr('x2', connectedPositionInPixels.x)
      .attr('y2', connectedPositionInPixels.y - 40)
      .attr('stroke', '#365CFF')
      .attr('stroke-dasharray', '4 4')
      .style('opacity', 0.5);

    if (!isDistanceSnapped) {
      transientLayer
        .append('line')
        .attr('x1', connectedPositionInPixels.x)
        .attr('y1', connectedPositionInPixels.y)
        .attr('x2', movingPositionInPixels.x)
        .attr('y2', movingPositionInPixels.y)
        .attr('stroke', '#365CFF')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');
    }

    const bondAngle = Math.atan2(
      movingPositionInPixels.y - connectedPositionInPixels.y,
      movingPositionInPixels.x - connectedPositionInPixels.x,
    );

    const alignerAngle = -Math.PI / 2;

    let startAngle = bondAngle;
    let endAngle = alignerAngle;

    endAngle += Math.PI / 2;
    startAngle += Math.PI / 2;

    if (startAngle >= Math.PI) {
      startAngle -= 2 * Math.PI;
    }

    console.log('start', startAngle);
    console.log('end', endAngle);

    if (startAngle !== endAngle) {
      const arcGenerator = arc()
        .innerRadius(30)
        .outerRadius(30)
        .startAngle(Math.min(startAngle, endAngle))
        .endAngle(Math.max(startAngle, endAngle));

      transientLayer
        .append('path')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .attr('d', arcGenerator({}))
        .attr(
          'transform',
          `translate(${connectedPositionInPixels.x}, ${connectedPositionInPixels.y})`,
        )
        .attr('fill', 'none')
        .attr('stroke', '#365CFF')
        .attr('marker-end', 'url(#arrow-marker)');
    }
  }
}
