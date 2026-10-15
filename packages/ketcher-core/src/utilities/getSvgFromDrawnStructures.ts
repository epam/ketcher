import { KetcherLogger } from './KetcherLogger';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const DEFAULT_MARGIN = 10;

export const getSvgFromDrawnStructures = (
  canvas: SVGSVGElement,
  type: 'preview' | 'file',
  margin: number = DEFAULT_MARGIN,
) => {
  // Copy and clean up svg structures before previewing or saving
  let svgInnerHTML = canvas?.innerHTML || '';
  const wrapper = document.createElementNS(SVG_NAMESPACE_URI, 'svg');
  wrapper.innerHTML = svgInnerHTML;
  // remove #rectangle-selection-area
  wrapper.querySelector('#rectangle-selection-area')?.remove();
  // remove dynamic elements (scrolls, highlighters, attachment points...)
  wrapper.querySelectorAll('.dynamic-element')?.forEach((el) => el.remove());
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
  wrapper.querySelectorAll('[style]')?.forEach((el) => {
    const styledElement = el as SVGElement;

    if (styledElement.style.cursor === 'pointer') {
      styledElement.style.removeProperty('cursor');

      if (!styledElement.getAttribute('style')?.trim()) {
        styledElement.removeAttribute('style');
      }
    }
  });
  svgInnerHTML = wrapper.innerHTML;

  const drawStructureClientRect = canvas
    ?.getElementsByClassName('drawn-structures')[0]
    ?.getBoundingClientRect();

  if (!drawStructureClientRect || !svgInnerHTML) {
    const errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.error(errorMessage);
    return;
  }

  // Position the viewBox relative to the canvas element itself, so the export
  // stays centered regardless of where the canvas is placed on screen
  // (e.g. full-screen vs popup mode).
  const canvasClientRect = canvas.getBoundingClientRect();
  const viewBoxX = drawStructureClientRect.x - canvasClientRect.x - margin;
  const viewBoxY = drawStructureClientRect.y - canvasClientRect.y - margin;
  const viewBoxWidth = drawStructureClientRect.width + margin * 2;
  const viewBoxHeight = drawStructureClientRect.height + margin * 2;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  if (type === 'preview')
    return `<svg width='100%' height='100%' style='position: absolute' viewBox='${viewBox}'>${svgInnerHTML}</svg>`;
  else if (type === 'file')
    return `<svg width='${viewBoxWidth}' height='${viewBoxHeight}' viewBox='${viewBox}' xmlns='${SVG_NAMESPACE_URI}'>${svgInnerHTML}</svg>`;
  else return `<svg xmlns='${SVG_NAMESPACE_URI}' />`;
};
