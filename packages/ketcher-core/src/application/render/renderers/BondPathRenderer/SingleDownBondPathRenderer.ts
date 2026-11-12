import {
  type SVGPathAttributes,
  type BondVectors,
  BondWidth,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';
import type { Vec2 } from 'domain/entities/vec2';

class SingleDownBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): SVGPathAttributes[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    const direction = endPosition.sub(startPosition);
    const bondLength = direction.length() + 0.2;
    const normalizedDirection = direction.normalized();
    const offsetBetweenLines = 1.2 * BondWidth;
    const numberOfLines =
      Math.max(
        Math.floor((bondLength - BondWidth) / (BondWidth + offsetBetweenLines)),
        0,
      ) + 2;
    const step = bondLength / (numberOfLines - 1);
    const halfOfBondEndWidth = 0.7 * StereoBondWidth;

    let path = '';

    for (let index = 0; index < numberOfLines; ++index) {
      const lineCenter: Vec2 = startPosition.addScaled(
        normalizedDirection,
        step * index,
      );
      const firstLineEnd: Vec2 = lineCenter.addScaled(
        firstHalfEdge.leftNormal,
        (halfOfBondEndWidth * (index + 0.5)) / (numberOfLines - 0.5),
      );
      const secondLineEnd: Vec2 = lineCenter.addScaled(
        firstHalfEdge.leftNormal,
        (-halfOfBondEndWidth * (index + 0.5)) / (numberOfLines - 0.5),
      );

      path += `
            M${firstLineEnd.x},${firstLineEnd.y}
            L${secondLineEnd.x},${secondLineEnd.y}
          `;
    }

    const svgPath: SVGPathAttributes = {
      d: path,
      attrs: {
        'stroke-width': '2',
      },
    };

    return [svgPath];
  }
}

export default SingleDownBondPathRenderer;
