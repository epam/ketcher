import {
  BondSVGPath,
  BondVectors,
  BondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';

class DoubleCisTransBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): BondSVGPath[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    const normal = firstHalfEdge.leftNormal;

    const firstLineStart = startPosition.addScaled(normal, BondWidth);
    const firstLineEnd = endPosition.addScaled(normal, -BondWidth);
    const secondLineStart = startPosition.addScaled(normal, -BondWidth);
    const secondLineEnd = endPosition.addScaled(normal, BondWidth);

    const svgPath: BondSVGPath = {
      d: `
          M${firstLineStart.x},${firstLineStart.y}
          L${firstLineEnd.x},${firstLineEnd.y}
          M${secondLineStart.x},${secondLineStart.y}
          L${secondLineEnd.x},${secondLineEnd.y}
        `,
      attrs: {
        'stroke-width': `${BondWidth}`,
      },
    };

    return [svgPath];
  }
}

export default DoubleCisTransBondPathRenderer;
