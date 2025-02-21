import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { Vec2 } from 'domain/entities';
import { Coordinates } from 'application/editor';
import { arc } from 'd3';

export class AngleSnapView extends TransientView {
  public static viewName = 'AngleSnapView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: { connectedPosition: Vec2; movingPosition: Vec2 },
  ) {
    const { connectedPosition, movingPosition } = params;

    const connectedPositionInPixels =
      Coordinates.modelToCanvas(connectedPosition);
    const movingPositionInPixels = Coordinates.modelToCanvas(movingPosition);

    transientLayer
      .append('line')
      .attr('x1', connectedPositionInPixels.x)
      .attr('y1', connectedPositionInPixels.y)
      .attr('x2', connectedPositionInPixels.x)
      .attr('y2', connectedPositionInPixels.y - 50)
      .attr('stroke', '#365CFF')
      .attr('stroke-dasharray', '4,4');

    transientLayer
      .append('line')
      .attr('x1', connectedPositionInPixels.x)
      .attr('y1', connectedPositionInPixels.y)
      .attr('x2', movingPositionInPixels.x)
      .attr('y2', movingPositionInPixels.y)
      .attr('stroke', '#365CFF')
      .attr('stroke-width', 1);

    const bondAngle = Math.atan2(
      movingPositionInPixels.y - connectedPositionInPixels.y,
      movingPositionInPixels.x - connectedPositionInPixels.x,
    );

    const alignerAngle = -Math.PI / 2;

    let startAngle = bondAngle;
    let endAngle = alignerAngle;

    if (startAngle > endAngle) {
      endAngle += Math.PI / 2;
      startAngle += Math.PI / 2;
    }

    const arcGenerator = arc()
      .innerRadius(39)
      .outerRadius(40)
      .startAngle(startAngle)
      .endAngle(endAngle);

    transientLayer
      .append('path')
      .attr('d', arcGenerator({}))
      .attr(
        'transform',
        `translate(${connectedPositionInPixels.x}, ${connectedPositionInPixels.y})`,
      )
      .attr('fill', 'none')
      .attr('stroke', '#365CFF');
    // .attr('marker-end', 'url(#arrow-marker)');
  }
}
