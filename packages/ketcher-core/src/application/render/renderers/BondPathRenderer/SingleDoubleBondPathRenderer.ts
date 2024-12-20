import {
  BondDashArrayMap,
  BondSpace,
  BondSVGPath,
  BondVectors,
  BondWidth,
  LinesOffset,
} from 'application/render/renderers/BondPathRenderer/constants';
import { Vec2 } from 'domain/entities';
import { BondType } from 'domain/entities/CoreBond';

class SingleDoubleBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): BondSVGPath[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    let sectionsNumber =
      Vec2.dist(startPosition, endPosition) /
      Number((BondSpace + BondWidth).toFixed());
    if (!(sectionsNumber & 1)) {
      sectionsNumber += 1;
    }

    let path = '';
    let midLineStartPosition = startPosition;
    for (let i = 1; i <= sectionsNumber; ++i) {
      const midLineEndPosition = Vec2.lc2(
        startPosition,
        (sectionsNumber - i) / sectionsNumber,
        endPosition,
        i / sectionsNumber,
      );
      if (i & 1) {
        path += `
          M${midLineStartPosition.x},${midLineStartPosition.y}
          L${midLineEndPosition.x},${midLineEndPosition.y}
        `;
      } else {
        const topLineStartPosition = midLineStartPosition.addScaled(
          firstHalfEdge.leftNormal,
          LinesOffset,
        );
        const topLineEndPosition = midLineEndPosition.addScaled(
          firstHalfEdge.leftNormal,
          LinesOffset,
        );
        const bottomLineStartPosition = midLineStartPosition.addScaled(
          firstHalfEdge.leftNormal,
          -LinesOffset,
        );
        const bottomLineEndPosition = midLineEndPosition.addScaled(
          firstHalfEdge.leftNormal,
          -LinesOffset,
        );
        path += `
          M${topLineStartPosition.x},${topLineStartPosition.y}
          L${topLineEndPosition.x},${topLineEndPosition.y}
          M${bottomLineStartPosition.x},${bottomLineStartPosition.y}
          L${bottomLineEndPosition.x},${bottomLineEndPosition.y}
        `;
      }
      midLineStartPosition = midLineEndPosition;
    }

    const svgPath: BondSVGPath = {
      d: path,
      attrs: {
        'stroke-dasharray': BondDashArrayMap[BondType.SingleDouble],
        'stroke-width': `${BondWidth}`,
      },
    };

    return [svgPath];
  }
}

export default SingleDoubleBondPathRenderer;
