import { Vec2 } from 'domain/entities';
import { Render } from './raphaelRender';
import { Scale } from 'domain/helpers';

const canvasToViewBox = (point: Vec2, render: Render) => {
  const offset = new Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.sub(offset).scaled(render.options.zoom);
};

const protoToViewBox = (vector: Vec2, render: Render) => {
  const pointInCanvas = Scale.protoToCanvas(vector, render.options);
  return canvasToViewBox(pointInCanvas, render);
};

/**
 * @see ./__docs__/viewBoxToCanvas.png
 */
const viewBoxToCanvas = (point: Vec2, render: Render) => {
  const offset = new Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.scaled(1 / render.options.zoom).add(offset);
};

const viewBoxToProto = (point: Vec2, render: Render) => {
  const pointInCanvas = viewBoxToCanvas(point, render);
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

const pageEventToCanvas = (
  event: MouseEvent | { clientX: number; clientY: number },
  render: Render,
) => {
  const pointInViewBox = pageEventToViewBox(event, render.clientArea);
  return viewBoxToCanvas(pointInViewBox, render);
};

const pageEventToProto = (
  event: MouseEvent | { clientX: number; clientY: number },
  render: Render,
) => {
  const pointInCanvas = pageEventToCanvas(event, render);
  return Scale.canvasToProto(pointInCanvas, render.options);
};

export const CoordinateTransformation = {
  protoToViewBox,
  canvasToViewBox,
  viewBoxToCanvas,
  viewBoxToProto,
  pageEventToCanvas,
  pageEventToProto,
};
