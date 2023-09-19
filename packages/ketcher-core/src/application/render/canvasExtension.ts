import { Vec2 } from 'domain/entities';

const edgeOffset = 150;
const scrollMultiplier = 1;

export function isCloseToEdgeOfScreen(event) {
  const { clientX, clientY } = event;
  const body = document.body;
  const isCloseToLeftEdgeOfScreen = clientX <= edgeOffset;
  const isCloseToTopEdgeOfScreen = clientY <= edgeOffset;
  const isCloseToRightEdgeOfScreen = body.clientWidth - clientX <= edgeOffset;
  const isCloseToBottomEdgeOfScreen = body.clientHeight - clientY <= edgeOffset;
  const isCloseToSomeEdgeOfScreen =
    isCloseToLeftEdgeOfScreen ||
    isCloseToTopEdgeOfScreen ||
    isCloseToRightEdgeOfScreen ||
    isCloseToBottomEdgeOfScreen;
  return {
    isCloseToLeftEdgeOfScreen,
    isCloseToTopEdgeOfScreen,
    isCloseToRightEdgeOfScreen,
    isCloseToBottomEdgeOfScreen,
    isCloseToSomeEdgeOfScreen,
  };
}

export function isCloseToEdgeOfCanvas(clientArea) {
  const isCloseToLeftEdgeOfCanvas = clientArea.scrollLeft <= edgeOffset;
  const isCloseToTopEdgeOfCanvas = clientArea.scrollTop <= edgeOffset;
  const isCloseToRightEdgeOfCanvas =
    clientArea.scrollLeft + clientArea.clientWidth + edgeOffset >=
    clientArea.scrollWidth;
  const isCloseToBottomEdgeOfCanvas =
    clientArea.scrollTop + clientArea.clientHeight + edgeOffset >=
    clientArea.scrollHeight;
  return {
    isCloseToLeftEdgeOfCanvas,
    isCloseToTopEdgeOfCanvas,
    isCloseToRightEdgeOfCanvas,
    isCloseToBottomEdgeOfCanvas,
  };
}

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

export function shiftAndExtendCanvasByVector(vector: Vec2, render) {
  const clientArea = render.clientArea;
  const extensionVector = calculateCanvasExtension(
    clientArea,
    render.sz.scaled(render.options.zoom),
    vector,
  ).scaled(1 / render.options.zoom);

  if (extensionVector.x > 0 || extensionVector.y > 0) {
    render.setPaperSize(render.sz.add(extensionVector));
    render.setOffset(render.options.offset.add(vector));
    render.ctab.translate(vector);
    render.setViewBox(render.options.zoom);
  }

  scrollByVector(vector, render);
  render.update(false);
}

export function scrollByVector(vector: Vec2, render) {
  const clientArea = render.clientArea;
  clientArea.scrollLeft += (vector.x * render.options.scale) / scrollMultiplier;
  clientArea.scrollTop += (vector.y * render.options.scale) / scrollMultiplier;
}
