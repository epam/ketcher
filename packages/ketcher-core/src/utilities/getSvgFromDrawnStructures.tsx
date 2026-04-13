import { KetcherLogger } from 'utilities';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const DEFAULT_MARGIN = 10;
const EXPORT_EXCLUDED_SELECTOR = '#rectangle-selection-area, .dynamic-element';

type Margins = {
  horizontal: number;
  vertical: number;
};

const getElementBoundingBox = (
  element: Element,
  canvas: SVGSVGElement,
): DOMRect | null => {
  if (
    !(element instanceof SVGGraphicsElement) ||
    element instanceof SVGSVGElement
  ) {
    return null;
  }

  if (
    element.matches('defs, style, script, title, desc') ||
    element.closest('defs') ||
    element.matches(EXPORT_EXCLUDED_SELECTOR) ||
    element.closest(EXPORT_EXCLUDED_SELECTOR)
  ) {
    return null;
  }

  const computedStyle = window.getComputedStyle(element);

  if (
    computedStyle.display === 'none' ||
    computedStyle.visibility === 'hidden' ||
    computedStyle.opacity === '0' ||
    (computedStyle.fillOpacity === '0' && computedStyle.strokeOpacity === '0')
  ) {
    return null;
  }

  const box = element.getBBox();
  const matrix = element.getCTM();

  if ((!box.width && !box.height) || !matrix) {
    return null;
  }

  const createPoint = (x: number, y: number) => {
    const point = canvas.createSVGPoint();
    point.x = x;
    point.y = y;
    return point.matrixTransform(matrix);
  };

  const points = [
    createPoint(box.x, box.y),
    createPoint(box.x + box.width, box.y),
    createPoint(box.x, box.y + box.height),
    createPoint(box.x + box.width, box.y + box.height),
  ];

  const left = Math.min(...points.map((point) => point.x));
  const top = Math.min(...points.map((point) => point.y));
  const right = Math.max(...points.map((point) => point.x));
  const bottom = Math.max(...points.map((point) => point.y));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    left,
    top,
    right,
    bottom,
    toJSON: () => ({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      left,
      top,
      right,
      bottom,
    }),
  } as DOMRect;
};

const getDrawnStructuresBoundingClientRect = (canvas: SVGSVGElement) => {
  const exportableElements = Array.from(canvas.querySelectorAll('*'))
    .map((element) => getElementBoundingBox(element, canvas))
    .filter((rect): rect is DOMRect => !!rect);

  if (!exportableElements.length) {
    return canvas
      ?.getElementsByClassName('drawn-structures')[0]
      ?.getBoundingClientRect();
  }

  const left = Math.min(...exportableElements.map((rect) => rect.left));
  const top = Math.min(...exportableElements.map((rect) => rect.top));
  const right = Math.max(...exportableElements.map((rect) => rect.right));
  const bottom = Math.max(...exportableElements.map((rect) => rect.bottom));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    left,
    top,
    right,
    bottom,
    toJSON: () => ({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      left,
      top,
      right,
      bottom,
    }),
  } as DOMRect;
};

export const getSvgFromDrawnStructures = (
  canvas: SVGSVGElement,
  type: 'preview' | 'file',
  margins: Margins | number = {
    horizontal: DEFAULT_MARGIN,
    vertical: DEFAULT_MARGIN,
  },
) => {
  // Convert number to Margins object to support backward compatibility
  const marginValues: Margins =
    typeof margins === 'number'
      ? { horizontal: margins, vertical: margins }
      : {
          horizontal: DEFAULT_MARGIN + margins.horizontal,
          vertical: DEFAULT_MARGIN + margins.vertical,
        };

  // Copy and clean up svg structures before previewing or saving
  const exportCanvas = canvas?.cloneNode(true) as SVGSVGElement | undefined;

  if (!exportCanvas) {
    const errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.error(errorMessage);
    return;
  }

  // remove #rectangle-selection-area
  exportCanvas.querySelector('#rectangle-selection-area')?.remove();
  // remove dynamic elements (scrolls, highlighters, attachment points...)
  exportCanvas
    .querySelectorAll('.dynamic-element')
    ?.forEach((el) => el.remove());
  // set default cursor, mostly for sequence mode
  exportCanvas
    .querySelectorAll('text')
    ?.forEach((el) => el.setAttribute('cursor', 'default'));
  exportCanvas.querySelectorAll('rect')?.forEach((el) => {
    if (el.getAttribute('cursor') === 'text') el.removeAttribute('cursor');
  });
  // remove opacity of structures, mostly for sequence "edit in RNA builder" mode
  exportCanvas.querySelectorAll('g')?.forEach((el) => {
    if (el.hasAttribute('opacity')) el.removeAttribute('opacity');
  });

  const drawStructureClientRect = getDrawnStructuresBoundingClientRect(canvas);
  if (!drawStructureClientRect || !exportCanvas.childNodes.length) {
    const errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.error(errorMessage);
    return;
  }

  const viewBoxX = drawStructureClientRect.x - marginValues.horizontal;
  const viewBoxY = drawStructureClientRect.y - marginValues.vertical;
  const viewBoxWidth =
    drawStructureClientRect.width + marginValues.horizontal * 2;
  const viewBoxHeight =
    drawStructureClientRect.height + marginValues.vertical * 2;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  exportCanvas.setAttribute('viewBox', viewBox);
  exportCanvas.setAttribute('xmlns', SVG_NAMESPACE_URI);
  exportCanvas.removeAttribute('x');
  exportCanvas.removeAttribute('y');
  exportCanvas.removeAttribute('preserveAspectRatio');

  if (type === 'preview') {
    exportCanvas.setAttribute('width', '100%');
    exportCanvas.setAttribute('height', '100%');
    exportCanvas.setAttribute('style', 'position: absolute');
  } else if (type === 'file') {
    exportCanvas.setAttribute('width', String(viewBoxWidth));
    exportCanvas.setAttribute('height', String(viewBoxHeight));
    exportCanvas.removeAttribute('style');
  } else {
    return `<svg xmlns='${SVG_NAMESPACE_URI}' />`;
  }

  const serializedSvg = new XMLSerializer().serializeToString(exportCanvas);
  const normalizedSvg = serializedSvg.replaceAll('cursor: pointer;', '');

  return normalizedSvg;
};
