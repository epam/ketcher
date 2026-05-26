import { KetcherLogger } from './KetcherLogger';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const ADDITIONAL_TOP_MARGIN = 54;
const ADDITIONAL_LEFT_MARGIN = 50;
const DEFAULT_MARGIN = 10;

type Margins = {
  horizontal: number;
  vertical: number;
};

type ExportBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
  isClientRect: boolean;
};

const getExportBoundingRect = (canvas: SVGSVGElement): ExportBounds | null => {
  const candidates = Array.from(canvas.querySelectorAll('*')).filter((el) => {
    if (!(el instanceof SVGGraphicsElement)) return false;
    if (el.closest('defs')) return false;
    if (el.id === 'rectangle-selection-area') return false;

    return true;
  });

  let minSvgX = Number.POSITIVE_INFINITY;
  let minSvgY = Number.POSITIVE_INFINITY;
  let maxSvgX = Number.NEGATIVE_INFINITY;
  let maxSvgY = Number.NEGATIVE_INFINITY;

  candidates.forEach((el) => {
    if (!(el instanceof SVGGraphicsElement)) return;

    try {
      const bbox = el.getBBox();
      if (!bbox.width && !bbox.height) return;

      const ctm = el.getCTM();
      if (!ctm) return;

      const corners = [
        new DOMPoint(bbox.x, bbox.y),
        new DOMPoint(bbox.x + bbox.width, bbox.y),
        new DOMPoint(bbox.x, bbox.y + bbox.height),
        new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height),
      ].map((point) => point.matrixTransform(ctm));

      corners.forEach((point) => {
        minSvgX = Math.min(minSvgX, point.x);
        minSvgY = Math.min(minSvgY, point.y);
        maxSvgX = Math.max(maxSvgX, point.x);
        maxSvgY = Math.max(maxSvgY, point.y);
      });
    } catch {
      // Some elements can throw on getBBox in specific states; handled by fallback below.
    }
  });

  if (Number.isFinite(minSvgX) && Number.isFinite(minSvgY)) {
    return {
      x: minSvgX,
      y: minSvgY,
      width: maxSvgX - minSvgX,
      height: maxSvgY - minSvgY,
      isClientRect: false,
    };
  }

  // Fallback for environments where getBBox/getCTM are not available.
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  candidates.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    minX = Math.min(minX, rect.x);
    minY = Math.min(minY, rect.y);
    maxX = Math.max(maxX, rect.x + rect.width);
    maxY = Math.max(maxY, rect.y + rect.height);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    isClientRect: true,
  };
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
  let svgInnerHTML = canvas?.innerHTML || '';
  const wrapper = document.createElementNS(SVG_NAMESPACE_URI, 'svg');
  wrapper.innerHTML = svgInnerHTML;
  // remove #rectangle-selection-area
  wrapper.querySelector('#rectangle-selection-area')?.remove();
  // keep all rendered elements in export to avoid losing structural annotations
  // set default cursor, mostly for sequence mode
  wrapper
    .querySelectorAll('text')
    ?.forEach((el) => el.setAttribute('cursor', 'default'));
  wrapper.querySelectorAll('rect')?.forEach((el) => {
    if (el.getAttribute('cursor') === 'text') el.removeAttribute('cursor');
  });
  // remove opacity of structures, mostly for sequence "edit in RNA builder" mode
  wrapper.querySelectorAll('g')?.forEach((el) => {
    if (el.hasAttribute('opacity')) el.removeAttribute('opacity');
  });
  svgInnerHTML = wrapper.innerHTML;
  // remove "cursor: pointer" style only from elements where it appears standalone,
  // preserving other style properties on bond path elements (stroke, fill, stroke-width, etc.)
  svgInnerHTML = svgInnerHTML?.replace(/\bcursor:\s*pointer;\s*/g, '');

  const drawStructureClientRect = getExportBoundingRect(canvas);

  if (!drawStructureClientRect || !svgInnerHTML) {
    const errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.error(errorMessage);
    return;
  }

  const viewBoxX =
    drawStructureClientRect.x -
    (drawStructureClientRect.isClientRect ? ADDITIONAL_LEFT_MARGIN : 0) -
    marginValues.horizontal;
  const viewBoxY =
    drawStructureClientRect.y -
    (drawStructureClientRect.isClientRect ? ADDITIONAL_TOP_MARGIN : 0) -
    marginValues.vertical;
  const viewBoxWidth =
    drawStructureClientRect.width + marginValues.horizontal * 2;
  const viewBoxHeight =
    drawStructureClientRect.height + marginValues.vertical * 2;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  if (type === 'preview')
    return `<svg width='100%' height='100%' style='position: absolute' viewBox='${viewBox}'>${svgInnerHTML}</svg>`;
  else if (type === 'file')
    return `<svg width='${viewBoxWidth}' height='${viewBoxHeight}' viewBox='${viewBox}' xmlns='${SVG_NAMESPACE_URI}'>${svgInnerHTML}</svg>`;
  else return `<svg xmlns='${SVG_NAMESPACE_URI}' />`;
};
