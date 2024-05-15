import { KetcherLogger } from 'utilities';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const ADDITIONAL_TOP_MARGIN = 54;
const ADDITIONAL_LEFT_MARGIN = 50;
const DEFAULT_MARGIN = 10;

export const getSvgFromDrawnStructures = (
  canvas: SVGSVGElement,
  type: 'preview' | 'file',
  margin = DEFAULT_MARGIN,
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
  svgInnerHTML = wrapper.innerHTML;
  // remove "cursor: pointer" style
  svgInnerHTML = svgInnerHTML?.replaceAll('cursor: pointer;', '');

  const drawStructureClientRect = canvas
    ?.getElementsByClassName('drawn-structures')[0]
    .getBoundingClientRect();

  if (!drawStructureClientRect || !svgInnerHTML) {
    const errorMessage = 'Cannot get drawn structures!';
    KetcherLogger.error(errorMessage);
    return;
  }

  const viewBoxX = drawStructureClientRect.x - ADDITIONAL_LEFT_MARGIN - margin;
  const viewBoxY = drawStructureClientRect.y - ADDITIONAL_TOP_MARGIN - margin;
  const viewBoxWidth = drawStructureClientRect.width + margin * 2;
  const viewBoxHeight = drawStructureClientRect.height + margin * 2;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  if (type === 'preview')
    return `<svg width='100%' height='100%' style='position: absolute' viewBox='${viewBox}'>${svgInnerHTML}</svg>`;
  else if (type === 'file')
    return `<svg width='${viewBoxWidth}' height='${viewBoxHeight}' viewBox='${viewBox}' xmlns='${SVG_NAMESPACE_URI}'>${svgInnerHTML}</svg>`;
  else return `<svg xmlns='${SVG_NAMESPACE_URI}' />`;
};
