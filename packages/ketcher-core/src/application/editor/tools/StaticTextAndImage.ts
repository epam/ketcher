import type { CoreEditor } from 'application/editor/Editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { Coordinates } from 'application/editor/shared/coordinates';
import { readImageFile } from 'application/editor/shared/readImageFile';
import { returnToSelectionTool } from 'application/editor/tools/StaticShape';
import type { BaseTool } from 'application/editor/tools/Tool';
import { StaticObjectRenderer } from 'application/render/renderers/StaticObjectRenderer';
import type { Command } from 'domain/entities/Command';
import type { CoreStaticObject } from 'domain/entities/CoreStaticObject';
import type { Vec2 } from 'domain/entities/vec2';
import {
  IMAGE_VALIDATION_MESSAGES,
  SUPPORTED_IMAGE_MIME_TYPES,
} from 'domain/staticObjects/image';
import { resolveTextEdit } from 'domain/staticObjects/text';
import { KetcherLogger } from 'utilities';

const IMAGE_INPUT_ID = 'macromolecules-image-upload';

function applyCommand(editor: CoreEditor, command: Command) {
  editor.renderersContainer.update(command);
  EditorHistory.getInstance(editor).update(command);
  returnToSelectionTool(editor);
}

function pointerInModel(editor: CoreEditor): Vec2 {
  return Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas);
}

function getTextObjectFromEvent(event: MouseEvent): CoreStaticObject | null {
  const renderer = (event.target as { __data__?: unknown } | null)?.__data__;

  return renderer instanceof StaticObjectRenderer &&
    renderer.staticObject.content.type === 'text'
    ? renderer.staticObject
    : null;
}

export function editStaticText(
  editor: CoreEditor,
  textObject: CoreStaticObject | null,
  position: Vec2,
) {
  const previousContent =
    textObject?.content.type === 'text' ? textObject.content : null;

  editor.events.openTextEditor.dispatch({
    initialContent: previousContent?.content ?? '',
    onApply: (nextContent: string) => {
      const manager = editor.drawingEntitiesManager;
      const resolution = resolveTextEdit({
        isNew: !textObject,
        originalContent: previousContent?.content ?? '',
        nextContent,
      });

      if (resolution === 'create') {
        applyCommand(
          editor,
          manager.addStaticObject({
            type: 'text',
            content: nextContent,
            position,
            pos: [position, position, position, position],
          }),
        );
      } else if (resolution === 'delete' && textObject) {
        applyCommand(editor, manager.deleteStaticObject(textObject));
      } else if (resolution === 'update' && textObject && previousContent) {
        applyCommand(
          editor,
          manager.updateStaticObjectContent(textObject, previousContent, {
            ...previousContent,
            content: nextContent,
          }),
        );
      }
    },
  });
}

export class StaticTextTool implements BaseTool {
  constructor(private readonly editor: CoreEditor) {}

  click(event: MouseEvent) {
    editStaticText(
      this.editor,
      getTextObjectFromEvent(event),
      pointerInModel(this.editor),
    );
  }

  destroy() {
    // intentional no-op: the text tool keeps no state between clicks
  }
}

function getImageInput(): HTMLInputElement {
  const existing = document.getElementById(IMAGE_INPUT_ID);
  if (existing instanceof HTMLInputElement) {
    return existing;
  }

  const input = document.createElement('input');
  input.id = IMAGE_INPUT_ID;
  input.type = 'file';
  input.style.display = 'none';
  input.accept = SUPPORTED_IMAGE_MIME_TYPES.join(',');
  document.body.appendChild(input);
  return input;
}

export class StaticImageTool implements BaseTool {
  private readonly input = getImageInput();

  constructor(private readonly editor: CoreEditor) {}

  click() {
    const center = pointerInModel(this.editor);
    this.input.onchange = () => {
      void this.upload(center);
    };
    this.input.click();
  }

  private async upload(center: Vec2) {
    this.input.onchange = null;
    const file = this.input.files?.[0];
    if (!file) {
      return;
    }

    const result = await readImageFile(file);
    this.input.value = '';

    if ('error' in result) {
      const message = IMAGE_VALIDATION_MESSAGES[result.error];
      KetcherLogger.error('StaticImageTool::upload', message);
      this.editor.events.error.dispatch(message);
      return;
    }

    const halfSize = Coordinates.canvasToModel(result.halfSizePx);
    applyCommand(
      this.editor,
      this.editor.drawingEntitiesManager.addStaticObject({
        type: 'image',
        bitmap: result.dataUrl,
        box: { min: center.sub(halfSize), max: center.add(halfSize) },
      }),
    );
  }

  destroy() {
    this.input.onchange = null;
  }
}
