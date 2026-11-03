import {
  Action,
  CipLabelMove,
  CoordinateTransformation,
  type Vec2,
} from 'ketcher-core';
import type { Editor } from '../../Editor';
import closest, { type CipLabelHit } from '../../shared/closest';

type Drag = CipLabelHit & { start: Vec2; action: Action | null };

export class CipLabelMoveTool {
  private drag: Drag | null = null;
  private hovered: CipLabelHit['rectangle'] | null = null;
  private restoreHover: (() => void) | null = null;

  constructor(private readonly editor: Editor) {}

  isDragging() {
    return this.drag !== null;
  }

  private pointer(event: PointerEvent) {
    return CoordinateTransformation.pageToModel(event, this.editor.render);
  }

  private find(event: PointerEvent) {
    const { render } = this.editor;
    return closest.cipLabel(render.ctab, this.pointer(event), render.options);
  }

  mousedown(event: PointerEvent) {
    const hit = this.find(event);
    if (!hit) return false;

    this.clearHover();
    this.drag = { ...hit, start: this.pointer(event), action: null };
    return true;
  }

  mousemove(event: PointerEvent) {
    const { drag, editor } = this;
    if (!drag) return false;

    const { ctab } = editor.render;
    drag.action?.perform(ctab);
    const move = new Action();
    move.addOp(
      new CipLabelMove(
        drag.owner,
        drag.id,
        this.pointer(event).sub(drag.start),
      ),
    );
    drag.action = move.perform(ctab);
    editor.update(drag.action, true);
    return true;
  }

  mouseup() {
    const { drag } = this;
    this.drag = null;
    if (drag?.action) this.editor.update(drag.action);
    return drag !== null;
  }

  mouseleave() {
    this.mouseup();
    this.clearHover();
  }

  hover(event: PointerEvent) {
    const hit = this.find(event);
    if (hit?.rectangle === this.hovered) return Boolean(hit);

    this.clearHover();
    if (!hit) return false;

    const { rectangle } = hit;
    const { render } = this.editor;
    const previous = {
      stroke: rectangle.attr('stroke'),
      'stroke-width': rectangle.attr('stroke-width'),
    };
    rectangle.attr({
      stroke: render.options.hoverStyle.stroke,
      'stroke-width': 1.5,
    });
    render.paper.canvas.setAttribute('cursor', 'move');
    this.hovered = rectangle;
    this.restoreHover = () => rectangle.attr(previous);
    return true;
  }

  private clearHover() {
    if (!this.restoreHover) return;

    this.restoreHover();
    this.editor.render.paper.canvas.removeAttribute('cursor');
    this.restoreHover = null;
    this.hovered = null;
  }
}
