import { BaseTool, CoreEditor, ZoomTool } from 'application/editor';
import {
  HandBase64Image,
  HandDraggingBase64Image,
} from 'application/editor/constants';
import { D3DragEvent, drag, DragBehavior, select } from 'd3';

export class Hand implements BaseTool {
  private readonly dragBehavior: DragBehavior<SVGSVGElement, unknown, unknown>;

  constructor(private editor: CoreEditor) {
    this.editor.canvas.style.cursor = `url(${HandBase64Image}), auto`;

    this.dragBehavior = drag<SVGSVGElement, unknown, unknown>()
      .on('start', this.handleDragStart.bind(this))
      .on('drag', this.handleDragging.bind(this))
      .on('end', this.handleDragEnd.bind(this));

    select(this.editor.canvas).call(this.dragBehavior);
  }

  private handleDragStart() {
    this.editor.canvas.style.cursor = `url(${HandDraggingBase64Image}), auto`;
  }

  private handleDragging(event: D3DragEvent<SVGSVGElement, unknown, unknown>) {
    ZoomTool.instance.scrollBy(event.dx, event.dy);
  }

  private handleDragEnd() {
    this.editor.canvas.style.cursor = `url(${HandBase64Image}), auto`;
  }

  destroy() {
    this.editor.canvas.style.cursor = 'auto';
    select(this.editor.canvas).on('.drag', null);
  }
}
