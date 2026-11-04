import {
  type SVGPathAttributes,
  type BondVectors,
  BondDashArrayMap,
  BondWidth,
  DativeArrowTipOffset,
} from 'application/render/renderers/BondPathRenderer/constants';
import { BondType } from 'domain/entities/CoreBond';
import { Vec2 } from 'domain/entities/vec2';

class SingleBondPathRenderer {
  static preparePaths(
    bondVectors: BondVectors,
    type?: BondType,
  ): SVGPathAttributes[] {
    const { startPosition } = bondVectors;
    let { endPosition } = bondVectors;

    // Like Raphael's `arrow-end` in micro mode: shorten the line so the arrowhead
    // tip lands on the end point instead of overshooting it.
    if (type === BondType.Dative) {
      const bondLength = Vec2.dist(startPosition, endPosition);
      if (bondLength > 0) {
        endPosition = endPosition.addScaled(
          startPosition.sub(endPosition).normalized(),
          Math.min(DativeArrowTipOffset, bondLength),
        );
      }
    }

    const strokeDasharray =
      type === undefined ? 'none' : BondDashArrayMap[type];
    const svgPath: SVGPathAttributes = {
      d: `
          M${startPosition.x},${startPosition.y}
          L${endPosition.x},${endPosition.y}
        `,
      attrs: {
        'marker-end': type === BondType.Dative ? 'url(#arrow-marker)' : 'none',
        'stroke-dasharray': strokeDasharray,
        'stroke-width': `${BondWidth}`,
      },
    };

    return [svgPath];
  }
}

export default SingleBondPathRenderer;
