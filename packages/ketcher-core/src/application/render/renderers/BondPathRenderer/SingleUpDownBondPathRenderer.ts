import {
  BondSVGPath,
  BondVectors,
  BondWidth,
  StereoBondWidth,
} from 'application/render/renderers/BondPathRenderer/constants';

class SingleUpDownBondPathRenderer {
  static preparePaths(bondVectors: BondVectors): BondSVGPath[] {
    const { startPosition, endPosition, firstHalfEdge } = bondVectors;

    // TODO: Ensure proper naming for variables below
    let d = endPosition.sub(startPosition);
    const len = d.length();
    d = d.normalized();
    const interval = 0.6 * BondWidth;
    const linesNumber =
      Math.max(Math.floor((len - BondWidth) / (BondWidth + interval)), 0) + 2;
    const step = len / (linesNumber - 0.5);

    const bsp = 0.7 * StereoBondWidth;

    let path = `M${startPosition.x},${startPosition.y}`;
    let sectionStartPosition = startPosition;
    for (let i = 0; i < linesNumber; ++i) {
      sectionStartPosition = startPosition
        .addScaled(d, step * (i + 0.5))
        .addScaled(
          firstHalfEdge.leftNormal,
          ((i & 1 ? -1 : +1) * bsp * (i + 0.5)) / (linesNumber - 0.5),
        );
      path += `L${sectionStartPosition.x},${sectionStartPosition.y}`;
    }

    const svgPath: BondSVGPath = {
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
