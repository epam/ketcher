import { TransientView } from './TransientView';
import { D3SvgElementSelection } from 'application/render/types';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { Coordinates, MonomersAlignment } from 'application/editor';

export type DistanceSnapViewParams = {
  alignment: MonomersAlignment | undefined;
  alignedMonomers: BaseMonomer[] | undefined;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class DistanceSnapView extends TransientView {
  public static viewName = 'DistanceSnapView';

  public static show(
    transientLayer: D3SvgElementSelection<SVGGElement, void>,
    params: DistanceSnapViewParams,
  ) {
    const { alignment, alignedMonomers } = params;

    if (!alignment || !alignedMonomers) {
      return;
    }

    const sortedMonomers = alignedMonomers.sort((a, b) => {
      return alignment === 'horizontal'
        ? a.center.x - b.center.x
        : a.center.y - b.center.y;
    });

    // Find either the left-most or bottom-most monomer
    const extremeMonomer = alignedMonomers.reduce(
      (extremeMonomer, nextMonomer) => {
        if (alignment === 'horizontal') {
          return nextMonomer.center.y > extremeMonomer.center.y
            ? nextMonomer
            : extremeMonomer;
        } else {
          return nextMonomer.center.x < extremeMonomer.center.x
            ? nextMonomer
            : extremeMonomer;
        }
      },
    );

    const alignerPosition = new Vec2(
      alignment === 'horizontal' ? 0 : extremeMonomer.center.x - 1.5,
      alignment === 'horizontal' ? extremeMonomer.center.y + 1.5 : 0,
    );
    const alignerPositionInPixels = Coordinates.modelToCanvas(alignerPosition);

    let previousMonomerPositionInPixels: Vec2 | undefined;
    sortedMonomers.forEach((monomer, index, monomers) => {
      const monomerPositionInPixels = Coordinates.modelToCanvas(monomer.center);
      const nextMonomer =
        index < monomers.length - 1 ? monomers[index + 1] : null;
      const nextMonomerPositionInPixels = nextMonomer
        ? Coordinates.modelToCanvas(nextMonomer.center)
        : null;

      if (alignment === 'horizontal') {
        transientLayer
          .append('line')
          .attr('x1', monomerPositionInPixels.x)
          .attr('y1', monomerPositionInPixels.y)
          .attr('x2', monomerPositionInPixels.x)
          .attr('y2', alignerPositionInPixels.y)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '4')
          .style('opacity', 0.75);
        transientLayer
          .append('line')
          .attr('x1', monomerPositionInPixels.x)
          .attr('y1', alignerPositionInPixels.y - 3)
          .attr('x2', monomerPositionInPixels.x)
          .attr('y2', alignerPositionInPixels.y + 3)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .style('opacity', 0.75);
        if (nextMonomerPositionInPixels) {
          transientLayer
            .append('line')
            .attr('x1', monomerPositionInPixels.x + 3)
            .attr('y1', alignerPositionInPixels.y)
            .attr('x2', nextMonomerPositionInPixels.x - 3)
            .attr('y2', alignerPositionInPixels.y)
            .attr('stroke', '#365CFF')
            .attr('stroke-width', 0.5)
            .attr('marker-end', 'url(#arrow-marker-arc)')
            .style('opacity', 0.75);
        }
        if (previousMonomerPositionInPixels) {
          transientLayer
            .append('line')
            .attr('x1', monomerPositionInPixels.x - 3)
            .attr('y1', alignerPositionInPixels.y)
            .attr('x2', previousMonomerPositionInPixels.x + 3)
            .attr('y2', alignerPositionInPixels.y)
            .attr('stroke', '#365CFF')
            .attr('stroke-width', 0.5)
            .attr('marker-end', 'url(#arrow-marker-arc)')
            .style('opacity', 0.75);
        }
      } else {
        transientLayer
          .append('line')
          .attr('x1', monomerPositionInPixels.x)
          .attr('y1', monomerPositionInPixels.y)
          .attr('x2', alignerPositionInPixels.x)
          .attr('y2', monomerPositionInPixels.y)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '4')
          .style('opacity', 0.75);
        transientLayer
          .append('line')
          .attr('x1', alignerPositionInPixels.x - 5)
          .attr('y1', monomerPositionInPixels.y)
          .attr('x2', alignerPositionInPixels.x + 5)
          .attr('y2', monomerPositionInPixels.y)
          .attr('stroke', '#365CFF')
          .attr('stroke-width', 0.5);
        if (nextMonomerPositionInPixels) {
          transientLayer
            .append('line')
            .attr('x1', alignerPositionInPixels.x)
            .attr('y1', monomerPositionInPixels.y)
            .attr('x2', alignerPositionInPixels.x)
            .attr('y2', nextMonomerPositionInPixels.y)
            .attr('stroke', '#365CFF')
            .attr('stroke-width', 1)
            .attr('marker-end', 'url(#arrow-marker-arc)');
        }
        if (previousMonomerPositionInPixels) {
          transientLayer
            .append('line')
            .attr('x1', alignerPositionInPixels.x)
            .attr('y1', monomerPositionInPixels.y)
            .attr('x2', alignerPositionInPixels.x)
            .attr('y2', previousMonomerPositionInPixels.y)
            .attr('stroke', '#365CFF')
            .attr('stroke-width', 1)
            .attr('marker-end', 'url(#arrow-marker-arc)');
        }
      }

      previousMonomerPositionInPixels = monomerPositionInPixels;
    });
  }
}
