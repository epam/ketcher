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
      const bondAngle = Math.atan2(bondVector.y, bondVector.x);
      const offsetRadius = 10; // Pixels to offset the endpoint radially around the target atom

      // Calculate the new endpoint position by rotating around the target atom
      // The offset angle adjusts the position perpendicular to the bond direction
      const offsetX =
        offsetRadius *
        Math.cos(bondAngle + Math.PI / 2) *
        Math.sin(dativeBondOffsetAngle);
      const offsetY =
        offsetRadius *
        Math.sin(bondAngle + Math.PI / 2) *
        Math.sin(dativeBondOffsetAngle);

      // Apply the offset to the endpoint
      endPosition = new Vec2(endPosition.x + offsetX, endPosition.y + offsetY);
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
