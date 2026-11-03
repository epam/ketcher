import type { CoreEditor } from './Editor';
import { Coordinates } from './shared/coordinates';
import { Vec2 } from 'domain/entities/vec2';
import type { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { PastePreviewView } from 'application/render/renderers/TransientView/PastePreviewView';
import { getRGroupDefinitions } from 'domain/helpers/rGroupDefinitions';
import type { RGroupRenderer } from 'application/render/renderers/RGroupRenderer';

/** Owns only transient graphics and input; the commit callback owns model changes. */
export class PastePreview {
  private readonly svg: SVGSVGElement;
  private readonly anchor: Vec2;
  private active = true;
  private readonly cancellationEvents;
  private readonly definitions;
  private readonly existingDefinitions;
  private readonly hiddenRenderers: RGroupRenderer[] = [];

  constructor(
    private readonly editor: CoreEditor,
    manager: DrawingEntitiesManager,
    private readonly commit: (position: Vec2) => void,
  ) {
    this.svg = PastePreviewView.createSvg(manager);
    this.anchor = new Vec2(manager.allEntities[0]?.[1].position);
    this.definitions = getRGroupDefinitions(
      manager.atoms.values(),
      manager.bonds.values(),
    );
    this.existingDefinitions = getRGroupDefinitions(
      editor.drawingEntitiesManager.atoms.values(),
      editor.drawingEntitiesManager.bonds.values(),
    );
    this.definitions.forEach((_definition, id) => {
      const renderer = editor.renderersContainer.rgroups.get(id);
      if (renderer) {
        renderer.setVisibility(false);
        this.hiddenRenderers.push(renderer);
      }
    });
    this.cancellationEvents = [
      editor.events.selectTool,
      editor.events.switchToMoleculesMode,
      editor.events.layoutModeChange,
    ];
    this.cancellationEvents.forEach((event) => event.add(this.cancel));
    editor.canvas.addEventListener('mousemove', this.onMove, true);
    editor.canvas.addEventListener('mousedown', this.blockMouse, true);
    editor.canvas.addEventListener('mouseup', this.blockMouse, true);
    editor.canvas.addEventListener('click', this.onClick, true);
    document.addEventListener('keydown', this.onKeyDown, true);
    this.show(Coordinates.canvasToModel(editor.lastCursorPositionOfCanvas));
  }

  private position(event: MouseEvent): Vec2 {
    const bounds = this.editor.canvas.getBoundingClientRect();
    return Coordinates.viewToModel(
      new Vec2(event.clientX - bounds.x, event.clientY - bounds.y),
    );
  }

  private show(position: Vec2): void {
    this.editor.transientDrawingView.showPastePreview({
      svg: this.svg,
      anchor: this.anchor,
      position,
      definitions: this.definitions,
      existingDefinitions: this.existingDefinitions,
    });
    this.editor.transientDrawingView.update();
  }

  private readonly onMove = (event: MouseEvent): void => {
    event.stopImmediatePropagation();
    this.show(this.position(event));
  };

  private readonly blockMouse = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private readonly onClick = (event: MouseEvent): void => {
    this.blockMouse(event);
    if (event.button !== 0) return;
    const position = this.position(event);
    this.cancel();
    this.commit(position);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const isUndo =
      (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z';
    if (event.key !== 'Escape' && !isUndo) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    this.cancel();
  };

  public readonly cancel = (): void => {
    if (!this.active) return;
    this.active = false;
    this.cancellationEvents.forEach((event) => event.remove(this.cancel));
    this.editor.canvas.removeEventListener('mousemove', this.onMove, true);
    this.editor.canvas.removeEventListener('mousedown', this.blockMouse, true);
    this.editor.canvas.removeEventListener('mouseup', this.blockMouse, true);
    this.editor.canvas.removeEventListener('click', this.onClick, true);
    document.removeEventListener('keydown', this.onKeyDown, true);
    this.editor.transientDrawingView.hidePastePreview();
    this.hiddenRenderers.forEach((renderer) => renderer.setVisibility(true));
    this.editor.transientDrawingView.update();
  };
}
