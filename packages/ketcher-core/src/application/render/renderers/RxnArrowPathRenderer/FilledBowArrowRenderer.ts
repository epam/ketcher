import svgPath from 'svgpath';
import {
  ARROW_HEAD_ATTR,
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { Vec2 } from 'domain/entities/vec2';
import { toFixed } from 'utilities';

export class FilledBowArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowHeadAttr = ARROW_HEAD_ATTR * macroModeScale;
    const endX = start.x + arrowLength;

    const path =
      `M${toFixed(start.x)},${toFixed(start.y)}` +
      `L${toFixed(endX)},${toFixed(start.y)}` +
      `L${toFixed(endX - arrowHeadLength)},${toFixed(
        start.y + arrowHeadWidth,
      )}` +
      `L${toFixed(endX - arrowHeadLength + arrowHeadAttr)},${toFixed(
        start.y,
      )}` +
      `L${toFixed(endX - arrowHeadLength)},${toFixed(
        start.y - arrowHeadWidth,
      )}` +
      `L${toFixed(endX)},${toFixed(start.y)}Z`;

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
