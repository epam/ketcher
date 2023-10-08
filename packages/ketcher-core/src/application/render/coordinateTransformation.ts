import { Vec2 } from 'domain/entities';
import { Render } from './raphaelRender';
import { ViewBox } from './render.types';
import { Scale } from 'domain/helpers';

const canvasToViewBox = (point: Vec2, renderViewBox: ViewBox) => {
  const offset = new Vec2(renderViewBox.minX, renderViewBox.minY);
  return point.sub(offset);
};

const protoToViewBox = (vector: Vec2, render: Render) => {
  const pointInCanvas = Scale.protoToCanvas(vector, render.options);
  return canvasToViewBox(pointInCanvas, render.viewBox);
};

/**
 * @see ./__docs__/viewBoxToCanvas.png
 */
const viewBoxToCanvas = (point: Vec2, renderViewBox: ViewBox) => {
  const offset = new Vec2(renderViewBox.minX, renderViewBox.minY);
  return point.add(offset);
};

const viewBoxToProto = (point: Vec2, render: Render) => {
  const pointInCanvas = viewBoxToCanvas(point, render.viewBox);
  return Scale.canvasToProto(pointInCanvas, render.options);
};

const pageEventToViewBox = (
  event: MouseEvent | { clientX: number; clientY: number },
  renderClientArea: HTMLElement,
) => {
  const { top: offsetTop, left: offsetLeft } =
    renderClientArea.getBoundingClientRect();
  return new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop);
};

const pageEventToProto = (
  event: MouseEvent | { clientX: number; clientY: number },
  render: Render,
) => {
  const pointInViewBox = pageEventToViewBox(event, render.clientArea);
  const pointInCanvas = viewBoxToCanvas(pointInViewBox, render.viewBox);
  return Scale.canvasToProto(pointInCanvas, render.options);
};

export const CoordinateTransformation = {
  protoToViewBox,
  canvasToViewBox,
  viewBoxToCanvas,
  viewBoxToProto,
  pageEventToProto,
};
