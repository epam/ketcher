import svgPath from 'svgpath';
import { ARROW_HEAD_LENGHT, ARROW_HEAD_WIDTH } from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { tfx } from 'utilities';

export class FilledTriangleArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const endX = start.x + arrowLength;

    const path =
      `M${tfx(start.x)},${tfx(start.y)}` +
      `L${tfx(endX)},${tfx(start.y)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
      `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
      `L${tfx(endX)},${tfx(start.y)}Z`;

    const transformedPath = svgPath(path)
      .rotate(arrowAngle, start.x, start.y)
      .toString();

    return [
      {
        d: transformedPath,
        attrs: {
          fill: '#000',
        },
      },
    ];
  }
}
