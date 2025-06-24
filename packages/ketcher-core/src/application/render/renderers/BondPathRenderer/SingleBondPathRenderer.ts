import {
  BondDashArrayMap,
  SVGPathAttributes,
  BondVectors,
  BondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';
import { BondType } from 'domain/entities/CoreBond';

class SingleBondPathRenderer {
  static preparePaths(
    bondVectors: BondVectors,
    type?: BondType,
  ): SVGPathAttributes[] {
    const { startPosition, endPosition } = bondVectors;

    const strokeDasharray =
      type !== undefined ? BondDashArrayMap[type] : 'none';
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
