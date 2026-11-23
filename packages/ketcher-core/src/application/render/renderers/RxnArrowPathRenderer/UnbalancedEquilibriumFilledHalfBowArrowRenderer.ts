import svgPath from 'svgpath';
import {
  ARROW_HEAD_ATTR,
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
  ARROW_OFFSET,
  ARROW_UNBALANCED_OFFSET,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor/editorSettings';
import type { Vec2 } from 'domain/entities/vec2';
import { toFixed } from 'utilities';

export class UnbalancedEquilibriumFilledHalfBowArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowHeadAttribute = ARROW_HEAD_ATTR * macroModeScale;
    const arrowOffset = ARROW_OFFSET * macroModeScale;
    const unbalanceValue = ARROW_UNBALANCED_OFFSET * macroModeScale;
    const endX = start.x + arrowLength;
    const pathParts: string[] = [];

    // First and second (unbalanced) arrows
    pathParts.push(
      `M${toFixed(start.x)},${toFixed(start.y - arrowOffset)}` +
        `L${toFixed(endX)},${toFixed(start.y - arrowOffset)}` +
        `L${toFixed(endX - arrowHeadLength)},${toFixed(
          start.y - arrowHeadWidth - arrowOffset,
        )}` +
        `L${toFixed(endX - arrowHeadLength + arrowHeadAttribute)},${toFixed(
          start.y - arrowOffset,
        )}Z`,
      `M${toFixed(endX - unbalanceValue)},${toFixed(start.y + arrowOffset)}` +
        `L${toFixed(start.x + unbalanceValue)},${toFixed(
          start.y + arrowOffset,
        )}` +
        `L${toFixed(start.x + unbalanceValue + arrowHeadLength)},${toFixed(
          start.y + arrowHeadWidth + arrowOffset,
        )}` +
        `L${toFixed(
          start.x + unbalanceValue + arrowHeadLength - arrowHeadAttribute,
        )},${start.y + arrowOffset}Z`,
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
