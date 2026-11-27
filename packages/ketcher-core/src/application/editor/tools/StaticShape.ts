import type { CoreEditor } from 'application/editor/Editor';
import { EditorHistory } from 'application/editor/EditorHistory';
import { Coordinates } from 'application/editor/shared/coordinates';
import type { BaseTool } from 'application/editor/tools/Tool';
import type { CoreStaticObject } from 'domain/entities/CoreStaticObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import type { StaticObjectAddOperation } from 'domain/entities/CoreStaticObjectOperations';
import {
  type ShapeDrawSession,
  createShapeDrawSession,
} from 'domain/staticObjects/drawSession';
import type { ShapeKind } from 'domain/staticObjects/types';
import { SettingsManager } from 'utilities';

export function returnToSelectionTool(editor: CoreEditor) {
  const savedSelectionTool = SettingsManager.getSelectionTool('macro');
  const selectionTool = savedSelectionTool?.opts
    ? `select-${savedSelectionTool.opts}`
    : 'select-rectangle';

  editor.events.selectTool.dispatch([selectionTool]);
}

class StaticShapeTool implements BaseTool {
  private drawSession: ShapeDrawSession | null = null;
  private preview: CoreStaticObject | null = null;

  constructor(
    private readonly editor: CoreEditor,
    private readonly kind: ShapeKind,
  ) {}

  private get pointer() {
    return Coordinates.canvasToModel(this.editor.lastCursorPositionOfCanvas);
  }

  mousedown() {
    this.drawSession = createShapeDrawSession(this.kind, this.pointer);
  }

  mousemove(event: MouseEvent) {
    if (!this.drawSession) {
      return;
    }

    const geometry = this.drawSession.update(this.pointer, {
      shift: event.shiftKey,
    });
    const content = { type: 'shape' as const, geometry };
    const drawingEntitiesManager = this.editor.drawingEntitiesManager;

    if (this.preview) {
      this.preview.setContent(content);
      this.editor.renderersContainer.redrawDrawingEntity(this.preview);
      return;
    }

    const command = drawingEntitiesManager.addStaticObject(content);
    this.preview = (
      command.operations[0] as StaticObjectAddOperation
    ).staticObject;
    this.editor.renderersContainer.update(command);
  }

  mouseup(event: MouseEvent) {
    const drawSession = this.drawSession;
    this.drawSession = null;
    if (!drawSession) {
      return;
    }

    this.removePreview();
    const geometry = drawSession.finish(this.pointer, {
      shift: event.shiftKey,
    });
    if (!geometry) {
      return;
    }

    const command = this.editor.drawingEntitiesManager.addStaticObject({
      type: 'shape',
      geometry,
    });
    this.editor.renderersContainer.update(command);
    EditorHistory.getInstance(this.editor).update(command);
    returnToSelectionTool(this.editor);
  }

  private removePreview() {
    if (!this.preview) {
      return;
    }

    this.editor.renderersContainer.update(
      this.editor.drawingEntitiesManager.deleteStaticObject(this.preview),
    );
    this.preview = null;
  }

  destroy() {
    this.removePreview();
    this.drawSession = null;
  }
}

export class EllipseShapeTool extends StaticShapeTool {
  constructor(editor: CoreEditor) {
    super(editor, SimpleObjectMode.ellipse);
  }
}

export class RectangleShapeTool extends StaticShapeTool {
  constructor(editor: CoreEditor) {
    super(editor, SimpleObjectMode.rectangle);
  }
}

export class LineShapeTool extends StaticShapeTool {
  constructor(editor: CoreEditor) {
    super(editor, SimpleObjectMode.line);
  }
}
