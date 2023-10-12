import { Vec2 } from 'domain/entities';

export function calculateCanvasExtension(
  clientArea,
  currentCanvasSize,
  extensionVector,
) {
  const newHorizontalScrollPosition = clientArea.scrollLeft + extensionVector.x;
  const newVerticalScrollPosition = clientArea.scrollTop + extensionVector.y;

  let horizontalExtension = 0;
  let verticalExtension = 0;

  if (newHorizontalScrollPosition > currentCanvasSize.x) {
    horizontalExtension = newHorizontalScrollPosition - currentCanvasSize.x;
  }

  if (newHorizontalScrollPosition < 0) {
    horizontalExtension = Math.abs(newHorizontalScrollPosition);
  }

  if (newVerticalScrollPosition > currentCanvasSize.y) {
    verticalExtension = newVerticalScrollPosition - currentCanvasSize.y;
  }

  if (newVerticalScrollPosition < 0) {
    verticalExtension = Math.abs(newVerticalScrollPosition);
  }

  return new Vec2(horizontalExtension, verticalExtension, 0);
}

// @yuleicul todo: clear
export function scrollCanvasByVector(vector: Vec2, render) {
  const clientArea = render.clientArea;

  clientArea.scrollLeft += vector.x * render.options.scale;
  clientArea.scrollTop += vector.y * render.options.scale;
}
