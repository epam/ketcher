import type { CoreEditor } from 'application/editor/Editor';
import type { BaseTool } from './Tool';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Vec2 } from 'domain/entities/vec2';
import { Coordinates } from '../shared/coordinates';
import { RenderersManager } from 'application/render/renderers/RenderersManager';
import { ViewModel } from 'application/render/view-model/ViewModel';
import { EditorHistory } from '../EditorHistory';
import type { D3SvgElementSelection } from 'application/render/types';
import { assert } from 'utilities';

export class PasteTool implements BaseTool {
  private readonly entities: DrawingEntitiesManager;
  private readonly preview: D3SvgElementSelection<SVGGElement, void>;
  private readonly center: Vec2;
  private offset = new Vec2();

  constructor(
    private readonly editor: CoreEditor,
    ...args: unknown[]
  ) {
    const [entities] = args;
    if (!(entities instanceof DrawingEntitiesManager)) {
      throw new Error('Paste requires drawing entities');
    }
    this.entities = entities;
    this.preview = editor.zoomTool.canvas
      .append('g')
      .attr('data-testid', 'paste-preview')
      .attr('opacity', 0.5)
      .style('pointer-events', 'none');

    try {
      const renderers = new RenderersManager(
        { theme: editor.theme },
        { canvas: this.preview, viewModel: new ViewModel() },
      );
      renderers.renderPreview(entities);
      this.preview.selectAll('*').style('pointer-events', 'none');
      const previewElement = this.preview.node();
      assert(previewElement);
      const bounds = previewElement.getBBox();
      this.center = new Vec2(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
      editor.transientDrawingView.showStructurePreview(previewElement);
      editor.transientDrawingView.update();
      this.mousemove();
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  mousemove() {
    const position = Coordinates.viewToCanvas(this.editor.lastCursorPosition);
    this.offset = position.sub(this.center);
    this.preview.attr(
      'transform',
      `translate(${this.offset.x}, ${this.offset.y})`,
    );
  }

  mousedown() {
    this.mousemove();
    const offset = Coordinates.canvasToModel(this.offset);
    // Live bond renderers must not find monomers inside the preview layer.
    this.destroy();
    // Switch tools before committing: a new selection tool clears the
    // selection on creation, and the pasted structure must stay selected.
    this.editor.events.selectSelectionTool.dispatch();
    this.entities.allEntities.forEach(([, entity]) => {
      this.entities.moveDrawingEntityModelChange(entity, offset);
    });

    const { command, mergedDrawingEntities } = this.entities.mergeInto(
      this.editor.drawingEntitiesManager,
    );
    command.merge(
      this.editor.mode.applyAdditionalPasteOperations(mergedDrawingEntities),
    );
    this.editor.drawingEntitiesManager.detectBondsOverlappedByMonomers();
    this.editor.renderersContainer.update(command);
    EditorHistory.getInstance(this.editor).update(command);
    this.editor.calculateAndStoreNextAutochainPosition(mergedDrawingEntities);
  }

  destroy() {
    const previewElement = this.preview.node() ?? undefined;
    this.editor.transientDrawingView.hideStructurePreview(previewElement);
    this.editor.transientDrawingView.update();
    this.preview.remove();
  }

  cancel() {
    this.editor.events.selectSelectionTool.dispatch();
  }
}
