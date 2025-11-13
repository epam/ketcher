import {
  BondDashArrayMap,
  SVGPathAttributes,
  BondVectors,
  BondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';
import { BondType } from 'domain/entities/CoreBond';
import { Vec2 } from 'domain/entities/vec2';

class SingleBondPathRenderer {
  static preparePaths(
    bondVectors: BondVectors,
    type?: BondType,
    dativeBondOffsetAngle?: number,
  ): SVGPathAttributes[] {
    let { startPosition, endPosition } = bondVectors;

    // Apply offset for dative bonds to prevent arrow overlap
    if (type === BondType.Dative && dativeBondOffsetAngle !== undefined) {
      const bondVector = endPosition.sub(startPosition);
      const offsetRadius = 8; // Pixels to offset the endpoint radially

      // Calculate perpendicular offset based on the angle
      const perpendicular = new Vec2(-bondVector.y, bondVector.x).normalized();
      const offset = perpendicular.scaled(
        offsetRadius * Math.sin(dativeBondOffsetAngle),
      );

      // Apply the offset to the endpoint
      endPosition = endPosition.add(offset);
    }

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
