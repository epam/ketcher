import svgPath from 'svgpath';
import {
  ARROW_DASH_INTERVAL,
  ARROW_HEAD_LENGHT,
  ARROW_HEAD_WIDTH,
} from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';
import { toFixed } from 'utilities';

export class DashedOpenAngleArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const arrowHeadLength = ARROW_HEAD_LENGHT * macroModeScale;
    const arrowHeadWidth = ARROW_HEAD_WIDTH * macroModeScale;
    const endX = start.x + arrowLength;
    const dashInterval = ARROW_DASH_INTERVAL * macroModeScale;
    const pathParts: string[] = [];

    // Dashed arrow
    for (let i = 0; i < arrowLength / dashInterval; i++) {
      if (i % 2) {
        pathParts.push(
          `L${toFixed(start.x + i * dashInterval)},${toFixed(start.y)}`,
        );
      } else {
        pathParts.push(
          `M${toFixed(start.x + i * dashInterval)},${toFixed(start.y)}`,
        );
      }
    }

    // Arrowhead
    pathParts.push(
      `M${toFixed(endX)},${toFixed(start.y)}` +
        `L${toFixed(endX - arrowHeadLength)},${toFixed(
          start.y + arrowHeadWidth,
        )}` +
        `M${toFixed(endX)},${toFixed(start.y)}` +
        `L${toFixed(endX - arrowHeadLength)},${toFixed(
          start.y - arrowHeadWidth,
        )}`,
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
