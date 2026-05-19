import { Selection } from 'd3';

export type D3SvgElementSelection<
  ElementType extends SVGElement,
  Datum,
> = Selection<ElementType, Datum, HTMLElement, never>;
