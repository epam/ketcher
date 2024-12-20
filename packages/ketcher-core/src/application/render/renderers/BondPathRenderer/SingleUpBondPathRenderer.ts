import {
  BondSVGPath,
  BondVectors,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';

class SingleUpBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): BondSVGPath[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    const halfOfBondEndWidth = 0.7 * StereoBondWidth;
    const bondEndFirstPoint = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      halfOfBondEndWidth,
    );
    const bondEndSecondPoint = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      -halfOfBondEndWidth,
    );

    const svgPath: BondSVGPath = {
      d: `
          M${startPosition.x},${startPosition.y}
          L${bondEndFirstPoint.x},${bondEndFirstPoint.y}
          L${bondEndSecondPoint.x},${bondEndSecondPoint.y}
          Z
        `,
      attrs: {
        stroke: '#000',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
    };

    return [svgPath];
  }
}

export default SingleUpBondPathRenderer;
