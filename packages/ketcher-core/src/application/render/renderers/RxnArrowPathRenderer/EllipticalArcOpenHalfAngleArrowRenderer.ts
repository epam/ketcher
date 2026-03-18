import svgPath from 'svgpath';
import { ARROW_HEAD_LENGHT, ARROW_HEAD_WIDTH } from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { tfx } from 'utilities';

export class EllipticalArcOpenHalfAngleArrowRenderer {
  static preparePaths(
    start: Vec2,
    arrowLength: number,
    arrowAngle: number,
    height: number,
  ) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const direction = height >= 0 ? 1 : -1;
    const length = direction * arrowHeadLength;
    const width = direction * arrowHeadWidth;
    const endX = start.x + arrowLength;
    const path =
      `M${tfx(start.x)},${tfx(start.y)}` +
      `A${arrowLength / 2},${height},${0},${0},${direction > 0 ? 1 : 0}, ${tfx(
        endX,
      )},${tfx(start.y)}` +
      `L${tfx(endX + width)}, ${tfx(start.y - length)}`;

    const transformedPath = svgPath(path)
      .rotate(arrowAngle, start.x, start.y)
      .toString();

    return [
      {
        d: transformedPath,
        attrs: {},
      },
    ];
  }
}
