import svgPath from 'svgpath';
import { ARROW_HEAD_LENGHT, ARROW_HEAD_WIDTH } from 'application/render/draw';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { Vec2 } from 'domain/entities/vec2';
import { toFixed } from 'utilities';

export class EllipticalArcFilledTriangleArrowRenderer {
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
    const triangleLength = direction * arrowHeadLength;
    const triangleWidth = direction * arrowHeadWidth;
    const endX = start.x + arrowLength;
    const path =
      `M${toFixed(start.x)},${toFixed(start.y)}` +
      `A${arrowLength / 2},${height},${0},${0},${
        direction > 0 ? 1 : 0
      },${toFixed(endX)},${toFixed(start.y)}` +
      `L${toFixed(endX - triangleWidth)},${toFixed(start.y - triangleLength)}` +
      `l${toFixed(triangleLength)},${toFixed(0)}` +
      `l${toFixed(-triangleWidth)},${toFixed(triangleLength)}`;

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
