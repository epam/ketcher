import {
  type Action,
  type Vec2,
  CoordinateTransformation,
  fromCipLabelMove,
} from 'ketcher-core';
import type { Editor } from '../../Editor';
import closest, { type CipLabelHit } from '../../shared/closest';

type CipLabelDrag = CipLabelHit & {
  start: Vec2;
  action: Action | null;
};

const HOVER_STROKE_WIDTH = 1.5;

export class CipLabelMoveTool {
  private drag: CipLabelDrag | null = null;
  private hovered: (CipLabelHit & { restore: () => void }) | null = null;

  constructor(private readonly editor: Editor) {}

  isDragging() {
    return this.drag !== null;
  }

  private find(event: PointerEvent) {
    const { render } = this.editor;
    const pos = CoordinateTransformation.pageToModel(event, render);
    return closest.cipLabel(render.ctab, pos, render.options);
  }

  mousedown(event: PointerEvent) {
    const hit = this.find(event);
    if (!hit) return false;

    this.clearHover();
    this.drag = {
      ...hit,
      start: CoordinateTransformation.pageToModel(event, this.editor.render),
      action: null,
    };
    return true;
  }

  mousemove(event: PointerEvent) {
    const { drag, editor } = this;
    if (!drag) return false;

    const { ctab } = editor.render;
    drag.action?.perform(ctab);
    drag.action = fromCipLabelMove(
      ctab,
      drag.owner,
      drag.id,
      CoordinateTransformation.pageToModel(event, editor.render).sub(
        drag.start,
      ),
    );
    editor.update(drag.action, true);
    return true;
  }

  mouseup() {
    return this.finishDrag();
  }

  mouseleave() {
    this.finishDrag();
    this.clearHover();
  }

  private finishDrag() {
    const { drag, editor } = this;
    if (!drag) return false;

    this.drag = null;
    if (drag.action) editor.update(drag.action);
    return true;
  }

  hover(event: PointerEvent) {
    const hit = this.find(event);
    if (hit?.owner === this.hovered?.owner && hit?.id === this.hovered?.id) {
      return Boolean(hit);
    }

    this.clearHover();
    if (!hit) return false;

    const { render } = this.editor;
    const reItem =
      hit.owner === 'atoms'
        ? render.ctab.atoms.get(hit.id)
        : render.ctab.bonds.get(hit.id);
    const rectangle = reItem?.cip?.rectangle;
    if (!rectangle) return false;

    const previous = {
      stroke: rectangle.attr('stroke'),
      'stroke-width': rectangle.attr('stroke-width'),
    };
    rectangle.attr({
      stroke: render.options.hoverStyle.stroke,
      'stroke-width': HOVER_STROKE_WIDTH,
    });
    render.paper.canvas.setAttribute('cursor', 'move');
    this.hovered = { ...hit, restore: () => rectangle.attr(previous) };
    return true;
  }

  clearHover() {
    if (!this.hovered) return;

    this.hovered.restore();
    this.editor.render.paper.canvas.removeAttribute('cursor');
    this.hovered = null;
  }
}
