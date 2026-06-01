import { KetcherLogger } from './KetcherLogger';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const ADDITIONAL_TOP_MARGIN = 54;
const ADDITIONAL_LEFT_MARGIN = 50;
const DEFAULT_MARGIN = 10;
const NON_EXPORT_LAYER_CLASSES = [
  'backgroundLayer',
  'selectionPlateLayer',
  'selectionPointsLayer',
  'hoveringLayer',
  'transient-views-layer',
  'transient-views-top-layer',
];
const NON_EXPORT_ELEMENT_CLASSES = ['dynamic-element', 'blinking'];

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

const hasAnyClass = (el: Element, classes: string[]) => {
  return classes.some((className) => el.classList.contains(className));
};

const isNonExportElement = (el: Element) => {
  if (!(el instanceof SVGElement)) {
    return false;
  }

  if (el.id === 'rectangle-selection-area') {
    return true;
  }

  if (hasAnyClass(el, NON_EXPORT_LAYER_CLASSES)) {
    return true;
  }

  if (hasAnyClass(el, NON_EXPORT_ELEMENT_CLASSES)) {
    return true;
  }

  if (
    NON_EXPORT_LAYER_CLASSES.some((className) => el.closest(`.${className}`))
  ) {
    return true;
  }

  if (
    NON_EXPORT_ELEMENT_CLASSES.some((className) => el.closest(`.${className}`))
  ) {
    return true;
  }

  return false;
};

const sanitizeInlineExportStyles = (markup: string) => {
  return markup
    .replace(/\bcursor:\s*pointer;\s*/g, '')
    .replace(/\bclip-path:\s*url\([^)]*\);?\s*/g, '')
    .replace(/\bmask:\s*url\([^)]*\);?\s*/g, '');
};

