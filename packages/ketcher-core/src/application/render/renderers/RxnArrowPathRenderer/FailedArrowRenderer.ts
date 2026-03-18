import svgPath from 'svgpath';
import {
  ARROW_FAIL_SIGN_WIDTH,
  ARROW_HEAD_ATTR,
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { tfx } from 'utilities';

export class FailedArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowHeadAttr = ARROW_HEAD_ATTR * macroModeScale;
    const endX = start.x + arrowLength;
    const failSignWidth = ARROW_FAIL_SIGN_WIDTH * macroModeScale;

    const arrowCenter = endX - (endX - start.x) / 2;

    const pathParts: string[] = [];

    // Arrow with arrowhead
    pathParts.push(
      `M${tfx(start.x)},${tfx(start.y)}` +
        `L${tfx(endX)},${tfx(start.y)}` +
        `L${tfx(endX - arrowHeadLength)},${tfx(start.y + arrowHeadWidth)}` +
        `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(start.y)}` +
        `L${tfx(endX - arrowHeadLength)},${tfx(start.y - arrowHeadWidth)}` +
        `L${tfx(endX)},${tfx(start.y)}Z`,
    );

    // Failed sign line 1
    pathParts.push(
      `M${tfx(arrowCenter + failSignWidth)},${tfx(start.y + failSignWidth)}` +
        `L${tfx(arrowCenter - failSignWidth)},${tfx(start.y - failSignWidth)}`,
    );

    // Failed sign line 2
    pathParts.push(
      `M${tfx(arrowCenter + failSignWidth)},${tfx(start.y - failSignWidth)}` +
        `L${tfx(arrowCenter - failSignWidth)},${tfx(start.y + failSignWidth)}`,
    );

    const transformedPath = svgPath(pathParts.join(''))
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
