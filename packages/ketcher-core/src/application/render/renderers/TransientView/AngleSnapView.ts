import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, HydrogenBond, PolymerBond } from 'domain/entities';
import { Coordinates } from 'application/editor';
import { arc } from 'd3';

export type AngleSnapViewParams = {
  connectedMonomer: BaseMonomer;
  polymerBond: PolymerBond | HydrogenBond;
  isDistanceSnapped: boolean;
};

const minimalAngleDifference = (a: number, b: number) => {
  let diff = b - a;

  while (diff <= -Math.PI) {
    diff += 2 * Math.PI;
  }
  while (diff > Math.PI) {
    diff -= 2 * Math.PI;
  }

  return diff;
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
      .attr('stroke-dasharray', '4')
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
        .attr(
          'stroke-dasharray',
          polymerBond instanceof HydrogenBond ? '2' : '0',
        );
    }

    const bondAngle = Math.atan2(
      movingPositionInPixels.y - connectedPositionInPixels.y,
      movingPositionInPixels.x - connectedPositionInPixels.x,
    );
    const alignerAngle = -Math.PI / 2;

    if (Math.abs(bondAngle - alignerAngle) < 1e-8) {
      return;
    }

    const startAngle = bondAngle + Math.PI / 2;
    const endAngle = alignerAngle + Math.PI / 2;

    const diff = minimalAngleDifference(startAngle, endAngle);

    const arcPath =
      arc()({
        innerRadius: 30,
        outerRadius: 30,
        // It is done deliberately so the arrowhead will be attached at the right arc end
        startAngle: startAngle + diff,
        endAngle: startAngle,
      })?.slice(0, -1) ?? null;

    transientLayer
      .append('path')
      .attr('d', arcPath)
      .attr(
        'transform',
        `translate(${connectedPositionInPixels.x}, ${connectedPositionInPixels.y})`,
      )
      .attr('fill', 'none')
      .attr('opacity', 0.5)
      .attr('stroke', '#365CFF')
      .attr('marker-end', 'url(#arrow-marker-arc)');
  }
}