const getExportBoundingRect = (canvas: SVGSVGElement): ExportBounds | null => {
  const drawnStructures = canvas.querySelector('.drawn-structures');
  const drawnStructuresGroup =
    drawnStructures instanceof SVGGraphicsElement ? drawnStructures : null;

  const screenToSvgMatrix =
    typeof canvas.getScreenCTM === 'function'
      ? canvas.getScreenCTM()?.inverse()
      : null;
  const shouldSkipDrawnStructureDescendants =
    !!drawnStructuresGroup && !!screenToSvgMatrix;

  const candidates = Array.from(canvas.querySelectorAll('*')).filter((el) => {
    if (!(el instanceof SVGGraphicsElement)) return false;
    if (el.closest('defs')) return false;
    if (isNonExportElement(el)) return false;
    if (
      shouldSkipDrawnStructureDescendants &&
      drawnStructuresGroup.contains(el)
    ) {
      return false;
    }

    return true;
  });

  let minSvgX = Number.POSITIVE_INFINITY;
  let minSvgY = Number.POSITIVE_INFINITY;
  let maxSvgX = Number.NEGATIVE_INFINITY;
  let maxSvgY = Number.NEGATIVE_INFINITY;

  const updateBoundsFromGraphicElement = (el: SVGGraphicsElement) => {
    try {
      const bbox = el.getBBox();
      if (bbox.width || bbox.height) {
        const ctm = el.getCTM();
        if (ctm) {
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
        }
      }
    } catch {
      // Some elements can throw on getBBox in specific states; handled by fallback below.
    }

    // Some rendered labels (for example via foreignObject) may not be fully reflected by getBBox.
    // Include client rect mapped into SVG coordinates to keep preview bounds complete.
    if (screenToSvgMatrix) {
      const rect = el.getBoundingClientRect();
      if (rect.width || rect.height) {
        const corners = [
          new DOMPoint(rect.left, rect.top),
          new DOMPoint(rect.right, rect.top),
          new DOMPoint(rect.left, rect.bottom),
          new DOMPoint(rect.right, rect.bottom),
        ].map((point) => point.matrixTransform(screenToSvgMatrix));

        corners.forEach((point) => {
          minSvgX = Math.min(minSvgX, point.x);
          minSvgY = Math.min(minSvgY, point.y);
          maxSvgX = Math.max(maxSvgX, point.x);
          maxSvgY = Math.max(maxSvgY, point.y);
        });
      }
    }
  };

  if (drawnStructuresGroup && !isNonExportElement(drawnStructuresGroup)) {
    updateBoundsFromGraphicElement(drawnStructuresGroup);
  }

  candidates.forEach((el) => {
    updateBoundsFromGraphicElement(el);
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
  NON_EXPORT_LAYER_CLASSES.forEach((layerClass) => {
    wrapper.querySelectorAll(`.${layerClass}`).forEach((el) => el.remove());
  });
  NON_EXPORT_ELEMENT_CLASSES.forEach((excludedClass) => {
    wrapper.querySelectorAll(`.${excludedClass}`).forEach((el) => el.remove());
  });
  // Remove canvas viewport clipping so exported preview is not cropped.
  wrapper.querySelectorAll('clipPath, mask').forEach((el) => el.remove());
  wrapper.querySelectorAll('[clip-path], [mask]').forEach((el) => {
    el.removeAttribute('clip-path');
    el.removeAttribute('mask');
  });
  // Keep transient UI overlays out of export (selection/hover/scrollbars/handles).
  // Structural annotations should use dedicated classes instead of dynamic-element.
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
  // remove transient pointer/clip/mask inline styles from exported markup
  svgInnerHTML = sanitizeInlineExportStyles(svgInnerHTML);

  if (type === 'preview') {
    // Preview must show full labels even when source markup uses clipping/ellipsis UI styles.
    wrapper.style.overflow = 'visible';

    wrapper.querySelectorAll('foreignObject').forEach((el) => {
      const foreignObject = el as SVGForeignObjectElement;
      const baseWidth = Number.parseFloat(
        foreignObject.getAttribute('width') || '0',
      );
      const baseHeight = Number.parseFloat(
        foreignObject.getAttribute('height') || '0',
      );
      const baseX = Number.parseFloat(foreignObject.getAttribute('x') || '0');
      const baseY = Number.parseFloat(foreignObject.getAttribute('y') || '0');

      if (Number.isFinite(baseWidth) && baseWidth > 0) {
        const expansion = Math.max(220, baseWidth * 2);
        foreignObject.setAttribute('x', `${baseX - expansion / 2}`);
        foreignObject.setAttribute('width', `${baseWidth + expansion}`);
      } else {
        foreignObject.setAttribute('x', `${baseX - 120}`);
        foreignObject.setAttribute('width', '360');
      }

      if (Number.isFinite(baseHeight) && baseHeight > 0) {
        const expansion = Math.max(40, baseHeight);
        foreignObject.setAttribute('y', `${baseY - expansion / 2}`);
        foreignObject.setAttribute('height', `${baseHeight + expansion}`);
      } else {
        foreignObject.setAttribute('y', `${baseY - 20}`);
        foreignObject.setAttribute('height', '80');
      }

      foreignObject.style.overflow = 'visible';
    });

    wrapper.querySelectorAll('foreignObject *').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.overflow = 'visible';
      htmlEl.style.textOverflow = 'clip';
      htmlEl.style.whiteSpace = 'normal';
      htmlEl.style.maxWidth = 'none';
      htmlEl.style.width = 'max-content';
      htmlEl.style.minWidth = 'max-content';
    });

    svgInnerHTML = wrapper.innerHTML;
    svgInnerHTML = svgInnerHTML?.replace(/\boverflow\s*:\s*hidden\s*;?/g, '');
    svgInnerHTML = svgInnerHTML?.replace(
      /\btext-overflow\s*:\s*ellipsis\s*;?/g,
      'text-overflow: clip;',
    );
    svgInnerHTML = svgInnerHTML?.replace(
      /\bwhite-space\s*:\s*nowrap\s*;?/g,
      'white-space: normal;',
    );

    // Continue with measured bounds below so preview and file use the same framing logic.
  }

  svgInnerHTML = sanitizeInlineExportStyles(svgInnerHTML);

  wrapper.setAttribute('xmlns', SVG_NAMESPACE_URI);
  wrapper.setAttribute('width', `${canvas.clientWidth || 1}`);
  wrapper.setAttribute('height', `${canvas.clientHeight || 1}`);
  wrapper.style.position = 'absolute';
  wrapper.style.visibility = 'hidden';
  wrapper.style.pointerEvents = 'none';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '-10000px';

  let drawStructureClientRect: ExportBounds | null = null;
  try {
    document.body.appendChild(wrapper);
    drawStructureClientRect = getExportBoundingRect(wrapper);
  } finally {
    wrapper.remove();
  }

  if (!drawStructureClientRect || !svgInnerHTML) {
    const errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.error(errorMessage);
    return;
  }

  const previewHorizontalMargin =
    type === 'preview'
      ? Math.max(marginValues.horizontal, DEFAULT_MARGIN * 2)
      : marginValues.horizontal;
  const previewVerticalMargin =
    type === 'preview'
      ? Math.max(marginValues.vertical, DEFAULT_MARGIN * 2)
      : marginValues.vertical;

  const viewBoxX =
    drawStructureClientRect.x -
    (drawStructureClientRect.isClientRect ? ADDITIONAL_LEFT_MARGIN : 0) -
    previewHorizontalMargin;
  const viewBoxY =
    drawStructureClientRect.y -
    (drawStructureClientRect.isClientRect ? ADDITIONAL_TOP_MARGIN : 0) -
    previewVerticalMargin;
  const viewBoxWidth =
    drawStructureClientRect.width + previewHorizontalMargin * 2;
  const viewBoxHeight =
    drawStructureClientRect.height + previewVerticalMargin * 2;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  if (type === 'preview')
    return `<svg width='${viewBoxWidth}' height='${viewBoxHeight}' preserveAspectRatio='xMidYMid meet' viewBox='${viewBox}' xmlns='${SVG_NAMESPACE_URI}'>${svgInnerHTML}</svg>`;
  else if (type === 'file')
    return `<svg width='${viewBoxWidth}' height='${viewBoxHeight}' viewBox='${viewBox}' xmlns='${SVG_NAMESPACE_URI}'>${svgInnerHTML}</svg>`;
  else return `<svg xmlns='${SVG_NAMESPACE_URI}' />`;
};
