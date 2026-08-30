import type Editor from '../../Editor';
import { type Vec2, CoordinateTransformation } from 'ketcher-core';

export abstract class ArrowTool {
  constructor(protected readonly editor: Editor) {}

  protected get render() {
    return this.editor.render;
  }

  protected get reStruct() {
    return this.render.ctab;
  }

  protected getOffset(event: PointerEvent, original: Vec2): Vec2 {
    return CoordinateTransformation.pageToModel(event, this.render).sub(
      original,
    );
  }
}
