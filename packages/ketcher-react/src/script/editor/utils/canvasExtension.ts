import { Editor, Vec2 } from 'ketcher-core';
import { getSelectedAreaCoordinates } from './getSelectedAreaCoordinates';

const edgeOffset = 150;
const scrollMultiplier = 1.2;
let lastX = 0;
let lastY = 0;

export function getDirections(event) {
  const layerX = event.offsetX;
  const layerY = event.offsetY;
  const isMovingRight = layerX > lastX;
  const isMovingLeft = layerX < lastX;
  const isMovingTop = layerY < lastY;
  const isMovingBottom = layerY > lastY;
  lastX = layerX;
  lastY = layerY;
  return { isMovingRight, isMovingLeft, isMovingTop, isMovingBottom };
}

export function isSelectionCloseToTheEdgeOfCanvas(editor: Editor) {
  const canvasSize = editor.render.sz;
  const selectedAreaCoordinates = getSelectedAreaCoordinates(editor);
  if (!selectedAreaCoordinates) {
    return false;
  }
  const { leftX, topY, rightX, bottomY } = selectedAreaCoordinates;
  const isCloseToTopEdgeOfCanvas = topY <= edgeOffset;
  const isCloseToBottomEdgeOfCanvas = canvasSize.y - bottomY <= edgeOffset;
  const isCloseToLeftEdgeOfCanvas = leftX <= edgeOffset;
  const isCloseToRightEdgeOfCanvas = canvasSize.x - rightX <= edgeOffset;
  return {
    isCloseToLeftEdgeOfCanvas,
    isCloseToTopEdgeOfCanvas,
    isCloseToRightEdgeOfCanvas,
    isCloseToBottomEdgeOfCanvas,
  };
}

export function isSelectionCloseToTheEdgeOfScreen(editor: Editor) {
  const clientArea = editor.render.clientArea;
  const clientAreaBoundingRect = clientArea.getBoundingClientRect();
  const canvas = editor.render.paper.canvas;
  const canvasBoundingRect = canvas.getBoundingClientRect();
  const selectedAreaCoordinates = getSelectedAreaCoordinates(editor);
  if (!selectedAreaCoordinates) {
    return false;
  }
  const { leftX, topY, rightX, bottomY } = selectedAreaCoordinates;
  const canvasXOffset = canvasBoundingRect.x - clientAreaBoundingRect.x;
  const canvasYOffset = canvasBoundingRect.y - clientAreaBoundingRect.y;
  const isCloseToTopEdgeOfScreen = topY + canvasYOffset <= edgeOffset;
  const isCloseToBottomEdgeOfScreen =
    clientArea.clientHeight - (bottomY + canvasYOffset) <= edgeOffset;
  const isCloseToLeftEdgeOfScreen = leftX + canvasXOffset <= edgeOffset;
  const isCloseToRightEdgeOfScreen =
    clientArea.clientWidth - (rightX + canvasXOffset) <= edgeOffset;
  return {
    isCloseToLeftEdgeOfScreen,
    isCloseToTopEdgeOfScreen,
    isCloseToRightEdgeOfScreen,
    isCloseToBottomEdgeOfScreen,
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

export function shiftByVector(vector: Vec2, editor: Editor) {
  const render = editor.render;
  const clientArea = render.clientArea;
  const extensionVector = calculateCanvasExtension(
    clientArea,
    render.sz.scaled(render.options.zoom),
    vector,
  ).scaled(1 / render.options.zoom);

  if (extensionVector.x > 0 || extensionVector.y > 0) {
    // When canvas extends previous (0, 0) coordinates may become (100, 100)
    lastX += extensionVector.x;
    lastY += extensionVector.y;
  }
  render.update(false);
  scrollToEdgeOfScreen(vector, render);
}

export function scrollByVector(vector: Vec2, render) {
  requestAnimationFrame(() => {
    const clientArea = render.clientArea;
    clientArea.scrollLeft += vector.x * scrollMultiplier;
    clientArea.scrollTop += vector.y * scrollMultiplier;
  });
}

export function scrollToEdgeOfScreen(vector: Vec2, render) {
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
}

export function scrollByDirection(editor: Editor, direction) {
  const clientArea = editor.render.clientArea;
  const selectedAreaCoordinates = getSelectedAreaCoordinates(editor);
  if (!selectedAreaCoordinates) {
    return;
  }
  const { leftX, topY } = selectedAreaCoordinates;
  if (direction === 'MoveUp') {
    clientArea.scrollTop = topY - 10;
  } else if (direction === 'MoveLeft') {
    clientArea.scrollLeft = leftX - 10;
  } else if (direction === 'MoveRight') {
    clientArea.scrollLeft += scrollMultiplier;
  } else if (direction === 'MoveDown') {
    clientArea.scrollTop += scrollMultiplier;
  }
}

export function setScrollOnSelection(editor: Editor, direction) {
  const clientArea = editor.render.clientArea;
  const selectedAreaCoordinates = getSelectedAreaCoordinates(editor);
  if (!selectedAreaCoordinates) {
    return;
  }
  const { leftX, topY } = selectedAreaCoordinates;
  if (direction === 'MoveUp') {
    clientArea.scrollTop = topY - 10;
  } else if (direction === 'MoveLeft') {
    clientArea.scrollLeft = leftX - 10;
  } else if (direction === 'MoveRight') {
    clientArea.scrollLeft = leftX - clientArea.clientWidth / 2;
  } else if (direction === 'MoveDown') {
    clientArea.scrollTop = topY - clientArea.clientHeight / 2;
  }
}

export function isCloseToTheEdges(editor: Editor, direction: string) {
  const result = {
    isCloseToEdgeOfCanvasAndMovingToEdge: false,
    isCloseToEdgeOfScreenAndMovingToEdge: false,
  };
  const selectedItems = editor.explicitSelected();
  if (!selectedItems.atoms) {
    return result;
  }

  const isCloseToEdgeOfCanvas = isSelectionCloseToTheEdgeOfCanvas(editor);
  if (isCloseToEdgeOfCanvas) {
    const {
      isCloseToLeftEdgeOfCanvas,
      isCloseToTopEdgeOfCanvas,
      isCloseToRightEdgeOfCanvas,
      isCloseToBottomEdgeOfCanvas,
    } = isCloseToEdgeOfCanvas;
    result.isCloseToEdgeOfCanvasAndMovingToEdge =
      (isCloseToTopEdgeOfCanvas && direction === 'MoveUp') ||
      (isCloseToBottomEdgeOfCanvas && direction === 'MoveDown') ||
      (isCloseToLeftEdgeOfCanvas && direction === 'MoveLeft') ||
      (isCloseToRightEdgeOfCanvas && direction === 'MoveRight');
  }
  const isCloseToEdgeOfScreen = isSelectionCloseToTheEdgeOfScreen(editor);
  if (isCloseToEdgeOfScreen) {
    const {
      isCloseToLeftEdgeOfScreen,
      isCloseToTopEdgeOfScreen,
      isCloseToRightEdgeOfScreen,
      isCloseToBottomEdgeOfScreen,
    } = isCloseToEdgeOfScreen;
    result.isCloseToEdgeOfScreenAndMovingToEdge =
      (isCloseToTopEdgeOfScreen && direction === 'MoveUp') ||
      (isCloseToBottomEdgeOfScreen && direction === 'MoveDown') ||
      (isCloseToLeftEdgeOfScreen && direction === 'MoveLeft') ||
      (isCloseToRightEdgeOfScreen && direction === 'MoveRight');
  }
  return result;
}
