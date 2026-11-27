import type { CoreEditor } from 'application/editor/Editor';
import { Coordinates } from 'application/editor/shared/coordinates';
import type { BaseTool } from 'application/editor/tools/Tool';
import { TextRenderer } from 'application/render/renderers/TextRenderer';
import type { CoreText } from 'domain/entities/CoreText';
import { Vec2 } from 'domain/entities/vec2';

export interface TextEditorRequest {
  position: Vec2;
  text?: CoreText;
}

export class TextTool implements BaseTool {
  constructor(private readonly editor: CoreEditor) {}

  public click() {
    this.editor.events.openTextEditor.dispatch({
      position: Coordinates.canvasToModel(
        new Vec2(this.editor.lastCursorPositionOfCanvas),
      ),
    } satisfies TextEditorRequest);
  }

  public dblclick(event: MouseEvent) {
    const renderer = (event.target as { __data__?: unknown } | null)?.__data__;

    if (!(renderer instanceof TextRenderer)) {
      return;
    }

    this.editor.events.openTextEditor.dispatch({
      position: renderer.text.position,
      text: renderer.text,
    } satisfies TextEditorRequest);
  }

  public destroy() {}
}
