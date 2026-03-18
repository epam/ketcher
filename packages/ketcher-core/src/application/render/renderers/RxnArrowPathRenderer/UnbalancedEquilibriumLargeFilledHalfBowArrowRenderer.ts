import svgPath from 'svgpath';
import {
  ARROW_HEAD_ATTR,
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
  ARROW_OFFSET,
  ARROW_UNBALANCED_OFFSET,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { tfx } from 'utilities';

export class UnbalancedEquilibriumLargeFilledHalfBowArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadAttr = ARROW_HEAD_ATTR * macroModeScale;
    const arrowHeadWidthNormal = ARROW_HEAD_WIDTH * macroModeScale;
    const arrowOffset = ARROW_OFFSET * macroModeScale;
    const unbalanceVal = ARROW_UNBALANCED_OFFSET * macroModeScale;
    // Multiplying by 1.5 because it's large variant
    const arrowHeadWidth = arrowHeadWidthNormal * 1.5;
    const endX = start.x + arrowLength;

    const pathParts: string[] = [];

    // First arrow
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

    // Second (Unbalanced) arrow
    pathParts.push(
      `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
        `L${tfx(endX - unbalanceVal)},${tfx(start.y + arrowOffset)}` +
        `M${tfx(start.x + unbalanceVal)},${tfx(start.y + arrowOffset)}` +
        `L${tfx(start.x + arrowHeadLength + unbalanceVal)},${tfx(
          start.y + arrowHeadWidth + arrowOffset,
        )}` +
        `L${tfx(start.x + arrowHeadLength - arrowHeadAttr + unbalanceVal)},${
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
