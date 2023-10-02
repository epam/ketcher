import { Selection } from 'd3';

export type D3SvgElementSelection<
  ElementType extends SVGElement,
  T,
> = Selection<ElementType, T, HTMLElement, never>;
