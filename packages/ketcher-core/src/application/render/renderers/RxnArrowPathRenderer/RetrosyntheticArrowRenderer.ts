import svgPath from 'svgpath';
import {
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
  ARROW_OFFSET,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { tfx } from 'utilities';

export class RetrosyntheticArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowOffset = ARROW_OFFSET * macroModeScale;
    const endX = start.x + arrowLength;

    const pathParts: string[] = [];

    // First arrow and arrowhead
    pathParts.push(
      `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
        `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
        `L${tfx(endX - arrowHeadLength)},${tfx(
          start.y - arrowHeadWidth - arrowOffset,
        )}` +
        `L${tfx(endX + arrowHeadLength)},${tfx(start.y)}`,
    );

    // Second arrow and arrowhead
    pathParts.push(
      `M${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
        `L${tfx(endX)},${tfx(start.y + arrowOffset)}` +
        `L${tfx(endX - arrowHeadLength)},${tfx(
          start.y + arrowHeadWidth + arrowOffset,
        )}` +
        `L${tfx(endX + arrowHeadLength)},${tfx(start.y)}`,
    );

    const transformedPath = svgPath(pathParts.join(''))
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
