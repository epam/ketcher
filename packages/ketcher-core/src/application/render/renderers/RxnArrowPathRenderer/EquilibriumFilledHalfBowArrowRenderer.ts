import svgPath from 'svgpath';
import {
  ARROW_HEAD_ATTR,
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
  ARROW_OFFSET,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { tfx } from 'utilities';

export class EquilibriumFilledHalfBowArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowOffset = ARROW_OFFSET * macroModeScale;
    const arrowHeadAttr = ARROW_HEAD_ATTR * macroModeScale;
    const endX = start.x + arrowLength;
    const pathParts: string[] = [];

    // top arrow
    pathParts.push(
      `M${tfx(start.x)},${tfx(start.y - arrowOffset)}` +
        `L${tfx(endX)},${tfx(start.y - arrowOffset)}` +
        `L${tfx(endX - arrowHeadLength)},${tfx(
          start.y - arrowHeadWidth - arrowOffset,
        )}` +
        `L${tfx(endX - arrowHeadLength + arrowHeadAttr)},${tfx(
          start.y - arrowOffset,
        )}Z`,
    );

    // bottom arrow
    pathParts.push(
      `M${tfx(endX)},${tfx(start.y + arrowOffset)}` +
        `L${tfx(start.x)},${tfx(start.y + arrowOffset)}` +
        `L${tfx(start.x + arrowHeadLength)},${tfx(
          start.y + arrowHeadWidth + arrowOffset,
        )}` +
        `L${tfx(start.x + arrowHeadLength - arrowHeadAttr)},${
          start.y + arrowOffset
        }Z`,
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
