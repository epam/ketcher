import { BaseTool, CoreEditor, ZoomTool } from 'application/editor';
import { D3DragEvent, drag, DragBehavior, select } from 'd3';

export class HandTool implements BaseTool {
  private readonly dragBehavior: DragBehavior<SVGSVGElement, unknown, unknown>;

  constructor(private editor: CoreEditor) {
    this.editor.canvas.classList.add('handCursor');

    this.dragBehavior = drag<SVGSVGElement, unknown, unknown>()
      .on('start', this.handleDragStart.bind(this))
      .on('drag', this.handleDragging.bind(this))
      .on('end', this.handleDragEnd.bind(this));

    select(this.editor.canvas).call(this.dragBehavior);
  }

  private handleDragStart() {
    this.editor.canvas.classList.add('handCursorGrabbing');
  }

  private handleDragging(event: D3DragEvent<SVGSVGElement, unknown, unknown>) {
    ZoomTool.instance.scrollBy(event.dx, event.dy);
  }

  private handleDragEnd() {
    this.editor.canvas.classList.remove('handCursorGrabbing');
  }

  destroy() {
    this.editor.canvas.classList.remove('handCursor');
    select(this.editor.canvas).on('.drag', null);
  }
}
