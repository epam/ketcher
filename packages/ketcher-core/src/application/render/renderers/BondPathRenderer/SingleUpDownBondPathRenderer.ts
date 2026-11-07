import {
  type SVGPathAttributes,
  type BondVectors,
  BondWidth,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';

class SingleUpDownBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): SVGPathAttributes[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    // TODO: Ensure proper naming for variables below
    let d = endPosition.sub(startPosition);
    const length_ = d.length();
    d = d.normalized();
    const interval = 0.6 * BondWidth;
    const linesNumber =
      Math.max(Math.floor((length_ - BondWidth) / (BondWidth + interval)), 0) +
      2;
    const step = length_ / (linesNumber - 0.5);

    const bsp = 0.7 * StereoBondWidth;

    let path = `M${startPosition.x},${startPosition.y}`;
    let sectionStartPosition: typeof startPosition;
    for (let index = 0; index < linesNumber; ++index) {
      sectionStartPosition = startPosition
        .addScaled(d, step * (index + 0.5))
        .addScaled(
          firstHalfEdge.leftNormal,
          ((index & 1 ? -1 : +1) * bsp * (index + 0.5)) / (linesNumber - 0.5),
        );
      path += `L${sectionStartPosition.x},${sectionStartPosition.y}`;
    }

    const svgPath: SVGPathAttributes = {
      d: path,
      attrs: {
        fill: 'none',
        'stroke-width': `${BondWidth}`,
      },
    };

    return [svgPath];
  }
}

export default SingleUpDownBondPathRenderer;
