import { PathBuilder } from 'application/render/pathBuilder';
import svgPath from 'svgpath';
import { ARROW_HEAD_ATTR, ARROW_HEAD_LENGHT } from 'application/render/draw';
import { provideEditorSettings } from 'application/editor';
import { Vec2 } from 'domain/entities';

export class OpenAngleArrowRenderer {
  static preparePaths(start: Vec2, arrowLength: number, arrowAngle: number) {
    const macroModeScale = provideEditorSettings().macroModeScale;
    const pathBuilder = new PathBuilder().addOpenArrowPathParts(
      start,
      arrowLength,
      ARROW_HEAD_LENGHT * macroModeScale,
      ARROW_HEAD_ATTR * macroModeScale,
    );
    const transformedPath = svgPath(pathBuilder.build())
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
