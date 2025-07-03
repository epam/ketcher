import {
  SVGPathAttributes,
  BondVectors,
  BondWidth,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';

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
    // TODO define proper names for variables below
    let p;
    let q;
    let r;

    for (let i = 0; i < numberOfLines; ++i) {
      r = startPosition.addScaled(normalizedDirection, step * i);
      p = r.addScaled(
        firstHalfEdge.leftNormal,
        (halfOfBondEndWidth * (i + 0.5)) / (numberOfLines - 0.5),
      );
      q = r.addScaled(
        firstHalfEdge.leftNormal,
        (-halfOfBondEndWidth * (i + 0.5)) / (numberOfLines - 0.5),
      );

      path += `
            M${p.x},${p.y}
            L${q.x},${q.y}
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
