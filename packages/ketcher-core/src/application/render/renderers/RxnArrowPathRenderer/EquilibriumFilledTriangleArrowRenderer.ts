import svgPath from 'svgpath';
import {
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
  ARROW_OFFSET,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor/editorSettings';
import { Vec2 } from 'domain/entities/vec2';
import { toFixed } from 'utilities';

export class EquilibriumFilledTriangleArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowOffset = ARROW_OFFSET * macroModeScale;
    const endX = start.x + arrowLength;
    const pathParts: string[] = [];

    // First arrow
    pathParts.push(
      `M${toFixed(start.x)},${toFixed(start.y - arrowOffset)}` +
        `L${toFixed(endX)},${toFixed(start.y - arrowOffset)}` +
        `L${toFixed(endX - arrowHeadLength)},${toFixed(
          start.y + arrowHeadWidth - arrowOffset,
        )}` +
        `L${toFixed(endX - arrowHeadLength)},${toFixed(
          start.y - arrowHeadWidth - arrowOffset,
        )}` +
        `L${toFixed(endX)},${toFixed(start.y - arrowOffset)}Z`,
    );

    // Second arrow
    pathParts.push(
      `M${toFixed(endX)},${toFixed(start.y + arrowOffset)}` +
        `L${toFixed(start.x)},${toFixed(start.y + arrowOffset)}` +
        `L${toFixed(start.x + arrowHeadLength)},${toFixed(
          start.y + arrowHeadWidth + arrowOffset,
        )}` +
        `L${toFixed(start.x + arrowHeadLength)},${toFixed(
          start.y - arrowHeadWidth + arrowOffset,
        )}` +
        `L${toFixed(start.x)},${toFixed(start.y + arrowOffset)}Z`,
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
