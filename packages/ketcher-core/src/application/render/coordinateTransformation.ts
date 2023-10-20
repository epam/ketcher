import { Vec2 } from 'domain/entities';
import { Render } from './raphaelRender';
import { Scale } from 'domain/helpers';

const canvasToView = (point: Vec2, render: Render) => {
  const offset = new Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.sub(offset).scaled(render.options.zoom);
};

const modelToView = (vector: Vec2, render: Render) => {
  const pointInCanvas = Scale.protoToCanvas(vector, render.options);
  return canvasToView(pointInCanvas, render);
};

const viewToCanvas = (point: Vec2, render: Render) => {
  const offset = new Vec2(render.viewBox.minX, render.viewBox.minY);
  return point.scaled(1 / render.options.zoom).add(offset);
};

const pageToView = (
  event: MouseEvent | { clientX: number; clientY: number },
  renderClientArea: HTMLElement,
) => {
  const { top: offsetTop, left: offsetLeft } =
    renderClientArea.getBoundingClientRect();
  return new Vec2(event.clientX - offsetLeft, event.clientY - offsetTop);
};

const pageToCanvas = (
  event: MouseEvent | { clientX: number; clientY: number },
  render: Render,
) => {
  const pointInViewBox = pageToView(event, render.clientArea);
  return viewToCanvas(pointInViewBox, render);
};

const pageToModel = (
  event: MouseEvent | { clientX: number; clientY: number },
  render: Render,
) => {
  const pointInCanvas = pageToCanvas(event, render);
  return Scale.canvasToProto(pointInCanvas, render.options);
};

/**
 * @see ./__docs__/Coordinate-Origins.png
 * `model` - The original coordinates of entities.
 * `canvas` - The scaled `model`. The real coordinates Raphael uses to draw entities.
 * `page` - The part of the document you're viewing which is currently visible in the window.
 * `view` - The part of the canvas you're viewing which is currently visible in the window.
 * */
export const CoordinateTransformation = {
  modelToView,
  canvasToView,
  viewToCanvas,
  pageToCanvas,
  pageToModel,
};
