import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { Coordinates } from 'application/editor';
import { MonomerSize } from 'domain/constants';

export type GroupCenterSnapViewParams = {
  isVertical: boolean;
  absoluteSnapPosition: Vec2;
  monomerPair: [BaseMonomer, BaseMonomer];
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class GroupCentersnapView extends TransientView {
  public static readonly viewName = 'GroupCentersnapView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: GroupCenterSnapViewParams,
  ) {
    const { absoluteSnapPosition, isVertical, monomerPair } = params;
    const snapPositionInPixels =
      Coordinates.modelToCanvas(absoluteSnapPosition);
    const LINE_LENGTH = 80;

    transientLayer
      .append('circle')
      .attr('cx', snapPositionInPixels.x)
      .attr('cy', snapPositionInPixels.y)
      .attr('r', 6)
      .attr('fill', 'darkgreen')
      .attr('stroke-width', 0);

    if (
      (isVertical &&
        Math.abs(monomerPair[0].position.y - monomerPair[1].position.y) >
          MonomerSize * 2) ||
      Math.abs(monomerPair[0].position.x - monomerPair[1].position.x) <
        MonomerSize * 2
    ) {
      const rightMonomerPosition =
        monomerPair[0].position.x > monomerPair[1].position.x
          ? monomerPair[0].position
          : monomerPair[1].position;
      const rightMonomerPositionInPixels =
        Coordinates.modelToCanvas(rightMonomerPosition);
      const mostRightPointX =
        Math.abs(rightMonomerPositionInPixels.x) + LINE_LENGTH;

      transientLayer
        .append('line')
        .attr('x1', snapPositionInPixels.x)
        .attr('y1', snapPositionInPixels.y)
        .attr('x2', mostRightPointX)
        .attr('y2', snapPositionInPixels.y)
        .attr('stroke', 'darkgreen')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', 4);

      monomerPair.forEach((monomer) => {
        const monomerPositionInPixels = Coordinates.modelToCanvas(
          monomer.position,
        );

        transientLayer
          .append('line')
          .attr('x1', monomerPositionInPixels.x)
          .attr('y1', monomerPositionInPixels.y)
          .attr('x2', mostRightPointX)
          .attr('y2', monomerPositionInPixels.y)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', 4);

        transientLayer
          .append('line')
          .attr('x1', mostRightPointX)
          .attr('y1', monomerPositionInPixels.y)
          .attr('x2', mostRightPointX)
          .attr('y2', snapPositionInPixels.y)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .attr('marker-end', 'url(#arrow-marker-arc)')
          .style('opacity', 0.75);
      });
    } else {
      const bottomMonomerPosition =
        monomerPair[0].position.y > monomerPair[1].position.y
          ? monomerPair[0].position
          : monomerPair[1].position;
      const bottomMonomerPositionInPixels = Coordinates.modelToCanvas(
        bottomMonomerPosition,
      );

      transientLayer
        .append('line')
        .attr('x1', snapPositionInPixels.x)
        .attr('y1', snapPositionInPixels.y)
        .attr('x2', snapPositionInPixels.x)
        .attr('y2', bottomMonomerPositionInPixels.y + LINE_LENGTH)
        .attr('stroke', 'darkgreen')
        .attr('stroke-width', 0.5)
        .attr('stroke-dasharray', 4);

      monomerPair.forEach((monomer) => {
        const monomerPositionInPixels = Coordinates.modelToCanvas(
          monomer.position,
        );

        transientLayer
          .append('line')
          .attr('x1', monomerPositionInPixels.x)
          .attr('y1', monomerPositionInPixels.y)
          .attr('x2', monomerPositionInPixels.x)
          .attr('y2', bottomMonomerPositionInPixels.y + LINE_LENGTH)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', 4);

        transientLayer
          .append('line')
          .attr('x1', monomerPositionInPixels.x)
          .attr('y1', bottomMonomerPositionInPixels.y + LINE_LENGTH)
          .attr('x2', snapPositionInPixels.x)
          .attr('y2', bottomMonomerPositionInPixels.y + LINE_LENGTH)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .attr('marker-end', 'url(#arrow-marker-arc)')
          .style('opacity', 0.75);
      });
    }
  }
}
