import {
  BondDashArrayMap,
  BondSpace,
  SVGPathAttributes,
  BondVectors,
  BondWidth,
  LinesOffset,
} from 'application/render/renderers/BondPathRenderer/constants';
import { getBondLineShift } from 'application/render/restruct/rebond';
import { BondType } from 'domain/entities/CoreBond';

class DoubleBondPathRenderer {
  static preparePaths(
    bondVectors: BondVectors,
    shift: number,
    type?: BondType,
  ): SVGPathAttributes[] {
    const { startPosition, endPosition, firstHalfEdge, secondHalfEdge } =
      bondVectors;

    const firstLinePartShift = LinesOffset + shift * LinesOffset;
    const secondLinePartShift = -LinesOffset + shift * LinesOffset;

    let firstLineStartPosition = startPosition.addScaled(
      firstHalfEdge.leftNormal,
      firstLinePartShift,
    );
    let firstLineEndPosition = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      firstLinePartShift,
    );
    let secondLineStartPosition = startPosition.addScaled(
      firstHalfEdge.leftNormal,
      secondLinePartShift,
    );
    let secondLineEndPosition = endPosition.addScaled(
      firstHalfEdge.leftNormal,
      secondLinePartShift,
    );

    if (shift > 0) {
      firstLineStartPosition = firstHalfEdge.firstAtom.renderer?.isLabelVisible
        ? firstLineStartPosition
        : firstLineStartPosition.addScaled(
            firstHalfEdge.direction,
            BondSpace *
              getBondLineShift(
                firstHalfEdge.cosToRightNeighborHalfEdge,
                firstHalfEdge.sinToRightNeighborHalfEdge,
              ),
          );

      firstLineEndPosition = firstHalfEdge.secondAtom.renderer?.isLabelVisible
        ? firstLineEndPosition
        : firstLineEndPosition.addScaled(
            firstHalfEdge.direction,
            -BondSpace *
              getBondLineShift(
                secondHalfEdge.cosToLeftNeighborHalfEdge,
                secondHalfEdge.sinToLeftNeighborHalfEdge,
              ),
          );
    } else if (shift < 0) {
      secondLineStartPosition = firstHalfEdge.firstAtom.renderer?.isLabelVisible
        ? secondLineStartPosition
        : secondLineStartPosition.addScaled(
            firstHalfEdge.direction,
            BondSpace *
              getBondLineShift(
                firstHalfEdge.cosToLeftNeighborHalfEdge,
                firstHalfEdge.sinToLeftNeighborHalfEdge,
              ),
          );

      secondLineEndPosition = firstHalfEdge.secondAtom.renderer?.isLabelVisible
        ? secondLineEndPosition
        : secondLineEndPosition.addScaled(
            firstHalfEdge.direction,
            -BondSpace *
              getBondLineShift(
                secondHalfEdge.cosToRightNeighborHalfEdge,
                secondHalfEdge.sinToRightNeighborHalfEdge,
              ),
          );
    }

    const strokeDasharray =
      type !== undefined ? BondDashArrayMap[type] : 'none';
    if (type === BondType.Double || type === BondType.DoubleAromatic) {
      const svgPath: SVGPathAttributes = {
        d: `
          M${firstLineStartPosition.x},${firstLineStartPosition.y}
          L${firstLineEndPosition.x},${firstLineEndPosition.y}
          M${secondLineStartPosition.x},${secondLineStartPosition.y}
          L${secondLineEndPosition.x},${secondLineEndPosition.y}
        `,
        attrs: {
          stroke: 'black',
          'stroke-dasharray': strokeDasharray,
          'stroke-width': `${BondWidth}`,
        },
      };

      return [svgPath];
    } else {
      const firstSvgPath: SVGPathAttributes = {
        d: `
          M${firstLineStartPosition.x},${firstLineStartPosition.y}
          L${firstLineEndPosition.x},${firstLineEndPosition.y}
        `,
        attrs: {
          stroke: 'black',
          'stroke-width': `${BondWidth}`,
        },
      };

      const secondSvgPath: SVGPathAttributes = {
        d: `
          M${secondLineStartPosition.x},${secondLineStartPosition.y}
          L${secondLineEndPosition.x},${secondLineEndPosition.y}
        `,
        attrs: {
          'stroke-dasharray': strokeDasharray,
          'stroke-width': `${BondWidth}`,
        },
      };

      return shift > 0
        ? [firstSvgPath, secondSvgPath]
        : [secondSvgPath, firstSvgPath];
    }
  }
}

export default DoubleBondPathRenderer;
