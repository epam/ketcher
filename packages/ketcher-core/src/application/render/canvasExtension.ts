import { Vec2 } from 'domain/entities';

const edgeOffset = 200;
const scrollMultiplier = 1.2;
const moveDelta = 0;
let lastX = 0;
let lastY = 0;

export function getDirections(event) {
  const { layerX, layerY } = event;
  const isMovingRight = layerX - lastX > moveDelta;
  const isMovingLeft = lastX - layerX > moveDelta;
  const isMovingTop = lastY - layerY > moveDelta;
  const isMovingBottom = layerY - lastY > moveDelta;
  lastX = layerX;
  lastY = layerY;
  return { isMovingRight, isMovingLeft, isMovingTop, isMovingBottom };
}

export function isCloseToEdgeOfScreen(event) {
  const { clientX, clientY } = event;
  const body = document.body;
  const isCloseToLeftEdgeOfScreen = clientX <= edgeOffset;
  const isCloseToTopEdgeOfScreen = clientY <= edgeOffset;
  const isCloseToRightEdgeOfScreen = body.clientWidth - clientX <= edgeOffset;
  const isCloseToBottomEdgeOfScreen = body.clientHeight - clientY <= edgeOffset;
  return {
    isCloseToLeftEdgeOfScreen,
    isCloseToTopEdgeOfScreen,
    isCloseToRightEdgeOfScreen,
    isCloseToBottomEdgeOfScreen,
  };
}

export function isCloseToEdgeOfCanvas(event, canvasSize, zoom) {
  const { layerX, layerY } = event;
  const scaledCanvasSize = canvasSize.scaled(zoom);
  const isCloseToLeftEdgeOfCanvas = layerX <= edgeOffset;
  const isCloseToTopEdgeOfCanvas = layerY <= edgeOffset;
  const isCloseToRightEdgeOfCanvas = scaledCanvasSize.x - layerX <= edgeOffset;
  const isCloseToBottomEdgeOfCanvas = scaledCanvasSize.y - layerY <= edgeOffset;
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
    /**
     * When canvas extends previous (0, 0) coordinates may become (100, 100)
     */
    lastX += extensionVector.x;
    lastY += extensionVector.y;
  }
  requestAnimationFrame(() => {
    const clientArea = render.clientArea;
    if (vector.x < 0) {
      clientArea.scrollLeft = 0;
    }
    if (vector.x > 0) {
      clientArea.scrollLeft = clientArea.scrollWidth;
    }
    if (vector.y < 0) {
      clientArea.scrollTop = 0;
    }
    if (vector.y > 0) {
      clientArea.scrollTop = clientArea.scrollHeight;
    }
  });
  render.update(false);
}

export function scrollByVector(vector: Vec2, render) {
  requestAnimationFrame(() => {
    const clientArea = render.clientArea;
    clientArea.scrollLeft +=
      (vector.x * render.options.scale) / scrollMultiplier;
    clientArea.scrollTop +=
      (vector.y * render.options.scale) / scrollMultiplier;
  });
}
