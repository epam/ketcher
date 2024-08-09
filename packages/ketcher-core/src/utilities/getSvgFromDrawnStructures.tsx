import { KetcherLogger } from 'utilities';

const SVG_NAMESPACE_URI = 'http://www.w3.org/2000/svg';
const ADDITIONAL_TOP_MARGIN = 54;
const ADDITIONAL_LEFT_MARGIN = 50;
const DEFAULT_MARGIN = 10;

const removeHoverEffects = (wrapper: SVGSVGElement): void => {
  // Target elements related to hover effects
  const hoverElements = wrapper.querySelectorAll(
    '[stroke="#57FF8F"], [fill="#57FF8F"], [fill-opacity="0.7"], .selection-area, .snake-bond-selection',
  );

  hoverElements.forEach((el) => {
    if (
      (el.getAttribute('stroke') === '#57FF8F' ||
        el.getAttribute('stroke') === '#0097A8') &&
      el.classList.contains('selection-area')
    ) {
      el.remove();
    } else if (
      el.getAttribute('fill') === '#57FF8F' &&
      el.getAttribute('fill-opacity') === '0.7'
    ) {
      el.remove();
    } else if (el.classList.contains('snake-bond-selection')) {
      el.remove();
    }
  });
};

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
  removeHoverEffects(wrapper);
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
