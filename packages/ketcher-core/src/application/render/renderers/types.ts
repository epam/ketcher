import { IBaseRenderer } from './BaseRenderer';
import { Selection } from 'd3';

export interface IBaseMonomerRenderer extends IBaseRenderer {
  rootBBox: any;
  width: number;
  height: number;
  bodyWidth: number;
  bodyHeight: number;
  bodyBBox: any;
  center: { x: number; y: number };
  textColor: string;
  redrawAttachmentPoints(): void;
  appendAttachmentPoint(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
    position,
    rotation,
    isAttachmentPointPotentiallyUsed,
    isAttachmentPointUsed,
  ): Selection<SVGGElement, this, HTMLElement, never>;
  appendR1AttachmentPoint(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ): Selection<SVGGElement, this, HTMLElement, never>;
  appendR2AttachmentPoint(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ): Selection<SVGGElement, this, HTMLElement, never>;
  removeAttachmentPoints(): void;
  appendSelection(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ): any;
  removeSelection(
    rootElement: Selection<SVGGElement, this, HTMLElement, never>,
  ): void;
  drawSelection(): void;
  move(): void;
}
