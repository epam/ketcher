import { D3SvgElementSelection } from 'application/render/types';
import ZoomTool from '../../editor/tools/Zoom';
import { select } from 'd3';
import { drawnStructuresSelector } from 'application/editor/constants';

export abstract class TransientView {
  protected rootElement?: D3SvgElementSelection<SVGGElement, void>;

  protected canvas: D3SvgElementSelection<SVGSVGElement, void>;

  constructor() {
    this.canvas = ZoomTool.instance?.canvas || select(drawnStructuresSelector);
  }

  public abstract show(): void;
  public remove() {
    this.rootElement?.remove();
    this.rootElement = undefined;
  }
}
