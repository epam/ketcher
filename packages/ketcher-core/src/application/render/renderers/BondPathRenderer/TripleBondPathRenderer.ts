import {
  BondSVGPath,
  BondVectors,
  BondWidth,
  BondSpace,
} from 'application/render/renderers/BondPathRenderer/constants';

class TripleBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): BondSVGPath[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    const topLineStartPosition = startPosition.addScaled(
      firstHalfEdge.leftNormal,
      BondSpace,
    );
    const topLineEndPosition = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      BondSpace,
    );
    const bottomLineStartPosition = startPosition.addScaled(
      firstHalfEdge.leftNormal,
      -BondSpace,
    );
    const bottomLineEndPosition = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      -BondSpace,
    );

    const svgPath: BondSVGPath = {
      d: `
          M${topLineStartPosition.x},${topLineStartPosition.y}
          L${topLineEndPosition.x},${topLineEndPosition.y}
          M${startPosition.x},${startPosition.y}
          L${endPosition.x},${endPosition.y}
          M${bottomLineStartPosition.x},${bottomLineStartPosition.y}
          L${bottomLineEndPosition.x},${bottomLineEndPosition.y}
        `,
      attrs: {
        'stroke-width': `${BondWidth}`,
      },
    };

    return [svgPath];
  }
}

export default TripleBondPathRenderer;
